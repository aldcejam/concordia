import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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

const PAGE_SIZE = 7;
const CANVAS_HEIGHT = 1350;
const NODE_POSITIONS = [
  { left: '30%', top: '8%' },
  { left: '50%', top: '23%' },
  { left: '70%', top: '39%' },
  { left: '49%', top: '55%' },
  { left: '29%', top: '69%' },
  { left: '48%', top: '83%' },
  { left: '69%', top: '96%' },
] as const;
const PATH_POINTS = [
  { x: 240, y: 108 },
  { x: 400, y: 310.5 },
  { x: 560, y: 526.5 },
  { x: 392, y: 742.5 },
  { x: 232, y: 931.5 },
  { x: 384, y: 1120.5 },
  { x: 552, y: 1296 },
];

function createPath(pointCount: number) {
  return PATH_POINTS.slice(0, pointCount).reduce((path, point, index, points) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    const previous = points[index - 1];
    const middleY = (previous.y + point.y) / 2;
    return `${path} C ${previous.x} ${middleY}, ${point.x} ${middleY}, ${point.x} ${point.y}`;
  }, '');
}

export const ConstructionTimeline: React.FC<ConstructionTimelineProps> = ({ nodes, selectedNodeId, activePopoverNodeId, onSelectNode, onOpenDetails, onTogglePopover, onClosePopover, sectionBanner, banner, decorations, isLoading = false, errorMessage, className = '' }) => {
  const [internalPopoverId, setInternalPopoverId] = React.useState<string | null>(null);
  const [pageIndex, setPageIndex] = React.useState(0);
  const timelineRef = React.useRef<HTMLElement>(null);
  const currentPopoverId = activePopoverNodeId !== undefined ? activePopoverNodeId : internalPopoverId;
  const nodesToRender = nodes ?? [];
  const pageCount = Math.max(1, Math.ceil(nodesToRender.length / PAGE_SIZE));
  const currentPage = Math.min(pageIndex, pageCount - 1);
  const pageStart = currentPage * PAGE_SIZE;
  const visibleNodes = nodesToRender.slice(pageStart, pageStart + PAGE_SIZE).map((node, index) => ({
    ...node,
    position: NODE_POSITIONS[index],
  }));
  const totalWeight = visibleNodes.reduce((total, node) => total + Number(node.budgetedValue ?? 0), 0);
  const progress = totalWeight > 0
    ? visibleNodes.reduce((total, node) => total + Math.min(100, Math.max(0, node.progress)) * Number(node.budgetedValue ?? 0), 0) / totalWeight
    : visibleNodes.length ? visibleNodes.reduce((total, node) => total + Math.min(100, Math.max(0, node.progress)), 0) / visibleNodes.length : 0;
  const resolvedBanner = banner ?? sectionBanner;
  const path = createPath(visibleNodes.length);

  const handleTogglePopover = (node: TimelineNodeData) => { setInternalPopoverId(currentPopoverId === node.id ? null : node.id); onTogglePopover?.(node); onSelectNode?.(node); };
  const handleClosePopover = () => { setInternalPopoverId(null); onClosePopover?.(); };
  const handleOpenDetails = (node: TimelineNodeData) => { setInternalPopoverId(null); onClosePopover?.(); onOpenDetails?.(node); };
  const changePage = (nextPage: number) => {
    setPageIndex(nextPage);
    setInternalPopoverId(null);
    onClosePopover?.();
  };
  React.useEffect(() => {
    if (currentPage > 0) timelineRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [currentPage]);

  const renderPagination = () => nodesToRender.length > PAGE_SIZE && (
    <nav className="mx-auto mt-6 flex max-w-5xl items-center justify-between gap-3 rounded-2xl border border-border bg-card/90 p-3 shadow-sm sm:px-5" aria-label="Navegação da trilha">
      <button type="button" onClick={() => changePage(currentPage - 1)} disabled={currentPage === 0} className="inline-flex min-h-12 items-center gap-1 rounded-xl px-3 text-sm font-bold text-primary transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40 sm:px-4" aria-label="Trecho anterior">
        <ChevronLeft className="size-5" aria-hidden="true" /><span className="hidden sm:inline">Anterior</span>
      </button>
      <div className="text-center" aria-live="polite" aria-atomic="true">
        <p className="font-mono text-xs font-bold uppercase tracking-wider text-primary">Trecho {currentPage + 1} de {pageCount}</p>
        <p className="mt-1 text-xs font-medium text-muted-foreground">Serviços {pageStart + 1}–{Math.min(pageStart + PAGE_SIZE, nodesToRender.length)} de {nodesToRender.length}</p>
      </div>
      <button type="button" onClick={() => changePage(currentPage + 1)} disabled={currentPage >= pageCount - 1} className="inline-flex min-h-12 items-center gap-1 rounded-xl px-3 text-sm font-bold text-primary transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40 sm:px-4" aria-label="Próximo trecho">
        <span className="hidden sm:inline">Próximo</span><ChevronRight className="size-5" aria-hidden="true" />
      </button>
    </nav>
  );

  return (
    <div className={`mx-auto max-w-[1500px] px-4 pb-24 pt-5 sm:px-6 lg:px-8 ${className}`}>
      {resolvedBanner && <SectionBanner banner={resolvedBanner} onMemorialClick={resolvedBanner.onMemorialClick} />}
      {renderPagination()}
      <section ref={timelineRef} className="relative mx-auto mt-6 max-w-5xl overflow-visible" style={{ height: `${CANVAS_HEIGHT}px` }} aria-label="Trilha do cronograma da obra">
        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox={`0 0 800 ${CANVAS_HEIGHT}`} preserveAspectRatio="none" aria-hidden="true">
          <path d={path} fill="none" stroke="var(--border)" strokeWidth="8" strokeLinecap="round" strokeDasharray="3 18" />
          <path d={path} fill="none" stroke="var(--primary)" strokeWidth="8" strokeLinecap="round" pathLength="100" strokeDasharray={`${progress} ${100 - progress}`} />
        </svg>
        <SiteDecoration decorations={decorations ?? []} />
        {isLoading && <div className="absolute inset-0 grid place-items-center rounded-xl border border-border bg-card/90 p-8 text-center" role="status"><p className="animate-pulse font-mono text-sm font-bold text-muted-foreground">Carregando trilha da obra…</p></div>}
        {!isLoading && errorMessage && <div className="absolute inset-0 grid place-items-center rounded-xl border border-warning/40 bg-warning-soft/90 p-8 text-center" role="alert"><p className="max-w-md text-sm font-bold text-warning">{errorMessage}</p></div>}
        {!isLoading && !errorMessage && nodesToRender.length === 0 && <div className="absolute inset-0 grid place-items-center rounded-xl border border-dashed border-border bg-card/80 p-8 text-center" role="status"><p className="max-w-md text-sm font-bold text-muted-foreground">Nenhum serviço cadastrado nesta macroetapa.</p></div>}
        {!isLoading && !errorMessage && visibleNodes.map((node) => <TimelineNodeItem key={node.id} node={node} isSelected={selectedNodeId === node.id} isPopoverOpen={currentPopoverId === node.id} onTogglePopover={handleTogglePopover} onClosePopover={handleClosePopover} onOpenDetails={handleOpenDetails} onSelectNode={onSelectNode} />)}
      </section>
      {renderPagination()}
    </div>
  );
};

ConstructionTimeline.displayName = 'ConstructionTimeline';
