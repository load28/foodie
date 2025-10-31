# 프론트엔드 통합 가이드

이 가이드는 React + TypeScript 프론트엔드에서 Foodie GraphQL API를 사용하는 방법을 설명합니다.

## 1. 필요한 패키지 설치

```bash
# Apollo Client 사용 (권장)
pnpm add @apollo/client graphql

# 또는 URQL 사용
pnpm add urql graphql

# GraphQL Code Generator (TypeScript 타입 자동 생성)
pnpm add -D @graphql-codegen/cli @graphql-codegen/client-preset
```

## 2. Apollo Client 설정

### `src/lib/apollo-client.ts`

```typescript
import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

// HTTP 연결 설정
const httpLink = createHttpLink({
  uri: 'http://127.0.0.1:8080/graphql',
});

// 인증 링크 (JWT 토큰 추가)
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('authToken');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

// 에러 핸들링
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );
  }
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

// Apollo Client 생성
export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          feedPosts: {
            keyArgs: ['category'],
            merge(existing = [], incoming) {
              return [...existing, ...incoming];
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});
```

### `src/main.tsx` (Apollo Provider 설정)

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from './lib/apollo-client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ApolloProvider client={apolloClient}>
      <App />
    </ApolloProvider>
  </React.StrictMode>,
);
```

## 3. GraphQL 쿼리 및 뮤테이션 정의

### `src/graphql/queries.ts`

```typescript
import { gql } from '@apollo/client';

// 피드 포스트 목록 조회
export const GET_FEED_POSTS = gql`
  query GetFeedPosts($limit: Int!, $offset: Int!, $category: Category) {
    feedPosts(limit: $limit, offset: $offset, category: $category) {
      id
      title
      content
      location
      rating
      foodImage
      category
      tags
      likes
      comments
      createdAt
      author {
        id
        name
        initial
        status
      }
      isLikedByCurrentUser
    }
  }
`;

// 특정 포스트 상세 조회
export const GET_FEED_POST = gql`
  query GetFeedPost($id: String!) {
    feedPost(id: $id) {
      id
      title
      content
      location
      rating
      foodImage
      category
      tags
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
      isLikedByCurrentUser
    }
  }
`;

// 댓글 목록 조회
export const GET_COMMENTS = gql`
  query GetComments($postId: String!, $limit: Int!, $offset: Int!) {
    comments(postId: $postId, limit: $limit, offset: $offset) {
      id
      content
      createdAt
      isReply
      author {
        id
        name
        initial
        profileImage
      }
      parentComment {
        id
        author {
          name
        }
      }
      mentions {
        id
        name
      }
    }
  }
`;

// 현재 사용자 정보
export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    currentUser {
      id
      email
      name
      initial
      profileImage
      status
    }
  }
`;
```

### `src/graphql/mutations.ts`

```typescript
import { gql } from '@apollo/client';

// 회원가입
export const REGISTER = gql`
  mutation Register($input: CreateUserInput!) {
    register(input: $input) {
      user {
        id
        email
        name
        initial
      }
      token
    }
  }
`;

// 로그인
export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      user {
        id
        email
        name
        initial
        status
      }
      token
    }
  }
`;

// 로그아웃
export const LOGOUT = gql`
  mutation Logout {
    logout
  }
`;

// 피드 포스트 생성
export const CREATE_FEED_POST = gql`
  mutation CreateFeedPost($input: CreateFeedPostInput!) {
    createFeedPost(input: $input) {
      id
      title
      content
      rating
      category
      tags
      foodImage
      createdAt
      author {
        name
        initial
      }
    }
  }
`;

// 포스트 좋아요 토글
export const TOGGLE_POST_LIKE = gql`
  mutation TogglePostLike($postId: String!) {
    togglePostLike(postId: $postId)
  }
`;

// 댓글 작성
export const CREATE_COMMENT = gql`
  mutation CreateComment($input: CreateCommentInput!) {
    createComment(input: $input) {
      id
      content
      createdAt
      isReply
      author {
        name
        initial
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
```

## 4. React 컴포넌트 예제

### 로그인 폼 업데이트

`src/pages/LoginForm/LoginForm.tsx`를 수정하여 실제 GraphQL API와 연동:

```typescript
import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { LOGIN } from '../../graphql/mutations';
import './LoginForm.scss';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const [login, { loading, error }] = useMutation(LOGIN, {
    onCompleted: (data) => {
      // 토큰 저장
      localStorage.setItem('authToken', data.login.token);
      // 사용자 정보 저장 (옵션)
      localStorage.setItem('user', JSON.stringify(data.login.user));
      // 페이지 이동
      window.location.href = '/feed';
    },
    onError: (error) => {
      console.error('Login error:', error);
      setErrors({ password: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    },
  });

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.';
    }

    if (!password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (password.length < 6) {
      newErrors.password = '비밀번호는 최소 6자 이상이어야 합니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    await login({
      variables: {
        input: { email, password }
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <h2>로그인</h2>

      <input
        type="email"
        placeholder="이메일"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      {errors.email && <span className="error">{errors.email}</span>}

      <input
        type="password"
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {errors.password && <span className="error">{errors.password}</span>}

      {error && <span className="error">로그인에 실패했습니다.</span>}

      <button type="submit" disabled={loading}>
        {loading ? '로그인 중...' : '로그인'}
      </button>
    </form>
  );
};
```

### 피드 스크린 업데이트

`src/pages/FeedScreen/FeedScreen.tsx`를 수정하여 실제 GraphQL API와 연동:

```typescript
import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_FEED_POSTS } from '../../graphql/queries';
import { TOGGLE_POST_LIKE } from '../../graphql/mutations';
import { FeedCard } from '../../components/FeedCard/FeedCard';
import './FeedScreen.scss';

type Category = 'ALL' | 'KOREAN' | 'WESTERN' | 'CHINESE' | 'JAPANESE' | 'CAFE' | 'DESSERT';

export const FeedScreen: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category>('ALL');
  const [page, setPage] = useState(0);
  const LIMIT = 10;

  const { data, loading, error, fetchMore } = useQuery(GET_FEED_POSTS, {
    variables: {
      limit: LIMIT,
      offset: page * LIMIT,
      category: selectedCategory === 'ALL' ? null : selectedCategory,
    },
  });

  const [toggleLike] = useMutation(TOGGLE_POST_LIKE, {
    refetchQueries: [GET_FEED_POSTS],
  });

  const handleLike = async (postId: string) => {
    await toggleLike({ variables: { postId } });
  };

  const loadMore = () => {
    fetchMore({
      variables: {
        offset: (page + 1) * LIMIT,
      },
    });
    setPage(page + 1);
  };

  if (loading && page === 0) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error.message}</div>;

  return (
    <div className="feed-screen">
      <div className="category-filters">
        {['ALL', 'KOREAN', 'WESTERN', 'CHINESE', 'JAPANESE', 'CAFE', 'DESSERT'].map((cat) => (
          <button
            key={cat}
            className={selectedCategory === cat ? 'active' : ''}
            onClick={() => {
              setSelectedCategory(cat as Category);
              setPage(0);
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="feed-list">
        {data?.feedPosts.map((post: any) => (
          <FeedCard
            key={post.id}
            {...post}
            onLike={() => handleLike(post.id)}
            onComment={() => {/* 댓글 시트 열기 */}}
            onShare={() => {/* 공유 기능 */}}
          />
        ))}
      </div>

      {data?.feedPosts.length >= LIMIT && (
        <button onClick={loadMore} disabled={loading}>
          {loading ? '로딩 중...' : '더 보기'}
        </button>
      )}
    </div>
  );
};
```

## 5. GraphQL Code Generator 설정

TypeScript 타입을 자동 생성하려면:

### `codegen.ts` 파일 생성

```typescript
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'http://127.0.0.1:8080/graphql',
  documents: ['src/**/*.tsx', 'src/**/*.ts'],
  ignoreNoDocuments: true,
  generates: {
    './src/gql/': {
      preset: 'client',
      plugins: [],
    },
  },
};

export default config;
```

### `package.json`에 스크립트 추가

```json
{
  "scripts": {
    "codegen": "graphql-codegen",
    "codegen:watch": "graphql-codegen --watch"
  }
}
```

### 실행

```bash
# 타입 생성
pnpm codegen

# 개발 중 자동 생성
pnpm codegen:watch
```

## 6. 인증 상태 관리

### `src/hooks/useAuth.ts`

```typescript
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CURRENT_USER } from '../graphql/queries';
import { LOGIN, LOGOUT } from '../graphql/mutations';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const { data, loading } = useQuery(GET_CURRENT_USER, {
    skip: !localStorage.getItem('authToken'),
  });

  const [login] = useMutation(LOGIN);
  const [logout] = useMutation(LOGOUT);

  useEffect(() => {
    if (data?.currentUser) {
      setIsAuthenticated(true);
    }
  }, [data]);

  const handleLogin = async (email: string, password: string) => {
    const result = await login({ variables: { input: { email, password } } });
    localStorage.setItem('authToken', result.data.login.token);
    setIsAuthenticated(true);
    return result.data.login.user;
  };

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  };

  return {
    user: data?.currentUser,
    isAuthenticated,
    loading,
    login: handleLogin,
    logout: handleLogout,
  };
};
```

## 7. 환경 변수 설정

### `.env` (프론트엔드)

```env
VITE_GRAPHQL_API_URL=http://127.0.0.1:8080/graphql
```

Apollo Client 설정에서 사용:

```typescript
const httpLink = createHttpLink({
  uri: import.meta.env.VITE_GRAPHQL_API_URL || 'http://127.0.0.1:8080/graphql',
});
```

## 8. 에러 핸들링

```typescript
import { ApolloError } from '@apollo/client';

const handleError = (error: ApolloError) => {
  if (error.networkError) {
    console.error('네트워크 오류:', error.networkError);
    // 토스트 메시지 표시
  }

  if (error.graphQLErrors) {
    error.graphQLErrors.forEach((err) => {
      if (err.message === 'Unauthorized') {
        // 로그아웃 처리
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      }
    });
  }
};
```

## 9. 낙관적 업데이트 (Optimistic UI)

좋아요 버튼의 즉각적인 반응을 위한 낙관적 업데이트:

```typescript
const [toggleLike] = useMutation(TOGGLE_POST_LIKE, {
  optimisticResponse: {
    togglePostLike: true,
  },
  update: (cache, { data }) => {
    if (data?.togglePostLike !== undefined) {
      cache.modify({
        id: cache.identify({ __typename: 'FeedPost', id: postId }),
        fields: {
          likes: (currentLikes) =>
            data.togglePostLike ? currentLikes + 1 : currentLikes - 1,
          isLikedByCurrentUser: () => data.togglePostLike,
        },
      });
    }
  },
});
```

## 10. 캐싱 전략

```typescript
// 특정 포스트만 리프레시
refetchQueries: [
  { query: GET_FEED_POST, variables: { id: postId } }
]

// 전체 피드 리프레시
refetchQueries: [GET_FEED_POSTS]

// 수동으로 캐시 업데이트
apolloClient.cache.modify({
  fields: {
    feedPosts: (existingPosts = []) => {
      return [newPost, ...existingPosts];
    },
  },
});
```

## 참고 자료

- [Apollo Client 공식 문서](https://www.apollographql.com/docs/react/)
- [GraphQL Code Generator](https://the-guild.dev/graphql/codegen)
- [GraphQL 베스트 프랙티스](https://graphql.org/learn/best-practices/)
