use async_graphql::*;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

/// 이미지 포맷별 URL
///
/// 엔터프라이즈 전략: 브라우저가 최적 포맷 선택 (Picture 엘리먼트)
#[derive(Debug, Clone, Serialize, Deserialize, SimpleObject)]
pub struct ImageFormatUrls {
    /// WebP 포맷 URL (30% 더 나은 압축)
    pub webp: String,
    /// JPEG 포맷 URL (폴백용)
    pub jpeg: String,
}

/// 반응형 이미지 URL 세트
///
/// 엔터프라이즈 전략: 다중 해상도로 네트워크 대역폭 최적화
#[derive(Debug, Clone, Serialize, Deserialize, SimpleObject)]
pub struct ImageUrls {
    /// 썸네일 (300px) - 피드 목록용
    pub thumbnail: ImageFormatUrls,
    /// 중간 (800px) - 모바일 상세 보기
    pub medium: ImageFormatUrls,
    /// 대형 (1920px) - 데스크톱 고해상도
    pub large: ImageFormatUrls,
}

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
    /// 다중 포맷/해상도 이미지 URL (JSON 문자열)
    pub image_urls: Option<String>,
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

    /// 반응형 이미지 URL (다중 포맷/해상도)
    ///
    /// 엔터프라이즈 전략: Picture 엘리먼트에서 사용
    async fn image_urls(&self) -> Option<ImageUrls> {
        if let Some(ref json_str) = self.image_urls {
            serde_json::from_str(json_str).ok()
        } else {
            None
        }
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
