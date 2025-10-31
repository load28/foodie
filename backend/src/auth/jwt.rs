use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use std::env;

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String, // user id
    pub exp: i64,    // expiration timestamp
    pub iat: i64,    // issued at timestamp
}

pub fn create_jwt(user_id: &str) -> Result<String, jsonwebtoken::errors::Error> {
    let secret = env::var("JWT_SECRET").unwrap_or_else(|_| "secret".to_string());

    let expiration = Utc::now()
        .checked_add_signed(Duration::days(7))
        .expect("valid timestamp")
        .timestamp();

    let claims = Claims {
        sub: user_id.to_owned(),
        exp: expiration,
        iat: Utc::now().timestamp(),
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
}

pub fn verify_jwt(token: &str) -> Result<Claims, jsonwebtoken::errors::Error> {
    let secret = env::var("JWT_SECRET").unwrap_or_else(|_| "secret".to_string());

    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &Validation::default(),
    )?;

    Ok(token_data.claims)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_jwt() {
        let user_id = "test_user_123";
        let token = create_jwt(user_id).unwrap();

        // JWT 토큰은 3개의 파트로 구성됨 (header.payload.signature)
        let parts: Vec<&str> = token.split('.').collect();
        assert_eq!(parts.len(), 3);
    }

    #[test]
    fn test_verify_jwt_success() {
        let user_id = "test_user_456";
        let token = create_jwt(user_id).unwrap();

        // 토큰 검증
        let claims = verify_jwt(&token).unwrap();
        assert_eq!(claims.sub, user_id);
    }

    #[test]
    fn test_verify_jwt_invalid_token() {
        let invalid_token = "invalid.token.here";

        // 잘못된 토큰 검증 시 에러 발생
        let result = verify_jwt(invalid_token);
        assert!(result.is_err());
    }

    #[test]
    fn test_verify_jwt_tampered_token() {
        let user_id = "test_user_789";
        let token = create_jwt(user_id).unwrap();

        // 토큰을 변조
        let mut tampered_token = token.clone();
        tampered_token.push('X');

        // 변조된 토큰 검증 시 에러 발생
        let result = verify_jwt(&tampered_token);
        assert!(result.is_err());
    }

    #[test]
    fn test_jwt_expiration_claim() {
        let user_id = "test_user_exp";
        let token = create_jwt(user_id).unwrap();

        let claims = verify_jwt(&token).unwrap();

        // 만료 시간이 현재 시간보다 미래여야 함
        assert!(claims.exp > Utc::now().timestamp());

        // 만료 시간이 대략 7일 후여야 함 (±1시간 허용)
        let expected_exp = Utc::now()
            .checked_add_signed(Duration::days(7))
            .unwrap()
            .timestamp();
        let diff = (claims.exp - expected_exp).abs();
        assert!(diff < 3600); // 1시간 이내 오차 허용
    }

    #[test]
    fn test_jwt_issued_at_claim() {
        let user_id = "test_user_iat";
        let before = Utc::now().timestamp();
        let token = create_jwt(user_id).unwrap();
        let after = Utc::now().timestamp();

        let claims = verify_jwt(&token).unwrap();

        // 발급 시간이 현재 시간 범위 내에 있어야 함
        assert!(claims.iat >= before && claims.iat <= after);
    }

    #[test]
    fn test_jwt_user_id_claim() {
        let user_ids = vec![
            "user_1",
            "user_2",
            "user_with_special_chars_!@#",
            "very_long_user_id_".to_string() + &"a".repeat(100),
        ];

        for user_id in user_ids {
            let token = create_jwt(&user_id).unwrap();
            let claims = verify_jwt(&token).unwrap();
            assert_eq!(claims.sub, user_id);
        }
    }

    #[test]
    fn test_jwt_different_tokens() {
        let user_id = "test_user";
        let token1 = create_jwt(user_id).unwrap();

        // 약간의 시간 차이를 두고 생성
        std::thread::sleep(std::time::Duration::from_millis(10));

        let token2 = create_jwt(user_id).unwrap();

        // 같은 user_id라도 iat가 다르므로 토큰이 달라야 함
        assert_ne!(token1, token2);

        // 하지만 두 토큰 모두 검증 가능
        let claims1 = verify_jwt(&token1).unwrap();
        let claims2 = verify_jwt(&token2).unwrap();
        assert_eq!(claims1.sub, user_id);
        assert_eq!(claims2.sub, user_id);
    }
}
