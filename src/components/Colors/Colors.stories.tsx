import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Colors from './Colors';

const meta: Meta<typeof Colors> = {
  title: 'Design System/Colors',
  component: Colors,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'FoodieShare 디자인 시스템의 컬러 팔레트입니다. 각 컬러를 클릭하면 hex 코드가 클립보드에 복사됩니다.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Colors>;

export const Default: Story = {};