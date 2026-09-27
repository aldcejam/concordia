# Regras do Frontend

Aplica-se a `web/**`.

## Stack e Arquitetura

- **Tecnologias**: React 18+, TypeScript, Vite, Tailwind CSS puro (estilos e componentes manuais, sem Radix/shadcn), Lucide React, React Router v6/v7 e TanStack Query.
- **Tipografia**: Manrope (interface padrão) e IBM Plex Mono (código, códigos SINAPI, tags técnicas e EAP).
- **Componentes e Atomic Design**:
  - Adote rigorosamente a estrutura de Atomic Design em `web/src/components/`:
    - `atoms/`: Elementos visuais primitivos construídos com Tailwind puro (botões táteis, badges de status, ícones com Lucide, chips, inputs base).
    - `molecules/`: Nós táteis da trilha (com anéis circulares de progresso, tooltips e estados), cards de indicadores de progresso físico-financeiro, seletores de etapas.
    - `organisms/`: Trilha gamificada completa com caminho sinuoso em SVG (`GamifiedTimeline`), cabeçalho da obra com métricas, modal de apontamento/memorial técnico, painel de recomendações de mitigação/adiantamento.
    - `templates/`: Layouts estruturais de página (BlueprintLayout, DashboardLayout).
    - `pages/`: Páginas da aplicação vinculadas às rotas do React Router (`web/src/pages/` ou `web/src/routes/`).
  - Cada componente reutilizável deve residir em sua própria pasta dedicada em PascalCase (ex.: `organisms/ConstructionTimeline/`), contendo o componente, sua story e testes quando aplicáveis.
  - Não crie `index.ts` por padrão em toda pasta de componente. Use um barrel somente quando ele definir uma API pública útil, agrupar mais de um módulo público ou simplificar imports recorrentes; caso contrário, importe diretamente o arquivo do componente.
  - Barrels de nível (`atoms/index.ts`, etc.) e o barrel raiz (`src/components/index.ts`) também são opcionais e devem existir apenas quando houver consumidores reais dessa API agregada.
  - Quando um componente complexo for composto por várias estruturas visuais auxiliares que não são reutilizadas fora dele, mantenha essas estruturas privadas em `<PastaDoComponente>/components/`.
  - Componentes privados em `<PastaDoComponente>/components/` não devem ser promovidos para `atoms/`, `molecules/` ou outros níveis globais, nem reexportados por barrels públicos, enquanto não houver reutilização real fora do componente pai.

## Integração com API e Estado

- **Cliente HTTP**: Para endpoints documentados pelo backend, use o cliente e os hooks tipados gerados pelo Orval em `web/src/api/generated/`; não edite arquivos gerados manualmente.
- **Services manuais**: Reserve `web/src/services/` para integrações escritas à mão que não estejam cobertas pelo contrato OpenAPI ou para adaptadores compartilhados com responsabilidade própria. Não crie wrappers redundantes sobre o cliente gerado.
- **Regeneração**: Com a API local em execução, use `cd web && npm run generate:api` para atualizar o cliente a partir de `http://localhost:8080/v3/api-docs`.
- **TanStack Query**: Gerenciamento de estado de servidor (cache, mutações e revalidação de dados de obras, etapas e medições). Trate explicitamente:
  - `isLoading`: Skeletons ou indicadores de carregamento no estilo blueprint.
  - `isError`: Mensagens e alertas de erro contextuais claros.
  - `isEmpty`: Estados vazios estilizados.

## Estilo e Interface Gamificada (Estilo Duolingo / Blueprint)

- Siga a identidade visual da interface tátil:
  - Fundo com padrão de grade arquitetônica (`.blueprint-grid`).
  - Nós de etapa com efeito tátil 3D (`.node-tactile`, `--node-color`, `--node-depth`), sombras táteis (`.shadow-tactile`), animações de pulso (`.active-pulse`) e badge flutuante de adiantamento (`.gold-float`).
  - Caminho sinuoso com SVG pontilhado e preenchimento proporcional ao progresso.
  - Estados dos nós:
    - `Concluído`: Verde / Ícone `lucide-react` `Check`
    - `Em Execução`: Azul pulsante com anel de progresso SVG e ícone de medição
    - `Atrasada`: Alerta crítico / Ícone `TriangleAlert`
    - `Adiantável / Ponte Dourada`: Dourado (`--gold`) com badge `⚡ ADIANTAR!` e ícone `Gem`
    - `Bloqueada`: Cinza concreto (`--concrete`) com ícone `LockKeyhole`
    - `Marco Final`: Troféu dourado / Ícone `Trophy`

## Fundamentos visuais obrigatórios

- **Tema**: verde floresta, verde suave, terracota de ação, dourado de adiantamento,
  alerta operacional e cinza concreto. Azul/ciano não faz parte do tema atual.
- **Tipografia**: `Manrope` para interface e `IBM Plex Mono` para códigos,
  métricas e tags técnicas. A origem das fontes fica em `web/src/theme/tokens.css`;
  não duplique imports no HTML ou no Storybook.
- **Espaçamento**: use a escala Tailwind com unidade base de 4px. Prefira
  `gap-4`, `p-5`, `p-6`, `space-y-4` e `max-w-6xl`; documente exceções no componente.
- **Interação**: controles de campo devem ter pelo menos 48px de área útil,
  foco visível com `ring-2` e estados `hover`, `active`, `disabled` e `loading`.
- **Elevação e camadas**: `shadow-sm` para superfícies, `shadow-tactile` para
  ações táteis, `shadow-2xl` para overlays; use as camadas semânticas `header`,
  `floating`, `popover` e `drawer` do Tailwind.
- **Movimento**: use `duration-fast`, `duration-standard` e `duration-slow`.
  Animações contínuas devem respeitar `prefers-reduced-motion`.
- **Estados de dados**: componentes recebem dados explicitamente. Não substitua
  `[]` por fixtures ou conteúdo padrão; o estado vazio deve continuar vazio.
- **System Design**: toda peça reutilizável tem story sob `System Design/<Level>/`
  com dados mockados explícitos e estados relevantes.

## Validação e Qualidade

- Valide sempre com:
  ```bash
  cd web && npm run lint && npm run build && npm run test && npm run test:e2e
  ```
