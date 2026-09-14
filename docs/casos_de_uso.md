# Especificação de Casos de Uso

## 1. Diagrama Geral de Casos de Uso (UML)

*(Espaço reservado para o diagrama de casos de uso)*

---

## 2. Detalhamento dos Casos de Uso

### UC01: Importar Planilha Orçamentária (Excel)
- **Ator Principal**: Engenheiro / Gestor de Obras.
- **Objetivo**: Carregar a planilha sintética da obra (`.xlsx`), extraindo a EAP hierárquica, valores orçados e pesos percentuais.
- **Pré-condições**: Usuário autenticado com permissão de criação/edição de obra.
- **Fluxo Principal**:
  1. O usuário acessa a opção "Nova Obra / Importar Orçamento".
  2. O usuário faz o upload do arquivo Excel com o orçamento sintético (ex: SINAPI).
  3. O sistema valida o formato das colunas e a consistência dos dados numéricos.
  4. O sistema processa recursivamente a estrutura de tópicos (`1`, `2`, `8.1`, `8.1.1`, etc.).
  5. O sistema persiste a obra, os pacotes de trabalho (macroetapas) e os itens de serviço no banco de dados.
  6. O sistema inicializa a trilha de atividades no frontend e notifica o usuário com o resumo da importação (total de itens, custo total, pesos calculados).
- **Fluxos Alternativos**:
  - *4a. Planilha com itens sem código de banco*: O sistema cadastra o item como "Composição Própria".
- **Fluxo de Exceção**:
  - *3a. Formato inválido ou colunas obrigatórias ausentes*: O sistema exibe um relatório com os erros de parsing (ex.: linha com valor numérico mal formatado) e solicita a correção do arquivo.

---

### UC02: Visualizar Trilha Gamificada (Estilo Duolingo)
- **Ator Principal**: Engenheiro / Gestor de Obras, Mestre de Obras.
- **Objetivo**: Acompanhar o fluxo da obra de forma visual, progressiva e intuitiva em uma trilha de aprendizagem/avanço com nós interativos.
- **Pré-condições**: Obra cadastrada com EAP importada.
- **Fluxo Principal**:
  1. O usuário seleciona a obra no painel principal.
  2. O sistema renderiza a **Trilha Concordia**:
     - Fases agrupadas em "Capítulos/Seções" (ex: Fase 1: Serviços Preliminares e Movimento de Terra; Fase 2: Infraestrutura e Fundações; Fase 3: Superestrutura e Vedações).
     - Nós circulares com ícones alusivos ao tipo de serviço (escavadeira, tijolo, tubulação, pintura).
     - Identificação visual dos status dos nós (Concluído [Verde], Em Andamento [Azul com barra circular], Bloqueado [Cinza com cadeado], Atrasado [Vermelho pulsante], Oportunidade de Adiantamento [Dourado com badge]).
  3. O usuário clica em um nó específico para abrir o painel lateral de detalhes daquela etapa (custo, peso %, quantidade, itens SINAPI associados, responsáveis e prazo).

---

### UC03: Registrar Progresso e Apontar Atraso
- **Ator Principal**: Engenheiro / Gestor de Obras, Mestre de Obras.
- **Objetivo**: Atualizar a porcentagem executada de um item/etapa e sinalizar desvios de prazo ou impedimentos técnicos.
- **Pré-condições**: Etapa desbloqueada ou em andamento.
- **Fluxo Principal**:
  1. O usuário seleciona a etapa em andamento na trilha ou na lista de apontamentos.
  2. O usuário informa o percentual de medição atual (ex: de 40% para 80%) ou seleciona a opção "Marcar como Concluído".
  3. Caso a etapa esteja atrasada ou encontre um impedimento de canteiro, o usuário aciona o botão **"Sinalizar Atraso / Impedimento"**, especificando os dias de atraso estimados e o motivo (chuva, falta de material, atraso de terceirizados, etc.).
  4. O sistema atualiza o status da etapa, recalcula o progresso físico-financeiro global da obra e salva o registro no histórico de medições.
  5. Se houver atraso sinalizado, o sistema aciona automaticamente o **UC04 (Gerar Sugestões de Adiantamento de Etapas)**.

---

### UC04: Gerar Sugestões de Adiantamento de Etapas
- **Ator Principal**: Motor de Recomendação (Sistema).
- **Objetivo**: Identificar tarefas paralelas e independentes que podem ser antecipadas para neutralizar ou minimizar o impacto do atraso de uma etapa.
- **Pré-condições**: Uma etapa entrou em estado de atraso/impedimento.
- **Fluxo Principal**:
  1. O sistema analisa o grafo de dependências da EAP.
  2. O sistema filtra etapas que não dependem do nó atrasado e cujos pré-requisitos já foram satisfeitos.
  3. O sistema calcula o escore de viabilidade e impacto de cada etapa elegível (peso no orçamento, frentes de trabalho disponíveis, disponibilidade de insumos).
  4. O sistema gera uma lista ordenada de sugestões de adiantamento, acompanhada de justificativa técnica e ganho estimado de tempo.
  5. O sistema destaca na trilha os nós recomendados com uma aura/animação de "Oportunidade de Adiantamento" e abre um modal com o plano de ação sugerido.

---

### UC05: Aplicar Reprogramação de Cronograma
- **Ator Principal**: Engenheiro / Gestor de Obras.
- **Objetivo**: Aprovar ou ajustar a recomendação do sistema para atualizar as datas e a ordem da trilha da obra.
- **Pré-condições**: Sugestões de adiantamento geradas pelo UC04.
- **Fluxo Principal**:
  1. O usuário visualiza o modal com as etapas sugeridas para adiantamento.
  2. O usuário seleciona quais etapas aceita adiantar e confirma a nova data de início proposta.
  3. O sistema recalcula o cronograma, ajusta o estado dos nós na trilha (desbloqueando frentes de trabalho imediatas) e gera uma nova versão do cronograma de contingência.
  4. O sistema emite uma notificação de sucesso e atualiza a Curva S projetada.

---

### UC06: Configurar Dependências Construtivas
- **Ator Principal**: Engenheiro / Gestor de Obras.
- **Objetivo**: Ajustar vínculos de precedência e sucessão entre pacotes e itens de serviço para refinar a precisão do caminho crítico.
- **Pré-condições**: Obra importada.
- **Fluxo Principal**:
  1. O usuário acessa a matriz de dependências ou o editor visual de conexões da EAP.
  2. O usuário adiciona ou remove vínculos (ex: `Superestrutura` depende do término de `Fundação/Contenção`; `Drenagem Externa` pode ocorrer em paralelo a `Alvenaria`).
  3. O sistema valida se a dependência não cria ciclos recursivos (Deadlock na EAP).
  4. O sistema salva as dependências e atualiza as regras de liberação dos nós na trilha.
