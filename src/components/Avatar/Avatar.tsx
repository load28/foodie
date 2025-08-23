import React from 'react';
import './Avatar.scss';

interface AvatarProps {
  children?: React.ReactNode;
  image?: string;
  size?: 'small' | 'medium' | 'large' | 'xl';
  color?: 'primary' | 'secondary' | 'accent' | 'gray';
  status?: 'online' | 'away' | 'offline';
  clickable?: boolean;
  onClick?: () => void;
  alt?: string;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ 
  children,
  image,
  size = 'medium',
  color = 'primary',
  status,
  clickable = false,
  onClick,
  alt = 'Avatar',
  className,
  ...props 
}) => {
  const avatarClassName = [
    'ds-avatar',
    size !== 'medium' && `ds-avatar--${size}`,
    color !== 'primary' && `ds-avatar--${color}`,
    clickable && 'ds-avatar--clickable',
    className
  ].filter(Boolean).join(' ');

  const handleClick = clickable ? onClick : undefined;

  return (
    <div 
      className={avatarClassName} 
      onClick={handleClick}
      style={{ cursor: clickable ? 'pointer' : undefined }}
      {...props}
    >
      {image ? (
        <img src={image} alt={alt} className="ds-avatar__image" />
      ) : (
        children
      )}
      {status && (
        <div className={`ds-avatar__status ds-avatar__status--${status}`} />
      )}
    </div>
  );
};

export default Avatar;