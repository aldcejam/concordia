import React from 'react';
import { ChevronDown, Zap, TriangleAlert, Check, LockKeyhole, Trophy } from 'lucide-react';
import { NodeStatus } from '@/types/timeline';

export type StatusBadgeVariant =
  | 'in_progress'
  | 'accelerate'
  | 'completed'
  | 'delayed'
  | 'locked'
  | 'milestone'
  | 'gold'
  | 'warning'
  | 'primary'
  | 'success';

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: StatusBadgeVariant;
  status?: StatusBadgeVariant | NodeStatus; // Compatibilidade com PROJECT.md
  label?: string;                          // Texto customizado
  text?: string;                           // Compatibilidade com PROJECT.md
  showIcon?: boolean;                      // Exibe ícone auxiliar
  floating?: boolean;                      // Aplica classe .gold-float
  isFloating?: boolean;                    // Compatibilidade com PROJECT.md
}

const DEFAULT_LABELS: Record<StatusBadgeVariant, string> = {
  in_progress: 'EM EXECUÇÃO',
  primary: 'EM EXECUÇÃO',
  accelerate: '⚡ ADIANTAR!',
  gold: '⚡ ADIANTAR!',
  completed: 'CONCLUÍDO',
  success: 'CONCLUÍDO',
  delayed: 'ATRASADA',
  warning: 'ATRASADA',
  locked: 'BLOQUEADO',
  milestone: 'MARCO',
};

const VARIANT_STYLES: Record<StatusBadgeVariant, string> = {
  in_progress: 'bg-primary text-primary-foreground shadow-sm',
  primary: 'bg-primary text-primary-foreground shadow-sm',
  accelerate: 'bg-gold text-foreground font-mono font-bold shadow-sm',
  gold: 'bg-gold text-foreground font-mono font-bold shadow-sm',
  completed: 'bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-sm',
  success: 'bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-sm',
  delayed: 'bg-warning-soft text-warning border border-warning/20 shadow-sm',
  warning: 'bg-warning-soft text-warning border border-warning/20 shadow-sm',
  locked: 'bg-muted text-muted-foreground border border-border shadow-sm',
  milestone: 'bg-gold text-foreground font-mono font-bold shadow-gold',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  variant,
  status,
  label,
  text,
  showIcon = true,
  floating,
  isFloating,
  className = '',
  children,
  ...rest
}) => {
  const effectiveVariant: StatusBadgeVariant = (variant ?? status ?? 'in_progress') as StatusBadgeVariant;
  const displayText = children ?? label ?? text ?? DEFAULT_LABELS[effectiveVariant] ?? 'EM EXECUÇÃO';
  const shouldFloat = floating ?? isFloating ?? (effectiveVariant === 'accelerate' || effectiveVariant === 'gold');

  const renderIcon = () => {
    if (!showIcon) return null;

    switch (effectiveVariant) {
      case 'in_progress':
      case 'primary':
        return <ChevronDown className="inline size-3 shrink-0" />;
      case 'accelerate':
      case 'gold':
        // Se já tiver emoji ⚡ no texto, não duplicar ícone visual
        if (typeof displayText === 'string' && displayText.includes('⚡')) {
          return null;
        }
        return <Zap className="inline size-3 shrink-0" />;
      case 'delayed':
      case 'warning':
        return <TriangleAlert className="inline size-3 shrink-0" />;
      case 'completed':
      case 'success':
        return <Check className="inline size-3 shrink-0" />;
      case 'locked':
        return <LockKeyhole className="inline size-3 shrink-0" />;
      case 'milestone':
        return <Trophy className="inline size-3 shrink-0" />;
      default:
        return null;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 font-mono text-[10px] font-bold tracking-wider select-none ${
        VARIANT_STYLES[effectiveVariant] || VARIANT_STYLES.in_progress
      } ${shouldFloat ? 'gold-float' : ''} ${className}`}
      {...rest}
    >
      {displayText}
      {renderIcon()}
    </span>
  );
};

StatusBadge.displayName = 'StatusBadge';
