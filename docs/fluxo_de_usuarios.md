# Fluxo de Usuários (User Flow)

Este documento detalha a jornada completa dos usuários no sistema **Concordia**, cobrindo os diferentes perfis de acesso, pontos de decisão, telas do sistema e estados da trilha interativa.

---

## 1. Fluxo Geral do Usuário (User Journey)

*(Espaço reservado para o diagrama de fluxo de usuários)*

---

## 2. Detalhamento dos Subfluxos de Usuário

### 2.1 Fluxo 1: Onboarding e Criação de Obra a partir de Planilha
1. **Entrada**: Usuário clica em `+ Nova Obra`.
2. **Upload**: Arrasta e solta a planilha de Orçamento Sintético (`.xlsx`).
3. **Validação**: Sistema realiza o parse em tempo real e apresenta:
   - Valor Total sem BDI, BDI (%) e Valor Total Geral.
   - Árvore de Níveis da EAP (Macroetapas, Subetapas e Itens SINAPI).
   - Somatório dos Pesos Percentuais.
4. **Ajuste Fino**: O usuário pode confirmar ou complementar as dependências padrão (ex: *Estrutura depende de Fundação*).
5. **Geração**: O sistema gera a Trilha Gamificada inicial, colocando os nós iniciais como `Disponíveis` e os dependentes como `Bloqueados (Cadeado)`.

---

### 2.2 Fluxo 2: Apontamento no Canteiro de Obras (Mestre de Obras / Fiscal)
1. **Visualização**: Usuário acessa o app via tablet ou smartphone no canteiro.
2. **Seleção de Frente**: Clica no nó em execução (ex: `8.1.1 Tubo PVC 150mm`).
3. **Registro**:
   - Arrasta a barra de progresso (ex: de 30% para 70%).
   - Se houver algum problema (ex: *tubos atrasados pelo fornecedor*), marca a caixa `⚠️ Reportar Impedimento`.
   - Especifica a previsão de atraso (ex: +5 dias).
4. **Feedback**: O nó passa a piscar em vermelho, e o sistema notifica o engenheiro gestor imediatamente.

---

### 2.3 Fluxo 3: Tomada de Decisão e Adiantamento de Etapas (Engenheiro)
1. **Notificação**: O engenheiro recebe o alerta de atraso na etapa `8.1.1`.
2. **Recomendação Inteligente**: Um banner e nós com efeito dourado acendem na trilha indicando:
   - *"A etapa 9.1 (Chapisco Interno) e 8.2 (Drenagem do Pórtico) podem ser antecipadas em paralelo sem conflito de espaço."*
3. **Simulação**: O usuário clica em `Ver Simulação` e compara o impacto:
   - *Sem adiantamento*: Atraso total de +5 dias na entrega.
   - *Com adiantamento aceito*: Atraso neutralizado (0 dias).
4. **Aplicação**: Clica em `Aprovar Reprogramação`. A trilha é atualizada em tempo real para toda a equipe.
