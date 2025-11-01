use async_graphql::*;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

/// Friendship 레코드 - user_id < friend_id 규칙으로 단방향 저장
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Friendship {
    pub user_id: String,
    pub friend_id: String,
    pub created_at: DateTime<Utc>,
}

impl Friendship {
    /// 두 사용자 ID를 정렬하여 (smaller, larger) 반환
    pub fn normalize_ids(id1: &str, id2: &str) -> (&str, &str) {
        if id1 < id2 {
            (id1, id2)
        } else {
            (id2, id1)
        }
    }

    /// 정규화된 ID로 새 Friendship 생성
    pub fn new(user_id: String, friend_id: String) -> Self {
        let (uid, fid) = Self::normalize_ids(&user_id, &friend_id);
        Self {
            user_id: uid.to_string(),
            friend_id: fid.to_string(),
            created_at: Utc::now(),
        }
    }
}

#[Object]
impl Friendship {
    async fn user(&self, ctx: &Context<'_>) -> Result<crate::models::User> {
        let pool = ctx.data::<sqlx::SqlitePool>()?;
        let user = sqlx::query_as::<_, crate::models::User>("SELECT * FROM users WHERE id = ?")
            .bind(&self.user_id)
            .fetch_one(pool)
            .await?;
        Ok(user)
    }

    async fn friend(&self, ctx: &Context<'_>) -> Result<crate::models::User> {
        let pool = ctx.data::<sqlx::SqlitePool>()?;
        let friend = sqlx::query_as::<_, crate::models::User>("SELECT * FROM users WHERE id = ?")
            .bind(&self.friend_id)
            .fetch_one(pool)
            .await?;
        Ok(friend)
    }

    async fn created_at(&self) -> String {
        self.created_at.to_rfc3339()
    }
}
