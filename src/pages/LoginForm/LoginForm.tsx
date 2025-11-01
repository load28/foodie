import React from 'react';
import KakaoLoginButton from '../../components/KakaoLoginButton/KakaoLoginButton';
import './LoginForm.scss';

interface LoginFormProps {
  error?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ error }) => {
  return (
    <div className="login-form">
      <div className="login-form__container">
        <div className="login-form__header">
          <h1 className="login-form__title">로그인</h1>
          <p className="login-form__subtitle">FoodieShare에 오신 것을 환영합니다</p>
        </div>

        <div className="login-form__content">
          {error && (
            <div className="login-form__error">
              {error}
            </div>
          )}

          <KakaoLoginButton />

          <p className="login-form__info">
            카카오 계정으로 간편하게 로그인하세요
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
