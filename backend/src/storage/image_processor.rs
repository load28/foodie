use image::{ImageFormat, DynamicImage, imageops::FilterType};
use std::io::Cursor;

/// 이미지 해상도 변형
///
/// 엔터프라이즈 전략: 반응형 이미지를 위한 다중 해상도
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum ImageVariant {
    /// 썸네일 (300px) - 피드 목록, 프로필
    Thumbnail,
    /// 중간 (800px) - 모바일 상세 보기
    Medium,
    /// 대형 (1920px) - 데스크톱, 고해상도 디스플레이
    Large,
}

impl ImageVariant {
    /// 각 변형의 최대 너비 (픽셀)
    pub fn max_width(&self) -> u32 {
        match self {
            ImageVariant::Thumbnail => 300,
            ImageVariant::Medium => 800,
            ImageVariant::Large => 1920,
        }
    }

    /// URL 경로에 사용할 접미사
    pub fn suffix(&self) -> &str {
        match self {
            ImageVariant::Thumbnail => "_thumb",
            ImageVariant::Medium => "_medium",
            ImageVariant::Large => "_large",
        }
    }
}

/// 이미지 포맷
///
/// 엔터프라이즈 전략: 다중 포맷으로 최적 압축률 및 브라우저 호환성 확보
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum OutputFormat {
    /// JPEG - 범용 호환성 (폴백)
    Jpeg,
    /// WebP - 30% 더 나은 압축 (모던 브라우저)
    WebP,
}

impl OutputFormat {
    /// MIME 타입
    pub fn content_type(&self) -> &str {
        match self {
            OutputFormat::Jpeg => "image/jpeg",
            OutputFormat::WebP => "image/webp",
        }
    }

    /// 파일 확장자
    pub fn extension(&self) -> &str {
        match self {
            OutputFormat::Jpeg => "jpg",
            OutputFormat::WebP => "webp",
        }
    }

    /// ImageFormat으로 변환
    pub fn to_image_format(&self) -> ImageFormat {
        match self {
            OutputFormat::Jpeg => ImageFormat::Jpeg,
            OutputFormat::WebP => ImageFormat::WebP,
        }
    }

    /// 품질 설정 (엔터프라이즈 권장)
    ///
    /// - JPEG: 85% (좋은 품질 + 합리적 크기)
    /// - WebP: 80% (JPEG 85%와 비슷한 품질, 더 작은 파일)
    pub fn quality(&self) -> u8 {
        match self {
            OutputFormat::Jpeg => 85,
            OutputFormat::WebP => 80,
        }
    }
}

/// 이미지 처리 결과
#[derive(Debug)]
pub struct ProcessedImage {
    pub data: Vec<u8>,
    pub format: OutputFormat,
    pub variant: ImageVariant,
    pub width: u32,
    pub height: u32,
}

/// 이미지 프로세서
///
/// 엔터프라이즈급 이미지 최적화:
/// - 다중 해상도 생성 (반응형 이미지)
/// - 다중 포맷 생성 (WebP, JPEG)
/// - 지능형 압축 (품질 유지 + 파일 크기 최소화)
pub struct ImageProcessor;

impl ImageProcessor {
    /// Base64 데이터 URI에서 이미지 디코딩
    ///
    /// # Arguments
    /// * `data_uri` - data:image/...;base64,... 형식의 문자열
    pub fn decode_data_uri(data_uri: &str) -> Result<Vec<u8>, Box<dyn std::error::Error>> {
        // data:image/jpeg;base64, 접두사 제거
        let base64_data = data_uri
            .split(',')
            .nth(1)
            .ok_or("Invalid data URI format")?;

        // Base64 디코딩
        use base64::{Engine as _, engine::general_purpose};
        let decoded = general_purpose::STANDARD.decode(base64_data)?;

        Ok(decoded)
    }

    /// 이미지 처리 (리사이징 + 압축 + 포맷 변환)
    ///
    /// # Arguments
    /// * `image_data` - 원본 이미지 바이트
    /// * `variant` - 생성할 이미지 변형 (해상도)
    /// * `format` - 출력 포맷
    ///
    /// # 엔터프라이즈 전략
    /// - Lanczos3 필터로 고품질 리사이징
    /// - 종횡비 유지
    /// - 최적 압축 품질
    pub fn process(
        image_data: &[u8],
        variant: ImageVariant,
        format: OutputFormat,
    ) -> Result<ProcessedImage, Box<dyn std::error::Error>> {
        // 이미지 로드
        let img = image::load_from_memory(image_data)?;

        // 리사이징 (필요한 경우)
        let max_width = variant.max_width();
        let resized = if img.width() > max_width {
            // Lanczos3: 고품질 리샘플링 필터 (엔터프라이즈 권장)
            img.resize(max_width, u32::MAX, FilterType::Lanczos3)
        } else {
            img
        };

        // 포맷 변환 및 압축
        let mut output = Vec::new();
        let mut cursor = Cursor::new(&mut output);

        match format {
            OutputFormat::Jpeg => {
                let mut encoder = image::codecs::jpeg::JpegEncoder::new_with_quality(
                    &mut cursor,
                    format.quality(),
                );
                encoder.encode_image(&resized)?;
            }
            OutputFormat::WebP => {
                // WebP 인코딩
                resized.write_to(&mut cursor, format.to_image_format())?;
            }
        }

        Ok(ProcessedImage {
            data: output,
            format,
            variant,
            width: resized.width(),
            height: resized.height(),
        })
    }

    /// 단일 이미지를 모든 변형으로 처리
    ///
    /// 엔터프라이즈 전략: 각 이미지당 6개 변형 생성
    /// - Thumbnail: JPEG, WebP
    /// - Medium: JPEG, WebP
    /// - Large: JPEG, WebP
    ///
    /// # Returns
    /// 9개의 ProcessedImage (3 해상도 x 2 포맷)
    pub fn process_all_variants(
        image_data: &[u8],
    ) -> Result<Vec<ProcessedImage>, Box<dyn std::error::Error>> {
        let variants = vec![
            ImageVariant::Thumbnail,
            ImageVariant::Medium,
            ImageVariant::Large,
        ];

        let formats = vec![
            OutputFormat::Jpeg,
            OutputFormat::WebP,
        ];

        let mut results = Vec::new();

        for variant in &variants {
            for format in &formats {
                let processed = Self::process(image_data, *variant, *format)?;
                results.push(processed);
            }
        }

        Ok(results)
    }

    /// S3 키 생성 (파일 경로)
    ///
    /// 형식: images/{user_id}/{uuid}_{variant}.{ext}
    /// 예: images/123/a1b2c3d4_thumb.webp
    pub fn generate_s3_key(
        user_id: &str,
        image_id: &str,
        variant: ImageVariant,
        format: OutputFormat,
    ) -> String {
        format!(
            "images/{}/{}{}.{}",
            user_id,
            image_id,
            variant.suffix(),
            format.extension()
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_variant_dimensions() {
        assert_eq!(ImageVariant::Thumbnail.max_width(), 300);
        assert_eq!(ImageVariant::Medium.max_width(), 800);
        assert_eq!(ImageVariant::Large.max_width(), 1920);
    }

    #[test]
    fn test_format_quality() {
        assert_eq!(OutputFormat::Jpeg.quality(), 85);
        assert_eq!(OutputFormat::WebP.quality(), 80);
    }

    #[test]
    fn test_s3_key_generation() {
        let key = ImageProcessor::generate_s3_key(
            "user123",
            "img456",
            ImageVariant::Thumbnail,
            OutputFormat::WebP,
        );
        assert_eq!(key, "images/user123/img456_thumb.webp");
    }
}
