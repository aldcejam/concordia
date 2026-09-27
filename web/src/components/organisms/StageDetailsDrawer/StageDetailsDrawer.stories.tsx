import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { StageDetailsDrawer } from './StageDetailsDrawer';
import { activeNode, delayedNode } from '@/system-design/fixtures';

const meta = {
  title: 'System Design/Organisms/StageDetailsDrawer',
  component: StageDetailsDrawer,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Gaveta de detalhes técnicos e ações de campo para medição, impedimento e adiantamento.',
      },
    },
  },
  args: {
    isOpen: true,
    node: activeNode,
    onClose: fn(),
    onSaveMeasurement: fn(),
    onReportImpediment: fn(),
    onAccelerate: fn(),
  },
} satisfies Meta<typeof StageDetailsDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ActiveMeasurement: Story = {};

export const DelayedStage: Story = {
  args: {
    node: delayedNode,
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
    node: null,
  },
};
