# Especificação de Interface Gamificada (Estilo Duolingo)

## 1. Conceito Central da Interface

No setor da construção civil, cronogramas tradicionais (gráficos de Gantt com centenas de barras horizontais) causam fadiga visual e dificultam o engajamento de equipes de campo e a percepção rápida de prioridades.

A interface do **Concordia** reimagina o cronograma da obra como uma **trilha de aprendizagem e conquistas (estilo Duolingo)**:
- A obra é dividida em **Capítulos / Módulos** (Macroetapas da EAP: Fundação, Estrutura, Alvenaria, Instalações, Acabamentos).
- Cada serviço executável é representado por um **Nó Circular Interativo** ao longo de um caminho sinuoso.
- Conforme as equipes concluem serviços, o caminho se ilumina, liberando novos trechos da trilha.
- Quando ocorrem atrasos, o sistema visualmente alerta e acende **"Pontes Douradas"** (oportunidades de adiantamento em frentes paralelas).

---

## 2. Estrutura Visual da Trilha

```
[ Banner da Seção: FASE 1 - INFRAESTRUTURA E DRENAGEM ]
                ( ★ ) Nó 1: Locação da Obra [CONCLUÍDO - Verde]
               /
            ( ★ ) Nó 2: Movimento de Terra [CONCLUÍDO - Verde]
               \
                ( ⚡ ) Nó 3: Tubulações e Drenagem [EM ANDAMENTO - Azul Pulsante 65%]
               /
            ( ⚠️ ) Nó 4: Caixas de Boca de Lobo [ATRASADA - Vermelho Alerta]
               \
      [ Sugestão ] ---> ( 💎 ) Nó 8: Chapisco Interno [ADIANTÁVEL - Dourado com Badge]
               /
            ( 🔒 ) Nó 5: Lajes de Piso [BLOQUEADO - Cinza c/ Cadeado]
```

---

## 3. Estados e Estilos Visuais dos Nós

| Estado do Nó | Representação Visual | Significado no Canteiro | Ações do Usuário ao Clicar |
|---|---|---|---|
| **Concluído (Done)** | Ícone verde com estrela/check, borda preenchida com brilho sutil. | Serviço 100% executado e medido. | Ver detalhes, data de entrega, fotos e medições realizadas. |
| **Em Andamento (Active)** | Ícone azul/ciano vibrante com anel de progresso circular (`65%`). | Equipe trabalhando atualmente no local. | Registrar medição diária/semanal, atualizar percentual ou concluir. |
| **Bloqueado (Locked)** | Ícone cinza com cadeado sutil. | Não pode iniciar ainda porque depende de etapas anteriores. | Ver quais pré-requisitos ainda faltam ser concluídos. |
| **Atrasado (Delayed)** | Ícone âmbar/vermelho com animação de alerta pulsante. | Prazo estourado ou impedimento no canteiro registrado. | Ver motivo do atraso e abrir painel de opções de mitigação. |
| **Oportunidade de Adiantamento (Boost)** | Ícone dourado com efeito brilhante e badge "Adiantar!". | Etapa independente que pode ser iniciada agora para compensar atrasos. | Aceitar recomendação, mobilizar equipe e iniciar a frente. |
| **Marco / Portão de Qualidade (Boss Level)** | Nó maior em formato de baú/troféu no final de cada grande macroetapa. | Conclusão de uma fase crítica (ex: Liberação das Fundações). | Emissão do boletim de medição global e celebração visual. |

---

## 4. Componentes e Microinterações da Trilha

### 4.1 Barra Superior de Status da Obra (Gamificada)
- **Coração / Saúde da Obra**: Indicador de aderência ao cronograma (100% = No prazo, diminui se houver atrasos críticos acumulados).
- **Moedas / Valor Físico**: Total financeiro já medido em relação ao valor total contratado.
- **Sequência de Dias (Streak)**: Dias consecutivos de medição e produtividade ativa no canteiro.

### 4.2 Modal de Detalhes da Etapa (Gaveta Lateral / Drawer)
Ao tocar em qualquer nó, um painel lateral se abre com:
- Código e Descrição Técnica (ex: `8.1.1 - TUBO PVC SÉRIE R DN 150MM`).
- Referência orçamentária (`SINAPI 104166`).
- Quantidade orçada x Quantidade executada (`18.2m de 30.3m`).
- Peso financeiro no contrato (`0,10% - R$ 1.841,63`).
- Sliders intuitivos para atualização rápida da medição física.
- Botão de ação rápida: **"Reportar Impedimento / Atraso"**.

### 4.3 Modal de Reprogramação Inteligente (Aura Dourada)
Quando acionado o motor de adiantamento:
- O modal exibe um comparativo visual claro:
  - *Cenário sem intervenção*: Atraso previsto de +12 dias na entrega final.
  - *Cenário com adiantamento proposto*: Redução do atraso para 0 dias ao antecipar as etapas $A$ e $B$.
- Botão de um clique: **"Aplicar Reprogramação na Trilha"**.
