import React, { useMemo, useState } from 'react';
import { useListar, useListarEtapas } from '@/api/generated/obras/obras';
import type { BrComConcordiaInfrastructureObraDtosEtapaResponse } from '@/api/generated/models';
import { ChevronDown, HardHat, ClipboardList, ChevronLeft, ChevronRight, AlertTriangle, Sparkles } from 'lucide-react';
import { SugestaoAtrasoModal } from '@/components/molecules';
import type { SugestaoItem, AnaliseAtrasoResult } from '@/components/molecules/SugestaoAtrasoModal';
import { api } from '@/services/api';

const PROJECT_DESCRIPTION =
  'COMPLEMENTAÇÃO DA OBRA DA ESCOLA MULTICAMPI DE CIÊNCIAS MÉDICAS (EMCM) - INFRAESTRUTURA E URBANIZAÇÃO - COM DESCONTO LINEAR';
const EMPTY_STAGES: BrComConcordiaInfrastructureObraDtosEtapaResponse[] = [];
const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const quantity = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });

interface GroupedData {
  id: string;
  name: string;
  subGroups: {
    id: string;
    name: string;
    nodes: any[];
  }[];
}

export const TimelinePage: React.FC = () => {
  const obrasQuery = useListar();
  const obras = obrasQuery.data?.data ?? [];
  const obra = obras.find((item) => item.descricao === PROJECT_DESCRIPTION) ?? obras[0];
  const etapasQuery = useListarEtapas(obra?.id ?? '', { query: { enabled: Boolean(obra?.id) } });
  const stages = etapasQuery.data?.data ?? EMPTY_STAGES;

  const [customStages, setCustomStages] = useState<BrComConcordiaInfrastructureObraDtosEtapaResponse[] | null>(null);
  const [adiantadas, setAdiantadas] = useState<Record<string, { porEtapaId: string; justificativa?: string }>>({});
  const [selectedStageForDelay, setSelectedStageForDelay] = useState<{
    id: string;
    nome: string;
    codigoEap?: string;
  } | null>(null);
  const [delays, setDelays] = useState<Record<string, { dias: number; motivo: string }>>({});

  const scrollAnimationRef = React.useRef<number | null>(null);

  const startScrolling = (direction: 'left' | 'right') => {
    const scrollContainer = document.getElementById('tabs-scroll');
    if (!scrollContainer) return;
    const step = direction === 'left' ? -10 : 10;
    const scroll = () => {
      scrollContainer.scrollBy({ left: step, behavior: 'auto' });
      scrollAnimationRef.current = requestAnimationFrame(scroll);
    };
    scrollAnimationRef.current = requestAnimationFrame(scroll);
  };

  const stopScrolling = () => {
    if (scrollAnimationRef.current) {
      cancelAnimationFrame(scrollAnimationRef.current);
      scrollAnimationRef.current = null;
    }
  };

  const currentStages = useMemo(() => {
    return customStages ?? stages;
  }, [customStages, stages]);

  const handleEscolherEtapa = async (sugestao: SugestaoItem, resultado: AnaliseAtrasoResult) => {
    const etapaAtrasadaId = resultado.etapaAtrasadaId;
    const etapaAdiantadaId = sugestao.etapaId;

    setDelays((prev) => ({
      ...prev,
      [etapaAtrasadaId]: { dias: resultado.diasAtraso, motivo: resultado.motivo },
    }));

    setAdiantadas((prev) => ({
      ...prev,
      [etapaAdiantadaId]: {
        porEtapaId: etapaAtrasadaId,
        justificativa: sugestao.justificativa,
      },
    }));

    const baseList = [...(customStages ?? stages)];
    const itemAdiantadoIndex = baseList.findIndex((s) => s.id === etapaAdiantadaId);
    if (itemAdiantadoIndex !== -1) {
      const [itemAdiantado] = baseList.splice(itemAdiantadoIndex, 1);
      const itemAtrasadoIndex = baseList.findIndex((s) => s.id === etapaAtrasadaId);
      if (itemAtrasadoIndex !== -1) {
        baseList.splice(itemAtrasadoIndex + 1, 0, itemAdiantado);
        setCustomStages(baseList);
      }
    }

    if (obra?.id) {
      try {
        await api.post(`/obras/${obra.id}/reordenar-etapa`, {
          etapaAtrasadaId,
          etapaAdiantadaId,
        });
      } catch (err) {
        console.warn('Persistencia de reordenacao no backend:', err);
      }
    }
  };

  const rootGroups = useMemo(() => {
    const map = new Map<string, GroupedData>();
    currentStages.forEach(stage => {
      const targetAtrasadaId = stage.id ? adiantadas[stage.id]?.porEtapaId : undefined;
      const stageAtrasadaRef = targetAtrasadaId ? currentStages.find(s => s.id === targetAtrasadaId) : null;

      const effectiveEap = stageAtrasadaRef?.codigoEap || stage.codigoEap || '';
      const effectiveMacro = stageAtrasadaRef?.macroetapa || stage.macroetapa || 'GERAL';

      const parts = effectiveEap.split('.');
      const rootId = parts[0] || '1';
      
      const macroParts = effectiveMacro.split('›').map(s => s.trim());
      const rootName = macroParts[0];
      
      const isDirectChild = parts.length <= 2;
      const subId = isDirectChild ? rootId : `${parts[0]}.${parts[1]}`;
      const subName = isDirectChild ? rootName : (macroParts.length > 1 ? macroParts[1] : rootName);
      
      if (!map.has(rootId)) {
        map.set(rootId, { id: rootId, name: rootName, subGroups: [] });
      }
      
      const root = map.get(rootId)!;
      let sub = root.subGroups.find(s => s.id === subId);
      if (!sub) {
        sub = { id: subId, name: subName, nodes: [] };
        root.subGroups.push(sub);
      }
      
      const title = stage.nome || stage.descricao || '';
      sub.nodes.push({
         ...stage,
         title,
         progress: Math.min(100, Math.max(0, Number(stage.percentualExecutado ?? 0))),
         plannedQuantity: Number(stage.quantidadeOrcada ?? 0),
         executedQuantity: Number(stage.quantidadeExecutada ?? 0),
         budgetedValue: Number(stage.valorTotalOrcado ?? 0),
      });
    });
    
    const groups = Array.from(map.values()).sort((a, b) => Number(a.id) - Number(b.id));
    groups.forEach(g => g.subGroups.sort((a, b) => {
       const pa = a.id.split('.').map(Number);
       const pb = b.id.split('.').map(Number);
       for(let i=0; i<Math.max(pa.length, pb.length); i++) {
          if ((pa[i]||0) !== (pb[i]||0)) return (pa[i]||0) - (pb[i]||0);
       }
       return 0;
    }));
    return groups;
  }, [currentStages, adiantadas]);

  const [activeRootId, setActiveRootId] = useState<string | null>(null);
  const [activeSubId, setActiveSubId] = useState<string | null>(null);

  const activeRoot = rootGroups.find(g => g.id === activeRootId) ?? rootGroups[0];
  const activeSub = activeRoot?.subGroups.find(s => s.id === activeSubId) ?? activeRoot?.subGroups[0];

  const totalBudget = currentStages.reduce((acc, stage) => acc + Number(stage.valorTotalOrcado ?? 0), 0);
  const completedCount = currentStages.filter(s => Number(s.percentualExecutado ?? 0) >= 100).length;
  const delayedCount = currentStages.filter(s => Boolean(s.motivoAtraso) || (s.id ? Boolean(delays[s.id]) : false)).length;

  if (obrasQuery.isLoading || etapasQuery.isLoading || stages.length === 0) {
     return (
       <div className="min-h-screen bg-background flex flex-col items-center justify-center blueprint-grid">
         <p className="animate-pulse text-muted-foreground font-bold font-mono">Carregando trilha da obra…</p>
         <div className="fixed bottom-6 right-5 z-30">
           <button
             type="button"
             aria-label="Centralizar na etapa em execução"
             title="Centralizar na etapa em execução"
             className="size-12 rounded-full bg-primary text-white shadow-xl hover:bg-primary-soft flex items-center justify-center transition-all active:scale-95"
           >
             <HardHat className="size-6" />
           </button>
         </div>
       </div>
     );
  }

  if (!obra) {
     return <div className="min-h-screen bg-background flex items-center justify-center blueprint-grid"><p className="text-muted-foreground">Obra não encontrada.</p></div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col blueprint-grid">
      <header className="bg-primary-deep text-white pt-6 border-b border-border shadow-md relative z-10">
        <div className="max-w-[1500px] mx-auto px-4 lg:px-8">
          <div className="flex items-center gap-3">
             <div className="bg-white/10 p-2 rounded-lg">
                <HardHat className="size-8 text-white" />
             </div>
             <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight leading-none text-white">{obra.descricao}</h1>
                <p className="text-primary-soft mt-1 font-mono text-sm">{rootGroups.length} macroetapas • Orçamento total <span className="font-bold text-white">{money.format(totalBudget)}</span></p>
             </div>
          </div>
          
          <div className="grid grid-cols-3 divide-x divide-white/20 border-y border-white/20 mt-8">
             <div className="py-4 text-center">
                <div className="font-bold text-xs tracking-widest text-primary-soft uppercase">
                   <span className="text-xl sm:text-2xl text-white mr-2">{stages.length}</span>SERVIÇOS
                </div>
             </div>
             <div className="py-4 text-center">
                <div className="font-bold text-xs tracking-widest text-primary-soft uppercase">
                   <span className="text-xl sm:text-2xl text-white mr-2">{completedCount}</span>CONCLUÍDOS
                </div>
             </div>
             <div className="py-4 text-center">
                <div className="font-bold text-xs tracking-widest text-warning uppercase">
                   <span className="text-xl sm:text-2xl mr-2">{delayedCount}</span>ALERTA CRÍTICO
                </div>
             </div>
          </div>

          <div className="relative mt-6 flex items-end border-b border-primary-deep">
             <div className="absolute left-0 bottom-0 z-10 h-14 w-16 bg-gradient-to-r from-primary-deep via-primary-deep/80 to-transparent flex items-center justify-start px-2 pointer-events-none">
                <button 
                  onMouseDown={() => startScrolling('left')}
                  onMouseUp={stopScrolling}
                  onMouseLeave={stopScrolling}
                  onTouchStart={() => startScrolling('left')}
                  onTouchEnd={stopScrolling}
                  onClick={() => document.getElementById('tabs-scroll')?.scrollBy({ left: -250, behavior: 'smooth' })}
                  className="size-9 rounded-full bg-primary text-white shadow-md flex items-center justify-center hover:bg-primary-soft hover:scale-105 active:scale-95 transition-all pointer-events-auto"
                  aria-label="Rolar para a esquerda"
                >
                   <ChevronLeft className="size-6" />
                </button>
             </div>

             <div id="tabs-scroll" className="flex gap-2 overflow-x-hidden pb-0 mx-14 items-end scroll-smooth w-full">
                {rootGroups.map(group => {
                   const isActive = activeRoot?.id === group.id;
                   return (
                      <button 
                        key={group.id}
                        onClick={() => { setActiveRootId(group.id); setActiveSubId(null); }}
                        className={`shrink-0 px-5 py-4 rounded-t-xl font-bold text-sm whitespace-nowrap border-t-4 transition-all hover:bg-white/10 ${isActive ? 'bg-white text-primary-deep border-orange-500 shadow-sm' : 'bg-white/5 text-white/70 border-transparent'}`}
                      >
                         {group.id}.0.0 {group.name.toUpperCase()}
                      </button>
                   );
                })}
             </div>

             <div className="absolute right-0 bottom-0 z-10 h-14 w-16 bg-gradient-to-l from-primary-deep via-primary-deep/80 to-transparent flex items-center justify-end px-2 pointer-events-none">
                <button 
                  onMouseDown={() => startScrolling('right')}
                  onMouseUp={stopScrolling}
                  onMouseLeave={stopScrolling}
                  onTouchStart={() => startScrolling('right')}
                  onTouchEnd={stopScrolling}
                  onClick={() => document.getElementById('tabs-scroll')?.scrollBy({ left: 250, behavior: 'smooth' })}
                  className="size-9 rounded-full bg-primary text-white shadow-md flex items-center justify-center hover:bg-primary-soft hover:scale-105 active:scale-95 transition-all pointer-events-auto"
                  aria-label="Rolar para a direita"
                >
                   <ChevronRight className="size-6" />
                </button>
             </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-8 p-4 lg:p-8 relative z-0">
         <aside className="bg-card rounded-2xl shadow-sm border border-border p-6 self-start sticky top-8 hidden lg:block">
           <p className="text-[10px] font-extrabold text-primary tracking-widest uppercase mb-1">
              MACROETAPA {rootGroups.findIndex(g => g.id === activeRoot?.id) + 1} DE {rootGroups.length}
           </p>
           <h2 className="text-xl font-extrabold uppercase leading-tight text-foreground">{activeRoot?.name}</h2>
           <p className="text-sm font-medium text-muted-foreground mt-1 mb-8">
              {activeRoot?.subGroups.length} grupos de serviços nesta etapa
           </p>
           
           <div className="relative pl-6 border-l-2 border-muted space-y-6">
             {activeRoot?.subGroups.map((sub, i) => {
                const isActive = activeSub?.id === sub.id;
                return (
                   <div 
                     key={sub.id} 
                     className="relative cursor-pointer group"
                     onClick={() => setActiveSubId(sub.id)}
                   >
                      <div className={`absolute -left-[37px] top-1 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors shadow-sm border-2 ${isActive ? 'bg-primary border-primary text-white scale-110' : 'bg-background border-border text-muted-foreground group-hover:border-primary/50'}`}>
                         {i + 1}
                      </div>
                      <div className={`p-3 rounded-xl transition-colors ${isActive ? 'bg-primary/5 border border-primary/20' : 'border border-transparent group-hover:bg-muted/50'}`}>
                         <p className="text-[10px] font-extrabold text-muted-foreground tracking-widest">{sub.id}.0</p>
                         <h3 className={`font-bold text-sm leading-snug mt-1 ${isActive ? 'text-primary' : 'text-foreground'}`}>{sub.name}</h3>
                         <p className="text-xs font-medium text-muted-foreground mt-1">{sub.nodes.length} serviços</p>
                      </div>
                   </div>
                );
             })}
           </div>
         </aside>

         <section className="flex flex-col gap-6">
            <div className="mb-8">
               <div className="text-[10px] font-extrabold text-action tracking-widest uppercase mb-1">
                  NÍVEL DETALHADO • {activeSub?.id}.0
               </div>
               <h2 className="text-2xl sm:text-3xl font-extrabold uppercase leading-tight text-foreground">{activeSub?.name}</h2>
            </div>

            <div className="relative mt-8 mb-16 w-full max-w-4xl mx-auto">
               <div className="absolute left-1/2 top-4 bottom-4 w-0 border-l-2 border-dashed border-border -translate-x-1/2 z-0"></div>
               <div className="space-y-16">
                   {activeSub?.nodes.map((node, index) => {
                     const isDone = node.progress >= 100;
                     const isStarted = node.progress > 0 && !isDone;
                     const isLeft = index % 2 === 0;
                     const delay = delays[node.id];
                     const adiantadaInfo = adiantadas[node.id];

                     return (
                        <div key={node.id} className={`flex w-full items-start ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}>
                           
                           <div className={`w-1/2 flex relative ${isLeft ? 'justify-end pr-8 sm:pr-12' : 'justify-start pl-8 sm:pl-12'}`}>
                              <div className={`absolute top-6 w-8 sm:w-12 border-t-2 border-dashed border-border z-0 ${isLeft ? 'right-0' : 'left-0'}`}></div>

                              <div className={`flex flex-col relative z-10 w-full max-w-[320px] ${isLeft ? 'items-end text-right' : 'items-start text-left'}`}>
                                 <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-extrabold tracking-widest uppercase shadow-sm cursor-pointer hover:opacity-90 mb-3 ${adiantadaInfo ? 'bg-amber-100 text-amber-900 border border-amber-300' : isDone ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : isStarted ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-primary-deep text-white border border-primary-deep'}`}>
                                    {adiantadaInfo ? 'ADIANTADA PELA IA' : isDone ? 'CONCLUÍDO' : isStarted ? `${node.progress}% MEDIDO` : 'ORÇADO • SEM MEDIÇÃO'}
                                    <ChevronDown className="size-3 ml-1 opacity-50" />
                                 </div>

                                 <h4 className="font-extrabold text-sm sm:text-base text-foreground uppercase leading-snug">{node.title}</h4>

                                 {delay && (
                                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-warning/15 border border-warning/30 text-warning-dark text-xs font-bold">
                                       <AlertTriangle className="size-3.5 shrink-0 text-warning" />
                                       Atraso: {delay.dias}d • {delay.motivo}
                                    </div>
                                 )}

                                 {adiantadaInfo && (
                                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gold/15 border border-gold/40 text-gold-dark text-xs font-bold shadow-sm">
                                       <Sparkles className="size-3.5 shrink-0 text-gold-dark" />
                                       Adiantada via IA para compensar atraso
                                    </div>
                                 )}
                                 
                                 <p className="font-mono text-[9px] sm:text-[10px] text-muted-foreground mt-2 uppercase font-bold">
                                    {node.progress}% MEDIDO • {quantity.format(node.executedQuantity)} {node.unidadeOrcamento} DE {quantity.format(node.plannedQuantity)} {node.unidadeOrcamento}
                                 </p>

                                 <div className={`flex flex-wrap items-center gap-2 sm:gap-4 mt-3 text-[9px] sm:text-[10px] font-mono text-muted-foreground ${isLeft ? 'justify-end' : 'justify-start'}`}>
                                    <span className="font-bold text-foreground">{node.codigoEap}</span>
                                    <span>Unitário {money.format(node.valorUnitarioOrcado)}</span>
                                    <span className="font-bold text-primary-deep text-xs">{money.format(node.budgetedValue)}</span>
                                 </div>

                                 <button
                                    type="button"
                                    onClick={() => setSelectedStageForDelay({ id: node.id, nome: node.title, codigoEap: node.codigoEap })}
                                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-primary/25 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-bold transition-all active:scale-95 shadow-sm"
                                    title="Indicar atraso e consultar opções de adiantamento com IA"
                                 >
                                    <Sparkles className="size-3.5 text-gold-dark" />
                                    Indicar Atraso & IA
                                 </button>
                              </div>
                           </div>

                           <div className="relative flex justify-center shrink-0 w-0 z-10">
                              <button
                                 type="button"
                                 onClick={() => setSelectedStageForDelay({ id: node.id, nome: node.title, codigoEap: node.codigoEap })}
                                 title={`Reprogramar etapa ${node.codigoEap || ''} ${node.title}`}
                                 className={`absolute top-0 -translate-y-2 grid place-items-center w-12 h-12 sm:w-14 sm:h-14 bg-background border-[6px] ${adiantadaInfo ? 'border-gold/50 shadow-md ring-2 ring-gold/20' : 'border-muted/30 hover:border-primary/50'} rounded-full shadow-sm z-10 transition-transform active:scale-95 cursor-pointer`}
                              >
                                 <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-border bg-white flex items-center justify-center">
                                    {delay ? (
                                      <AlertTriangle className="size-4 sm:size-5 text-warning" />
                                    ) : adiantadaInfo ? (
                                      <Sparkles className="size-4 sm:size-5 text-gold-dark" />
                                    ) : (
                                      <ClipboardList className="size-4 sm:size-5 text-primary-deep" />
                                    )}
                                 </div>
                              </button>
                           </div>
                           
                           <div className="w-1/2"></div>
                        </div>
                     );
                  })}
               </div>
            </div>
         </section>
      </main>

      <div className="fixed bottom-6 right-5 z-30">
        <button
          type="button"
          onClick={() => {
            const inProgressEl = document.querySelector('[data-status="in_progress"]');
            if (inProgressEl) {
              inProgressEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          aria-label="Centralizar na etapa em execução"
          title="Centralizar na etapa em execução"
          className="size-12 rounded-full bg-primary text-white shadow-xl hover:bg-primary-soft flex items-center justify-center transition-all active:scale-95"
        >
          <HardHat className="size-6" />
        </button>
      </div>

      {selectedStageForDelay && obra?.id && (
        <SugestaoAtrasoModal
          isOpen={Boolean(selectedStageForDelay)}
          onClose={() => setSelectedStageForDelay(null)}
          etapa={selectedStageForDelay}
          obraId={obra.id}
          onSuccess={(res) => {
            setDelays((prev) => ({
              ...prev,
              [res.etapaAtrasadaId]: { dias: res.diasAtraso, motivo: res.motivo },
            }));
          }}
          onEscolherEtapa={handleEscolherEtapa}
        />
      )}
    </div>
  );
};

export default TimelinePage;
