use async_graphql::*;
use sqlx::SqlitePool;
use crate::models::{User, FeedPost, Comment, Category};
use crate::search::SearchService;

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

    /// 친구 목록 조회
    async fn friends(&self, ctx: &Context<'_>) -> Result<Vec<User>> {
        let user_id = ctx.data_opt::<String>()
            .ok_or("Unauthorized")?;

        let pool = ctx.data::<SqlitePool>()?;

        let friends = sqlx::query_as::<_, User>(
            "SELECT u.* FROM users u
             INNER JOIN friendships f ON u.id = f.friend_id
             WHERE f.user_id = ?
             ORDER BY u.name ASC"
        )
        .bind(user_id)
        .fetch_all(pool)
        .await?;

        Ok(friends)
    }

    /// 특정 사용자가 친구인지 확인
    async fn is_friend(&self, ctx: &Context<'_>, user_id: String) -> Result<bool> {
        let current_user_id = ctx.data_opt::<String>()
            .ok_or("Unauthorized")?;

        let pool = ctx.data::<SqlitePool>()?;

        let result = sqlx::query_scalar::<_, i64>(
            "SELECT COUNT(*) FROM friendships WHERE user_id = ? AND friend_id = ?"
        )
        .bind(current_user_id)
        .bind(&user_id)
        .fetch_one(pool)
        .await?;

        Ok(result > 0)
    }

    /// 친구의 게시물 조회
    async fn friend_posts(
        &self,
        ctx: &Context<'_>,
        #[graphql(default = 20)] limit: i64,
        #[graphql(default = 0)] offset: i64,
    ) -> Result<Vec<FeedPost>> {
        let user_id = ctx.data_opt::<String>()
            .ok_or("Unauthorized")?;

        let pool = ctx.data::<SqlitePool>()?;

        let posts = sqlx::query_as::<_, FeedPost>(
            "SELECT fp.* FROM feed_posts fp
             INNER JOIN friendships f ON fp.author_id = f.friend_id
             WHERE f.user_id = ?
             ORDER BY fp.created_at DESC
             LIMIT ? OFFSET ?"
        )
        .bind(user_id)
        .bind(limit)
        .bind(offset)
        .fetch_all(pool)
        .await?;

        Ok(posts)
    }

    /// 게시물 검색 (Elasticsearch)
    async fn search_posts(
        &self,
        ctx: &Context<'_>,
        query: String,
        category: Option<String>,
        #[graphql(default = 0)] from: i64,
        #[graphql(default = 20)] size: i64,
    ) -> Result<SearchPostsResult> {
        let search_service = ctx.data::<SearchService>()?;
        let pool = ctx.data::<SqlitePool>()?;

        let result = search_service
            .search_posts(&query, category, from, size)
            .await
            .map_err(|e| format!("Search failed: {}", e))?;

        // PostDocument를 FeedPost로 변환
        let mut posts = Vec::new();
        for doc in result.posts {
            if let Ok(post) = sqlx::query_as::<_, FeedPost>("SELECT * FROM feed_posts WHERE id = ?")
                .bind(&doc.id)
                .fetch_one(pool)
                .await
            {
                posts.push(post);
            }
        }

        Ok(SearchPostsResult {
            posts,
            total: result.total,
        })
    }

    /// 친구 게시물 검색 (Elasticsearch)
    async fn search_friend_posts(
        &self,
        ctx: &Context<'_>,
        query: Option<String>,
        #[graphql(default = 0)] from: i64,
        #[graphql(default = 20)] size: i64,
    ) -> Result<SearchPostsResult> {
        let user_id = ctx.data_opt::<String>().ok_or("Unauthorized")?;
        let search_service = ctx.data::<SearchService>()?;
        let pool = ctx.data::<SqlitePool>()?;

        // 친구 ID 목록 조회
        let friend_ids: Vec<String> = sqlx::query_scalar(
            "SELECT friend_id FROM friendships WHERE user_id = ?"
        )
        .bind(user_id)
        .fetch_all(pool)
        .await?;

        if friend_ids.is_empty() {
            return Ok(SearchPostsResult {
                posts: vec![],
                total: 0,
            });
        }

        let result = search_service
            .search_friend_posts(&friend_ids, query.as_deref(), from, size)
            .await
            .map_err(|e| format!("Search failed: {}", e))?;

        // PostDocument를 FeedPost로 변환
        let mut posts = Vec::new();
        for doc in result.posts {
            if let Ok(post) = sqlx::query_as::<_, FeedPost>("SELECT * FROM feed_posts WHERE id = ?")
                .bind(&doc.id)
                .fetch_one(pool)
                .await
            {
                posts.push(post);
            }
        }

        Ok(SearchPostsResult {
            posts,
            total: result.total,
        })
    }
}

#[derive(SimpleObject)]
pub struct SearchPostsResult {
    pub posts: Vec<FeedPost>,
    pub total: i64,
}
