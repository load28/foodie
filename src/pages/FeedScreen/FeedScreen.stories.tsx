import type { Meta, StoryObj } from "@storybook/react";
import FeedScreen from "./FeedScreen";

const meta: Meta<typeof FeedScreen> = {
  title: "Pages/FeedScreen",
  component: FeedScreen,
  parameters: {
    layout: "fullscreen",
    viewport: {
      defaultViewport: "mobile1",
    },
    docs: {
      description: {
        component: "FoodieShare의 피드 화면입니다. 사용자들이 공유한 맛집 정보를 볼 수 있습니다.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Desktop: Story = {
  args: {},
  parameters: {
    viewport: {
      defaultViewport: "responsive",
    },
  },
};