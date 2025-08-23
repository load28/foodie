import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import TextField from './TextField';

const meta: Meta<typeof TextField> = {
  title: 'Components/TextField',
  component: TextField,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['underline', 'bordered'],
    },
    state: {
      control: { type: 'select' },
      options: ['default', 'error', 'success'],
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
    type: {
      control: { type: 'select' },
      options: ['text', 'email', 'password', 'tel', 'url'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof TextField>;

export const Underline: Story = {
  args: {
    variant: 'underline',
    label: '맛집 이름',
    placeholder: '맛집 이름을 적어주세요',
  },
};

export const Bordered: Story = {
  args: {
    variant: 'bordered',
    label: '이메일',
    placeholder: '이메일 주소를 입력해주세요',
    type: 'email',
  },
};

export const Error: Story = {
  args: {
    variant: 'bordered',
    state: 'error',
    label: '비밀번호',
    placeholder: '비밀번호를 입력해주세요',
    type: 'password',
    value: '123',
    errorMessage: '비밀번호는 8자 이상이어야 합니다.',
  },
};

export const Success: Story = {
  args: {
    variant: 'bordered',
    state: 'success',
    label: '닉네임',
    placeholder: '닉네임을 입력해주세요',
    value: '푸디러버',
    successMessage: '사용 가능한 닉네임입니다.',
  },
};

export const Disabled: Story = {
  args: {
    variant: 'bordered',
    label: '사용자 ID',
    placeholder: '자동 생성됩니다',
    disabled: true,
  },
};

export const AllVariants = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '400px' }}>
    <TextField
      variant="underline"
      label="언더라인 스타일"
      placeholder="맛집 이름을 적어주세요"
    />
    <TextField
      variant="bordered"
      label="테두리 스타일"
      type="email"
      placeholder="이메일 주소를 입력해주세요"
    />
    <TextField
      variant="bordered"
      state="error"
      label="에러 상태"
      type="password"
      placeholder="비밀번호를 입력해주세요"
      defaultValue="123"
      errorMessage="비밀번호는 8자 이상이어야 합니다."
    />
    <TextField
      variant="bordered"
      state="success"
      label="성공 상태"
      placeholder="닉네임을 입력해주세요"
      defaultValue="푸디러버"
      successMessage="사용 가능한 닉네임입니다."
    />
    <TextField
      variant="bordered"
      label="비활성화"
      placeholder="자동 생성됩니다"
      disabled
    />
  </div>
);