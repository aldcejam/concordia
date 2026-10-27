# ADR-003 — Trilha Gamificada em Atomic Design e Cliente HTTP Tipado por OpenAPI

| Campo | Valor |
| --- | --- |
| **ID** | `ADR-003` |
| **Status** | `Aceito` |
| **Data** | `2026-04-19` |
| **Decisores** | Equipe de Engenharia Concordia |
| **Escopo** | Frontend (`web/`) e Contrato REST (`api/openapi.yaml`) |
| **Substitui** | `N/A` |
| **Substituído por** | `N/A` |

## Contexto e Problema

Planilhas orçamentárias e cronogramas de engenharia civil tradicionais apresentam centenas de linhas tabulares densas que dificultam a visualização rápida em campo do que está concluído, em andamento, liberado para início ou bloqueado por dependências técnicas. Além disso, precisávamos garantir consistência visual entre componentes e sincronia estrita entre os contratos HTTP do backend Spring Boot e o frontend React.

## Motor de Decisão (Decision Drivers)

- Reduzir a carga cognitiva do acompanhamento físico-financeiro por meio de uma metáfora visual de trilha gamificada e tátil (inspirada no Duolingo) sobre fundo técnico (*blueprint grid*).
- Garantir reutilização, isolamento de estado e testabilidade visual dos componentes sem dependência de bibliotecas de componentes pesados.
- Manter tipagem ponta a ponta entre `api/openapi.yaml`, os clientes gerados pelo Orval (`web/src/api/generated/`) e o adaptador de erros RFC 7807 (`web/src/services/apiProblem.ts`).

## Opções Consideradas

1. **Opção 1 — Trilha Gamificada em Tailwind CSS puro organizada em Atomic Design + Catálogo Storybook (`System Design/**`) + Cliente TanStack Query gerado via Orval sobre OpenAPI**
2. **Opção 2 — Tabela tradicional / Gráfico de Gantt pronto de terceiros**
3. **Opção 3 — Biblioteca de componentes pré-estilizada (MUI / Ant Design)**

## Decisão

Escolhemos a **Opção 1**:

1. **Experiência Visual de Trilha Gamificada:** As etapas da obra são apresentadas em seções de macroetapas e subetapas (`TimelinePage.tsx`) e no organismo de trilha tátil (`ConstructionTimeline.tsx`, `TactileNode.tsx`, `TimelineNodeItem.tsx`, `SnakePath.tsx`), com estados semânticos claros (`CONCLUÍDO`, `% MEDIDO`, `ORÇADO • SEM MEDIÇÃO`, `BLOQUEADA • AGUARDA ...`, `ADIANTADA PELA IA`).
2. **Organização em Atomic Design + Storybook:** Todos os componentes reutilizáveis residem em `web/src/components/{atoms,molecules,organisms,templates}` com stories adjacentes (`*.stories.tsx`) e documentação consolidada em `System Design/Overview` (`web/src/system-design/SystemDesignOverview.stories.tsx`).
3. **Cliente HTTP Gerado por OpenAPI e RFC 7807:** O utilitário Orval (`web/orval.config.ts`) gera os hooks TanStack Query e modelos TypeScript em `web/src/api/generated/` a partir de `api/openapi.yaml`, enquanto `ensureOk` e `problemMessage` (`web/src/services/apiProblem.ts`) convertem respostas `ProblemDetail` em `ApiProblemError`.

## Consequências

### Positivas

- Identidade visual própria de engenharia civil com feedback tátil imediato e validação automatizada de acessibilidade via `@axe-core/playwright`.
- Isolamento claro entre componentes apresentacionais (`atoms`, `molecules`, `organisms`) e páginas conectadas a estado de servidor (`pages`).
- Sincronização automatizada de tipos e endpoints via `npm run generate:api`.

### Negativas / Trade-offs

- Como o cliente fetch gerado pelo Orval resolve a Promise mesmo para códigos HTTP 4xx/5xx, mutações que dependem de `onError` ou `try/catch` devem envolver a resposta com `ensureOk()` (`web/src/services/apiProblem.ts`).

## Rastreabilidade

- **Casos de Uso afetados:** [UC-OBR-001](../../use-cases/obra/UC-OBR-001-importar-planilha-orcamentaria/README.md), [UC-OBR-002](../../use-cases/obra/UC-OBR-002-visualizar-trilha-obra/README.md), [UC-OBR-003](../../use-cases/obra/UC-OBR-003-registrar-medicao-etapa/README.md), [UC-OBR-004](../../use-cases/obra/UC-OBR-004-analisar-atraso-sugerir-adiantamento/README.md), [UC-OBR-005](../../use-cases/obra/UC-OBR-005-reordenar-etapa-adiantada/README.md), [UC-OBR-006](../../use-cases/obra/UC-OBR-006-configurar-dependencias-construtivas/README.md)
- **Módulos / Caminhos de código:**
  - `web/src/components/`
  - `web/src/system-design/SystemDesignOverview.stories.tsx`
  - `web/src/pages/`
  - `web/src/api/generated/`
  - `web/src/services/apiProblem.ts`
  - `api/openapi.yaml`
