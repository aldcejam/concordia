import React, { useMemo, useState } from 'react';
import { GitMerge, LockKeyhole, Search } from 'lucide-react';
import { controlClasses } from '@/components/atoms/TextInput/TextInput';
import { cn } from '@/utils/cn';
import type { EtapaDependencias } from '@/types/dependencias';

export interface EtapaNavigatorProps {
  etapas: EtapaDependencias[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  className?: string;
}

const normalize = (text: string) =>
  text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

/** Lista navegável das etapas agrupadas por macroetapa, com indicação de vínculos e bloqueio. */
export const EtapaNavigator: React.FC<EtapaNavigatorProps> = ({ etapas, selectedId, onSelect, className }) => {
  const [query, setQuery] = useState('');
  const [somenteComVinculos, setSomenteComVinculos] = useState(false);

  const grupos = useMemo(() => {
    const term = normalize(query.trim());
    const map = new Map<string, EtapaDependencias[]>();
    etapas.forEach((etapa) => {
      const vinculos = (etapa.predecessoras?.length ?? 0) + (etapa.sucessoras?.length ?? 0);
      if (somenteComVinculos && vinculos === 0) return;
      if (term && !normalize(`${etapa.codigoEap ?? ''} ${etapa.nome ?? ''} ${etapa.macroetapa ?? ''}`).includes(term)) {
        return;
      }
      const grupo = etapa.macroetapa?.split('›')[0]?.trim() || 'GERAL';
      map.set(grupo, [...(map.get(grupo) ?? []), etapa]);
    });
    return Array.from(map.entries());
  }, [etapas, query, somenteComVinculos]);

  return (
    <nav aria-label="Etapas da obra" className={cn('flex min-w-0 flex-col rounded-2xl border border-border bg-card shadow-sm', className)}>
      <div className="space-y-3 border-b border-border p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filtrar etapas"
            aria-label="Filtrar etapas"
            className={cn(controlClasses, 'border-input pl-9')}
          />
        </div>
        <label className="flex min-h-10 cursor-pointer items-center gap-2 text-xs font-bold text-muted-foreground">
          <input
            type="checkbox"
            checked={somenteComVinculos}
            onChange={(event) => setSomenteComVinculos(event.target.checked)}
            className="size-4 accent-[var(--primary)]"
          />
          Somente etapas com vínculos
        </label>
      </div>
      <div className="max-h-[70vh] flex-1 overflow-auto p-2">
        {grupos.length === 0 && (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">Nenhuma etapa corresponde ao filtro.</p>
        )}
        {grupos.map(([grupo, itens]) => (
          <div key={grupo} className="mb-2">
            <p className="sticky top-0 z-10 bg-card px-3 py-2 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
              {grupo}
            </p>
            <ul className="space-y-1">
              {itens.map((etapa) => {
                const selected = etapa.id === selectedId;
                const vinculos = (etapa.predecessoras?.length ?? 0) + (etapa.sucessoras?.length ?? 0);
                return (
                  <li key={etapa.id}>
                    <button
                      type="button"
                      onClick={() => etapa.id && onSelect(etapa.id)}
                      aria-current={selected ? 'true' : undefined}
                      className={cn(
                        'flex min-h-12 w-full items-center gap-2 rounded-xl px-3 py-2 text-left transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        selected ? 'bg-primary text-primary-foreground shadow-tactile' : 'hover:bg-muted',
                      )}
                    >
                      <span className={cn('w-12 shrink-0 font-mono text-[11px] font-bold', selected ? 'text-primary-foreground' : 'text-primary')}>
                        {etapa.codigoEap}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-xs font-bold" title={etapa.nome}>
                        {etapa.nome}
                      </span>
                      {etapa.bloqueada && (
                        <LockKeyhole className={cn('size-3.5 shrink-0', selected ? 'text-primary-foreground' : 'text-concrete')} aria-label="Bloqueada" />
                      )}
                      {vinculos > 0 && (
                        <span
                          className={cn(
                            'inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 font-mono text-[10px] font-bold',
                            selected ? 'bg-white/20 text-primary-foreground' : 'bg-primary/10 text-primary',
                          )}
                          aria-label={`${vinculos} vínculo(s)`}
                        >
                          <GitMerge className="size-3" aria-hidden />
                          {vinculos}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
};

EtapaNavigator.displayName = 'EtapaNavigator';
