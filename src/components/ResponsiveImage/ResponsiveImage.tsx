import React from 'react';
import './ResponsiveImage.scss';

export interface ImageUrls {
  thumbnail: {
    webp: string;
    jpeg: string;
  };
  medium: {
    webp: string;
    jpeg: string;
  };
  large: {
    webp: string;
    jpeg: string;
  };
}

export interface ResponsiveImageProps {
  /** 다중 포맷/해상도 이미지 URL */
  imageUrls: ImageUrls;
  /** 이미지 alt 텍스트 */
  alt: string;
  /** CSS 클래스명 */
  className?: string;
  /** 로딩 전략 (기본: lazy) */
  loading?: 'lazy' | 'eager';
  /** 이미지 크기 힌트 (반응형 레이아웃용) */
  sizes?: string;
}

/**
 * 반응형 이미지 컴포넌트
 *
 * 엔터프라이즈 전략:
 * - Picture 엘리먼트로 최적 포맷 선택 (WebP > JPEG)
 * - srcset으로 반응형 해상도 제공
 * - 레이지 로딩으로 성능 최적화
 * - 브라우저가 자동으로 최적 이미지 선택
 *
 * @example
 * ```tsx
 * <ResponsiveImage
 *   imageUrls={post.imageUrls}
 *   alt="맛있는 음식"
 *   sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
 * />
 * ```
 */
export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  imageUrls,
  alt,
  className = '',
  loading = 'lazy',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px',
}) => {
  return (
    <picture className={`responsive-image ${className}`}>
      {/* WebP 포맷 (우선순위 1) - 30% 더 나은 압축 */}
      <source
        type="image/webp"
        srcSet={`
          ${imageUrls.thumbnail.webp} 300w,
          ${imageUrls.medium.webp} 800w,
          ${imageUrls.large.webp} 1920w
        `}
        sizes={sizes}
      />

      {/* JPEG 포맷 (폴백) - 범용 호환성 */}
      <source
        type="image/jpeg"
        srcSet={`
          ${imageUrls.thumbnail.jpeg} 300w,
          ${imageUrls.medium.jpeg} 800w,
          ${imageUrls.large.jpeg} 1920w
        `}
        sizes={sizes}
      />

      {/* 폴백 이미지 (구형 브라우저) */}
      <img
        src={imageUrls.medium.jpeg}
        alt={alt}
        loading={loading}
        className="responsive-image__img"
      />
    </picture>
  );
};
