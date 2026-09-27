import React, { useEffect, useRef } from 'react';
import { Stage, StageState, TimelineNodeData } from '@/types/timeline';
import { TactileButton } from '@/components/atoms/TactileButton';

export interface StagePopoverProps {
  stage: Stage | TimelineNodeData;
  isOpen: boolean;
  onClose: () => void;
  onOpenDetails: (stage: Stage | TimelineNodeData) => void;
  anchorRef?: React.RefObject<HTMLElement | null>;
  side?: 'left' | 'right' | 'auto';
}

const STATE_LABELS: Record<StageState, string> = {
  done: 'CONCLUÍDO',
  active: 'EM EXECUÇÃO',
  delayed: 'ATRASADO',
  boost: 'OPORTUNIDADE',
  locked: 'BLOQUEADO',
  milestone: 'MARCO DA SEÇÃO',
};

function normalizeStage(stage: Stage | TimelineNodeData): {
  id: string;
  name: string;
  code: string;
  state: StageState;
  progress: number;
  planned: string;
  actual: string;
  x: number;
  original: Stage | TimelineNodeData;
} {
  const isRawStage = 'state' in stage && 'x' in stage;
  if (isRawStage) {
    return {
      id: String(stage.id),
      name: stage.name,
      code: stage.code,
      state: stage.state,
      progress: stage.progress,
      planned: stage.planned,
      actual: stage.actual,
      x: stage.x,
      original: stage,
    };
  }

  // Mapeia TimelineNodeData
  const node = stage as TimelineNodeData;
  const statusToState: Record<string, StageState> = {
    completed: 'done',
    in_progress: 'active',
    delayed: 'delayed',
    accelerate: 'boost',
    locked: 'locked',
    milestone: 'milestone',
  };

  const parsedX = parseFloat(node.position?.left?.replace('%', '') || '50');

  return {
    id: node.id,
    name: node.title,
    code: node.eapCode,
    state: statusToState[node.status] || 'locked',
    progress: node.progress ?? 0,
    planned: node.planned ?? '8 dias',
    actual: node.actual ?? '5 dias',
    x: parsedX,
    original: node,
  };
}

export const StagePopover: React.FC<StagePopoverProps> = ({
  stage,
  isOpen,
  onClose,
  onOpenDetails,
  side = 'auto',
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);

  // Fechar ao pressionar ESC ou clicar fora
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Se clicou dentro do popover, ignora
      if (popoverRef.current && popoverRef.current.contains(target)) {
        return;
      }

      // Se clicou no próprio nó ou botão disparador, deixa o onClick do nó gerenciar
      if (target.closest('[data-node-id]')) {
        return;
      }

      onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const normalized = normalizeStage(stage);

  const stripeColor =
    normalized.state === 'delayed'
      ? 'bg-warning'
      : normalized.state === 'boost' || normalized.state === 'milestone'
      ? 'bg-gold'
      : 'bg-primary';

  // Lógica de posicionamento: se x > 50 abre para a esquerda, se <= 50 abre para a direita
  const openToLeft = side === 'left' || (side === 'auto' && normalized.x > 50);

  const positionClasses = openToLeft
    ? 'sm:right-full sm:mr-4 sm:left-auto sm:top-0'
    : 'sm:left-full sm:ml-4 sm:right-auto sm:top-0';

  return (
    <div
      ref={popoverRef}
      role="dialog"
      aria-label={`Detalhes rápidos de ${normalized.name}`}
      onClick={(e) => e.stopPropagation()}
      className={`absolute left-1/2 top-full z-50 mt-3 -translate-x-1/2 sm:translate-x-0 w-[min(21rem,calc(100vw-2rem))] rounded-md border border-border bg-card p-0 text-card-foreground shadow-2xl animate-in fade-in zoom-in-95 select-none ${positionClasses}`}
      style={{ minWidth: '18rem' }}
    >
      <div className={`h-2 rounded-t-md ${stripeColor}`} />
      <div className="p-5 text-left">
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-[10px] font-bold tracking-wider text-muted-foreground">
            {normalized.code} • {STATE_LABELS[normalized.state]}
          </span>
          <span className="font-mono text-sm font-bold text-foreground">
            {normalized.progress}%
          </span>
        </div>

        <h3 className="mt-2 text-lg font-extrabold text-foreground leading-snug">
          {normalized.name}
        </h3>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${normalized.progress}%` }}
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 border-y border-border py-3 text-xs">
          <div>
            <p className="text-muted-foreground">Planejado</p>
            <p className="mt-1 font-bold text-foreground">{normalized.planned}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Realizado</p>
            <p className="mt-1 font-bold text-foreground">{normalized.actual}</p>
          </div>
        </div>

        <TactileButton
          variant={normalized.state === 'delayed' ? 'destructive' : 'tactile'}
          className="mt-5 w-full cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
            onOpenDetails(normalized.original);
          }}
        >
          {normalized.state === 'boost' ? 'INICIAR SERVIÇO' : 'ABRIR MEDIÇÃO / DETALHES'}
        </TactileButton>
      </div>
    </div>
  );
};

StagePopover.displayName = 'StagePopover';
