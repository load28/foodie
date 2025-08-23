import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Navigation from './Navigation';

const meta: Meta<typeof Navigation> = {
  title: 'Components/Navigation',
  component: Navigation,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    activeItem: {
      control: { type: 'select' },
      options: ['home', 'search', 'favorites', 'profile'],
    },
    variant: {
      control: { type: 'select' },
      options: ['default'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Navigation>;

export const Default: Story = {
  args: {
    activeItem: 'home',
    onItemClick: (id, item) => console.log('Clicked:', id, item),
  },
};

export const CustomMenu: Story = {
  args: {
    items: [
      { id: 'restaurants', label: '맛집', href: '#restaurants' },
      { id: 'reviews', label: '리뷰', href: '#reviews' },
      { id: 'bookmarks', label: '북마크', href: '#bookmarks' },
      { id: 'settings', label: '설정', href: '#settings' }
    ],
    activeItem: 'restaurants',
    onItemClick: (id, item) => console.log('Menu clicked:', id, item),
  },
};