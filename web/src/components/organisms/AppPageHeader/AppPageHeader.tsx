import React from 'react';
import { ArrowLeft, HardHat } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface AppPageHeaderStat {
  label: string;
  value: React.ReactNode;
  tone?: 'default' | 'warning' | 'gold';
}

export interface AppPageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: React.ReactNode;
  onBack?: () => void;
  backLabel?: string;
  actions?: React.ReactNode;
  stats?: AppPageHeaderStat[];
  className?: string;
}

/** Cabeçalho verde das telas de gestão (importação, dependências), alinhado ao cabeçalho da trilha. */
export const AppPageHeader: React.FC<AppPageHeaderProps> = ({
  eyebrow,
  title,
  subtitle,
  onBack,
  backLabel = 'Voltar',
  actions,
  stats,
  className,
}) => (
  <header className={cn('relative z-header border-b border-border bg-primary-deep text-white shadow-md', className)}>
    <div className="mx-auto max-w-6xl px-4 py-6 lg:px-8">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mb-4 inline-flex min-h-10 items-center gap-2 rounded-full bg-white/10 px-4 text-xs font-bold uppercase tracking-widest text-white transition-colors duration-fast hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <ArrowLeft className="size-4" aria-hidden />
          {backLabel}
        </button>
      )}
      <div className="flex flex-wrap items-start gap-4">
        <span className="rounded-lg bg-white/10 p-2">
          <HardHat className="size-8 text-white" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          {eyebrow && <p className="text-[10px] font-extrabold uppercase tracking-widest text-white/70">{eyebrow}</p>}
          <h1 className="text-2xl font-extrabold uppercase leading-tight tracking-tight sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-white/75">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {stats && stats.length > 0 && (
        <dl className="mt-6 grid grid-cols-2 divide-white/20 border-y border-white/20 sm:grid-cols-4 sm:divide-x">
          {stats.map((stat) => (
            <div key={stat.label} className="py-3 text-center">
              <dt
                className={cn(
                  'text-[10px] font-bold uppercase tracking-widest',
                  stat.tone === 'warning' ? 'text-warning-soft' : stat.tone === 'gold' ? 'text-gold' : 'text-white/70',
                )}
              >
                {stat.label}
              </dt>
              <dd className="font-mono text-xl font-bold text-white">{stat.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  </header>
);

AppPageHeader.displayName = 'AppPageHeader';
