import { gql } from '@apollo/client';

// 피드 포스트 목록 조회
export const GET_FEED_POSTS = gql`
  query GetFeedPosts($limit: Int!, $offset: Int!, $category: Category) {
    feedPosts(limit: $limit, offset: $offset, category: $category) {
      posts {
        id
        title
        content
        location
        rating
        category
        tags
        foodImage
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
      total
    }
  }
`;

// 피드 포스트 상세 조회
export const GET_FEED_POST = gql`
  query GetFeedPost($id: String!) {
    feedPost(id: $id) {
      id
      title
      content
      location
      rating
      category
      tags
      foodImage
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

// 댓글 목록 조회
export const GET_COMMENTS = gql`
  query GetComments($postId: String!, $limit: Int!, $offset: Int!) {
    comments(postId: $postId, limit: $limit, offset: $offset) {
      comments {
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
      total
    }
  }
`;

// 현재 사용자 정보 조회
export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    currentUser {
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

// 사용자 정보 조회
export const GET_USER = gql`
  query GetUser($id: String!) {
    user(id: $id) {
      id
      name
      initial
      profileImage
      status
      createdAt
      updatedAt
    }
  }
`;

// 친구 목록 조회
export const GET_FRIENDS = gql`
  query GetFriends {
    friends {
      id
      name
      initial
      profileImage
      status
      email
      createdAt
      updatedAt
    }
  }
`;

// 친구 여부 확인
export const IS_FRIEND = gql`
  query IsFriend($userId: String!) {
    isFriend(userId: $userId)
  }
`;

// 친구 게시물 조회
export const GET_FRIEND_POSTS = gql`
  query GetFriendPosts($limit: Int!, $offset: Int!) {
    friendPosts(limit: $limit, offset: $offset) {
      id
      title
      content
      location
      rating
      category
      tags
      foodImage
      authorId
      likes
      comments
      createdAt
      updatedAt
      isLikedByCurrentUser
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

// 게시물 검색 (Elasticsearch)
export const SEARCH_POSTS = gql`
  query SearchPosts($query: String!, $category: String, $from: Int, $size: Int) {
    searchPosts(query: $query, category: $category, from: $from, size: $size) {
      posts {
        id
        title
        content
        location
        rating
        category
        tags
        foodImage
        authorId
        likes
        comments
        createdAt
        updatedAt
        isLikedByCurrentUser
        author {
          id
          name
          initial
          profileImage
          status
        }
      }
      total
    }
  }
`;

// 친구 게시물 검색 (Elasticsearch)
export const SEARCH_FRIEND_POSTS = gql`
  query SearchFriendPosts($query: String, $from: Int, $size: Int) {
    searchFriendPosts(query: $query, from: $from, size: $size) {
      posts {
        id
        title
        content
        location
        rating
        category
        tags
        foodImage
        authorId
        likes
        comments
        createdAt
        updatedAt
        isLikedByCurrentUser
        author {
          id
          name
          initial
          profileImage
          status
        }
      }
      total
    }
  }
`;
