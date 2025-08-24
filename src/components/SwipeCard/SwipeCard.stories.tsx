import type { Meta, StoryObj } from '@storybook/react';
import SwipeCard from './SwipeCard';

const meta = {
  title: 'Components/SwipeCard',
  component: SwipeCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '스와이프 가능한 카드 컴포넌트입니다. 좌우로 드래그하여 좋아요/패스 액션을 수행할 수 있습니다.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      description: '카드 제목',
      control: 'text',
    },
    description: {
      description: '카드 설명',
      control: 'text',
    },
    rating: {
      description: '평점 (1-5)',
      control: { type: 'range', min: 1, max: 5, step: 0.1 },
    },
    location: {
      description: '위치 정보',
      control: 'text',
    },
    emoji: {
      description: '대표 이모지',
      control: 'text',
    },
    disabled: {
      description: '스와이프 비활성화 여부',
      control: 'boolean',
    },
    threshold: {
      description: '스와이프 인식 임계값 (픽셀)',
      control: { type: 'range', min: 50, max: 200, step: 10 },
    },
    onSwipeLeft: { action: 'swiped left' },
    onSwipeRight: { action: 'swiped right' },
    onSwipeStart: { action: 'swipe started' },
    onSwipeEnd: { action: 'swipe ended' },
  },
} satisfies Meta<typeof SwipeCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: '신선한 회가 일품인 횟집',
    description: '오마카세 코스로 먹었는데 정말 최고였어요. 회도 신선하고 사장님이 직접 설명해주셔서 더욱 맛있게 먹을 수 있었습니다.',
    rating: 4.5,
    location: '서초구 방배동 바다횟집',
    emoji: '🍣',
    threshold: 120,
  },
};

export const ItalianRestaurant: Story = {
  args: {
    title: '분위기 좋은 이탈리안 레스토랑',
    description: '크림 파스타가 정말 환상적이었어요. 면도 알덴테로 완벽하고 크림 소스도 진짜 진하고 맛있었습니다.',
    rating: 4.2,
    location: '강남구 논현동 맘마미아',
    emoji: '🍝',
  },
};

export const BrunchCafe: Story = {
  args: {
    title: '숨은 맛집 브런치 카페',
    description: '주말 브런치로 완벽한 곳을 발견했어요! 팬케이크가 정말 부드럽고 시럽도 진짜 메이플시럽이라 달콤함이 일품이었습니다.',
    rating: 4.8,
    location: '홍대입구 선셋카페',
    emoji: '🥞',
  },
};

export const Disabled: Story = {
  args: {
    ...Default.args,
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: '스와이프가 비활성화된 상태입니다.',
      },
    },
  },
};

export const LowThreshold: Story = {
  args: {
    ...Default.args,
    threshold: 60,
  },
  parameters: {
    docs: {
      description: {
        story: '낮은 임계값으로 설정되어 조금만 드래그해도 액션이 실행됩니다.',
      },
    },
  },
};

export const HighThreshold: Story = {
  args: {
    ...Default.args,
    threshold: 180,
  },
  parameters: {
    docs: {
      description: {
        story: '높은 임계값으로 설정되어 많이 드래그해야 액션이 실행됩니다.',
      },
    },
  },
};

export const WithCustomHandlers: Story = {
  args: {
    ...Default.args,
    onSwipeLeft: () => {
      alert('패스 했습니다!');
    },
    onSwipeRight: () => {
      alert('좋아요 했습니다!');
    },
  },
  parameters: {
    docs: {
      description: {
        story: '커스텀 핸들러가 설정된 예시입니다. 스와이프 시 알림이 표시됩니다.',
      },
    },
  },
};