

/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
  framework: "@storybook/react-vite",
  stories: [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-controls",
    "@storybook/addon-actions",
    "@storybook/addon-viewport",
    "@storybook/addon-backgrounds"
  ],
  docs: {
    autodocs: 'tag'
  },
  staticDirs: ['../public'],
};

export default config;