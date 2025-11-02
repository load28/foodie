use async_graphql::*;
use chrono::Utc;
use sqlx::SqlitePool;
use uuid::Uuid;

use crate::auth::{hash_password, verify_password};
use crate::auth::jwt::create_jwt;
use crate::auth::oauth::{KakaoOAuthClient, StateManager, TokenEncryption};
use crate::models::{
    AuthPayload, Comment, CreateCommentInput, CreateFeedPostInput, CreateUserInput,
    FeedPost, LoginInput, User, UserStatus, KakaoLoginUrl, KakaoLoginInput,
    CreateOAuthProvider, OAuthProvider, log_success, log_failure,
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

        // 엔터프라이즈 이미지 처리: 다중 포맷/해상도 생성 + S3 업로드
        let image_urls_json = if let Some(ref data_uri) = input.food_image {
            use crate::storage::{ImageProcessor, ImageVariant, OutputFormat};
            use crate::models::{ImageUrls, ImageFormatUrls};

            // Base64 디코딩
            let image_data = ImageProcessor::decode_data_uri(data_uri)
                .map_err(|e| format!("Failed to decode image: {}", e))?;

            // 모든 변형 생성 (3 해상도 x 2 포맷 = 6개)
            let processed_images = ImageProcessor::process_all_variants(&image_data)
                .map_err(|e| format!("Failed to process images: {}", e))?;

            // S3 클라이언트
            let s3_client = ctx.data::<crate::storage::S3Client>()?;

            // 각 변형별로 S3에 업로드
            let mut url_map = std::collections::HashMap::new();

            for img in processed_images {
                let key = ImageProcessor::generate_s3_key(
                    user_id,
                    &post_id,
                    img.variant,
                    img.format,
                );

                let url = s3_client.upload(&key, img.data, img.format.content_type())
                    .await
                    .map_err(|e| format!("Failed to upload to S3: {}", e))?;

                url_map.insert((img.variant, img.format), url);
            }

            // ImageUrls 구조체 생성
            let image_urls = ImageUrls {
                thumbnail: ImageFormatUrls {
                    webp: url_map.get(&(ImageVariant::Thumbnail, OutputFormat::WebP))
                        .ok_or("Missing thumbnail WebP")?
                        .clone(),
                    jpeg: url_map.get(&(ImageVariant::Thumbnail, OutputFormat::Jpeg))
                        .ok_or("Missing thumbnail JPEG")?
                        .clone(),
                },
                medium: ImageFormatUrls {
                    webp: url_map.get(&(ImageVariant::Medium, OutputFormat::WebP))
                        .ok_or("Missing medium WebP")?
                        .clone(),
                    jpeg: url_map.get(&(ImageVariant::Medium, OutputFormat::Jpeg))
                        .ok_or("Missing medium JPEG")?
                        .clone(),
                },
                large: ImageFormatUrls {
                    webp: url_map.get(&(ImageVariant::Large, OutputFormat::WebP))
                        .ok_or("Missing large WebP")?
                        .clone(),
                    jpeg: url_map.get(&(ImageVariant::Large, OutputFormat::Jpeg))
                        .ok_or("Missing large JPEG")?
                        .clone(),
                },
            };

            Some(serde_json::to_string(&image_urls)?)
        } else {
            None
        };

        sqlx::query(
            "INSERT INTO feed_posts
             (id, author_id, title, content, location, rating, food_image, image_urls, category, tags, likes, comments_count, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?)"
        )
        .bind(&post_id)
        .bind(user_id)
        .bind(&input.title)
        .bind(&input.content)
        .bind(&input.location)
        .bind(input.rating)
        .bind(&input.food_image)
        .bind(&image_urls_json)
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

    /// 친구 요청 취소 (보낸 요청 취소)
    async fn cancel_friend_request(&self, ctx: &Context<'_>, request_id: String) -> Result<bool> {
        let user_id = ctx.data_opt::<String>()
            .ok_or("Unauthorized")?;

        let pool = ctx.data::<SqlitePool>()?;

        // 요청 조회 및 권한 확인
        let request: Option<crate::models::FriendRequest> = sqlx::query_as(
            "SELECT * FROM friend_requests WHERE id = ? AND requester_id = ?"
        )
        .bind(&request_id)
        .bind(user_id)
        .fetch_optional(pool)
        .await?;

        let request = request.ok_or("Friend request not found or unauthorized")?;

        if request.status != crate::models::FriendRequestStatus::Pending {
            return Err("Can only cancel pending requests".into());
        }

        // 요청 삭제
        sqlx::query(
            "DELETE FROM friend_requests WHERE id = ?"
        )
        .bind(&request_id)
        .execute(pool)
        .await?;

        // 수신자의 통계 업데이트 (대기 중인 요청 수 감소)
        self.update_friend_stats(&request.addressee_id, pool).await?;

        Ok(true)
    }

    /// 카카오 로그인 URL 생성
    async fn generate_kakao_login_url(&self, ctx: &Context<'_>) -> Result<KakaoLoginUrl> {
        let client_id = std::env::var("KAKAO_CLIENT_ID")
            .map_err(|_| "KAKAO_CLIENT_ID not configured")?;
        let redirect_uri = std::env::var("KAKAO_REDIRECT_URI")
            .map_err(|_| "KAKAO_REDIRECT_URI not configured")?;
        let client_secret = std::env::var("KAKAO_CLIENT_SECRET").ok();

        let kakao_client = KakaoOAuthClient::new(client_id, client_secret, redirect_uri);

        // State 생성 (CSRF 방어)
        let redis_url = std::env::var("REDIS_URL")
            .unwrap_or_else(|_| "redis://127.0.0.1:6379".to_string());
        let state_manager = StateManager::new(&redis_url)?;

        // IP 주소 가져오기 (프록시 고려)
        let ip = ctx.data_opt::<String>()
            .map(|s| s.as_str())
            .unwrap_or("unknown");

        let state = state_manager.create_state(ip).await?;
        let url = kakao_client.get_authorization_url(&state);

        Ok(KakaoLoginUrl { url, state })
    }

    /// 카카오 로그인
    async fn login_with_kakao(&self, ctx: &Context<'_>, input: KakaoLoginInput) -> Result<AuthPayload> {
        let pool = ctx.data::<SqlitePool>()?;
        let session_store = ctx.data::<RedisSessionStore>()?;

        // IP 주소 및 User-Agent 가져오기
        let ip = ctx.data_opt::<String>()
            .map(|s| s.as_str())
            .unwrap_or("unknown");
        let user_agent = ctx.data_opt::<String>()
            .map(|s| s.as_str());

        // State 검증 (CSRF 방어)
        let redis_url = std::env::var("REDIS_URL")
            .unwrap_or_else(|_| "redis://127.0.0.1:6379".to_string());
        let state_manager = StateManager::new(&redis_url)?;

        let is_valid = state_manager.verify_and_consume_state(&input.state, ip).await?;
        if !is_valid {
            log_failure(pool, None, "kakao_login", Some(ip), user_agent, "Invalid state parameter").await?;
            return Err("Invalid state parameter (CSRF detected)".into());
        }

        // 카카오 OAuth 클라이언트 설정
        let client_id = std::env::var("KAKAO_CLIENT_ID")
            .map_err(|_| "KAKAO_CLIENT_ID not configured")?;
        let redirect_uri = std::env::var("KAKAO_REDIRECT_URI")
            .map_err(|_| "KAKAO_REDIRECT_URI not configured")?;
        let client_secret = std::env::var("KAKAO_CLIENT_SECRET").ok();

        let kakao_client = KakaoOAuthClient::new(client_id, client_secret, redirect_uri);

        // Authorization Code로 Access Token 교환
        let token_response = kakao_client.exchange_code(&input.code).await
            .map_err(|e| {
                log::error!("Failed to exchange Kakao code: {}", e);
                "Failed to exchange Kakao authorization code"
            })?;

        // Access Token으로 사용자 정보 가져오기
        let kakao_user = kakao_client.get_user_info(&token_response.access_token).await
            .map_err(|e| {
                log::error!("Failed to get Kakao user info: {}", e);
                "Failed to get Kakao user information"
            })?;

        let kakao_id = kakao_user.id.to_string();

        // 토큰 암호화
        let encryption_key = std::env::var("OAUTH_ENCRYPTION_KEY")
            .unwrap_or_else(|_| TokenEncryption::generate_key());
        let token_encryption = TokenEncryption::new(&encryption_key)?;

        let encrypted_access = token_encryption.encrypt(&token_response.access_token)?;
        let encrypted_refresh = token_response.refresh_token
            .as_ref()
            .map(|t| token_encryption.encrypt(t))
            .transpose()?;

        // 토큰 만료 시간 계산
        let expires_at = Utc::now() + chrono::Duration::seconds(token_response.expires_in);

        // 카카오 ID로 기존 사용자 조회
        let existing_oauth = OAuthProvider::find_by_kakao_id(pool, &kakao_id).await?;

        let (user, is_new_user) = if let Some(oauth) = existing_oauth {
            // 기존 사용자 - 토큰 업데이트
            OAuthProvider::update_tokens(
                pool,
                oauth.user_id,
                Some(encrypted_access.clone()),
                encrypted_refresh.clone(),
                Some(expires_at),
            ).await?;

            // 사용자 정보 조회
            let user: User = sqlx::query_as(
                "SELECT * FROM users WHERE id = ?"
            )
            .bind(oauth.user_id.to_string())
            .fetch_one(pool)
            .await?;

            (user, false)
        } else {
            // 신규 사용자 - 계정 생성
            let nickname = kakao_user.kakao_account
                .as_ref()
                .and_then(|acc| acc.profile.as_ref())
                .and_then(|p| p.nickname.as_ref())
                .or_else(|| kakao_user.properties.as_ref().and_then(|p| p.nickname.as_ref()))
                .cloned()
                .unwrap_or_else(|| format!("User{}", &kakao_id[..6]));

            let email = kakao_user.kakao_account
                .as_ref()
                .and_then(|acc| acc.email.as_ref())
                .cloned();

            let profile_image = kakao_user.kakao_account
                .as_ref()
                .and_then(|acc| acc.profile.as_ref())
                .and_then(|p| p.profile_image_url.as_ref())
                .or_else(|| kakao_user.properties.as_ref().and_then(|p| p.profile_image.as_ref()))
                .cloned();

            // 초성 추출 (한글 이름의 경우)
            let initial = nickname.chars().next()
                .map(|c| c.to_string())
                .unwrap_or_else(|| "U".to_string());

            let user_id = Uuid::new_v4().to_string();
            let now = Utc::now();

            // 사용자 생성
            sqlx::query(
                r#"
                INSERT INTO users
                (id, email, password_hash, name, initial, profile_image, status,
                 login_method, kakao_id, created_at, updated_at)
                VALUES (?, ?, NULL, ?, ?, ?, 'ONLINE', 'kakao', ?, ?, ?)
                "#
            )
            .bind(&user_id)
            .bind(&email)
            .bind(&nickname)
            .bind(&initial)
            .bind(&profile_image)
            .bind(&kakao_id)
            .bind(now)
            .bind(now)
            .execute(pool)
            .await?;

            // OAuth 프로바이더 생성
            let profile_json = serde_json::to_string(&kakao_user).ok();
            OAuthProvider::create(
                pool,
                CreateOAuthProvider {
                    user_id: user_id.parse::<i64>().unwrap_or(0),
                    provider: "kakao".to_string(),
                    provider_user_id: kakao_id.clone(),
                    access_token: Some(encrypted_access.clone()),
                    refresh_token: encrypted_refresh.clone(),
                    token_expires_at: Some(expires_at),
                    profile_data: profile_json,
                },
            ).await?;

            // 사용자 정보 조회
            let user: User = sqlx::query_as(
                "SELECT * FROM users WHERE id = ?"
            )
            .bind(&user_id)
            .fetch_one(pool)
            .await?;

            (user, true)
        };

        // 세션 생성
        let session_id = generate_session_id();
        let session = Session {
            session_id: session_id.clone(),
            user_id: user.id.clone(),
            created_at: Utc::now(),
        };

        session_store.save_session(&session).await?;

        // JWT 토큰 생성 (하위 호환성)
        let jwt_secret = std::env::var("JWT_SECRET")
            .unwrap_or_else(|_| "default_secret".to_string());
        let token = create_jwt(&user.id, &jwt_secret)?;

        // 감사 로그 기록
        log_success(
            pool,
            Some(user.id.parse::<i64>().unwrap_or(0)),
            "kakao_login",
            Some(ip),
            user_agent,
        ).await?;

        Ok(AuthPayload {
            user,
            token,
            session_id: Some(session_id),
            is_new_user: Some(is_new_user),
        })
    }
}
