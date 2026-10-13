import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { ProgressBarWithMetrics } from './ProgressBarWithMetrics';

const meta = {
  title: 'System Design/Molecules/ProgressBarWithMetrics',
  component: ProgressBarWithMetrics,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Resumo horizontal de progresso, prazo e alertas críticos da macroetapa.',
      },
    },
  },
  args: {
    onCriticalAlertClick: fn(),
  },
} satisfies Meta<typeof ProgressBarWithMetrics>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OnSchedule: Story = {
  args: {
    progressPercentage: 65.4,
    daysRemaining: 12,
    daysStatusText: 'No prazo',
    criticalStagesCount: 0,
  },
};

export const WithCriticalAlerts: Story = {
  args: {
    progressPercentage: 42.8,
    daysRemaining: -3,
    daysStatusText: 'Atraso crítico',
    criticalDelaysCount: 2,
  },
};
