import React, { useState, useRef, useCallback, useEffect } from 'react';
import Card from '../Card/Card';
import ActionIndicator from '../ActionIndicator/ActionIndicator';
import './SwipeCard.scss';

interface SwipeCardProps {
  title?: string;
  description?: string;
  rating?: number;
  location?: string;
  emoji?: string;
  image?: string;
  disabled?: boolean;
  threshold?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
  children?: React.ReactNode;
}

const SwipeCard: React.FC<SwipeCardProps> = ({
  threshold = 120,
  disabled = false,
  onSwipeLeft,
  onSwipeRight,
  onSwipeStart,
  onSwipeEnd,
  ...cardProps
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const resetCard = useCallback(() => {
    setDragOffset({ x: 0, y: 0 });
    setIsDragging(false);
  }, []);

  const handleStart = useCallback((clientX: number, clientY: number) => {
    if (disabled) return;
    
    setIsDragging(true);
    setStartPos({ x: clientX, y: clientY });
    onSwipeStart?.();
  }, [disabled, onSwipeStart]);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging || disabled) return;

    const deltaX = clientX - startPos.x;
    const deltaY = clientY - startPos.y;
    
    setDragOffset({ x: deltaX, y: deltaY * 0.1 });
  }, [isDragging, disabled, startPos]);

  const handleEnd = useCallback(() => {
    if (!isDragging || disabled) return;

    const absX = Math.abs(dragOffset.x);
    
    if (absX >= threshold) {
      if (dragOffset.x > 0) {
        onSwipeRight?.();
      } else {
        onSwipeLeft?.();
      }
    }
    
    resetCard();
    onSwipeEnd?.();
  }, [isDragging, disabled, dragOffset.x, threshold, onSwipeLeft, onSwipeRight, onSwipeEnd, resetCard]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  }, [handleStart]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  }, [handleStart]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (disabled) return;
    
    switch (e.key) {
      case 'ArrowLeft':
      case 'Backspace':
        e.preventDefault();
        onSwipeLeft?.();
        break;
      case 'ArrowRight':
      case ' ':
        e.preventDefault();
        onSwipeRight?.();
        break;
      case 'Escape':
        resetCard();
        break;
    }
  }, [disabled, onSwipeLeft, onSwipeRight, resetCard]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    };

    const handleMouseUp = () => handleEnd();
    const handleTouchEnd = () => handleEnd();

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleMove, handleEnd]);

  const rotation = (dragOffset.x / threshold) * 15;
  const scale = Math.max(0.95, 1 - Math.abs(dragOffset.x) / (threshold * 5));
  const opacity = Math.max(0.7, 1 - Math.abs(dragOffset.x) / (threshold * 2));

  const swipeIntensity = Math.min(Math.abs(dragOffset.x) / threshold, 1);
  const showLeftIndicator = dragOffset.x < -30;
  const showRightIndicator = dragOffset.x > 30;

  return (
    <div 
      ref={cardRef}
      className={`ds-swipe-card ${isDragging ? 'ds-swipe-card--dragging' : ''} ${disabled ? 'ds-swipe-card--disabled' : ''}`}
      style={{
        transform: `translateX(${dragOffset.x}px) translateY(${dragOffset.y}px) rotate(${rotation}deg) scale(${scale})`,
        opacity,
        transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : 0}
      role="button"
      aria-label="맛집 카드 - 좌우 화살표키나 스페이스바로 선택, ESC로 리셋"
      aria-describedby="swipe-instructions"
    >
      <Card {...cardProps} />
      
      {/* Action Indicators */}
      <ActionIndicator
        type="pass"
        position="left"
        visible={showLeftIndicator}
        intensity={swipeIntensity}
      />
      
      <ActionIndicator
        type="like"
        position="right"
        visible={showRightIndicator}
        intensity={swipeIntensity}
      />
    </div>
  );
};

export default SwipeCard;