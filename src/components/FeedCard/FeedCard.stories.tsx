import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import FeedCard from './FeedCard';

const meta: Meta<typeof FeedCard> = {
  title: 'Components/FeedCard',
  component: FeedCard,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    authorName: {
      control: 'text',
    },
    authorInitial: {
      control: 'text',
    },
    timeAgo: {
      control: 'text',
    },
    title: {
      control: 'text',
    },
    content: {
      control: 'text',
    },
    location: {
      control: 'text',
    },
    showRating: {
      control: 'boolean',
    },
    rating: {
      control: { type: 'range', min: 1, max: 5, step: 0.1 },
    },
    likes: {
      control: 'number',
    },
    comments: {
      control: 'number',
    },
    isLiked: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof FeedCard>;

export const Default: Story = {
  args: {
    authorName: '이영희',
    authorInitial: '이',
    timeAgo: '1시간 전',
    title: '신선한 회 맛집 발견!',
    content: '오마카세 코스가 정말 훌륭했어요. 회도 신선하고 사장님도 친절하셨습니다.',
    location: '서초구 방배동 바다횟집',
    likes: 8,
    comments: 1,
  },
};

export const WithRating: Story = {
  args: {
    authorName: '김철수',
    authorInitial: '김',
    timeAgo: '30분 전',
    title: '맛있는 이탈리안 레스토랑',
    content: '크림 파스타가 정말 환상적이었어요. 친구들과 함께 가기 좋은 분위기였습니다.',
    location: '강남구 논현동 맘마미아',
    showRating: true,
    rating: 4.8,
    likes: 12,
    comments: 3,
  },
};

export const Liked: Story = {
  args: {
    authorName: '박민수',
    authorInitial: '박',
    timeAgo: '2시간 전',
    title: '숨은 맛집 발견',
    content: '동네 골목에 숨어있는 정말 맛있는 집이에요. 사장님이 직접 만드시는 음식이 일품입니다.',
    location: '홍대입구 골목집',
    likes: 24,
    comments: 7,
    isLiked: true,
  },
};

export const Interactive: Story = {
  args: {
    authorName: '최유진',
    authorInitial: '최',
    title: '브런치 맛집',
    content: '주말 브런치로 완벽한 곳이에요. 팬케이크가 특히 맛있습니다.',
    location: '강남구 브런치카페',
    likes: 5,
    comments: 2,
    onLike: () => console.log('좋아요 클릭'),
    onComment: () => console.log('댓글 클릭'),
    onShare: () => console.log('공유 클릭'),
  },
};