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

    /// 친구 목록 조회 (캐시 적용, 페이지네이션)
    async fn friends(
        &self,
        ctx: &Context<'_>,
        #[graphql(default = 100)] limit: i64,
        #[graphql(default = 0)] offset: i64,
    ) -> Result<Vec<User>> {
        let user_id = ctx.data_opt::<String>()
            .ok_or("Unauthorized")?;

        let pool = ctx.data::<SqlitePool>()?;

        // 정규화된 쿼리: user_id가 양쪽에 있을 수 있음
        let friends = sqlx::query_as::<_, User>(
            "SELECT u.* FROM users u
             WHERE u.id IN (
                 SELECT CASE
                     WHEN f.user_id = ? THEN f.friend_id
                     ELSE f.user_id
                 END AS friend_user_id
                 FROM friendships f
                 WHERE f.user_id = ? OR f.friend_id = ?
             )
             ORDER BY u.name ASC
             LIMIT ? OFFSET ?"
        )
        .bind(user_id)
        .bind(user_id)
        .bind(user_id)
        .bind(limit)
        .bind(offset)
        .fetch_all(pool)
        .await?;

        Ok(friends)
    }

    /// 친구 요청 목록 조회 (받은 요청)
    async fn friend_requests(
        &self,
        ctx: &Context<'_>,
        #[graphql(default = 50)] limit: i64,
        #[graphql(default = 0)] offset: i64,
    ) -> Result<Vec<crate::models::FriendRequest>> {
        let user_id = ctx.data_opt::<String>()
            .ok_or("Unauthorized")?;

        let pool = ctx.data::<SqlitePool>()?;

        let requests = sqlx::query_as::<_, crate::models::FriendRequest>(
            "SELECT * FROM friend_requests
             WHERE addressee_id = ? AND status = 'PENDING'
             ORDER BY created_at DESC
             LIMIT ? OFFSET ?"
        )
        .bind(user_id)
        .bind(limit)
        .bind(offset)
        .fetch_all(pool)
        .await?;

        Ok(requests)
    }

    /// 보낸 친구 요청 목록
    async fn sent_friend_requests(
        &self,
        ctx: &Context<'_>,
        #[graphql(default = 50)] limit: i64,
        #[graphql(default = 0)] offset: i64,
    ) -> Result<Vec<crate::models::FriendRequest>> {
        let user_id = ctx.data_opt::<String>()
            .ok_or("Unauthorized")?;

        let pool = ctx.data::<SqlitePool>()?;

        let requests = sqlx::query_as::<_, crate::models::FriendRequest>(
            "SELECT * FROM friend_requests
             WHERE requester_id = ? AND status = 'PENDING'
             ORDER BY created_at DESC
             LIMIT ? OFFSET ?"
        )
        .bind(user_id)
        .bind(limit)
        .bind(offset)
        .fetch_all(pool)
        .await?;

        Ok(requests)
    }

    /// 친구 통계 조회
    async fn friend_stats(&self, ctx: &Context<'_>) -> Result<Option<crate::models::FriendStats>> {
        let user_id = ctx.data_opt::<String>()
            .ok_or("Unauthorized")?;

        let pool = ctx.data::<SqlitePool>()?;

        let stats = sqlx::query_as::<_, crate::models::FriendStats>(
            "SELECT * FROM friend_stats WHERE user_id = ?"
        )
        .bind(user_id)
        .fetch_optional(pool)
        .await?;

        Ok(stats)
    }

    /// 특정 사용자가 친구인지 확인 (캐시 적용)
    async fn is_friend(&self, ctx: &Context<'_>, friend_id: String) -> Result<bool> {
        let user_id = ctx.data_opt::<String>()
            .ok_or("Unauthorized")?;

        // 캐시 먼저 확인
        if let Ok(cache) = ctx.data::<crate::cache::FriendCache>() {
            if let Ok(Some(result)) = cache.is_friend(user_id, &friend_id).await {
                return Ok(result);
            }
        }

        // 캐시 미스: DB 조회
        let pool = ctx.data::<SqlitePool>()?;
        let (uid, fid) = crate::models::Friendship::normalize_ids(user_id, &friend_id);

        let result = sqlx::query_scalar::<_, i64>(
            "SELECT COUNT(*) FROM friendships WHERE user_id = ? AND friend_id = ?"
        )
        .bind(uid)
        .bind(fid)
        .fetch_one(pool)
        .await?;

        let is_friend = result > 0;

        // 캐시 업데이트
        if let Ok(cache) = ctx.data::<crate::cache::FriendCache>() {
            // 친구 ID 목록을 캐시에 저장하기 위해 조회
            if is_friend {
                let friend_ids: Vec<String> = sqlx::query_scalar(
                    "SELECT CASE
                        WHEN user_id = ? THEN friend_id
                        ELSE user_id
                    END AS friend_user_id
                    FROM friendships
                    WHERE user_id = ? OR friend_id = ?"
                )
                .bind(user_id)
                .bind(user_id)
                .bind(user_id)
                .fetch_all(pool)
                .await?;

                let _ = cache.set_friend_ids(user_id, &friend_ids).await;
            }
        }

        Ok(is_friend)
    }

    /// 친구의 게시물 조회 (캐시 적용)
    async fn friend_posts(
        &self,
        ctx: &Context<'_>,
        #[graphql(default = 20)] limit: i64,
        #[graphql(default = 0)] offset: i64,
    ) -> Result<Vec<FeedPost>> {
        let user_id = ctx.data_opt::<String>()
            .ok_or("Unauthorized")?;

        let pool = ctx.data::<SqlitePool>()?;

        // 캐시에서 친구 ID 목록 조회
        let friend_ids: Vec<String> = if let Ok(cache) = ctx.data::<crate::cache::FriendCache>() {
            if let Ok(Some(ids)) = cache.get_friend_ids(user_id).await {
                ids
            } else {
                // 캐시 미스: DB에서 조회
                let ids: Vec<String> = sqlx::query_scalar(
                    "SELECT CASE
                        WHEN user_id = ? THEN friend_id
                        ELSE user_id
                    END AS friend_user_id
                    FROM friendships
                    WHERE user_id = ? OR friend_id = ?"
                )
                .bind(user_id)
                .bind(user_id)
                .bind(user_id)
                .fetch_all(pool)
                .await?;

                // 캐시에 저장
                let _ = cache.set_friend_ids(user_id, &ids).await;
                ids
            }
        } else {
            // 캐시 사용 불가: DB에서 직접 조회
            sqlx::query_scalar(
                "SELECT CASE
                    WHEN user_id = ? THEN friend_id
                    ELSE user_id
                END AS friend_user_id
                FROM friendships
                WHERE user_id = ? OR friend_id = ?"
            )
            .bind(user_id)
            .bind(user_id)
            .bind(user_id)
            .fetch_all(pool)
            .await?
        };

        if friend_ids.is_empty() {
            return Ok(vec![]);
        }

        // 친구들의 게시물 조회
        let placeholders = friend_ids.iter().map(|_| "?").collect::<Vec<_>>().join(",");
        let query = format!(
            "SELECT * FROM feed_posts
             WHERE author_id IN ({})
             ORDER BY created_at DESC
             LIMIT ? OFFSET ?",
            placeholders
        );

        let mut query_builder = sqlx::query_as::<_, FeedPost>(&query);
        for friend_id in &friend_ids {
            query_builder = query_builder.bind(friend_id);
        }
        query_builder = query_builder.bind(limit).bind(offset);

        let posts = query_builder.fetch_all(pool).await?;

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

    /// 친구 게시물 검색 (Elasticsearch + 캐시)
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

        // 캐시에서 친구 ID 목록 조회
        let friend_ids: Vec<String> = if let Ok(cache) = ctx.data::<crate::cache::FriendCache>() {
            if let Ok(Some(ids)) = cache.get_friend_ids(user_id).await {
                ids
            } else {
                // 캐시 미스: DB에서 조회
                let ids: Vec<String> = sqlx::query_scalar(
                    "SELECT CASE
                        WHEN user_id = ? THEN friend_id
                        ELSE user_id
                    END AS friend_user_id
                    FROM friendships
                    WHERE user_id = ? OR friend_id = ?"
                )
                .bind(user_id)
                .bind(user_id)
                .bind(user_id)
                .fetch_all(pool)
                .await?;

                // 캐시에 저장
                let _ = cache.set_friend_ids(user_id, &ids).await;
                ids
            }
        } else {
            // 캐시 사용 불가: DB에서 직접 조회
            sqlx::query_scalar(
                "SELECT CASE
                    WHEN user_id = ? THEN friend_id
                    ELSE user_id
                END AS friend_user_id
                FROM friendships
                WHERE user_id = ? OR friend_id = ?"
            )
            .bind(user_id)
            .bind(user_id)
            .bind(user_id)
            .fetch_all(pool)
            .await?
        };

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

    /// 사용자 검색 (이름 또는 이메일로 검색)
    async fn search_users(
        &self,
        ctx: &Context<'_>,
        query: String,
        #[graphql(default = 20)] limit: i64,
        #[graphql(default = 0)] offset: i64,
    ) -> Result<Vec<User>> {
        let current_user_id = ctx.data_opt::<String>();
        let pool = ctx.data::<SqlitePool>()?;

        let search_pattern = format!("%{}%", query);

        // 현재 로그인한 사용자는 검색 결과에서 제외
        let users = if let Some(user_id) = current_user_id {
            sqlx::query_as::<_, User>(
                "SELECT * FROM users
                 WHERE (name LIKE ? OR email LIKE ?)
                 AND id != ?
                 ORDER BY name ASC
                 LIMIT ? OFFSET ?"
            )
            .bind(&search_pattern)
            .bind(&search_pattern)
            .bind(user_id)
            .bind(limit)
            .bind(offset)
            .fetch_all(pool)
            .await?
        } else {
            // 로그인하지 않은 경우에도 검색 가능
            sqlx::query_as::<_, User>(
                "SELECT * FROM users
                 WHERE name LIKE ? OR email LIKE ?
                 ORDER BY name ASC
                 LIMIT ? OFFSET ?"
            )
            .bind(&search_pattern)
            .bind(&search_pattern)
            .bind(limit)
            .bind(offset)
            .fetch_all(pool)
            .await?
        };

        Ok(users)
    }
}

#[derive(SimpleObject)]
pub struct SearchPostsResult {
    pub posts: Vec<FeedPost>,
    pub total: i64,
}
