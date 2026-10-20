import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { TactileButton } from '@/components/atoms/TactileButton/TactileButton';
import { AppPageHeader } from './AppPageHeader';

const meta = {
  title: 'System Design/Organisms/AppPageHeader',
  component: AppPageHeader,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    eyebrow: 'UC01 · Nova obra',
    title: 'Importar orçamento',
    subtitle: 'Envie a planilha orçamentária (.xlsx) para gerar a EAP e a trilha da obra.',
    onBack: fn(),
    backLabel: 'Voltar para a trilha',
  },
} satisfies Meta<typeof AppPageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithStatsAndActions: Story = {
  args: {
    eyebrow: 'UC06 · Dependências construtivas',
    title: 'Complementação da obra EMCM',
    stats: [
      { label: 'Etapas', value: 160 },
      { label: 'Vínculos', value: 12 },
      { label: 'Bloqueadas', value: 4, tone: 'warning' },
      { label: 'Liberadas', value: 156, tone: 'gold' },
    ],
    actions: <TactileButton variant="action">Ver trilha</TactileButton>,
  },
};
export const WithoutBack: Story = { args: { onBack: undefined } };
