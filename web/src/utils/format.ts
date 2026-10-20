const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const decimal = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });
const percent = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const formatMoney = (value?: number | null) => money.format(Number(value ?? 0));
export const formatDecimal = (value?: number | null) => decimal.format(Number(value ?? 0));
export const formatPercent = (value?: number | null) => `${percent.format(Number(value ?? 0))}%`;

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${decimal.format(bytes / 1024)} KB`;
  return `${decimal.format(bytes / (1024 * 1024))} MB`;
}

/** Rótulo curto de etapa: "1.1.1 · Placa de obra". */
export function etapaLabel(etapa: { codigoEap?: string | null; nome?: string | null }): string {
  return [etapa.codigoEap, etapa.nome].filter(Boolean).join(' · ');
}
