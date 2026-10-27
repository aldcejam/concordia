# Regras de Negócio — UC-OBR-001 (Importar Planilha Orçamentária Excel)

## RN-OBR-001-01 — Detecção de Layout e Sinônimos de Cabeçalho na Planilha Excel

- **Classificação:** `Política de Produto`
- **Consumidores (Casos de Uso):** [UC-OBR-001](./README.md)
- **Referências:** `api/src/main/java/br/com/concordia/infrastructure/obra/planilha/OrcamentoPlanilhaParser.java` (`OrcamentoPlanilhaParser.ler()`, `OrcamentoPlanilhaParser.lerAnalitica()`, `OrcamentoPlanilhaParser.lerSintetica()`, `OrcamentoPlanilhaParser.SINONIMOS`), `api/src/main/java/br/com/concordia/infrastructure/obra/ImportacaoOrcamentoController.java` (`ImportacaoOrcamentoController.ler()`), `api/src/test/java/br/com/concordia/infrastructure/obra/planilha/OrcamentoPlanilhaParserTest.java`

### Enunciado
Quando um arquivo Excel (`.xlsx` ou `.xls`, até 20 MB) é submetido, o sistema lê a primeira aba da planilha e determina automaticamente o layout:
1. **Planilha Analítica (`"Planilha analítica (composições SINAPI)"`):** Selecionada quando qualquer linha contém `"Composição"` (ignorando maiúsculas/minúsculas) na coluna `A`. Nesse formato, seções são linhas cujo valor na coluna `A` casa com `\d+(?:\.\d+)*` e cuja coluna `D` contém o nome da seção (diferente de `"Descrição"` e `"Descrição Total"`). Cada item de serviço inicia em uma linha de cabeçalho de bloco (`codigoEap` na coluna `A` e `"Descrição"` na coluna `D`), seguida pela linha `"Composição"` (com código na coluna `B`, banco em `C`, descrição em `D`, tipo em `E`, unidade em `G` e valor unitário base em `I`) e encerrada pela linha de totais (`"Quant. =>"` na coluna `G`, quantidade na coluna `H` e preço total na coluna `J`).
2. **Planilha Sintética (`"Planilha sintética"`):** Selecionada nos demais casos, procurando nas primeiras 30 linhas uma linha de cabeçalho que contenha simultaneamente sinônimos normalizados para `Item` e `Descrição`. Uma vez localizado o cabeçalho, o sistema exige a presença das colunas `Unidade`, `Quantidade` e ao menos uma coluna de valor (`Valor unitário`, `Valor unitário com BDI` ou `Total`). Linhas após o cabeçalho cujo código na coluna `Item` casa com `\d+(?:\.\d+)*` são tratadas como seções quando `Unidade` e `Quantidade` estão vazias, ou como itens de serviço caso contrário.

### Exceções e Limites
- Linhas com código fora do padrão numérico separado por pontos (como linhas em branco, subtotais ou `"TOTAL GERAL"`) são ignoradas na leitura sintética.
- Valores monetários e percentuais aceitam formatação brasileira (`"1.234,56"`, `"R$ 10,00"`, `"20,74%"`) e células numéricas ou de fórmula (`OrcamentoPlanilhaParser.decimalOuNulo()`).
- Células de BDI formatadas como fração decimal menor que `1` sem o símbolo `%` (ex.: `0.2074`) são convertidas automaticamente para percentual multiplicando por `100` (`20.74`).

### Exemplos Concretos
- **Exemplo válido:** Planilha sintética com cabeçalho `Item | Cód. | Fonte | Discriminação | Unid. | Qtde | Val. Unit. | Valor c/ BDI | Preço Total` na linha 4 -> reconhecida como `"Planilha sintética"`, mapeando `Discriminação` para `DESCRICAO`, `Qtde` para `QUANTIDADE` e ignorando a linha final `"TOTAL GERAL"`.
- **Exemplo inválido / borda:** Planilha sintética contendo apenas `Item | Descrição | Valor Unitário` -> retorna erro na linha do cabeçalho: `"Colunas obrigatórias ausentes: Unidade, Quantidade."`.

---

## RN-OBR-001-02 — Classificação Automática de Composição Própria e Divergência de Seção

- **Classificação:** `Política de Produto`
- **Consumidores (Casos de Uso):** [UC-OBR-001](./README.md)
- **Referências:** `api/src/main/java/br/com/concordia/domain/obra/importacao/ImportacaoPlanilhaService.java` (`ImportacaoPlanilhaService.montar()`, `ImportacaoPlanilhaService.isComposicaoPropria()`, `ImportacaoPlanilhaService.validarValores()`, `ImportacaoPlanilhaService.conferirTotalInformado()`, `ImportacaoPlanilhaService.importar()`), `api/src/test/java/br/com/concordia/domain/obra/importacao/ImportacaoPlanilhaServiceTest.java`

### Enunciado
Durante a validação e montagem da EAP a partir da planilha lida, o sistema aplica as seguintes regras de classificação, avisos e bloqueios:
1. **Composição Própria:** Todo item cujo banco seja nulo/vazio, comece por `"própri"` ou `"propri"`, ou cujo `codigoComposicao` seja nulo/vazio é contabilizado em `composicoesProprias`; se o banco estiver em branco, recebe o rótulo `"Composição Própria"`, gerando um aviso consolidado não bloqueante.
2. **Conferência de Total de Seção:** Quando uma seção informa um valor total explícito na planilha e a diferença absoluta entre esse valor e a soma calculada dos itens filhos supera `R$ 1,00` (`TOLERANCIA_TOTAL_SECAO`), o sistema mantém a soma calculada dos filhos e registra um aviso não bloqueante.
3. **Erros Impeditivos:** A planilha é marcada como inválida (`valida = false`) e bloqueada para importação (lançando `PlanilhaInvalidaException` com HTTP `422` na confirmação) quando:
   - Não houver nenhum item de serviço encontrado.
   - Houver código EAP duplicado entre seções ou itens.
   - Algum item possuir quantidade negativa, valor total negativo ou campos obrigatórios ausentes/mal formatados.
   - Na confirmação da importação, nem o formulário (`descricao`) nem o cabeçalho da planilha (`nomeObra`) informarem a descrição da obra.

### Exceções e Limites
- Avisos (`avisos`) não invalidam a planilha (`valida` permanece `true` desde que `erros` esteja vazia).
- Quando o usuário preenche o campo `descricao` na confirmação, esse valor (com `trim()`) prevalece sobre o `nomeObra` lido da planilha.

### Exemplos Concretos
- **Exemplo válido:** Item `2.1` sem banco e sem código de composição com valor total `R$ 700,00` -> `banco` preenchido como `"Composição Própria"`, `composicoesProprias` incrementado e aviso `"1 item(ns) cadastrado(s) como composição própria (sem código de banco oficial)."` adicionado sem bloquear a importação.
- **Exemplo inválido / borda:** Dois itens com o mesmo código EAP `1.1` nas linhas 2 e 3 -> `valida = false` com erro na linha 3, coluna `A`: `"Código EAP 1.1 está duplicado."`.
