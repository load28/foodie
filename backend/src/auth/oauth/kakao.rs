use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::error::Error as StdError;

/// 카카오 토큰 요청 파라미터
#[derive(Debug, Serialize)]
pub struct KakaoTokenRequest {
    pub grant_type: String,
    pub client_id: String,
    pub redirect_uri: String,
    pub code: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub client_secret: Option<String>,
}

/// 카카오 토큰 응답
#[derive(Debug, Deserialize, Clone)]
pub struct KakaoTokenResponse {
    pub access_token: String,
    pub token_type: String,
    pub refresh_token: Option<String>,
    pub expires_in: i64,
    #[serde(default)]
    pub refresh_token_expires_in: Option<i64>,
}

/// 카카오 사용자 정보
#[derive(Debug, Deserialize, Clone)]
pub struct KakaoUserInfo {
    pub id: i64,
    pub connected_at: String,
    #[serde(default)]
    pub kakao_account: Option<KakaoAccount>,
    #[serde(default)]
    pub properties: Option<KakaoProperties>,
}

/// 카카오 계정 정보
#[derive(Debug, Deserialize, Clone)]
pub struct KakaoAccount {
    #[serde(default)]
    pub profile: Option<KakaoProfile>,
    #[serde(default)]
    pub email: Option<String>,
    #[serde(default)]
    pub age_range: Option<String>,
    #[serde(default)]
    pub birthday: Option<String>,
    #[serde(default)]
    pub gender: Option<String>,
}

/// 카카오 프로필
#[derive(Debug, Deserialize, Clone)]
pub struct KakaoProfile {
    #[serde(default)]
    pub nickname: Option<String>,
    #[serde(default)]
    pub profile_image_url: Option<String>,
    #[serde(default)]
    pub thumbnail_image_url: Option<String>,
}

/// 카카오 프로퍼티 (하위 호환)
#[derive(Debug, Deserialize, Clone)]
pub struct KakaoProperties {
    #[serde(default)]
    pub nickname: Option<String>,
    #[serde(default)]
    pub profile_image: Option<String>,
}

/// 카카오 OAuth 클라이언트
pub struct KakaoOAuthClient {
    client: Client,
    client_id: String,
    client_secret: Option<String>,
    redirect_uri: String,
}

impl KakaoOAuthClient {
    /// 새로운 카카오 OAuth 클라이언트 생성
    pub fn new(client_id: String, client_secret: Option<String>, redirect_uri: String) -> Self {
        Self {
            client: Client::new(),
            client_id,
            client_secret,
            redirect_uri,
        }
    }

    /// 카카오 로그인 URL 생성
    pub fn get_authorization_url(&self, state: &str) -> String {
        format!(
            "https://kauth.kakao.com/oauth/authorize?client_id={}&redirect_uri={}&response_type=code&state={}",
            self.client_id,
            urlencoding::encode(&self.redirect_uri),
            state
        )
    }

    /// Authorization Code를 Access Token으로 교환
    pub async fn exchange_code(&self, code: &str) -> Result<KakaoTokenResponse, Box<dyn StdError>> {
        let params = KakaoTokenRequest {
            grant_type: "authorization_code".to_string(),
            client_id: self.client_id.clone(),
            redirect_uri: self.redirect_uri.clone(),
            code: code.to_string(),
            client_secret: self.client_secret.clone(),
        };

        let response = self
            .client
            .post("https://kauth.kakao.com/oauth/token")
            .form(&params)
            .send()
            .await?;

        if !response.status().is_success() {
            let error_body = response.text().await?;
            return Err(format!("Kakao token exchange failed: {}", error_body).into());
        }

        let token_response = response.json::<KakaoTokenResponse>().await?;
        Ok(token_response)
    }

    /// Access Token으로 사용자 정보 가져오기
    pub async fn get_user_info(&self, access_token: &str) -> Result<KakaoUserInfo, Box<dyn StdError>> {
        let response = self
            .client
            .get("https://kapi.kakao.com/v2/user/me")
            .bearer_auth(access_token)
            .send()
            .await?;

        if !response.status().is_success() {
            let error_body = response.text().await?;
            return Err(format!("Failed to get Kakao user info: {}", error_body).into());
        }

        let user_info = response.json::<KakaoUserInfo>().await?;
        Ok(user_info)
    }

    /// Refresh Token으로 Access Token 갱신
    pub async fn refresh_token(&self, refresh_token: &str) -> Result<KakaoTokenResponse, Box<dyn StdError>> {
        let params = [
            ("grant_type", "refresh_token"),
            ("client_id", &self.client_id),
            ("refresh_token", refresh_token),
        ];

        let response = self
            .client
            .post("https://kauth.kakao.com/oauth/token")
            .form(&params)
            .send()
            .await?;

        if !response.status().is_success() {
            let error_body = response.text().await?;
            return Err(format!("Failed to refresh Kakao token: {}", error_body).into());
        }

        let token_response = response.json::<KakaoTokenResponse>().await?;
        Ok(token_response)
    }

    /// 카카오 연결 끊기 (회원 탈퇴 시)
    pub async fn unlink(&self, access_token: &str) -> Result<(), Box<dyn StdError>> {
        let response = self
            .client
            .post("https://kapi.kakao.com/v1/user/unlink")
            .bearer_auth(access_token)
            .send()
            .await?;

        if !response.status().is_success() {
            let error_body = response.text().await?;
            return Err(format!("Failed to unlink Kakao account: {}", error_body).into());
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_authorization_url_generation() {
        let client = KakaoOAuthClient::new(
            "test_client_id".to_string(),
            None,
            "http://localhost:5173/auth/kakao/callback".to_string(),
        );

        let url = client.get_authorization_url("random_state_123");

        assert!(url.contains("client_id=test_client_id"));
        assert!(url.contains("redirect_uri="));
        assert!(url.contains("state=random_state_123"));
        assert!(url.contains("response_type=code"));
    }
}
