# Guia de CRUD — Procedimentos Operacionais (Runbooks) e Contratos

Leia este arquivo sempre que precisar **Criar, Ler ou Atualizar** procedimentos operacionais em `docs/operations/` ou referências de contratos em `docs/technical/api/`.

## 1. Regras para Contratos (`docs/technical/api/`)

1. **Fonte Única de Verdade:** Se o projeto possui schemas executáveis ou gerados automaticamente (OpenAPI/Swagger, AsyncAPI, Protobuf, JSON Schema, GraphQL), **o próprio arquivo de schema é o contrato principal**.
2. **Papel do Markdown em `docs/technical/api/`:** Use arquivos Markdown apenas para documentar semântica de integração, políticas de versionamento, códigos de erro de negócio, exemplos de *payloads* complexos e mapeamento de **quais consumidores e casos de uso são afetados** por cada contrato. Nunca duplique listas extensas de campos que já estão no schema.
3. **Escopo Existente:** Documente apenas interfaces, schemas e políticas implementados. Contratos futuros ficam em specs.

## 2. Regras para Procedimentos Operacionais (`docs/operations/`)

1. **Foco em Execução (Diátaxis How-To):** Um *runbook* serve para um operador ou agente executar uma ação ou diagnosticar um incidente rapidamente. Separe comandos acionáveis de explicações arquiteturais longas.
2. **Verificação e Rollback Obrigatórios:** Todo procedimento que altera estado de ambiente, banco ou configuração deve conter um passo explícito de **Validação do Resultado** e um plano de **Rollback / Recuperação**.
3. **Procedimento Executável:** Publique comandos conferidos e aplicáveis aos ambientes descritos. Procedimentos ainda em desenho ficam em specs; o documento não recebe campos de última verificação ou aprovação.

---

## 3. Estrutura Padrão de Runbook (`docs/operations/<slug>.md`)

````markdown
# Procedimento Operacional — <Título da Operação ou Diagnóstico>

- **Objetivo:** <O que este procedimento executa ou diagnostica>.
- **Ambientes Aplicáveis:** `Local` | `Staging` | `Production`
- **Pré-requisitos e Permissões:** <Acessos, variáveis de ambiente ou ferramentas exigidas>.

## 1. Diagnóstico Inicial (Pré-checagem)
1. Verifique o estado atual executando:
   ```bash
   <comando de verificação>
   ```
2. Confirme se o indicador <X> apresenta <estado esperado antes da intervenção>.

## 2. Passos de Execução
1. <Descrição curta da ação>:
   ```bash
   <comando exato>
   ```
2. <Descrição curta da ação>:
   ```bash
   <comando exato>
   ```

## 3. Validação Pós-Execução
- Execute `<comando ou consulta>` e confirme que <evidência objetiva de sucesso>.

## 4. Rollback / Recuperação em Caso de Falha
- Se ocorrer <sintoma de erro>, interrompa o procedimento e reverta com:
  ```bash
  <comando ou procedimento de reversão>
  ```
````

---

## 4. Estrutura Padrão de Referência de Contrato (`docs/technical/api/<slug>.md`)

```markdown
# Contrato de Integração — <Nome da API, Webhook ou Tópico de Eventos>

- **Tipo:** `REST HTTP` | `Mensageria (AMQP/SQS/Kafka)` | `Webhook`
- **Schema Oficial (Source of Truth):** [`<caminho/para/openapi-ou-schema>`](<link>)
- **Produtor:** <Serviço ou ator emissor>
- **Consumidores Conhecidos:** <Serviços ou clientes que dependem deste contrato>
- **Casos de Uso Relacionados:** [UC-<AREA>-<NNN>](<link>)
- **Versão e Compatibilidade:** <Versão do schema, política de evolução e mudanças incompatíveis>.
- **Responsável pelo Contrato:** <Pessoa ou equipe>.

## 1. Semântica e Políticas da Interação
- **Autenticação / Assinatura:** <Como a chamada ou mensagem é autenticada>.
- **Idempotência e Ordenação:** <Chave de idempotência exigida e garantias de ordem>.
- **Timeouts, Retries e DLQ:** <Política de retentativa e tratamento de mensagens mortas>.

## 2. Códigos de Resposta / Eventos e Regras Associadas

| Código HTTP / Evento | Condição de Negócio ou Técnica | Regra Associada | Ação do Consumidor |
| --- | --- | --- | --- |
| `<200 / EventoX>` | Processamento concluído | [RN-<ID>](<link>) | Prosseguir fluxo normal |
| `<422 / ErroY>` | Violação de regra de domínio | [RN-<ID>](<link>) | Não tentar novamente sem corrigir payload |
```
