use async_graphql::*;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Friendship {
    pub user_id: String,
    pub friend_id: String,
    pub created_at: DateTime<Utc>,
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
