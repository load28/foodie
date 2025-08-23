import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Button from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'ghost'],
    },
    size: {
      control: { type: 'select' },
      options: ['medium', 'small'],
    },
    disabled: {
      control: 'boolean',
    },
    children: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: '주문하기',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: '취소',
    variant: 'secondary',
  },
};

export const Ghost: Story = {
  args: {
    children: '더보기',
    variant: 'ghost',
  },
};

export const Small: Story = {
  args: {
    children: '작은 버튼',
    size: 'small',
  },
};

export const Disabled: Story = {
  args: {
    children: '비활성화',
    disabled: true,
  },
};

export const AllVariants = () => (
  <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
    <Button variant="primary">Primary</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="ghost">Ghost</Button>
    <Button size="small">Small</Button>
    <Button disabled>Disabled</Button>
  </div>
);