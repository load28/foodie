use async_graphql::*;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Copy, Serialize, Deserialize, sqlx::Type, Eq, PartialEq, Enum)]
#[sqlx(type_name = "TEXT")]
pub enum FriendRequestStatus {
    #[sqlx(rename = "PENDING")]
    Pending,
    #[sqlx(rename = "ACCEPTED")]
    Accepted,
    #[sqlx(rename = "REJECTED")]
    Rejected,
    #[sqlx(rename = "BLOCKED")]
    Blocked,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct FriendRequest {
    pub id: String,
    pub requester_id: String,
    pub addressee_id: String,
    pub status: FriendRequestStatus,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[Object]
impl FriendRequest {
    async fn id(&self) -> &str {
        &self.id
    }

    async fn requester(&self, ctx: &Context<'_>) -> Result<crate::models::User> {
        let pool = ctx.data::<sqlx::SqlitePool>()?;
        let user = sqlx::query_as::<_, crate::models::User>("SELECT * FROM users WHERE id = ?")
            .bind(&self.requester_id)
            .fetch_one(pool)
            .await?;
        Ok(user)
    }

    async fn addressee(&self, ctx: &Context<'_>) -> Result<crate::models::User> {
        let pool = ctx.data::<sqlx::SqlitePool>()?;
        let user = sqlx::query_as::<_, crate::models::User>("SELECT * FROM users WHERE id = ?")
            .bind(&self.addressee_id)
            .fetch_one(pool)
            .await?;
        Ok(user)
    }

    async fn status(&self) -> FriendRequestStatus {
        self.status
    }

    async fn created_at(&self) -> String {
        self.created_at.to_rfc3339()
    }

    async fn updated_at(&self) -> String {
        self.updated_at.to_rfc3339()
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct FriendStats {
    pub user_id: String,
    pub friend_count: i64,
    pub pending_requests_count: i64,
    pub updated_at: DateTime<Utc>,
}

#[Object]
impl FriendStats {
    async fn user_id(&self) -> &str {
        &self.user_id
    }

    async fn friend_count(&self) -> i64 {
        self.friend_count
    }

    async fn pending_requests_count(&self) -> i64 {
        self.pending_requests_count
    }

    async fn updated_at(&self) -> String {
        self.updated_at.to_rfc3339()
    }
}
