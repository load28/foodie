import React from 'react';
import { Heart, MessageCircle, Share } from 'lucide-react';
import Avatar from '../Avatar/Avatar';
import './FeedCard.scss';

interface FeedCardProps {
  authorName?: string;
  authorInitial?: string;
  timeAgo?: string;
  title?: string;
  content?: string;
  location?: string;
  showRating?: boolean;
  rating?: number;
  likes?: number;
  comments?: number;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  isLiked?: boolean;
}

const FeedCard: React.FC<FeedCardProps> = ({ 
  authorName = '작성자',
  authorInitial = '작',
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
  ...props 
}) => {
  return (
    <div className="ds-feed-card ds-feed-card--compact" {...props}>
      <div className="ds-feed-card__header">
        <Avatar 
          size="small" 
          color="secondary" 
          className="ds-feed-card__avatar"
        >
          {authorInitial}
        </Avatar>
        <div className="ds-feed-card__author-info">
          <div className="ds-feed-card__author">{authorName}</div>
          <div className="ds-feed-card__time">{timeAgo}</div>
        </div>
      </div>
      
      <div className="ds-feed-card__content">
        <h3 className="ds-feed-card__title">{title}</h3>
        <p className="ds-feed-card__text">{content}</p>
        
        {showRating && (
          <div className="ds-rating">
            <div className="ds-rating__stars">
              {'⭐'.repeat(Math.floor(rating))}
            </div>
            <div className="ds-rating__score">{rating}</div>
          </div>
        )}
        
        <div className="ds-feed-card__location">📍 {location}</div>
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
};

export default FeedCard;