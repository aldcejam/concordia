---
name: docs-guide
description: >-
  Criar, ler, atualizar, revisar ou remover documentação do sistema em docs/,
  incluindo mapa documental, catálogo e casos de uso (UC), cenários, regras de
  negócio (RN), vocabulário de domínio (ubiquitous language), implementação
  técnica e guardrails, diagramas Mermaid, ADRs, arquitetura (arc42/C4),
  contratos de integração e procedimentos operacionais (runbooks). Use sempre
  que precisar documentar fluxos implementados, manter rastreabilidade entre
  produto, domínio, código e testes ou estruturar a pasta docs/.
---

# Docs Guide — Padrão e Guias de Documentação do Sistema

Use esta skill sempre que criar, atualizar, revisar ou remover documentos em `docs/` ou quando uma mudança de código exigir atualização de casos de uso, regras de negócio, arquitetura, ADRs, contratos ou runbooks.

## Roteamento por Artefato (Leitura Progressiva)

Antes de criar ou editar um documento, leia o guia específico correspondente dentro desta skill:

| Artefato ou Tarefa | Guia / Modelo de Referência |
| --- | --- |
| Mapa documental do projeto (`docs/README.md`) | [README.md](./README.md) |
| Índice geral dos guias documentais | [guides/README.md](./guides/README.md) |
| Catálogo de casos de uso (`docs/use-cases/README.md`) | [use-cases/README.md](./use-cases/README.md) |
| Casos de uso (`UC-<AREA>-<NNN>`) e cenários (`C<NN>`) | [guides/use-case.md](./guides/use-case.md) |
| Regras de negócio (`RN-<ID>`) e vocabulário (`ubiquitous-language.md`) | [guides/business-rule.md](./guides/business-rule.md) |
| Percurso técnico, guardrails locais, diagramas e testes (`implementation.md`) | [guides/implementation.md](./guides/implementation.md) |
| Decisões arquiteturais (`ADR-<NNN>`) e substituição | [guides/adr.md](./guides/adr.md) |
| Arquitetura geral (arc42 / C4) e atributos de qualidade | [guides/architecture.md](./guides/architecture.md) |
| Procedimentos operacionais (runbooks) e contratos de API/eventos | [guides/operations.md](./guides/operations.md) |

## Princípios Essenciais

1. **Somente Escopo Implementado:** Documente em `docs/` apenas comportamentos, componentes, regras, contratos e testes efetivamente existentes no código. Propostas, metas futuras e partes não entregues pertencem a specs ou documentos de planejamento.
2. **Identificadores Estáveis e Imutáveis:**
   - **Caso de Uso:** `UC-<AREA>-<NNN>` (pasta `UC-<AREA>-<NNN>-<slug>/README.md`).
   - **Cenário:** `UC-<AREA>-<NNN>-C<NN>` (`C01` é sempre o Fluxo Principal).
   - **Regra Exclusiva de Caso de Uso:** `RN-<AREA>-<UC_NNN>-<NN>` (em `business-rules.md` do caso).
   - **Regra Compartilhada de Domínio:** `RN-<AREA>-<NNN>` (em `docs/domain/<domain>/rules.md`). Ao promover uma regra local para compartilhada, **preserve o ID original** e deixe no arquivo de origem um ponteiro `**Definição movida:**` para o novo local.
   - **ADR:** `ADR-<NNN>` (sequencial).
   - **Remoção (`IDs Retirados`):** Nunca reutilize um ID removido. Retire o item da listagem ativa e registre seu ID, motivo e substituto na seção `IDs Retirados` do catálogo ou arquivo de origem.
3. **Separação de Camadas Documentais:**
   - **`README.md` do Caso de Uso:** Linguagem de produto e domínio (objetivo, limites, ator, gatilho, precondições, garantias de estado, fluxo principal `C01`, cenários alternativos/falha e limitações conhecidas). Não inclua nomes de classes, tabelas, queries SQL ou detalhes de framework no fluxo principal.
   - **`business-rules.md` / `rules.md`:** Cabeçalho determinístico `## RN-<ID> — <Título>`, classificação (`Política de Produto`, `Invariante de Domínio` ou `Limitação Técnica`), consumidores, referências, enunciado, exceções/limites e exemplos concretos.
   - **`implementation.md`:** Criado apenas quando houver orquestração relevante entre camadas, transações, eventos/filas, integrações externas ou guardrails locais. Referencie sempre `caminho/do/arquivo` + `Classe.metodo()` (nunca números de linha) e nunca transcreva blocos de código da aplicação.

## Fluxo de Trabalho

1. **Identifique o escopo:** Determine quais artefatos (`UC`, `RN`, `implementation.md`, `ADR`, arquitetura, contrato ou runbook) são criados ou impactados.
2. **Leia o guia específico:** Abra o arquivo correspondente em [`./guides/`](./guides/README.md) para seguir a estrutura obrigatória e o checklist de borda.
3. **Confira o código e os testes reais:** Verifique símbolos, transações, contratos/schemas e testes automatizados existentes antes de redigir. Se faltar teste para um cenário implementado, registre explicitamente a lacuna sem inventar testes futuros.
4. **Analise impacto em atualizações/remoções:** Ao alterar ou remover um `UC` ou `RN`, busque o ID completo no repositório (`rg -n -F '<ID>' docs/`) e atualize todos os consumidores e catálogos na mesma alteração.
5. **Valide antes de concluir:**
   - Todos os links relativos apontam para arquivos e âncoras existentes.
   - Diagramas Mermaid (`sequenceDiagram`, `stateDiagram-v2`, `classDiagram`) possuem sintaxe válida e não representam ações assíncronas como síncronas.
   - Nenhuma chave, segredo ou dado sensível foi incluído.
   - `git diff --check` executa sem erros de formatação ou whitespace.
