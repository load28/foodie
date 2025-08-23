import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import TextArea from './TextArea';

const meta: Meta<typeof TextArea> = {
  title: 'Components/TextArea',
  component: TextArea,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['bordered'],
    },
    disabled: {
      control: 'boolean',
    },
    label: {
      control: 'text',
    },
    placeholder: {
      control: 'text',
    },
    value: {
      control: 'text',
    },
    rows: {
      control: { type: 'range', min: 2, max: 10, step: 1 },
    },
  },
};

export default meta;
type Story = StoryObj<typeof TextArea>;

export const Default: Story = {
  args: {
    label: '후기 작성',
    placeholder: '맛집에 대한 후기를 작성해주세요...',
    rows: 4,
  },
};

export const WithValue: Story = {
  args: {
    label: '맛집 후기',
    placeholder: '맛집에 대한 후기를 작성해주세요...',
    value: '정말 맛있었어요! 크림 파스타가 특히 인상깊었고, 분위기도 좋았습니다.',
    rows: 4,
  },
};

export const Disabled: Story = {
  args: {
    label: '비활성화',
    placeholder: '수정할 수 없습니다',
    disabled: true,
    rows: 3,
  },
};

export const LargeSize: Story = {
  args: {
    label: '긴 후기 작성',
    placeholder: '맛집에 대한 자세한 후기를 작성해주세요...',
    rows: 8,
  },
};