import { Check, Layers3, Palette, Ruler } from 'lucide-react';
import { atomicLevels, systemScales, themeTokens } from '@/theme';

export function SystemDesignOverview() {
  return (
    <main className="blueprint-grid min-h-screen bg-background p-6 text-foreground sm:p-10">
      <div className="mx-auto max-w-6xl space-y-10">
        <header className="max-w-3xl space-y-4">
          <p className="font-mono text-xs font-bold tracking-[0.24em] text-primary">CONCORDIA • SYSTEM DESIGN</p>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">A obra como uma trilha tátil.</h1>
          <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
            Este catálogo é o contrato visual do frontend: tokens, hierarquia Atomic Design,
            estados operacionais e componentes reutilizáveis da experiência físico-financeira.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-3" aria-label="Princípios do sistema">
          {[
            { icon: <Palette size={20} />, title: 'Tema semântico', text: 'Tokens CSS e utilitários Tailwind compartilhados.' },
            { icon: <Layers3 size={20} />, title: 'Composição atômica', text: 'Componentes sobem de átomos a templates.' },
            { icon: <Ruler size={20} />, title: 'Campo primeiro', text: 'Estados de medição, prazo e impedimento explícitos.' },
          ].map((principle) => (
            <article key={principle.title} className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-4 grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">{principle.icon}</div>
              <h2 className="font-extrabold">{principle.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{principle.text}</p>
            </article>
          ))}
        </section>

        <section className="space-y-4" aria-labelledby="tokens-title">
          <div><p className="font-mono text-xs font-bold tracking-widest text-primary">01 / TOKENS</p><h2 id="tokens-title" className="mt-1 text-2xl font-extrabold">Paleta semântica</h2></div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {themeTokens.map((token) => (
              <article key={token.variable} className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <div className={`h-16 ${token.utility}`} aria-hidden="true" />
                <div className="space-y-1 p-4">
                  <div className="flex items-center justify-between gap-2"><h3 className="font-bold">{token.name}</h3><code className="font-mono text-[10px] text-muted-foreground">{token.variable}</code></div>
                  <p className="text-xs leading-relaxed text-muted-foreground">{token.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-4" aria-labelledby="atomic-title">
          <div><p className="font-mono text-xs font-bold tracking-widest text-primary">02 / HIERARCHY</p><h2 id="atomic-title" className="mt-1 text-2xl font-extrabold">Atomic Design</h2></div>
          <div className="grid gap-3 md:grid-cols-4">
            {atomicLevels.map((level, index) => (
              <article key={level.level} className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="mb-5 flex items-center justify-between"><span className="grid size-8 place-items-center rounded-full bg-primary text-sm font-extrabold text-primary-foreground">{index + 1}</span><Check size={18} className="text-primary" /></div>
                <h3 className="font-extrabold">{level.level}</h3>
                <code className="mt-2 block font-mono text-[10px] text-primary">src/{level.path}</code>
                <p className="mt-3 text-sm text-muted-foreground">{level.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-4" aria-labelledby="scales-title">
          <div><p className="font-mono text-xs font-bold tracking-widest text-primary">03 / FOUNDATIONS</p><h2 id="scales-title" className="mt-1 text-2xl font-extrabold">Escalas de interface</h2></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Object.entries(systemScales).map(([category, scales]) => (
              <article key={category} className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <h3 className="font-extrabold capitalize">{category}</h3>
                <div className="mt-4 space-y-3">
                  {scales.map((scale) => <div key={scale.name} className="border-t border-border pt-3"><div className="flex items-center justify-between gap-2"><span className="text-sm font-bold">{scale.name}</span><code className="font-mono text-[10px] text-primary">{scale.value}</code></div><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{scale.usage}</p></div>)}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-primary/20 bg-primary p-6 text-primary-foreground shadow-tactile sm:p-8" aria-labelledby="usage-title">
          <p className="font-mono text-xs font-bold tracking-widest opacity-70">04 / USAGE</p>
          <h2 id="usage-title" className="mt-2 text-2xl font-extrabold">Escolha a peça antes de criar uma nova.</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-primary-foreground/80">
            Consulte as histórias nesta página para verificar props, estados, responsividade e modo escuro.
            Páginas concretas compõem estas peças e não entram no catálogo como componentes do sistema.
          </p>
        </section>
      </div>
    </main>
  );
}
