import type { Meta, StoryObj } from '@storybook/react-vite';
import { SnakePath } from './SnakePath';
import { storyStages } from '@/system-design/fixtures';

const meta = {
  title: 'System Design/Molecules/SnakePath',
  component: SnakePath,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Conector SVG pontilhado que transforma a sequência de serviços em uma trilha de progresso.',
      },
    },
  },
} satisfies Meta<typeof SnakePath>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ProgressTrail: Story = {
  args: {
    stages: storyStages,
  },
  render: (args) => <div className="relative h-[620px] w-full max-w-2xl bg-background"><SnakePath {...args} /></div>,
};
