import React, { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Crosshair } from 'lucide-react';
import { useListar, useListarEtapas, useRegistrarMedicao } from '@/api/generated';
import type { BrComConcordiaInfrastructureObraDtosEtapaResponse } from '@/api/generated/models';
import type { SectionBannerData, TimelineNodeData } from '@/types/timeline';
import { BlueprintLayout } from '@/components/templates/BlueprintLayout';
import { TimelineHeader } from '@/components/organisms/TimelineHeader';
import { ConstructionTimeline } from '@/components/organisms/ConstructionTimeline';
import { StageDetailsDrawer } from '@/components/organisms/StageDetailsDrawer';
import { TactileButton } from '@/components/atoms/TactileButton';

const PROJECT_DESCRIPTION =
  'COMPLEMENTAÇÃO DA OBRA DA ESCOLA MULTICAMPI DE CIÊNCIAS MÉDICAS (EMCM) - INFRAESTRUTURA E URBANIZAÇÃO - COM DESCONTO LINEAR';
const EMPTY_STAGES: BrComConcordiaInfrastructureObraDtosEtapaResponse[] = [];
const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const quantity = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });

function toTimelineNode(stage: BrComConcordiaInfrastructureObraDtosEtapaResponse, index: number, total: number, totalBudget: number): TimelineNodeData {
  const progress = Math.min(100, Math.max(0, Number(stage.percentualExecutado ?? 0)));
  const plannedQuantity = Number(stage.quantidadeOrcada ?? 0);
  const executedQuantity = Number(stage.quantidadeExecutada ?? 0);
  const budgetedValue = Number(stage.valorTotalOrcado ?? 0);
  const isDelayed = Boolean(stage.motivoAtraso);
  const status = isDelayed ? 'delayed' : progress >= 100 ? 'completed' : progress > 0 ? 'in_progress' : 'planned';
  const executedText = `${quantity.format(executedQuantity)} ${stage.unidadeOrcamento ?? ''}`.trim();
  const plannedText = `${quantity.format(plannedQuantity)} ${stage.unidadeOrcamento ?? ''}`.trim();
  const financialWeight = totalBudget > 0 ? `${(budgetedValue / totalBudget * 100).toFixed(2)}%` : '0.00%';

  return {
    id: stage.id ?? stage.idItemEap ?? `${index}`,
    eapCode: stage.codigoEap ?? '',
    macroetapa: stage.macroetapa,
    title: stage.nome ?? stage.descricao ?? '',
    subtitle: `${progress}% medido • ${executedText} de ${plannedText}`,
    status,
    progress,
    position: {
      left: `${[30, 70, 50, 29, 69, 48][index % 6]}%`,
      top: `${((index + 0.5) / Math.max(total, 1)) * 100}%`,
    },
    badge: progress === 0 ? { text: 'ORÇADO • SEM MEDIÇÃO', variant: 'primary' } : undefined,
    technicalDescription: stage.descricao ?? '',
    sinapiCode: [stage.bancoOrcamento, stage.codigoComposicao].filter(Boolean).join(' ') || undefined,
    compositionType: stage.tipoComposicao,
    budgetedQuantity: plannedQuantity,
    executedQuantity,
    unit: stage.unidadeOrcamento,
    budgetedValue,
    executedValue: budgetedValue * progress / 100,
    financialWeight,
    financialValue: money.format(budgetedValue),
    impedimentReason: stage.motivoAtraso,
    planned: stage.prazoEsperadoDias ? `${stage.prazoEsperadoDias} dias` : undefined,
  };
}

export const TimelinePage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activePopoverNodeId, setActivePopoverNodeId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const obrasQuery = useListar();
  const obras = obrasQuery.data?.data ?? [];
  const obra = obras.find((item) => item.descricao === PROJECT_DESCRIPTION);
  const etapasQuery = useListarEtapas(obra?.id ?? '', { query: { enabled: Boolean(obra?.id) } });
  const registrarMedicao = useRegistrarMedicao();
  const stages = etapasQuery.data?.data ?? EMPTY_STAGES;
  const totalBudget = stages.reduce((total, stage) => total + Number(stage.valorTotalOrcado ?? 0), 0);
  const nodes = useMemo(() => stages.map((stage, index) => toTimelineNode(stage, index, stages.length, totalBudget)), [stages, totalBudget]);
  const selectedNode = nodes.find((node) => node.id === selectedNodeId) ?? null;
  const weightedProgress = totalBudget
    ? nodes.reduce((total, node) => total + (node.budgetedValue ?? 0) * node.progress, 0) / totalBudget
    : 0;
  const delayedCount = nodes.filter((node) => node.status === 'delayed').length;
  const sectionBanner: SectionBannerData | undefined = stages.length ? {
    tag: `${stages.length} COMPOSIÇÕES ORÇADAS`,
    title: 'Orçamento analítico da obra',
    description: `${new Set(stages.map((stage) => stage.macroetapa).filter(Boolean)).size} macroetapas • Orçamento total ${money.format(totalBudget)}`,
    stats: {
      totalServices: nodes.length,
      completedServices: nodes.filter((node) => node.status === 'completed').length,
      criticalAlerts: delayedCount,
    },
    onMemorialClick: () => {
      const target = selectedNode ?? nodes[0];
      if (target) {
        setSelectedNodeId(target.id);
        setIsDrawerOpen(true);
      }
    },
  } : undefined;
  const etapaListKey = obra?.id ? ['/api/obras/' + obra.id + '/etapas'] : [];

  const persistMeasurement = async (nodeId: string, executedQuantity: number, reason?: string, days?: number) => {
    if (!obra?.id) return;
    const node = nodes.find((item) => item.id === nodeId);
    if (!node) return;
    const plannedQuantity = Number(node.budgetedQuantity ?? 0);
    const progress = plannedQuantity > 0 ? Math.min(100, executedQuantity / plannedQuantity * 100) : 0;
    await registrarMedicao.mutateAsync({
      id: obra.id,
      etapaId: nodeId,
      data: {
        quantidadeExecutada: executedQuantity,
        percentualExecutado: progress,
        ...(reason ? { motivoAtraso: reason, diasAtraso: days } : {}),
      },
    });
    await queryClient.invalidateQueries({ queryKey: etapaListKey });
  };

  const isLoading = obrasQuery.isLoading || (Boolean(obra?.id) && etapasQuery.isLoading);
  const errorMessage = obrasQuery.isError || etapasQuery.isError
    ? 'Não foi possível carregar os dados reais da obra. Verifique a API e tente novamente.'
    : undefined;
  const projectNotFound = !isLoading && !errorMessage && !obra;

  return (
    <BlueprintLayout
      header={<TimelineHeader
        projectTitle={obra?.descricao ?? ''}
        phaseTitle={obra ? `${obra.uf ?? ''} • Orçamento analítico`.trim() : undefined}
        progressPercentage={weightedProgress}
        criticalStagesCount={delayedCount}
        onOpenMemorialGuide={() => {
          const target = nodes[0];
          if (target) {
            setSelectedNodeId(target.id);
            setIsDrawerOpen(true);
          }
        }}
      />}
      floatingAction={<TactileButton variant="primary" size="icon" onClick={() => document.querySelector('[data-status="in_progress"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })} aria-label="Centralizar na etapa em execução" title="Centralizar na etapa em execução"><Crosshair className="size-5 sm:size-6" /></TactileButton>}
      drawer={<StageDetailsDrawer
        isOpen={isDrawerOpen}
        node={selectedNode}
        onClose={() => setIsDrawerOpen(false)}
        onSaveMeasurement={(nodeId, nextQuantity) => persistMeasurement(nodeId, nextQuantity)}
        onReportImpediment={(nodeId, reason, days) => {
          const node = nodes.find((item) => item.id === nodeId);
          return persistMeasurement(nodeId, Number(node?.executedQuantity ?? 0), reason, days);
        }}
      />}
    >
      {projectNotFound ? (
        <div className="mx-auto max-w-5xl p-8 text-center text-muted-foreground" role="status">A obra do orçamento fornecido não está cadastrada na API.</div>
      ) : (
        <ConstructionTimeline
          nodes={nodes}
          selectedNodeId={selectedNodeId}
          activePopoverNodeId={activePopoverNodeId}
          onTogglePopover={(node) => {
            setActivePopoverNodeId((current) => current === node.id ? null : node.id);
            setSelectedNodeId(node.id);
          }}
          onSelectNode={(node) => setSelectedNodeId(node.id)}
          onOpenDetails={(node) => {
            setSelectedNodeId(node.id);
            setActivePopoverNodeId(null);
            setIsDrawerOpen(true);
          }}
          onClosePopover={() => setActivePopoverNodeId(null)}
          banner={sectionBanner}
          decorations={[]}
          isLoading={isLoading}
          errorMessage={errorMessage}
        />
      )}
    </BlueprintLayout>
  );
};

export default TimelinePage;
