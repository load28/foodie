import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Bell } from 'lucide-react';
import FeedCard from '../../components/FeedCard/FeedCard';
import CommentSheet, { Comment } from '../../components/CommentSheet/CommentSheet';
import './FeedScreen.scss';

interface FeedItem {
  id: number;
  author: string;
  initial: string;
  time: string;
  title: string;
  content: string;
  location: string;
  rating: string;
  image: string;
  category: string;
  tags: string[];
  likes: number;
  comments: number;
  commentsData: Comment[];
}

const FeedScreen: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('전체');
  const [likedPosts, setLikedPosts] = useState(new Set([1, 3]));
  const [feedData, setFeedData] = useState<FeedItem[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [comments, setComments] = useState<Record<number, Comment[]>>({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [activeCommentSheet, setActiveCommentSheet] = useState<number | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  const filters = ['전체', '한식', '양식', '중식', '일식', '카페', '디저트'];

  // 더미 데이터 생성 함수에서 댓글 데이터 구조 업데이트
  const generateCommentsForPost = (postId: number): Comment[] => {
    const commentAuthors = ['김민수', '이영희', '박철수', '정미라', '최지훈', '한소영'];
    const commentTexts = [
      '정말 맛있어 보이네요! 저도 가보고 싶어요.',
      '여기 진짜 맛있어요!! 추천합니다 👍',
      '아 배고파지는 사진이네요 ㅠㅠ',
      '위치가 어디인지 더 자세히 알려주세요!',
      '분위기도 좋아보이고 음식도 맛있어보여요',
      '다음에 친구들과 함께 가봐야겠어요',
      '가격대는 어느 정도인가요?',
      '예약 필요한가요??'
    ];

    const numComments = Math.floor(Math.random() * 4) + 3;
    const allComments: Comment[] = [];
    
    for (let i = 0; i < numComments; i++) {
      const author = commentAuthors[Math.floor(Math.random() * commentAuthors.length)];
      allComments.push({
        id: `${postId}-${i}`,
        author: author,
        initial: author.charAt(0),
        content: commentTexts[Math.floor(Math.random() * commentTexts.length)],
        time: `${Math.floor(Math.random() * 60) + 1}분 전`,
        isReply: false,
        mentionedUser: null
      });
    }

    const numReplies = Math.floor(Math.random() * 2) + 1;
    for (let j = 0; j < numReplies; j++) {
      const targetComment = allComments[Math.floor(Math.random() * Math.min(3, allComments.length))];
      const replyAuthor = commentAuthors[Math.floor(Math.random() * commentAuthors.length)];
      
      allComments.push({
        id: `${postId}-reply-${j}`,
        author: replyAuthor,
        initial: replyAuthor.charAt(0),
        content: commentTexts[Math.floor(Math.random() * commentTexts.length)],
        time: `${Math.floor(Math.random() * 30) + 1}분 전`,
        isReply: true,
        mentionedUser: targetComment.author
      });
    }

    return allComments;
  };
  
  // 더미 데이터 생성 함수
  const generateFeedData = (pageNum: number, count = 5): FeedItem[] => {
    const restaurants = [
      { name: '신선한 회가 일품인 횟집', content: '오마카세 코스로 먹었는데 정말 최고였어요. 회도 신선하고 사장님이 직접 설명해주셔서 더욱 맛있게 먹을 수 있었습니다.', location: '서초구 방배동 바다횟집', image: '🍣', category: '일식', tags: ['오마카세', '신선한회'] },
      { name: '분위기 좋은 이탈리안 레스토랑', content: '크림 파스타가 정말 환상적이었어요. 면도 알덴테로 완벽하고 크림 소스도 진짜 진하고 맛있었습니다.', location: '강남구 논현동 맘마미아', image: '🍝', category: '양식', tags: ['데이트', '파스타맛집'] },
      { name: '숨은 맛집 브런치 카페', content: '주말 브런치로 완벽한 곳을 발견했어요! 팬케이크가 정말 부드럽고 시럽도 진짜 메이플시럽이라 달콤함이 일품이었습니다.', location: '홍대입구 선셋카페', image: '🥞', category: '카페', tags: ['브런치', '팬케이크', '인스타감성'] },
      { name: '정통 일본식 라멘집', content: '진짜 일본에서 먹는 라멘 맛이에요! 돈코츠 라멘의 진한 국물과 쫄깃한 면발이 환상적입니다.', location: '신사동 라멘야', image: '🍜', category: '일식', tags: ['라멘', '돈코츠', '진짜맛집'] },
      { name: '힐링되는 한옥 카페', content: '전통 한옥을 개조한 카페인데 분위기가 정말 좋아요. 전통차와 한과도 맛있고 사진찍기에도 예쁜 곳이에요.', location: '인사동 한옥마루', image: '🍵', category: '카페', tags: ['한옥', '전통차', '힐링'] }
    ];

    const authors = ['김서현', '이준호', '박지영', '최민우', '정수진'];
    
    return Array.from({ length: count }, (_, i) => {
      const baseIndex = (pageNum - 1) * count + i;
      const restaurant = restaurants[baseIndex % restaurants.length];
      const author = authors[baseIndex % authors.length];
      const postId = baseIndex + 1;
      
      const postComments = generateCommentsForPost(postId);
      const totalComments = postComments.length;
      
      return {
        id: postId,
        author: author,
        initial: author.charAt(0),
        time: `${Math.floor(Math.random() * 12) + 1}시간 전`,
        title: restaurant.name,
        content: restaurant.content,
        location: restaurant.location,
        rating: (Math.random() * 2 + 3).toFixed(1),
        image: restaurant.image,
        category: restaurant.category,
        tags: restaurant.tags,
        likes: Math.floor(Math.random() * 50) + 1,
        comments: totalComments,
        commentsData: postComments
      };
    });
  };

  // 초기 데이터 로드
  useEffect(() => {
    const initialData = generateFeedData(1, 10);
    setFeedData(initialData);
    
    const initialComments: Record<number, Comment[]> = {};
    initialData.forEach(post => {
      initialComments[post.id] = post.commentsData;
    });
    setComments(initialComments);
  }, []);

  // 더 많은 데이터 로드
  const loadMoreFeed = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    
    setTimeout(() => {
      const newPage = page + 1;
      const newData = generateFeedData(newPage, 5);
      
      if (newData.length === 0 || feedData.length >= 50) {
        setHasMore(false);
      } else {
        setFeedData(prev => [...prev, ...newData]);
        setPage(newPage);
        
        const newComments = { ...comments };
        newData.forEach(post => {
          newComments[post.id] = post.commentsData;
        });
        setComments(newComments);
      }
      setLoading(false);
    }, 500);
  }, [loading, hasMore, page, feedData.length, comments]);

  const lastFeedElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreFeed();
      }
    }, {
      rootMargin: '200px'
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore, loadMoreFeed]);

  const toggleLike = (postId: number) => {
    const newLikedPosts = new Set(likedPosts);
    if (newLikedPosts.has(postId)) {
      newLikedPosts.delete(postId);
    } else {
      newLikedPosts.add(postId);
    }
    setLikedPosts(newLikedPosts);
  };

  // 댓글 시트 열기
  const openCommentSheet = (postId: number) => {
    setActiveCommentSheet(postId);
  };

  // 댓글 시트 닫기
  const closeCommentSheet = () => {
    setActiveCommentSheet(null);
    setReplyingTo(null);
  };

  // 댓글 작성
  const submitComment = (postId: string | number, parentId?: string | null) => {
    const commentText = newComment[`${postId}-${parentId || 'root'}`];
    if (!commentText?.trim()) return;

    const postIdNum = typeof postId === 'string' ? parseInt(postId) : postId;
    let mentionedUser: string | null = null;
    let cleanContent = commentText;

    if (parentId) {
      const currentComments = comments[postIdNum] || [];
      const parentComment = currentComments.find(c => c.id === parentId);
      if (parentComment) {
        mentionedUser = parentComment.author;
        cleanContent = commentText;
      }
    }

    const newCommentObj: Comment = {
      id: `${postId}-${Date.now()}`,
      author: '나',
      initial: '나',
      content: cleanContent,
      time: '방금',
      mentionedUser: mentionedUser,
      isReply: !!parentId
    };

    const updatedComments = { ...comments };
    const currentComments = updatedComments[postIdNum] || [];
    
    if (parentId) {
      const parentIndex = currentComments.findIndex(c => c.id === parentId);
      if (parentIndex !== -1) {
        let insertIndex = parentIndex + 1;
        
        while (insertIndex < currentComments.length && 
               currentComments[insertIndex].isReply && 
               currentComments[insertIndex].mentionedUser === mentionedUser) {
          insertIndex++;
        }
        
        const newComments = [
          ...currentComments.slice(0, insertIndex),
          newCommentObj,
          ...currentComments.slice(insertIndex)
        ];
        updatedComments[postIdNum] = newComments;
      } else {
        updatedComments[postIdNum] = [...currentComments, newCommentObj];
      }
    } else {
      updatedComments[postIdNum] = [...currentComments, newCommentObj];
    }
    
    setComments(updatedComments);
    setFeedData(prev => prev.map(post => 
      post.id === postIdNum 
        ? { ...post, comments: post.comments + 1 }
        : post
    ));
    
    setNewComment(prev => ({
      ...prev,
      [`${postId}-${parentId || 'root'}`]: ''
    }));
    
    if (parentId) {
      setReplyingTo(null);
    }

    if (!parentId) {
      setTimeout(() => {
        const commentSheet = document.querySelector('[data-comment-scroll]');
        if (commentSheet) {
          commentSheet.scrollTo({
            top: commentSheet.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  };

  return (
    <div className="ds-feed-screen">
      {/* Header */}
      <header className="ds-feed-screen__header">
        <div className="ds-feed-screen__header-inner">
          <a href="#" className="ds-feed-screen__logo">
            FoodieShare
          </a>
          <div className="ds-feed-screen__header-actions">
            <button className="ds-feed-screen__header-btn" aria-label="검색">
              <Search size={20} />
            </button>
            <button className="ds-feed-screen__header-btn" aria-label="알림">
              <Bell size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className="ds-feed-screen__container">
        {/* Filters */}
        <div className="ds-feed-screen__filters">
          {filters.map((filter) => (
            <button
              key={filter}
              className={`ds-feed-screen__filter ${
                activeFilter === filter ? 'ds-feed-screen__filter--active' : ''
              }`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Feed Items */}
        <div className="ds-feed-screen__feed">
          {feedData.map((post, index) => (
            <FeedCard
              key={post.id}
              ref={index === feedData.length - 5 ? lastFeedElementRef : null}
              variant="detailed"
              authorName={post.author}
              authorInitial={post.initial}
              timeAgo={post.time}
              title={post.title}
              content={post.content}
              location={post.location}
              rating={post.rating}
              showRating={true}
              likes={post.likes}
              comments={post.comments}
              isLiked={likedPosts.has(post.id)}
              onLike={() => toggleLike(post.id)}
              onComment={() => openCommentSheet(post.id)}
              onShare={() => {}}
              tags={post.tags}
              category={post.category}
              image={post.image}
            />
          ))}
          
          {loading && (
            <div className="ds-feed-screen__loading">
              <div className="ds-feed-screen__spinner"></div>
            </div>
          )}
          
          {!hasMore && feedData.length > 0 && (
            <div className="ds-feed-screen__end">
              모든 피드를 확인하셨습니다 ✨
            </div>
          )}
        </div>
      </div>

      {/* 댓글 시트 */}
      <CommentSheet 
        isOpen={activeCommentSheet !== null}
        onClose={closeCommentSheet}
        postId={activeCommentSheet}
        comments={comments[activeCommentSheet!] || []}
        onSubmitComment={submitComment}
        replyingTo={replyingTo}
        newComment={newComment}
        setNewComment={setNewComment}
        setReplyingTo={setReplyingTo}
      />
    </div>
  );
};

export default FeedScreen;