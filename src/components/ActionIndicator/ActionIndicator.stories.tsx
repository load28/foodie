import type { Meta, StoryObj } from '@storybook/react';
import ActionIndicator from './ActionIndicator';

const meta = {
  title: 'Components/ActionIndicator',
  component: ActionIndicator,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '스와이프 액션을 시각적으로 나타내는 인디케이터 컴포넌트입니다.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      description: '액션 타입',
      control: 'select',
      options: ['like', 'pass', 'super-like'],
    },
    visible: {
      description: '표시 여부',
      control: 'boolean',
    },
    intensity: {
      description: '강도 (0-1)',
      control: { type: 'range', min: 0, max: 1, step: 0.1 },
    },
    position: {
      description: '위치',
      control: 'select',
      options: ['left', 'right', 'top'],
    },
    size: {
      description: '크기',
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
  },
} satisfies Meta<typeof ActionIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Like: Story = {
  args: {
    type: 'like',
    visible: true,
    intensity: 0.7,
    position: 'right',
    size: 'medium',
  },
};

export const Pass: Story = {
  args: {
    type: 'pass',
    visible: true,
    intensity: 0.7,
    position: 'left',
    size: 'medium',
  },
};

export const SuperLike: Story = {
  args: {
    type: 'super-like',
    visible: true,
    intensity: 0.7,
    position: 'top',
    size: 'medium',
  },
};

export const Hidden: Story = {
  args: {
    type: 'like',
    visible: false,
    intensity: 0.7,
    position: 'right',
    size: 'medium',
  },
  parameters: {
    docs: {
      description: {
        story: '숨겨진 상태의 인디케이터입니다.',
      },
    },
  },
};

export const LowIntensity: Story = {
  args: {
    type: 'like',
    visible: true,
    intensity: 0.3,
    position: 'right',
    size: 'medium',
  },
  parameters: {
    docs: {
      description: {
        story: '낮은 강도로 표시되는 인디케이터입니다.',
      },
    },
  },
};

export const HighIntensity: Story = {
  args: {
    type: 'like',
    visible: true,
    intensity: 1.0,
    position: 'right',
    size: 'medium',
  },
  parameters: {
    docs: {
      description: {
        story: '높은 강도로 표시되는 인디케이터입니다.',
      },
    },
  },
};

export const SmallSize: Story = {
  args: {
    type: 'like',
    visible: true,
    intensity: 0.7,
    position: 'right',
    size: 'small',
  },
};

export const LargeSize: Story = {
  args: {
    type: 'like',
    visible: true,
    intensity: 0.7,
    position: 'right',
    size: 'large',
  },
};

export const AllTypes: Story = {
  render: () => (
    <div style={{ position: 'relative', width: '300px', height: '200px', border: '2px dashed #ddd', borderRadius: '8px' }}>
      <ActionIndicator
        type="pass"
        visible={true}
        intensity={0.7}
        position="left"
        size="medium"
      />
      <ActionIndicator
        type="like"
        visible={true}
        intensity={0.7}
        position="right"
        size="medium"
      />
      <ActionIndicator
        type="super-like"
        visible={true}
        intensity={0.7}
        position="top"
        size="medium"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '모든 액션 타입과 위치를 한 번에 보여주는 예시입니다.',
      },
    },
  },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: '80px', height: '80px', border: '1px dashed #ddd', borderRadius: '8px' }}>
        <ActionIndicator
          type="like"
          visible={true}
          intensity={0.7}
          position="right"
          size="small"
        />
      </div>
      <div style={{ position: 'relative', width: '100px', height: '100px', border: '1px dashed #ddd', borderRadius: '8px' }}>
        <ActionIndicator
          type="like"
          visible={true}
          intensity={0.7}
          position="right"
          size="medium"
        />
      </div>
      <div style={{ position: 'relative', width: '120px', height: '120px', border: '1px dashed #ddd', borderRadius: '8px' }}>
        <ActionIndicator
          type="like"
          visible={true}
          intensity={0.7}
          position="right"
          size="large"
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '다양한 크기의 인디케이터를 비교하는 예시입니다.',
      },
    },
  },
};