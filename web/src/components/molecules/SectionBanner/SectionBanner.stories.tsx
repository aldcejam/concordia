import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { SectionBanner } from './SectionBanner';

const meta = {
  title: 'System Design/Molecules/SectionBanner',
  component: SectionBanner,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Banner de macroetapa que contextualiza a trilha e oferece acesso ao memorial técnico.',
      },
    },
  },
  args: {
    onMemorialClick: fn(),
  },
} satisfies Meta<typeof SectionBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CurrentPhase: Story = {
  args: {
    tag: 'MACROETAPA ATUAL',
    title: 'SEÇÃO 2: INFRAESTRUTURA E DRENAGEM PROFUNDA',
    description: 'Execução de galerias, tubulações de PVC e caixas de passagem.',
    stats: {
      totalServices: 7,
      completedServices: 2,
      criticalAlerts: 1,
    },
  },
};

export const EmptyProgress: Story = {
  args: {
    title: 'SEÇÃO 3: ESTRUTURA',
    description: 'Nenhum serviço foi iniciado nesta macroetapa.',
    stats: {
      totalServices: 0,
      completedServices: 0,
      criticalAlerts: 0,
    },
  },
};
