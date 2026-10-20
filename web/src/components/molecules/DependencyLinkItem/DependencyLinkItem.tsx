import React from 'react';
import { ArrowDownToLine, ArrowUpFromLine, CircleCheck, Hourglass, Loader2, Trash2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { TIPOS_DEPENDENCIA, type VinculoEtapa } from '@/types/dependencias';

export interface DependencyLinkItemProps {
  vinculo: VinculoEtapa;
  /** "predecessora": a etapa listada precisa vir antes; "sucessora": ela depende da etapa em edição. */
  direction: 'predecessora' | 'sucessora';
  onRemove?: (dependenciaId: string) => void;
  removing?: boolean;
  className?: string;
}

/** Um vínculo de precedência visto a partir de uma etapa, com tipo, desfasamento e situação. */
export const DependencyLinkItem: React.FC<DependencyLinkItemProps> = ({
  vinculo,
  direction,
  onRemove,
  removing = false,
  className,
}) => {
  const tipo = vinculo.tipo ? TIPOS_DEPENDENCIA[vinculo.tipo] : null;
  const DirectionIcon = direction === 'predecessora' ? ArrowDownToLine : ArrowUpFromLine;
  const lag = vinculo.desfasamentoDias ?? 0;

  return (
    <li
      className={cn(
        'flex items-center gap-3 rounded-xl border bg-card px-3 py-2.5 shadow-sm',
        vinculo.satisfeita ? 'border-border' : 'border-gold/50',
        className,
      )}
    >
      <DirectionIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 font-mono text-xs font-bold text-primary">{vinculo.codigoEap}</span>
          <span className="truncate text-sm font-bold text-foreground" title={vinculo.nome}>
            {vinculo.nome}
          </span>
        </p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-muted-foreground">
          <span title={tipo?.descricao} className="rounded bg-muted px-1.5 py-0.5 font-bold text-foreground">
            {vinculo.tipo} · {tipo?.nome}
          </span>
          {lag !== 0 && <span>{lag > 0 ? `+${lag}` : lag} dia(s)</span>}
          {!vinculo.obrigatoria && <span>opcional</span>}
          {vinculo.satisfeita ? (
            <span className="inline-flex items-center gap-1 text-emerald-700">
              <CircleCheck className="size-3" aria-hidden /> liberado
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-action-deep">
              <Hourglass className="size-3" aria-hidden /> aguardando
            </span>
          )}
        </p>
      </div>
      {onRemove && vinculo.dependenciaId && (
        <button
          type="button"
          onClick={() => onRemove(vinculo.dependenciaId!)}
          disabled={removing}
          aria-label={`Remover vínculo com ${vinculo.codigoEap ?? vinculo.nome}`}
          className="grid size-10 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors duration-fast hover:bg-warning-soft hover:text-warning focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        >
          {removing ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
        </button>
      )}
    </li>
  );
};

DependencyLinkItem.displayName = 'DependencyLinkItem';
