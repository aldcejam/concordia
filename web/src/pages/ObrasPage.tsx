import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Building2, HardHat, Plus } from 'lucide-react';
import { useListar } from '@/api/generated/obras/obras';
import type { BrComConcordiaInfrastructureObraDtosObraResponse } from '@/api/generated/models';
import { BlueprintLayout } from '@/components/templates/BlueprintLayout/BlueprintLayout';
import { requireSuccess } from '@/hooks/useDelayReprogramming';

export default function ObrasPage() {
  const obrasQuery = useListar<BrComConcordiaInfrastructureObraDtosObraResponse[]>({
    query: { select: requireSuccess },
  });
  const obras = obrasQuery.data ?? [];

  return (
    <BlueprintLayout>
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:py-12">
        <Link to="/" className="inline-flex min-h-12 items-center gap-2 rounded-lg px-2 text-sm font-bold text-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <ArrowLeft className="size-4" aria-hidden="true" /> Voltar ao cronograma
        </Link>

        <header className="mt-6 flex flex-col gap-5 rounded-2xl border border-primary-deep/20 bg-primary-deep p-6 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-white/10"><HardHat className="size-6" aria-hidden="true" /></span>
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-primary-soft">Concordia • obras</p>
              <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">Suas obras</h1>
              <p className="mt-2 max-w-xl text-sm text-white/75">Cadastre uma obra e acompanhe o cronograma em um só lugar.</p>
            </div>
          </div>
          <Link to="/obras/nova" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-action px-5 font-extrabold text-action-foreground shadow-action transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
            <Plus className="size-5" aria-hidden="true" /> Cadastrar obra
          </Link>
        </header>

        <section className="mt-8" aria-labelledby="works-heading">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-widest text-primary">Painel de obras</p>
              <h2 id="works-heading" className="mt-1 text-xl font-extrabold">Obras cadastradas</h2>
            </div>
            {!obrasQuery.isLoading && !obrasQuery.isError && <span className="rounded-full bg-muted px-3 py-1 font-mono text-xs font-bold text-muted-foreground">{obras.length}</span>}
          </div>

          {obrasQuery.isLoading && <div role="status" className="rounded-xl border border-border bg-card p-6 text-sm font-semibold text-muted-foreground">Carregando obras…</div>}
          {obrasQuery.isError && <div role="alert" className="rounded-xl border border-warning/30 bg-warning-soft p-6 text-sm"><p className="font-bold text-foreground">Não foi possível carregar as obras.</p><button type="button" onClick={() => void obrasQuery.refetch()} className="mt-3 min-h-12 rounded-lg px-3 font-bold text-primary underline focus-visible:ring-2 focus-visible:ring-ring">Tentar novamente</button></div>}
          {!obrasQuery.isLoading && !obrasQuery.isError && obras.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-card/80 px-6 py-12 text-center">
              <span className="mx-auto grid size-14 place-items-center rounded-full bg-primary/10 text-primary"><Building2 className="size-7" aria-hidden="true" /></span>
              <h3 className="mt-4 text-lg font-extrabold">Nenhuma obra cadastrada ainda</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">Comece informando o nome, o estado e o fuso horário da obra.</p>
              <Link to="/obras/nova" className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 font-bold text-primary-foreground shadow-tactile focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Cadastrar primeira obra <ArrowRight className="size-4" aria-hidden="true" /></Link>
            </div>
          )}
          {!obrasQuery.isLoading && !obrasQuery.isError && obras.length > 0 && (
            <ul className="grid gap-4 md:grid-cols-2">
              {obras.map((obra) => (
                <li key={obra.id}>
                  <Link to={`/?obraId=${encodeURIComponent(obra.id ?? '')}`} className="group flex min-h-32 items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-6">
                    <span className="flex min-w-0 items-start gap-4">
                      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Building2 className="size-5" aria-hidden="true" /></span>
                      <span className="min-w-0">
                        <span className="block line-clamp-2 font-extrabold leading-snug text-foreground">{obra.descricao}</span>
                        <span className="mt-2 block font-mono text-xs text-muted-foreground">{obra.uf ?? 'UF não informada'}{obra.fusoHorario ? ` • ${obra.fusoHorario}` : ''}</span>
                      </span>
                    </span>
                    <ArrowRight className="size-5 shrink-0 text-primary transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </BlueprintLayout>
  );
}
