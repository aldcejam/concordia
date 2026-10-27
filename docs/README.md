# Documentação do Sistema — Concordia

## 1. Visão Geral do Produto

- **Propósito do Sistema:** O Concordia transforma o gerenciamento de cronogramas e orçamentos de obras da construção civil (baseados em planilhas analíticas e sintéticas SINAPI/próprias) em uma trilha interativa e gamificada de acompanhamento físico-financeiro, combinada a um grafo de dependências construtivas (`FI`, `II`, `FF`) e a um motor de recomendação inteligente (via modelo de linguagem com fallback determinístico local) que analisa atrasos e sugere quais etapas independentes podem ser adiantadas para mitigar impactos no prazo.
- **Domínio de Aplicação:** Engenharia civil, orçamento de obras (EAP / SINAPI) e planejamento e controle físico-financeiro de empreendimentos.
- **Atores e Sistemas Iniciadores:**
  - `Engenheiro / Gestor de Obras`: Importa planilhas orçamentárias (`.xlsx`, `.xls`, `.csv`), gerencia o cadastro de obras, empresas, insumos e composições, configura vínculos de precedência na EAP, analisa atrasos e aplica reprogramações na trilha.
  - `Mestre de Obras / Fiscal de Campo`: Consulta a trilha gamificada da obra, acompanha o estado de liberação ou bloqueio das etapas e registra medições de avanço físico e apontamentos de atraso/impedimento.
  - `Operador / Script CLI`: Executa a sincronização em lote de composições de planilhas analíticas via script utilitário (`api/scripts/importar-orcamento-xlsx.py`).
  - `Provedor de IA (OpenRouter / OpenAI API)`: Sistema externo acionado sob demanda pelo backend (`OpenAiReprogramacaoClient`) para avaliar viabilidade técnica de adiantamento de etapas diante de atrasos.

## 2. Stack Tecnológica e Comandos de Verificação

Detalhes arquiteturais estão registrados em [`docs/technical/architecture/README.md`](./technical/architecture/README.md).

| Camada | Tecnologia / Versão | Diretório no Repositório |
| --- | --- | --- |
| Backend | Java 25, Spring Boot 4.1.1 (WebMVC, Data JPA, Validation, Security, Actuator), Apache POI 5.4.1, MapStruct 1.6.3, SpringDoc OpenAPI 3.1.0 | [`api/`](../api/) |
| Frontend | React 18.3, TypeScript 5.7, Vite 6.0, Tailwind CSS 3.4, TanStack Query 5.62, React Router 6.28, Lucide React, Orval 8.2, Storybook 10.6 | [`web/`](../web/) |
| Persistência | PostgreSQL 17 (`postgres:17-alpine`) e scripts SQL de evolução estrutural | [`api/src/main/resources/db/migration/`](../api/src/main/resources/db/migration/) |
| Infraestrutura Local | Docker Compose (`postgres`, `api`, `web`) | [`compose.yaml`](../compose.yaml) |

### Comandos Oficiais do Repositório

| Verificação | Diretório de Execução | Comando Confirmado |
| --- | --- | --- |
| Build / Compilação (Backend) | `api/` | `mvn test-compile` |
| Build / Compilação (Frontend) | `web/` | `npm run build` |
| Todos os testes (Backend) | `api/` | `mvn test` |
| Teste único (Backend) | `api/` | `mvn test -Dtest=<ClasseDeTeste>#<metodo>` |
| Testes de componentes (Frontend) | `web/` | `npm run test` |
| Testes E2E e acessibilidade (Frontend) | `web/` | `npm run test:e2e` |
| Teste E2E único (Frontend) | `web/` | `npx playwright test tests/e2e/<arquivo>.spec.ts` |
| Linter (Frontend) | `web/` | `npm run lint` |
| Formatação (Backend) | `api/` | `mvn spotless:check` |
| Geração do cliente HTTP OpenAPI | `web/` | `npm run generate:api` |
| Catálogo Storybook | `web/` | `npm run storybook` |

### Entrada para Desenvolvimento

Consulte o arquivo [`AGENTS.md`](../AGENTS.md) na raiz do repositório para as convenções globais do projeto, mapa de leitura, execução de infraestrutura local e diretrizes de validação de código e design system.

## 3. Mapa de Áreas Funcionais e Domínios

| Sigla | Área / Domínio | Escopo e Responsabilidade | Pasta de Casos de Uso | Regras de Domínio |
| --- | --- | --- | --- | --- |
| `OBR` | Gestão de Obras, EAP e Cronograma | Cadastro de obras e etapas, ingestão de planilhas orçamentárias Excel (`.xlsx`/`.xls`) e CSV, visualização da trilha gamificada, medição física, grafo de dependências (`FI`, `II`, `FF`), análise de atraso com IA/fallback e reordenação de etapas | [`docs/use-cases/obra/`](./use-cases/obra/) | [`docs/domain/obra/rules.md`](./domain/obra/rules.md) |
| `CAT` | Catálogo Orçamentário (Insumos e Composições) | Cadastro e manutenção de insumos e composições de custos unitários em estrutura hierárquica composta (*Composite Pattern*) | [`docs/use-cases/catalogo/`](./use-cases/catalogo/) | [`docs/domain/catalogo/rules.md`](./domain/catalogo/rules.md) |
| `EMP` | Cadastro de Empresas | Gestão cadastral de empresas contratadas vinculadas às obras (nome fantasia, CNPJ e razão social) | [`docs/use-cases/empresa/`](./use-cases/empresa/) | [`docs/domain/empresa/rules.md`](./domain/empresa/rules.md) |

## 4. Entradas de Navegação

| Necessidade | Onde Consultar |
| --- | --- |
| Encontrar fluxos implementados e documentados | [Catálogo de Casos de Uso](./use-cases/README.md) |
| Consultar conceitos e termos do negócio | [Vocabulário do Domínio (Ubiquitous Language)](./domain/ubiquitous-language.md) |
| Consultar regras compartilhadas de domínio | [Regras de Obras (`OBR`)](./domain/obra/rules.md) · [Regras de Catálogo (`CAT`)](./domain/catalogo/rules.md) · [Regras de Empresas (`EMP`)](./domain/empresa/rules.md) |
| Entender a organização modular, C4 e garantias técnicas | [Arquitetura do Sistema](./technical/architecture/README.md) |
| Consultar decisões arquiteturais aplicadas | [Índice de ADRs](./technical/adr/README.md) |
| Consultar contratos de API e integrações | [Contrato REST Concordia API](./technical/api/concordia-rest-api.md) · [Contrato de Integração IA (OpenRouter/OpenAI)](./technical/api/openrouter-ia-integration.md) |
| Executar procedimentos operacionais e diagnósticos | [Runbook de Ambiente Local e Banco de Dados](./operations/ambiente-local-e-banco-dados.md) · [Runbook de Importação Analítica via CLI](./operations/importacao-orcamento-analitico-cli.md) |
| Criar ou atualizar documentos seguindo o padrão | [Guias Documentais](../.agents/skills/docs-guide/guides/README.md) |

## 5. Manutenção

- Descreva o comportamento entregue e mantenha referências aos arquivos, símbolos, contratos e testes que o sustentam.
- Atualize os documentos afetados junto da implementação, no mesmo escopo/PR, depois de conferir o resultado.
- Inclua apenas a parte implementada de um fluxo; o restante fica na spec.
- Registre limitações comprovadas como comportamento atual. Mudanças desejadas pertencem a specs ou issues.
- Retire descrições de funcionalidades removidas e preserve seus IDs e histórico conforme os guias.
