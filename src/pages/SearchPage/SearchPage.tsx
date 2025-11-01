import { useState } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import { Search, Filter, UserPlus } from 'lucide-react';
import { SEARCH_POSTS, SEARCH_FRIEND_POSTS, SEARCH_USERS } from '../../lib/graphql/queries';
import { SEND_FRIEND_REQUEST } from '../../lib/graphql/mutations';
import FeedCard from '../../components/FeedCard/FeedCard';
import './SearchPage.scss';

type SearchType = 'posts' | 'users';
type PostSearchMode = 'all' | 'friends';

interface User {
  id: string;
  name: string;
  email: string;
  initial: string;
  profileImage: string | null;
  status: 'ONLINE' | 'AWAY' | 'OFFLINE';
}

export const SearchPage = () => {
  const [searchType, setSearchType] = useState<SearchType>('posts');
  const [searchQuery, setSearchQuery] = useState('');
  const [postSearchMode, setPostSearchMode] = useState<PostSearchMode>('all');
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
  const [searchUsers, { data: usersData, loading: usersLoading }] = useLazyQuery(SEARCH_USERS);

  const [sendFriendRequest, { loading: sendingRequest }] = useMutation(SEND_FRIEND_REQUEST);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    if (searchType === 'posts') {
      if (postSearchMode === 'all') {
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
    } else {
      searchUsers({
        variables: {
          query: searchQuery,
          limit: 20,
          offset: 0,
        },
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSendRequest = async (userId: string) => {
    try {
      await sendFriendRequest({
        variables: { addresseeId: userId },
      });
      alert('친구 요청을 보냈습니다!');
    } catch (error: any) {
      alert(error.message || '친구 요청 실패');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ONLINE':
        return '#10b981';
      case 'AWAY':
        return '#f59e0b';
      case 'OFFLINE':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const loading = allPostsLoading || friendPostsLoading || usersLoading;
  const posts = postSearchMode === 'all'
    ? allPostsData?.searchPosts?.posts || []
    : friendPostsData?.searchFriendPosts?.posts || [];
  const postsTotal = postSearchMode === 'all'
    ? allPostsData?.searchPosts?.total || 0
    : friendPostsData?.searchFriendPosts?.total || 0;
  const users = usersData?.searchUsers || [];

  return (
    <div className="search-page">
      <div className="search-header">
        <h1>검색</h1>
        <p>게시물이나 사용자를 검색해보세요</p>
      </div>

      {/* 검색 타입 선택 */}
      <div className="search-type-tabs">
        <button
          className={`type-tab ${searchType === 'posts' ? 'active' : ''}`}
          onClick={() => setSearchType('posts')}
        >
          게시물
        </button>
        <button
          className={`type-tab ${searchType === 'users' ? 'active' : ''}`}
          onClick={() => setSearchType('users')}
        >
          사용자
        </button>
      </div>

      {/* 게시물 검색 모드 (게시물 탭일 때만) */}
      {searchType === 'posts' && (
        <div className="search-mode">
          <button
            className={`mode-button ${postSearchMode === 'all' ? 'active' : ''}`}
            onClick={() => setPostSearchMode('all')}
          >
            전체 게시물
          </button>
          <button
            className={`mode-button ${postSearchMode === 'friends' ? 'active' : ''}`}
            onClick={() => setPostSearchMode('friends')}
          >
            친구 게시물
          </button>
        </div>
      )}

      {/* 검색 입력 */}
      <div className="search-box">
        <Search size={20} className="search-icon" />
        <input
          type="text"
          placeholder={
            searchType === 'posts'
              ? '음식점 이름, 위치, 태그로 검색...'
              : '이름 또는 이메일로 검색...'
          }
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button onClick={handleSearch} className="search-button" disabled={loading}>
          {loading ? '검색 중...' : '검색'}
        </button>
      </div>

      {/* 카테고리 필터 (전체 게시물 모드일 때만) */}
      {searchType === 'posts' && postSearchMode === 'all' && (
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
        ) : searchType === 'posts' ? (
          // 게시물 검색 결과
          posts.length > 0 ? (
            <>
              <div className="results-header">
                <p>
                  <strong>{postsTotal}개</strong>의 게시물을 찾았습니다
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
          )
        ) : (
          // 사용자 검색 결과
          users.length > 0 ? (
            <>
              <div className="results-header">
                <p>
                  <strong>{users.length}명</strong>의 사용자를 찾았습니다
                </p>
              </div>
              <div className="users-list">
                {users.map((user: User) => (
                  <div key={user.id} className="user-card">
                    <div className="user-info">
                      <div className="user-avatar">
                        {user.profileImage ? (
                          <img src={user.profileImage} alt={user.name} />
                        ) : (
                          <div className="avatar-initial">{user.initial}</div>
                        )}
                        <div
                          className="status-indicator"
                          style={{ backgroundColor: getStatusColor(user.status) }}
                        />
                      </div>

                      <div className="user-details">
                        <div className="user-name">{user.name}</div>
                        <div className="user-email">{user.email}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSendRequest(user.id)}
                      disabled={sendingRequest}
                      className="add-friend-button"
                    >
                      <UserPlus size={18} />
                      친구 요청
                    </button>
                  </div>
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
              <small>이름 또는 이메일로 검색할 수 있습니다</small>
            </div>
          )
        )}
      </div>
    </div>
  );
};
