import type { Meta, StoryObj } from '@storybook/react';
import CardStack from './CardStack';

const meta = {
  title: 'Components/CardStack',
  component: CardStack,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '카드들을 스택 형태로 배치하고 스와이프 인터랙션을 관리하는 컴포넌트입니다.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    maxVisible: {
      description: '동시에 보여줄 최대 카드 수',
      control: { type: 'range', min: 1, max: 5, step: 1 },
    },
    stackOffset: {
      description: '카드 간 간격 (픽셀)',
      control: { type: 'range', min: 4, max: 20, step: 2 },
    },
    onSwipeLeft: { action: 'swiped left' },
    onSwipeRight: { action: 'swiped right' },
    onStackEmpty: { action: 'stack empty' },
  },
} satisfies Meta<typeof CardStack>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleCards = [
  {
    id: 1,
    title: '신선한 회가 일품인 횟집',
    description: '오마카세 코스로 먹었는데 정말 최고였어요. 회도 신선하고 사장님이 직접 설명해주셔서 더욱 맛있게 먹을 수 있었습니다.',
    rating: 4.5,
    location: '서초구 방배동 바다횟집',
    emoji: '🍣',
  },
  {
    id: 2,
    title: '분위기 좋은 이탈리안 레스토랑',
    description: '크림 파스타가 정말 환상적이었어요. 면도 알덴테로 완벽하고 크림 소스도 진짜 진하고 맛있었습니다.',
    rating: 4.2,
    location: '강남구 논현동 맘마미아',
    emoji: '🍝',
  },
  {
    id: 3,
    title: '숨은 맛집 브런치 카페',
    description: '주말 브런치로 완벽한 곳을 발견했어요! 팬케이크가 정말 부드럽고 시럽도 진짜 메이플시럽이라 달콤함이 일품이었습니다.',
    rating: 4.8,
    location: '홍대입구 선셋카페',
    emoji: '🥞',
  },
  {
    id: 4,
    title: '정통 일본식 라멘집',
    description: '진짜 일본에서 먹는 라멘 맛이에요! 돈코츠 라멘의 진한 국물과 쫄깃한 면발이 환상적입니다.',
    rating: 4.7,
    location: '신사동 라멘야',
    emoji: '🍜',
  },
  {
    id: 5,
    title: '힐링되는 한옥 카페',
    description: '전통 한옥을 개조한 카페인데 분위기가 정말 좋아요. 전통차와 한과도 맛있고 사진찍기에도 예쁜 곳이에요.',
    rating: 4.3,
    location: '인사동 한옥마루',
    emoji: '🍵',
  },
];

export const Default: Story = {
  args: {
    cards: sampleCards,
    maxVisible: 3,
    stackOffset: 8,
  },
};

export const SingleCard: Story = {
  args: {
    cards: [sampleCards[0]],
    maxVisible: 3,
    stackOffset: 8,
  },
  parameters: {
    docs: {
      description: {
        story: '카드가 하나만 있는 경우입니다.',
      },
    },
  },
};

export const TwoCards: Story = {
  args: {
    cards: sampleCards.slice(0, 2),
    maxVisible: 3,
    stackOffset: 8,
  },
  parameters: {
    docs: {
      description: {
        story: '카드가 두 개 있는 경우입니다.',
      },
    },
  },
};

export const MaxVisibleTwo: Story = {
  args: {
    cards: sampleCards,
    maxVisible: 2,
    stackOffset: 8,
  },
  parameters: {
    docs: {
      description: {
        story: '최대 2개의 카드만 동시에 표시하는 경우입니다.',
      },
    },
  },
};

export const LargeStackOffset: Story = {
  args: {
    cards: sampleCards,
    maxVisible: 3,
    stackOffset: 16,
  },
  parameters: {
    docs: {
      description: {
        story: '카드 간 간격이 큰 경우입니다.',
      },
    },
  },
};

export const SmallStackOffset: Story = {
  args: {
    cards: sampleCards,
    maxVisible: 3,
    stackOffset: 4,
  },
  parameters: {
    docs: {
      description: {
        story: '카드 간 간격이 작은 경우입니다.',
      },
    },
  },
};

export const EmptyStack: Story = {
  args: {
    cards: [],
    maxVisible: 3,
    stackOffset: 8,
  },
  parameters: {
    docs: {
      description: {
        story: '카드가 없는 빈 스택 상태입니다.',
      },
    },
  },
};

export const CustomEmptyState: Story = {
  args: {
    cards: [],
    maxVisible: 3,
    stackOffset: 8,
    renderEmptyState: () => (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '48px', marginBottom: '1rem' }}>🎯</div>
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>커스텀 빈 상태</h3>
        <p style={{ margin: 0, color: '#666' }}>새로운 카드를 추가해보세요!</p>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: '커스텀 빈 상태 렌더링 예시입니다.',
      },
    },
  },
};