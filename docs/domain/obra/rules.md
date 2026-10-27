# Regras de Negócio — Gestão de Obras, EAP e Cronograma (`OBR`)

## RN-OBR-001 — Hierarquia de Agregação e Cálculo de Pesos da EAP

- **Classificação:** `Invariante de Domínio`
- **Consumidores (Casos de Uso):** [UC-OBR-001](../../use-cases/obra/UC-OBR-001-importar-planilha-orcamentaria/README.md), [UC-OBR-002](../../use-cases/obra/UC-OBR-002-visualizar-trilha-obra/README.md), [UC-OBR-007](../../use-cases/obra/UC-OBR-007-gerenciar-obras-etapas/README.md), [UC-OBR-008](../../use-cases/obra/UC-OBR-008-importar-eap-csv/README.md)
- **Referências:** `api/src/main/java/br/com/concordia/domain/obra/importacao/ImportacaoPlanilhaService.java` (`ImportacaoPlanilhaService.montar()`, `ImportacaoPlanilhaService.ancestral()`, `ImportacaoPlanilhaService.valorSemBdi()`, `ImportacaoPlanilhaService.No.somarTotal()`, `ImportacaoPlanilhaService.No.calcularPeso()`), `api/src/main/java/br/com/concordia/domain/obra/ObraService.java` (`ObraService.contexto()`, `ObraService.toEtapaOutput()`), `api/src/test/java/br/com/concordia/domain/obra/importacao/ImportacaoPlanilhaServiceTest.java` (`ImportacaoPlanilhaServiceTest.resumeArvoreCustosEPesos()`), `api/src/test/java/br/com/concordia/domain/obra/dependencia/DependenciaEtapaServiceTest.java` (`DependenciaEtapaServiceTest.calculaPesoPercentualDaEtapa()`)

### Enunciado
Quando itens e seções da EAP são montados na importação de planilha ou listados na consulta de etapas da obra, o sistema:
1. Vincula cada seção ou item de serviço ao ancestral mais próximo cujo `codigoEap` seja prefixo hierárquico separado por ponto (ex.: `1.1.1` busca `1.1` e, na ausência deste, `1`).
2. Calcula o `valorTotal` de cada seção (macroetapa ou subetapa) pela soma recursiva do `valorTotal` de seus filhos (`No.somarTotal()`).
3. Calcula o `valorTotalSemBdi` global somando, para cada item de serviço, `valorUnitarioBase * quantidade` (quando ambos existem) ou dividindo o `valorTotal` por `1 + (percentualBdi / 100)` com escala de 6 casas na razão e 2 casas (`HALF_UP`) no resultado (`ImportacaoPlanilhaService.valorSemBdi()`).
4. Calcula o `pesoPercentual` de cada nó ou etapa pela fórmula `(valorTotal * 100) / totalOrcadoObra` com precisão de 4 casas decimais e arredondamento `RoundingMode.HALF_UP`.

### Exceções e Limites
- Se o valor total orçado da obra for `0` ou se o `valorTotalOrcado` do item for `null`, o `pesoPercentual` atribuído é `0`.
- Quando um item de serviço na planilha Excel não possui nenhuma seção ancestral correspondente, ele é posicionado na raiz da EAP e gera um aviso não bloqueante (`"Item <codigo> (linha <N>) não pertence a nenhuma macroetapa da planilha."`).
- Se o `percentualBdi` não for informado na planilha e o item não possuir `valorUnitarioBase`, o `valorSemBdi` do item assume o próprio `valorTotal` e é emitido aviso não bloqueante.

### Exemplos Concretos
- **Exemplo válido:** Obra com seção `1` (contendo itens `1.1.1` de `R$ 100,00` e `1.1.2` de `R$ 200,00`) e seção `2` (contendo item `2.1` de `R$ 700,00`) e BDI de `25%` -> custo total com BDI = `R$ 1.000,00`, custo total sem BDI = `R$ 800,00`, peso da seção `1` = `30%`, peso da seção `2` = `70%` e soma dos pesos das raízes = `100,00%`.
- **Exemplo inválido / borda:** Etapa com `valorTotalOrcado = null` em obra com orçamento zero -> `pesoPercentual` resulta em `0` sem divisão por zero.

---

## RN-OBR-002 — Regras de Liberação e Bloqueio de Etapas por Dependência

- **Classificação:** `Invariante de Domínio`
- **Consumidores (Casos de Uso):** [UC-OBR-002](../../use-cases/obra/UC-OBR-002-visualizar-trilha-obra/README.md), [UC-OBR-003](../../use-cases/obra/UC-OBR-003-registrar-medicao-etapa/README.md), [UC-OBR-004](../../use-cases/obra/UC-OBR-004-analisar-atraso-sugerir-adiantamento/README.md), [UC-OBR-006](../../use-cases/obra/UC-OBR-006-configurar-dependencias-construtivas/README.md)
- **Referências:** `api/src/main/java/br/com/concordia/domain/obra/dependencia/RegraLiberacao.java` (`RegraLiberacao.satisfeita()`), `api/src/main/java/br/com/concordia/domain/obra/ObraService.java` (`ObraService.registrarMedicao()`, `ObraService.ContextoEtapas.predecessorasPendentes()`), `api/src/test/java/br/com/concordia/domain/obra/dependencia/DependenciaEtapaServiceTest.java` (`DependenciaEtapaServiceTest.bloqueiaSucessoraAteAPredecessoraConcluir()`, `DependenciaEtapaServiceTest.inicioInicioLiberaQuandoAPredecessoraComeca()`, `DependenciaEtapaServiceTest.vinculoNaoObrigatorioNaoBloqueia()`, `DependenciaEtapaServiceTest.recusaMedicaoDeEtapaBloqueada()`), `api/src/test/java/br/com/concordia/domain/obra/dependencia/GrafoDependenciasTest.java` (`GrafoDependenciasTest.regraDeLiberacaoPorTipo()`)

### Enunciado
Quando o sistema avalia se uma etapa está liberada ou bloqueada na trilha (`bloqueada`) ou valida o registro de uma medição de progresso, cada vínculo de precedência em que a etapa figura como sucessora é verificado segundo seu `TipoDependencia` e o `percentualAtual()` da etapa predecessora (`RegraLiberacao.satisfeita()`):
- **`FI` (Fim-Início):** Satisfeita somente quando `percentualPredecessora >= 100`.
- **`II` (Início-Início):** Satisfeita quando `percentualPredecessora > 0`.
- **`FF` (Fim-Fim):** Sempre considerada satisfeita (`true`) para fins de liberação de início da sucessora.

Uma etapa é marcada com `bloqueada = true` enquanto possuir ao menos uma dependência com `obrigatoria = true` não satisfeita. Tentativas de registrar medição com `percentualExecutado > 0` em etapa bloqueada são recusadas com `ConflitoException` (HTTP `409 Conflict`), listando os códigos EAP (ou descrições) das predecessoras pendentes.

### Exceções e Limites
- Vínculos configurados com `obrigatoria = false` não bloqueiam a etapa sucessora mesmo quando ainda não satisfeitos.
- Registrar medição com `percentualExecutado == 0` (por exemplo, para apontar observação ou atraso sem avanço físico) é permitido mesmo se a etapa tiver predecessoras pendentes (`request.percentualExecutado().signum() > 0` em `ObraService.registrarMedicao()`).

### Exemplos Concretos
- **Exemplo válido:** Etapa `4.1 ALVENARIA` tem vínculo `II` obrigatório com `5.1 DRENAGEM EXTERNA`. Quando `4.1` registra `10%` de execução, o vínculo `II` torna-se satisfeito e `5.1` passa a `bloqueada = false`.
- **Exemplo inválido / borda:** Etapa `3.1 SUPERESTRUTURA` depende de `2.1 FUNDAÇÃO` via vínculo `FI` obrigatório e `2.1` está em `99,9%`. Tentar medir `30%` em `3.1` lança `ConflitoException` com a mensagem `"Etapa bloqueada: aguarda 2.1. Conclua as predecessoras ou ajuste as dependências antes de medir."`.

---

## RN-OBR-003 — Elegibilidade e Priorização de Etapas para Adiantamento

- **Classificação:** `Política de Produto`
- **Consumidores (Casos de Uso):** [UC-OBR-004](../../use-cases/obra/UC-OBR-004-analisar-atraso-sugerir-adiantamento/README.md), [UC-OBR-005](../../use-cases/obra/UC-OBR-005-reordenar-etapa-adiantada/README.md)
- **Referências:** `api/src/main/java/br/com/concordia/domain/obra/SugestaoAdiantamentoService.java` (`SugestaoAdiantamentoService.analisarAtraso()`, `SugestaoAdiantamentoService.filtrarEtapasDisponiveisParaAdiantamento()`, `SugestaoAdiantamentoService.sugerirLocalmente()`, `SugestaoAdiantamentoService.correlacionarSugestoesComEtapas()`), `api/src/test/java/br/com/concordia/domain/obra/SugestaoAdiantamentoServiceTest.java` (`SugestaoAdiantamentoServiceTest.deveSelecionarNoMaximoTresCandidatasPorOrcamentoQuandoIaIndisponivel()`, `SugestaoAdiantamentoServiceTest.deveExcluirDependentesDiretasIndiretasEBloqueadasDaSelecaoLocal()`)

### Enunciado
Quando um atraso é analisado para uma etapa da obra, o sistema filtra as etapas candidatas a adiantamento exigindo simultaneamente que cada candidata:
1. Não seja a própria etapa atrasada.
2. Ainda não tenha sido iniciada (`etapa.percentualAtual().signum() == 0`).
3. Não dependa direta nem indiretamente da etapa atrasada no grafo de dependências (`!grafo.descendentes(idAtrasada).contains(idCandidata)`).
4. Não esteja bloqueada por nenhuma predecessora obrigatória pendente (`!bloqueadas.contains(idCandidata)`, conforme [RN-OBR-002](#rn-obr-002--regras-de-liberacao-e-bloqueio-de-etapas-por-dependencia)).

As candidatas elegíveis são enviadas ao provedor de IA (`IaReprogramacaoClient`). Qualquer sugestão retornada pela IA cujo `etapaId` não pertença ao conjunto de candidatas elegíveis é descartada. Caso o provedor de IA não esteja configurado ou retorne indisponibilidade (`!respostaIa.disponivel()`), o sistema aplica o cálculo determinístico local (`sugerirLocalmente`), ordenando as candidatas elegíveis por maior `valorTotalOrcado` decrescente (com desempate por menor `posicao` na EAP) e selecionando no máximo 3 etapas.

### Exceções e Limites
- Se a obra não possuir nenhuma etapa cadastrada, a análise é recusada com `IllegalArgumentException` (HTTP `400`).
- Se o `etapaId` informado não corresponder a nenhuma etapa da obra, o sistema utiliza a primeira etapa ordenada por posição como referência (`SugestaoAdiantamentoService.identificarEtapaAtrasada()`).
- Se não restar nenhuma etapa candidata após a filtragem, o sistema não chama a IA e retorna lista vazia com a mensagem `"A obra não possui outras etapas disponíveis no cronograma para adiantamento."`.
- Se a IA estiver disponível e retornar explicitamente lista vazia de sugestões (`disponivel = true`), o sistema respeita o parecer técnico da IA e **não** aciona o fallback local.

### Exemplos Concretos
- **Exemplo válido:** Obra com etapa `Atrasada` (`R$ 10`), `Direta` (depende de `Atrasada`), `Indireta` (depende de `Direta`), `Iniciada` (`10%` medido), `Menor` (`R$ 20`, livre), `Terceira` (`R$ 70`, livre), `Segunda` (`R$ 80`, livre) e `Maior` (`R$ 90`, livre). Com IA indisponível, o sistema retorna exatamente `[Maior, Segunda, Terceira]`.
- **Exemplo inválido / borda:** Obra em que a IA analisa as candidatas e conclui que não há viabilidade física segura (`sugestoes = []`, `disponivel = true`) -> o sistema retorna `sugestoes = []` com o parecer da IA, sem inventar recomendações locais.

---

## RN-OBR-004 — Integridade Acíclica e Unicidade do Grafo de Dependências

- **Classificação:** `Invariante de Domínio`
- **Consumidores (Casos de Uso):** [UC-OBR-006](../../use-cases/obra/UC-OBR-006-configurar-dependencias-construtivas/README.md), [UC-OBR-004](../../use-cases/obra/UC-OBR-004-analisar-atraso-sugerir-adiantamento/README.md)
- **Referências:** `api/src/main/java/br/com/concordia/domain/obra/dependencia/DependenciaEtapaService.java` (`DependenciaEtapaService.criar()`, `DependenciaEtapaService.desfasamento()`), `api/src/main/java/br/com/concordia/domain/obra/dependencia/GrafoDependencias.java` (`GrafoDependencias.cicloAoAdicionar()`, `GrafoDependencias.caminho()`), `api/src/main/resources/db/migration/V3__dependencias_etapa.sql`, `api/src/test/java/br/com/concordia/domain/obra/dependencia/DependenciaEtapaServiceTest.java` (`DependenciaEtapaServiceTest.recusaCicloInformandoOCaminho()`, `DependenciaEtapaServiceTest.recusaVinculoDuplicadoEAutoDependencia()`, `DependenciaEtapaServiceTest.recusaDesfasamentoForaDoLimite()`)

### Enunciado
Ao criar ou atualizar um vínculo de precedência entre duas etapas da mesma obra, o sistema garante que:
1. Ambas as etapas (`predecessora` e `sucessora`) pertençam à obra informada.
2. Uma etapa nunca dependa de si mesma (`predecessora != sucessora`).
3. Não exista mais de um vínculo direcionado com o mesmo par `(predecessora, sucessora)`.
4. A inclusão da aresta `predecessora → sucessora` não forme ciclo direto ou indireto no grafo dirigido da EAP (`GrafoDependencias.cicloAoAdicionar()`), verificado por busca em largura (BFS) a partir de `sucessora` até `predecessora`.
5. O `desfasamentoDias` esteja compreendido no intervalo fechado `[-365, 365]`.

### Exceções e Limites
- Quando `tipo` não é informado na criação, assume o padrão `TipoDependencia.FI`.
- Quando `desfasamentoDias` não é informado na criação, assume `0`.
- Quando `obrigatoria` não é informada na criação, assume `true`.
- Caso um ciclo seja detectado, o sistema lança `ConflitoException` (HTTP `409`) informando o menor caminho do ciclo formatado com os códigos EAP (ou nomes) separados por ` → ` (ex.: `4.1 → 2.1 → 3.1 → 4.1`).

### Exemplos Concretos
- **Exemplo válido:** Existindo `2.1 → 3.1` e `2.1 → 4.1`, adicionar `3.1 → 4.1` é aceito porque constitui caminhos paralelos convergentes sem ciclo (DAG válido).
- **Exemplo inválido / borda:** Existindo `2.1 → 3.1` e `3.1 → 4.1`, tentar criar `4.1 → 2.1` é recusado com `ConflitoException`: `"Vínculo recusado: criaria um ciclo na EAP (4.1 → 2.1 → 3.1 → 4.1). Uma etapa não pode depender, direta ou indiretamente, de si mesma."`.

---

## RN-OBR-005 — Posicionamento Fracionário na Reordenação da Trilha

- **Classificação:** `Política de Produto`
- **Consumidores (Casos de Uso):** [UC-OBR-005](../../use-cases/obra/UC-OBR-005-reordenar-etapa-adiantada/README.md), [UC-OBR-002](../../use-cases/obra/UC-OBR-002-visualizar-trilha-obra/README.md)
- **Referências:** `api/src/main/java/br/com/concordia/domain/obra/ObraService.java` (`ObraService.reordenarEtapaLogoApos()`), `api/src/main/java/br/com/concordia/domain/obra/entities/ItemEap.java` (`ItemEap.moverParaLogoApos()`), `api/src/test/java/br/com/concordia/domain/obra/ObraServiceReordenacaoTest.java` (`ObraServiceReordenacaoTest.deveReordenarEtapaParaFicarLogoAposEtapaAtrasada()`)

### Enunciado
Quando uma etapa adiantada é reposicionada para ficar logo após uma etapa atrasada, o sistema calcula sua nova `posicao` na EAP como a média aritmética `(posAtrasado + proximaPosicao) / 2.0` entre a posição da etapa atrasada e a posição da etapa imediatamente seguinte na ordenação atual, atualizando também o nó pai (`pai`) e o caminho de `macroetapa` da etapa adiantada para os mesmos valores da etapa atrasada (`ItemEap.moverParaLogoApos()`).

### Exceções e Limites
- Se a etapa atrasada for a última da lista ordenada, `proximaPosicao` assume `posAtrasado + 1000.0`.
- Se a etapa adiantada já for a etapa imediatamente seguinte à etapa atrasada (`idxAtrasado + 1`), `proximaPosicao` usa a posição do elemento `idxAtrasado + 2` (ou `posAtrasado + 1000.0` se não houver).
- Se `etapaAtrasada` e `etapaAdiantada` representarem o mesmo item, nenhuma alteração de posição é realizada.

### Exemplos Concretos
- **Exemplo válido:** Etapas `1.1 Demolição` (`posicao = 1000.0`), `1.2 Alvenaria` (`posicao = 2000.0`) e `1.3 Pintura` (`posicao = 3000.0`). Ao adiantar `Pintura` para logo após `Demolição`, `Pintura` recebe `posicao = 1500.0` e a listagem ordenada passa a `[Demolição, Pintura, Alvenaria]`.
- **Exemplo inválido / borda:** Informar um `etapaAdiantadaId` inexistente na obra lança `EntityNotFoundException` (HTTP `404`) sem alterar posições.
