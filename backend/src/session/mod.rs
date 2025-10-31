mod redis_store;
pub mod middleware;

pub use redis_store::{RedisSessionStore, Session};

use uuid::Uuid;

/// 세션 ID를 생성합니다.
pub fn generate_session_id() -> String {
    Uuid::new_v4().to_string()
}
