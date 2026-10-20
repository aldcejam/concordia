import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { etapasDependenciasFixture } from '@/system-design/importacaoFixtures';
import { DependencyEditor } from './DependencyEditor';

const [fundacao, estrutura, alvenaria, drenagem] = etapasDependenciasFixture;

const meta = {
  title: 'System Design/Organisms/DependencyEditor',
  component: DependencyEditor,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Edição dos vínculos de precedência de uma etapa (UC06). Ciclos são recusados pela API e exibidos em `error`.',
      },
    },
  },
  decorators: [(Story) => <div className="max-w-2xl"><Story /></div>],
  args: {
    etapa: estrutura,
    etapas: etapasDependenciasFixture,
    onAdd: fn(),
    onRemove: fn(),
    onDismissError: fn(),
  },
} satisfies Meta<typeof DependencyEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithLinks: Story = {};
export const Blocked: Story = { args: { etapa: alvenaria } };
export const NoLinks: Story = { args: { etapa: drenagem } };
export const OnlySuccessors: Story = { args: { etapa: fundacao } };
export const Adding: Story = { args: { adding: true } };
export const CycleRejected: Story = {
  args: {
    etapa: fundacao,
    error:
      'Vínculo recusado: criaria um ciclo na EAP (5.1.1 → 3.1.1 → 4.1.1 → 5.1.1). Uma etapa não pode depender, direta ou indiretamente, de si mesma.',
  },
};
