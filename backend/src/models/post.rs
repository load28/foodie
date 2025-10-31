use async_graphql::*;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, Eq, PartialEq, Enum, Copy, sqlx::Type)]
#[sqlx(rename_all = "UPPERCASE")]
pub enum Category {
    #[graphql(name = "KOREAN")]
    Korean,
    #[graphql(name = "WESTERN")]
    Western,
    #[graphql(name = "CHINESE")]
    Chinese,
    #[graphql(name = "JAPANESE")]
    Japanese,
    #[graphql(name = "CAFE")]
    Cafe,
    #[graphql(name = "DESSERT")]
    Dessert,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct FeedPost {
    pub id: String,
    pub author_id: String,
    pub title: String,
    pub content: String,
    pub location: String,
    pub rating: f64,
    pub food_image: Option<String>,
    pub category: Category,
    pub tags: String, // JSON string
    pub likes: i64,
    pub comments_count: i64,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[Object]
impl FeedPost {
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

    async fn title(&self) -> &str {
        &self.title
    }

    async fn content(&self) -> &str {
        &self.content
    }

    async fn location(&self) -> &str {
        &self.location
    }

    async fn rating(&self) -> f64 {
        self.rating
    }

    async fn food_image(&self) -> Option<&str> {
        self.food_image.as_deref()
    }

    async fn category(&self) -> Category {
        self.category
    }

    async fn tags(&self) -> Result<Vec<String>> {
        let tags: Vec<String> = serde_json::from_str(&self.tags)?;
        Ok(tags)
    }

    async fn likes(&self) -> i64 {
        self.likes
    }

    async fn comments(&self) -> i64 {
        self.comments_count
    }

    async fn created_at(&self) -> String {
        self.created_at.to_rfc3339()
    }

    async fn updated_at(&self) -> String {
        self.updated_at.to_rfc3339()
    }

    async fn is_liked_by_current_user(&self, ctx: &Context<'_>) -> Result<bool> {
        let user_id = ctx.data_opt::<String>();

        if let Some(user_id) = user_id {
            let pool = ctx.data::<sqlx::SqlitePool>()?;
            let result = sqlx::query_scalar::<_, i64>(
                "SELECT COUNT(*) FROM post_likes WHERE post_id = ? AND user_id = ?"
            )
            .bind(&self.id)
            .bind(user_id)
            .fetch_one(pool)
            .await?;
            Ok(result > 0)
        } else {
            Ok(false)
        }
    }
}

#[derive(Debug, InputObject)]
pub struct CreateFeedPostInput {
    pub title: String,
    pub content: String,
    pub location: String,
    pub rating: f64,
    pub category: Category,
    pub tags: Vec<String>,
    pub food_image: Option<String>,
}
