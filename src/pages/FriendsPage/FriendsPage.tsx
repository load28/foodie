import { useQuery, useMutation } from '@apollo/client';
import { useState } from 'react';
import { Users, UserPlus, UserMinus, Search } from 'lucide-react';
import { GET_FRIENDS } from '../../lib/graphql/queries';
import { ADD_FRIEND, REMOVE_FRIEND } from '../../lib/graphql/mutations';
import './FriendsPage.scss';

interface Friend {
  id: string;
  name: string;
  initial: string;
  profileImage: string | null;
  status: 'ONLINE' | 'AWAY' | 'OFFLINE';
  email: string;
}

export const FriendsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [addFriendId, setAddFriendId] = useState('');

  const { data, loading, error, refetch } = useQuery<{ friends: Friend[] }>(GET_FRIENDS);
  const [addFriend, { loading: addingFriend }] = useMutation(ADD_FRIEND);
  const [removeFriend, { loading: removingFriend }] = useMutation(REMOVE_FRIEND);

  const handleAddFriend = async () => {
    if (!addFriendId.trim()) return;

    try {
      await addFriend({
        variables: { friendId: addFriendId.trim() },
      });
      setAddFriendId('');
      refetch();
      alert('친구가 추가되었습니다!');
    } catch (error: any) {
      alert(error.message || '친구 추가 실패');
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!confirm('정말 친구를 삭제하시겠습니까?')) return;

    try {
      await removeFriend({
        variables: { friendId },
      });
      refetch();
      alert('친구가 삭제되었습니다.');
    } catch (error: any) {
      alert(error.message || '친구 삭제 실패');
    }
  };

  const filteredFriends = data?.friends?.filter((friend) =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.email.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ONLINE':
        return '온라인';
      case 'AWAY':
        return '자리 비움';
      case 'OFFLINE':
        return '오프라인';
      default:
        return '오프라인';
    }
  };

  if (loading) {
    return (
      <div className="friends-page">
        <div className="loading">친구 목록을 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="friends-page">
        <div className="error">친구 목록을 불러오는데 실패했습니다.</div>
      </div>
    );
  }

  return (
    <div className="friends-page">
      <div className="friends-header">
        <div className="header-title">
          <Users size={24} />
          <h1>친구 목록</h1>
          <span className="friends-count">{data?.friends?.length || 0}명</span>
        </div>

        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="친구 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="add-friend-section">
        <div className="add-friend-input">
          <UserPlus size={20} />
          <input
            type="text"
            placeholder="친구 ID 입력"
            value={addFriendId}
            onChange={(e) => setAddFriendId(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddFriend()}
          />
          <button
            onClick={handleAddFriend}
            disabled={addingFriend || !addFriendId.trim()}
            className="add-button"
          >
            {addingFriend ? '추가 중...' : '친구 추가'}
          </button>
        </div>
      </div>

      <div className="friends-list">
        {filteredFriends.length === 0 ? (
          <div className="empty-state">
            <Users size={48} />
            <p>친구가 없습니다.</p>
            <small>위에서 친구 ID를 입력하여 친구를 추가해보세요!</small>
          </div>
        ) : (
          filteredFriends.map((friend) => (
            <div key={friend.id} className="friend-card">
              <div className="friend-info">
                <div className="friend-avatar">
                  {friend.profileImage ? (
                    <img src={friend.profileImage} alt={friend.name} />
                  ) : (
                    <div className="avatar-initial">{friend.initial}</div>
                  )}
                  <div
                    className="status-indicator"
                    style={{ backgroundColor: getStatusColor(friend.status) }}
                  />
                </div>

                <div className="friend-details">
                  <div className="friend-name">{friend.name}</div>
                  <div className="friend-email">{friend.email}</div>
                  <div className="friend-status" style={{ color: getStatusColor(friend.status) }}>
                    {getStatusText(friend.status)}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleRemoveFriend(friend.id)}
                disabled={removingFriend}
                className="remove-button"
              >
                <UserMinus size={18} />
                삭제
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
