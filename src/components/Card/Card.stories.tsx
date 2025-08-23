import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Card from './Card';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'horizontal', 'compact', 'text-only'],
    },
    title: {
      control: 'text',
    },
    description: {
      control: 'text',
    },
    rating: {
      control: { type: 'range', min: 1, max: 5, step: 0.1 },
    },
    location: {
      control: 'text',
    },
    emoji: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    title: '이탈리안 레스토랑',
    description: '크림 파스타가 정말 맛있는 곳이에요. 분위기도 좋고 데이트 코스로 추천합니다.',
    rating: 4.5,
    location: '강남구',
    emoji: '🍝',
  },
};

export const Horizontal: Story = {
  args: {
    variant: 'horizontal',
    title: '신선한 초밥집',
    description: '회가 정말 신선하고 맛있어요. 오마카세 코스를 추천드립니다. 가격대도 합리적이고 서비스가 좋아요.',
    rating: 4.8,
    location: '서초구',
    emoji: '🍣',
  },
};

export const Compact: Story = {
  args: {
    variant: 'compact',
    title: '맛있는 피자집',
    description: '치즈가 정말 맛있고 도우도 바삭해요',
    rating: 4.2,
    location: '홍대',
    emoji: '🍕',
  },
};

export const TextOnly: Story = {
  args: {
    variant: 'text-only',
    title: '카페 베네',
    description: '조용한 분위기에서 커피 한 잔의 여유를 즐길 수 있는 곳입니다. 디저트류도 맛있어요.',
    rating: 4.0,
    location: '강남구',
  },
};

export const AllVariants = () => (
  <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
    {/* Default Card */}
    <Card
      title="이탈리안 레스토랑"
      description="크림 파스타가 정말 맛있는 곳이에요"
      rating={4.5}
      location="강남구"
      emoji="🍝"
    />
    
    {/* Compact Card */}
    <Card
      variant="compact"
      title="맛있는 피자집"
      description="치즈가 정말 맛있고 도우도 바삭해요"
      rating={4.2}
      location="홍대"
      emoji="🍕"
    />
    
    {/* Text Only Card */}
    <Card
      variant="text-only"
      title="카페 베네"
      description="조용한 분위기에서 커피를 즐길 수 있어요"
      rating={4.0}
      location="강남구"
    />
    
    <div style={{ gridColumn: '1 / -1', marginTop: '16px' }}>
      {/* Horizontal Card */}
      <Card
        variant="horizontal"
        title="신선한 초밥집"
        description="회가 정말 신선하고 맛있어요. 오마카세 코스를 추천드립니다."
        rating={4.8}
        location="서초구"
        emoji="🍣"
      />
    </div>
  </div>
);