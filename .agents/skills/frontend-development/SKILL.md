---
name: frontend-development
description: Implementar telas, fluxos, componentes e integrações do frontend React/Vite do Concordia usando Tailwind CSS puro, Lucide React, TanStack Query, React Router e padrão Atomic Design.
---

# Frontend development

Use esta skill para mudanças em `web/**`, especialmente telas da trilha gamificada de obras (estilo Duolingo tátil),
gestão da EAP, apontamentos de campo, dashboards físico-financeiros, mitigação de atrasos e upload de planilhas orçamentárias.

## Stack Técnica

- **Framework**: React 18+ com Vite e TypeScript.
- **Roteamento**: React Router v6/v7 com rotas centralizadas.
- **Estilização**: Tailwind CSS puro (estilos e componentes manuais, sem Radix/shadcn).
- **Ícones**: Lucide React (`lucide-react`).
- **Estado de Servidor**: TanStack Query (React Query) com cliente e hooks tipados gerados pelo Orval sobre Fetch.
- **Tipografia**: Manrope e IBM Plex Mono.
- **Organização**: Atomic Design (`web/src/components/{atoms,molecules,organisms,templates}` e `web/src/pages`).

## Contrato visual do Concordia

- O tema é verde e está definido em `web/src/theme/tokens.css`. Essa é a única
  origem de fontes, cores semânticas, movimento, camadas e elevação.
- O catálogo canônico é o Storybook em `System Design/**`. Use stories com
  dados mockados explícitos; `nodes=[]` deve renderizar estado vazio.
- O caminho SVG recebe progresso calculado a partir dos nós. Não use percentuais
  fixos em headers, paths ou indicadores.
- Para validar telas responsivas, use `npm run test:e2e`, com os projetos
  `iphone-15-pro` e `ipad-pro-11`.

## Fluxo de Desenvolvimento

1. **Documentação e Requisitos**:
   - Consulte `docs/ux_duolingo_style.md` para o conceito visual e estados da trilha interativa.
   - Consulte `docs/visao_geral_e_requisitos.md` e `docs/fluxo_de_usuarios.md` para as regras de negócio e jornada do usuário.
   - Consulte `.agents/rules/frontend.md` e `AGENTS.md` na raiz para as diretrizes de código.

2. **Hierarquia de Componentes (Atomic Design)**:
   - Adote a skill `atomic-design` (`.agents/skills/atomic-design/SKILL.md`) em `web/src/components/`:
     - `atoms/`: Botões com relevo tátil, badges de status, ícones Lucide estilizados, chips, inputs base.
     - `molecules/`: Nós táteis da trilha com anel circular de progresso SVG, cards de indicadores físico-financeiros, campos de apontamento.
     - `organisms/`: Trilha gamificada completa com curva SVG sinuosa (`ConstructionTimeline`), cabeçalho da obra, modal de memorial técnico/apontamento de medição, painel de adiantamento de etapas.
     - `templates/`: Layouts estruturais de tela (`BlueprintLayout`, `MainLayout`).
     - `pages/`: Telas concretas conectadas ao roteador e aos hooks de dados (`TimelinePage`, `ObrasPage`, etc.).

3. **Integração com a API Backend**:
   - Use o cliente gerado em `web/src/api/generated/` para endpoints descritos pela API.
   - Não edite arquivos gerados; com a API local em execução, regenere-os com `cd web && npm run generate:api` a partir de `http://localhost:8080/v3/api-docs`.
   - Reserve `web/src/services/` para integrações manuais fora do contrato OpenAPI ou adaptadores compartilhados com responsabilidade própria, sem wrappers redundantes sobre o Orval.

4. **Gerenciamento de Estado de Dados (TanStack Query)**:
   - Gerencie cache, revalidação e mutações via TanStack Query.
   - Trate obrigatoriamente os três estados visuais fundamentais:
     - **Carregamento (Loading/Skeleton)**
     - **Erro (Error state com feedback claro)**
     - **Vazio / Ausência de dados (Empty state intuitivo)**

5. **Validação**:
   - Antes de submeter alterações:
     ```bash
     cd web && npm run lint && npm run build
     ```
