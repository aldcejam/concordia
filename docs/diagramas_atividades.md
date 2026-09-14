# Especificação de Atividades e Processos

Os tópicos abaixo descrevem o fluxo operacional, tomadas de decisão e processos automáticos do sistema Concordia.

---

## 1. Ingestão e Parsing da Planilha Orçamentária

*(Espaço reservado para o diagrama de atividades da ingestão de planilha)*

### Descrição do Processo:
1. **Upload**: Usuário envia arquivo Excel (`.xlsx` ou `.xls`).
2. **Validação**: Sistema verifica extensão, formatação e presença de colunas obrigatórias (*Item, Descrição, Unidade, Quantidade, Valor Unitário*).
3. **Transação e Criação**: Inicia a transação de persistência e cria a entidade `Obra`.
4. **Parsing em Lote**: Itera sobre as linhas, deduz o nível na EAP pelo código (ex: `8.1.2`), extrai valores e vincula ao item pai correspondente (`8.1`).
5. **Consolidação**: Recalcula pesos percentuais (soma = 100%) e gera os nós da trilha Duolingo.
6. **Bloqueio Inicial**: Define estados iniciais de nós (itens independentes desbloqueados e itens com predecessoras bloqueados).

---

## 2. Apontamento de Progresso e Sinalização de Atraso

*(Espaço reservado para o diagrama de atividades do apontamento de progresso)*

### Descrição do Processo:
1. **Seleção**: Usuário seleciona o nó ativo na trilha.
2. **Registro**: Informa percentual executado ou conclusão total (100%).
3. **Verificação de Desvio**:
   - Sem atraso: Atualiza o avanço da etapa e recalcula o progresso agregado da obra.
   - Com atraso/impedimento: Abre formulário de justificativa e dias de atraso estimados, acionando o Motor de Mitigação.
4. **Desbloqueio e Auditoria**: Se a etapa atingir 100%, desbloqueia as sucessoras na trilha e grava o histórico de auditoria.

---

## 3. Motor de Recomendação e Reprogramação Inteligente

*(Espaço reservado para o diagrama de atividades do motor de mitigação)*

### Descrição do Processo:
1. **Disparo**: Motor recebe o nó com atraso e os dias de impacto.
2. **Filtragem de Candidatas**:
   - Status `Não Iniciada` ou `Pendente`.
   - Independência em relação ao nó atrasado.
   - Pré-requisitos e frentes físicas liberadas.
3. **Cálculo de Prioridade**: Ranqueamento ponderado por maior peso percentual (%) no orçamento e proximidade ao caminho crítico.
4. **Apresentação**: Destaque visual na trilha e exibição de modal de reprogramação.
5. **Decisão do Gestor**: Se aprovado, antecipa as datas de início das etapas selecionadas e recalcula a Curva S.
