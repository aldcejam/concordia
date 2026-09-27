import React, { useMemo, useState } from 'react';
import { Crosshair } from 'lucide-react';
import type { SectionBannerData } from '@/types/timeline';
import { INITIAL_TIMELINE_NODES } from '@/mocks/timeline';
import { DEFAULT_DECORATIONS } from '@/mocks/decorations';
import { BlueprintLayout } from '@/components/templates/BlueprintLayout';
import { TimelineHeader } from '@/components/organisms/TimelineHeader';
import { ConstructionTimeline } from '@/components/organisms/ConstructionTimeline';
import { StageDetailsDrawer } from '@/components/organisms/StageDetailsDrawer';
import { TactileButton } from '@/components/atoms/TactileButton';

export { INITIAL_TIMELINE_NODES } from '@/mocks/timeline';

export const TimelinePage: React.FC = () => {
  const [nodes, setNodes] = useState(INITIAL_TIMELINE_NODES);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activePopoverNodeId, setActivePopoverNodeId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const selectedNode = nodes.find((node) => node.id === selectedNodeId) ?? null;
  const progressPercentage = useMemo(() => nodes.length ? nodes.reduce((total, node) => total + node.progress, 0) / nodes.length : 0, [nodes]);
  const delayedCount = nodes.filter((node) => node.status === 'delayed').length;
  const sectionBanner: SectionBannerData = {
    tag: 'MACROETAPA ATUAL',
    title: 'SEÇÃO 2: INFRAESTRUTURA E DRENAGEM PROFUNDA',
    description: 'Execução de galerias, tubulações de PVC e caixas de passagem',
    stats: { totalServices: nodes.length, completedServices: nodes.filter((node) => node.status === 'completed').length, criticalAlerts: delayedCount },
    onMemorialClick: () => { const target = selectedNode ?? nodes[0]; if (target) { setSelectedNodeId(target.id); setIsDrawerOpen(true); } },
  };

  const handleSaveMeasurement = (nodeId: string, newExecutedQuantity: number) => {
    setNodes((current) => current.map((node) => {
      if (node.id !== nodeId) return node;
      const budgeted = typeof node.budgetedQuantity === 'number' ? node.budgetedQuantity : Number.parseFloat(String(node.budgetedQuantity ?? '0').replace(',', '.')) || 100;
      const newProgress = Math.min(100, Math.max(0, Math.round((newExecutedQuantity / budgeted) * 100)));
      return { ...node, executedQuantity: newExecutedQuantity, progress: newProgress, status: newProgress >= 100 ? 'completed' : node.status, subtitle: newProgress >= 100 ? `100% • ${newExecutedQuantity} ${node.unit ?? ''}` : `${newProgress}% executado • ${newExecutedQuantity}${node.unit ?? ''} de ${budgeted}${node.unit ?? ''}` };
    }));
  };

  const handleReportImpediment = (nodeId: string, reason: string, days = 3) => {
    setNodes((current) => current.map((node) => node.id === nodeId ? { ...node, status: 'delayed', impedimentReason: reason, subtitle: `+${days} dias de atraso • ${reason.slice(0, 24)}...` } : node));
  };

  const handleAccelerate = (nodeId: string) => {
    setNodes((current) => current.map((node) => node.id === nodeId ? { ...node, status: 'in_progress', badge: 'EM EXECUÇÃO', subtitle: 'Mobilizado via Ponte Dourada' } : node));
  };

  return (
    <BlueprintLayout
      header={<TimelineHeader projectTitle="Residencial Vista Verde" contractCode="OBRA CV-0248" phaseTitle="FASE 2: INFRAESTRUTURA" progressPercentage={progressPercentage} daysRemaining={142} daysStatusText="No prazo" criticalStagesCount={delayedCount} onOpenMemorialGuide={() => { const target = nodes[0]; if (target) { setSelectedNodeId(target.id); setIsDrawerOpen(true); } }} onCriticalAlertClick={() => { const target = nodes.find((node) => node.status === 'delayed'); if (target) { setSelectedNodeId(target.id); setIsDrawerOpen(true); } }} />}
      floatingAction={<TactileButton variant="primary" size="icon" onClick={() => document.querySelector('[data-status="in_progress"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })} aria-label="Centralizar na etapa em execução" title="Centralizar na etapa em execução"><Crosshair className="size-5 sm:size-6" /></TactileButton>}
      drawer={<StageDetailsDrawer isOpen={isDrawerOpen} node={selectedNode} onClose={() => setIsDrawerOpen(false)} onSaveMeasurement={handleSaveMeasurement} onReportImpediment={handleReportImpediment} onAccelerate={handleAccelerate} />}
    >
      <ConstructionTimeline nodes={nodes} decorations={DEFAULT_DECORATIONS} selectedNodeId={selectedNodeId} activePopoverNodeId={activePopoverNodeId} onTogglePopover={(node) => { setActivePopoverNodeId((current) => current === node.id ? null : node.id); setSelectedNodeId(node.id); }} onSelectNode={(node) => setSelectedNodeId(node.id)} onOpenDetails={(node) => { setSelectedNodeId(node.id); setActivePopoverNodeId(null); setIsDrawerOpen(true); }} onClosePopover={() => setActivePopoverNodeId(null)} banner={sectionBanner} />
    </BlueprintLayout>
  );
};

export default TimelinePage;
