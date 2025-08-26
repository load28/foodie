import React, { forwardRef } from 'react';
import { Heart, MessageCircle, Share } from 'lucide-react';
import Avatar from '../Avatar/Avatar';
import './FeedCard.scss';

interface FeedCardProps {
  authorName?: string;
  timeAgo?: string;
  title?: string;
  content?: string;
  location?: string;
  showRating?: boolean;
  rating?: number | string;
  likes?: number;
  comments?: number;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  isLiked?: boolean;
  tags?: string[];
  category?: string;
  image?: string;
  variant?: 'default' | 'detailed';
}

const FeedCard = forwardRef<HTMLDivElement, FeedCardProps>(({ 
  authorName = '작성자',
  timeAgo = '방금 전',
  title = '맛집 후기',
  content = '정말 맛있었어요!',
  location = '맛집 위치',
  showRating = false,
  rating = 4.5,
  likes = 0,
  comments = 0,
  onLike,
  onComment,
  onShare,
  isLiked = false,
  tags = [],
  category,
  image,
  variant = 'default',
  ...props 
}, ref) => {
  const ratingValue = typeof rating === 'string' ? parseFloat(rating) : rating;
  return (
    <div 
      ref={ref}
      className={`ds-feed-card ${variant === 'detailed' ? 'ds-feed-card--detailed' : 'ds-feed-card--compact'}`} 
      {...props}
    >
      <div className="ds-feed-card__header">
        <Avatar 
          size="medium" 
          color="secondary" 
          className="ds-feed-card__avatar"
        />
        <div className="ds-feed-card__author-info">
          <div className="ds-feed-card__author">{authorName}</div>
          <div className="ds-feed-card__time">{timeAgo}</div>
        </div>
      </div>
      
      <div className="ds-feed-card__content">
        <h3 className="ds-feed-card__title">{title}</h3>
        <p className="ds-feed-card__text">{content}</p>
        
        {(showRating || variant === 'detailed') && (
          <div className="ds-feed-card__meta">
            <div className="ds-feed-card__rating">
              <span className="ds-feed-card__stars">
                {'★'.repeat(Math.floor(ratingValue))}
                {'☆'.repeat(5 - Math.floor(ratingValue))}
              </span>
              <span className="ds-feed-card__rating-value">{rating}</span>
            </div>
            <div className="ds-feed-card__location">
              📍 {location}
            </div>
          </div>
        )}

        {!showRating && variant === 'default' && (
          <div className="ds-feed-card__location">📍 {location}</div>
        )}
        
        {variant === 'detailed' && (tags.length > 0 || category) && (
          <div className="ds-feed-card__tags">
            {category && (
              <span className="ds-feed-card__tag ds-feed-card__tag--primary">
                #{category}
              </span>
            )}
            {tags.map((tag, index) => (
              <span key={index} className="ds-feed-card__tag">
                #{tag}
              </span>
            ))}
          </div>
        )}
        
        {variant === 'detailed' && image && (
          <div className="ds-feed-card__image">
            {image}
          </div>
        )}
      </div>
      
      <div className="ds-feed-card__actions">
        <button 
          className={`ds-feed-card__action ${isLiked ? 'ds-feed-card__action--active' : ''}`}
          onClick={onLike}
        >
          <Heart 
            size={18} 
            fill={isLiked ? 'currentColor' : 'none'}
            stroke="currentColor"
          />
          <span className="ds-feed-card__action-count">{likes}</span>
        </button>
        
        <button className="ds-feed-card__action" onClick={onComment}>
          <MessageCircle size={18} />
          <span className="ds-feed-card__action-count">{comments}</span>
        </button>
        
        <button className="ds-feed-card__action" onClick={onShare}>
          <Share size={18} />
        </button>
      </div>
    </div>
  );
});

FeedCard.displayName = 'FeedCard';

export default FeedCard;