import React, { useMemo, useState } from 'react';
import { GitBranchPlus, Link2, LockKeyhole, Unlock } from 'lucide-react';
import { InlineAlert } from '@/components/atoms/InlineAlert/InlineAlert';
import { SelectInput } from '@/components/atoms/SelectInput/SelectInput';
import { TactileButton } from '@/components/atoms/TactileButton/TactileButton';
import { TextInput } from '@/components/atoms/TextInput/TextInput';
import { DependencyLinkItem } from '@/components/molecules/DependencyLinkItem/DependencyLinkItem';
import { EtapaPicker } from '@/components/molecules/EtapaPicker/EtapaPicker';
import { FormField } from '@/components/molecules/FormField/FormField';
import { cn } from '@/utils/cn';
import { formatPercent } from '@/utils/format';
import {
  TIPOS_DEPENDENCIA,
  type EtapaDependencias,
  type NovaDependencia,
  type TipoDependencia,
} from '@/types/dependencias';

export interface DependencyEditorProps {
  etapa: EtapaDependencias;
  /** Todas as etapas da obra; a própria etapa e as predecessoras atuais são removidas das opções. */
  etapas: EtapaDependencias[];
  onAdd: (dependencia: NovaDependencia) => void;
  onRemove: (dependenciaId: string) => void;
  adding?: boolean;
  removingId?: string | null;
  error?: string | null;
  onDismissError?: () => void;
  className?: string;
}

const TIPO_OPTIONS = (Object.keys(TIPOS_DEPENDENCIA) as TipoDependencia[]).map((tipo) => ({
  value: tipo,
  label: `${tipo} · ${TIPOS_DEPENDENCIA[tipo].nome}`,
}));

/** Editor de vínculos de uma etapa: predecessoras, sucessoras e inclusão de um novo vínculo (UC06). */
export const DependencyEditor: React.FC<DependencyEditorProps> = ({
  etapa,
  etapas,
  onAdd,
  onRemove,
  adding = false,
  removingId = null,
  error = null,
  onDismissError,
  className,
}) => {
  const [predecessoraId, setPredecessoraId] = useState<string | null>(null);
  const [tipo, setTipo] = useState<TipoDependencia>('FI');
  const [desfasamento, setDesfasamento] = useState('0');
  const [obrigatoria, setObrigatoria] = useState(true);

  const predecessoras = useMemo(() => etapa.predecessoras ?? [], [etapa.predecessoras]);
  const sucessoras = etapa.sucessoras ?? [];
  const opcoes = useMemo(() => {
    const jaVinculadas = new Set(predecessoras.map((p) => p.etapaId));
    return etapas
      .filter((candidata) => candidata.id && candidata.id !== etapa.id && !jaVinculadas.has(candidata.id))
      .map((candidata) => ({
        id: candidata.id!,
        codigoEap: candidata.codigoEap,
        nome: candidata.nome,
        macroetapa: candidata.macroetapa,
      }));
  }, [etapas, etapa.id, predecessoras]);

  const lag = Number(desfasamento);
  const lagInvalido = !Number.isInteger(lag) || Math.abs(lag) > 365;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!predecessoraId || lagInvalido) return;
    onAdd({ predecessoraId, tipo, desfasamentoDias: lag, obrigatoria });
    setPredecessoraId(null);
  };

  return (
    <section className={cn('min-w-0 space-y-6 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6', className)}>
      <header className="flex items-start gap-3">
        <span
          className={cn(
            'grid size-12 shrink-0 place-items-center rounded-full border-4',
            etapa.bloqueada ? 'border-concrete/40 bg-muted text-concrete' : 'border-primary/30 bg-primary/10 text-primary',
          )}
        >
          {etapa.bloqueada ? <LockKeyhole className="size-5" aria-hidden /> : <Unlock className="size-5" aria-hidden />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-xs font-bold text-primary">{etapa.codigoEap}</p>
          <h2 className="break-words text-lg font-extrabold uppercase leading-snug text-foreground">{etapa.nome}</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {etapa.macroetapa} · {formatPercent(etapa.percentualExecutado)} executado ·{' '}
            <span className={cn('font-bold', etapa.bloqueada ? 'text-concrete' : 'text-emerald-700')}>
              {etapa.bloqueada ? 'Bloqueada na trilha' : 'Liberada na trilha'}
            </span>
          </p>
        </div>
      </header>

      <div>
        <h3 className="mb-2 text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
          Depende de ({predecessoras.length})
        </h3>
        {predecessoras.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
            Sem predecessoras: a etapa pode iniciar a qualquer momento.
          </p>
        ) : (
          <ul className="space-y-2">
            {predecessoras.map((vinculo) => (
              <DependencyLinkItem
                key={vinculo.dependenciaId}
                vinculo={vinculo}
                direction="predecessora"
                onRemove={onRemove}
                removing={removingId === vinculo.dependenciaId}
              />
            ))}
          </ul>
        )}
      </div>

      <form onSubmit={submit} className="space-y-4 rounded-2xl border border-primary/20 bg-primary/5 p-4" aria-label="Adicionar predecessora">
        <h3 className="flex items-center gap-2 text-sm font-extrabold text-foreground">
          <GitBranchPlus className="size-4 text-primary" aria-hidden />
          Adicionar predecessora
        </h3>
        <EtapaPicker etapas={opcoes} value={predecessoraId} onChange={setPredecessoraId} label="Etapa predecessora" disabled={adding} />
        <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
          <FormField label="Tipo de vínculo" hint={TIPOS_DEPENDENCIA[tipo].descricao}>
            {(props) => (
              <SelectInput
                {...props}
                options={TIPO_OPTIONS}
                value={tipo}
                disabled={adding}
                onChange={(event) => setTipo(event.target.value as TipoDependencia)}
              />
            )}
          </FormField>
          <FormField label="Desfasamento" hint="dias (±365)" error={lagInvalido ? 'Inteiro entre -365 e 365' : null}>
            {(props) => (
              <TextInput
                {...props}
                type="number"
                inputMode="numeric"
                min={-365}
                max={365}
                value={desfasamento}
                disabled={adding}
                onChange={(event) => setDesfasamento(event.target.value)}
              />
            )}
          </FormField>
        </div>
        <label className="flex min-h-12 cursor-pointer items-center gap-3 text-sm font-semibold text-foreground">
          <input
            type="checkbox"
            checked={obrigatoria}
            disabled={adding}
            onChange={(event) => setObrigatoria(event.target.checked)}
            className="size-5 rounded border-input accent-[var(--primary)] focus-visible:ring-2 focus-visible:ring-ring"
          />
          Obrigatória (bloqueia a etapa na trilha até ser satisfeita)
        </label>
        {error && (
          <InlineAlert variant="error" title="Vínculo não salvo" onDismiss={onDismissError}>
            {error}
          </InlineAlert>
        )}
        <TactileButton
          type="submit"
          size="lg"
          className="h-12 w-full"
          disabled={!predecessoraId || lagInvalido}
          loading={adding}
          leftIcon={<Link2 className="size-4" />}
        >
          Vincular predecessora
        </TactileButton>
      </form>

      <div>
        <h3 className="mb-2 text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
          Etapas que dependem desta ({sucessoras.length})
        </h3>
        {sucessoras.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
            Nenhuma etapa depende desta.
          </p>
        ) : (
          <ul className="space-y-2">
            {sucessoras.map((vinculo) => (
              <DependencyLinkItem
                key={vinculo.dependenciaId}
                vinculo={vinculo}
                direction="sucessora"
                onRemove={onRemove}
                removing={removingId === vinculo.dependenciaId}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

DependencyEditor.displayName = 'DependencyEditor';
