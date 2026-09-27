import path from 'node:path';
import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
  stories: [
    '../src/components/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../src/system-design/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    {
      name: '@storybook/addon-mcp',
      options: {
        endpoint: '/mcp',
      },
    },
  ],
  framework: '@storybook/react-vite',
  features: {
    componentsManifest: true,
  },
  async viteFinal(viteConfig) {
    return mergeConfig(viteConfig, {
      resolve: {
        alias: {
          '@': path.resolve(process.cwd(), 'src'),
        },
      },
    });
  },
};

export default config;
