import React from 'react';
import { BookOpen } from 'lucide-react';
import { SectionBannerData } from '@/types/timeline';
import { TactileButton } from '@/components/atoms/TactileButton';
import { MetricChip } from '@/components/atoms/MetricChip';

export interface SectionBannerProps {
  banner?: SectionBannerData;
  tag?: string;
  title?: string;
  description?: string;
  subtitle?: string;
  stats?: {
    totalServices: number;
    completedServices: number;
    criticalAlerts: number;
  };
  onMemorialClick?: () => void;
  className?: string;
}

export const SectionBanner: React.FC<SectionBannerProps> = ({
  banner,
  tag,
  title,
  description,
  subtitle,
  stats,
  onMemorialClick,
  className = '',
}) => {
  const resolvedTag = banner?.tag ?? tag ?? 'MACROETAPA ATUAL';
  const resolvedTitle = banner?.title ?? title ?? 'SEÇÃO 2: INFRAESTRUTURA E DRENAGEM PROFUNDA';
  const resolvedDescription =
    banner?.description ??
    banner?.subtitle ??
    description ??
    subtitle ??
    'Execução de galerias, tubulações de PVC e caixas de passagem';
  const resolvedStats = banner?.stats ?? stats ?? {
    totalServices: 7,
    completedServices: 2,
    criticalAlerts: 1,
  };
  const handleMemorialClick = banner?.onMemorialClick ?? onMemorialClick;

  return (
    <section
      className={`overflow-hidden rounded-lg border border-primary/20 bg-primary text-primary-foreground shadow-lg ${className}`}
      aria-label={resolvedTitle}
    >
      <div className="grid gap-5 p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-7">
        <div>
          <div className="mb-3 flex items-center gap-2 font-mono text-[10px] font-bold tracking-widest opacity-80 select-none">
            <span className="h-px w-8 bg-primary-foreground/50" /> {resolvedTag}
          </div>
          <h1 className="max-w-4xl text-xl font-extrabold leading-tight tracking-tight sm:text-3xl">
            {resolvedTitle}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-primary-foreground/75">
            {resolvedDescription}
          </p>
        </div>

        <div>
          <TactileButton
            variant="action"
            size="md"
            onClick={handleMemorialClick}
            leftIcon={<BookOpen className="size-4" />}
          >
            Memorial técnico
          </TactileButton>
        </div>
      </div>

      {/* Faixa inferior dividida em 3 colunas com tipografia mono */}
      <div className="grid grid-cols-3 divide-x divide-primary-foreground/15 border-t border-primary-foreground/15 bg-primary-deep/50 px-5 py-3 text-center">
        <MetricChip
          variant="header-strip"
          label={`${resolvedStats.totalServices} SERVIÇOS`}
          className="justify-center"
        />
        <MetricChip
          variant="header-strip"
          label={`${resolvedStats.completedServices} CONCLUÍDOS`}
          className="justify-center"
        />
        <MetricChip
          variant="header-strip"
          label={`${resolvedStats.criticalAlerts} ${
            resolvedStats.criticalAlerts === 1 ? 'ALERTA CRÍTICO' : 'ALERTAS CRÍTICOS'
          }`}
          className="justify-center text-amber-300"
        />
      </div>
    </section>
  );
};

SectionBanner.displayName = 'SectionBanner';
