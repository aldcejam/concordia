import { useEffect, useId, useRef, useState } from 'react';
import { TriangleAlert, X } from 'lucide-react';
import { TactileButton } from '@/components/atoms/TactileButton/TactileButton';

export interface StageDelayPopoverProps {
  name: string;
  code: string;
  dates: string;
  completed: boolean;
  busy: boolean;
  error?: string;
  missingPlanning?: number;
  saved?: boolean;
  onClose: () => void;
  onSubmit: (reason: string, days: number) => void;
  onRetry: () => void;
}

export function StageDelayPopover({ name, code, dates, completed, busy, error, missingPlanning = 0, saved, onClose, onSubmit, onRetry }: StageDelayPopoverProps) {
  const [editing, setEditing] = useState(false);
  const [reason, setReason] = useState('');
  const [days, setDays] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const reasonId = useId();
  const daysId = useId();

  useEffect(() => {
    const previousFocus = document.activeElement;
    ref.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.stopPropagation(); onClose(); }
    };
    const handleOutside = (event: MouseEvent) => {
      if (event.target instanceof Element && !ref.current?.contains(event.target) && !event.target.closest('[data-node-id]')) onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleOutside);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleOutside);
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, [onClose]);

  return (
    <div ref={ref} role="dialog" aria-labelledby={titleId} className="relative mx-auto w-full max-w-md rounded-xl border border-border bg-card text-card-foreground shadow-2xl z-popover text-left">
      <div className="h-2 rounded-t-xl bg-primary" />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-xs font-bold text-primary">{code}</p>
            <h3 id={titleId} className="mt-1 font-extrabold leading-snug">{name}</h3>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar popover da etapa" className="grid min-h-12 min-w-12 place-items-center rounded-lg hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"><X className="size-5" /></button>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{dates}</p>
        {completed ? <p className="mt-4 text-sm">Esta etapa já foi concluída.</p> : !editing && !saved ? (
          <TactileButton variant="action" className="mt-5 min-h-12 w-full" leftIcon={<TriangleAlert className="size-4" />} onClick={() => setEditing(true)}>Indicar atraso</TactileButton>
        ) : saved ? (
          <div className="mt-5 space-y-3">
            <p className="text-sm" role="status">{busy ? 'Analisando as possibilidades de adiantamento…' : 'O apontamento foi salvo.'}</p>
            {missingPlanning > 0 && <p className="text-sm text-muted-foreground">{missingPlanning} etapa(s) sem datas ou duração. Complete o planejamento da obra antes de analisar e recalcular o cronograma.</p>}
            {error && <p role="alert" className="text-sm text-warning">{error}</p>}
            {!busy && (
              <TactileButton className="min-h-12 w-full" disabled={missingPlanning > 0} onClick={onRetry}>
                {missingPlanning > 0 ? 'Análise indisponível (sem planejamento)' : 'Repetir análise'}
              </TactileButton>
            )}
          </div>
        ) : (
          <form className="mt-5 space-y-4" onSubmit={event => { event.preventDefault(); onSubmit(reason.trim(), Number(days)); }}>
            <div><label htmlFor={daysId} className="text-sm font-bold">Previsão de atraso (dias)</label><input id={daysId} type="number" min="1" max="3650" step="1" required value={days} onChange={event => setDays(event.target.value)} disabled={busy} className="mt-2 min-h-12 w-full rounded-lg border border-input bg-background px-3 focus:ring-2 focus:ring-ring" /></div>
            <div><label htmlFor={reasonId} className="text-sm font-bold">Motivo do atraso</label><textarea id={reasonId} required maxLength={2000} rows={3} value={reason} onChange={event => setReason(event.target.value)} disabled={busy} className="mt-2 w-full rounded-lg border border-input bg-background p-3 focus:ring-2 focus:ring-ring" /></div>
            {missingPlanning > 0 && <p className="text-sm text-muted-foreground">{missingPlanning} etapa(s) sem datas ou duração. Complete o planejamento da obra antes de analisar e recalcular o cronograma.</p>}
            {error && <p role="alert" className="text-sm text-warning">{error}</p>}
            {missingPlanning > 0 ? (
              <div className="space-y-3">
                <TactileButton type="submit" variant="action" loading={busy} disabled={!reason.trim() || !days} className="min-h-12 w-full">{busy ? 'Salvando…' : 'Salvar apontamento'}</TactileButton>
                <TactileButton type="button" disabled className="min-h-12 w-full">Analisar adiantamentos</TactileButton>
              </div>
            ) : (
              <TactileButton type="submit" variant="action" loading={busy} disabled={!reason.trim() || !days} className="min-h-12 w-full">{busy ? 'Consultando IA…' : 'Analisar adiantamentos'}</TactileButton>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
