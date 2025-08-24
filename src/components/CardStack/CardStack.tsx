import React, { useState, useCallback } from 'react';
import SwipeCard from '../SwipeCard/SwipeCard';
import './CardStack.scss';

interface CardData {
  id: number;
  title: string;
  description: string;
  rating: number;
  location: string;
  emoji?: string;
  image?: string;
}

interface CardStackProps {
  cards: CardData[];
  maxVisible?: number;
  stackOffset?: number;
  onSwipeLeft?: (card: CardData, index: number) => void;
  onSwipeRight?: (card: CardData, index: number) => void;
  onStackEmpty?: () => void;
  renderEmptyState?: () => React.ReactNode;
  className?: string;
}

const CardStack: React.FC<CardStackProps> = ({
  cards,
  maxVisible = 3,
  stackOffset = 8,
  onSwipeLeft,
  onSwipeRight,
  onStackEmpty,
  renderEmptyState,
  className = '',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [removingCards, setRemovingCards] = useState<Set<number>>(new Set());

  const handleSwipeLeft = useCallback((card: CardData, index: number) => {
    if (removingCards.has(index)) return;
    
    setRemovingCards(prev => new Set(prev).add(index));
    onSwipeLeft?.(card, index);
    
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setRemovingCards(prev => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
      
      if (currentIndex + 1 >= cards.length) {
        onStackEmpty?.();
      }
    }, 300);
  }, [currentIndex, cards.length, onSwipeLeft, onStackEmpty, removingCards]);

  const handleSwipeRight = useCallback((card: CardData, index: number) => {
    if (removingCards.has(index)) return;
    
    setRemovingCards(prev => new Set(prev).add(index));
    onSwipeRight?.(card, index);
    
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setRemovingCards(prev => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
      
      if (currentIndex + 1 >= cards.length) {
        onStackEmpty?.();
      }
    }, 300);
  }, [currentIndex, cards.length, onSwipeRight, onStackEmpty, removingCards]);

  const visibleCards = cards.slice(currentIndex, currentIndex + maxVisible);
  
  if (visibleCards.length === 0) {
    return (
      <div className={`ds-card-stack ${className}`}>
        <div className="ds-card-stack__empty">
          {renderEmptyState ? renderEmptyState() : (
            <>
              <div className="ds-card-stack__empty-icon">🎉</div>
              <h3 className="ds-card-stack__empty-title">모든 카드를 확인했습니다!</h3>
              <p className="ds-card-stack__empty-description">
                새로운 맛집을 발견하러 가볼까요?
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`ds-card-stack ${className}`}>
      <div className="ds-card-stack__container">
        {visibleCards.map((card, stackIndex) => {
          const cardIndex = currentIndex + stackIndex;
          const isRemoving = removingCards.has(cardIndex);
          const zIndex = maxVisible - stackIndex;
          const translateY = stackIndex * stackOffset;
          const scale = 1 - (stackIndex * 0.02);
          const isTopCard = stackIndex === 0;
          
          return (
            <div
              key={card.id}
              className={`ds-card-stack__card ${isRemoving ? 'ds-card-stack__card--removing' : ''}`}
              style={{
                zIndex,
                transform: `translateY(${translateY}px) scale(${scale})`,
                transformOrigin: 'center top',
              }}
            >
              <SwipeCard
                title={card.title}
                description={card.description}
                rating={card.rating}
                location={card.location}
                emoji={card.emoji}
                image={card.image}
                disabled={!isTopCard || isRemoving}
                onSwipeLeft={() => handleSwipeLeft(card, cardIndex)}
                onSwipeRight={() => handleSwipeRight(card, cardIndex)}
              />
            </div>
          );
        })}
      </div>
      
      {/* Progress Indicator */}
      <div className="ds-card-stack__progress">
        <div className="ds-card-stack__progress-bar">
          <div 
            className="ds-card-stack__progress-fill"
            style={{
              width: `${(currentIndex / cards.length) * 100}%`
            }}
          />
        </div>
        <div className="ds-card-stack__progress-text">
          {currentIndex} / {cards.length}
        </div>
      </div>
    </div>
  );
};

export default CardStack;