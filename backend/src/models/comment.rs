use async_graphql::*;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Comment {
    pub id: String,
    pub post_id: String,
    pub author_id: String,
    pub content: String,
    pub parent_comment_id: Option<String>,
    pub is_reply: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[Object]
impl Comment {
    async fn id(&self) -> &str {
        &self.id
    }

    async fn author(&self, ctx: &Context<'_>) -> Result<crate::models::User> {
        let pool = ctx.data::<sqlx::SqlitePool>()?;
        let user = sqlx::query_as::<_, crate::models::User>(
            "SELECT * FROM users WHERE id = ?"
        )
        .bind(&self.author_id)
        .fetch_one(pool)
        .await?;
        Ok(user)
    }

    async fn content(&self) -> &str {
        &self.content
    }

    async fn created_at(&self) -> String {
        self.created_at.to_rfc3339()
    }

    async fn parent_comment(&self, ctx: &Context<'_>) -> Result<Option<Comment>> {
        if let Some(parent_id) = &self.parent_comment_id {
            let pool = ctx.data::<sqlx::SqlitePool>()?;
            let comment = sqlx::query_as::<_, Comment>(
                "SELECT * FROM comments WHERE id = ?"
            )
            .bind(parent_id)
            .fetch_optional(pool)
            .await?;
            Ok(comment)
        } else {
            Ok(None)
        }
    }

    async fn mentions(&self, ctx: &Context<'_>) -> Result<Vec<crate::models::User>> {
        let pool = ctx.data::<sqlx::SqlitePool>()?;
        let users = sqlx::query_as::<_, crate::models::User>(
            "SELECT u.* FROM users u
             INNER JOIN comment_mentions cm ON u.id = cm.mentioned_user_id
             WHERE cm.comment_id = ?"
        )
        .bind(&self.id)
        .fetch_all(pool)
        .await?;
        Ok(users)
    }

    async fn is_reply(&self) -> bool {
        self.is_reply
    }
}

#[derive(Debug, InputObject)]
pub struct CreateCommentInput {
    pub post_id: String,
    pub content: String,
    pub parent_comment_id: Option<String>,
    pub mentions: Option<Vec<String>>,
}
