import React from 'react';
import { HardHat, BookOpen } from 'lucide-react';
import { ProgressBarWithMetrics } from '@/components/molecules/ProgressBarWithMetrics';
import { TactileButton } from '@/components/atoms/TactileButton';

export interface TimelineHeaderProps {
  projectTitle?: string;
  projectName?: string; // Compatibilidade com PROJECT.md
  contractCode?: string;
  phaseTitle?: string;
  eapPhase?: string; // Compatibilidade com PROJECT.md
  progressPercentage: number;
  daysRemaining: number;
  daysStatusText?: string;
  criticalStagesCount?: number;
  criticalDelaysCount?: number; // Compatibilidade com PROJECT.md
  onOpenMemorialGuide?: () => void;
  onMemorialClick?: () => void; // Compatibilidade com PROJECT.md
  onCriticalAlertClick?: () => void;
  className?: string;
}

export const TimelineHeader: React.FC<TimelineHeaderProps> = ({
  projectTitle,
  projectName,
  contractCode = 'OBRA CV-0248',
  phaseTitle,
  eapPhase,
  progressPercentage,
  daysRemaining,
  daysStatusText = 'No prazo',
  criticalStagesCount,
  criticalDelaysCount,
  onOpenMemorialGuide,
  onMemorialClick,
  onCriticalAlertClick,
  className = '',
}) => {
  const resolvedProjectTitle = projectTitle ?? projectName ?? 'Residencial Vista Verde';
  const resolvedPhaseTitle = phaseTitle ?? eapPhase ?? 'FASE 2: INFRAESTRUTURA';
  const resolvedCriticalCount = criticalStagesCount ?? criticalDelaysCount ?? 0;
  const handleMemorialClick = onOpenMemorialGuide ?? onMemorialClick;

  return (
    <header
      className={`sticky top-0 z-40 border-b border-border bg-card/95 shadow-sm backdrop-blur ${className}`}
    >
      <div className="mx-auto grid max-w-[1500px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 lg:flex lg:px-8">
        {/* Identificação do Projeto / Obra */}
        <div className="min-w-0 lg:min-w-64">
          <div className="flex items-center gap-2">
            <div className="grid size-9 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground shadow-tactile select-none">
              <HardHat className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold sm:text-base text-foreground">
                {resolvedProjectTitle}
              </p>
              <p className="truncate font-mono text-[9px] text-muted-foreground">
                {contractCode} • {resolvedPhaseTitle}
              </p>
            </div>
          </div>
        </div>

        {/* Progresso Físico-Financeiro Consolidado */}
        <div className="hidden flex-1 items-center gap-4 border-l border-border pl-5 md:flex">
          <ProgressBarWithMetrics
            progressPercentage={progressPercentage}
            daysRemaining={daysRemaining}
            daysStatusText={daysStatusText}
            criticalStagesCount={resolvedCriticalCount}
            onCriticalAlertClick={onCriticalAlertClick}
            className="flex-1"
          />
        </div>

        {/* Botão de Acesso ao Guia da EAP / Memorial */}
        <div className="shrink-0">
          <TactileButton
            variant="outline"
            size="md"
            onClick={handleMemorialClick}
            leftIcon={<BookOpen className="size-4" />}
            aria-label="Guia da EAP e Memorial descritivo"
          >
            <span className="hidden sm:inline">Guia da EAP / Memorial</span>
            <span className="sm:hidden">Guia</span>
          </TactileButton>
        </div>
      </div>
    </header>
  );
};

TimelineHeader.displayName = 'TimelineHeader';
