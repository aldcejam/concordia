# Diagrama de Classes e Modelagem de Dados

Este documento descreve a modelagem de domínio do sistema Concordia para suportar orçamentos de obras, hierarquia EAP/WBS, serviços, composições analíticas (principais e auxiliares) e insumos.

---

## 1. Diagrama de Classes (Mermaid UML)

```mermaid
classDiagram
    direction TB

    class Obra {
        +UUID id
        +String nome
        +String contratante
        +BigDecimal bdiPercentual
        +EncargosSociais encargosSociais
        +BigDecimal valorTotalSemBdi
        +BigDecimal valorTotalComBdi
        +StatusObra status
        +List~OrcamentoItem~ itensRaiz
    }

    class EncargosSociais {
        +Boolean desonerado
        +BigDecimal percentualHorista
        +BigDecimal percentualMensalista
    }

    class OrcamentoItem {
        +UUID id
        +String codigoEap
        +String descricao
        +Integer nivel
        +Integer ordem
        +TipoNivelEap tipoNivel
        +BigDecimal quantidade
        +String unidadeMedida
        +BigDecimal valorUnitario
        +BigDecimal valorUnitarioComBdi
        +BigDecimal valorTotal
        +BigDecimal pesoPercentual
        +OrcamentoItem pai
        +List~OrcamentoItem~ subItens
        +Composicao composicao
        +isFolha() Boolean
        +calcularTotais() void
    }

    class Composicao {
        +UUID id
        +String codigo
        +BancoReferencia banco
        +String descricao
        +String tipoClassificacao
        +String unidadeMedida
        +BigDecimal custoUnitario
        +BigDecimal maoDeObraSemLs
        +BigDecimal leisSociais
        +BigDecimal maoDeObraComLs
        +BigDecimal valorBdi
        +List~ComposicaoItem~ itensComposicao
        +calcularCustoTotal() BigDecimal
    }

    class ComposicaoItem {
        +UUID id
        +BigDecimal coeficiente
        +BigDecimal valorUnitario
        +BigDecimal custoTotal
        +TipoItemComposicao tipo
        +Insumo insumo
        +Composicao composicaoAuxiliar
    }

    class Insumo {
        +UUID id
        +String codigo
        +BancoReferencia banco
        +String descricao
        +TipoInsumo tipoInsumo
        +String unidadeMedida
        +BigDecimal precoMedioUnitario
    }

    class BancoReferencia {
        <<enumeration>>
        SINAPI
        SICRO3
        ORSE
        SEDOP
        SEINFRA
        PROPRIO
        OUTRO
    }

    class TipoNivelEap {
        <<enumeration>>
        MACROETAPA
        SUBETAPA
        ITEM_SERVICO
    }

    class TipoItemComposicao {
        <<enumeration>>
        INSUMO
        COMPOSICAO_AUXILIAR
    }

    class TipoInsumo {
        <<enumeration>>
        MATERIAL
        MAO_DE_OBRA
        EQUIPAMENTO
        SERVICO_TERCEIRO
    }

    Obra "1" *-- "1" EncargosSociais
    Obra "1" *-- "0..*" OrcamentoItem : itens
    OrcamentoItem "0..1" --> "0..*" OrcamentoItem : subItens (Hierarquia EAP)
    OrcamentoItem "0..1" --> "0..1" Composicao : detalhe técnico

    Composicao "1" *-- "1..*" ComposicaoItem : itens
    ComposicaoItem "0..1" o-- "0..1" Insumo : referencia
    ComposicaoItem "0..1" o-- "0..1" Composicao : composicaoAuxiliar
```

---

## 2. Responsabilidades das Entidades

### 2.1 `Obra` e `EncargosSociais`
- **`Obra`**: Raiz da agregação. Mantém metadados do projeto, contratante, taxa de B.D.I. global, totais consolidados e a lista de itens de primeiro nível.
- **`EncargosSociais`**: Informações de encargos de mão de obra (percentual horista, percentual mensalista e indicador de desoneração).

### 2.2 `OrcamentoItem` (Hierarquia EAP / WBS)
- Implementa o **Padrão Composite** para suportar a árvore de etapas da obra:
  - **Macroetapa (Nível 1)**: ex: `1 SERVIÇOS PRELIMINARES`
  - **Subetapa (Nível 2)**: ex: `1.1 CANTEIRO`
  - **Item de Serviço (Nível 3 / Folha)**: ex: `1.1.1 Placa de Obra`
- Itens folha possuem quantidades físicas (`quantidade`, `unidadeMedida`), preços unitários e ligação com a `Composicao`.

### 2.3 `Composicao` e `ComposicaoItem` (CPU - Composição de Preço Unitário)
- **`Composicao`**: Fórmula/receita unitária do serviço com memória de cálculo de encargos sociais, mão de obra e BDI.
- **`ComposicaoItem`**: Registra os coeficientes de consumo necessários para produzir 1 unidade da composição:
  - Pode referenciar um `Insumo` (material, mão de obra direta, equipamento).
  - Pode referenciar recursivamente outra `Composicao` (Composição Auxiliar, como argamassas preparadas ou equipes de carpinteiro/pedreiro com encargos complementares).

### 2.4 `Insumo`
- Catálogo padronizado de insumos básicos com códigos de bancos de referência (`SINAPI`, `SICRO`, `ORSE`, `SEDOP`, etc.), tipo (`MATERIAL`, `MAO_DE_OBRA`, `EQUIPAMENTO`) e preço unitário base.

---

## 3. Mapeamento dos Dados da Planilha

| Dado na Planilha Orçamentária | Entidade Correspondente | Tipo / Papel |
| :--- | :--- | :--- |
| **`1.1.1`** (Qtd: `4,50`, Total: `1.897,83`) | `OrcamentoItem` | Item Folha na EAP |
| **Composição `103689` - SINAPI** | `Composicao` | Serviço Principal |
| **Auxiliar `88262` - Carpinteiro** (Coef: `0.3729 h`) | `ComposicaoItem` $\rightarrow$ `Composicao` | Composição Auxiliar |
| **Insumo `00004509` - Sarrafo Pinus** (Coef: `3.2083 m`) | `ComposicaoItem` $\rightarrow$ `Insumo` | Insumo de Material |
