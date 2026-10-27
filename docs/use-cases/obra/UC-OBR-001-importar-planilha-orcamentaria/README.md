# UC-OBR-001 — Importar Planilha Orçamentária Excel

- **Documentos do Caso:** [Regras de Negócio Locais](./business-rules.md) · [Implementação Técnica](./implementation.md)

## 1. Objetivo e Limites

- **Resultado entregue:** A planilha orçamentária da obra (`.xlsx` ou `.xls`) é validada, estruturada em árvore hierárquica da EAP com cálculo de BDI e pesos percentuais e, após confirmação do usuário, persistida como uma nova obra com suas macroetapas, subetapas e etapas de serviço prontas para acompanhamento na trilha.
- **Início:** O gestor seleciona ou arrasta um arquivo de planilha orçamentária na tela de importação de nova obra (ou envia o arquivo diretamente para os endpoints de pré-visualização/importação).
- **Término:** A obra e toda a sua árvore da EAP são salvas e o resumo consolidado da importação é exibido com opções para abrir a trilha ou configurar dependências.
- **Escopo incluído:** Validação de formato e tamanho do arquivo, reconhecimento automático de layout analítico (SINAPI) ou sintético (com cabeçalhos sinônimos), extração de BDI e nome da obra, montagem da hierarquia da EAP, classificação de composições próprias, pré-visualização sem persistência e criação transacional da obra com sua EAP.
- **Fora do escopo (Limites):** Importação de arquivos CSV para obras já existentes (tratada em [UC-OBR-008](../UC-OBR-008-importar-eap-csv/README.md)) e configuração manual de dependências construtivas após a importação (tratada em [UC-OBR-006](../UC-OBR-006-configurar-dependencias-construtivas/README.md)).

## 2. Ator, Gatilho e Precondições

- **Ator / Iniciador:** Engenheiro / Gestor de Obras.
- **Gatilho:** Envio de arquivo Excel (`.xlsx` ou `.xls`) para pré-visualização ou confirmação de importação da obra.
- **Permissões exigidas:** Acesso liberado sem autenticação obrigatória na configuração atual do sistema.
- **Precondições e Estado Inicial:** O arquivo enviado deve estar nos formatos `.xlsx` ou `.xls`, possuir tamanho máximo de 20 MB e, caso uma empresa contratada seja informada na confirmação, a empresa deve estar previamente cadastrada.

## 3. Resultados e Garantias de Estado

- **Efeitos de sucesso:**
  - Na etapa de pré-visualização: nenhum dado é persistido; o sistema retorna o diagnóstico de validade, avisos, erros por linha/coluna, totais com e sem BDI e a árvore da EAP com pesos percentuais.
  - Na etapa de confirmação: é criada uma nova obra em estado de planejamento, juntamente com os nós de seção (macroetapas e subetapas) e as etapas executáveis correspondentes aos itens de serviço, ordenadas sequencialmente em intervalos de posição de `1000.0`.
- **Garantias em caso de falha:** Se a planilha contiver qualquer erro impeditivo de leitura ou validação, ou se a empresa informada não existir, toda a operação de criação é abortada e nenhum registro de obra, item da EAP ou etapa é persistido.

## UC-OBR-001-C01 — Fluxo Principal

1. O gestor seleciona a opção de criar nova obra a partir de orçamento e envia um arquivo de planilha Excel (`.xlsx` ou `.xls`).
2. O sistema identifica o layout da planilha (analítico por blocos de composição ou sintético por colunas de cabeçalho) aplicando [RN-OBR-001-01 — Detecção de Layout e Sinônimos de Cabeçalho na Planilha Excel](./business-rules.md#rn-obr-001-01--deteccao-de-layout-e-sinonimos-de-cabecalho-na-planilha-excel).
3. O sistema extrai as seções e os itens de serviço, classifica composições sem banco oficial segundo [RN-OBR-001-02 — Classificação Automática de Composição Própria e Divergência de Seção](./business-rules.md#rn-obr-001-02--classificacao-automatica-de-composicao-propria-e-divergencia-de-secao) e monta a árvore hierárquica da EAP calculando custos totais (com e sem BDI) e pesos percentuais conforme [RN-OBR-001 — Hierarquia de Agregação e Cálculo de Pesos da EAP](../../../domain/obra/rules.md#rn-obr-001--hierarquia-de-agregacao-e-calculo-de-pesos-da-eap).
4. O sistema apresenta ao gestor a pré-visualização da árvore da EAP, os indicadores consolidados do orçamento e a descrição da obra sugerida a partir do cabeçalho da planilha.
5. O gestor revisa ou informa a descrição da obra, seleciona a unidade federativa e o fuso horário (e opcionalmente a empresa contratada) e confirma a importação.
6. O sistema revalida a planilha e os dados da obra, cria a obra em estado de planejamento com todas as macroetapas, subetapas e etapas de serviço e retorna o resumo final da obra criada.

## 5. Cenários Alternativos e de Falha

| ID | Origem | Condição | Comportamento do Sistema | Estado Final e Garantias | Continuidade | Regras | Testes Existentes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `UC-OBR-001-C02` | Passo 3 | Item de serviço não possui código de composição ou banco oficial de referência (ou o banco inicia com `própri`/`propri`) | O sistema classifica o item como `"Composição Própria"` e adiciona aviso informativo com a contagem de itens nessa condição | A planilha permanece válida e o item é importado normalmente | Continua no passo 4 | [RN-OBR-001-02](./business-rules.md#rn-obr-001-02--classificacao-automatica-de-composicao-propria-e-divergencia-de-secao) | `api/src/test/java/br/com/concordia/domain/obra/importacao/ImportacaoPlanilhaServiceTest.java` (`ImportacaoPlanilhaServiceTest.cadastraItensSemBancoComoComposicaoPropria`), `web/src/tests/ImportacaoPlanilha.component.test.tsx` |
| `UC-OBR-001-C03` | Passo 3 | O total informado para uma seção na planilha difere em mais de `R$ 1,00` da soma real de seus itens filhos | O sistema preserva a soma calculada a partir dos itens filhos e inclui um aviso indicando a divergência na seção | A planilha permanece válida usando a soma real dos itens | Continua no passo 4 | [RN-OBR-001-02](./business-rules.md#rn-obr-001-02--classificacao-automatica-de-composicao-propria-e-divergencia-de-secao) | `api/src/test/java/br/com/concordia/domain/obra/importacao/ImportacaoPlanilhaServiceTest.java` (`ImportacaoPlanilhaServiceTest.avisaQuandoTotalInformadoDivergeDaSomaDosItens`) |
| `UC-OBR-001-C04` | Passo 2 | O arquivo enviado está vazio, não possui extensão `.xlsx`/`.xls` ou excede 20 MB | Na interface, arquivos com extensão inválida são recusados imediatamente sem envio ao servidor; no backend, a requisição é rejeitada com erro de validação (HTTP 400 ou HTTP 413) | Nenhum dado é persistido | Encerra | [RN-OBR-001-01](./business-rules.md#rn-obr-001-01--deteccao-de-layout-e-sinonimos-de-cabecalho-na-planilha-excel) | `web/tests/e2e/importacao.spec.ts` (`UC01: recusa arquivos que não são planilhas Excel sem chamar a API`), `web/src/tests/ImportacaoPlanilha.component.test.tsx` |
| `UC-OBR-001-C05` | Passo 2 / Passo 3 | A planilha não é um arquivo Excel válido, não possui cabeçalho reconhecido, omite colunas obrigatórias, contém valores numéricos mal formatados/negativos ou códigos EAP duplicados | Na pré-visualização, o sistema retorna resumo marcado como inválido com a lista detalhada de erros por linha e coluna e bloqueia o botão de confirmação; na confirmação direta, recusa a operação (HTTP 422) com o relatório de erros | Nenhuma obra ou etapa é criada no banco de dados | Encerra | [RN-OBR-001-01](./business-rules.md#rn-obr-001-01--deteccao-de-layout-e-sinonimos-de-cabecalho-na-planilha-excel), [RN-OBR-001-02](./business-rules.md#rn-obr-001-02--classificacao-automatica-de-composicao-propria-e-divergencia-de-secao) | `api/src/test/java/br/com/concordia/infrastructure/obra/planilha/OrcamentoPlanilhaParserTest.java`, `api/src/test/java/br/com/concordia/domain/obra/importacao/ImportacaoPlanilhaServiceTest.java`, `web/tests/e2e/importacao.spec.ts` |
| `UC-OBR-001-C06` | Passo 5 / Passo 6 | A planilha não contém nome da obra no cabeçalho e o gestor não informa a descrição da obra na confirmação | O sistema recusa a importação com erro geral solicitando a descrição da obra | Nenhuma obra é persistida | Encerra | [RN-OBR-001-02](./business-rules.md#rn-obr-001-02--classificacao-automatica-de-composicao-propria-e-divergencia-de-secao) | `api/src/test/java/br/com/concordia/domain/obra/importacao/ImportacaoPlanilhaServiceTest.java` (`ImportacaoPlanilhaServiceTest.exigeDescricaoQuandoPlanilhaNaoTemNomeDaObra`) |
| `UC-OBR-001-C07` | Passo 6 | O identificador de empresa informado não corresponde a uma empresa cadastrada | O sistema interrompe a importação e retorna erro de recurso não encontrado (HTTP 404) | Nenhuma obra é persistida | Encerra | [RN-EMP-001](../../../domain/empresa/rules.md#rn-emp-001--cadastro-e-unicidade-de-cnpj-de-empresa) | Sem teste automatizado específico para empresa inexistente na importação Excel |

## 6. Referências

- **Regras de Negócio:**
  - [RN-OBR-001 — Hierarquia de Agregação e Cálculo de Pesos da EAP](../../../domain/obra/rules.md#rn-obr-001--hierarquia-de-agregacao-e-calculo-de-pesos-da-eap)
  - [RN-OBR-001-01 — Detecção de Layout e Sinônimos de Cabeçalho na Planilha Excel](./business-rules.md#rn-obr-001-01--deteccao-de-layout-e-sinonimos-de-cabecalho-na-planilha-excel)
  - [RN-OBR-001-02 — Classificação Automática de Composição Própria e Divergência de Seção](./business-rules.md#rn-obr-001-02--classificacao-automatica-de-composicao-propria-e-divergencia-de-secao)
  - [RN-EMP-001 — Cadastro e Unicidade de CNPJ de Empresa](../../../domain/empresa/rules.md#rn-emp-001--cadastro-e-unicidade-de-cnpj-de-empresa)
- **Contratos / APIs:** [Contrato REST Concordia API](../../../technical/api/concordia-rest-api.md)
- **ADRs Relacionados:** [ADR-001 — Separação entre Domínio e Infraestrutura com Interfaces de Porta](../../../technical/adr/ADR-001-separacao-dominio-infraestrutura-ports-adapters.md), [ADR-003 — Interface de Trilha Gamificada com Atomic Design e Cliente OpenAPI](../../../technical/adr/ADR-003-trilha-gamificada-atomic-design-cliente-openapi.md)
- **Casos Relacionados:** [UC-OBR-002 — Visualizar Trilha Gamificada e Etapas da Obra](../UC-OBR-002-visualizar-trilha-obra/README.md), [UC-OBR-006 — Configurar Dependências Construtivas entre Etapas](../UC-OBR-006-configurar-dependencias-construtivas/README.md), [UC-OBR-008 — Importar Estrutura da EAP via Arquivo CSV](../UC-OBR-008-importar-eap-csv/README.md)

## 7. Limitações Conhecidas

- O parser lê apenas a primeira aba (`workbook.getSheetAt(0)`) da pasta de trabalho Excel (`OrcamentoPlanilhaParser.ler()`).
- A importação cria os registros de `ItemEap` e `EtapaObra` com os dados orçamentários diretamente em `ItemEap`, mas não cria automaticamente vínculos de precedência construtiva (`DependenciaEtapa`) nem preenche datas de início ou prazo esperado das etapas (`inicio = null`, `prazoEsperadoDias = null` em `ImportacaoPlanilhaService.persistir()`).
- Não há verificação de idempotência na confirmação de importação (`POST /api/obras/importacoes`): reenviar o mesmo arquivo cria uma nova instância de `Obra` com um novo UUID.
