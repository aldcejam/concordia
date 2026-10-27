# ADR-002 — Reprogramação Assistida por IA com Fallback Determinístico Local

| Campo | Valor |
| --- | --- |
| **ID** | `ADR-002` |
| **Status** | `Aceito` |
| **Data** | `2026-04-19` |
| **Decisores** | Equipe de Engenharia Concordia |
| **Escopo** | Domínio de Obra (`SugestaoAdiantamentoService`) e Adaptador IA (`OpenAiReprogramacaoClient`) |
| **Substitui** | `N/A` |
| **Substituído por** | `N/A` |

## Contexto e Problema

Quando uma etapa da obra atrasa, o engenheiro precisa identificar rapidamente frentes de serviço alternativas que possam ser adiantadas para evitar ociosidade de equipe e mitigar o impacto no prazo. Um modelo de linguagem (LLM) gera justificativas contextualizadas considerando o motivo do atraso e a natureza das etapas, mas introduz três riscos operacionais:

1. **Alucinação de regras de engenharia:** O modelo pode sugerir etapas já iniciadas, bloqueadas por predecessoras ou que dependem da própria etapa atrasada.
2. **Indisponibilidade externa ou ausência de credenciais:** Ambientes de desenvolvimento local, testes automatizados ou falhas na OpenRouter/OpenAI não podem bloquear a análise de atraso.
3. **Respostas fora do formato contratado:** O modelo pode envolver o JSON em blocos Markdown (` ```json `) ou retornar UUIDs inexistentes.

## Motor de Decisão (Decision Drivers)

- Segurança estrutural absoluta: nenhuma sugestão apresentada ao usuário pode violar o grafo de dependências da obra ([RN-OBR-002](../../domain/obra/rules.md#rn-obr-002--regras-de-liberacao-e-bloqueio-de-etapas-por-dependencia) e [RN-OBR-003](../../domain/obra/rules.md#rn-obr-003--elegibilidade-e-priorizacao-de-etapas-para-adiantamento)).
- Alta disponibilidade funcional mesmo offline ou sem `OPENROUTER_API_KEY`.
- Respeito ao parecer negativo da IA quando o modelo está disponível e conclui que nenhuma etapa deve ser adiantada.

## Opções Consideradas

1. **Opção 1 — Pré-filtragem determinística no domínio + Inferência via LLM (JSON sanitizado) + Pós-validação de IDs + Fallback determinístico local por valor orçado quando IA indisponível**
2. **Opção 2 — Delegar todas as etapas da obra ao prompt do LLM e repassar a resposta diretamente ao frontend**
3. **Opção 3 — Utilizar apenas ordenação determinística sem integração com IA**

## Decisão

Escolhemos a **Opção 1**, implementada em `SugestaoAdiantamentoService` e `OpenAiReprogramacaoClient`:

1. **Pré-filtragem determinística:** Antes de acionar `IaReprogramacaoClient`, `SugestaoAdiantamentoService.filtrarEtapasDisponiveisParaAdiantamento()` calcula `GrafoDependencias.descendentes(idAtrasada)` e retém apenas etapas com `percentualAtual == 0`, que não dependem direta ou indiretamente da etapa atrasada e que satisfazem `RegraLiberacao.satisfeita(...)`.
2. **Inferência com sanitização de JSON:** `OpenAiReprogramacaoClient` envia as etapas candidatas pré-aprovadas para `/chat/completions`, remove cercas Markdown em `sanitizarJson()` e ignora itens cujo `etapaId` não seja um UUID válido.
3. **Pós-validação contra alucinações:** `SugestaoAdiantamentoService.correlacionarSugestoesComEtapas()` confronta cada `etapaId` retornado pela IA com o mapa de `etapasDisponiveis`, descartando qualquer ID fora do conjunto elegível.
4. **Fallback determinístico local condicional:** Somente quando `respostaIa == null || !respostaIa.disponivel()` (chave ausente, falha HTTP/rede ou JSON inválido), o serviço executa `sugerirLocalmente()`, ordenando as candidatas por maior `valorTotalOrcado` decrescente (e menor `posicao` em caso de empate) e selecionando até 3 etapas.

## Consequências

### Positivas

- Impossibilidade de o sistema sugerir uma etapa bloqueada, já iniciada ou dependente da etapa atrasada, independentemente do modelo de IA utilizado.
- O fluxo completo de análise de atraso (`UC-OBR-004`) funciona em qualquer ambiente mesmo sem chave de API configurada.

### Negativas / Trade-offs

- Manutenção conjunta do prompt do LLM e da regra de ordenação local.

## Rastreabilidade

- **Casos de Uso afetados:** [UC-OBR-004](../../use-cases/obra/UC-OBR-004-analisar-atraso-sugerir-adiantamento/README.md)
- **Regras de Negócio:** [RN-OBR-002](../../domain/obra/rules.md#rn-obr-002--regras-de-liberacao-e-bloqueio-de-etapas-por-dependencia), [RN-OBR-003](../../domain/obra/rules.md#rn-obr-003--elegibilidade-e-priorizacao-de-etapas-para-adiantamento)
- **Módulos / Caminhos de código:**
  - `api/src/main/java/br/com/concordia/domain/obra/SugestaoAdiantamentoService.java`
  - `api/src/main/java/br/com/concordia/domain/obra/ports/IaReprogramacaoClient.java`
  - `api/src/main/java/br/com/concordia/infrastructure/ia/client/OpenAiReprogramacaoClient.java`
  - `web/src/components/molecules/SugestaoAtrasoModal/SugestaoAtrasoModal.tsx`
