use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

/// 감사 로그 (모든 인증 이벤트 기록)
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct AuditLog {
    pub id: i64,
    pub user_id: Option<i64>,
    pub event_type: String,  // 'kakao_login', 'logout', 'token_refresh'
    pub ip_address: Option<String>,
    pub user_agent: Option<String>,
    pub metadata: Option<String>,  // JSON
    pub status: String,  // 'success', 'failure'
    pub error_message: Option<String>,
    pub created_at: DateTime<Utc>,
}

/// 감사 로그 생성 입력
#[derive(Debug, Clone)]
pub struct CreateAuditLog {
    pub user_id: Option<i64>,
    pub event_type: String,
    pub ip_address: Option<String>,
    pub user_agent: Option<String>,
    pub metadata: Option<String>,
    pub status: String,
    pub error_message: Option<String>,
}

impl AuditLog {
    /// 감사 로그 생성
    pub async fn create(
        pool: &sqlx::SqlitePool,
        input: CreateAuditLog,
    ) -> Result<Self, sqlx::Error> {
        let now = Utc::now();

        let id = sqlx::query(
            r#"
            INSERT INTO audit_logs
            (user_id, event_type, ip_address, user_agent, metadata, status, error_message, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            "#,
        )
        .bind(input.user_id)
        .bind(&input.event_type)
        .bind(&input.ip_address)
        .bind(&input.user_agent)
        .bind(&input.metadata)
        .bind(&input.status)
        .bind(&input.error_message)
        .bind(now)
        .execute(pool)
        .await?
        .last_insert_rowid();

        Ok(Self {
            id,
            user_id: input.user_id,
            event_type: input.event_type,
            ip_address: input.ip_address,
            user_agent: input.user_agent,
            metadata: input.metadata,
            status: input.status,
            error_message: input.error_message,
            created_at: now,
        })
    }

    /// 사용자별 감사 로그 조회
    pub async fn find_by_user(
        pool: &sqlx::SqlitePool,
        user_id: i64,
        limit: i64,
        offset: i64,
    ) -> Result<Vec<Self>, sqlx::Error> {
        let logs = sqlx::query_as::<_, Self>(
            r#"
            SELECT * FROM audit_logs
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
            "#,
        )
        .bind(user_id)
        .bind(limit)
        .bind(offset)
        .fetch_all(pool)
        .await?;

        Ok(logs)
    }

    /// 이벤트 타입별 감사 로그 조회
    pub async fn find_by_event_type(
        pool: &sqlx::SqlitePool,
        event_type: &str,
        limit: i64,
        offset: i64,
    ) -> Result<Vec<Self>, sqlx::Error> {
        let logs = sqlx::query_as::<_, Self>(
            r#"
            SELECT * FROM audit_logs
            WHERE event_type = ?
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
            "#,
        )
        .bind(event_type)
        .bind(limit)
        .bind(offset)
        .fetch_all(pool)
        .await?;

        Ok(logs)
    }

    /// 실패한 로그인 시도 조회 (보안 모니터링)
    pub async fn find_failed_attempts(
        pool: &sqlx::SqlitePool,
        ip_address: &str,
        minutes: i64,
    ) -> Result<Vec<Self>, sqlx::Error> {
        let since = Utc::now() - chrono::Duration::minutes(minutes);

        let logs = sqlx::query_as::<_, Self>(
            r#"
            SELECT * FROM audit_logs
            WHERE ip_address = ?
              AND status = 'failure'
              AND event_type LIKE '%login%'
              AND created_at >= ?
            ORDER BY created_at DESC
            "#,
        )
        .bind(ip_address)
        .bind(since)
        .fetch_all(pool)
        .await?;

        Ok(logs)
    }

    /// 최근 감사 로그 조회 (관리자용)
    pub async fn find_recent(
        pool: &sqlx::SqlitePool,
        limit: i64,
    ) -> Result<Vec<Self>, sqlx::Error> {
        let logs = sqlx::query_as::<_, Self>(
            r#"
            SELECT * FROM audit_logs
            ORDER BY created_at DESC
            LIMIT ?
            "#,
        )
        .bind(limit)
        .fetch_all(pool)
        .await?;

        Ok(logs)
    }
}

/// 헬퍼 함수: 성공 로그 생성
pub async fn log_success(
    pool: &sqlx::SqlitePool,
    user_id: Option<i64>,
    event_type: &str,
    ip: Option<&str>,
    user_agent: Option<&str>,
) -> Result<(), sqlx::Error> {
    AuditLog::create(
        pool,
        CreateAuditLog {
            user_id,
            event_type: event_type.to_string(),
            ip_address: ip.map(|s| s.to_string()),
            user_agent: user_agent.map(|s| s.to_string()),
            metadata: None,
            status: "success".to_string(),
            error_message: None,
        },
    )
    .await?;

    Ok(())
}

/// 헬퍼 함수: 실패 로그 생성
pub async fn log_failure(
    pool: &sqlx::SqlitePool,
    user_id: Option<i64>,
    event_type: &str,
    ip: Option<&str>,
    user_agent: Option<&str>,
    error: &str,
) -> Result<(), sqlx::Error> {
    AuditLog::create(
        pool,
        CreateAuditLog {
            user_id,
            event_type: event_type.to_string(),
            ip_address: ip.map(|s| s.to_string()),
            user_agent: user_agent.map(|s| s.to_string()),
            metadata: None,
            status: "failure".to_string(),
            error_message: Some(error.to_string()),
        },
    )
    .await?;

    Ok(())
}
