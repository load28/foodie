use aws_sdk_s3::{Client, config::Region};
use aws_config::BehaviorVersion;
use std::env;

/// S3 클라이언트 래퍼
///
/// 엔터프라이즈급 이미지 저장을 위한 S3 클라이언트
/// - 환경 변수를 통한 설정 (AWS_REGION, AWS_S3_BUCKET)
/// - 재사용 가능한 클라이언트 인스턴스
#[derive(Clone)]
pub struct S3Client {
    client: Client,
    bucket: String,
}

impl S3Client {
    /// 환경 변수로부터 S3 클라이언트 생성
    ///
    /// 필요한 환경 변수:
    /// - AWS_REGION: AWS 리전 (예: us-east-1, ap-northeast-2)
    /// - AWS_S3_BUCKET: S3 버킷 이름
    /// - AWS_ACCESS_KEY_ID: AWS 액세스 키 (선택, 없으면 기본 자격증명 사용)
    /// - AWS_SECRET_ACCESS_KEY: AWS 시크릿 키 (선택)
    pub async fn new() -> Result<Self, Box<dyn std::error::Error>> {
        let region = env::var("AWS_REGION")
            .unwrap_or_else(|_| "ap-northeast-2".to_string());
        let bucket = env::var("AWS_S3_BUCKET")
            .expect("AWS_S3_BUCKET must be set");

        let config = aws_config::defaults(BehaviorVersion::latest())
            .region(Region::new(region))
            .load()
            .await;

        let client = Client::new(&config);

        Ok(Self { client, bucket })
    }

    /// S3에 파일 업로드
    ///
    /// # Arguments
    /// * `key` - S3 객체 키 (파일 경로)
    /// * `data` - 업로드할 바이트 데이터
    /// * `content_type` - MIME 타입 (예: image/jpeg, image/webp)
    pub async fn upload(
        &self,
        key: &str,
        data: Vec<u8>,
        content_type: &str,
    ) -> Result<String, Box<dyn std::error::Error>> {
        self.client
            .put_object()
            .bucket(&self.bucket)
            .key(key)
            .body(data.into())
            .content_type(content_type)
            .send()
            .await?;

        // CloudFront URL 또는 S3 URL 반환
        let url = if let Ok(cloudfront_domain) = env::var("AWS_CLOUDFRONT_DOMAIN") {
            // CloudFront CDN 사용 (엔터프라이즈 권장)
            format!("https://{}/{}", cloudfront_domain, key)
        } else {
            // 직접 S3 URL (개발용)
            format!(
                "https://{}.s3.{}.amazonaws.com/{}",
                self.bucket,
                env::var("AWS_REGION").unwrap_or_else(|_| "ap-northeast-2".to_string()),
                key
            )
        };

        Ok(url)
    }

    /// S3에서 파일 삭제
    ///
    /// # Arguments
    /// * `key` - 삭제할 S3 객체 키
    pub async fn delete(&self, key: &str) -> Result<(), Box<dyn std::error::Error>> {
        self.client
            .delete_object()
            .bucket(&self.bucket)
            .key(key)
            .send()
            .await?;

        Ok(())
    }

    /// Pre-signed URL 생성 (보안 강화)
    ///
    /// 엔터프라이즈 전략: 직접 S3 URL 대신 만료 시간이 있는 서명된 URL 사용
    ///
    /// # Arguments
    /// * `key` - S3 객체 키
    /// * `expires_in_secs` - URL 만료 시간 (초 단위, 기본 3600초 = 1시간)
    pub async fn get_presigned_url(
        &self,
        key: &str,
        expires_in_secs: u64,
    ) -> Result<String, Box<dyn std::error::Error>> {
        use aws_sdk_s3::presigning::PresigningConfig;
        use std::time::Duration;

        let presigned_request = self
            .client
            .get_object()
            .bucket(&self.bucket)
            .key(key)
            .presigned(
                PresigningConfig::builder()
                    .expires_in(Duration::from_secs(expires_in_secs))
                    .build()?,
            )
            .await?;

        Ok(presigned_request.uri().to_string())
    }
}
