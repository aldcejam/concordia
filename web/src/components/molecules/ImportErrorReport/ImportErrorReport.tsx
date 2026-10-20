import React from 'react';
import { FileWarning } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { ErroImportacao } from '@/types/importacao';

export interface ImportErrorReportProps {
  erros: ErroImportacao[];
  /** Limite de linhas exibidas antes do resumo "e mais N erros". */
  maxVisible?: number;
  className?: string;
}

/** UC01, fluxo de exceção 3a: relatório dos erros de parsing com linha e coluna da planilha. */
export const ImportErrorReport: React.FC<ImportErrorReportProps> = ({ erros, maxVisible = 50, className }) => {
  if (erros.length === 0) return null;
  const visiveis = erros.slice(0, maxVisible);
  const ocultos = erros.length - visiveis.length;

  return (
    <section
      role="alert"
      aria-labelledby="import-error-report-title"
      className={cn('overflow-hidden rounded-2xl border border-warning/30 bg-card shadow-sm', className)}
    >
      <header className="flex items-start gap-3 border-b border-warning/20 bg-warning-soft px-5 py-4">
        <FileWarning className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden />
        <div>
          <h3 id="import-error-report-title" className="font-extrabold text-foreground">
            {erros.length === 1 ? '1 erro impede a importação' : `${erros.length} erros impedem a importação`}
          </h3>
          <p className="text-sm text-muted-foreground">Corrija o arquivo e envie novamente.</p>
        </div>
      </header>
      <div className="max-h-80 overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-card font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <tr>
              <th scope="col" className="w-20 px-5 py-2">Linha</th>
              <th scope="col" className="w-24 px-2 py-2">Coluna</th>
              <th scope="col" className="px-2 py-2 pr-5">Problema</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {visiveis.map((erro, index) => (
              <tr key={`${erro.linha}-${erro.coluna}-${index}`}>
                <td className="px-5 py-2 font-mono font-bold text-foreground">{erro.linha ?? '—'}</td>
                <td className="px-2 py-2 font-mono text-muted-foreground">{erro.coluna ?? '—'}</td>
                <td className="px-2 py-2 pr-5 text-foreground">{erro.mensagem}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {ocultos > 0 && (
        <p className="border-t border-border px-5 py-2 text-xs font-bold text-muted-foreground">
          e mais {ocultos} erro(s) não exibidos.
        </p>
      )}
    </section>
  );
};

ImportErrorReport.displayName = 'ImportErrorReport';
