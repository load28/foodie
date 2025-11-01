import React from 'react';
import { useMutation } from '@apollo/client';
import { GENERATE_KAKAO_LOGIN_URL } from '@/lib/graphql/mutations';
import './KakaoLoginButton.scss';

interface KakaoLoginButtonProps {
  disabled?: boolean;
}

const KakaoLoginButton: React.FC<KakaoLoginButtonProps> = ({ disabled }) => {
  const [generateUrl, { loading }] = useMutation(GENERATE_KAKAO_LOGIN_URL);

  const handleKakaoLogin = async () => {
    try {
      const { data } = await generateUrl();
      const { url, state } = data.generateKakaoLoginUrl;

      // State를 세션 스토리지에 저장 (CSRF 방어)
      sessionStorage.setItem('kakao_oauth_state', state);

      // 카카오 로그인 페이지로 리다이렉트
      window.location.href = url;
    } catch (error) {
      console.error('카카오 로그인 URL 생성 실패:', error);
      alert('카카오 로그인 URL을 생성하는 중 오류가 발생했습니다.');
    }
  };

  return (
    <button
      onClick={handleKakaoLogin}
      disabled={disabled || loading}
      className="kakao-login-btn"
      aria-label="카카오 로그인"
    >
      <svg
        className="kakao-login-btn__icon"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 3C6.477 3 2 6.477 2 10.8C2 13.644 3.878 16.152 6.695 17.598L5.5 21.5L9.807 18.914C10.5 18.971 11.244 19 12 19C17.523 19 22 15.523 22 11.7C22 7.377 17.523 3 12 3Z"
          fill="currentColor"
        />
      </svg>
      <span className="kakao-login-btn__text">
        {loading ? '로딩 중...' : '카카오로 시작하기'}
      </span>
    </button>
  );
};

export default KakaoLoginButton;
