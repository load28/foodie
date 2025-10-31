import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { LOGIN, REGISTER, LOGOUT } from '../lib/graphql/mutations';
import { GET_CURRENT_USER } from '../lib/graphql/queries';

interface User {
  id: string;
  email: string;
  name: string;
  initial: string;
  profileImage: string | null;
  status: 'ONLINE' | 'AWAY' | 'OFFLINE';
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 현재 사용자 정보 조회
  const { data, loading, refetch } = useQuery(GET_CURRENT_USER, {
    skip: !localStorage.getItem('auth_token'),
    onCompleted: (data) => {
      if (data?.currentUser) {
        setUser(data.currentUser);
      }
    },
    onError: (err) => {
      console.error('Failed to fetch current user:', err);
      localStorage.removeItem('auth_token');
      setUser(null);
    },
  });

  // 로그인 뮤테이션
  const [loginMutation, { loading: loginLoading }] = useMutation(LOGIN, {
    onCompleted: (data) => {
      const { sessionId, user } = data.login;
      localStorage.setItem('auth_token', sessionId);
      setUser(user);
      setError(null);
    },
    onError: (err) => {
      setError(err.message);
      console.error('Login error:', err);
    },
  });

  // 회원가입 뮤테이션
  const [registerMutation, { loading: registerLoading }] = useMutation(REGISTER, {
    onCompleted: (data) => {
      const { sessionId, user } = data.register;
      localStorage.setItem('auth_token', sessionId);
      setUser(user);
      setError(null);
    },
    onError: (err) => {
      setError(err.message);
      console.error('Register error:', err);
    },
  });

  // 로그아웃 뮤테이션
  const [logoutMutation] = useMutation(LOGOUT, {
    onCompleted: () => {
      localStorage.removeItem('auth_token');
      setUser(null);
      setError(null);
    },
    onError: (err) => {
      console.error('Logout error:', err);
      // 에러가 발생해도 로컬 상태는 초기화
      localStorage.removeItem('auth_token');
      setUser(null);
    },
  });

  const login = async (email: string, password: string) => {
    setError(null);
    await loginMutation({
      variables: {
        input: { email, password },
      },
    });
  };

  const register = async (email: string, password: string, name: string) => {
    setError(null);
    await registerMutation({
      variables: {
        input: { email, password, name },
      },
    });
  };

  const logout = async () => {
    setError(null);
    await logoutMutation();
  };

  // 토큰이 있을 때 자동으로 사용자 정보 가져오기
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token && !user) {
      refetch();
    }
  }, []);

  const value: AuthContextType = {
    user,
    loading: loading || loginLoading || registerLoading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
