# Documentação do Projeto Concordia

> **Concordia** é uma plataforma inteligente e gamificada para acompanhamento físico-financeiro e reprogramação dinâmica de obras da construção civil.

---

## 📌 Sumário da Documentação

A documentação do sistema está organizada nos seguintes módulos na pasta `docs/`:

1. [**Visão Geral e Requisitos**](file:///home/apm/Documentos/projetos/Concordia/docs/visao_geral_e_requisitos.md)
   - Problema, proposta de valor e contexto da construção civil (SINAPI, EAP, BDI, pesos).
   - Requisitos Funcionais (RFs) e Não-Funcionais (RNFs).
   - Regras de Negócio (RNs) e algoritmos de dependência/reprogramação.

2. [**Fluxo de Usuários (User Flow)**](file:///home/apm/Documentos/projetos/Concordia/docs/fluxo_de_usuarios.md)
   - Diagrama completo da jornada dos usuários (Engenheiro, Mestre de Obras/Campo).
   - Telas, tomadas de decisão, apontamentos de progresso e mitigação de atrasos.

3. [**Casos de Uso e Diagramas**](file:///home/apm/Documentos/projetos/Concordia/docs/casos_de_uso.md)
   - Diagramas UML de Casos de Uso (Mermaid).
   - Especificação detalhada de atores, pré-condições, fluxos principais, alternativos e de exceção.

3. [**Diagramas de Atividades**](file:///home/apm/Documentos/projetos/Concordia/docs/diagramas_atividades.md)
   - Fluxo de ingestão, parsing hierárquico e validação de planilhas orçamentárias (Excel/SINAPI).
   - Fluxo de apontamento de progresso, detecção de desvios e cálculo de impactos.
   - Fluxo do **Motor de Recomendação de Adiantamento de Etapas** (mitigação de atrasos).

4. [**Diagramas Estruturais e de Arquitetura**](file:///home/apm/Documentos/projetos/Concordia/docs/diagramas_estruturais.md)
   - Modelo Entidade-Relacionamento (DER / PostgreSQL).
   - Diagrama de Classes de Domínio (Backend Java/Spring Boot).
   - Arquitetura de Componentes e Integrações (Frontend React + Backend + Banco).

5. [**Especificação de Extração de Planilha Excel**](file:///home/apm/Documentos/projetos/Concordia/docs/especificacao_extracao_excel.md)
   - Estrutura de dados sintética de orçamentos (SINAPI / SICRO / Próprio).
   - Algoritmo de parsing para reconhecimento hierárquico de EAP (ex: `1`, `8`, `8.1`, `8.1.1`).
   - Mapeamento de colunas, validações de integridade e tratamento de erros.

6. [**Conceito e UX Gamificada (Estilo Duolingo)**](file:///home/apm/Documentos/projetos/Concordia/docs/ux_duolingo_style.md)
   - Estrutura da trilha sinuosa de etapas (Nós, Fases, Portões de Qualidade).
   - Estados dos nós (Bloqueado, Disponível, Em Andamento, Concluído, Atrasado, Sugerido para Adiantamento).
   - Gamificação e microinterações de engenharia civil.

---

## 🏗️ Stack Tecnológica do Projeto

- **Backend**: Java 21, Spring Boot 3.x, Spring Data JPA, Spring Security, Apache POI (extração de Excel).
- **Frontend**: React, TypeScript, Vite, Material-UI, Framer Motion (animações da trilha), TanStack Query.
- **Banco de Dados**: PostgreSQL 16+.
