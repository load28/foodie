use actix_web::HttpRequest;
use crate::session::RedisSessionStore;

/// HTTP 요청에서 세션 ID를 추출합니다.
/// Authorization 헤더에서 "Bearer {session_id}" 형식으로 전달됩니다.
pub fn extract_session_id(req: &HttpRequest) -> Option<String> {
    req.headers()
        .get("Authorization")
        .and_then(|auth_header| auth_header.to_str().ok())
        .and_then(|auth_str| {
            if auth_str.starts_with("Bearer ") {
                Some(auth_str[7..].to_string())
            } else {
                None
            }
        })
}

/// 세션 ID를 검증하고 사용자 ID를 반환합니다.
pub async fn verify_session(
    store: &RedisSessionStore,
    session_id: &str,
) -> Result<String, String> {
    match store.get_session(session_id).await {
        Ok(Some(session)) => {
            // 세션 TTL 갱신
            let _ = store.refresh_session(session_id).await;
            Ok(session.user_id)
        }
        Ok(None) => Err("Session not found or expired".to_string()),
        Err(e) => Err(format!("Session verification failed: {}", e)),
    }
}
