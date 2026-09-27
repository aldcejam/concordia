import type { DecorationItem } from '@/types/timeline';

export const DEFAULT_DECORATIONS: DecorationItem[] = [
  { id: 'dec-epi', type: 'epi-sign', position: { left: '3%', top: '15%' }, title: 'ATENÇÃO', subtitle: 'USO DE EPI' },
  { id: 'dec-front', type: 'front-office', position: { right: '3%', top: '29%' }, title: 'CONCORDIA • OBRAS', subtitle: 'FRENTE DE SERVIÇO 02' },
  { id: 'dec-support', type: 'support-zone', position: { left: '7%', top: '47%' }, title: 'APOIO' },
  { id: 'dec-landmark', type: 'survey-pin', position: { right: '8%', top: '66%' } },
  { id: 'dec-materials', type: 'material-pallets', position: { left: '5%', top: '82%' } },
];
