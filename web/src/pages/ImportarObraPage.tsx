import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, FileUp, GitBranch, Map, RotateCcw, Sparkles } from 'lucide-react';
import { importarPlanilha, preVisualizarPlanilha } from '@/api/generated/importação-de-orçamento/importação-de-orçamento';
import { getListarQueryKey } from '@/api/generated/obras/obras';
import { ImportarPlanilhaUf } from '@/api/generated/models';
import type { BrComConcordiaInfrastructureObraDtosImportacaoPlanilhaResponse as ImportacaoResultado } from '@/api/generated/models';
import { InlineAlert } from '@/components/atoms/InlineAlert/InlineAlert';
import { SelectInput } from '@/components/atoms/SelectInput/SelectInput';
import { TactileButton } from '@/components/atoms/TactileButton/TactileButton';
import { TextInput } from '@/components/atoms/TextInput/TextInput';
import { FileDropzone } from '@/components/molecules/FileDropzone/FileDropzone';
import { FormField } from '@/components/molecules/FormField/FormField';
import { ImportErrorReport } from '@/components/molecules/ImportErrorReport/ImportErrorReport';
import { ImportSummaryStats } from '@/components/molecules/ImportSummaryStats/ImportSummaryStats';
import { StepIndicator } from '@/components/molecules/StepIndicator/StepIndicator';
import { AppPageHeader } from '@/components/organisms/AppPageHeader/AppPageHeader';
import { ImportPreviewPanel } from '@/components/organisms/ImportPreviewPanel/ImportPreviewPanel';
import { BlueprintLayout } from '@/components/templates/BlueprintLayout/BlueprintLayout';
import { ensureOk, problemErrors, problemMessage } from '@/services/apiProblem';
import { formatMoney } from '@/utils/format';

const ACCEPT = ['.xlsx', '.xls'];
const STEPS = ['Enviar planilha', 'Revisar EAP', 'Trilha gerada'];
const UF_OPTIONS = Object.values(ImportarPlanilhaUf).map((uf) => ({ value: uf, label: uf }));
const FUSOS = [
  'America/Fortaleza',
  'America/Recife',
  'America/Sao_Paulo',
  'America/Bahia',
  'America/Belem',
  'America/Manaus',
  'America/Cuiaba',
  'America/Porto_Velho',
  'America/Rio_Branco',
  'America/Noronha',
].map((fuso) => ({ value: fuso, label: fuso.replace('America/', '').replace('_', ' ') }));

/** UC01 — Importar Planilha Orçamentária (Excel). */
export const ImportarObraPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [rejectedFile, setRejectedFile] = useState<string | null>(null);
  const [descricao, setDescricao] = useState('');
  const [uf, setUf] = useState<ImportarPlanilhaUf>('RN');
  const [fusoHorario, setFusoHorario] = useState('America/Fortaleza');
  const [resultado, setResultado] = useState<ImportacaoResultado | null>(null);

  const preview = useMutation({
    mutationFn: async (arquivo: File) => ensureOk(await preVisualizarPlanilha({ arquivo })).data,
    onSuccess: (resumo) => setDescricao((atual) => atual || resumo.nomeObra || ''),
  });

  const importacao = useMutation({
    mutationFn: async (arquivo: File) =>
      ensureOk(
        await importarPlanilha({ descricao: descricao.trim() || undefined, uf, fusoHorario }, { arquivo }),
      ).data,
    onSuccess: (data) => {
      setResultado(data);
      void queryClient.invalidateQueries({ queryKey: getListarQueryKey() });
    },
  });

  const resumo = preview.data;
  const step = resultado ? 2 : resumo ? 1 : 0;

  const selecionar = (arquivo: File) => {
    setRejectedFile(null);
    setFile(arquivo);
    setDescricao('');
    importacao.reset();
    preview.mutate(arquivo);
  };

  const recomecar = () => {
    setFile(null);
    setDescricao('');
    setResultado(null);
    setRejectedFile(null);
    preview.reset();
    importacao.reset();
  };

  const confirmar = (event: React.FormEvent) => {
    event.preventDefault();
    if (file && descricao.trim()) importacao.mutate(file);
  };

  const errosImportacao = problemErrors(importacao.error);

  return (
    <BlueprintLayout
      header={
        <AppPageHeader
          eyebrow="UC01 · Nova obra"
          title="Importar orçamento"
          subtitle="Envie a planilha orçamentária (SINAPI analítica ou sintética) para gerar a EAP, os pesos e a trilha da obra."
          onBack={() => navigate('/')}
          backLabel="Voltar para a trilha"
        />
      }
    >
      <div className="mx-auto max-w-6xl space-y-6 p-4 lg:p-8">
        <StepIndicator steps={STEPS} current={step} className="rounded-2xl border border-border bg-card p-4 shadow-sm" />

        {step < 2 && (
          <section className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6" aria-labelledby="upload-title">
            <h2 id="upload-title" className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-widest text-muted-foreground">
              <FileUp className="size-4" aria-hidden /> 1. Planilha orçamentária
            </h2>
            <FileDropzone
              accept={ACCEPT}
              file={file}
              onFileSelected={selecionar}
              onRejected={(arquivo) => setRejectedFile(arquivo.name)}
              onClear={recomecar}
              loading={preview.isPending}
              loadingLabel="Validando planilha…"
              disabled={importacao.isPending}
              compact={Boolean(resumo)}
            />
            {rejectedFile && (
              <InlineAlert variant="error" title="Formato não suportado" onDismiss={() => setRejectedFile(null)}>
                “{rejectedFile}” não é uma planilha Excel. Envie um arquivo .xlsx ou .xls.
              </InlineAlert>
            )}
            {preview.isError && (
              <InlineAlert variant="error" title="Não foi possível validar a planilha">
                {problemMessage(preview.error)}
              </InlineAlert>
            )}
          </section>
        )}

        {step === 1 && resumo && (
          <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <ImportPreviewPanel
              resumo={resumo}
              fileName={file?.name}
              className="min-w-0 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"
            />

            <form
              onSubmit={confirmar}
              aria-label="Dados da obra"
              className="space-y-5 self-start rounded-2xl border border-border bg-card p-5 shadow-sm lg:sticky lg:top-6"
            >
              <h2 className="text-sm font-extrabold uppercase tracking-widest text-muted-foreground">2. Dados da obra</h2>
              {resumo.valida ? (
                <>
                  <FormField
                    label="Descrição da obra"
                    required
                    hint="Sugerida a partir do cabeçalho da planilha."
                    error={!descricao.trim() ? 'Informe a descrição da obra.' : null}
                  >
                    {(props) => (
                      <TextInput
                        {...props}
                        value={descricao}
                        maxLength={255}
                        disabled={importacao.isPending}
                        onChange={(event) => setDescricao(event.target.value)}
                      />
                    )}
                  </FormField>
                  <div className="grid grid-cols-[96px_1fr] gap-3">
                    <FormField label="UF" required>
                      {(props) => (
                        <SelectInput
                          {...props}
                          options={UF_OPTIONS}
                          value={uf}
                          disabled={importacao.isPending}
                          onChange={(event) => setUf(event.target.value as ImportarPlanilhaUf)}
                        />
                      )}
                    </FormField>
                    <FormField label="Fuso horário" required>
                      {(props) => (
                        <SelectInput
                          {...props}
                          options={FUSOS}
                          value={fusoHorario}
                          disabled={importacao.isPending}
                          onChange={(event) => setFusoHorario(event.target.value)}
                        />
                      )}
                    </FormField>
                  </div>

                  {importacao.isError &&
                    (errosImportacao.length > 0 ? (
                      <ImportErrorReport erros={errosImportacao} />
                    ) : (
                      <InlineAlert variant="error" title="Importação não concluída">
                        {problemMessage(importacao.error)}
                      </InlineAlert>
                    ))}

                  <TactileButton
                    type="submit"
                    variant="action"
                    size="lg"
                    className="h-12 w-full"
                    loading={importacao.isPending}
                    disabled={!descricao.trim()}
                    leftIcon={<Sparkles className="size-4" />}
                  >
                    Importar e gerar trilha
                  </TactileButton>
                  <p className="text-center text-xs text-muted-foreground">
                    {resumo.totalItens} itens · {formatMoney(resumo.valorTotalComBdi)}
                  </p>
                </>
              ) : (
                <>
                  <InlineAlert variant="error" title="Corrija a planilha">
                    A importação foi bloqueada porque o arquivo possui erros. Ajuste as linhas indicadas no relatório e
                    envie novamente.
                  </InlineAlert>
                  <TactileButton variant="outline" size="lg" className="h-12 w-full" onClick={recomecar} leftIcon={<RotateCcw className="size-4" />}>
                    Enviar outro arquivo
                  </TactileButton>
                </>
              )}
            </form>
          </div>
        )}

        {step === 2 && resultado && (
          <section aria-labelledby="sucesso-title" className="space-y-6 rounded-2xl border border-emerald-300 bg-card p-5 shadow-sm sm:p-8">
            <InlineAlert variant="success" title={<span id="sucesso-title">Obra importada com sucesso!</span>}>
              “{resultado.descricaoObra}” foi criada com {resultado.resumo?.totalItens} itens de serviço,
              {' '}
              {resultado.resumo?.totalMacroetapas} macroetapas e custo total de{' '}
              <strong>{formatMoney(resultado.resumo?.valorTotalComBdi)}</strong>. Os pesos somam{' '}
              {resultado.resumo?.somaPesos}%.
            </InlineAlert>
            {resultado.resumo && <ImportSummaryStats resumo={resultado.resumo} />}
            <div className="grid gap-3 sm:grid-cols-3">
              <TactileButton
                variant="primary"
                size="lg"
                className="h-12"
                onClick={() => navigate(`/obras/${resultado.idObra}`)}
                leftIcon={<Map className="size-4" />}
                rightIcon={<ArrowRight className="size-4" />}
              >
                Abrir trilha da obra
              </TactileButton>
              <TactileButton
                variant="gold"
                size="lg"
                className="h-12"
                onClick={() => navigate(`/obras/${resultado.idObra}/dependencias`)}
                leftIcon={<GitBranch className="size-4" />}
              >
                Configurar dependências
              </TactileButton>
              <TactileButton variant="outline" size="lg" className="h-12" onClick={recomecar} leftIcon={<RotateCcw className="size-4" />}>
                Importar outra planilha
              </TactileButton>
            </div>
          </section>
        )}
      </div>
    </BlueprintLayout>
  );
};

export default ImportarObraPage;
