import React from 'react';
import './Navigation.scss';

interface NavigationItem {
  id: string;
  label: string;
  href: string;
}

interface NavigationProps {
  items?: NavigationItem[];
  activeItem?: string;
  onItemClick?: (id: string, item: NavigationItem) => void;
  variant?: 'default';
}

const Navigation: React.FC<NavigationProps> = ({ 
  items = [],
  activeItem,
  onItemClick,
  variant = 'default',
  ...props 
}) => {
  const className = [
    'ds-navigation',
    variant !== 'default' && `ds-navigation--${variant}`
  ].filter(Boolean).join(' ');

  const defaultItems: NavigationItem[] = [
    { id: 'home', label: '홈', href: '#home' },
    { id: 'search', label: '검색', href: '#search' },
    { id: 'favorites', label: '즐겨찾기', href: '#favorites' },
    { id: 'profile', label: '프로필', href: '#profile' }
  ];

  const navItems = items.length > 0 ? items : defaultItems;

  return (
    <nav className={className} {...props}>
      {navItems.map((item) => (
        <a
          key={item.id}
          href={item.href}
          className={`ds-navigation__item ${activeItem === item.id ? 'ds-navigation__item--active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            if (onItemClick) {
              onItemClick(item.id, item);
            }
          }}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
};

export default Navigation;