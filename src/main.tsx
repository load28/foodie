import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client'
import { LoginPage } from './pages/LoginPage/LoginPage'
import { FeedPage } from './pages/FeedPage/FeedPage'
import { FriendsPage } from './pages/FriendsPage/FriendsPage'
import { SearchPage } from './pages/SearchPage/SearchPage'
import { Home, Users, Search, LogOut } from 'lucide-react'
import './styles/main.scss'

// Apollo Client 설정
const client = new ApolloClient({
  uri: import.meta.env.VITE_GRAPHQL_URI || 'http://localhost:8080/graphql',
  cache: new InMemoryCache(),
  credentials: 'include', // 세션 쿠키를 위해 필요
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
})

type Page = 'login' | 'feed' | 'friends' | 'search'

// App 컴포넌트
function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login')
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleLogin = () => {
    setIsLoggedIn(true)
    setCurrentPage('feed')
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setCurrentPage('login')
  }

  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLogin} />
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* 네비게이션 */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '16px 24px',
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
      }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0, marginRight: 'auto' }}>
          🍔 Foodie
        </h1>
        <button
          onClick={() => setCurrentPage('feed')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            background: currentPage === 'feed' ? '#3b82f6' : 'transparent',
            color: currentPage === 'feed' ? 'white' : '#6b7280',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
            transition: 'all 0.2s'
          }}
        >
          <Home size={18} />
          피드
        </button>
        <button
          onClick={() => setCurrentPage('friends')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            background: currentPage === 'friends' ? '#3b82f6' : 'transparent',
            color: currentPage === 'friends' ? 'white' : '#6b7280',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
            transition: 'all 0.2s'
          }}
        >
          <Users size={18} />
          친구
        </button>
        <button
          onClick={() => setCurrentPage('search')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            background: currentPage === 'search' ? '#3b82f6' : 'transparent',
            color: currentPage === 'search' ? 'white' : '#6b7280',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
            transition: 'all 0.2s'
          }}
        >
          <Search size={18} />
          검색
        </button>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            background: 'transparent',
            color: '#ef4444',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
            transition: 'all 0.2s'
          }}
        >
          <LogOut size={18} />
          로그아웃
        </button>
      </nav>

      {/* 페이지 컨텐츠 */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {currentPage === 'feed' && <FeedPage />}
        {currentPage === 'friends' && <FriendsPage />}
        {currentPage === 'search' && <SearchPage />}
      </div>
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
