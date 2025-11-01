import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useMutation } from '@apollo/client';
import { ImageUpload } from '../ImageUpload/ImageUpload';
import { CREATE_FEED_POST } from '../../lib/graphql/mutations';
import './CreatePostModal.scss';

export interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CATEGORIES = [
  { label: '한식', value: 'KOREAN' },
  { label: '양식', value: 'WESTERN' },
  { label: '중식', value: 'CHINESE' },
  { label: '일식', value: 'JAPANESE' },
  { label: '카페', value: 'CAFE' },
  { label: '디저트', value: 'DESSERT' },
];

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState('KOREAN');
  const [tags, setTags] = useState('');
  const [imageDataUri, setImageDataUri] = useState<string | undefined>();

  const [createPost, { loading, error }] = useMutation(CREATE_FEED_POST, {
    onCompleted: () => {
      resetForm();
      onSuccess?.();
      onClose();
    },
  });

  const resetForm = () => {
    setTitle('');
    setContent('');
    setLocation('');
    setRating(5);
    setCategory('KOREAN');
    setTags('');
    setImageDataUri(undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const tagArray = tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    try {
      await createPost({
        variables: {
          input: {
            title,
            content,
            location,
            rating,
            category,
            tags: tagArray,
            foodImage: imageDataUri,
          },
        },
      });
    } catch (err) {
      console.error('Failed to create post:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="create-post-modal">
      <div className="create-post-modal__overlay" onClick={onClose} />
      <div className="create-post-modal__content">
        <div className="create-post-modal__header">
          <h2 className="create-post-modal__title">새 게시물 작성</h2>
          <button
            className="create-post-modal__close"
            onClick={onClose}
            aria-label="닫기"
          >
            <X size={24} />
          </button>
        </div>

        <form className="create-post-modal__form" onSubmit={handleSubmit}>
          <div className="create-post-modal__field">
            <label htmlFor="title" className="create-post-modal__label">
              제목 *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="create-post-modal__input"
              placeholder="맛집 이름을 입력하세요"
              required
            />
          </div>

          <div className="create-post-modal__field">
            <label htmlFor="content" className="create-post-modal__label">
              내용 *
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="create-post-modal__textarea"
              placeholder="후기를 작성하세요"
              rows={4}
              required
            />
          </div>

          <div className="create-post-modal__field">
            <label htmlFor="location" className="create-post-modal__label">
              위치 *
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="create-post-modal__input"
              placeholder="예: 서울 강남구"
              required
            />
          </div>

          <div className="create-post-modal__row">
            <div className="create-post-modal__field">
              <label htmlFor="rating" className="create-post-modal__label">
                평점 *
              </label>
              <select
                id="rating"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="create-post-modal__select"
                required
              >
                {[1, 2, 3, 4, 5].map((r) => (
                  <option key={r} value={r}>
                    {'⭐'.repeat(r)} ({r}점)
                  </option>
                ))}
              </select>
            </div>

            <div className="create-post-modal__field">
              <label htmlFor="category" className="create-post-modal__label">
                카테고리 *
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="create-post-modal__select"
                required
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="create-post-modal__field">
            <label htmlFor="tags" className="create-post-modal__label">
              태그
            </label>
            <input
              id="tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="create-post-modal__input"
              placeholder="쉼표로 구분 (예: 파스타, 맛집, 데이트)"
            />
          </div>

          <div className="create-post-modal__field">
            <label className="create-post-modal__label">음식 사진</label>
            <ImageUpload
              value={imageDataUri}
              onImageSelect={setImageDataUri}
              onImageRemove={() => setImageDataUri(undefined)}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="create-post-modal__error">
              게시물 작성에 실패했습니다: {error.message}
            </div>
          )}

          <div className="create-post-modal__actions">
            <button
              type="button"
              onClick={onClose}
              className="create-post-modal__button create-post-modal__button--cancel"
              disabled={loading}
            >
              취소
            </button>
            <button
              type="submit"
              className="create-post-modal__button create-post-modal__button--submit"
              disabled={loading}
            >
              {loading ? '작성 중...' : '게시하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
