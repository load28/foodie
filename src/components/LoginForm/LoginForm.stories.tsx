import type { Meta, StoryObj } from "@storybook/react";
import LoginForm from "./LoginForm";

const meta: Meta<typeof LoginForm> = {
  title: "Components/LoginForm",
  component: LoginForm,
  parameters: {
    layout: "fullscreen",
    viewport: {
      defaultViewport: "mobile1",
    },
  },
  argTypes: {
    onSubmit: { action: "submitted" },
    isLoading: {
      control: { type: "boolean" },
    },
    error: {
      control: { type: "text" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onSubmit: (email: string, password: string) => {
      console.log("Login attempt:", { email, password });
    },
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
    onSubmit: (email: string, password: string) => {
      console.log("Login attempt:", { email, password });
    },
  },
};

export const ServerError: Story = {
  args: {
    error: "잠시 후 다시 시도해주세요.",
    onSubmit: (email: string, password: string) => {
      console.log("Login attempt:", { email, password });
    },
  },
};
