use redis::aio::ConnectionManager;
use redis::{AsyncCommands, RedisError};
use serde::{Deserialize, Serialize};
use std::env;

/// 세션 데이터 구조
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Session {
    pub user_id: String,
    pub created_at: i64,
}

impl Session {
    pub fn new(user_id: String, created_at: i64) -> Self {
        Self {
            user_id,
            created_at,
        }
    }
}

/// Redis 기반 세션 스토어
#[derive(Clone)]
pub struct RedisSessionStore {
    client: ConnectionManager,
    ttl: usize, // Time To Live in seconds
}

impl RedisSessionStore {
    /// Redis 연결을 초기화합니다.
    pub async fn new() -> Result<Self, RedisError> {
        let redis_url = env::var("REDIS_URL")
            .unwrap_or_else(|_| "redis://127.0.0.1:6379".to_string());

        let ttl = env::var("SESSION_TTL")
            .unwrap_or_else(|_| "86400".to_string()) // 기본값: 24시간
            .parse::<usize>()
            .unwrap_or(86400);

        let client = redis::Client::open(redis_url)?;
        let manager = ConnectionManager::new(client).await?;

        log::info!("Redis Session Store initialized (TTL: {}s)", ttl);

        Ok(Self {
            client: manager,
            ttl,
        })
    }

    /// 세션을 저장합니다.
    pub async fn save_session(
        &self,
        session_id: &str,
        session: &Session,
    ) -> Result<(), RedisError> {
        let mut conn = self.client.clone();
        let session_json = serde_json::to_string(session)
            .map_err(|e| RedisError::from((redis::ErrorKind::TypeError, "Serialization error", e.to_string())))?;

        let key = format!("session:{}", session_id);

        // 세션 데이터 저장 및 TTL 설정
        conn.set_ex(&key, session_json, self.ttl).await?;

        log::debug!("Session saved: {} for user {}", session_id, session.user_id);
        Ok(())
    }

    /// 세션을 조회합니다.
    pub async fn get_session(&self, session_id: &str) -> Result<Option<Session>, RedisError> {
        let mut conn = self.client.clone();
        let key = format!("session:{}", session_id);

        let session_json: Option<String> = conn.get(&key).await?;

        match session_json {
            Some(json) => {
                let session: Session = serde_json::from_str(&json)
                    .map_err(|e| RedisError::from((redis::ErrorKind::TypeError, "Deserialization error", e.to_string())))?;

                log::debug!("Session retrieved: {} for user {}", session_id, session.user_id);
                Ok(Some(session))
            }
            None => {
                log::debug!("Session not found: {}", session_id);
                Ok(None)
            }
        }
    }

    /// 세션을 삭제합니다.
    pub async fn delete_session(&self, session_id: &str) -> Result<(), RedisError> {
        let mut conn = self.client.clone();
        let key = format!("session:{}", session_id);

        conn.del(&key).await?;

        log::debug!("Session deleted: {}", session_id);
        Ok(())
    }

    /// 세션의 TTL을 갱신합니다.
    pub async fn refresh_session(&self, session_id: &str) -> Result<bool, RedisError> {
        let mut conn = self.client.clone();
        let key = format!("session:{}", session_id);

        let exists: bool = conn.expire(&key, self.ttl).await?;

        if exists {
            log::debug!("Session refreshed: {}", session_id);
        } else {
            log::debug!("Session not found for refresh: {}", session_id);
        }

        Ok(exists)
    }

    /// 사용자 ID로 모든 세션을 삭제합니다 (로그아웃 시 유용).
    pub async fn delete_user_sessions(&self, user_id: &str) -> Result<u64, RedisError> {
        let mut conn = self.client.clone();
        let pattern = format!("session:*");

        // 모든 세션 키를 스캔
        let keys: Vec<String> = conn.keys(&pattern).await?;

        let mut deleted_count = 0u64;

        for key in keys {
            if let Ok(Some(session_json)) = conn.get::<_, Option<String>>(&key).await {
                if let Ok(session) = serde_json::from_str::<Session>(&session_json) {
                    if session.user_id == user_id {
                        let _: () = conn.del(&key).await?;
                        deleted_count += 1;
                    }
                }
            }
        }

        log::debug!("Deleted {} sessions for user {}", deleted_count, user_id);
        Ok(deleted_count)
    }

    /// Redis 연결을 테스트합니다.
    pub async fn ping(&self) -> Result<String, RedisError> {
        let mut conn = self.client.clone();
        redis::cmd("PING").query_async(&mut conn).await
    }
}
