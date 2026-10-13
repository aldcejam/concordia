import React from 'react';

export type MetricChipVariant =
  | 'neutral'
  | 'default'
  | 'primary'
  | 'warning'
  | 'success'
  | 'action'
  | 'header-strip';

export interface MetricChipProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value?: string | number;
  icon?: React.ReactNode;
  variant?: MetricChipVariant;
  onClick?: () => void;
}

const VARIANT_STYLES: Record<MetricChipVariant, string> = {
  neutral: 'bg-muted text-muted-foreground border border-border',
  default: 'bg-muted text-muted-foreground border border-border',
  primary: 'bg-primary/10 text-primary border border-primary/20 font-bold',
  warning: 'bg-warning-soft text-warning border border-warning/20 font-bold',
  success: 'bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold',
  action: 'bg-action/10 text-action-deep border border-action/20 font-bold',
  'header-strip': 'bg-transparent text-primary-foreground font-mono text-[9px] sm:text-[10px]',
};

export const MetricChip: React.FC<MetricChipProps> = ({
  label,
  value,
  icon,
  variant = 'neutral',
  onClick,
  className = '',
  children,
  ...rest
}) => {
  const isInteractive = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={
        isInteractive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-xs select-none transition-colors ${
        VARIANT_STYLES[variant]
      } ${
        isInteractive
          ? 'cursor-pointer hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          : ''
      } ${className}`}
      {...rest}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="truncate">{label}</span>
      {value !== undefined && value !== null && (
        <span className="font-bold tracking-tight">{value}</span>
      )}
      {children}
    </div>
  );
};

MetricChip.displayName = 'MetricChip';
