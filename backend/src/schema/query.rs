use async_graphql::*;
use sqlx::SqlitePool;
use crate::models::{User, FeedPost, Comment, Category};

pub struct QueryRoot;

#[Object]
impl QueryRoot {
    /// 현재 로그인한 사용자 정보 조회
    async fn current_user(&self, ctx: &Context<'_>) -> Result<Option<User>> {
        let user_id = ctx.data_opt::<String>();

        if let Some(user_id) = user_id {
            let pool = ctx.data::<SqlitePool>()?;
            let user = sqlx::query_as::<_, User>(
                "SELECT * FROM users WHERE id = ?"
            )
            .bind(user_id)
            .fetch_optional(pool)
            .await?;
            Ok(user)
        } else {
            Ok(None)
        }
    }

    /// 사용자 ID로 사용자 정보 조회
    async fn user(&self, ctx: &Context<'_>, id: String) -> Result<Option<User>> {
        let pool = ctx.data::<SqlitePool>()?;
        let user = sqlx::query_as::<_, User>(
            "SELECT * FROM users WHERE id = ?"
        )
        .bind(id)
        .fetch_optional(pool)
        .await?;
        Ok(user)
    }

    /// 피드 포스트 목록 조회 (페이지네이션, 카테고리 필터 지원)
    async fn feed_posts(
        &self,
        ctx: &Context<'_>,
        #[graphql(default = 20)] limit: i64,
        #[graphql(default = 0)] offset: i64,
        category: Option<Category>,
    ) -> Result<Vec<FeedPost>> {
        let pool = ctx.data::<SqlitePool>()?;

        let posts = if let Some(cat) = category {
            sqlx::query_as::<_, FeedPost>(
                "SELECT * FROM feed_posts WHERE category = ? ORDER BY created_at DESC LIMIT ? OFFSET ?"
            )
            .bind(cat)
            .bind(limit)
            .bind(offset)
            .fetch_all(pool)
            .await?
        } else {
            sqlx::query_as::<_, FeedPost>(
                "SELECT * FROM feed_posts ORDER BY created_at DESC LIMIT ? OFFSET ?"
            )
            .bind(limit)
            .bind(offset)
            .fetch_all(pool)
            .await?
        };

        Ok(posts)
    }

    /// 특정 피드 포스트 조회
    async fn feed_post(&self, ctx: &Context<'_>, id: String) -> Result<Option<FeedPost>> {
        let pool = ctx.data::<SqlitePool>()?;
        let post = sqlx::query_as::<_, FeedPost>(
            "SELECT * FROM feed_posts WHERE id = ?"
        )
        .bind(id)
        .fetch_optional(pool)
        .await?;
        Ok(post)
    }

    /// 특정 포스트의 댓글 목록 조회
    async fn comments(
        &self,
        ctx: &Context<'_>,
        post_id: String,
        #[graphql(default = 50)] limit: i64,
        #[graphql(default = 0)] offset: i64,
    ) -> Result<Vec<Comment>> {
        let pool = ctx.data::<SqlitePool>()?;
        let comments = sqlx::query_as::<_, Comment>(
            "SELECT * FROM comments WHERE post_id = ? ORDER BY created_at ASC LIMIT ? OFFSET ?"
        )
        .bind(post_id)
        .bind(limit)
        .bind(offset)
        .fetch_all(pool)
        .await?;
        Ok(comments)
    }
}
