# ADR-004 — Modelagem de Grafo de Dependências Construtivas (DAG) e Reordenação Fracionária

| Campo | Valor |
| --- | --- |
| **ID** | `ADR-004` |
| **Status** | `Aceito` |
| **Data** | `2026-04-19` |
| **Decisores** | Equipe de Engenharia Concordia |
| **Escopo** | Domínio de Obra (`GrafoDependencias`, `RegraLiberacao`, `DependenciaEtapaService`, `ObraService`, `ItemEap`) |
| **Substitui** | `N/A` |
| **Substituído por** | `N/A` |

## Contexto e Problema

Em uma obra civil, a ordem de apresentação das etapas na trilha (`ItemEap.posicao`) e as restrições físicas de precedência construtiva (`DependenciaEtapa`) são conceitos distintos que interagem diretamente:

1. Uma etapa pode ter múltiplas predecessoras com diferentes semânticas de engenharia (`FI` Fim-Início, `II` Início-Início, `FF` Fim-Fim), e a introdução de um ciclo (`A → B → C → A`) criaria um impasse lógico (*deadlock*) impedindo a liberação das etapas envolvidas.
2. Quando o engenheiro decide adiantar uma etapa (`UC-OBR-005`) para logo após uma etapa atrasada, renumerar sequencialmente todas as etapas subsequentes da obra exigiria atualizar dezenas ou centenas de linhas, além de ser necessário realinhar o agrupamento de macroetapa para que a etapa adiantada apareça na mesma seção visual da etapa atrasada.

## Motor de Decisão (Decision Drivers)

- Garantir matematicamente que o grafo de dependências seja sempre um Grafo Acíclico Direcionado (DAG), fornecendo ao usuário o caminho exato do ciclo quando uma aresta inválida for tentada.
- Permitir reordenação de etapas atualizando apenas o item adiantado.
- Manter consistência entre a ordem numérica da trilha (`ItemEap.posicao`) e o agrupamento visual por macroetapa (`ItemEap.macroetapa`).

## Opções Consideradas

1. **Opção 1 — Grafo em memória (`GrafoDependencias`) com detecção de ciclo via BFS antes da gravação + Posicionamento fracionário (`Double`) em `ItemEap.posicao` com realinhamento de `pai` e `macroetapa`**
2. **Opção 2 — Validação de ciclos via queries recursivas SQL (`WITH RECURSIVE`) no PostgreSQL e renumeração inteira de todas as etapas na reordenação**

## Decisão

Escolhemos a **Opção 1**:

1. **Validação de DAG em `GrafoDependencias`:** `GrafoDependencias` representa as arestas `predecessora -> sucessora` da obra em memória e executa busca em largura (`cicloAoAdicionar`) a partir de `sucessora` até `predecessora` antes de inserir qualquer nova `DependenciaEtapa`, reconstruindo o menor caminho do ciclo (`4.1 → 2.1 → 3.1 → 4.1`) em caso de violação ([RN-OBR-004](../../domain/obra/rules.md#rn-obr-004--integridade-aciclica-e-unicidade-do-grafo-de-dependencias)).
2. **Avaliação Dinâmica de Bloqueio (`RegraLiberacao`):** O status `bloqueada` e a satisfação de cada vínculo são calculados sob demanda em `ObraService.contexto(obra)` usando `RegraLiberacao.satisfeita()`, onde `FI` exige `percentualPredecessora >= 100`, `II` exige `> 0` e `FF` retorna `true` para liberação de início ([RN-OBR-002](../../domain/obra/rules.md#rn-obr-002--regras-de-liberacao-e-bloqueio-de-etapas-por-dependencia)).
3. **Posicionamento Fracionário e Realinhamento de EAP ([RN-OBR-005](../../domain/obra/rules.md#rn-obr-005--posicionamento-fracionario-na-reordenacao-da-trilha)):** Na importação inicial, os itens recebem posições espaçadas em múltiplos de `1000.0`. Ao mover `itemAdiantado` para logo após `itemAtrasado`, calcula-se `novaPosicao = (posAtrasado + proximaPosicao) / 2.0` e invoca-se `ItemEap.moverParaLogoApos(itemAtrasado, novaPosicao)` para atualizar `posicao`, `pai` e `macroetapa`.

## Consequências

### Positivas

- Diagnóstico imediato e legível de ciclos construtivos (`409 Conflict` com os códigos EAP do ciclo).
- Reordenação rápida que posiciona a etapa adiantada imediatamente após a etapa atrasada na trilha da UI.

### Negativas / Trade-offs

- O uso de `Double` para `posicao` pode sofrer perda de precisão após dezenas de bissecções repetidas exatamente no mesmo intervalo caso não haja reindexação periódica.

## Rastreabilidade

- **Casos de Uso afetados:** [UC-OBR-002](../../use-cases/obra/UC-OBR-002-visualizar-trilha-obra/README.md), [UC-OBR-003](../../use-cases/obra/UC-OBR-003-registrar-medicao-etapa/README.md), [UC-OBR-004](../../use-cases/obra/UC-OBR-004-analisar-atraso-sugerir-adiantamento/README.md), [UC-OBR-005](../../use-cases/obra/UC-OBR-005-reordenar-etapa-adiantada/README.md), [UC-OBR-006](../../use-cases/obra/UC-OBR-006-configurar-dependencias-construtivas/README.md)
- **Regras de Negócio:** [RN-OBR-002](../../domain/obra/rules.md#rn-obr-002--regras-de-liberacao-e-bloqueio-de-etapas-por-dependencia), [RN-OBR-004](../../domain/obra/rules.md#rn-obr-004--integridade-aciclica-e-unicidade-do-grafo-de-dependencias), [RN-OBR-005](../../domain/obra/rules.md#rn-obr-005--posicionamento-fracionario-na-reordenacao-da-trilha)
- **Módulos / Caminhos de código:**
  - `api/src/main/java/br/com/concordia/domain/obra/dependencia/GrafoDependencias.java`
  - `api/src/main/java/br/com/concordia/domain/obra/dependencia/RegraLiberacao.java`
  - `api/src/main/java/br/com/concordia/domain/obra/dependencia/DependenciaEtapaService.java`
  - `api/src/main/java/br/com/concordia/domain/obra/entities/ItemEap.java`
  - `api/src/main/resources/db/migration/V3__dependencias_etapa.sql`
