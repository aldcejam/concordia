# Contrato de Integração: API REST Concordia

| Campo | Valor |
| --- | --- |
| **Tipo** | `REST / OpenAPI 3.1.0` |
| **Direção** | `Inbound` (Consumida pelo Frontend `web/` e scripts CLI) |
| **Autenticação** | `Nenhuma` (rotas públicas em ambiente de desenvolvimento via `SecurityConfig`) |
| **Especificação Canônica** | `api/openapi.yaml` |
| **Swagger UI Local** | `http://localhost:8080/swagger` (habilitado no perfil `dev`) |

## Operações / Endpoints Expostos

### 1. Importação de Orçamento Excel (`/api/obras/importacoes`)

| Método | Rota | Caso de Uso | Status Sucesso | Descrição Resumida |
| --- | --- | --- | --- | --- |
| `POST` | `/api/obras/importacoes/pre-visualizacao` | [UC-OBR-001](../../use-cases/obra/UC-OBR-001-importar-planilha-orcamentaria/README.md) | `200 OK` | Lê planilha `.xlsx`/`.xls` (`multipart/form-data`, parte `arquivo`) e retorna resumo da EAP, totais, pesos, avisos e erros sem persistir. |
| `POST` | `/api/obras/importacoes` | [UC-OBR-001](../../use-cases/obra/UC-OBR-001-importar-planilha-orcamentaria/README.md) | `201 Created` | Valida e importa planilha `.xlsx`/`.xls` criando obra, macroetapas, subetapas e etapas executáveis. |

### 2. Obras, Etapas, Medição e Reprogramação (`/api/obras`)

| Método | Rota | Caso de Uso | Status Sucesso | Descrição Resumida |
| --- | --- | --- | --- | --- |
| `GET` | `/api/obras` | [UC-OBR-002](../../use-cases/obra/UC-OBR-002-visualizar-trilha-obra/README.md) · [UC-OBR-007](../../use-cases/obra/UC-OBR-007-gerenciar-obras-etapas/README.md) | `200 OK` | Lista todas as obras cadastradas (`List<ObraResponse>`). |
| `POST` | `/api/obras` | [UC-OBR-007](../../use-cases/obra/UC-OBR-007-gerenciar-obras-etapas/README.md) | `201 Created` | Cria uma nova obra em planejamento. |
| `GET` | `/api/obras/{id}` | [UC-OBR-007](../../use-cases/obra/UC-OBR-007-gerenciar-obras-etapas/README.md) | `200 OK` | Consulta uma obra pelo seu `UUID`. |
| `PUT` | `/api/obras/{id}` | [UC-OBR-007](../../use-cases/obra/UC-OBR-007-gerenciar-obras-etapas/README.md) | `200 OK` | Atualiza integralmente uma obra. |
| `PATCH` | `/api/obras/{id}` | [UC-OBR-007](../../use-cases/obra/UC-OBR-007-gerenciar-obras-etapas/README.md) | `200 OK` | Atualiza parcialmente uma obra. |
| `DELETE` | `/api/obras/{id}` | [UC-OBR-007](../../use-cases/obra/UC-OBR-007-gerenciar-obras-etapas/README.md) | `204 No Content` | Remove uma obra. |
| `GET` | `/api/obras/{id}/etapas` | [UC-OBR-002](../../use-cases/obra/UC-OBR-002-visualizar-trilha-obra/README.md) | `200 OK` | Lista as etapas da obra ordenadas por `posicao` com orçamento, peso percentual, estado de bloqueio e vínculos. |
| `POST` | `/api/obras/{id}/etapas` | [UC-OBR-007](../../use-cases/obra/UC-OBR-007-gerenciar-obras-etapas/README.md) | `201 Created` | Cria uma etapa individual e seu item na EAP. |
| `GET` | `/api/obras/{id}/etapas/{etapaId}` | [UC-OBR-002](../../use-cases/obra/UC-OBR-002-visualizar-trilha-obra/README.md) · [UC-OBR-007](../../use-cases/obra/UC-OBR-007-gerenciar-obras-etapas/README.md) | `200 OK` | Consulta detalhes, orçamento, medições e dependências de uma etapa. |
| `PATCH` | `/api/obras/{id}/etapas/{etapaId}/orcamento` | [UC-OBR-007](../../use-cases/obra/UC-OBR-007-gerenciar-obras-etapas/README.md) | `200 OK` | Atualiza os metadados orçamentários de uma etapa. |
| `POST` | `/api/obras/{id}/etapas/{etapaId}/medicoes` | [UC-OBR-003](../../use-cases/obra/UC-OBR-003-registrar-medicao-etapa/README.md) | `200 OK` | Registra nova medição física (e eventual atraso) no histórico da etapa. |
| `POST` | `/api/obras/{id}/analise-atraso` | [UC-OBR-004](../../use-cases/obra/UC-OBR-004-analisar-atraso-sugerir-adiantamento/README.md) | `200 OK` | Analisa o atraso de uma etapa e sugere até 3 etapas elegíveis para adiantamento (via IA ou fallback local). |
| `POST` | `/api/obras/{id}/reordenar-etapa` | [UC-OBR-005](../../use-cases/obra/UC-OBR-005-reordenar-etapa-adiantada/README.md) | `200 OK` | Reposiciona a etapa adiantada para logo após a etapa atrasada e retorna a lista de etapas reordenada. |
| `POST` | `/api/obras/{id}/importar` | [UC-OBR-008](../../use-cases/obra/UC-OBR-008-importar-eap-csv/README.md) | `200 OK` | Importa a estrutura da EAP a partir de arquivo CSV (`multipart/form-data`, parte `arquivo`). |

### 3. Dependências Construtivas (`/api/obras/{id}/dependencias`)

| Método | Rota | Caso de Uso | Status Sucesso | Descrição Resumida |
| --- | --- | --- | --- | --- |
| `GET` | `/api/obras/{id}/dependencias` | [UC-OBR-006](../../use-cases/obra/UC-OBR-006-configurar-dependencias-construtivas/README.md) | `200 OK` | Lista todas as dependências construtivas da obra. |
| `POST` | `/api/obras/{id}/dependencias` | [UC-OBR-006](../../use-cases/obra/UC-OBR-006-configurar-dependencias-construtivas/README.md) | `201 Created` | Cria um vínculo (`FI`, `II`, `FF`) validando ausência de autodependência, duplicidade e ciclos. |
| `PATCH` | `/api/obras/{id}/dependencias/{dependenciaId}` | [UC-OBR-006](../../use-cases/obra/UC-OBR-006-configurar-dependencias-construtivas/README.md) | `200 OK` | Atualiza parcialmente tipo, desfasamento em dias ou obrigatoriedade. |
| `DELETE` | `/api/obras/{id}/dependencias/{dependenciaId}` | [UC-OBR-006](../../use-cases/obra/UC-OBR-006-configurar-dependencias-construtivas/README.md) | `204 No Content` | Remove um vínculo de dependência da obra. |

### 4. Catálogo de Insumos e Composições (`/api/insumos` e `/api/composicoes`)

| Método | Rota | Caso de Uso | Status Sucesso | Descrição Resumida |
| --- | --- | --- | --- | --- |
| `POST / GET` | `/api/insumos` | [UC-CAT-001](../../use-cases/catalogo/UC-CAT-001-gerenciar-insumos/README.md) | `201 / 200` | Cria insumo ou lista insumos cadastrados. |
| `GET / PUT / PATCH / DELETE` | `/api/insumos/{id}` | [UC-CAT-001](../../use-cases/catalogo/UC-CAT-001-gerenciar-insumos/README.md) | `200 / 204` | Consulta, atualiza ou remove um insumo por ID. |
| `POST / GET` | `/api/composicoes` | [UC-CAT-002](../../use-cases/catalogo/UC-CAT-002-gerenciar-composicoes/README.md) | `201 / 200` | Cria composição ou lista composições cadastradas. |
| `GET / PUT / PATCH / DELETE` | `/api/composicoes/{id}` | [UC-CAT-002](../../use-cases/catalogo/UC-CAT-002-gerenciar-composicoes/README.md) | `200 / 204` | Consulta, atualiza ou remove uma composição por ID. |
| `POST / DELETE` | `/api/composicoes/{idComposicao}/itens` | [UC-CAT-002](../../use-cases/catalogo/UC-CAT-002-gerenciar-composicoes/README.md) | `200 / 204` | Vincula ou desvincula item filho (`idItem`) em uma composição. |

### 5. Empresas (`/api/empresas`)

| Método | Rota | Caso de Uso | Status Sucesso | Descrição Resumida |
| --- | --- | --- | --- | --- |
| `POST / GET` | `/api/empresas` | [UC-EMP-001](../../use-cases/empresa/UC-EMP-001-gerenciar-empresas/README.md) | `201 / 200` | Cadastra empresa com CNPJ válido ou lista empresas. |
| `GET / PUT / PATCH / DELETE` | `/api/empresas/{id}` | [UC-EMP-001](../../use-cases/empresa/UC-EMP-001-gerenciar-empresas/README.md) | `200 / 204` | Consulta, atualiza ou remove uma empresa por ID. |

---

## Tratamento de Erros (RFC 7807 `ProblemDetail`)

Todas as falhas tratadas por `GlobalExceptionHandler` retornam `ProblemDetail` (RFC 7807):

```json
{
  "type": "about:blank",
  "title": "Conflito",
  "status": 409,
  "detail": "Vínculo recusado: criaria um ciclo na EAP (4.1.1 → 3.1.1 → 4.1.1). Uma etapa não pode depender, direta ou indiretamente, de si mesma."
}
```

| Status HTTP | `title` Retornado | Exceção Origem no Backend | Comportamento do Cliente (`web/src/services/apiProblem.ts`) |
| --- | --- | --- | --- |
| `400 Bad Request` | `"Erro de Validação de Dados"` | `MethodArgumentNotValidException` | Extrai a lista `invalidFields` (`campo`, `mensagem`) e monta mensagem consolidada em `ApiProblemError`. |
| `400 Bad Request` | `"Requisição Inválida"` | `IllegalArgumentException`, `MissingServletRequestPartException`, `MissingServletRequestParameterException`, `MethodArgumentTypeMismatchException` | Exibe `detail` diretamente ao usuário. |
| `404 Not Found` | `"Recurso Não Encontrado"` | `EntityNotFoundException` | Exibe `detail` informando o recurso ausente. |
| `409 Conflict` | `"Conflito"` | `ConflitoException` | Exibe `detail` (ex.: caminho do ciclo em `RN-OBR-004`, etapa bloqueada em `RN-OBR-002` ou código duplicado). |
| `413 Content Too Large` | `"Arquivo Muito Grande"` | `MaxUploadSizeExceededException` | Informa que o arquivo excede o tamanho máximo de 20 MB. |
| `422 Unprocessable Content` | `"Planilha Inválida"` | `PlanilhaInvalidaException` | Extrai a lista estruturada `erros` (`linha`, `coluna`, `mensagem`) e renderiza `ImportErrorReport`. |

---

## Rastreabilidade no Código

- **Especificação OpenAPI:** `api/openapi.yaml`
- **Handler Global de Exceções:** `api/src/main/java/br/com/concordia/infrastructure/common/interceptors/GlobalExceptionHandler.java`
- **Cliente HTTP Frontend:** `web/src/api/generated/` e `web/src/services/apiProblem.ts`
