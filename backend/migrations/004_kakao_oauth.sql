-- Migration: 카카오 OAuth 로그인 시스템
-- Date: 2025-11-01
-- Description: 카카오 OAuth 인증을 위한 테이블 및 감사 로그 추가

-- 1. OAuth Providers 테이블
-- 카카오 OAuth 연결 정보 저장
CREATE TABLE IF NOT EXISTS oauth_providers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    provider VARCHAR(20) NOT NULL DEFAULT 'kakao',
    provider_user_id VARCHAR(255) NOT NULL,  -- 카카오 회원번호
    access_token TEXT,  -- 암호화 저장
    refresh_token TEXT,  -- 암호화 저장
    token_expires_at DATETIME,
    profile_data TEXT,  -- JSON: 카카오 프로필 정보
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(provider, provider_user_id)
);

CREATE INDEX idx_oauth_user_id ON oauth_providers(user_id);
CREATE INDEX idx_oauth_provider_user ON oauth_providers(provider, provider_user_id);

-- 2. Audit Logs 테이블
-- 모든 인증 이벤트 기록
CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    event_type VARCHAR(50) NOT NULL,  -- 'kakao_login', 'logout', 'token_refresh'
    ip_address VARCHAR(45),
    user_agent TEXT,
    metadata TEXT,  -- JSON: 추가 정보
    status VARCHAR(20) NOT NULL,  -- 'success', 'failure'
    error_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_audit_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_event ON audit_logs(event_type, created_at DESC);
CREATE INDEX idx_audit_status ON audit_logs(status, created_at DESC);

-- 3. Users 테이블 수정
-- 기존 email, password_hash를 선택사항으로 변경 (카카오 로그인만 사용)
-- SQLite는 ALTER COLUMN을 지원하지 않으므로, 새로운 컬럼 추가
ALTER TABLE users ADD COLUMN login_method VARCHAR(20) DEFAULT 'kakao';
ALTER TABLE users ADD COLUMN kakao_id VARCHAR(255);  -- 빠른 조회용

CREATE UNIQUE INDEX idx_users_kakao_id ON users(kakao_id) WHERE kakao_id IS NOT NULL;
