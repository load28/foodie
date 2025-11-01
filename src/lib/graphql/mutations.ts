import { gql } from '@apollo/client';

// 회원가입
export const REGISTER = gql`
  mutation Register($input: CreateUserInput!) {
    register(input: $input) {
      token
      sessionId
      user {
        id
        email
        name
        initial
        profileImage
        status
        createdAt
        updatedAt
      }
    }
  }
`;

// 로그인
export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      sessionId
      user {
        id
        email
        name
        initial
        profileImage
        status
        createdAt
        updatedAt
      }
    }
  }
`;

// 로그아웃
export const LOGOUT = gql`
  mutation Logout {
    logout
  }
`;

// 카카오 로그인 URL 생성
export const GENERATE_KAKAO_LOGIN_URL = gql`
  mutation GenerateKakaoLoginUrl {
    generateKakaoLoginUrl {
      url
      state
    }
  }
`;

// 카카오 로그인
export const LOGIN_WITH_KAKAO = gql`
  mutation LoginWithKakao($input: KakaoLoginInput!) {
    loginWithKakao(input: $input) {
      token
      sessionId
      isNewUser
      user {
        id
        email
        name
        initial
        profileImage
        status
        createdAt
        updatedAt
      }
    }
  }
`;

// 피드 포스트 생성
export const CREATE_FEED_POST = gql`
  mutation CreateFeedPost($input: CreateFeedPostInput!) {
    createFeedPost(input: $input) {
      id
      title
      content
      location
      rating
      category
      tags
      foodImage
      imageUrls {
        thumbnail {
          webp
          jpeg
        }
        medium {
          webp
          jpeg
        }
        large {
          webp
          jpeg
        }
      }
      authorId
      likes
      comments
      createdAt
      updatedAt
      author {
        id
        name
        initial
        profileImage
        status
      }
    }
  }
`;

// 포스트 좋아요 토글
export const TOGGLE_POST_LIKE = gql`
  mutation TogglePostLike($postId: String!) {
    togglePostLike(postId: $postId) {
      id
      likes
    }
  }
`;

// 댓글 작성
export const CREATE_COMMENT = gql`
  mutation CreateComment($input: CreateCommentInput!) {
    createComment(input: $input) {
      id
      postId
      authorId
      content
      parentCommentId
      isReply
      createdAt
      updatedAt
      author {
        id
        name
        initial
        profileImage
        status
      }
      mentions {
        id
        name
        initial
        profileImage
      }
    }
  }
`;

// 댓글 삭제
export const DELETE_COMMENT = gql`
  mutation DeleteComment($commentId: String!) {
    deleteComment(commentId: $commentId)
  }
`;

// 프로필 업데이트
export const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile($name: String, $profileImage: String) {
    updateUserProfile(name: $name, profileImage: $profileImage) {
      id
      email
      name
      initial
      profileImage
      status
      createdAt
      updatedAt
    }
  }
`;

// 친구 요청 보내기
export const SEND_FRIEND_REQUEST = gql`
  mutation SendFriendRequest($addresseeId: String!) {
    sendFriendRequest(addresseeId: $addresseeId)
  }
`;

// 친구 요청 수락
export const ACCEPT_FRIEND_REQUEST = gql`
  mutation AcceptFriendRequest($requestId: String!) {
    acceptFriendRequest(requestId: $requestId)
  }
`;

// 친구 요청 거절
export const REJECT_FRIEND_REQUEST = gql`
  mutation RejectFriendRequest($requestId: String!) {
    rejectFriendRequest(requestId: $requestId)
  }
`;

// 친구 요청 취소
export const CANCEL_FRIEND_REQUEST = gql`
  mutation CancelFriendRequest($requestId: String!) {
    cancelFriendRequest(requestId: $requestId)
  }
`;

// 친구 삭제
export const REMOVE_FRIEND = gql`
  mutation RemoveFriend($friendId: String!) {
    removeFriend(friendId: $friendId)
  }
`;
