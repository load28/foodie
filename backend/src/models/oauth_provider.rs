use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

/// OAuth 프로바이더 정보 (카카오)
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct OAuthProvider {
    pub id: i64,
    pub user_id: i64,
    pub provider: String,  // 'kakao'
    pub provider_user_id: String,  // 카카오 회원번호
    pub access_token: Option<String>,  // 암호화된 토큰
    pub refresh_token: Option<String>,  // 암호화된 토큰
    pub token_expires_at: Option<DateTime<Utc>>,
    pub profile_data: Option<String>,  // JSON 문자열
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// OAuth 프로바이더 생성 입력
#[derive(Debug, Clone)]
pub struct CreateOAuthProvider {
    pub user_id: i64,
    pub provider: String,
    pub provider_user_id: String,
    pub access_token: Option<String>,
    pub refresh_token: Option<String>,
    pub token_expires_at: Option<DateTime<Utc>>,
    pub profile_data: Option<String>,
}

impl OAuthProvider {
    /// 데이터베이스에서 카카오 ID로 OAuth 프로바이더 조회
    pub async fn find_by_kakao_id(
        pool: &sqlx::SqlitePool,
        kakao_id: &str,
    ) -> Result<Option<Self>, sqlx::Error> {
        let provider = sqlx::query_as::<_, Self>(
            r#"
            SELECT * FROM oauth_providers
            WHERE provider = 'kakao' AND provider_user_id = ?
            "#,
        )
        .bind(kakao_id)
        .fetch_optional(pool)
        .await?;

        Ok(provider)
    }

    /// 데이터베이스에서 사용자 ID로 OAuth 프로바이더 조회
    pub async fn find_by_user_id(
        pool: &sqlx::SqlitePool,
        user_id: i64,
    ) -> Result<Option<Self>, sqlx::Error> {
        let provider = sqlx::query_as::<_, Self>(
            r#"
            SELECT * FROM oauth_providers
            WHERE user_id = ? AND provider = 'kakao'
            "#,
        )
        .bind(user_id)
        .fetch_optional(pool)
        .await?;

        Ok(provider)
    }

    /// OAuth 프로바이더 생성
    pub async fn create(
        pool: &sqlx::SqlitePool,
        input: CreateOAuthProvider,
    ) -> Result<Self, sqlx::Error> {
        let now = Utc::now();

        let id = sqlx::query(
            r#"
            INSERT INTO oauth_providers
            (user_id, provider, provider_user_id, access_token, refresh_token,
             token_expires_at, profile_data, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            "#,
        )
        .bind(input.user_id)
        .bind(&input.provider)
        .bind(&input.provider_user_id)
        .bind(&input.access_token)
        .bind(&input.refresh_token)
        .bind(input.token_expires_at)
        .bind(&input.profile_data)
        .bind(now)
        .bind(now)
        .execute(pool)
        .await?
        .last_insert_rowid();

        Ok(Self {
            id,
            user_id: input.user_id,
            provider: input.provider,
            provider_user_id: input.provider_user_id,
            access_token: input.access_token,
            refresh_token: input.refresh_token,
            token_expires_at: input.token_expires_at,
            profile_data: input.profile_data,
            created_at: now,
            updated_at: now,
        })
    }

    /// 토큰 업데이트
    pub async fn update_tokens(
        pool: &sqlx::SqlitePool,
        user_id: i64,
        access_token: Option<String>,
        refresh_token: Option<String>,
        expires_at: Option<DateTime<Utc>>,
    ) -> Result<(), sqlx::Error> {
        sqlx::query(
            r#"
            UPDATE oauth_providers
            SET access_token = ?,
                refresh_token = COALESCE(?, refresh_token),
                token_expires_at = ?,
                updated_at = ?
            WHERE user_id = ? AND provider = 'kakao'
            "#,
        )
        .bind(access_token)
        .bind(refresh_token)
        .bind(expires_at)
        .bind(Utc::now())
        .bind(user_id)
        .execute(pool)
        .await?;

        Ok(())
    }

    /// OAuth 프로바이더 삭제
    pub async fn delete(pool: &sqlx::SqlitePool, user_id: i64) -> Result<(), sqlx::Error> {
        sqlx::query(
            r#"
            DELETE FROM oauth_providers
            WHERE user_id = ? AND provider = 'kakao'
            "#,
        )
        .bind(user_id)
        .execute(pool)
        .await?;

        Ok(())
    }
}
