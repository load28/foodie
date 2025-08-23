import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Typography from './Typography';

const meta: Meta<typeof Typography> = {
  title: 'Design System/Typography',
  component: Typography,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'FoodieShare 디자인 시스템의 타이포그래피 가이드입니다. 헤딩, 본문 텍스트, 폰트 패밀리 등 모든 텍스트 스타일을 확인할 수 있습니다.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Typography>;

export const Default: Story = {};