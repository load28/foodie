import React, { useState, useCallback, useRef } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Search, Bell } from 'lucide-react';
import FeedCard from '../../components/FeedCard/FeedCard';
import CommentSheet, { Comment } from '../../components/CommentSheet/CommentSheet';
import { GET_FEED_POSTS } from '../../lib/graphql/queries';
import { TOGGLE_POST_LIKE } from '../../lib/graphql/mutations';
import './FeedPage.scss';

const POSTS_PER_PAGE = 10;

const FeedPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [likedPosts, setLikedPosts] = useState(new Set<string>());
  const [activeCommentSheet, setActiveCommentSheet] = useState<string | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  const filters = [
    { label: '전체', value: null },
    { label: '한식', value: 'KOREAN' },
    { label: '양식', value: 'WESTERN' },
    { label: '중식', value: 'CHINESE' },
    { label: '일식', value: 'JAPANESE' },
    { label: '카페', value: 'CAFE' },
    { label: '디저트', value: 'DESSERT' },
  ];

  // 피드 데이터 조회
  const { data, loading, error, fetchMore } = useQuery(GET_FEED_POSTS, {
    variables: {
      limit: POSTS_PER_PAGE,
      offset: 0,
      category: activeFilter,
    },
    fetchPolicy: 'cache-and-network',
  });

  // 좋아요 토글 뮤테이션
  const [togglePostLikeMutation] = useMutation(TOGGLE_POST_LIKE, {
    onError: (err) => {
      console.error('Toggle like error:', err);
    },
  });

  // 더 많은 데이터 로드
  const loadMoreFeed = useCallback(async () => {
    if (loading || !data?.feedPosts?.posts) return;

    const currentLength = data.feedPosts.posts.length;
    const total = data.feedPosts.total;

    if (currentLength >= total) return;

    try {
      await fetchMore({
        variables: {
          offset: currentLength,
        },
      });
    } catch (err) {
      console.error('Failed to load more posts:', err);
    }
  }, [data, loading, fetchMore]);

  const lastFeedElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            loadMoreFeed();
          }
        },
        {
          rootMargin: '200px',
        }
      );

      if (node) observer.current.observe(node);
    },
    [loading, loadMoreFeed]
  );

  // 좋아요 토글
  const toggleLike = async (postId: string) => {
    const newLikedPosts = new Set(likedPosts);
    if (newLikedPosts.has(postId)) {
      newLikedPosts.delete(postId);
    } else {
      newLikedPosts.add(postId);
    }
    setLikedPosts(newLikedPosts);

    try {
      await togglePostLikeMutation({
        variables: { postId },
      });
    } catch (err) {
      // 에러 발생 시 원래 상태로 복원
      setLikedPosts(likedPosts);
    }
  };

  // 댓글 시트 열기
  const openCommentSheet = (postId: string) => {
    setActiveCommentSheet(postId);
  };

  // 댓글 시트 닫기
  const closeCommentSheet = () => {
    setActiveCommentSheet(null);
  };

  // 카테고리 필터 변경
  const handleFilterChange = (filterValue: string | null) => {
    setActiveFilter(filterValue);
  };

  // 시간 포맷 함수
  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return '방금';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}일 전`;
    return `${Math.floor(diffInSeconds / 604800)}주 전`;
  };

  const posts = data?.feedPosts?.posts || [];
  const hasMore = posts.length < (data?.feedPosts?.total || 0);

  if (error) {
    return (
      <div className="ds-feed-page__error">
        <p>피드를 불러오는데 실패했습니다.</p>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <div className="ds-feed-page">
      {/* Header */}
      <header className="ds-feed-page__header">
        <div className="ds-feed-page__header-inner">
          <a href="#" className="ds-feed-page__logo">
            FoodieShare
          </a>
          <div className="ds-feed-page__header-actions">
            <button className="ds-feed-page__header-btn" aria-label="검색">
              <Search size={20} />
            </button>
            <button className="ds-feed-page__header-btn" aria-label="알림">
              <Bell size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className="ds-feed-page__container">
        {/* Filters */}
        <div className="ds-feed-page__filters">
          {filters.map((filter) => (
            <button
              key={filter.label}
              className={`ds-feed-page__filter ${
                activeFilter === filter.value ? 'ds-feed-page__filter--active' : ''
              }`}
              onClick={() => handleFilterChange(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Feed Items */}
        <div className="ds-feed-page__feed">
          {loading && posts.length === 0 ? (
            <div className="ds-feed-page__loading">
              <div className="ds-feed-page__spinner"></div>
            </div>
          ) : (
            <>
              {posts.map((post: any, index: number) => (
                <FeedCard
                  key={post.id}
                  ref={index === posts.length - 5 ? lastFeedElementRef : null}
                  variant="detailed"
                  authorName={post.author.name}
                  authorInitial={post.author.initial}
                  timeAgo={formatTimeAgo(post.createdAt)}
                  title={post.title}
                  content={post.content}
                  location={post.location}
                  rating={post.rating.toString()}
                  showRating={true}
                  likes={post.likes}
                  comments={post.comments}
                  isLiked={likedPosts.has(post.id)}
                  onLike={() => toggleLike(post.id)}
                  onComment={() => openCommentSheet(post.id)}
                  onShare={() => {}}
                  tags={post.tags}
                  category={post.category}
                  image={post.foodImage}
                />
              ))}

              {loading && posts.length > 0 && (
                <div className="ds-feed-page__loading">
                  <div className="ds-feed-page__spinner"></div>
                </div>
              )}

              {!hasMore && posts.length > 0 && (
                <div className="ds-feed-page__end">
                  모든 피드를 확인하셨습니다 ✨
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 댓글 시트 */}
      {activeCommentSheet && (
        <CommentSheet
          isOpen={true}
          onClose={closeCommentSheet}
          postId={activeCommentSheet}
        />
      )}
    </div>
  );
};

export default FeedPage;
