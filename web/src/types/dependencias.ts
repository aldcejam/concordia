/** View-models do UC06 (Configurar Dependências Construtivas). */
export type TipoDependencia = 'FI' | 'II' | 'FF';

export const TIPOS_DEPENDENCIA: Record<TipoDependencia, { nome: string; descricao: string }> = {
  FI: {
    nome: 'Fim → Início',
    descricao: 'A sucessora só começa quando a predecessora termina.',
  },
  II: {
    nome: 'Início → Início',
    descricao: 'A sucessora pode começar assim que a predecessora começar.',
  },
  FF: {
    nome: 'Fim → Fim',
    descricao: 'A sucessora só termina depois da predecessora; não bloqueia o início.',
  },
};

export interface VinculoEtapa {
  dependenciaId?: string;
  etapaId?: string;
  codigoEap?: string;
  nome?: string;
  tipo?: TipoDependencia;
  desfasamentoDias?: number;
  obrigatoria?: boolean;
  satisfeita?: boolean;
}

export interface EtapaDependencias {
  id?: string;
  codigoEap?: string;
  nome?: string;
  macroetapa?: string;
  percentualExecutado?: number;
  bloqueada?: boolean;
  predecessoras?: VinculoEtapa[];
  sucessoras?: VinculoEtapa[];
}

export interface DependenciaListada {
  id?: string;
  predecessora?: { id?: string; codigoEap?: string; nome?: string };
  sucessora?: { id?: string; codigoEap?: string; nome?: string };
  tipo?: TipoDependencia;
  desfasamentoDias?: number;
  obrigatoria?: boolean;
  satisfeita?: boolean;
}

export interface NovaDependencia {
  predecessoraId: string;
  tipo: TipoDependencia;
  desfasamentoDias: number;
  obrigatoria: boolean;
}
