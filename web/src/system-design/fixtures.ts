import { DEFAULT_DECORATIONS } from '@/mocks/decorations';
import { DEFAULT_TIMELINE_NODES } from '@/mocks/timeline';
import type { SectionBannerData, Stage, TimelineNodeData } from '@/types/timeline';

export const storyNodes: TimelineNodeData[] = DEFAULT_TIMELINE_NODES;
export const activeNode = storyNodes.find((node) => node.status === 'in_progress') ?? storyNodes[0];
export const delayedNode = storyNodes.find((node) => node.status === 'delayed') ?? storyNodes[0];
export const storyDecorations = DEFAULT_DECORATIONS;

export const storyBanner: SectionBannerData = {
  tag: 'SYSTEM DESIGN',
  title: 'SEÇÃO 2: INFRAESTRUTURA E DRENAGEM',
  description: 'Exemplo determinístico de uma macroetapa da trilha.',
  stats: {
    totalServices: 7,
    completedServices: 2,
    criticalAlerts: 1,
  },
};

export const storyStages: Stage[] = storyNodes.slice(0, 5).map((node, index) => ({
  id: index + 1,
  x: Number.parseInt(node.position.left, 10) / 10,
  y: (index + 1) * 5,
  name: node.title,
  code: node.eapCode,
  detail: node.technicalDescription ?? node.subtitle,
  state:
    node.status === 'completed'
      ? 'done'
      : node.status === 'in_progress'
        ? 'active'
        : node.status === 'accelerate'
          ? 'boost'
          : node.status,
  progress: node.progress,
  planned: node.planned ?? '8 dias',
  actual: node.actual ?? '5 dias',
}));
