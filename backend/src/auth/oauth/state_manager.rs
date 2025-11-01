use redis::AsyncCommands;
use uuid::Uuid;
use std::error::Error as StdError;

/// OAuth State 관리자 (CSRF 방어)
pub struct StateManager {
    redis_client: redis::Client,
}

impl StateManager {
    pub fn new(redis_url: &str) -> Result<Self, Box<dyn StdError>> {
        let redis_client = redis::Client::open(redis_url)?;
        Ok(Self { redis_client })
    }

    /// State 생성 및 Redis에 저장 (5분 TTL)
    pub async fn create_state(&self, ip_address: &str) -> Result<String, Box<dyn StdError>> {
        let state = Uuid::new_v4().to_string();
        let key = format!("oauth:state:{}", state);

        let mut conn = self.redis_client.get_multiplexed_async_connection().await?;

        // State + IP 주소 저장 (추가 보안)
        let value = serde_json::json!({
            "ip": ip_address,
            "created_at": chrono::Utc::now().to_rfc3339(),
        }).to_string();

        // 5분 TTL
        conn.set_ex(&key, value, 300).await?;

        Ok(state)
    }

    /// State 검증 및 삭제 (일회용)
    pub async fn verify_and_consume_state(
        &self,
        state: &str,
        ip_address: &str,
    ) -> Result<bool, Box<dyn StdError>> {
        let key = format!("oauth:state:{}", state);

        let mut conn = self.redis_client.get_multiplexed_async_connection().await?;

        // State 가져오기
        let value: Option<String> = conn.get(&key).await?;

        match value {
            Some(v) => {
                // State 삭제 (일회용)
                conn.del(&key).await?;

                // IP 주소 검증
                let data: serde_json::Value = serde_json::from_str(&v)?;
                let stored_ip = data["ip"].as_str().unwrap_or("");

                Ok(stored_ip == ip_address)
            }
            None => Ok(false),
        }
    }

    /// State 수동 삭제
    pub async fn delete_state(&self, state: &str) -> Result<(), Box<dyn StdError>> {
        let key = format!("oauth:state:{}", state);
        let mut conn = self.redis_client.get_multiplexed_async_connection().await?;
        conn.del(&key).await?;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    #[ignore] // Redis 필요
    async fn test_state_lifecycle() {
        let manager = StateManager::new("redis://127.0.0.1:6379").unwrap();
        let ip = "127.0.0.1";

        // State 생성
        let state = manager.create_state(ip).await.unwrap();
        assert!(!state.is_empty());

        // State 검증 (성공)
        let is_valid = manager.verify_and_consume_state(&state, ip).await.unwrap();
        assert!(is_valid);

        // State 재사용 (실패 - 일회용)
        let is_valid = manager.verify_and_consume_state(&state, ip).await.unwrap();
        assert!(!is_valid);
    }

    #[tokio::test]
    #[ignore]
    async fn test_state_ip_mismatch() {
        let manager = StateManager::new("redis://127.0.0.1:6379").unwrap();

        let state = manager.create_state("127.0.0.1").await.unwrap();

        // 다른 IP로 검증 (실패)
        let is_valid = manager.verify_and_consume_state(&state, "192.168.1.1").await.unwrap();
        assert!(!is_valid);
    }
}
