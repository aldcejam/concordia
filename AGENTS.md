# Concordia — instruções para agentes

Este arquivo é o índice de contexto do repositório. Antes de alterar código,
leia as instruções aplicáveis ao caminho modificado e consulte a documentação
do fluxo envolvido.

## Ordem de leitura

1. `AGENTS.md` na raiz (este arquivo).
2. Regras em `.agents/rules/` específicas para o caminho alterado (ex.: `.agents/rules/frontend.md` para `web/**`).
3. Documentação técnica indicada no Mapa do Repositório abaixo.
4. Skills em `.agents/skills/` quando a tarefa se enquadrar em uma delas.

Não altere `.agents/`, `docs/` ou arquivos de configuração apenas para
registrar estas instruções. Eles são fontes de contexto do projeto.

---

## Mapa do repositório

| Caso | Procure primeiro | Depois valide |
| --- | --- | --- |
| Visão geral, requisitos e regras de negócio | `docs/visao_geral_e_requisitos.md` | `docs/casos_de_uso.md`, `docs/fluxo_de_usuarios.md` |
| Interface gamificada (estilo Duolingo) e UX | `docs/ux_duolingo_style.md`, `.agents/skills/atomic-design/SKILL.md` | `web/src/components/`, `docs/fluxo_de_usuarios.md` |
| Telas, componentes e desenvolvimento frontend | `.agents/rules/frontend.md`, `.agents/skills/frontend-development/SKILL.md`, `web/src/` | `web/package.json`, `web/src/styles.css` |
| Design System e organização Atomic Design | `.agents/skills/atomic-design/SKILL.md` | `web/src/components/` (`atoms/`, `molecules/`, `organisms/`, `templates/`) |
| Contrato da API e cliente HTTP | `api/openapi.yaml`, `web/src/services/api.ts` | Endpoints em `api/src/main/java/br/com/concordia/`, Swagger em `http://localhost:8080/swagger` |
| Ingestão e parsing de planilhas SINAPI/EAP | `docs/diagramas_atividades.md`, `docs/orcamento_analitico.xlsx` | `api/src/main/java/br/com/concordia/domain/obra/` |
| Entidades de domínio e arquitetura | `docs/diagramas_estruturais.md`, `api/docs/entidades.mmd` | Pacotes em `api/src/main/java/br/com/concordia/domain/` |
| Backend Java / Spring Boot | `api/pom.xml`, `compose.yaml` | `api/src/main/java/br/com/concordia/` |
| Testes E2E, componentes e visual regression | `.agents/skills/bp-playwright/SKILL.md` | Execução de testes em `web/` |

---

## Skills disponíveis

As skills especializadas estão configuradas em `.agents/skills/`:

- **`atomic-design`** (`.agents/skills/atomic-design/SKILL.md`): Padrão de organização e composição de componentes React em hierarquia atômica (átomos, moléculas, organismos, templates e páginas), diretrizes para isolamento e componentização.
- **`frontend-development`** (`.agents/skills/frontend-development/SKILL.md`): Fluxo de desenvolvimento do frontend React/Vite do Concordia, uso de Tailwind CSS puro, Lucide React, TanStack Query, React Router e implementação da trilha gamificada/tátil.
- **`bp-playwright`** (`.agents/skills/bp-playwright/SKILL.md`): Melhores práticas para testes automatizados com Playwright (E2E, componentes, Page Object Model, fixtures, mocks, responsividade, acessibilidade e CI/CD).
- **`storybook-mcp`** (`.agents/skills/storybook-mcp/SKILL.md`): Fluxo para consultar o catálogo do Storybook via MCP antes de criar ou alterar componentes e stories.

---

## Regras essenciais

- **Frontend (`web`)**:
  - Stack: React 18+, TypeScript, Vite, Tailwind CSS puro (sem Radix/shadcn), Lucide React, React Router v6/v7 e TanStack Query com cliente HTTP manual.
  - Tipografia: Manrope e IBM Plex Mono.
  - Organize componentes segundo o padrão Atomic Design em `web/src/components/` (`atoms/`, `molecules/`, `organisms/`, `templates/`) e páginas em `web/src/pages/`.
  - Implemente o conceito visual da trilha gamificada de acompanhamento físico-financeiro da obra (estilo Duolingo tátil e blueprint grid), conforme detalhado em `docs/ux_duolingo_style.md`.
  - Trate explicitamente estados de carregamento (loading), erro (error feedback) e vazio (empty state).
- **Backend (`api`)**:
  - Java 25, Spring Boot 3+, Spring Data JPA, Spring Security, PostgreSQL.
  - Preserve a separação rigorosa entre domínio (`domain`) e infraestrutura (`infrastructure`).
  - Mantenha os contratos de endpoints sincronizados em `api/openapi.yaml`.
- **Segurança**: Nunca versione chaves de acesso, credenciais, arquivos `.env` ou dumps com dados confidenciais.

---

## Validação

- **Frontend**:
  ```bash
  cd web && npm run lint && npm run build && npm run test && npm run test:e2e
  ```
- **Backend**:
  ```bash
  cd api && mvn test
  ```
- **Infraestrutura local (Banco de Dados)**:
  ```bash
  docker compose up -d postgres
  ```

## Storybook e System Design

- O catálogo canônico de componentes fica no Storybook sob a hierarquia `System Design/**`.
- Todo átomo, molécula, organismo e template reutilizável deve ter uma story adjacente ao componente, com estados relevantes e callbacks determinísticos.
- A página `System Design/Overview` documenta tokens do tema, hierarquia Atomic Design e regras de composição. Ela existe apenas no Storybook e não é uma rota de produção.
- Para iniciar o catálogo e o servidor MCP local:
  ```bash
  cd web && npm run storybook
  ```
- O MCP do projeto chama-se `concordia-storybook` e usa `http://localhost:6006/mcp`, conforme `.mcp.json`. Ao trabalhar em UI, consulte o MCP antes de assumir props, variantes ou padrões de uso.
- A skill `.agents/skills/storybook-mcp/SKILL.md` orienta a IA sobre `docs-list`, `docs-show`, `docs-show-story`, `get-storybook-story-instructions`, `stories-preview` e `test-run`.
