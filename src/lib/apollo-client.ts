import { ApolloClient, InMemoryCache, HttpLink, ApolloLink, concat } from '@apollo/client';
import { onError } from '@apollo/client/link/error';

const httpLink = new HttpLink({
  uri: import.meta.env.VITE_GRAPHQL_API_URL || 'http://127.0.0.1:8080/graphql',
});

// 인증 미들웨어 - 모든 요청에 세션 토큰 추가
const authMiddleware = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem('auth_token');

  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    }
  }));

  return forward(operation);
});

// 에러 핸들링 링크
const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${JSON.stringify(locations)}, Path: ${path}`
      );

      // 인증 에러 처리
      if (extensions?.code === 'UNAUTHORIZED' || message.includes('Unauthorized')) {
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      }
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

// Apollo Client 인스턴스 생성
export const apolloClient = new ApolloClient({
  link: ApolloLink.from([errorLink, concat(authMiddleware, httpLink)]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          feedPosts: {
            keyArgs: ['category'],
            merge(existing = { posts: [], total: 0 }, incoming) {
              return {
                posts: [...existing.posts, ...incoming.posts],
                total: incoming.total,
              };
            },
          },
          comments: {
            keyArgs: ['postId'],
            merge(existing = { comments: [], total: 0 }, incoming) {
              return {
                comments: [...existing.comments, ...incoming.comments],
                total: incoming.total,
              };
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});
