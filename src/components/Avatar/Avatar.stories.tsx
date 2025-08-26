import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { User, Users, UserCircle, UserSquare, Shield, Crown, Star } from 'lucide-react';
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
    image: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
  args: {
    // 기본값으로 User 아이콘 사용
  },
};

export const Small: Story = {
  args: {
    size: 'small',
    color: 'secondary',
  },
};

export const Large: Story = {
  args: {
    size: 'large',
    color: 'accent',
  },
};

export const ExtraLarge: Story = {
  args: {
    size: 'xl',
    color: 'primary',
  },
};

export const WithStatus: Story = {
  args: {
    status: 'online',
  },
};

export const Away: Story = {
  args: {
    status: 'away',
    color: 'secondary',
  },
};

export const Offline: Story = {
  args: {
    status: 'offline',
    color: 'gray',
  },
};

export const Clickable: Story = {
  args: {
    clickable: true,
    onClick: () => alert('Avatar clicked!'),
  },
};

export const AllSizes = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
    <Avatar size="small" />
    <Avatar size="medium" />
    <Avatar size="large" />
    <Avatar size="xl" />
  </div>
);

export const AllColors = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
    <Avatar color="primary" />
    <Avatar color="secondary" />
    <Avatar color="accent" />
    <Avatar color="gray" />
  </div>
);

export const DifferentIcons = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
    <Avatar icon={User} color="primary" />
    <Avatar icon={Users} color="secondary" />
    <Avatar icon={UserCircle} color="accent" />
    <Avatar icon={UserSquare} color="gray" />
    <Avatar icon={Shield} color="primary" />
    <Avatar icon={Crown} color="secondary" />
    <Avatar icon={Star} color="accent" />
  </div>
);

export const AvatarGroup = () => (
  <div className="ds-avatar-group">
    <Avatar color="primary" icon={User} />
    <Avatar color="secondary" icon={Users} />
    <Avatar color="accent" icon={UserCircle} />
    <Avatar color="gray" icon={Crown} />
  </div>
);

export const WithImage: Story = {
  args: {
    image: 'https://via.placeholder.com/150',
    alt: 'User Avatar',
  },
};