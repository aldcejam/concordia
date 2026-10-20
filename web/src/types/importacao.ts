/**
 * View-models do UC01 (Importar Planilha Orçamentária). Estruturalmente compatíveis com os modelos gerados
 * pelo Orval, para que os componentes do System Design não dependam do contrato da API.
 */
export interface ErroImportacao {
  linha?: number | null;
  coluna?: string | null;
  mensagem?: string;
}

export interface NoEap {
  codigoEap?: string;
  nome?: string;
  itemServico?: boolean;
  banco?: string | null;
  codigoComposicao?: string | null;
  unidade?: string | null;
  quantidade?: number | null;
  valorTotal?: number;
  pesoPercentual?: number;
  quantidadeItens?: number;
  filhos?: NoEap[];
}

export interface ResumoImportacao {
  formato?: string;
  nomeObra?: string;
  percentualBdi?: number | null;
  totalItens?: number;
  totalMacroetapas?: number;
  totalSubetapas?: number;
  composicoesProprias?: number;
  valorTotalSemBdi?: number;
  valorTotalComBdi?: number;
  somaPesos?: number;
  valida?: boolean;
  eap?: NoEap[];
  erros?: ErroImportacao[];
  avisos?: string[];
}
