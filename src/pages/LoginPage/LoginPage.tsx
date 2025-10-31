import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoginForm from '../LoginForm/LoginForm';

const LoginPage: React.FC = () => {
  const { login, loading, error } = useAuth();

  const handleSubmit = async (email: string, password: string) => {
    try {
      await login(email, password);
      // 로그인 성공 시 리다이렉트는 AuthContext에서 처리
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <LoginForm
      onSubmit={handleSubmit}
      isLoading={loading}
      error={error || undefined}
    />
  );
};

export default LoginPage;
