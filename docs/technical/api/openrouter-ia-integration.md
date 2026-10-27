# Contrato de Integração: OpenRouter / OpenAI API (Reprogramação Assistida por IA)

| Campo | Valor |
| --- | --- |
| **Tipo** | `REST / JSON over HTTPS` |
| **Direção** | `Outbound` (Backend Concordia → Provedor externo de IA) |
| **Autenticação** | `Bearer Token` (`Authorization: Bearer <API_KEY>` configurado em `IaConfig`) |
| **Timeout / Retry** | Timeout configurável via `concordia.ia.timeout-seconds` (padrão `30s`), sem retry automático (aciona fallback determinístico local em falha) |

## Operação Consumida

### `POST {baseUrl}/chat/completions`

- **URL base padrão:** `https://openrouter.ai/api/v1` (configurável via `OPENROUTER_BASE_URL`, `CONCORDIA_IA_BASE_URL` ou `OPENAI_BASE_URL` em `api/src/main/resources/application.yaml`).
- **Modelo padrão:** `openai/gpt-4o-mini` (configurável via `OPENROUTER_MODEL`, `CONCORDIA_IA_MODEL` ou `OPENAI_MODEL`).
- **Temperatura padrão:** `0.2` (configurável via `CONCORDIA_IA_TEMPERATURE` ou `OPENAI_TEMPERATURE`).

#### Payload de Requisição (`OpenAiChatRequest`)

```json
{
  "model": "openai/gpt-4o-mini",
  "messages": [
    {
      "role": "system",
      "content": "Você é um engenheiro civil sênior especialista em planejamento e gestão de obras pelo método do caminho crítico (CPM) e EAP/SINAPI..."
    },
    {
      "role": "user",
      "content": "ETAPA ATRASADA: Fundação (Código: 1.0)\nMOTIVO DO ATRASO: Atraso no fornecimento de concreto\nDIAS DE ATRASO: 5 dias\n\nETAPAS DISPONÍVEIS NO CRONOGRAMA:\n- ID: 3fa85f64-5717-4562-b3fc-2c963f66afa6 | Código: 2.0 | Nome: Armação e Formas\n"
    }
  ],
  "temperature": 0.2
}
```

#### Esquema Esperado em `choices[0].message.content` (`SugestaoIaPayload`)

```json
{
  "mensagem": "Etapas identificadas.",
  "sugestoes": [
    {
      "etapaId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "justificativa": "Pré-montagem das formas em paralelo na bancada de corte."
    }
  ]
}
```

## Tratamento de Erros e Resiliência

| Condição / Falha Externa | Comportamento de `OpenAiReprogramacaoClient` / `SugestaoAdiantamentoService` |
| --- | --- |
| `concordia.ia.api-key` ausente ou em branco (`!properties.isConfigured()`) | Não realiza chamada HTTP; retorna `RespostaIa.indisponivel(...)` (`disponivel=false`) acionando o fallback determinístico local ([RN-OBR-003](../../domain/obra/rules.md#rn-obr-003--elegibilidade-e-priorizacao-de-etapas-para-adiantamento)). |
| Lista de etapas candidatas vazia | Retorna imediatamente `RespostaIa` sem chamar a API externa. |
| Exceção de rede, timeout ou erro HTTP no `RestClient` | Registra `log.warn` e retorna `RespostaIa.indisponivel("Não foi possível consultar a IA no momento.")`, acionando o fallback local. |
| Modelo retorna JSON cercado por ` ```json ... ``` ` | `OpenAiReprogramacaoClient.sanitizarJson()` remove as cercas Markdown antes de desserializar com `JsonMapper`. |
| Modelo retorna JSON malformado ou `choices` vazio | Captura exceção de parse e retorna `RespostaIa.indisponivel(...)`, acionando o fallback local. |
| Modelo sugere `etapaId` que não é UUID ou não pertence ao conjunto elegível | `converterItemParaSugestao()` ignora UUIDs malformados e `SugestaoAdiantamentoService.correlacionarSugestoesComEtapas()` descarta IDs fora do mapa de etapas disponíveis. |

## Rastreabilidade no Código

- **Porta de Domínio:** `api/src/main/java/br/com/concordia/domain/obra/ports/IaReprogramacaoClient.java`
- **Adaptador de Infraestrutura:** `api/src/main/java/br/com/concordia/infrastructure/ia/client/OpenAiReprogramacaoClient.java`
- **Configuração e Propriedades:** `api/src/main/java/br/com/concordia/infrastructure/ia/config/IaConfig.java`, `api/src/main/java/br/com/concordia/infrastructure/ia/config/ConcordiaIaProperties.java` e `api/src/main/resources/application.yaml`
- **Serviço Consumidor:** `api/src/main/java/br/com/concordia/domain/obra/SugestaoAdiantamentoService.java`
- **Testes Automatizados:** `api/src/test/java/br/com/concordia/infrastructure/ia/client/OpenAiReprogramacaoClientTest.java` e `api/src/test/java/br/com/concordia/domain/obra/SugestaoAdiantamentoServiceTest.java`
