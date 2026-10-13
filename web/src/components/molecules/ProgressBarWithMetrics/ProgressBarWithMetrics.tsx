import React from 'react';
import { TriangleAlert } from 'lucide-react';
import { MetricChip } from '@/components/atoms/MetricChip';

export interface ProgressBarWithMetricsProps {
  progressPercentage: number;
  daysRemaining?: number;
  daysStatusText?: string;          // Padrão: "No prazo"
  criticalStagesCount?: number;     // De explorer_survey_2
  criticalDelaysCount?: number;     // De PROJECT.md
  onCriticalAlertClick?: () => void;
  className?: string;
}

export const ProgressBarWithMetrics: React.FC<ProgressBarWithMetricsProps> = ({
  progressPercentage,
  daysRemaining,
  daysStatusText = 'No prazo',
  criticalStagesCount,
  criticalDelaysCount,
  onCriticalAlertClick,
  className = '',
}) => {
  const criticalCount = criticalStagesCount ?? criticalDelaysCount ?? 0;
  const clampedProgress = Math.min(100, Math.max(0, progressPercentage));
  const formattedProgress = clampedProgress.toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  return (
    <div className={`flex flex-wrap items-center gap-3 sm:gap-4 ${className}`}>
      {/* Barra de Progresso Físico-Financeiro */}
      <div className="min-w-36 flex-1">
        <div className="mb-1 flex justify-between text-[10px] font-bold">
          <span className="text-muted-foreground tracking-wider">
            PROGRESSO FÍSICO-FINANCEIRO
          </span>
          <span className="font-mono text-primary font-extrabold">
            {formattedProgress}%
          </span>
        </div>
        <div
          className="h-2 overflow-hidden rounded-full bg-muted shadow-inner"
          role="progressbar"
          aria-valuenow={clampedProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Progresso físico-financeiro: ${formattedProgress}%`}
        >
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${clampedProgress}%` }}
          />
        </div>
      </div>

      {/* Chip de Contagem Regressiva de Dias */}
      {daysRemaining !== undefined && (
        <MetricChip
          variant="primary"
          label={`${daysRemaining} dias restantes`}
          className="px-3 py-2 text-xs shrink-0"
        >
          <span className="text-muted-foreground font-sans font-normal">
            • {daysStatusText}
          </span>
        </MetricChip>
      )}

      {/* Chip / Botão de Alerta para Etapas Críticas */}
      {criticalCount > 0 && (
        <MetricChip
          variant="warning"
          icon={<TriangleAlert className="size-4 shrink-0" />}
          label={`${criticalCount} ${
            criticalCount === 1 ? 'etapa crítica atrasada' : 'etapas críticas atrasadas'
          }`}
          onClick={onCriticalAlertClick}
          className="px-3 py-2 text-xs shrink-0 font-bold"
        />
      )}
    </div>
  );
};

ProgressBarWithMetrics.displayName = 'ProgressBarWithMetrics';
