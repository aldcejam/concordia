import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAtraso, useAnalisar, useSimular, useAplicar, getConsultar4QueryKey } from '@/api/generated/cronograma-controller/cronograma-controller';
import { getListarEtapasQueryKey } from '@/api/generated/obras/obras';
import type { Delay, SchedulePreview } from '@/types/cronograma';

export function requireSuccess<T>({ status, data }: { status: number; data: T }): T {
  if (status < 200 || status >= 300) {
    const details = data as { detail?: string };
    throw new Error(details?.detail || `Não foi possível concluir a operação (${status}).`);
  }
  return data;
}

export function useDelayReprogramming(obraId: string, onApplied: () => void) {
  const client = useQueryClient();
  const register = useAtraso();
  const analyse = useAnalisar();
  const simulate = useSimular();
  const apply = useAplicar();
  const lock = useRef(false);
  const [delay, setDelay] = useState<Delay>();
  const [selected, setSelected] = useState<string[]>([]);
  const [preview, setPreview] = useState<SchedulePreview>();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function refresh() {
    await Promise.all([
      client.invalidateQueries({ queryKey: getConsultar4QueryKey(obraId) }),
      client.invalidateQueries({ queryKey: getListarEtapasQueryKey(obraId) }),
    ]);
  }

  async function run(action: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true); setError('');
    try { await action(); }
    catch (err) { setPreview(undefined); setError(err instanceof Error ? err.message : 'Falha de conexão. Tente novamente.'); }
    finally { lock.current = false; setBusy(false); }
  }

  async function analyseSaved(saved: Delay) {
    if (!saved.id) throw new Error('O apontamento salvo não possui identificação.');
    const result = requireSuccess(await analyse.mutateAsync({ obraId, atrasoId: saved.id }));
    setDelay(result); setSelected([]); setPreview(undefined);
    await refresh();
    if (result.status !== 'PRONTO') throw new Error(result.erro || 'A análise não foi concluída. Tente novamente.');
  }

  return {
    delay, selected, preview, error, busy,
    open(existing?: Delay) {
      if (lock.current) return;
      setDelay(existing); setSelected([]); setPreview(undefined);
      setError(existing?.status === 'FALHOU' ? existing.erro || 'A análise falhou. Tente novamente.' : '');
    },
    submit(etapaId: string, motivo: string, diasAtraso: number, skipAnalysis = false) {
      void run(async () => {
        const saved = requireSuccess(await register.mutateAsync({ obraId, data: { etapaId, motivo, diasAtraso } }));
        setDelay(saved);
        if (skipAnalysis) {
          await refresh();
        } else {
          await analyseSaved(saved);
        }
      });
    },
    retry() { if (delay) void run(() => analyseSaved(delay)); },
    toggle(id: string) {
      if (lock.current) return;
      setSelected(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
      setPreview(undefined); setError('');
    },
    move(id: string, direction: -1 | 1) {
      if (lock.current) return;
      setSelected(current => {
        const next = [...current]; const index = next.indexOf(id); const target = index + direction;
        if (index < 0 || target < 0 || target >= next.length) return current;
        [next[index], next[target]] = [next[target], next[index]];
        return next;
      });
      setPreview(undefined); setError('');
    },
    simulate() {
      if (delay?.id) void run(async () => {
        const result = requireSuccess(await simulate.mutateAsync({ obraId, atrasoId: delay.id!, data: { etapaIds: selected } }));
        setPreview(result);
      });
    },
    confirm() {
      if (!delay?.id || !preview) return;
      void run(async () => {
        const result = requireSuccess(await apply.mutateAsync({ obraId, atrasoId: delay.id!, data: { etapaIds: selected } }));
        setDelay(result);
        await refresh();
        setPreview(undefined); onApplied();
      });
    },
  };
}
