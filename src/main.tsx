import React from 'react'
import ReactDOM from 'react-dom/client'
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client'
import './styles/main.scss'

// Apollo Client 설정
const client = new ApolloClient({
  uri: import.meta.env.VITE_GRAPHQL_URI || '/graphql',
  cache: new InMemoryCache(),
  credentials: 'include', // 세션 쿠키를 위해 필요
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
})

// App 컴포넌트 임시 구현
function App() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>🍔 Foodie</h1>
      <p>음식 리뷰 공유 플랫폼</p>
      <p style={{ color: '#666', fontSize: '0.9rem' }}>
        앱 개발 중입니다. LoginPage와 FeedPage를 구현해주세요.
      </p>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>,
)
