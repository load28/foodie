import React, { useEffect, useState } from 'react';
import { useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { LOGIN_WITH_KAKAO } from '@/lib/graphql/mutations';
import './KakaoCallbackPage.scss';

const KakaoCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [loginWithKakao, { loading, error }] = useMutation(LOGIN_WITH_KAKAO);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state');
      const savedState = sessionStorage.getItem('kakao_oauth_state');

      // State 검증 (CSRF 방어)
      if (!state || state !== savedState) {
        console.error('Invalid state parameter');
        setErrorMessage('잘못된 요청입니다. 다시 시도해주세요.');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      if (!code) {
        setErrorMessage('카카오 로그인에 실패했습니다.');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      try {
        const { data } = await loginWithKakao({
          variables: {
            input: { code, state }
          }
        });

        const { sessionId, token, user, isNewUser } = data.loginWithKakao;

        // 세션 저장
        if (sessionId) {
          localStorage.setItem('session_id', sessionId);
        }
        if (token) {
          localStorage.setItem('auth_token', token);
        }
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }

        // State 정리
        sessionStorage.removeItem('kakao_oauth_state');

        // 신규 가입자는 프로필 설정 페이지로, 기존 사용자는 피드로
        if (isNewUser) {
          navigate('/profile/setup');
        } else {
          navigate('/feed');
        }
      } catch (err) {
        console.error('카카오 로그인 실패:', err);
        setErrorMessage('카카오 로그인 처리 중 오류가 발생했습니다.');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [loginWithKakao, navigate]);

  if (errorMessage) {
    return (
      <div className="kakao-callback">
        <div className="kakao-callback__container">
          <div className="kakao-callback__error">
            <svg
              className="kakao-callback__error-icon"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
                fill="currentColor"
              />
            </svg>
            <h2 className="kakao-callback__error-title">{errorMessage}</h2>
            <p className="kakao-callback__error-message">로그인 페이지로 이동합니다...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="kakao-callback">
      <div className="kakao-callback__container">
        <div className="kakao-callback__loading">
          <div className="kakao-callback__spinner"></div>
          <h2 className="kakao-callback__loading-title">
            {loading ? '카카오 로그인 처리 중...' : '로그인 완료'}
          </h2>
          <p className="kakao-callback__loading-message">
            잠시만 기다려주세요
          </p>
        </div>
      </div>
    </div>
  );
};

export default KakaoCallbackPage;
