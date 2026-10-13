/**
 * Tipos de domínio e interfaces para a trilha gamificada de obras do Concordia.
 * Baseado nas especificações de Atomic Design e contratos de engenharia.
 */

/**
 * Estados operacionais possíveis para um nó de etapa na trilha.
 */
export type StageState = 'done' | 'active' | 'delayed' | 'boost' | 'locked' | 'planned' | 'milestone';

export interface Stage {
  id: number;
  x: number;
  y: number;
  name: string;
  code: string;
  detail: string;
  state: StageState;
  progress: number;
  planned: string;
  actual: string;
}

export type NodeStatus =
  | 'completed'   // Concluído (Verde / Check)
  | 'in_progress' // Em Execução (Azul pulsante / Ruler / Anel SVG)
  | 'delayed'     // Atrasada / Impedimento (Vermelho Alerta / TriangleAlert)
  | 'accelerate'  // Oportunidade de Adiantamento (Dourado / Gem / Badge flutuante)
  | 'locked'      // Bloqueada por predecessores (Cinza Concreto / LockKeyhole)
  | 'planned'     // Orçada, ainda sem medição de execução
  | 'milestone';  // Marco de Macroetapa / Boss Level (Dourado / Trophy)

/**
 * Coordenadas de posicionamento relativo (%) no canvas da trilha.
 */
export interface NodePosition {
  left: string; // Ex: '30%', '50%', '70%'
  top: string;  // Ex: '8%', '23%', '39%'
}

/**
 * Tipagem para badge de destaque em um nó.
 */
export interface NodeBadgeData {
  text: string;
  variant?: 'gold' | 'warning' | 'primary' | 'success';
}

/**
 * Informações ricas de uma etapa construtiva para timeline e gaveta lateral (Drawer).
 */
export interface TimelineNodeData {
  id: string;
  eapCode: string;                                    // Ex: "02.01.015"
  macroetapa?: string;
  title: string;                                      // Ex: "Tubulação PVC R DN 150mm"
  subtitle: string;                                   // Ex: "65% executado • 32m de 50m"
  status: NodeStatus;
  progress: number;                                   // 0 a 100
  position: NodePosition;
  badge?: string | NodeBadgeData;                     // Texto ou objeto de badge customizado
  technicalDescription?: string;                       // Descrição completa da especificação técnica
  sinapiCode?: string;                                // Referência oficial (ex: "SINAPI 104166")
  compositionType?: string;
  budgetedQuantity?: number | string;                 // Ex: 50 ou "50,00 m"
  executedQuantity?: number | string;                 // Ex: 32 ou "32,00 m"
  unit?: string;                                      // Ex: "m", "m²", "m³", "un"
  budgetedValue?: number;                             // Valor orçado em R$
  executedValue?: number;                             // Valor executado em R$
  financialWeight?: number | string;                  // Ex: 0.10 ou "0,10%"
  financialValue?: string;                            // Ex: "R$ 1.841,63"
  impedimentReason?: string;                          // Motivo do atraso (preenchido quando delayed)
  accelerationOpportunity?: string;                   // Justificativa da ponte dourada (quando accelerate)
  planned?: string;                                   // Prazo planejado (ex: "8 dias")
  actual?: string;                                    // Prazo real / executado (ex: "5 dias")
}

/**
 * Estatísticas da macroetapa para a faixa de métricas.
 */
export interface SectionBannerStats {
  totalServices: number;     // Ex: 7
  completedServices: number; // Ex: 2
  criticalAlerts: number;    // Ex: 1
}

/**
 * Metadados da macroetapa / seção em destaque no banner superior.
 */
export interface SectionBannerData {
  tag?: string;                        // Ex: "MACROETAPA ATUAL"
  title: string;                       // Ex: "SEÇÃO 2: INFRAESTRUTURA E DRENAGEM PROFUNDA"
  description?: string;                // Ex: "Execução de galerias, tubulações de PVC e caixas"
  subtitle?: string;                   // Alias para description
  position?: NodePosition;             // Coordenadas caso seja renderizado posicionado
  stats?: SectionBannerStats;          // Contadores de serviços da seção
  onMemorialClick?: () => void;
}

/**
 * Tipos de elementos decorativos do canteiro de obras.
 * Suporta formatos canônicos e abreviados.
 */
export type DecorationType =
  | 'epi-sign'
  | 'front-office'
  | 'support-zone'
  | 'survey-pin'
  | 'material-pallets'
  | 'epi'
  | 'front'
  | 'support'
  | 'landmark'
  | 'materials';

/**
 * Configuração de posicionamento para decorações de canteiro.
 */
export interface DecorationPosition {
  top: string;
  left?: string;
  right?: string;
}

/**
 * Item decorativo do canteiro de obras.
 */
export interface DecorationItem {
  id: string;
  type: DecorationType;
  position: DecorationPosition;
  title?: string;
  subtitle?: string;
  customTitle?: string;
  customText?: string;
}

/**
 * Carga de dados para apontamento de medição física no canteiro.
 */
export interface StageMeasurementFormValues {
  nodeId: string;
  executedQuantity: number;
  notes?: string;
}
