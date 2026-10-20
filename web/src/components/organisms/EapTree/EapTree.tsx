import React, { useState } from 'react';
import { ChevronRight, ClipboardList, FolderTree } from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatDecimal, formatMoney, formatPercent } from '@/utils/format';
import type { NoEap } from '@/types/importacao';

export interface EapTreeProps {
  nodes: NoEap[];
  /** Macroetapas abertas inicialmente (por código EAP). */
  defaultExpanded?: string[];
  emptyMessage?: string;
  className?: string;
}

/** Árvore hierárquica da EAP com valores e pesos percentuais calculados (UC01, passo 4). */
export const EapTree: React.FC<EapTreeProps> = ({
  nodes,
  defaultExpanded = [],
  emptyMessage = 'Nenhuma etapa encontrada na planilha.',
  className,
}) => {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(defaultExpanded));

  const toggle = (codigo: string) =>
    setExpanded((previous) => {
      const next = new Set(previous);
      if (next.has(codigo)) {
        next.delete(codigo);
      } else {
        next.add(codigo);
      }
      return next;
    });

  if (nodes.length === 0) {
    return (
      <div className={cn('rounded-2xl border border-dashed border-border bg-card/70 p-8 text-center', className)}>
        <FolderTree className="mx-auto size-8 text-muted-foreground" aria-hidden />
        <p className="mt-2 text-sm font-bold text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  const renderNode = (node: NoEap, depth: number): React.ReactNode => {
    const codigo = node.codigoEap ?? node.nome ?? '';
    const filhos = node.filhos ?? [];
    const hasChildren = filhos.length > 0;
    const isOpen = expanded.has(codigo);
    const peso = Math.min(100, Math.max(0, Number(node.pesoPercentual ?? 0)));

    return (
      <li key={codigo} role="treeitem" aria-expanded={hasChildren ? isOpen : undefined} aria-selected={false}>
        <div
          className={cn(
            'grid grid-cols-[1fr_auto] items-center gap-3 border-b border-border/70 py-2.5 pr-4',
            depth === 0 && 'bg-card',
          )}
          style={{ paddingLeft: `${12 + depth * 20}px` }}
        >
          <div className="flex min-w-0 items-center gap-2">
            {hasChildren ? (
              <button
                type="button"
                onClick={() => toggle(codigo)}
                aria-label={`${isOpen ? 'Recolher' : 'Expandir'} ${codigo} ${node.nome ?? ''}`}
                className="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors duration-fast hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ChevronRight className={cn('size-4 transition-transform duration-fast', isOpen && 'rotate-90')} />
              </button>
            ) : (
              <span className="grid size-8 shrink-0 place-items-center text-muted-foreground" aria-hidden>
                {node.itemServico ? <ClipboardList className="size-4" /> : <FolderTree className="size-4" />}
              </span>
            )}
            <span className="shrink-0 font-mono text-xs font-bold text-primary">{node.codigoEap}</span>
            <span
              className={cn(
                'truncate text-sm',
                node.itemServico ? 'font-medium text-foreground' : 'font-extrabold uppercase text-foreground',
              )}
              title={node.nome}
            >
              {node.nome}
            </span>
            {node.itemServico && node.banco && (
              <span className="hidden shrink-0 rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10px] font-bold text-muted-foreground md:inline">
                {node.banco}
                {node.codigoComposicao ? ` ${node.codigoComposicao}` : ''}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-right">
            {node.itemServico ? (
              <span className="hidden font-mono text-[11px] text-muted-foreground sm:inline">
                {formatDecimal(node.quantidade)} {node.unidade}
              </span>
            ) : (
              <span className="hidden font-mono text-[11px] text-muted-foreground sm:inline">
                {node.quantidadeItens} itens
              </span>
            )}
            <span className="w-28 font-mono text-xs font-bold text-foreground">{formatMoney(node.valorTotal)}</span>
            <span className="flex w-24 flex-col items-end gap-1">
              <span className="font-mono text-[11px] font-bold text-primary-deep">{formatPercent(node.pesoPercentual)}</span>
              <span className="h-1.5 w-full overflow-hidden rounded-full bg-muted" aria-hidden>
                <span className="block h-full rounded-full bg-primary" style={{ width: `${peso}%` }} />
              </span>
            </span>
          </div>
        </div>
        {hasChildren && isOpen && <ul role="group">{filhos.map((filho) => renderNode(filho, depth + 1))}</ul>}
      </li>
    );
  };

  return (
    <div className={cn('overflow-hidden rounded-2xl border border-border bg-card shadow-sm', className)}>
      <div className="grid grid-cols-[1fr_auto] gap-3 border-b border-border bg-muted/60 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        <span>Estrutura analítica (EAP)</span>
        <span className="flex gap-3 text-right">
          <span className="w-28">Valor c/ BDI</span>
          <span className="w-24">Peso</span>
        </span>
      </div>
      <ul role="tree" aria-label="Estrutura analítica do projeto" className="max-h-[480px] overflow-auto">
        {nodes.map((node) => renderNode(node, 0))}
      </ul>
    </div>
  );
};

EapTree.displayName = 'EapTree';
