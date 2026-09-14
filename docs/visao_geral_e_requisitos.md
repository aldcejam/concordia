# Visão Geral, Regras de Negócio e Requisitos

## 1. Visão Geral do Produto

O **Concordia** é uma solução para o gerenciamento ágil de obras da construção civil. Tradicionalmente, engenheiros e gestores de projetos lidam com planilhas orçamentárias complexas (SINAPI, SICRO, ORSE) e gráficos de Gantt estáticos que dificultam a tomada de decisão rápida e a visualização intuitiva do avanço físico-financeiro.

A proposta do Concordia é transformar o cronograma de obras em uma **trilha interativa e gamificada (estilo Duolingo)**, aliada a um **motor de recomendação inteligente** que, ao identificar atrasos em etapas críticas, calcula e sugere automaticamente quais etapas paralelas ou independentes podem ser adiantadas para manter o ritmo e a produtividade da obra.

---

## 2. Contexto da Construção Civil & Terminologia

- **EAP (Estrutura Analítica do Projeto / WBS)**: Decomposição hierárquica do escopo da obra (ex.: `1. SERVIÇOS PRELIMINARES`, `8. INSTALAÇÕES`, `8.1 MICRODRENAGEM`, `8.1.1 Tubo PVC 150mm`).
- **SINAPI / Bases de Preços**: Sistema Nacional de Pesquisa de Custos e Índices da Construção Civil, utilizado como referência padrão de composições unitárias de custos no Brasil.
- **BDI (Benefícios e Despesas Indiretas)**: Taxa percentual aplicada sobre o custo direto da obra para cobrir despesas indiretas, tributos, riscos e margem de lucro.
- **Peso Percentual (%)**: Participação de cada item no custo total da obra, servindo de base para a Curva S e para o cálculo do avanço físico-financeiro ponderado.
- **Caminho Crítico (CPM - Critical Path Method)**: Sequência de etapas dependentes que determinam a duração total mínima da obra. Qualquer atraso no caminho crítico atrasa a entrega final.
- **Folga Livre e Folga Total**: Período de tempo que uma atividade pode ser postergada sem atrasar o início das sucessoras ou a conclusão da obra.

---

## 3. Requisitos do Sistema

### 3.1 Requisitos Funcionais (RF)

| ID | Nome | Descrição |
|---|---|---|
| **RF01** | Ingestão de Planilha Orçamentária | O sistema deve permitir o upload de planilhas Excel (`.xlsx`, `.xls`) contendo a planilha sintética da obra (itens, códigos SINAPI/próprios, descrições, unidades, quantidades, valores com e sem BDI e peso %). |
| **RF02** | Extração e Estruturação Hierárquica | O backend deve processar a planilha, identificar os níveis da EAP (macroetapas, subetapas e itens terminais/folhas) e persistir os dados estruturados no PostgreSQL. |
| **RF03** | Configuração de Dependências | O sistema deve permitir configurar relações de precedência entre etapas (Fim-Início `FI`, Início-Início `II`, Fim-Fim `FF`) e dependências construtivas padrões. |
| **RF04** | Trilha Gamificada Estilo Duolingo | O frontend deve renderizar a obra como uma trilha interativa sinuosa dividida em seções/módulos, onde cada nó representa uma etapa ou pacote de trabalho com status visual intuitivo. |
| **RF05** | Apontamento de Progresso e Medição | O gestor de obra deve registrar o percentual executado de cada item ou etapa e data de início/término real. |
| **RF06** | Sinalização e Detecção de Atrasos | O sistema deve identificar automaticamente etapas que ultrapassaram a data planejada ou que foram explicitamente marcadas com impedimento/atraso. |
| **RF07** | Motor de Recomendação de Adiantamento | Ao registrar um atraso em uma etapa, o sistema deve executar uma análise de viabilidade construtiva e sugerir etapas elegíveis para serem antecipadas, minimizando a perda de tempo e ociosidade de equipes. |
| **RF08** | Simulação e Aplicação da Reprogramação | O usuário pode aceitar a sugestão do sistema, recalculando datas, realocando prioridades e atualizando o estado da trilha no frontend. |
| **RF09** | Dashboard Físico-Financeiro (Curva S) | O sistema deve exibir indicadores de avanço planejado versus executado ponderado pelo peso percentual dos itens. |

### 3.2 Requisitos Não-Funcionais (RNF)

| ID | Categoria | Descrição |
|---|---|---|
| **RNF01** | Performance de Parsing | A extração de planilhas orçamentárias com até 5.000 itens deve ser processada e persistida em menos de 3 segundos. |
| **RNF02** | Estruturação de Dados | A modelagem relacional no PostgreSQL deve suportar consultas recursivas (hierarquia da EAP), rastreamento de grafos de dependência e versionamento de cronogramas. |
| **RNF03** | Rastreabilidade e Auditoria | Toda alteração de datas, apontamento de progresso ou aplicação de recomendações deve manter histórico de auditoria (data, autor, valor anterior, valor novo). |
| **RNF04** | Usabilidade e Responsividade (UI Duolingo) | A interface da trilha deve ser totalmente responsiva (Desktop e Tablet de canteiro de obras), garantindo feedback visual fluido (60 FPS) e transições claras entre nós. |
| **RNF05** | Tolerância a Variações de Planilhas | O parser de planilhas deve reconhecer cabeçalhos sinônimos (ex: "Val. Unit.", "Valor Unitário", "Preço Unitário", "Valor c/ BDI") e ignorar linhas vazias ou de rodapé. |

---

## 4. Regras de Negócio (RN)

### RN01 - Hierarquia de Agregação da EAP
- Um item pai (ex: `8. INSTALAÇÕES`) tem seu percentual de conclusão calculado a partir da média ponderada de seus itens filhos pelo peso relativo de cada um:
  $$\text{Progresso do Pai} = \sum (\text{Progresso do Filho}_i \times \text{Peso do Filho}_i) / \text{Peso Total do Pai}$$

### RN02 - Condições de Bloqueio e Desbloqueio de Nós (Trilha)
- Um nó na trilha só fica no estado **Disponível / Desbloqueado** se todas as suas etapas predecessoras obrigatórias estiverem **Concluídas** (ou se tiverem início antecipado permitido por relação `II` com desfasamento).
- Nós com predecessoras pendentes permanecem no estado **Bloqueado (Cadeado)**.

### RN03 - Lógica do Motor de Recomendação de Adiantamento
Quando a etapa $E_{atrasada}$ sofre atraso de $D$ dias:
1. **Identificação de Candidatas**: O sistema busca todas as etapas $E_k$ da obra que atendem aos seguintes critérios:
   - Status atual: `Pendente` ou `Não Iniciada`.
   - Sem dependência direta ou indireta não resolvida em relação a $E_{atrasada}$.
   - Predecessoras imediatas de $E_k$ já concluídas (ou com viabilidade de liberação de frente de serviço independente, como por exemplo: drenagem externa enquanto alvenaria interna aguarda material).
   - Compatibilidade de frente de trabalho e não concorrência de espaço físico.
2. **Ranqueamento de Prioridade**: As etapas candidatas são ordenadas por:
   - Maior Peso Percentual (%) no orçamento global.
   - Proximidade com o caminho crítico original.
   - Disponibilidade de equipe/insumos.
3. **Apresentação ao Usuário**: O sistema apresenta as recomendações com o impacto estimado na recuperação do cronograma geral da obra.
