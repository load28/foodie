import type { Meta, StoryObj } from '@storybook/react';
import { ResponsiveImage, ImageUrls } from './ResponsiveImage';

const meta: Meta<typeof ResponsiveImage> = {
  title: 'Components/ResponsiveImage',
  component: ResponsiveImage,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof ResponsiveImage>;

// 샘플 이미지 URL (플레이스홀더)
const sampleImageUrls: ImageUrls = {
  thumbnail: {
    webp: 'https://via.placeholder.com/300x169/4CAF50/FFFFFF?text=Thumb+WebP',
    jpeg: 'https://via.placeholder.com/300x169/4CAF50/FFFFFF?text=Thumb+JPEG',
  },
  medium: {
    webp: 'https://via.placeholder.com/800x450/4CAF50/FFFFFF?text=Medium+WebP',
    jpeg: 'https://via.placeholder.com/800x450/4CAF50/FFFFFF?text=Medium+JPEG',
  },
  large: {
    webp: 'https://via.placeholder.com/1920x1080/4CAF50/FFFFFF?text=Large+WebP',
    jpeg: 'https://via.placeholder.com/1920x1080/4CAF50/FFFFFF?text=Large+JPEG',
  },
};

export const Default: Story = {
  args: {
    imageUrls: sampleImageUrls,
    alt: '맛있는 음식',
  },
};

export const EagerLoading: Story = {
  args: {
    imageUrls: sampleImageUrls,
    alt: '맛있는 음식',
    loading: 'eager',
  },
};

export const CustomSizes: Story = {
  args: {
    imageUrls: sampleImageUrls,
    alt: '맛있는 음식',
    sizes: '(max-width: 600px) 100vw, 600px',
  },
};

export const InContainer: Story = {
  args: {
    imageUrls: sampleImageUrls,
    alt: '맛있는 음식',
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
};
