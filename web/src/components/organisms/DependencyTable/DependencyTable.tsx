import React from 'react';
import { ArrowRight, Loader2, Network, Trash2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { TIPOS_DEPENDENCIA, type DependenciaListada } from '@/types/dependencias';

export interface DependencyTableProps {
  dependencias: DependenciaListada[];
  onRemove?: (id: string) => void;
  onSelectEtapa?: (etapaId: string) => void;
  removingId?: string | null;
  className?: string;
}

/** Visão consolidada (matriz) de todos os vínculos de precedência configurados na obra. */
export const DependencyTable: React.FC<DependencyTableProps> = ({
  dependencias,
  onRemove,
  onSelectEtapa,
  removingId = null,
  className,
}) => {
  if (dependencias.length === 0) {
    return (
      <div className={cn('rounded-2xl border border-dashed border-border bg-card/70 p-8 text-center', className)}>
        <Network className="mx-auto size-8 text-muted-foreground" aria-hidden />
        <p className="mt-2 font-bold text-foreground">Nenhuma dependência configurada</p>
        <p className="text-sm text-muted-foreground">
          Selecione uma etapa e vincule suas predecessoras para refinar o caminho crítico.
        </p>
      </div>
    );
  }

  const etapaCell = (etapa?: { id?: string; codigoEap?: string; nome?: string }) => (
    <button
      type="button"
      disabled={!onSelectEtapa || !etapa?.id}
      onClick={() => etapa?.id && onSelectEtapa?.(etapa.id)}
      className="flex min-w-0 max-w-full items-center gap-2 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring enabled:hover:text-primary"
    >
      <span className="shrink-0 font-mono text-xs font-bold text-primary">{etapa?.codigoEap}</span>
      <span className="truncate text-sm font-semibold" title={etapa?.nome}>
        {etapa?.nome}
      </span>
    </button>
  );

  return (
    <div className={cn('overflow-hidden rounded-2xl border border-border bg-card shadow-sm', className)}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left">
          <caption className="sr-only">Dependências configuradas</caption>
          <thead className="bg-muted/60 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <tr>
              <th scope="col" className="px-4 py-2">Predecessora</th>
              <th scope="col" className="w-8 px-1 py-2"><span className="sr-only">para</span></th>
              <th scope="col" className="px-2 py-2">Sucessora</th>
              <th scope="col" className="w-28 px-2 py-2">Tipo</th>
              <th scope="col" className="w-24 px-2 py-2">Situação</th>
              {onRemove && <th scope="col" className="w-14 px-2 py-2"><span className="sr-only">Ações</span></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {dependencias.map((dependencia) => (
              <tr key={dependencia.id}>
                <td className="max-w-0 px-4 py-2">{etapaCell(dependencia.predecessora)}</td>
                <td className="px-1 py-2 text-muted-foreground"><ArrowRight className="size-4" aria-hidden /></td>
                <td className="max-w-0 px-2 py-2">{etapaCell(dependencia.sucessora)}</td>
                <td className="px-2 py-2 font-mono text-xs" title={dependencia.tipo ? TIPOS_DEPENDENCIA[dependencia.tipo].descricao : undefined}>
                  <span className="font-bold">{dependencia.tipo}</span>
                  {dependencia.desfasamentoDias ? (
                    <span className="text-muted-foreground"> {dependencia.desfasamentoDias > 0 ? '+' : ''}{dependencia.desfasamentoDias}d</span>
                  ) : null}
                  {!dependencia.obrigatoria && <span className="block text-[10px] text-muted-foreground">opcional</span>}
                </td>
                <td className="px-2 py-2">
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 font-mono text-[10px] font-bold',
                      dependencia.satisfeita ? 'bg-emerald-50 text-emerald-700' : 'bg-gold-soft text-action-deep',
                    )}
                  >
                    {dependencia.satisfeita ? 'LIBERADO' : 'AGUARDANDO'}
                  </span>
                </td>
                {onRemove && (
                  <td className="px-2 py-2">
                    <button
                      type="button"
                      onClick={() => dependencia.id && onRemove(dependencia.id)}
                      disabled={removingId === dependencia.id}
                      aria-label={`Remover dependência ${dependencia.predecessora?.codigoEap} → ${dependencia.sucessora?.codigoEap}`}
                      className="grid size-10 place-items-center rounded-full text-muted-foreground transition-colors duration-fast hover:bg-warning-soft hover:text-warning focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                    >
                      {removingId === dependencia.id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

DependencyTable.displayName = 'DependencyTable';
