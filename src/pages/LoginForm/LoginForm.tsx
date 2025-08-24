import React, { useState } from 'react';
import TextField from '../../components/TextField/TextField';
import Button from '../../components/Button/Button';
import './LoginForm.scss';

interface LoginFormProps {
  onSubmit?: (email: string, password: string) => void;
  isLoading?: boolean;
  error?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  isLoading = false,
  error
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    setEmailError('');
    setPasswordError('');

    let hasError = false;

    if (!email) {
      setEmailError('이메일을 입력해주세요.');
      hasError = true;
    } else if (!validateEmail(email)) {
      setEmailError('올바른 이메일 형식을 입력해주세요.');
      hasError = true;
    }

    if (!password) {
      setPasswordError('비밀번호를 입력해주세요.');
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError('비밀번호는 최소 6자 이상이어야 합니다.');
      hasError = true;
    }

    if (!hasError && onSubmit) {
      onSubmit(email, password);
    }
  };

  return (
    <div className="login-form">
      <div className="login-form__container">
        <div className="login-form__header">
          <h1 className="login-form__title">로그인</h1>
          <p className="login-form__subtitle">FoodieShare에 오신 것을 환영합니다</p>
        </div>

        <form className="login-form__form" onSubmit={handleSubmit}>
          <div className="login-form__fields">
            <TextField
              label="이메일"
              type="email"
              variant="bordered"
              placeholder="이메일을 입력하세요"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              state={emailError ? 'error' : 'default'}
              errorMessage={emailError}
              disabled={isLoading}
            />

            <TextField
              label="비밀번호"
              type="password"
              variant="bordered"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              state={passwordError ? 'error' : 'default'}
              errorMessage={passwordError}
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="login-form__error">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            onClick={() => {}}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;