import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { TimelineHeader } from './TimelineHeader';

const meta = {
  title: 'System Design/Organisms/TimelineHeader',
  component: TimelineHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Cabeçalho sticky da obra com identidade do contrato, progresso consolidado e acesso ao memorial.',
      },
    },
  },
  args: {
    projectTitle: 'Residencial Vista Verde',
    contractCode: 'OBRA CV-0248',
    phaseTitle: 'FASE 2: INFRAESTRUTURA',
    progressPercentage: 65.4,
    daysRemaining: 12,
    daysStatusText: 'No prazo',
    criticalStagesCount: 1,
    onOpenMemorialGuide: fn(),
    onCriticalAlertClick: fn(),
  },
} satisfies Meta<typeof TimelineHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CurrentProject: Story = {};

export const CriticalSchedule: Story = {
  args: {
    progressPercentage: 42.8,
    daysRemaining: -3,
    daysStatusText: 'Atraso crítico',
    criticalStagesCount: 3,
  },
};
