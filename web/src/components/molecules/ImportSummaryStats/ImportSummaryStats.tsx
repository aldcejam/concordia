import React from 'react';
import { Coins, Layers, ListChecks, Percent, Receipt, Scale, Wrench } from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatDecimal, formatMoney, formatPercent } from '@/utils/format';
import type { ResumoImportacao } from '@/types/importacao';

export interface ImportSummaryStatsProps {
  resumo: ResumoImportacao;
  className?: string;
}

interface Stat {
  label: string;
  value: string;
  icon: React.ElementType;
  highlight?: boolean;
}

/** Indicadores do resumo da importação: itens, custo total, BDI e pesos calculados. */
export const ImportSummaryStats: React.FC<ImportSummaryStatsProps> = ({ resumo, className }) => {
  const stats: Stat[] = [
    { label: 'Valor total com BDI', value: formatMoney(resumo.valorTotalComBdi), icon: Coins, highlight: true },
    { label: 'Valor sem BDI', value: formatMoney(resumo.valorTotalSemBdi), icon: Receipt },
    {
      label: 'BDI',
      value: resumo.percentualBdi == null ? 'Não informado' : formatPercent(resumo.percentualBdi),
      icon: Percent,
    },
    { label: 'Itens de serviço', value: formatDecimal(resumo.totalItens), icon: ListChecks },
    {
      label: 'Macroetapas / subetapas',
      value: `${resumo.totalMacroetapas ?? 0} / ${resumo.totalSubetapas ?? 0}`,
      icon: Layers,
    },
    { label: 'Soma dos pesos', value: formatPercent(resumo.somaPesos), icon: Scale },
    { label: 'Composições próprias', value: formatDecimal(resumo.composicoesProprias), icon: Wrench },
  ];

  return (
    <dl className={cn('grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4', className)}>
      {stats.map(({ label, value, icon: Icon, highlight }) => (
        <div
          key={label}
          className={cn(
            'rounded-2xl border p-4 shadow-sm',
            highlight
              ? 'col-span-2 border-primary-deep bg-primary text-primary-foreground sm:col-span-1'
              : 'border-border bg-card',
          )}
        >
          <dt
            className={cn(
              'flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest',
              highlight ? 'text-primary-foreground/80' : 'text-muted-foreground',
            )}
          >
            <Icon className="size-3.5" aria-hidden />
            {label}
          </dt>
          <dd className={cn('mt-1 font-mono text-lg font-bold', highlight ? 'text-primary-foreground' : 'text-foreground')}>
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
};

ImportSummaryStats.displayName = 'ImportSummaryStats';
