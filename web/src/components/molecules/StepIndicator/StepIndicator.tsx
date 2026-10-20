import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface StepIndicatorProps {
  steps: string[];
  /** Índice (0-based) da etapa atual. */
  current: number;
  className?: string;
}

/** Progresso de um fluxo em etapas, no estilo dos nós táteis da trilha. */
export const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, current, className }) => (
  <ol className={cn('flex items-center gap-2 sm:gap-3', className)} aria-label="Etapas do fluxo">
    {steps.map((step, index) => {
      const done = index < current;
      const active = index === current;
      return (
        <li key={step} className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3" aria-current={active ? 'step' : undefined}>
          <span
            className={cn(
              'grid size-9 shrink-0 place-items-center rounded-full border-2 font-mono text-sm font-bold transition-colors duration-standard',
              done && 'border-primary-deep bg-primary text-primary-foreground',
              active && 'border-action-deep bg-action text-action-foreground shadow-action',
              !done && !active && 'border-border bg-card text-muted-foreground',
            )}
          >
            {done ? <Check className="size-4" aria-hidden /> : index + 1}
          </span>
          <span
            className={cn(
              'hidden truncate text-xs font-extrabold uppercase tracking-widest sm:block',
              active ? 'text-foreground' : 'text-muted-foreground',
            )}
          >
            {step}
          </span>
          <span className="sr-only sm:hidden">{step}</span>
          {index < steps.length - 1 && (
            <span
              aria-hidden
              className={cn('h-1 min-w-4 flex-1 rounded-full', done ? 'bg-primary' : 'bg-border')}
            />
          )}
        </li>
      );
    })}
  </ol>
);

StepIndicator.displayName = 'StepIndicator';
