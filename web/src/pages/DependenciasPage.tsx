import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FileUp, Map, Network, RefreshCw } from 'lucide-react';
import {
  criarDependencia,
  getListarDependenciasQueryKey,
  removerDependencia,
  useListarDependencias,
} from '@/api/generated/dependências/dependências';
import { getListarEtapasQueryKey, useConsultar, useListarEtapas } from '@/api/generated/obras/obras';
import { InlineAlert } from '@/components/atoms/InlineAlert/InlineAlert';
import { TactileButton } from '@/components/atoms/TactileButton/TactileButton';
import { AppPageHeader } from '@/components/organisms/AppPageHeader/AppPageHeader';
import { DependencyEditor } from '@/components/organisms/DependencyEditor/DependencyEditor';
import { DependencyTable } from '@/components/organisms/DependencyTable/DependencyTable';
import { EtapaNavigator } from '@/components/organisms/EtapaNavigator/EtapaNavigator';
import { BlueprintLayout } from '@/components/templates/BlueprintLayout/BlueprintLayout';
import { ensureOk, problemMessage } from '@/services/apiProblem';
import type { DependenciaListada, EtapaDependencias, NovaDependencia } from '@/types/dependencias';

const EMPTY_ETAPAS: EtapaDependencias[] = [];
const EMPTY_DEPENDENCIAS: DependenciaListada[] = [];

/** UC06 — Configurar Dependências Construtivas. */
export const DependenciasPage: React.FC = () => {
  const { obraId = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [erroVinculo, setErroVinculo] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  const obraQuery = useConsultar(obraId, { query: { enabled: Boolean(obraId) } });
  const etapasQuery = useListarEtapas(obraId, { query: { enabled: Boolean(obraId) } });
  const dependenciasQuery = useListarDependencias(obraId, { query: { enabled: Boolean(obraId) } });

  const obraEncontrada = obraQuery.data?.status === 200;
  const etapas: EtapaDependencias[] =
    etapasQuery.data?.status === 200 ? etapasQuery.data.data : EMPTY_ETAPAS;
  const dependencias: DependenciaListada[] =
    dependenciasQuery.data?.status === 200 ? dependenciasQuery.data.data : EMPTY_DEPENDENCIAS;

  const selecionada = useMemo(() => {
    const porId = etapas.find((etapa) => etapa.id === selectedId);
    if (porId) return porId;
    return (
      etapas.find((etapa) => (etapa.predecessoras?.length ?? 0) + (etapa.sucessoras?.length ?? 0) > 0) ?? etapas[0]
    );
  }, [etapas, selectedId]);

  const atualizar = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: getListarEtapasQueryKey(obraId) }),
      queryClient.invalidateQueries({ queryKey: getListarDependenciasQueryKey(obraId) }),
    ]);

  const criacao = useMutation({
    mutationFn: async (input: NovaDependencia) =>
      ensureOk(await criarDependencia(obraId, { ...input, sucessoraId: selecionada!.id! })).data,
    onMutate: () => {
      setErroVinculo(null);
      setSucesso(null);
    },
    onSuccess: async (criada) => {
      await atualizar();
      setSucesso(`${criada.sucessora?.codigoEap} agora depende de ${criada.predecessora?.codigoEap} (${criada.tipo}).`);
    },
    onError: (error) => setErroVinculo(problemMessage(error)),
  });

  const remocao = useMutation({
    mutationFn: async (dependenciaId: string) => ensureOk(await removerDependencia(obraId, dependenciaId)),
    onMutate: () => setSucesso(null),
    onSuccess: async () => {
      await atualizar();
      setSucesso('Vínculo removido. As regras de liberação da trilha foram atualizadas.');
    },
    onError: (error) => setErroVinculo(problemMessage(error)),
  });

  const carregando = obraQuery.isLoading || etapasQuery.isLoading || dependenciasQuery.isLoading;
  const falhou =
    obraQuery.isError ||
    etapasQuery.isError ||
    dependenciasQuery.isError ||
    (obraQuery.data !== undefined && !obraEncontrada);
  const bloqueadas = etapas.filter((etapa) => etapa.bloqueada).length;
  const descricao = obraQuery.data?.status === 200 ? obraQuery.data.data.descricao : undefined;

  const voltarParaTrilha = () => navigate(`/obras/${obraId}`);

  return (
    <BlueprintLayout
      header={
        <AppPageHeader
          eyebrow="UC06 · Dependências construtivas"
          title={descricao ?? 'Dependências da obra'}
          subtitle="Defina quais etapas precisam terminar (FI), iniciar (II) ou terminar juntas (FF) antes de outras. Ciclos são bloqueados automaticamente."
          onBack={voltarParaTrilha}
          backLabel="Voltar para a trilha"
          stats={
            carregando || falhou
              ? undefined
              : [
                  { label: 'Etapas', value: etapas.length },
                  { label: 'Vínculos', value: dependencias.length },
                  { label: 'Bloqueadas', value: bloqueadas, tone: 'warning' },
                  { label: 'Liberadas', value: etapas.length - bloqueadas, tone: 'gold' },
                ]
          }
          actions={
            <TactileButton variant="action" onClick={voltarParaTrilha} leftIcon={<Map className="size-4" />}>
              Ver trilha
            </TactileButton>
          }
        />
      }
    >
      <div className="mx-auto max-w-6xl space-y-6 p-4 lg:p-8">
        {carregando && (
          <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[340px_minmax(0,1fr)]" aria-busy="true" aria-label="Carregando dependências">
            <div className="h-[480px] animate-pulse rounded-2xl border border-border bg-card/70" />
            <div className="h-[480px] animate-pulse rounded-2xl border border-border bg-card/70" />
          </div>
        )}

        {!carregando && falhou && (
          <InlineAlert variant="error" title="Não foi possível carregar a obra">
            <p>
              {obraQuery.data !== undefined && !obraEncontrada
                ? 'A obra informada não existe ou foi removida.'
                : problemMessage(obraQuery.error ?? etapasQuery.error ?? dependenciasQuery.error)}
            </p>
            <TactileButton
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => {
                void obraQuery.refetch();
                void atualizar();
              }}
              leftIcon={<RefreshCw className="size-3.5" />}
            >
              Tentar novamente
            </TactileButton>
          </InlineAlert>
        )}

        {!carregando && !falhou && etapas.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card/80 p-10 text-center">
            <Network className="mx-auto size-10 text-muted-foreground" aria-hidden />
            <h2 className="mt-3 text-lg font-extrabold text-foreground">Esta obra ainda não tem etapas</h2>
            <p className="mt-1 text-sm text-muted-foreground">Importe o orçamento para gerar a EAP antes de configurar dependências.</p>
            <TactileButton className="mt-5" variant="action" onClick={() => navigate('/obras/nova')} leftIcon={<FileUp className="size-4" />}>
              Importar orçamento
            </TactileButton>
          </div>
        )}

        {!carregando && !falhou && selecionada && (
          <>
            {sucesso && (
              <InlineAlert variant="success" onDismiss={() => setSucesso(null)}>
                {sucesso}
              </InlineAlert>
            )}
            <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
              <EtapaNavigator
                etapas={etapas}
                selectedId={selecionada.id ?? null}
                onSelect={(id) => {
                  setSelectedId(id);
                  setErroVinculo(null);
                }}
                className="lg:sticky lg:top-6"
              />
              <DependencyEditor
                key={selecionada.id}
                etapa={selecionada}
                etapas={etapas}
                onAdd={(input) => criacao.mutate(input)}
                onRemove={(id) => remocao.mutate(id)}
                adding={criacao.isPending}
                removingId={remocao.isPending ? remocao.variables : null}
                error={erroVinculo}
                onDismissError={() => setErroVinculo(null)}
              />
            </div>

            <section aria-labelledby="matriz-title" className="space-y-3">
              <h2 id="matriz-title" className="text-sm font-extrabold uppercase tracking-widest text-muted-foreground">
                Matriz de dependências ({dependencias.length})
              </h2>
              <DependencyTable
                dependencias={dependencias}
                onRemove={(id) => remocao.mutate(id)}
                onSelectEtapa={setSelectedId}
                removingId={remocao.isPending ? remocao.variables : null}
              />
            </section>
          </>
        )}
      </div>
    </BlueprintLayout>
  );
};

export default DependenciasPage;
