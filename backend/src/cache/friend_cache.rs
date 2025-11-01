use redis::{AsyncCommands, RedisError};
use serde::{Deserialize, Serialize};
use std::time::Duration;

const FRIEND_LIST_PREFIX: &str = "friends:";
const FRIEND_IDS_PREFIX: &str = "friend_ids:";
const FRIEND_COUNT_PREFIX: &str = "friend_count:";
const CACHE_TTL: u64 = 3600; // 1시간

#[derive(Clone)]
pub struct FriendCache {
    redis_client: redis::Client,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CachedFriendList {
    pub friend_ids: Vec<String>,
    pub count: i64,
}

impl FriendCache {
    pub fn new(redis_url: &str) -> Result<Self, RedisError> {
        let redis_client = redis::Client::open(redis_url)?;
        Ok(Self { redis_client })
    }

    /// 친구 ID 목록 캐싱
    pub async fn get_friend_ids(&self, user_id: &str) -> Result<Option<Vec<String>>, RedisError> {
        let mut conn = self.redis_client.get_multiplexed_async_connection().await?;
        let key = format!("{}{}", FRIEND_IDS_PREFIX, user_id);

        let result: Option<String> = conn.get(&key).await?;
        if let Some(data) = result {
            let friend_ids: Vec<String> = serde_json::from_str(&data).unwrap_or_default();
            Ok(Some(friend_ids))
        } else {
            Ok(None)
        }
    }

    /// 친구 ID 목록 캐시 저장
    pub async fn set_friend_ids(&self, user_id: &str, friend_ids: &[String]) -> Result<(), RedisError> {
        let mut conn = self.redis_client.get_multiplexed_async_connection().await?;
        let key = format!("{}{}", FRIEND_IDS_PREFIX, user_id);
        let data = serde_json::to_string(friend_ids).unwrap_or_default();

        conn.set_ex(&key, data, CACHE_TTL).await?;
        Ok(())
    }

    /// 친구 수 캐싱
    pub async fn get_friend_count(&self, user_id: &str) -> Result<Option<i64>, RedisError> {
        let mut conn = self.redis_client.get_multiplexed_async_connection().await?;
        let key = format!("{}{}", FRIEND_COUNT_PREFIX, user_id);

        conn.get(&key).await
    }

    /// 친구 수 캐시 저장
    pub async fn set_friend_count(&self, user_id: &str, count: i64) -> Result<(), RedisError> {
        let mut conn = self.redis_client.get_multiplexed_async_connection().await?;
        let key = format!("{}{}", FRIEND_COUNT_PREFIX, user_id);

        conn.set_ex(&key, count, CACHE_TTL).await?;
        Ok(())
    }

    /// 특정 사용자의 캐시 무효화
    pub async fn invalidate_user_cache(&self, user_id: &str) -> Result<(), RedisError> {
        let mut conn = self.redis_client.get_multiplexed_async_connection().await?;

        let keys = vec![
            format!("{}{}", FRIEND_IDS_PREFIX, user_id),
            format!("{}{}", FRIEND_COUNT_PREFIX, user_id),
            format!("{}{}", FRIEND_LIST_PREFIX, user_id),
        ];

        for key in keys {
            let _: () = conn.del(&key).await.unwrap_or(());
        }

        Ok(())
    }

    /// 두 사용자의 캐시 무효화 (친구 추가/삭제 시)
    pub async fn invalidate_both_users(&self, user_id1: &str, user_id2: &str) -> Result<(), RedisError> {
        self.invalidate_user_cache(user_id1).await?;
        self.invalidate_user_cache(user_id2).await?;
        Ok(())
    }

    /// 친구 여부 확인 (빠른 조회)
    pub async fn is_friend(&self, user_id: &str, friend_id: &str) -> Result<Option<bool>, RedisError> {
        if let Some(friend_ids) = self.get_friend_ids(user_id).await? {
            Ok(Some(friend_ids.contains(&friend_id.to_string())))
        } else {
            Ok(None)
        }
    }
}
