# Especificação Estrutural e Arquitetura

Este documento detalha a modelagem de dados, as classes de domínio do backend e a arquitetura de componentes do sistema Concordia.

---

## 1. Modelo de Dados / Entidade-Relacionamento (DER / PostgreSQL)

*(Espaço reservado para o Diagrama Entidade-Relacionamento)*

### Entidades Principais e Atributos:

- **OBRA**: `id (UUID)`, `nome`, `descricao`, `contratante`, `localizacao`, `valor_total_sem_bdi`, `bdi_percentual`, `valor_total_com_bdi`, `data_inicio_planejada`, `data_fim_planejada`, `data_fim_reprogramada`, `status`, `criado_em`.
- **OBRA_ITEM**: `id (UUID)`, `obra_id (FK)`, `parent_id (FK recursiva)`, `codigo_item` (ex: `8.1.1`), `codigo_banco` (SINAPI), `descricao`, `unidade`, `quantidade`, `valor_unitario`, `valor_unitario_com_bdi`, `valor_total`, `peso_percentual`, `percentual_executado`, `nivel_hierarquia`, `is_folha`, `status_execucao`, `ordem_trilha`.
- **ITEM_DEPENDENCIA**: `id (UUID)`, `item_origem_id (FK)`, `item_destino_id (FK)`, `tipo_dependencia` (`FI`, `II`, `FF`), `dias_desfasamento`, `is_obrigatoria`.
- **MEDICAO_HISTORICO**: `id (UUID)`, `obra_item_id (FK)`, `percentual_anterior`, `percentual_novo`, `valor_medido_periodo`, `data_medicao`, `responsavel_apontamento`, `houve_atraso`, `dias_atraso_registrados`, `motivo_atraso`.
- **RECOMENDACAO_LOG**: `id (UUID)`, `obra_id (FK)`, `item_origem_atraso_id (FK)`, `dias_atraso_detectados`, `status_decisao`, `gerada_em`, `decidida_em`, `justificativa_gestor`.
- **RECOMENDACAO_ITEM**: `id (UUID)`, `recomendacao_log_id (FK)`, `obra_item_sugerido_id (FK)`, `ganho_dias_estimado`, `pontuacao_prioridade`, `data_inicio_original`, `data_inicio_proposta`, `aceita_pelo_gestor`.

---

## 2. Diagrama de Classes de Domínio (Backend Spring Boot)

*(Espaço reservado para o Diagrama de Classes de Domínio)*

### Classes e Responsabilidades:
- **`Obra`**: Entidade agregadora raiz, controla escopo, orçamento consolidado e progresso global.
- **`ObraItem`**: Entidade hierárquica (composite pattern) que representa macroetapas e itens de serviço SINAPI.
- **`ItemDependencia`**: Mapeia relacionamentos direcionados e restrições de precedência entre tarefas da EAP.
- **`MedicaoHistorico`**: Registro imutável de medições periódicas e relatórios de desvios.
- **`DependencyGraphEngine`**: Serviço responsável por detectar ciclos na EAP, calcular folgas livres/totais e identificar o caminho crítico (CPM).
- **`MitigationRecommendationEngine`**: Algoritmo heurístico que avalia o grafo de dependências e ranqueia etapas elegíveis para antecipação.
- **`ExcelOrçamentoParserService`**: Serviço de extração e parsing de planilhas orçamentárias (Apache POI).

---

## 3. Arquitetura de Componentes do Sistema

*(Espaço reservado para o Diagrama de Componentes / C4)*

### Camadas da Solução:
1. **Frontend (SPA - React 18 + TypeScript + Vite)**:
   - Módulo da Trilha Gamificada (Canvas/SVG interativo).
   - Painel Físico-Financeiro (Curva S e gráficos de medição).
   - Módulo de Ingestão de Planilhas.
   - Modal e Drawer de Gestão de Ações Corretivas.
2. **Backend (API REST - Java 21 + Spring Boot 3)**:
   - Controllers REST com documentação Swagger/OpenAPI.
   - Camada de Serviços de Domínio e Motores de Cálculo.
   - Camada de Acesso a Dados com Spring Data JPA.
3. **Persistência (PostgreSQL 16)**:
   - Consultas hierárquicas e integridade referencial com índices relacionais.
