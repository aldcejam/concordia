# Catálogo de Casos de Uso

Este catálogo lista somente casos de uso implementados e documentados no sistema Concordia. Para criar ou atualizar um caso, consulte o [guia de casos de uso](../../.agents/skills/docs-guide/guides/use-case.md). As siglas das áreas funcionais estão cadastradas no [mapa documental](../README.md).

## Como ler os códigos e caminhos

Em `docs/use-cases/<area>/UC-<AREA>-<NNN>-<slug>/README.md`, `<area>` é o nome da pasta da área em minúsculas, `<AREA>` é sua sigla estável em maiúsculas, `<NNN>` é o número sequencial de três dígitos (`001`, `002`...) e `<slug>` é um resumo curto em `kebab-case`, sem acentos.

`UC` vem de *Use Case* (caso de uso), `RN` significa Regra de Negócio e `ADR` vem de *Architecture Decision Record* (registro de decisão arquitetural). Nos códigos de cenário, `C` significa cenário e os dois dígitos seguintes indicam sua sequência: `UC-OBR-001-C01` é o fluxo principal do caso `UC-OBR-001`. Para detalhes sobre todos os formatos de identificador, consulte as [convenções globais no AGENTS.md](../../AGENTS.md).

---

## Casos de Uso por Área Funcional

### Gestão de Obras, EAP e Cronograma (`OBR`)

| Código | Título | Iniciador Principal | Resultado Observável |
| --- | --- | --- | --- |
| [UC-OBR-001](./obra/UC-OBR-001-importar-planilha-orcamentaria/README.md) | Importar Planilha Orçamentária Excel | Engenheiro / Gestor de Obras | Valida a planilha (`.xlsx`/`.xls`), exibe o resumo prévio da EAP com custos e pesos e cria a obra com macroetapas, subetapas e etapas de serviço |
| [UC-OBR-002](./obra/UC-OBR-002-visualizar-trilha-obra/README.md) | Visualizar Trilha Gamificada e Etapas da Obra | Engenheiro / Gestor de Obras ou Mestre de Obras | Lista e apresenta as etapas da obra agrupadas por macroetapa e subetapa, exibindo progresso físico, orçamento, peso percentual e estado de bloqueio |
| [UC-OBR-003](./obra/UC-OBR-003-registrar-medicao-etapa/README.md) | Registrar Medição e Apontar Atraso em Etapa | Engenheiro / Gestor de Obras ou Mestre de Obras | Persiste nova medição com percentual e quantidade executados (e eventual atraso/impedimento), preservando o histórico e liberando sucessoras elegíveis |
| [UC-OBR-004](./obra/UC-OBR-004-analisar-atraso-sugerir-adiantamento/README.md) | Analisar Atraso e Gerar Sugestões de Adiantamento | Engenheiro / Gestor de Obras | Filtra etapas candidatas livres de bloqueio e de dependência da etapa atrasada e retorna parecer técnico e sugestões de adiantamento via IA ou análise determinística local |
| [UC-OBR-005](./obra/UC-OBR-005-reordenar-etapa-adiantada/README.md) | Reordenar Etapa Adiantada na Trilha da Obra | Engenheiro / Gestor de Obras | Reposiciona a etapa escolhida para logo após a etapa atrasada na sequência da EAP e atualiza sua macroetapa de agrupamento na trilha |
| [UC-OBR-006](./obra/UC-OBR-006-configurar-dependencias-construtivas/README.md) | Configurar Dependências Construtivas entre Etapas | Engenheiro / Gestor de Obras | Cria, atualiza, lista e remove vínculos de precedência (`FI`, `II`, `FF`) entre etapas da obra, recusando ciclos e duplicidades e recalculando bloqueios |
| [UC-OBR-007](./obra/UC-OBR-007-gerenciar-obras-etapas/README.md) | Gerenciar Cadastro de Obras e Etapas da EAP | Engenheiro / Gestor de Obras ou Script CLI | Cria, consulta, lista, atualiza e remove obras, além de criar etapas individualmente e atualizar seus dados orçamentários |
| [UC-OBR-008](./obra/UC-OBR-008-importar-eap-csv/README.md) | Importar Estrutura da EAP via Arquivo CSV | Engenheiro / Gestor de Obras | Lê arquivo CSV separado por ponto e vírgula e popula a árvore de itens da EAP em uma obra existente ainda sem EAP |

### Catálogo Orçamentário (`CAT`)

| Código | Título | Iniciador Principal | Resultado Observável |
| --- | --- | --- | --- |
| [UC-CAT-001](./catalogo/UC-CAT-001-gerenciar-insumos/README.md) | Gerenciar Catálogo de Insumos | Engenheiro / Orçamentista | Cria, consulta, lista, atualiza (integral ou parcialmente) e remove insumos básicos com validação de código único |
| [UC-CAT-002](./catalogo/UC-CAT-002-gerenciar-composicoes/README.md) | Gerenciar Composições de Custos e Seus Itens | Engenheiro / Orçamentista | Cria, consulta, lista, atualiza e remove composições unitárias, além de vincular ou desvincular insumos e subcomposições |

### Cadastro de Empresas (`EMP`)

| Código | Título | Iniciador Principal | Resultado Observável |
| --- | --- | --- | --- |
| [UC-EMP-001](./empresa/UC-EMP-001-gerenciar-empresas/README.md) | Gerenciar Cadastro de Empresas Contratadas | Engenheiro / Gestor de Obras | Cria, consulta, lista, atualiza (integral ou parcialmente) e remove empresas contratadas com validação de CNPJ |

## IDs Retirados

Nenhum ID de caso de uso foi retirado até o momento.
