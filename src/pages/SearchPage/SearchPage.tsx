import { useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { Search, Filter } from 'lucide-react';
import { SEARCH_POSTS, SEARCH_FRIEND_POSTS } from '../../lib/graphql/queries';
import FeedCard from '../../components/FeedCard/FeedCard';
import './SearchPage.scss';

type SearchMode = 'all' | 'friends';

export const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    { label: '전체', value: null },
    { label: '한식', value: 'KOREAN' },
    { label: '양식', value: 'WESTERN' },
    { label: '중식', value: 'CHINESE' },
    { label: '일식', value: 'JAPANESE' },
    { label: '카페', value: 'CAFE' },
    { label: '디저트', value: 'DESSERT' },
  ];

  const [searchPosts, { data: allPostsData, loading: allPostsLoading }] = useLazyQuery(SEARCH_POSTS);
  const [searchFriendPosts, { data: friendPostsData, loading: friendPostsLoading }] =
    useLazyQuery(SEARCH_FRIEND_POSTS);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    if (searchMode === 'all') {
      searchPosts({
        variables: {
          query: searchQuery,
          category: selectedCategory,
          from: 0,
          size: 20,
        },
      });
    } else {
      searchFriendPosts({
        variables: {
          query: searchQuery,
          from: 0,
          size: 20,
        },
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const loading = allPostsLoading || friendPostsLoading;
  const posts = searchMode === 'all'
    ? allPostsData?.searchPosts?.posts || []
    : friendPostsData?.searchFriendPosts?.posts || [];
  const total = searchMode === 'all'
    ? allPostsData?.searchPosts?.total || 0
    : friendPostsData?.searchFriendPosts?.total || 0;

  return (
    <div className="search-page">
      <div className="search-header">
        <h1>게시물 검색</h1>
        <p>원하는 음식점이나 음식을 검색해보세요</p>
      </div>

      {/* 검색 모드 선택 */}
      <div className="search-mode">
        <button
          className={`mode-button ${searchMode === 'all' ? 'active' : ''}`}
          onClick={() => setSearchMode('all')}
        >
          전체 게시물
        </button>
        <button
          className={`mode-button ${searchMode === 'friends' ? 'active' : ''}`}
          onClick={() => setSearchMode('friends')}
        >
          친구 게시물
        </button>
      </div>

      {/* 검색 입력 */}
      <div className="search-box">
        <Search size={20} className="search-icon" />
        <input
          type="text"
          placeholder="음식점 이름, 위치, 태그로 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button onClick={handleSearch} className="search-button" disabled={loading}>
          {loading ? '검색 중...' : '검색'}
        </button>
      </div>

      {/* 카테고리 필터 (전체 게시물 모드일 때만) */}
      {searchMode === 'all' && (
        <div className="category-filter">
          <Filter size={16} />
          <span>카테고리:</span>
          {categories.map((cat) => (
            <button
              key={cat.label}
              className={`category-button ${selectedCategory === cat.value ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* 검색 결과 */}
      <div className="search-results">
        {loading ? (
          <div className="loading">검색 중...</div>
        ) : posts.length > 0 ? (
          <>
            <div className="results-header">
              <p>
                <strong>{total}개</strong>의 게시물을 찾았습니다
              </p>
            </div>
            <div className="posts-grid">
              {posts.map((post: any) => (
                <FeedCard
                  key={post.id}
                  post={post}
                  onLike={() => {}}
                  onComment={() => {}}
                  onShare={() => {}}
                />
              ))}
            </div>
          </>
        ) : searchQuery ? (
          <div className="empty-state">
            <Search size={48} />
            <p>검색 결과가 없습니다</p>
            <small>다른 키워드로 검색해보세요</small>
          </div>
        ) : (
          <div className="empty-state">
            <Search size={48} />
            <p>검색어를 입력해주세요</p>
            <small>음식점 이름, 위치, 태그로 검색할 수 있습니다</small>
          </div>
        )}
      </div>
    </div>
  );
};
