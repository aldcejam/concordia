import { Activity, Coins, TriangleAlert } from 'lucide-react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { MetricChip } from './MetricChip';

const meta = {
  title: 'System Design/Atoms/MetricChip',
  component: MetricChip,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Chip compacto para métricas físico-financeiras, status de obra e dados técnicos em IBM Plex Mono.',
      },
    },
  },
  args: {
    onClick: fn(),
  },
} satisfies Meta<typeof MetricChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: 'PROGRESSO', value: '65%' },
};

export const SemanticStates: Story = {
  args: {
    label: 'MÉTRICAS',
  },
  render: () => (
    <div className="flex flex-wrap gap-3">
      <MetricChip label="SAÚDE" value="92" variant="success" icon={<Activity size={14} />} />
      <MetricChip label="VALOR MEDIDO" value="R$ 39,5k" variant="primary" icon={<Coins size={14} />} />
      <MetricChip label="ALERTAS" value={1} variant="warning" icon={<TriangleAlert size={14} />} />
      <MetricChip label="ADIANTÁVEL" value="2" variant="action" />
    </div>
  ),
};
