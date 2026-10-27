# UC-OBR-007 — Gerenciar Cadastro de Obras e Etapas da EAP

- **Documentos do Caso:** [Implementação Técnica](./implementation.md)

## 1. Objetivo e Limites

- **Resultado entregue:** O gestor ou script de automação cria, consulta, lista, atualiza (integral ou parcialmente) e exclui obras, além de criar etapas individualmente na EAP de uma obra e atualizar os dados orçamentários de etapas existentes.
- **Início:** Envio de requisição aos endpoints de cadastro de obras (`/api/obras`) ou de gestão individual de etapas (`/api/obras/{id}/etapas`).
- **Término:** O registro da obra ou da etapa é criado, retornado, atualizado ou excluído conforme solicitado.
- **Escopo incluído:** CRUD completo de `Obra` (com descrição, UF, fuso horário e empresa contratada opcional), criação individual de `EtapaObra` vinculada a um `ItemEap` (com nó pai opcional e dados de orçamento) e atualização dos dados orçamentários de uma etapa (`PATCH /api/obras/{id}/etapas/{etapaId}/orcamento`).
- **Fora do escopo (Limites):** Importação em lote de planilhas Excel (tratada em [UC-OBR-001](../UC-OBR-001-importar-planilha-orcamentaria/README.md)), importação de EAP via arquivo CSV (tratada em [UC-OBR-008](../UC-OBR-008-importar-eap-csv/README.md)) e registro de medições físicas (tratado em [UC-OBR-003](../UC-OBR-003-registrar-medicao-etapa/README.md)).

## 2. Ator, Gatilho e Precondições

- **Ator / Iniciador:** Engenheiro / Gestor de Obras ou Operador / Script CLI.
- **Gatilho:** Chamada HTTP aos endpoints `/api/obras` ou `/api/obras/{id}/etapas`.
- **Permissões exigidas:** Acesso liberado sem autenticação obrigatória na configuração atual do sistema.
- **Precondições e Estado Inicial:** Caso uma empresa contratada (`idEmpresa`) seja informada na criação ou atualização da obra, a empresa deve existir previamente; caso um item pai (`idItemPai`) seja informado ao criar uma etapa, esse item deve pertencer à EAP da obra.

## 3. Resultados e Garantias de Estado

- **Efeitos de sucesso:** A obra é persistida em estado inicial `EM_PLANEJAMENTO`, atualizada ou removida; na criação de etapa, tanto a `EtapaObra` quanto seu respectivo `ItemEap` com metadados orçamentários são gravados e retornados com o peso percentual recalculado na obra.
- **Garantias em caso de falha:** Se a obra, a empresa contratada, o item pai da EAP ou a etapa alvo não forem encontrados, ou se os parâmetros obrigatórios forem inválidos, a transação é abortada sem alterações parciais.

## UC-OBR-007-C01 — Fluxo Principal

1. O iniciador solicita a criação de uma obra informando descrição, unidade federativa, fuso horário e, opcionalmente, o identificador da empresa contratada.
2. O sistema valida o fuso horário e a existência da empresa (quando informada), cria a obra em estado de planejamento e retorna os dados da obra criada (`201 Created`).
3. O iniciador solicita a criação de uma etapa na obra informando nome, descrição, data de início, prazo esperado em dias, posição na EAP, item pai opcional e os atributos orçamentários do serviço (código EAP, banco, código/tipo de composição, macroetapa, unidade, quantidade, valor unitário, BDI e valor total).
4. O sistema valida a obra e o item pai na EAP, cria a etapa e seu nó na EAP e retorna os dados da etapa com o peso percentual calculado conforme [RN-OBR-001 — Hierarquia de Agregação e Cálculo de Pesos da EAP](../../../domain/obra/rules.md#rn-obr-001--hierarquia-de-agregacao-e-calculo-de-pesos-da-eap).
5. Quando necessário, o iniciador atualiza os dados orçamentários da etapa (`PATCH /api/obras/{id}/etapas/{etapaId}/orcamento`), consultar ou listar obras e etapas, atualizar dados cadastrais da obra (`PUT` / `PATCH`) ou excluir a obra (`DELETE`).

## 5. Cenários Alternativos e de Falha

| ID | Origem | Condição | Comportamento do Sistema | Estado Final e Garantias | Continuidade | Regras | Testes Existentes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `UC-OBR-007-C02` | Passo 1 / Passo 5 | O identificador de empresa contratada informado não existe no banco de dados | O sistema interrompe a operação e retorna erro de recurso não encontrado (HTTP 404) | Obra não é criada nem alterada | Encerra | [RN-EMP-001](../../../domain/empresa/rules.md#rn-emp-001--cadastro-e-unicidade-de-cnpj-de-empresa) | Sem teste unitário dedicado exclusivamente para empresa inexistente em `ObraService.criar` |
| `UC-OBR-007-C03` | Passo 3 / Passo 5 | A obra, a etapa ou o `idItemPai` informado não existe na obra | O sistema retorna erro de recurso não encontrado (HTTP 404) | Nenhuma etapa é criada ou modificada | Encerra | — | Sem teste unitário dedicado exclusivamente para `idItemPai` inexistente |
| `UC-OBR-007-C04` | Passo 1 / Passo 3 | Campos obrigatórios ausentes, fuso horário inválido ou valores numéricos negativos no payload | O sistema rejeita a requisição com erro de validação (HTTP 400) | Nenhuma alteração no banco | Encerra | — | Sem teste de integração de controller específico para `ObraRequest` / `EtapaRequest` inválidos |

## 6. Referências

- **Regras de Negócio:**
  - [RN-OBR-001 — Hierarquia de Agregação e Cálculo de Pesos da EAP](../../../domain/obra/rules.md#rn-obr-001--hierarquia-de-agregacao-e-calculo-de-pesos-da-eap)
  - [RN-EMP-001 — Cadastro e Unicidade de CNPJ de Empresa](../../../domain/empresa/rules.md#rn-emp-001--cadastro-e-unicidade-de-cnpj-de-empresa)
- **Contratos / APIs:** [Contrato REST Concordia API](../../../technical/api/concordia-rest-api.md)
- **ADRs Relacionados:** [ADR-001 — Separação entre Domínio e Infraestrutura com Ports & Adapters](../../../technical/adr/ADR-001-separacao-dominio-infraestrutura-ports-adapters.md)
- **Casos Relacionados:** [UC-OBR-001 — Importar Planilha Orçamentária Excel](../UC-OBR-001-importar-planilha-orcamentaria/README.md), [UC-OBR-002 — Visualizar Trilha Gamificada e Etapas da Obra](../UC-OBR-002-visualizar-trilha-obra/README.md), [UC-EMP-001 — Gerenciar Cadastro de Empresas Contratadas](../../empresa/UC-EMP-001-gerenciar-empresas/README.md)

## 7. Limitações Conhecidas

- O endpoint `PATCH /api/obras/{id}/etapas/{etapaId}/orcamento` reutiliza o DTO `EtapaRequest` completo (`@Valid EtapaRequest`), exigindo que os campos obrigatórios de `EtapaRequest` (`nome`, `descricao`, `inicio`, `prazoEsperadoDias`) sejam enviados no payload mesmo que a operação atualize apenas os dados orçamentários do `ItemEap`.
