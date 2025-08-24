import React from 'react';
import './ActionIndicator.scss';

export type ActionType = 'like' | 'pass' | 'super-like';

interface ActionIndicatorProps {
  type: ActionType;
  visible?: boolean;
  intensity?: number;
  position?: 'left' | 'right' | 'top';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const ActionIndicator: React.FC<ActionIndicatorProps> = ({
  type,
  visible = false,
  intensity = 0.5,
  position = 'right',
  size = 'medium',
  className = '',
}) => {
  const getActionConfig = () => {
    switch (type) {
      case 'like':
        return {
          icon: '❤️',
          text: '좋아요',
          colorClass: 'ds-action-indicator--like',
        };
      case 'pass':
        return {
          icon: '❌',
          text: '패스',
          colorClass: 'ds-action-indicator--pass',
        };
      case 'super-like':
        return {
          icon: '⭐',
          text: '슈퍼 좋아요',
          colorClass: 'ds-action-indicator--super-like',
        };
      default:
        return {
          icon: '❓',
          text: '알 수 없음',
          colorClass: 'ds-action-indicator--default',
        };
    }
  };

  const { icon, text, colorClass } = getActionConfig();

  return (
    <div
      className={`
        ds-action-indicator
        ${colorClass}
        ds-action-indicator--${position}
        ds-action-indicator--${size}
        ${visible ? 'ds-action-indicator--visible' : ''}
        ${className}
      `.trim()}
      style={{
        '--intensity': intensity,
      } as React.CSSProperties}
      role="img"
      aria-label={`${text} 액션 인디케이터`}
    >
      <div className="ds-action-indicator__content">
        <span className="ds-action-indicator__icon" aria-hidden="true">
          {icon}
        </span>
        <span className="ds-action-indicator__text">
          {text}
        </span>
      </div>
    </div>
  );
};

export default ActionIndicator;