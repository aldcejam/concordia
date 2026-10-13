import type { Meta, StoryObj } from '@storybook/react-vite';
import { SystemDesignOverview } from './SystemDesignOverview';

const meta = {
  title: 'System Design/Overview',
  component: SystemDesignOverview,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Página de referência do tema, tokens e organização Atomic Design do Concordia.',
      },
    },
  },
} satisfies Meta<typeof SystemDesignOverview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Catalog: Story = {};
