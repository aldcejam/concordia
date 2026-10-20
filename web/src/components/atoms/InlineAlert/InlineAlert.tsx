import React from 'react';
import { CircleCheck, Info, TriangleAlert, OctagonAlert, X } from 'lucide-react';
import { cn } from '@/utils/cn';

export type InlineAlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface InlineAlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  variant?: InlineAlertVariant;
  title?: React.ReactNode;
  onDismiss?: () => void;
}

const VARIANTS: Record<InlineAlertVariant, { box: string; icon: React.ElementType; iconColor: string }> = {
  info: { box: 'bg-primary/5 border-primary/25 text-foreground', icon: Info, iconColor: 'text-primary' },
  success: { box: 'bg-emerald-50 border-emerald-300 text-emerald-900', icon: CircleCheck, iconColor: 'text-emerald-600' },
  warning: { box: 'bg-gold-soft/60 border-gold/50 text-foreground', icon: TriangleAlert, iconColor: 'text-action-deep' },
  error: { box: 'bg-warning-soft border-warning/30 text-foreground', icon: OctagonAlert, iconColor: 'text-warning' },
};

/** Mensagem contextual de feedback (erro, aviso, sucesso ou informação) exibida no fluxo da tela. */
export const InlineAlert: React.FC<InlineAlertProps> = ({
  variant = 'info',
  title,
  onDismiss,
  className,
  children,
  ...rest
}) => {
  const { box, icon: Icon, iconColor } = VARIANTS[variant];
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={cn('flex items-start gap-3 rounded-xl border p-4 text-sm', box, className)}
      {...rest}
    >
      <Icon className={cn('mt-0.5 size-5 shrink-0', iconColor)} aria-hidden />
      <div className="min-w-0 flex-1 space-y-1">
        {title && <p className="font-extrabold leading-snug">{title}</p>}
        {children && <div className="leading-relaxed text-foreground/85">{children}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Fechar mensagem"
          className="-m-1 grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors duration-fast hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
};

InlineAlert.displayName = 'InlineAlert';
