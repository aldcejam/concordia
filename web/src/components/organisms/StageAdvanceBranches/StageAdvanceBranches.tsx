import { useEffect, useRef } from 'react';
import { ArrowDown, ArrowUp, Check, ClipboardList, Loader2 } from 'lucide-react';
import { TactileButton } from '@/components/atoms/TactileButton/TactileButton';

export interface AdvanceCandidate {
  id: string;
  name: string;
  code: string;
  justification: string;
}
export interface DateChange {
  id: string;
  name: string;
  before: string;
  after: string;
  order: number;
}
export interface StageAdvanceBranchesProps {
  candidates: AdvanceCandidate[];
  selected: string[];
  busy?: boolean;
  error?: string;
  changes?: DateChange[];
  finishBefore?: string;
  finishAfter?: string;
  onToggle: (id: string) => void;
  onMove: (id: string, direction: -1 | 1) => void;
  onPreview: () => void;
  onConfirm: () => void;
  onRetry: () => void;
  onClose: () => void;
}

export function StageAdvanceBranches({ candidates, selected, busy, error, changes, finishBefore, finishAfter, onToggle, onMove, onPreview, onConfirm, onRetry, onClose }: StageAdvanceBranchesProps) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    ref.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const handler = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);
  return (
    <section ref={ref} aria-label="Opções de adiantamento" className="relative w-full pb-4">
      {candidates.length > 0 && <div className="relative pt-20">
        <svg aria-hidden="true" viewBox="0 0 600 80" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 top-0 h-20 w-full text-primary-soft">
          {Array.from({ length: Math.min(3, candidates.length) }, (_, index) => <line key={index} x1="300" y1="0" x2={(index + .5) * 600 / Math.min(3, candidates.length)} y2="80" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />)}
        </svg>
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(3, candidates.length)}, minmax(0, 1fr))` }}>
          {candidates.map(candidate => {
            const position = selected.indexOf(candidate.id);
            return <div key={candidate.id} className="flex min-w-0 flex-col items-center gap-3">
              <button type="button" aria-label={`Selecionar ${candidate.code} ${candidate.name}`} aria-pressed={position >= 0} disabled={busy} onClick={() => onToggle(candidate.id)} className={`relative grid size-14 shrink-0 place-items-center rounded-full border-[6px] shadow-sm focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 ${position >= 0 ? 'border-primary-soft bg-primary text-white' : 'border-muted bg-card text-primary-deep hover:border-primary-soft'}`}>
                {position >= 0 ? <Check className="size-5" /> : <ClipboardList className="size-5" />}
                {position >= 0 && <span className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-primary text-xs font-bold text-white">{position + 1}</span>}
              </button>
              <div className="w-full min-w-0 rounded-xl border border-border bg-card p-3 text-center shadow-sm">
                <p className="font-mono text-[10px] font-bold text-primary">{candidate.code}</p>
                <h4 className="mt-1 break-words text-xs font-extrabold sm:text-sm">{candidate.name}</h4>
                <p className="mt-2 break-words text-xs text-muted-foreground">{candidate.justification}</p>
              </div>
            </div>;
          })}
        </div>
      </div>}
      <div className="mt-5 rounded-xl border border-primary/20 bg-card p-4 shadow-sm sm:p-5">
        <h3 className="font-extrabold">{candidates.length ? 'Escolha as etapas para adiantar' : 'Nenhuma etapa elegível para adiantamento'}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{candidates.length ? 'Selecione os nós acima. As etapas escolhidas entrarão logo após a etapa atrasada, na ordem abaixo.' : 'Você pode conferir e aplicar somente o impacto do atraso nas datas.'}</p>
        <p className="mt-1 text-xs text-muted-foreground">As linhas representam opções de escolha.</p>
        {selected.length > 0 && <ol aria-label="Ordem das etapas selecionadas" className="mt-4 space-y-2">
          {selected.map((id, index) => {
            const candidate = candidates.find(item => item.id === id);
            return <li key={id} className="flex items-center gap-2 rounded-lg border border-border p-2">
              <span className="font-mono text-sm font-bold text-primary">{index + 1}.</span>
              <span className="min-w-0 flex-1 text-sm font-bold break-words">{candidate?.code} {candidate?.name}</span>
              <button type="button" disabled={busy || index === 0} onClick={() => onMove(id, -1)} aria-label={`Mover ${candidate?.code} para cima`} className="grid min-h-12 min-w-12 place-items-center rounded-lg hover:bg-muted disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-ring"><ArrowUp className="size-4" /></button>
              <button type="button" disabled={busy || index === selected.length - 1} onClick={() => onMove(id, 1)} aria-label={`Mover ${candidate?.code} para baixo`} className="grid min-h-12 min-w-12 place-items-center rounded-lg hover:bg-muted disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-ring"><ArrowDown className="size-4" /></button>
            </li>;
          })}
        </ol>}
        {error && <div role="alert" className="mt-4 text-sm text-warning"><p>{error}</p><TactileButton className="mt-3 min-h-12" variant="outline" disabled={busy} onClick={onRetry}>Atualizar análise</TactileButton></div>}
        {changes && <div className="mt-5">
          <h4 className="text-sm font-bold">Prévia da sequência e das datas</h4>
          <p className="mt-2 text-sm">Término da obra: {finishBefore} → <strong>{finishAfter}</strong></p>
          <p className="mt-1 text-xs text-muted-foreground">As datas serão salvas ao confirmar.</p>
          <div className="mt-3 max-h-80 overflow-auto rounded-lg border border-border">
            <table className="w-full text-left text-xs"><thead className="sticky top-0 bg-muted"><tr><th className="p-3">Ordem / etapa</th><th className="p-3">Antes</th><th className="p-3">Depois</th></tr></thead><tbody>
              {changes.map(change => <tr key={change.id} className="border-t border-border"><td className="p-3 font-bold">{change.order}. {change.name}</td><td className="p-3">{change.before}</td><td className="p-3">{change.after}</td></tr>)}
            </tbody></table>
          </div>
        </div>}
        <div className="mt-5 flex flex-wrap gap-3">
          <TactileButton className="min-h-12" disabled={busy} variant="outline" onClick={onClose}>Fechar sugestões</TactileButton>
          {changes ? <TactileButton className="min-h-12 flex-1" loading={busy} onClick={onConfirm}>Confirmar sequência e datas</TactileButton> : <TactileButton className="min-h-12 flex-1" loading={busy} disabled={candidates.length > 0 && selected.length === 0} onClick={onPreview}>Conferir sequência e datas</TactileButton>}
        </div>
        {busy && <p role="status" className="mt-3 flex gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" />Atualizando cronograma…</p>}
      </div>
    </section>
  );
}
