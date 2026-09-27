import React from 'react';
import type { DecorationItem, SectionBannerData, TimelineNodeData } from '@/types/timeline';
import { TimelineNodeItem } from '@/components/molecules/TimelineNodeItem';
import { SectionBanner } from '@/components/molecules/SectionBanner';
import { SiteDecoration } from '@/components/molecules/SiteDecoration';

export type TimelineNode = TimelineNodeData;

export interface ConstructionTimelineProps {
  nodes?: TimelineNodeData[];
  selectedNodeId?: string | null;
  activePopoverNodeId?: string | null;
  onSelectNode?: (node: TimelineNodeData) => void;
  onOpenDetails?: (node: TimelineNodeData) => void;
  onTogglePopover?: (node: TimelineNodeData) => void;
  onClosePopover?: () => void;
  sectionBanner?: SectionBannerData;
  banner?: SectionBannerData;
  decorations?: DecorationItem[];
  isLoading?: boolean;
  errorMessage?: string;
  className?: string;
}

export const ConstructionTimeline: React.FC<ConstructionTimelineProps> = ({ nodes, selectedNodeId, activePopoverNodeId, onSelectNode, onOpenDetails, onTogglePopover, onClosePopover, sectionBanner, banner, decorations, isLoading = false, errorMessage, className = '' }) => {
  const [internalPopoverId, setInternalPopoverId] = React.useState<string | null>(null);
  const currentPopoverId = activePopoverNodeId !== undefined ? activePopoverNodeId : internalPopoverId;
  const nodesToRender = nodes ?? [];
  const progress = nodesToRender.length ? nodesToRender.reduce((total, node) => total + Math.min(100, Math.max(0, node.progress)), 0) / nodesToRender.length : 0;
  const resolvedBanner = banner ?? sectionBanner ?? { tag: 'MACROETAPA ATUAL', title: 'SEÇÃO 2: INFRAESTRUTURA E DRENAGEM PROFUNDA', description: 'Execução de galerias, tubulações de PVC e caixas de passagem', stats: { totalServices: nodesToRender.length, completedServices: 0, criticalAlerts: 0 } };

  const handleTogglePopover = (node: TimelineNodeData) => { setInternalPopoverId(currentPopoverId === node.id ? null : node.id); onTogglePopover?.(node); onSelectNode?.(node); };
  const handleClosePopover = () => { setInternalPopoverId(null); onClosePopover?.(); };
  const handleOpenDetails = (node: TimelineNodeData) => { setInternalPopoverId(null); onClosePopover?.(); onOpenDetails?.(node); };

  return (
    <div className={`mx-auto max-w-[1500px] px-4 pb-24 pt-5 sm:px-6 lg:px-8 ${className}`}>
      <SectionBanner banner={resolvedBanner} onMemorialClick={resolvedBanner.onMemorialClick} />
      <section className="relative mx-auto mt-6 h-[1350px] max-w-5xl overflow-hidden sm:h-[1420px]" aria-label="Trilha do cronograma da obra">
        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 800 1350" preserveAspectRatio="none" aria-hidden="true">
          <path d="M 240 104 C 240 201.5, 400 201.5, 400 299 C 400 403, 560 403, 560 507 C 560 611, 392 611, 392 715 C 392 806, 232 806, 232 897 C 232 988, 384 988, 384 1079 C 384 1163.5, 552 1163.5, 552 1248" fill="none" stroke="var(--border)" strokeWidth="8" strokeLinecap="round" strokeDasharray="3 18" />
          <path d="M 240 104 C 240 201.5, 400 201.5, 400 299 C 400 403, 560 403, 560 507 C 560 611, 392 611, 392 715 C 392 806, 232 806, 232 897 C 232 988, 384 988, 384 1079 C 384 1163.5, 552 1163.5, 552 1248" fill="none" stroke="var(--primary)" strokeWidth="8" strokeLinecap="round" pathLength="100" strokeDasharray={`${progress} ${100 - progress}`} />
          <path d="M 392 715 C 170 790, 140 825, 232 897" fill="none" stroke="var(--gold)" strokeWidth="5" strokeLinecap="round" strokeDasharray="8 12" />
        </svg>
        <SiteDecoration decorations={decorations ?? []} />
        {isLoading && <div className="absolute inset-0 grid place-items-center rounded-xl border border-border bg-card/90 p-8 text-center" role="status"><p className="animate-pulse font-mono text-sm font-bold text-muted-foreground">Carregando trilha da obra…</p></div>}
        {!isLoading && errorMessage && <div className="absolute inset-0 grid place-items-center rounded-xl border border-warning/40 bg-warning-soft/90 p-8 text-center" role="alert"><p className="max-w-md text-sm font-bold text-warning">{errorMessage}</p></div>}
        {!isLoading && !errorMessage && nodesToRender.length === 0 && <div className="absolute inset-0 grid place-items-center rounded-xl border border-dashed border-border bg-card/80 p-8 text-center" role="status"><p className="max-w-md text-sm font-bold text-muted-foreground">Nenhum serviço cadastrado nesta macroetapa.</p></div>}
        {!isLoading && !errorMessage && nodesToRender.map((node) => <TimelineNodeItem key={node.id} node={node} isSelected={selectedNodeId === node.id} isPopoverOpen={currentPopoverId === node.id} onTogglePopover={handleTogglePopover} onClosePopover={handleClosePopover} onOpenDetails={handleOpenDetails} onSelectNode={onSelectNode} />)}
      </section>
    </div>
  );
};

ConstructionTimeline.displayName = 'ConstructionTimeline';
