import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Avatar from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large', 'xl'],
    },
    color: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'accent', 'gray'],
    },
    status: {
      control: { type: 'select' },
      options: [undefined, 'online', 'away', 'offline'],
    },
    clickable: {
      control: 'boolean',
    },
    children: {
      control: 'text',
    },
    image: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
  args: {
    children: '김',
  },
};

export const Small: Story = {
  args: {
    children: '이',
    size: 'small',
    color: 'secondary',
  },
};

export const Large: Story = {
  args: {
    children: '박',
    size: 'large',
    color: 'accent',
  },
};

export const ExtraLarge: Story = {
  args: {
    children: '최',
    size: 'xl',
    color: 'primary',
  },
};

export const WithStatus: Story = {
  args: {
    children: '온',
    status: 'online',
  },
};

export const Away: Story = {
  args: {
    children: '자',
    status: 'away',
    color: 'secondary',
  },
};

export const Offline: Story = {
  args: {
    children: '오',
    status: 'offline',
    color: 'gray',
  },
};

export const Clickable: Story = {
  args: {
    children: '클',
    clickable: true,
    onClick: () => alert('Avatar clicked!'),
  },
};

export const AllSizes = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
    <Avatar size="small">소</Avatar>
    <Avatar size="medium">중</Avatar>
    <Avatar size="large">대</Avatar>
    <Avatar size="xl">특</Avatar>
  </div>
);

export const AllColors = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
    <Avatar color="primary">P</Avatar>
    <Avatar color="secondary">S</Avatar>
    <Avatar color="accent">A</Avatar>
    <Avatar color="gray">G</Avatar>
  </div>
);

export const AvatarGroup = () => (
  <div className="ds-avatar-group">
    <Avatar color="primary">김</Avatar>
    <Avatar color="secondary">이</Avatar>
    <Avatar color="accent">박</Avatar>
    <Avatar color="gray">+2</Avatar>
  </div>
);