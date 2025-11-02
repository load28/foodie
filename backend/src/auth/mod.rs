pub mod jwt;
pub mod oauth;

use bcrypt::{hash, verify, DEFAULT_COST};

pub fn hash_password(password: &str) -> Result<String, bcrypt::BcryptError> {
    hash(password, DEFAULT_COST)
}

pub fn verify_password(password: &str, hash: &str) -> Result<bool, bcrypt::BcryptError> {
    verify(password, hash)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hash_password() {
        let password = "test_password_123";
        let hashed = hash_password(password).unwrap();

        // 해시된 비밀번호는 원본과 달라야 함
        assert_ne!(password, hashed);

        // 해시된 비밀번호는 bcrypt 형식이어야 함 ($2b$...)
        assert!(hashed.starts_with("$2b$"));
    }

    #[test]
    fn test_verify_password_success() {
        let password = "correct_password";
        let hashed = hash_password(password).unwrap();

        // 올바른 비밀번호로 검증
        let result = verify_password(password, &hashed).unwrap();
        assert!(result);
    }

    #[test]
    fn test_verify_password_failure() {
        let password = "correct_password";
        let hashed = hash_password(password).unwrap();

        // 잘못된 비밀번호로 검증
        let result = verify_password("wrong_password", &hashed).unwrap();
        assert!(!result);
    }

    #[test]
    fn test_hash_password_different_results() {
        let password = "same_password";
        let hash1 = hash_password(password).unwrap();
        let hash2 = hash_password(password).unwrap();

        // 같은 비밀번호라도 salt가 다르므로 해시 결과가 달라야 함
        assert_ne!(hash1, hash2);

        // 하지만 두 해시 모두 원본 비밀번호로 검증 가능
        assert!(verify_password(password, &hash1).unwrap());
        assert!(verify_password(password, &hash2).unwrap());
    }

    #[test]
    fn test_empty_password() {
        let password = "";
        let hashed = hash_password(password).unwrap();

        // 빈 비밀번호도 해싱 가능
        assert!(hashed.starts_with("$2b$"));
        assert!(verify_password(password, &hashed).unwrap());
    }

    #[test]
    fn test_long_password() {
        let password = "a".repeat(100);
        let hashed = hash_password(&password).unwrap();

        // 긴 비밀번호도 해싱 가능
        assert!(verify_password(&password, &hashed).unwrap());
    }

    #[test]
    fn test_special_characters_password() {
        let password = "!@#$%^&*()_+-=[]{}|;':\",./<>?";
        let hashed = hash_password(password).unwrap();

        // 특수문자가 포함된 비밀번호도 해싱 가능
        assert!(verify_password(password, &hashed).unwrap());
    }
}
