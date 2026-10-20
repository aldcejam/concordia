import React from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { InlineAlert } from '@/components/atoms/InlineAlert/InlineAlert';
import { ImportErrorReport } from '@/components/molecules/ImportErrorReport/ImportErrorReport';
import { ImportSummaryStats } from '@/components/molecules/ImportSummaryStats/ImportSummaryStats';
import { cn } from '@/utils/cn';
import type { ResumoImportacao } from '@/types/importacao';
import { EapTree } from '../EapTree/EapTree';

export interface ImportPreviewPanelProps {
  resumo: ResumoImportacao;
  fileName?: string;
  className?: string;
}

/** Resultado da validação da planilha: erros (3a), avisos, indicadores e árvore da EAP. */
export const ImportPreviewPanel: React.FC<ImportPreviewPanelProps> = ({ resumo, fileName, className }) => {
  const erros = resumo.erros ?? [];
  const avisos = resumo.avisos ?? [];
  const valida = resumo.valida ?? erros.length === 0;

  return (
    <section className={cn('space-y-5', className)} aria-label="Pré-visualização da importação">
      <header className="flex flex-wrap items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
          <FileSpreadsheet className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
            {resumo.formato ?? 'Planilha'}
            {fileName ? ` · ${fileName}` : ''}
          </p>
          <h2 className="truncate text-lg font-extrabold uppercase text-foreground" title={resumo.nomeObra}>
            {resumo.nomeObra || 'Obra sem nome na planilha'}
          </h2>
        </div>
      </header>

      {valida ? (
        <InlineAlert variant="success" title="Planilha válida">
          {resumo.totalItens} itens de serviço organizados em {resumo.totalMacroetapas} macroetapas. Revise a EAP e
          confirme a importação.
        </InlineAlert>
      ) : (
        <ImportErrorReport erros={erros} />
      )}

      {avisos.map((aviso) => (
        <InlineAlert key={aviso} variant="warning">
          {aviso}
        </InlineAlert>
      ))}

      {valida && (
        <>
          <ImportSummaryStats resumo={resumo} />
          <EapTree nodes={resumo.eap ?? []} />
        </>
      )}
    </section>
  );
};

ImportPreviewPanel.displayName = 'ImportPreviewPanel';
