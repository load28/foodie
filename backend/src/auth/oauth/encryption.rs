use aes_gcm::{
    aead::{Aead, KeyInit, OsRng},
    Aes256Gcm, Nonce,
};
use std::error::Error as StdError;

/// OAuth 토큰 암호화/복호화
pub struct TokenEncryption {
    cipher: Aes256Gcm,
}

impl TokenEncryption {
    /// 32바이트 hex 키로 암호화 인스턴스 생성
    pub fn new(key_hex: &str) -> Result<Self, Box<dyn StdError>> {
        let key_bytes = hex::decode(key_hex)?;

        if key_bytes.len() != 32 {
            return Err("Encryption key must be 32 bytes (64 hex characters)".into());
        }

        let cipher = Aes256Gcm::new_from_slice(&key_bytes)?;

        Ok(Self { cipher })
    }

    /// 토큰 암호화 (base64 인코딩 반환)
    pub fn encrypt(&self, token: &str) -> Result<String, Box<dyn StdError>> {
        // 랜덤 nonce 생성 (96비트)
        let nonce_bytes: [u8; 12] = OsRng.gen();
        let nonce = Nonce::from_slice(&nonce_bytes);

        // 암호화
        let ciphertext = self
            .cipher
            .encrypt(nonce, token.as_bytes())
            .map_err(|e| format!("Encryption failed: {}", e))?;

        // Nonce + Ciphertext를 base64로 인코딩
        let mut result = nonce_bytes.to_vec();
        result.extend_from_slice(&ciphertext);

        Ok(base64::encode(&result))
    }

    /// 토큰 복호화 (base64 디코딩)
    pub fn decrypt(&self, encrypted: &str) -> Result<String, Box<dyn StdError>> {
        // Base64 디코딩
        let data = base64::decode(encrypted)?;

        if data.len() < 12 {
            return Err("Invalid encrypted data".into());
        }

        // Nonce와 Ciphertext 분리
        let (nonce_bytes, ciphertext) = data.split_at(12);
        let nonce = Nonce::from_slice(nonce_bytes);

        // 복호화
        let plaintext = self
            .cipher
            .decrypt(nonce, ciphertext)
            .map_err(|e| format!("Decryption failed: {}", e))?;

        Ok(String::from_utf8(plaintext)?)
    }

    /// 새로운 랜덤 암호화 키 생성 (64 hex 문자)
    pub fn generate_key() -> String {
        use rand::Rng;
        let key: [u8; 32] = rand::thread_rng().gen();
        hex::encode(key)
    }
}

// OsRng trait 구현을 위한 간단한 wrapper
use rand::RngCore;

trait Gen {
    fn gen<T>(&mut self) -> T
    where
        T: Default + AsMut<[u8]>;
}

impl Gen for OsRng {
    fn gen<T>(&mut self) -> T
    where
        T: Default + AsMut<[u8]>,
    {
        let mut result = T::default();
        self.fill_bytes(result.as_mut());
        result
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_encryption_decryption() {
        let key = TokenEncryption::generate_key();
        let encryption = TokenEncryption::new(&key).unwrap();

        let original = "test_access_token_12345";
        let encrypted = encryption.encrypt(original).unwrap();
        let decrypted = encryption.decrypt(&encrypted).unwrap();

        assert_eq!(original, decrypted);
        assert_ne!(original, encrypted); // 암호화되었는지 확인
    }

    #[test]
    fn test_key_generation() {
        let key1 = TokenEncryption::generate_key();
        let key2 = TokenEncryption::generate_key();

        assert_eq!(key1.len(), 64); // 32 bytes = 64 hex chars
        assert_ne!(key1, key2); // 매번 다른 키 생성
    }

    #[test]
    fn test_invalid_key_length() {
        let result = TokenEncryption::new("short_key");
        assert!(result.is_err());
    }

    #[test]
    fn test_decrypt_invalid_data() {
        let key = TokenEncryption::generate_key();
        let encryption = TokenEncryption::new(&key).unwrap();

        let result = encryption.decrypt("invalid_base64_data");
        assert!(result.is_err());
    }
}
