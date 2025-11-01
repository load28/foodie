import { useQuery, useMutation } from '@apollo/client';
import { useState } from 'react';
import { Users, UserPlus, UserMinus, Search, Check, X, UserX } from 'lucide-react';
import {
  GET_FRIENDS,
  GET_FRIEND_REQUESTS,
  GET_SENT_FRIEND_REQUESTS,
  GET_FRIEND_STATS,
} from '../../lib/graphql/queries';
import {
  SEND_FRIEND_REQUEST,
  ACCEPT_FRIEND_REQUEST,
  REJECT_FRIEND_REQUEST,
  CANCEL_FRIEND_REQUEST,
  REMOVE_FRIEND,
} from '../../lib/graphql/mutations';
import './FriendsPage.scss';

interface User {
  id: string;
  name: string;
  initial: string;
  profileImage: string | null;
  status: 'ONLINE' | 'AWAY' | 'OFFLINE';
  email: string;
}

interface FriendRequest {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  requester: User;
  addressee: User;
}

interface FriendStats {
  userId: string;
  friendCount: number;
  pendingRequestsCount: number;
  updatedAt: string;
}

type TabType = 'friends' | 'received' | 'sent';

export const FriendsPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [addFriendId, setAddFriendId] = useState('');

  // 쿼리
  const { data: friendsData, loading: friendsLoading, error: friendsError, refetch: refetchFriends } =
    useQuery<{ friends: User[] }>(GET_FRIENDS);

  const { data: requestsData, loading: requestsLoading, refetch: refetchRequests } =
    useQuery<{ friendRequests: FriendRequest[] }>(GET_FRIEND_REQUESTS);

  const { data: sentRequestsData, loading: sentRequestsLoading, refetch: refetchSentRequests } =
    useQuery<{ sentFriendRequests: FriendRequest[] }>(GET_SENT_FRIEND_REQUESTS);

  const { data: statsData, refetch: refetchStats } =
    useQuery<{ friendStats: FriendStats | null }>(GET_FRIEND_STATS);

  // 뮤테이션
  const [sendFriendRequest, { loading: sendingRequest }] = useMutation(SEND_FRIEND_REQUEST);
  const [acceptRequest, { loading: accepting }] = useMutation(ACCEPT_FRIEND_REQUEST);
  const [rejectRequest, { loading: rejecting }] = useMutation(REJECT_FRIEND_REQUEST);
  const [cancelRequest, { loading: canceling }] = useMutation(CANCEL_FRIEND_REQUEST);
  const [removeFriend, { loading: removing }] = useMutation(REMOVE_FRIEND);

  const refetchAll = () => {
    refetchFriends();
    refetchRequests();
    refetchSentRequests();
    refetchStats();
  };

  const handleSendRequest = async () => {
    if (!addFriendId.trim()) return;

    try {
      await sendFriendRequest({
        variables: { addresseeId: addFriendId.trim() },
      });
      setAddFriendId('');
      refetchAll();
      alert('친구 요청을 보냈습니다!');
    } catch (error: any) {
      alert(error.message || '친구 요청 실패');
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await acceptRequest({
        variables: { requestId },
      });
      refetchAll();
      alert('친구 요청을 수락했습니다!');
    } catch (error: any) {
      alert(error.message || '요청 수락 실패');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    if (!confirm('친구 요청을 거절하시겠습니까?')) return;

    try {
      await rejectRequest({
        variables: { requestId },
      });
      refetchAll();
      alert('친구 요청을 거절했습니다.');
    } catch (error: any) {
      alert(error.message || '요청 거절 실패');
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    if (!confirm('친구 요청을 취소하시겠습니까?')) return;

    try {
      await cancelRequest({
        variables: { requestId },
      });
      refetchAll();
      alert('친구 요청을 취소했습니다.');
    } catch (error: any) {
      alert(error.message || '요청 취소 실패');
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!confirm('정말 친구를 삭제하시겠습니까?')) return;

    try {
      await removeFriend({
        variables: { friendId },
      });
      refetchAll();
      alert('친구가 삭제되었습니다.');
    } catch (error: any) {
      alert(error.message || '친구 삭제 실패');
    }
  };

  const filteredFriends = friendsData?.friends?.filter((friend) =>
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

  const renderUserCard = (user: User, actions?: React.ReactNode) => (
    <div key={user.id} className="friend-card">
      <div className="friend-info">
        <div className="friend-avatar">
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

        <div className="friend-details">
          <div className="friend-name">{user.name}</div>
          <div className="friend-email">{user.email}</div>
          <div className="friend-status" style={{ color: getStatusColor(user.status) }}>
            {getStatusText(user.status)}
          </div>
        </div>
      </div>

      {actions}
    </div>
  );

  const renderFriendsList = () => {
    if (friendsLoading) {
      return <div className="loading">친구 목록을 불러오는 중...</div>;
    }

    if (friendsError) {
      return <div className="error">친구 목록을 불러오는데 실패했습니다.</div>;
    }

    if (filteredFriends.length === 0) {
      return (
        <div className="empty-state">
          <Users size={48} />
          <p>친구가 없습니다.</p>
          <small>위에서 친구 ID를 입력하여 친구를 추가해보세요!</small>
        </div>
      );
    }

    return filteredFriends.map((friend) =>
      renderUserCard(
        friend,
        <button
          onClick={() => handleRemoveFriend(friend.id)}
          disabled={removing}
          className="remove-button"
        >
          <UserMinus size={18} />
          삭제
        </button>
      )
    );
  };

  const renderReceivedRequests = () => {
    if (requestsLoading) {
      return <div className="loading">요청 목록을 불러오는 중...</div>;
    }

    const requests = requestsData?.friendRequests || [];

    if (requests.length === 0) {
      return (
        <div className="empty-state">
          <UserPlus size={48} />
          <p>받은 친구 요청이 없습니다.</p>
        </div>
      );
    }

    return requests.map((request) =>
      renderUserCard(
        request.requester,
        <div className="request-actions">
          <button
            onClick={() => handleAcceptRequest(request.id)}
            disabled={accepting}
            className="accept-button"
          >
            <Check size={18} />
            수락
          </button>
          <button
            onClick={() => handleRejectRequest(request.id)}
            disabled={rejecting}
            className="reject-button"
          >
            <X size={18} />
            거절
          </button>
        </div>
      )
    );
  };

  const renderSentRequests = () => {
    if (sentRequestsLoading) {
      return <div className="loading">요청 목록을 불러오는 중...</div>;
    }

    const sentRequests = sentRequestsData?.sentFriendRequests || [];

    if (sentRequests.length === 0) {
      return (
        <div className="empty-state">
          <UserPlus size={48} />
          <p>보낸 친구 요청이 없습니다.</p>
        </div>
      );
    }

    return sentRequests.map((request) =>
      renderUserCard(
        request.addressee,
        <button
          onClick={() => handleCancelRequest(request.id)}
          disabled={canceling}
          className="cancel-button"
        >
          <UserX size={18} />
          취소
        </button>
      )
    );
  };

  const stats = statsData?.friendStats;

  return (
    <div className="friends-page">
      <div className="friends-header">
        <div className="header-title">
          <Users size={24} />
          <h1>친구 관리</h1>
        </div>

        {stats && (
          <div className="friends-stats">
            <div className="stat-item">
              <span className="stat-label">친구</span>
              <span className="stat-value">{stats.friendCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">요청</span>
              <span className="stat-value">{stats.pendingRequestsCount}</span>
            </div>
          </div>
        )}
      </div>

      <div className="add-friend-section">
        <div className="add-friend-input">
          <UserPlus size={20} />
          <input
            type="text"
            placeholder="사용자 ID 입력"
            value={addFriendId}
            onChange={(e) => setAddFriendId(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendRequest()}
          />
          <button
            onClick={handleSendRequest}
            disabled={sendingRequest || !addFriendId.trim()}
            className="add-button"
          >
            {sendingRequest ? '전송 중...' : '친구 요청'}
          </button>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'friends' ? 'active' : ''}`}
          onClick={() => setActiveTab('friends')}
        >
          친구 목록
          {friendsData?.friends && (
            <span className="tab-badge">{friendsData.friends.length}</span>
          )}
        </button>
        <button
          className={`tab ${activeTab === 'received' ? 'active' : ''}`}
          onClick={() => setActiveTab('received')}
        >
          받은 요청
          {requestsData?.friendRequests && requestsData.friendRequests.length > 0 && (
            <span className="tab-badge">{requestsData.friendRequests.length}</span>
          )}
        </button>
        <button
          className={`tab ${activeTab === 'sent' ? 'active' : ''}`}
          onClick={() => setActiveTab('sent')}
        >
          보낸 요청
          {sentRequestsData?.sentFriendRequests && sentRequestsData.sentFriendRequests.length > 0 && (
            <span className="tab-badge">{sentRequestsData.sentFriendRequests.length}</span>
          )}
        </button>
      </div>

      {activeTab === 'friends' && (
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="친구 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      <div className="friends-list">
        {activeTab === 'friends' && renderFriendsList()}
        {activeTab === 'received' && renderReceivedRequests()}
        {activeTab === 'sent' && renderSentRequests()}
      </div>
    </div>
  );
};
