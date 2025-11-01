use async_graphql::*;
use chrono::Utc;
use sqlx::SqlitePool;
use uuid::Uuid;

use crate::auth::{hash_password, verify_password};
use crate::auth::jwt::create_jwt;
use crate::models::{
    AuthPayload, Comment, CreateCommentInput, CreateFeedPostInput, CreateUserInput,
    FeedPost, LoginInput, User, UserStatus,
};
use crate::search::SearchService;
use crate::session::{generate_session_id, RedisSessionStore, Session};

pub struct MutationRoot;

impl MutationRoot {
    /// 친구 요청 수락 내부 로직
    async fn accept_friend_request_internal(&self, ctx: &Context<'_>, request_id: String) -> Result<bool> {
        let user_id = ctx.data_opt::<String>()
            .ok_or("Unauthorized")?;

        let pool = ctx.data::<SqlitePool>()?;

        // 요청 조회
        let request: Option<crate::models::FriendRequest> = sqlx::query_as(
            "SELECT * FROM friend_requests WHERE id = ? AND addressee_id = ?"
        )
        .bind(&request_id)
        .bind(user_id)
        .fetch_optional(pool)
        .await?;

        let request = request.ok_or("Friend request not found")?;

        if request.status != crate::models::FriendRequestStatus::Pending {
            return Err("Friend request is not pending".into());
        }

        // 친구 관계 생성 (정규화된 ID 사용)
        let (uid, fid) = crate::models::Friendship::normalize_ids(&request.requester_id, &request.addressee_id);
        let now = Utc::now();

        sqlx::query(
            "INSERT INTO friendships (user_id, friend_id, created_at) VALUES (?, ?, ?)"
        )
        .bind(uid)
        .bind(fid)
        .bind(now)
        .execute(pool)
        .await?;

        // 요청 상태 업데이트
        sqlx::query(
            "UPDATE friend_requests SET status = 'ACCEPTED', updated_at = ? WHERE id = ?"
        )
        .bind(now)
        .bind(&request_id)
        .execute(pool)
        .await?;

        // 통계 업데이트
        self.update_friend_stats(&request.requester_id, pool).await?;
        self.update_friend_stats(&request.addressee_id, pool).await?;

        // 캐시 무효화
        if let Ok(cache) = ctx.data::<crate::cache::FriendCache>() {
            let _ = cache.invalidate_both_users(&request.requester_id, &request.addressee_id).await;
        }

        Ok(true)
    }

    /// 친구 통계 업데이트
    async fn update_friend_stats(&self, user_id: &str, pool: &SqlitePool) -> Result<()> {
        // 친구 수 계산
        let friend_count: i64 = sqlx::query_scalar(
            "SELECT COUNT(*) FROM friendships WHERE user_id = ? OR friend_id = ?"
        )
        .bind(user_id)
        .bind(user_id)
        .fetch_one(pool)
        .await?;

        // 대기 중인 요청 수
        let pending_count: i64 = sqlx::query_scalar(
            "SELECT COUNT(*) FROM friend_requests WHERE addressee_id = ? AND status = 'PENDING'"
        )
        .bind(user_id)
        .fetch_one(pool)
        .await?;

        // 통계 업데이트 (upsert)
        sqlx::query(
            "INSERT INTO friend_stats (user_id, friend_count, pending_requests_count, updated_at)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(user_id) DO UPDATE SET
             friend_count = ?,
             pending_requests_count = ?,
             updated_at = ?"
        )
        .bind(user_id)
        .bind(friend_count)
        .bind(pending_count)
        .bind(Utc::now())
        .bind(friend_count)
        .bind(pending_count)
        .bind(Utc::now())
        .execute(pool)
        .await?;

        Ok(())
    }
}

#[Object]
impl MutationRoot {
    /// 회원가입
    async fn register(&self, ctx: &Context<'_>, input: CreateUserInput) -> Result<AuthPayload> {
        let pool = ctx.data::<SqlitePool>()?;
        let session_store = ctx.data::<RedisSessionStore>()?;

        // 이메일 중복 체크
        let existing_user: Option<User> = sqlx::query_as(
            "SELECT * FROM users WHERE email = ?"
        )
        .bind(&input.email)
        .fetch_optional(pool)
        .await?;

        if existing_user.is_some() {
            return Err("Email already exists".into());
        }

        // 비밀번호 해시화
        let password_hash = hash_password(&input.password)
            .map_err(|_| "Failed to hash password")?;

        // 사용자 이름에서 초성 추출 (간단히 첫 글자 사용)
        let initial = input.name.chars().next()
            .map(|c| c.to_string())
            .unwrap_or_else(|| "?".to_string());

        let user_id = Uuid::new_v4().to_string();
        let now = Utc::now();

        // 사용자 생성
        sqlx::query(
            "INSERT INTO users (id, email, password_hash, name, initial, status, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        )
        .bind(&user_id)
        .bind(&input.email)
        .bind(&password_hash)
        .bind(&input.name)
        .bind(&initial)
        .bind(UserStatus::Online)
        .bind(now)
        .bind(now)
        .execute(pool)
        .await?;

        // 생성된 사용자 조회
        let user: User = sqlx::query_as(
            "SELECT * FROM users WHERE id = ?"
        )
        .bind(&user_id)
        .fetch_one(pool)
        .await?;

        // 세션 생성
        let session_id = generate_session_id();
        let session = Session::new(user_id.clone(), now.timestamp());

        session_store.save_session(&session_id, &session)
            .await
            .map_err(|e| format!("Failed to create session: {}", e))?;

        // JWT 토큰도 유지 (하위 호환성)
        let token = create_jwt(&user_id)
            .map_err(|_| "Failed to create token")?;

        // 세션 ID를 토큰으로 반환 (프론트엔드에서 Authorization 헤더로 사용)
        Ok(AuthPayload { user, token: session_id })
    }

    /// 로그인
    async fn login(&self, ctx: &Context<'_>, input: LoginInput) -> Result<AuthPayload> {
        let pool = ctx.data::<SqlitePool>()?;
        let session_store = ctx.data::<RedisSessionStore>()?;

        // 사용자 조회
        let user: Option<User> = sqlx::query_as(
            "SELECT * FROM users WHERE email = ?"
        )
        .bind(&input.email)
        .fetch_optional(pool)
        .await?;

        let user = user.ok_or("Invalid email or password")?;

        // 비밀번호 검증
        let is_valid = verify_password(&input.password, &user.password_hash)
            .map_err(|_| "Failed to verify password")?;

        if !is_valid {
            return Err("Invalid email or password".into());
        }

        // 사용자 상태를 온라인으로 업데이트
        sqlx::query(
            "UPDATE users SET status = ? WHERE id = ?"
        )
        .bind(UserStatus::Online)
        .bind(&user.id)
        .execute(pool)
        .await?;

        // 세션 생성
        let session_id = generate_session_id();
        let now = Utc::now();
        let session = Session::new(user.id.clone(), now.timestamp());

        session_store.save_session(&session_id, &session)
            .await
            .map_err(|e| format!("Failed to create session: {}", e))?;

        // 세션 ID를 토큰으로 반환
        Ok(AuthPayload { user, token: session_id })
    }

    /// 로그아웃
    async fn logout(&self, ctx: &Context<'_>, session_id: Option<String>) -> Result<bool> {
        let user_id = ctx.data_opt::<String>()
            .ok_or("Unauthorized")?;

        let pool = ctx.data::<SqlitePool>()?;
        let session_store = ctx.data::<RedisSessionStore>()?;

        // 사용자 상태를 오프라인으로 업데이트
        sqlx::query(
            "UPDATE users SET status = ? WHERE id = ?"
        )
        .bind(UserStatus::Offline)
        .bind(user_id)
        .execute(pool)
        .await?;

        // 특정 세션 삭제 또는 모든 세션 삭제
        if let Some(sid) = session_id {
            session_store.delete_session(&sid)
                .await
                .map_err(|e| format!("Failed to delete session: {}", e))?;
        } else {
            // 사용자의 모든 세션 삭제
            session_store.delete_user_sessions(user_id)
                .await
                .map_err(|e| format!("Failed to delete user sessions: {}", e))?;
        }

        Ok(true)
    }

    /// 피드 포스트 생성
    async fn create_feed_post(
        &self,
        ctx: &Context<'_>,
        input: CreateFeedPostInput,
    ) -> Result<FeedPost> {
        let user_id = ctx.data_opt::<String>()
            .ok_or("Unauthorized")?;

        let pool = ctx.data::<SqlitePool>()?;

        let post_id = Uuid::new_v4().to_string();
        let now = Utc::now();
        let tags_json = serde_json::to_string(&input.tags)?;

        sqlx::query(
            "INSERT INTO feed_posts
             (id, author_id, title, content, location, rating, food_image, category, tags, likes, comments_count, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?)"
        )
        .bind(&post_id)
        .bind(user_id)
        .bind(&input.title)
        .bind(&input.content)
        .bind(&input.location)
        .bind(input.rating)
        .bind(&input.food_image)
        .bind(input.category)
        .bind(&tags_json)
        .bind(now)
        .bind(now)
        .execute(pool)
        .await?;

        let post: FeedPost = sqlx::query_as(
            "SELECT * FROM feed_posts WHERE id = ?"
        )
        .bind(&post_id)
        .fetch_one(pool)
        .await?;

        // Elasticsearch에 인덱싱
        if let Ok(search_service) = ctx.data::<SearchService>() {
            if let Err(e) = search_service.index_post(&post).await {
                log::warn!("Failed to index post in Elasticsearch: {}", e);
            }
        }

        Ok(post)
    }

    /// 포스트 좋아요 토글
    async fn toggle_post_like(&self, ctx: &Context<'_>, post_id: String) -> Result<bool> {
        let user_id = ctx.data_opt::<String>()
            .ok_or("Unauthorized")?;

        let pool = ctx.data::<SqlitePool>()?;

        // 이미 좋아요를 눌렀는지 확인
        let existing_like: Option<(String,)> = sqlx::query_as(
            "SELECT post_id FROM post_likes WHERE post_id = ? AND user_id = ?"
        )
        .bind(&post_id)
        .bind(user_id)
        .fetch_optional(pool)
        .await?;

        let is_liked = if existing_like.is_some() {
            // 좋아요 취소
            sqlx::query(
                "DELETE FROM post_likes WHERE post_id = ? AND user_id = ?"
            )
            .bind(&post_id)
            .bind(user_id)
            .execute(pool)
            .await?;

            // 좋아요 수 감소
            sqlx::query(
                "UPDATE feed_posts SET likes = likes - 1 WHERE id = ?"
            )
            .bind(&post_id)
            .execute(pool)
            .await?;

            false
        } else {
            // 좋아요 추가
            let now = Utc::now();
            sqlx::query(
                "INSERT INTO post_likes (post_id, user_id, created_at) VALUES (?, ?, ?)"
            )
            .bind(&post_id)
            .bind(user_id)
            .bind(now)
            .execute(pool)
            .await?;

            // 좋아요 수 증가
            sqlx::query(
                "UPDATE feed_posts SET likes = likes + 1 WHERE id = ?"
            )
            .bind(&post_id)
            .execute(pool)
            .await?;

            true
        };

        Ok(is_liked)
    }

    /// 댓글 작성
    async fn create_comment(
        &self,
        ctx: &Context<'_>,
        input: CreateCommentInput,
    ) -> Result<Comment> {
        let user_id = ctx.data_opt::<String>()
            .ok_or("Unauthorized")?;

        let pool = ctx.data::<SqlitePool>()?;

        let comment_id = Uuid::new_v4().to_string();
        let now = Utc::now();
        let is_reply = input.parent_comment_id.is_some();

        // 댓글 생성
        sqlx::query(
            "INSERT INTO comments
             (id, post_id, author_id, content, parent_comment_id, is_reply, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        )
        .bind(&comment_id)
        .bind(&input.post_id)
        .bind(user_id)
        .bind(&input.content)
        .bind(&input.parent_comment_id)
        .bind(is_reply)
        .bind(now)
        .bind(now)
        .execute(pool)
        .await?;

        // 멘션 추가
        if let Some(mentions) = input.mentions {
            for mentioned_user_id in mentions {
                sqlx::query(
                    "INSERT INTO comment_mentions (comment_id, mentioned_user_id) VALUES (?, ?)"
                )
                .bind(&comment_id)
                .bind(&mentioned_user_id)
                .execute(pool)
                .await?;
            }
        }

        // 포스트의 댓글 수 증가
        sqlx::query(
            "UPDATE feed_posts SET comments_count = comments_count + 1 WHERE id = ?"
        )
        .bind(&input.post_id)
        .execute(pool)
        .await?;

        let comment: Comment = sqlx::query_as(
            "SELECT * FROM comments WHERE id = ?"
        )
        .bind(&comment_id)
        .fetch_one(pool)
        .await?;

        Ok(comment)
    }

    /// 댓글 삭제
    async fn delete_comment(&self, ctx: &Context<'_>, comment_id: String) -> Result<bool> {
        let user_id = ctx.data_opt::<String>()
            .ok_or("Unauthorized")?;

        let pool = ctx.data::<SqlitePool>()?;

        // 댓글 조회 및 권한 확인
        let comment: Option<Comment> = sqlx::query_as(
            "SELECT * FROM comments WHERE id = ?"
        )
        .bind(&comment_id)
        .fetch_optional(pool)
        .await?;

        let comment = comment.ok_or("Comment not found")?;

        if &comment.author_id != user_id {
            return Err("Unauthorized".into());
        }

        // 댓글 삭제
        sqlx::query(
            "DELETE FROM comments WHERE id = ?"
        )
        .bind(&comment_id)
        .execute(pool)
        .await?;

        // 포스트의 댓글 수 감소
        sqlx::query(
            "UPDATE feed_posts SET comments_count = comments_count - 1 WHERE id = ?"
        )
        .bind(&comment.post_id)
        .execute(pool)
        .await?;

        Ok(true)
    }

    /// 사용자 프로필 업데이트
    async fn update_user_profile(
        &self,
        ctx: &Context<'_>,
        name: Option<String>,
        profile_image: Option<String>,
    ) -> Result<User> {
        let user_id = ctx.data_opt::<String>()
            .ok_or("Unauthorized")?;

        let pool = ctx.data::<SqlitePool>()?;

        if let Some(name) = name {
            let initial = name.chars().next()
                .map(|c| c.to_string())
                .unwrap_or_else(|| "?".to_string());

            sqlx::query(
                "UPDATE users SET name = ?, initial = ?, updated_at = ? WHERE id = ?"
            )
            .bind(&name)
            .bind(&initial)
            .bind(Utc::now())
            .bind(user_id)
            .execute(pool)
            .await?;
        }

        if let Some(profile_image) = profile_image {
            sqlx::query(
                "UPDATE users SET profile_image = ?, updated_at = ? WHERE id = ?"
            )
            .bind(&profile_image)
            .bind(Utc::now())
            .bind(user_id)
            .execute(pool)
            .await?;
        }

        let user: User = sqlx::query_as(
            "SELECT * FROM users WHERE id = ?"
        )
        .bind(user_id)
        .fetch_one(pool)
        .await?;

        Ok(user)
    }

    /// 친구 요청 보내기
    async fn send_friend_request(&self, ctx: &Context<'_>, addressee_id: String) -> Result<bool> {
        let user_id = ctx.data_opt::<String>()
            .ok_or("Unauthorized")?;

        if user_id == &addressee_id {
            return Err("Cannot send friend request to yourself".into());
        }

        let pool = ctx.data::<SqlitePool>()?;

        // 상대방이 존재하는지 확인
        let addressee_exists: Option<(String,)> = sqlx::query_as(
            "SELECT id FROM users WHERE id = ?"
        )
        .bind(&addressee_id)
        .fetch_optional(pool)
        .await?;

        if addressee_exists.is_none() {
            return Err("User not found".into());
        }

        // 이미 친구인지 확인
        let (uid, fid) = crate::models::Friendship::normalize_ids(user_id, &addressee_id);
        let existing_friendship: Option<(String,)> = sqlx::query_as(
            "SELECT user_id FROM friendships WHERE user_id = ? AND friend_id = ?"
        )
        .bind(uid)
        .bind(fid)
        .fetch_optional(pool)
        .await?;

        if existing_friendship.is_some() {
            return Err("Already friends".into());
        }

        // 기존 요청 확인
        let existing_request: Option<(String,)> = sqlx::query_as(
            "SELECT id FROM friend_requests WHERE requester_id = ? AND addressee_id = ?"
        )
        .bind(user_id)
        .bind(&addressee_id)
        .fetch_optional(pool)
        .await?;

        if existing_request.is_some() {
            return Err("Friend request already sent".into());
        }

        // 역방향 요청 확인 (상대방이 이미 요청을 보낸 경우)
        let reverse_request: Option<crate::models::FriendRequest> = sqlx::query_as(
            "SELECT * FROM friend_requests WHERE requester_id = ? AND addressee_id = ? AND status = 'PENDING'"
        )
        .bind(&addressee_id)
        .bind(user_id)
        .fetch_optional(pool)
        .await?;

        if let Some(req) = reverse_request {
            // 자동으로 수락하고 친구 관계 생성
            return self.accept_friend_request_internal(ctx, req.id).await;
        }

        // 새 친구 요청 생성
        let request_id = uuid::Uuid::new_v4().to_string();
        let now = Utc::now();

        sqlx::query(
            "INSERT INTO friend_requests (id, requester_id, addressee_id, status, created_at, updated_at)
             VALUES (?, ?, ?, 'PENDING', ?, ?)"
        )
        .bind(&request_id)
        .bind(user_id)
        .bind(&addressee_id)
        .bind(now)
        .bind(now)
        .execute(pool)
        .await?;

        // 통계 업데이트
        self.update_friend_stats(&addressee_id, pool).await?;

        Ok(true)
    }

    /// 친구 요청 수락
    async fn accept_friend_request(&self, ctx: &Context<'_>, request_id: String) -> Result<bool> {
        self.accept_friend_request_internal(ctx, request_id).await
    }

    /// 친구 요청 거절
    async fn reject_friend_request(&self, ctx: &Context<'_>, request_id: String) -> Result<bool> {
        let user_id = ctx.data_opt::<String>()
            .ok_or("Unauthorized")?;

        let pool = ctx.data::<SqlitePool>()?;

        // 요청 조회
        let request: Option<crate::models::FriendRequest> = sqlx::query_as(
            "SELECT * FROM friend_requests WHERE id = ? AND addressee_id = ?"
        )
        .bind(&request_id)
        .bind(user_id)
        .fetch_optional(pool)
        .await?;

        let request = request.ok_or("Friend request not found")?;

        // 요청 상태 업데이트
        sqlx::query(
            "UPDATE friend_requests SET status = 'REJECTED', updated_at = ? WHERE id = ?"
        )
        .bind(Utc::now())
        .bind(&request_id)
        .execute(pool)
        .await?;

        // 통계 업데이트
        self.update_friend_stats(user_id, pool).await?;

        Ok(true)
    }

    /// 친구 삭제
    async fn remove_friend(&self, ctx: &Context<'_>, friend_id: String) -> Result<bool> {
        let user_id = ctx.data_opt::<String>()
            .ok_or("Unauthorized")?;

        let pool = ctx.data::<SqlitePool>()?;

        // 정규화된 ID로 친구 관계 삭제
        let (uid, fid) = crate::models::Friendship::normalize_ids(user_id, &friend_id);

        sqlx::query(
            "DELETE FROM friendships WHERE user_id = ? AND friend_id = ?"
        )
        .bind(uid)
        .bind(fid)
        .execute(pool)
        .await?;

        // 통계 업데이트
        self.update_friend_stats(user_id, pool).await?;
        self.update_friend_stats(&friend_id, pool).await?;

        // 캐시 무효화
        if let Ok(cache) = ctx.data::<crate::cache::FriendCache>() {
            let _ = cache.invalidate_both_users(user_id, &friend_id).await;
        }

        Ok(true)
    }
}
