import React from 'react';
import './Card.scss';

interface CardProps {
  title?: string;
  description?: string;
  rating?: number;
  location?: string;
  emoji?: string;
  variant?: 'default' | 'horizontal' | 'compact' | 'text-only';
  image?: string;
  children?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ 
  title = '맛집 이름',
  description = '맛집에 대한 간단한 설명입니다.',
  rating = 4.5,
  location = '강남구',
  emoji = '🍽️',
  variant = 'default',
  image,
  children,
  ...props 
}) => {
  const className = [
    'ds-card',
    variant !== 'default' && `ds-card--${variant}`
  ].filter(Boolean).join(' ');

  const showImage = variant !== 'text-only';

  return (
    <div className={className} {...props}>
      {showImage && (
        <div className="ds-card__image ds-card__image--placeholder">
          {image ? (
            <img src={image} alt={title} />
          ) : (
            emoji
          )}
        </div>
      )}
      <div className="ds-card__content">
        {children || (
          <>
            <h3 className="ds-card__title">{title}</h3>
            <p className="ds-card__description">{description}</p>
            <div className="ds-card__meta">
              <div className="ds-card__rating">⭐ {rating}</div>
              <div className="ds-card__location">{location}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Card;