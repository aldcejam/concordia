# Regras de Negócio — UC-OBR-008 (Importar Estrutura da EAP via Arquivo CSV)

## RN-OBR-008-01 — Formato CSV, Precedência Hierárquica e EAP Vazia

- **Classificação:** `Invariante de Domínio`
- **Consumidores (Casos de Uso):** [UC-OBR-008](./README.md)
- **Referências:** `api/src/main/java/br/com/concordia/infrastructure/obra/csv/ObraCsvParser.java` (`ObraCsvParser.ler()`, `ObraCsvParser.validarCabecalho()`, `ObraCsvParser.converter()`), `api/src/main/java/br/com/concordia/domain/obra/ImportacaoObraService.java` (`ImportacaoObraService.importar()`, `ImportacaoObraService.criarItemEap()`), `api/src/test/java/br/com/concordia/infrastructure/obra/csv/ObraCsvParserTest.java`, `api/src/test/java/br/com/concordia/domain/obra/ImportacaoObraServiceTest.java`

### Enunciado
Na importação de estrutura da EAP via arquivo CSV (`POST /api/obras/{id}/importar`), o sistema exige que:
1. **EAP Vazia na Obra Alvo:** A obra informada não possua nenhum item cadastrado em `obra.getEap()`; caso contrário, a operação é recusada com `ConflitoException` (HTTP `409 Conflict`).
2. **Cabeçalho e Colunas Obrigatórias:** A primeira linha (descontado eventual BOM UTF-8) deve conter exatamente as 5 colunas `item;codigo;descricao;unidade;quantidade` (ignorando maiúsculas/minúsculas e espaços nas bordas). Toda linha não vazia subsequente deve conter 5 colunas separadas por `;` (respeitando campos entre aspas duplas), com `item` e `descricao` obrigatórios. Quando `codigo` é informado, `unidade` e `quantidade` numérica válida tornam-se obrigatórias.
3. **Unicidade de Código `item`:** Nenhum código hierárquico `item` pode se repetir no arquivo.
4. **Precedência Estrita Pai → Filho:** Sempre que o código `item` contiver ponto (`.`), o prefixo anterior ao último ponto identifica o código do item pai (ex.: para `1.1.1`, o pai é `1.1`), o qual deve obrigatoriamente ter aparecido em uma linha anterior do mesmo arquivo CSV.

### Exceções e Limites
- Linhas completamente em branco após o cabeçalho são ignoradas pelo parser, mas o contador `numeroLinha` continua avançando para reportar o número exato da linha física do arquivo em mensagens de erro.
- O campo `quantidade` aceita tanto formatação brasileira (`"1.234,50"`) quanto ponto decimal (`"0.96"`).

### Exemplos Concretos
- **Exemplo válido:** Arquivo `docs/exemplo_importacao_obra.csv` contendo `1;;SERVIÇOS PRELIMINARES;;`, seguido de `1.1;;CANTEIRO DE OBRAS;;` e `1.1.1;103689;PLACA DE OBRA...;M2;4,50` em uma obra recém-criada -> cria toda a árvore `ItemEap` e retorna `200 OK`.
- **Exemplo inválido / borda:** CSV iniciando diretamente com `1.1;;CANTEIRO;;` na linha 2 sem linha `1` prévia -> rejeitado com `IllegalArgumentException` (HTTP `400`): `"Linha 2: item pai 1 do item 1.1 não foi encontrado antes dele."`.
