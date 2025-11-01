import type { Meta, StoryObj } from '@storybook/react';
import { ImageUpload } from './ImageUpload';

const meta: Meta<typeof ImageUpload> = {
  title: 'Components/ImageUpload',
  component: ImageUpload,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof ImageUpload>;

export const Default: Story = {
  args: {
    onImageSelect: (dataUri) => console.log('Image selected:', dataUri.substring(0, 50) + '...'),
    onImageRemove: () => console.log('Image removed'),
  },
};

export const WithMaxSize: Story = {
  args: {
    maxSize: 2 * 1024 * 1024, // 2MB
    onImageSelect: (dataUri) => console.log('Image selected:', dataUri.substring(0, 50) + '...'),
    onImageRemove: () => console.log('Image removed'),
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const WithPreview: Story = {
  args: {
    value: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNENBRjUwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI0OCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TYW1wbGUgSW1hZ2U8L3RleHQ+PC9zdmc+',
    onImageSelect: (dataUri) => console.log('Image selected:', dataUri.substring(0, 50) + '...'),
    onImageRemove: () => console.log('Image removed'),
  },
};
