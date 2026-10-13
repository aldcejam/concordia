import React, { useEffect, useState, useRef } from 'react';
import {
  X,
  TriangleAlert,
  Zap,
  Check,
  Layers,
  ArrowRight,
  Construction,
  HardHat,
  Save,
} from 'lucide-react';
import { TimelineNodeData, StageMeasurementFormValues } from '@/types/timeline';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import { TactileButton } from '@/components/atoms/TactileButton';
import { MetricChip } from '@/components/atoms/MetricChip';

export interface StageDetailsDrawerProps {
  isOpen: boolean;
  node: TimelineNodeData | null;
  onClose: () => void;
  onSaveMeasurement?: (
    nodeId: string,
    newExecutedQuantityOrProgress: number
  ) => Promise<void> | void;
  onSaveMeasurementValues?: (values: StageMeasurementFormValues) => Promise<void> | void;
  onReportImpediment?: (
    nodeId: string,
    reason: string,
    days?: number
  ) => Promise<void> | void;
  onAccelerate?: (nodeId: string) => void;
  onAccelerateStage?: (node: TimelineNodeData) => void;
  className?: string;
}

export const StageDetailsDrawer: React.FC<StageDetailsDrawerProps> = ({
  isOpen,
  node,
  onClose,
  onSaveMeasurement,
  onSaveMeasurementValues,
  onReportImpediment,
  onAccelerate,
  onAccelerateStage,
  className = '',
}) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  // Estados dos controles de medição física
  const [sliderProgress, setSliderProgress] = useState<number>(0);
  const [isSavingMeasurement, setIsSavingMeasurement] = useState<boolean>(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);

  // Estados do formulário de impedimento / atraso
  const [isReportingImpediment, setIsReportingImpediment] = useState<boolean>(false);
  const [impedimentDays, setImpedimentDays] = useState<number>(3);
  const [impedimentReasonText, setImpedimentReasonText] = useState<string>('');
  const [isSubmittingImpediment, setIsSubmittingImpediment] = useState<boolean>(false);
  const [impedimentSuccessMessage, setImpedimentSuccessMessage] = useState<string | null>(null);

  // Sincroniza estado quando o nó selecionado é alterado
  useEffect(() => {
    if (node) {
      setSliderProgress(node.progress ?? 0);
      setSaveSuccessMessage(null);
      setSaveErrorMessage(null);
      setIsReportingImpediment(false);
      setImpedimentReasonText(node.impedimentReason ?? '');
      setImpedimentSuccessMessage(null);
    }
  }, [node]);

  // Gerenciamento de foco e trava de scroll do body quando aberto
  useEffect(() => {
    if (isOpen) {
      previousActiveElementRef.current = document.activeElement as HTMLElement;
      // Foca o botão de fechar ao abrir
      const timer = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);

      // Trava scroll da página de fundo
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        clearTimeout(timer);
        document.body.style.overflow = originalOverflow;
      };
    } else if (previousActiveElementRef.current) {
      // Devolve foco ao elemento disparador original
      previousActiveElementRef.current.focus();
    }
  }, [isOpen]);

  // Fechamento tríplice via tecla Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Se não estiver aberto ou sem nó, não renderiza nada
  if (!isOpen || !node) {
    return null;
  }

  // Cálculos de medição
  const budgetedNum =
    typeof node.budgetedQuantity === 'number'
      ? node.budgetedQuantity
      : parseFloat(String(node.budgetedQuantity || '0').replace(',', '.')) || 0;

  const currentExecutedQty = (budgetedNum * (sliderProgress / 100)).toFixed(1);
  const unitStr = node.unit ?? '';

  const formattedBudgetedValue =
    typeof node.budgetedValue === 'number'
      ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
          node.budgetedValue
        )
      : node.financialValue ?? '-';

  const formattedFinancialWeight =
    typeof node.financialWeight === 'number'
      ? `${node.financialWeight.toFixed(2)}%`
      : node.financialWeight ?? '-';

  // Handler para salvar medição
  const handleSaveMeasurement = async () => {
    setIsSavingMeasurement(true);
    try {
      const executedQtyNum = parseFloat(currentExecutedQty);
      if (onSaveMeasurement) {
        await onSaveMeasurement(node.id, executedQtyNum);
      }
      if (onSaveMeasurementValues) {
        await onSaveMeasurementValues({
          nodeId: node.id,
          executedQuantity: executedQtyNum,
          notes: `Medição de campo atualizada para ${sliderProgress}%`,
        });
      }
      setSaveSuccessMessage(`Medição de ${sliderProgress}% salva com sucesso!`);
      setTimeout(() => setSaveSuccessMessage(null), 3000);
    } catch (error) {
      setSaveErrorMessage(error instanceof Error ? error.message : 'Não foi possível salvar a medição. Tente novamente.');
    } finally {
      setIsSavingMeasurement(false);
    }
  };

  // Handler para reportar impedimento
  const handleConfirmImpediment = async () => {
    if (!impedimentReasonText.trim()) return;
    setIsSubmittingImpediment(true);
    try {
      if (onReportImpediment) {
        await onReportImpediment(node.id, impedimentReasonText, impedimentDays);
      }
      setImpedimentSuccessMessage(`Impedimento (+${impedimentDays} dias) reportado com sucesso!`);
      setIsReportingImpediment(false);
      setTimeout(() => setImpedimentSuccessMessage(null), 4000);
    } finally {
      setIsSubmittingImpediment(false);
    }
  };

  // Handler para adiantar etapa
  const handleAccelerate = () => {
    if (onAccelerate) {
      onAccelerate(node.id);
    }
    if (onAccelerateStage) {
      onAccelerateStage(node);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-background/80 backdrop-blur-sm transition-opacity duration-300"
      onClick={(e) => {
        // Fechamento ao clicar fora (backdrop)
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="stage-drawer-title"
      aria-describedby={node.technicalDescription ? 'stage-drawer-description' : undefined}
    >
      <div
        className={`relative flex h-full w-full max-w-lg flex-col bg-card shadow-2xl border-l border-border transition-transform duration-300 ease-out overflow-y-auto ${className}`}
      >
        {/* Cabeçalho do Drawer com estilo forest green de journey-concordia */}
        <div className="sticky top-0 z-10 border-b border-border bg-primary px-6 py-6 text-primary-foreground shadow-md">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-center gap-2 font-mono text-xs font-bold opacity-90">
                <Construction className="size-4 shrink-0" />
                <span className="font-mono">
                  {node.status === 'milestone'
                    ? 'MARCO CONTRATUAL'
                    : node.sinapiCode || 'Código de composição não informado'}
                </span>
                <span className="opacity-40">•</span>
                <span className="font-mono">EAP {node.eapCode}</span>
              </div>
              <h2
                id="stage-drawer-title"
                className="pr-6 text-xl font-extrabold text-primary-foreground leading-snug"
              >
                {node.title}
              </h2>
              {node.technicalDescription && <p
                id="stage-drawer-description"
                className="mt-1.5 text-xs text-primary-foreground/80 leading-relaxed"
              >
                {node.technicalDescription}
              </p>}
              {node.compositionType && <p className="mt-1 text-[10px] font-mono text-primary-foreground/70">{node.compositionType}</p>}
            </div>

            <TactileButton
              ref={closeButtonRef}
              variant="ghost"
              size="sm"
              onClick={onClose}
              aria-label="Fechar painel de detalhes"
              className="size-8 p-0 grid place-items-center rounded-full text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-deep/50 shrink-0 cursor-pointer"
            >
              <X className="size-5" />
            </TactileButton>
          </div>
        </div>

        {/* Conteúdo Principal do Drawer */}
        <div className="flex-1 space-y-6 p-6">
          <div className="flex items-center justify-between">
            <StatusBadge status={node.status} showIcon={false} />
            <span className="font-mono text-xs text-muted-foreground">EAP {node.eapCode}</span>
          </div>

          {/* Cards de Métricas Técnicas e SINAPI */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <span className="font-mono text-[10px] font-bold text-muted-foreground block uppercase">
                Referência Orçamentária
              </span>
              <span className="mt-1 font-mono text-xs font-extrabold text-foreground block">
                {node.sinapiCode || 'Código não informado'}
              </span>
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <span className="font-mono text-[10px] font-bold text-muted-foreground block uppercase">
                Peso no Contrato
              </span>
              <span className="mt-1 font-mono text-xs font-extrabold text-primary block">
                {formattedFinancialWeight}
              </span>
            </div>

            <div className="col-span-2 rounded-lg border border-border bg-muted/30 p-3 flex justify-between items-center">
              <div>
                <span className="font-mono text-[10px] font-bold text-muted-foreground block uppercase">
                  Valor Orçado do Serviço
                </span>
                <span className="font-mono text-sm font-extrabold text-foreground">
                  {formattedBudgetedValue}
                </span>
              </div>
              <MetricChip
                variant="primary"
                label={node.status === 'completed' ? '100% Concluído' : `${sliderProgress}% Medido`}
              />
            </div>
          </div>

          {/* Alerta de Atraso Registrado (se houver) */}
          {node.status === 'delayed' && (
            <div className="rounded-lg border border-warning/30 bg-warning-soft/60 p-4 text-warning">
              <div className="flex items-center gap-2 font-extrabold text-sm">
                <TriangleAlert className="size-4 shrink-0" />
                Impedimento Crítico Registrado
              </div>
              <p className="mt-1 text-xs text-red-900 font-medium leading-relaxed">
                {node.impedimentReason}
              </p>
            </div>
          )}

          {/* Oportunidade de Adiantamento (Ponte Dourada) */}
          {node.status === 'accelerate' && (
            <div className="rounded-lg border border-amber-400/40 bg-amber-50 p-4">
              <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm">
                <Zap className="size-4 shrink-0 text-amber-600" />
                Oportunidade: Ponte Dourada
              </div>
              <p className="mt-1 text-xs text-amber-950 font-medium leading-relaxed">
                {node.accelerationOpportunity}
              </p>
              <div className="mt-3">
                <TactileButton
                  variant="gold"
                  size="sm"
                  onClick={handleAccelerate}
                  leftIcon={<Zap className="size-3.5" />}
                  className="w-full text-xs"
                >
                  Mobilizar Frente / Adiantar Etapa
                </TactileButton>
              </div>
            </div>
          )}

          {/* Seção de Medição Física (Orçado vs Executado) */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="size-4 text-primary" />
                <h3 className="text-sm font-extrabold text-foreground">Registro de Medição Física</h3>
              </div>
              <span className="font-mono text-xs font-bold text-primary">
                {currentExecutedQty} / {budgetedNum} {unitStr}
              </span>
            </div>

            {/* Barra Visual de Avanço */}
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-muted shadow-inner"
              role="progressbar"
              aria-valuenow={sliderProgress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Avanço da medição: ${sliderProgress}%`}
            >
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${sliderProgress}%` }}
              />
            </div>

            {/* Slider Interativo de Medição */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-muted-foreground">
                <span>0%</span>
                <span className="font-mono text-foreground font-extrabold text-sm">
                  {sliderProgress}%
                </span>
                <span>100%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={sliderProgress}
                onChange={(e) => setSliderProgress(Number(e.target.value))}
                aria-label="Ajustar percentual de medição física"
                className="w-full h-2 rounded-lg bg-muted appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* Botões de Atalho para Incremento Rápido */}
            <div className="flex items-center gap-2 pt-1">
              <TactileButton
                variant="outline"
                size="sm"
                onClick={() => setSliderProgress((prev) => Math.min(100, prev + 5))}
                className="flex-1 text-xs"
              >
                +5%
              </TactileButton>
              <TactileButton
                variant="outline"
                size="sm"
                onClick={() => setSliderProgress((prev) => Math.min(100, prev + 10))}
                className="flex-1 text-xs"
              >
                +10%
              </TactileButton>
              <TactileButton
                variant="outline"
                size="sm"
                onClick={() => setSliderProgress(100)}
                className="flex-1 text-xs"
              >
                100% Concluir
              </TactileButton>
            </div>

            {/* Botão de Salvar Medição */}
            <TactileButton
              variant="primary"
              size="md"
              onClick={handleSaveMeasurement}
              loading={isSavingMeasurement}
              leftIcon={<Check className="size-4" />}
              className="w-full"
            >
              Salvar Medição
            </TactileButton>

            {saveSuccessMessage && (
              <div className="rounded-md bg-emerald-50 border border-emerald-300 p-2 text-center text-xs font-bold text-emerald-800">
                {saveSuccessMessage}
              </div>
            )}
            {saveErrorMessage && (
              <div role="alert" className="rounded-md border border-warning/40 bg-warning-soft p-2 text-center text-xs font-bold text-warning">
                {saveErrorMessage}
              </div>
            )}
          </div>

          {/* Feedback de sucesso de reporte de impedimento */}
          {impedimentSuccessMessage && (
            <div className="rounded-md bg-amber-50 border border-amber-300 p-3 text-xs font-bold text-amber-900 flex items-center gap-2">
              <Check className="size-4 text-amber-700 shrink-0" />
              {impedimentSuccessMessage}
            </div>
          )}

          {/* Ação Rápida: Reportar Impedimento / Atraso */}
          <div className="rounded-xl border border-border p-4 bg-muted/20">
            {!isReportingImpediment ? (
              <TactileButton
                variant="outline"
                size="md"
                onClick={() => setIsReportingImpediment(true)}
                leftIcon={<TriangleAlert className="size-4 text-warning" />}
                className="w-full text-warning border-warning/30 hover:bg-warning-soft/40"
              >
                Reportar Impedimento / Atraso
              </TactileButton>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-warning flex items-center gap-1.5">
                    <TriangleAlert className="size-4" />
                    Sinalizar Desvio ou Paralisação
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsReportingImpediment(false)}
                    className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>

                {/* Dias de impacto estimado */}
                <div>
                  <label
                    htmlFor="impediment-days"
                    className="block font-mono text-[10px] font-bold text-muted-foreground uppercase"
                  >
                    Impacto Estimado no Prazo
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    {[1, 2, 3, 5, 7].map((days) => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => setImpedimentDays(days)}
                        className={`px-2.5 py-1 text-xs font-mono font-bold rounded border transition-colors cursor-pointer ${
                          impedimentDays === days
                            ? 'bg-warning text-white border-warning'
                            : 'bg-card text-foreground border-border hover:bg-muted'
                        }`}
                      >
                        +{days}d
                      </button>
                    ))}
                  </div>
                </div>

                {/* Causa raiz / Justificativa */}
                <div>
                  <label
                    htmlFor="impediment-reason"
                    className="block font-mono text-[10px] font-bold text-muted-foreground uppercase"
                  >
                    Justificativa / Causa Raiz
                  </label>
                  <textarea
                    id="impediment-reason"
                    rows={3}
                    value={impedimentReasonText}
                    onChange={(e) => setImpedimentReasonText(e.target.value)}
                    placeholder="Descreva o motivo (ex: chuva forte, falta de fôrmas, atraso do fornecedor)..."
                    className="mt-1 w-full rounded-md border border-input bg-card p-2 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>

                <TactileButton
                  variant="warning"
                  size="sm"
                  onClick={handleConfirmImpediment}
                  loading={isSubmittingImpediment}
                  disabled={!impedimentReasonText.trim()}
                  rightIcon={<ArrowRight className="size-3.5" />}
                  className="w-full text-xs font-bold"
                >
                  Registrar e Notificar Gestão
                </TactileButton>
              </div>
            )}
          </div>

          {/* Card de Última Atualização no Canteiro (estilo journey-concordia) */}
          <div className="rounded-md border border-border bg-muted/60 p-4">
            <div className="flex gap-3">
              <HardHat className="size-5 shrink-0 text-action" />
              <div>
                <p className="text-sm font-bold text-foreground">Última atualização</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Medição de campo registrada hoje, 16:40 • Equipe de drenagem
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé fixo com botões de Fechar e Salvar medição */}
        <div className="sticky bottom-0 border-t border-border bg-card p-4 sm:p-5 flex items-center justify-end gap-3 shadow-lg z-10">
          <TactileButton
            variant="outline"
            onClick={onClose}
            leftIcon={<X className="size-4" />}
          >
            Fechar
          </TactileButton>
          <TactileButton
            variant="terracotta"
            onClick={handleSaveMeasurement}
            loading={isSavingMeasurement}
            leftIcon={<Save className="size-4" />}
          >
            Salvar Medição
          </TactileButton>
        </div>
      </div>
    </div>
  );
};

StageDetailsDrawer.displayName = 'StageDetailsDrawer';
