import type { Meta, StoryObj } from '@storybook/react-vite';
import { TactileNode } from './TactileNode';

const meta = {
  title: 'System Design/Atoms/TactileNode',
  component: TactileNode,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Nó circular da trilha com profundidade 3D, ícone semântico e anel de progresso.',
      },
    },
  },
  argTypes: {
    status: {
      control: 'select',
      options: ['completed', 'in_progress', 'delayed', 'accelerate', 'locked', 'planned', 'milestone'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof TactileNode>;

export default meta;
type Story = StoryObj<typeof meta>;

export const StatusGallery: Story = {
  args: {
    status: 'completed',
  },
  render: () => (
    <div className="flex flex-wrap items-center justify-center gap-8 p-6">
      <div className="space-y-3 text-center text-xs font-bold text-muted-foreground"><TactileNode status="completed" /><p>CONCLUÍDO</p></div>
      <div className="space-y-3 text-center text-xs font-bold text-muted-foreground"><TactileNode status="in_progress" progress={65} /><p>EM EXECUÇÃO</p></div>
      <div className="space-y-3 text-center text-xs font-bold text-muted-foreground"><TactileNode status="delayed" /><p>ATRASADA</p></div>
      <div className="space-y-3 text-center text-xs font-bold text-muted-foreground"><TactileNode status="accelerate" /><p>ADIANTÁVEL</p></div>
      <div className="space-y-3 text-center text-xs font-bold text-muted-foreground"><TactileNode status="locked" /><p>BLOQUEADA</p></div>
      <div className="space-y-3 text-center text-xs font-bold text-muted-foreground"><TactileNode status="planned" /><p>ORÇADA • SEM MEDIÇÃO</p></div>
      <div className="space-y-3 text-center text-xs font-bold text-muted-foreground"><TactileNode status="milestone" size="lg" progress={43} /><p>MARCO</p></div>
    </div>
  ),
};

export const SelectedActiveNode: Story = {
  args: {
    status: 'in_progress',
    progress: 65,
    isSelected: true,
    ariaLabel: 'Tubulação em execução, 65 por cento',
  },
};
