import type { Meta, StoryObj } from '@storybook/react';
import FlipFeedScreen from './FlipFeedScreen';

const meta = {
  title: 'Pages/FlipFeedScreen',
  component: FlipFeedScreen,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: '데이트 앱 스타일의 카드 플립 피드 화면입니다. 사용자는 카드를 스와이프하여 맛집을 선택할 수 있습니다.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FlipFeedScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: '기본 플립 피드 화면입니다. 카드를 좌우로 스와이프하여 맛집을 선택할 수 있습니다.',
      },
    },
  },
};

export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: '모바일 화면에서의 플립 피드입니다.',
      },
    },
  },
};

export const Tablet: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    docs: {
      description: {
        story: '태블릿 화면에서의 플립 피드입니다.',
      },
    },
  },
};

// 스토리북에서 인터랙션을 시뮬레이션하기 위한 예시
export const WithInteraction: Story = {
  parameters: {
    docs: {
      description: {
        story: `
플립 피드 화면의 주요 기능들:

**스와이프 인터랙션:**
- 좌측 스와이프: 맛집을 패스합니다
- 우측 스와이프: 맛집을 좋아요 합니다
- 마우스 드래그 또는 터치로 조작 가능

**진행 상황 추적:**
- 하단에 현재 진행 상황이 표시됩니다
- 좋아요/패스 개수가 실시간으로 업데이트됩니다

**빈 상태 처리:**
- 모든 카드를 완료하면 완료 화면이 표시됩니다
- 다시 시작하기 버튼으로 새로운 세션을 시작할 수 있습니다
        `,
      },
    },
  },
};