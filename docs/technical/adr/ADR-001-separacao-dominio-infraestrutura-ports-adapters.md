# ADR-001 — Separação entre Domínio e Infraestrutura com Ports & Adapters

| Campo | Valor |
| --- | --- |
| **ID** | `ADR-001` |
| **Status** | `Aceito` |
| **Data** | `2026-04-19` |
| **Decisores** | Equipe de Engenharia Concordia |
| **Escopo** | Backend (`api/src/main/java/br/com/concordia/`) |
| **Substitui** | `N/A` |
| **Substituído por** | `N/A` |

## Contexto e Problema

O domínio de orçamentação de obras civis e planejamento físico-financeiro envolve regras de negócio densas: agregação recursiva de custos e pesos na EAP (`ImportacaoPlanilhaService`), validação de precedência em grafos acíclicos (`GrafoDependencias`), regras de liberação de etapas (`RegraLiberacao`) e filtragem de candidatas para reprogramação (`SugestaoAdiantamentoService`). Ao mesmo tempo, o sistema lida com detalhes tecnológicos na borda: leitura de arquivos Excel via Apache POI (`OrcamentoPlanilhaParser`), leitura CSV (`ObraCsvParser`), controllers REST e chamadas externas para provedores de IA (`OpenAiReprogramacaoClient`).

Precisávamos definir uma organização de pacotes que mantivesse os serviços e algoritmos de domínio testáveis isoladamente em memória (com fakes ou mocks de portas de saída, sem exigir contexto Spring Web ou banco PostgreSQL ativo nos testes unitários).

## Motor de Decisão (Decision Drivers)

- Testabilidade unitária rápida de algoritmos de domínio (`GrafoDependenciasTest`, `DependenciaEtapaServiceTest`, `ImportacaoPlanilhaServiceTest`, `ImportacaoObraServiceTest`, `SugestaoAdiantamentoServiceTest`, `ObraServiceReordenacaoTest`).
- Isolamento de integrações externas (LLMs, parsers Apache POI/CSV, controllers HTTP e repositórios Spring Data JPA) fora do núcleo de negócio.
- Clareza estrutural alinhada às diretrizes arquiteturais em `AGENTS.md`.

## Opções Consideradas

1. **Opção 1 — Separação entre `br.com.concordia.domain` (entidades, serviços, contratos de repositório e portas de saída) e `br.com.concordia.infrastructure` (controllers, DTOs HTTP, parsers POI/CSV, implementações Spring Data JPA e cliente HTTP de IA)**
2. **Opção 2 — Arquitetura em camadas acoplando serviços diretamente a `JpaRepository`, `MultipartFile`, `Workbook` (Apache POI) e `RestClient`**

## Decisão

Escolhemos a **Opção 1**:

- `br.com.concordia.domain.<modulo>`:
  - `entities` / `valueobjects` / `enums`: Entidades ricas (`Obra`, `ItemEap`, `EtapaObra`, `MedicaoEtapa`, `DependenciaEtapa`, `ItemOrcamento`, `Composicao`, `ItemComposicao`, `Insumo`, `Empresa`).
  - Interfaces de repositório de domínio (`ObraRepository`, `DependenciaEtapaRepository`, `EmpresaRepository`, `ComposicaoRepository`, `InsumoRepository`) desacopladas de `JpaRepository`.
  - `ports`: Interfaces de saída para serviços externos (`IaReprogramacaoClient`).
  - Serviços e algoritmos puros de domínio (`ObraService`, `DependenciaEtapaService`, `GrafoDependencias`, `RegraLiberacao`, `ImportacaoPlanilhaService`, `ImportacaoObraService`, `SugestaoAdiantamentoService`).
- `br.com.concordia.infrastructure.<modulo>`:
  - Controllers REST (`ObraController`, `ImportacaoOrcamentoController`, `DependenciaEtapaController`, `InsumoController`, `ComposicaoController`, `EmpresaController`) e DTOs de entrada/saída.
  - `repositories`: Adaptadores `*RepositoryImpl` delegando às interfaces `SpringData*Repository`.
  - `planilha` / `csv`: Adaptadores de leitura de arquivos (`OrcamentoPlanilhaParser`, `ObraCsvParser`).
  - `ia`: Adaptador de saída HTTP (`OpenAiReprogramacaoClient`) e propriedades (`ConcordiaIaProperties`).
  - `common`: `GlobalExceptionHandler`, `SecurityConfig` e `SwaggerConfig`.

## Consequências

### Positivas

- Os testes de domínio (`ImportacaoPlanilhaServiceTest`, `DependenciaEtapaServiceTest`, `ImportacaoObraServiceTest`, `GrafoDependenciasTest`) utilizam repositórios fake em memória, executando em poucos milissegundos sem subir container de banco de dados.
- O código de domínio não importa classes de Apache POI (`org.apache.poi.*`) nem clientes HTTP (`RestClient`).

### Negativas / Trade-offs

- Cada repositório possui uma interface no domínio (`*Repository`) e duas classes/interfaces na infraestrutura (`*RepositoryImpl` + `SpringData*Repository`).

## Rastreabilidade

- **Casos de Uso afetados:** Todos (`UC-OBR-001` a `UC-OBR-008`, `UC-CAT-001`, `UC-CAT-002`, `UC-EMP-001`)
- **Módulos / Caminhos de código:**
  - `api/src/main/java/br/com/concordia/domain/`
  - `api/src/main/java/br/com/concordia/infrastructure/`
