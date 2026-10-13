import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, HardHat, LoaderCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { getListarQueryKey, useCriar } from '@/api/generated/obras/obras';
import { BrComConcordiaInfrastructureObraDtosObraRequestUf } from '@/api/generated/models/brComConcordiaInfrastructureObraDtosObraRequestUf';
import { BlueprintLayout } from '@/components/templates/BlueprintLayout/BlueprintLayout';

const ESTADOS = Object.keys(BrComConcordiaInfrastructureObraDtosObraRequestUf) as Array<keyof typeof BrComConcordiaInfrastructureObraDtosObraRequestUf>;
const NOMES_ESTADOS: Record<string, string> = {
  AC: 'Acre', AL: 'Alagoas', AP: 'Amapá', AM: 'Amazonas', BA: 'Bahia', CE: 'Ceará', DF: 'Distrito Federal', ES: 'Espírito Santo', GO: 'Goiás', MA: 'Maranhão', MT: 'Mato Grosso', MS: 'Mato Grosso do Sul', MG: 'Minas Gerais', PA: 'Pará', PB: 'Paraíba', PR: 'Paraná', PE: 'Pernambuco', PI: 'Piauí', RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte', RS: 'Rio Grande do Sul', RO: 'Rondônia', RR: 'Roraima', SC: 'Santa Catarina', SP: 'São Paulo', SE: 'Sergipe', TO: 'Tocantins',
};
const FUSO_POR_UF: Record<string, string> = {
  AC: 'America/Rio_Branco', AM: 'America/Manaus', RR: 'America/Manaus', RO: 'America/Manaus', MT: 'America/Manaus', MS: 'America/Manaus', CE: 'America/Fortaleza',
};

function apiErrorMessage(error: unknown) {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') return error.message;
  return 'Não foi possível cadastrar a obra. Confira os dados e tente novamente.';
}

export default function NovaObraPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [descricao, setDescricao] = useState('');
  const [uf, setUf] = useState('CE');
  const [fusoHorario, setFusoHorario] = useState('America/Fortaleza');
  const [error, setError] = useState('');
  const criar = useCriar();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    try {
      const response = await criar.mutateAsync({ data: { descricao: descricao.trim(), uf: uf as keyof typeof BrComConcordiaInfrastructureObraDtosObraRequestUf, fusoHorario } });
      if (response.status < 200 || response.status >= 300) {
        const details = response.data as unknown as { detail?: string; message?: string };
        throw new Error(details.detail ?? details.message ?? 'A API não conseguiu cadastrar a obra.');
      }
      await queryClient.invalidateQueries({ queryKey: getListarQueryKey() });
      if (!response.data.id) throw new Error('A obra foi criada, mas a API não retornou seu identificador.');
      await navigate(`/?obraId=${encodeURIComponent(response.data.id)}`);
    } catch (submitError) {
      setError(apiErrorMessage(submitError));
    }
  }

  return (
    <BlueprintLayout>
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
        <Link to="/obras" className="inline-flex min-h-12 items-center gap-2 rounded-lg px-2 text-sm font-bold text-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><ArrowLeft className="size-4" aria-hidden="true" /> Voltar para obras</Link>
        <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <header className="flex items-start gap-4 border-b border-border bg-primary-deep p-6 text-white sm:p-8">
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-white/10"><HardHat className="size-6" aria-hidden="true" /></span>
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-primary-soft">Nova obra</p>
              <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">Cadastre uma obra</h1>
              <p className="mt-2 max-w-xl text-sm text-white/75">Informe os dados básicos para criar o espaço de acompanhamento do projeto.</p>
            </div>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6 p-5 sm:p-8">
            <div className="flex items-start gap-3 rounded-xl border border-primary/15 bg-primary/5 p-4 text-sm text-muted-foreground">
              <Building2 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
              <p>Depois de cadastrar, você poderá abrir o cronograma. A importação da EAP por arquivo CSV é uma etapa separada.</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="obra-descricao" className="block text-sm font-extrabold">Nome da obra <span className="text-warning">*</span></label>
              <input id="obra-descricao" name="descricao" required maxLength={200} autoFocus value={descricao} onChange={(event) => setDescricao(event.target.value)} placeholder="Ex.: Escola Municipal do Centro" className="min-h-12 w-full rounded-xl border border-input bg-background px-4 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="obra-uf" className="block text-sm font-extrabold">Estado (UF) <span className="text-warning">*</span></label>
                <select id="obra-uf" name="uf" required value={uf} onChange={(event) => { const nextUf = event.target.value; setUf(nextUf); setFusoHorario(FUSO_POR_UF[nextUf] ?? 'America/Sao_Paulo'); }} className="min-h-12 w-full rounded-xl border border-input bg-background px-4 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  {ESTADOS.map((estado) => <option key={estado} value={estado}>{estado} — {NOMES_ESTADOS[estado]}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="obra-fuso" className="block text-sm font-extrabold">Fuso horário <span className="text-warning">*</span></label>
                <select id="obra-fuso" name="fusoHorario" required value={fusoHorario} onChange={(event) => setFusoHorario(event.target.value)} className="min-h-12 w-full rounded-xl border border-input bg-background px-4 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="America/Fortaleza">Horário de Fortaleza (UTC−03:00)</option>
                  <option value="America/Sao_Paulo">Horário de Brasília (UTC−03:00)</option>
                  <option value="America/Manaus">Horário de Manaus (UTC−04:00)</option>
                  <option value="America/Rio_Branco">Horário do Acre (UTC−05:00)</option>
                  <option value="America/Noronha">Horário de Fernando de Noronha (UTC−02:00)</option>
                </select>
              </div>
            </div>

            {error && <p role="alert" className="rounded-xl border border-warning/30 bg-warning-soft p-4 text-sm font-semibold text-foreground">{error}</p>}
            <div className="flex flex-col-reverse justify-end gap-3 border-t border-border pt-5 sm:flex-row">
              <Link to="/obras" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-border px-5 font-bold text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Cancelar</Link>
              <button type="submit" disabled={criar.isPending || !descricao.trim()} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-action px-6 font-extrabold text-action-foreground shadow-action transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60">
                {criar.isPending ? <><LoaderCircle className="size-5 animate-spin" aria-hidden="true" /> Cadastrando…</> : 'Cadastrar obra'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </BlueprintLayout>
  );
}
