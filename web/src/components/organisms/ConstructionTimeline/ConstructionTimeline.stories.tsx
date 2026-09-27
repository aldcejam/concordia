import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { ConstructionTimeline } from './ConstructionTimeline';
import { storyBanner, storyDecorations, storyNodes } from '@/system-design/fixtures';

const meta = {
  title: 'System Design/Organisms/ConstructionTimeline',
  component: ConstructionTimeline,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Organismo principal da experiência: banner, caminho SVG, nós da trilha e decorações do canteiro.',
      },
    },
  },
  args: {
    nodes: storyNodes,
    sectionBanner: storyBanner,
    decorations: storyDecorations,
    onSelectNode: fn(),
    onOpenDetails: fn(),
    onTogglePopover: fn(),
    onClosePopover: fn(),
  },
} satisfies Meta<typeof ConstructionTimeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FullTrail: Story = {};

export const EmptyState: Story = {
  args: {
    nodes: [],
    sectionBanner: {
      ...storyBanner,
      title: 'SEÇÃO SEM SERVIÇOS CADASTRADOS',
      description: 'A EAP desta macroetapa ainda não possui serviços disponíveis.',
      stats: { totalServices: 0, completedServices: 0, criticalAlerts: 0 },
    },
  },
};

export const Loading: Story = {
  args: { nodes: [], isLoading: true },
};

export const ErrorState: Story = {
  args: { nodes: [], errorMessage: 'Não foi possível carregar a trilha desta obra. Tente novamente.' },
};

export const Responsive: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};

export const DarkMode: Story = {
  globals: { theme: 'dark' },
};
