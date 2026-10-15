import React, { useState } from 'react';
import { AlertTriangle, Bot, CheckCircle2, Loader2, Sparkles, X } from 'lucide-react';
import { api } from '@/services/api';

export interface SugestaoItem {
  etapaId: string;
  codigoEap: string;
  nome: string;
  justificativa: string;
}

export interface AnaliseAtrasoResult {
  etapaAtrasadaId: string;
  etapaAtrasadaCodigo: string;
  etapaAtrasadaNome: string;
  motivo: string;
  diasAtraso: number;
  sugestoes: SugestaoItem[];
}

export interface SugestaoAtrasoModalProps {
  isOpen: boolean;
  onClose: () => void;
  etapa: {
    id: string;
    nome: string;
    codigoEap?: string;
  } | null;
  obraId: string;
  onSuccess?: (resultado: AnaliseAtrasoResult) => void;
}

export const SugestaoAtrasoModal: React.FC<SugestaoAtrasoModalProps> = ({
  isOpen,
  onClose,
  etapa,
  obraId,
  onSuccess,
}) => {
  const [motivo, setMotivo] = useState('Atraso no fornecimento de insumos e condições climáticas adversas');
  const [diasAtraso, setDiasAtraso] = useState<number>(5);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<AnaliseAtrasoResult | null>(null);

  if (!isOpen || !etapa) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!motivo.trim() || diasAtraso <= 0) {
      setError('Por favor, informe o motivo e a quantidade de dias de atraso.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await api.post<AnaliseAtrasoResult>(`/obras/${obraId}/analise-atraso`, {
        etapaId: etapa.id,
        motivo,
        diasAtraso,
      });
      setResultado(data);
      onSuccess?.(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao consultar sugestões de IA';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResultado(null);
    setError(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden text-foreground">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-sm">
              <Bot className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="modal-title" className="text-lg font-extrabold text-foreground">
                  Reprogramação com IA
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold/15 text-gold-dark border border-gold/30">
                  <Sparkles className="size-3" /> Assistido por IA
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Etapa: <strong className="text-foreground">{etapa.codigoEap ? `${etapa.codigoEap} • ` : ''}{etapa.nome}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Fechar modal"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        {!resultado ? (
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 flex items-start gap-3 text-warning-dark">
              <AlertTriangle className="size-5 shrink-0 text-warning mt-0.5" />
              <div className="text-xs leading-relaxed text-foreground">
                <strong className="block font-bold mb-1 text-warning">Indicar Atraso na Etapa:</strong>
                Informe os detalhes do atraso ocorrido. O sistema enviará o cronograma completo para a IA analisar
                e sugerir etapas subsequentes que podem ser adiantadas ou executadas em paralelo.
              </div>
            </div>

            <div>
              <label htmlFor="motivo" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Motivo do Atraso
              </label>
              <textarea
                id="motivo"
                rows={3}
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Ex: Atraso no fornecimento de insumos, chuvas fortes, indisponibilidade de equipe..."
                className="w-full text-sm rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="diasAtraso" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Dias Estimados de Atraso
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="diasAtraso"
                  type="number"
                  min="1"
                  max="365"
                  value={diasAtraso}
                  onChange={(e) => setDiasAtraso(Number(e.target.value))}
                  className="w-32 text-sm rounded-xl border border-border bg-background px-3 py-2 font-mono font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                  required
                />
                <span className="text-xs font-medium text-muted-foreground">dias corridos</span>
              </div>
            </div>

            {error && (
              <div className="text-xs text-danger bg-danger/10 border border-danger/20 rounded-xl p-3">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-md hover:bg-primary-soft transition-all active:scale-95 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Consultando IA...
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" />
                    Consultar IA para Opções de Adiantamento
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-6 space-y-6">
            {/* Summary card */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-primary">Diagnóstico de Atraso</p>
                <p className="text-sm font-bold text-foreground mt-0.5">
                  {resultado.etapaAtrasadaCodigo ? `${resultado.etapaAtrasadaCodigo} — ` : ''}
                  {resultado.etapaAtrasadaNome}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Impacto informado: <strong className="text-danger">{resultado.diasAtraso} dias</strong> • {resultado.motivo}
                </p>
              </div>
              <CheckCircle2 className="size-6 text-primary shrink-0" />
            </div>

            {/* Suggestions list */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-foreground">
                  Opções de Etapas para Adiantamento ({resultado.sugestoes.length})
                </h4>
                <span className="text-[10px] text-muted-foreground">Gerado pela IA do Concordia</span>
              </div>

              <div className="space-y-3">
                {resultado.sugestoes.map((sugestao, idx) => (
                  <div
                    key={sugestao.etapaId || idx}
                    className="p-4 rounded-xl border border-border bg-background shadow-sm hover:border-primary/40 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="inline-block text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-gold/15 text-gold-dark mb-1">
                          {sugestao.codigoEap || `Opção ${idx + 1}`}
                        </span>
                        <h5 className="text-sm font-bold text-foreground leading-snug">{sugestao.nome}</h5>
                      </div>
                    </div>
                    <div className="mt-2.5 pt-2.5 border-t border-border/60 text-xs leading-relaxed text-muted-foreground">
                      <strong className="text-primary font-semibold block mb-0.5">💡 Justificativa Técnica da IA:</strong>
                      {sugestao.justificativa}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center pt-4 border-t border-border">
              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-bold text-primary hover:underline"
              >
                ← Realizar Nova Análise
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-md hover:bg-primary-soft transition-all"
              >
                Concluir
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SugestaoAtrasoModal;
