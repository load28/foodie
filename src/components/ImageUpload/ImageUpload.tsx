import React, { useState, useRef, ChangeEvent } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import './ImageUpload.scss';

export interface ImageUploadProps {
  /** 이미지가 선택되었을 때 호출되는 콜백 (base64 data URI) */
  onImageSelect?: (dataUri: string) => void;
  /** 이미지가 제거되었을 때 호출되는 콜백 */
  onImageRemove?: () => void;
  /** 현재 선택된 이미지 data URI */
  value?: string;
  /** 최대 파일 크기 (바이트, 기본 5MB) */
  maxSize?: number;
  /** 비활성화 여부 */
  disabled?: boolean;
}

/**
 * 이미지 업로드 컴포넌트
 *
 * 엔터프라이즈 전략:
 * - 클라이언트 측 이미지 미리보기
 * - 파일 크기 제한 (5MB)
 * - JPEG, PNG, WebP 지원
 * - Base64 인코딩으로 서버 전송
 */
export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageSelect,
  onImageRemove,
  value,
  maxSize = 5 * 1024 * 1024, // 5MB
  disabled = false,
}) => {
  const [preview, setPreview] = useState<string | undefined>(value);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 파일 타입 검증
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('JPEG, PNG, WebP 형식만 지원됩니다.');
      return;
    }

    // 파일 크기 검증
    if (file.size > maxSize) {
      setError(`파일 크기는 ${Math.round(maxSize / 1024 / 1024)}MB를 초과할 수 없습니다.`);
      return;
    }

    setError(null);

    // 파일을 Base64로 인코딩
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUri = reader.result as string;
      setPreview(dataUri);
      onImageSelect?.(dataUri);
    };
    reader.onerror = () => {
      setError('이미지를 읽는 중 오류가 발생했습니다.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreview(undefined);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageRemove?.();
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="image-upload">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        disabled={disabled}
        className="image-upload__input"
      />

      {preview ? (
        <div className="image-upload__preview">
          <img src={preview} alt="미리보기" className="image-upload__preview-image" />
          {!disabled && (
            <button
              type="button"
              onClick={handleRemove}
              className="image-upload__remove-button"
              aria-label="이미지 제거"
            >
              <X size={20} />
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled}
          className="image-upload__placeholder"
        >
          <ImageIcon size={48} className="image-upload__placeholder-icon" />
          <span className="image-upload__placeholder-text">
            <Upload size={16} className="image-upload__placeholder-upload-icon" />
            이미지 업로드
          </span>
          <span className="image-upload__placeholder-hint">
            JPEG, PNG, WebP (최대 {Math.round(maxSize / 1024 / 1024)}MB)
          </span>
        </button>
      )}

      {error && (
        <div className="image-upload__error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};
