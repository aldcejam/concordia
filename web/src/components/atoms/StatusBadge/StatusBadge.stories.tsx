import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatusBadge, type StatusBadgeVariant } from './StatusBadge';

const meta = {
  title: 'System Design/Atoms/StatusBadge',
  component: StatusBadge,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Badge semântico da trilha, com ícone Lucide e variante alinhada ao estado da etapa.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['in_progress', 'accelerate', 'completed', 'delayed', 'locked', 'milestone'],
    },
  },
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

const variants: StatusBadgeVariant[] = [
  'completed',
  'in_progress',
  'delayed',
  'accelerate',
  'locked',
  'milestone',
];

export const AllStatuses: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      {variants.map((variant) => (
        <StatusBadge key={variant} variant={variant} />
      ))}
    </div>
  ),
};

export const CustomLabel: Story = {
  args: {
    variant: 'accelerate',
    label: 'FRENTE LIBERADA',
    floating: false,
  },
};
