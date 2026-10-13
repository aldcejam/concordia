import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { StagePopover } from './StagePopover';
import { activeNode } from '@/system-design/fixtures';

const meta = {
  title: 'System Design/Molecules/StagePopover',
  component: StagePopover,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Resumo contextual aberto ao tocar em um nó, com status, progresso, prazo e próxima ação.',
      },
    },
  },
  args: {
    isOpen: true,
    stage: activeNode,
    onClose: fn(),
    onOpenDetails: fn(),
  },
} satisfies Meta<typeof StagePopover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  render: (args) => <div className="relative h-96 w-[26rem]"><StagePopover {...args} /></div>,
};

export const Closed: Story = {
  args: {
    isOpen: false,
  },
};
