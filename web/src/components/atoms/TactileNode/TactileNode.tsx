import React from 'react';
import {
  Check,
  Ruler,
  TriangleAlert,
  Gem,
  LockKeyhole,
  Trophy,
  ClipboardList,
} from 'lucide-react';
import { NodeStatus } from '@/types/timeline';

export type NodeSize = 'sm' | 'md' | 'lg';

export interface TactileNodeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: NodeStatus;
  size?: NodeSize;
  progress?: number;            // 0 a 100 para o anel circular SVG
  customColor?: string;         // Sobrescreve --node-color
  customDepth?: string;         // Sobrescreve --node-depth
  icon?: React.ReactNode;       // Sobrescreve o ícone padrão
  isPulsing?: boolean;          // Força animação active-pulse
  activePulse?: boolean;        // Alias compatível com PROJECT.md
  isSelected?: boolean;         // Destaque de nó selecionado
  ariaLabel?: string;
}

const STATUS_CONFIG: Record<
  NodeStatus,
  {
    defaultColor: string;
    defaultDepth: string;
    textColor: string;
    defaultSize: NodeSize;
  }
> = {
  completed: {
    defaultColor: 'var(--primary)',
    defaultDepth: 'var(--primary-deep)',
    textColor: 'text-primary-foreground',
    defaultSize: 'md',
  },
  in_progress: {
    defaultColor: 'var(--primary)',
    defaultDepth: 'var(--primary-deep)',
    textColor: 'text-primary-foreground',
    defaultSize: 'lg',
  },
  delayed: {
    defaultColor: 'var(--warning)',
    defaultDepth: '#991b1b',
    textColor: 'text-white',
    defaultSize: 'md',
  },
  accelerate: {
    defaultColor: 'var(--gold)',
    defaultDepth: '#b45309',
    textColor: 'text-foreground',
    defaultSize: 'md',
  },
  locked: {
    defaultColor: 'var(--concrete)',
    defaultDepth: '#475569',
    textColor: 'text-primary-foreground',
    defaultSize: 'md',
  },
  planned: {
    defaultColor: 'var(--muted)',
    defaultDepth: 'var(--border)',
    textColor: 'text-foreground',
    defaultSize: 'md',
  },
  milestone: {
    defaultColor: 'var(--gold)',
    defaultDepth: '#b45309',
    textColor: 'text-foreground',
    defaultSize: 'lg',
  },
};

const SIZE_CLASSES: Record<NodeSize, string> = {
  sm: 'size-12',
  md: 'size-16',
  lg: 'size-20',
};

const SVG_RING_CLASSES: Record<NodeSize, string> = {
  sm: 'size-16',
  md: 'size-20',
  lg: 'size-24',
};

export const TactileNode: React.FC<TactileNodeProps> = ({
  status,
  size,
  progress,
  customColor,
  customDepth,
  icon,
  isPulsing,
  activePulse,
  isSelected = false,
  ariaLabel,
  className = '',
  style,
  ...rest
}) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.locked;
  const resolvedSize: NodeSize = size ?? config.defaultSize;
  const shouldPulse = isPulsing ?? activePulse ?? (status === 'in_progress');
  const nodeColor = customColor ?? config.defaultColor;
  const nodeDepth = customDepth ?? config.defaultDepth;

  // Renderização do ícone temático
  const renderDefaultIcon = () => {
    const isSm = resolvedSize === 'sm';
    const isLgMilestone = resolvedSize === 'lg' && status === 'milestone';

    const strokeWidth = isSm ? 2.5 : 2.8;
    const iconClass = isSm
      ? 'size-5'
      : isLgMilestone
      ? 'size-8'
      : 'size-7';

    switch (status) {
      case 'completed':
        return <Check className={iconClass} strokeWidth={strokeWidth} />;
      case 'in_progress':
        return <Ruler className={iconClass} strokeWidth={strokeWidth} />;
      case 'delayed':
        return <TriangleAlert className={iconClass} strokeWidth={strokeWidth} />;
      case 'accelerate':
        return <Gem className={iconClass} strokeWidth={strokeWidth} />;
      case 'locked':
        return <LockKeyhole className={iconClass} strokeWidth={strokeWidth} />;
      case 'planned':
        return <ClipboardList className={iconClass} strokeWidth={strokeWidth} />;
      case 'milestone':
        return <Trophy className={iconClass} strokeWidth={strokeWidth} />;
      default:
        return null;
    }
  };

  // Anel de progresso SVG quando em execução ou quando progress explicitamente informado
  const showProgressRing = status === 'in_progress' || (progress !== undefined && progress > 0);
  const ringProgress = progress !== undefined ? Math.min(100, Math.max(0, progress)) : 65;

  const nodeStyles: React.CSSProperties = {
    '--node-color': nodeColor,
    '--node-depth': nodeDepth,
    ...style,
  } as React.CSSProperties;

  return (
    <span
      className={`node-tactile relative grid place-items-center rounded-full border-4 transition-all duration-200 ${
        SIZE_CLASSES[resolvedSize]
      } ${config.textColor} ${shouldPulse ? 'active-pulse' : ''} ${
        isSelected ? 'ring-4 ring-action ring-offset-2' : ''
      } ${className}`}
      style={nodeStyles}
      aria-label={ariaLabel}
      {...rest}
    >
      {showProgressRing && (
        <svg
          className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90 ${SVG_RING_CLASSES[resolvedSize]}`}
          viewBox="0 0 100 100"
          aria-hidden="true"
        >
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="var(--border)"
            strokeWidth="6"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="var(--action)"
            strokeWidth="6"
            strokeLinecap="round"
            pathLength="100"
            strokeDasharray={`${ringProgress} 100`}
          />
        </svg>
      )}

      <span className="m-auto flex items-center justify-center pointer-events-none">
        {icon ?? renderDefaultIcon()}
      </span>
    </span>
  );
};

TactileNode.displayName = 'TactileNode';
