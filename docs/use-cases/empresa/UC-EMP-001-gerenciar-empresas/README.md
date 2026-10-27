# UC-EMP-001 — Gerenciar Cadastro de Empresas Contratadas

- **Documentos do Caso:** [Implementação Técnica](./implementation.md)

## 1. Objetivo e Limites

- **Resultado entregue:** O gestor cria, consulta, lista, atualiza (integral ou parcialmente) e remove empresas contratadas responsáveis pela execução das obras, garantindo a validação de CNPJ e razão social.
- **Início:** Envio de requisição aos endpoints de empresas (`/api/empresas`).
- **Término:** O registro da empresa é criado, consultado, listado, atualizado ou removido do sistema.
- **Escopo incluído:** Operações CRUD completas da entidade `Empresa` com validação algorítmica de CNPJ (`@CNPJ`), nome fantasia e razão social (`RN-EMP-001`).
- **Fora do escopo (Limites):** Associação de uma empresa a uma obra durante o cadastro ou importação da obra (tratada em [UC-OBR-001](../../obra/UC-OBR-001-importar-planilha-orcamentaria/README.md) e [UC-OBR-007](../../obra/UC-OBR-007-gerenciar-obras-etapas/README.md)).

## 2. Ator, Gatilho e Precondições

- **Ator / Iniciador:** Engenheiro / Gestor de Obras.
- **Gatilho:** Chamada HTTP aos endpoints `/api/empresas` ou carregamento do seletor de empresas na tela de importação de obra.
- **Permissões exigidas:** Acesso liberado sem autenticação obrigatória na configuração atual do sistema.
- **Precondições e Estado Inicial:** Para criação, o CNPJ informado deve ser válido e único; para consulta, atualização ou remoção, a empresa deve existir previamente no sistema.

## 3. Resultados e Garantias de Estado

- **Efeitos de sucesso:** A empresa é persistida na tabela `empresa` (`201 Created`), retornada (`200 OK`), atualizada (`200 OK`) ou excluída (`204 No Content`).
- **Garantias em caso de falha:** CNPJs inválidos, campos obrigatórios em branco ou identificadores inexistentes rejeitam a operação sem alterar os dados existentes.

## UC-EMP-001-C01 — Fluxo Principal

1. O gestor solicita o cadastro de uma empresa contratada informando nome, CNPJ e razão social.
2. O sistema valida o preenchimento obrigatório dos campos e o dígito verificador do CNPJ aplicando [RN-EMP-001 — Cadastro e Unicidade de CNPJ de Empresa](../../../domain/empresa/rules.md#rn-emp-001--cadastro-e-unicidade-de-cnpj-de-empresa).
3. O sistema persiste a empresa e retorna o registro criado (`201 Created`).
4. O gestor (ou a tela de importação de obra) pode listar todas as empresas cadastradas, consultar uma empresa por identificador, atualizar integral ou parcialmente seus dados (`PUT` / `PATCH`) ou removê-la (`DELETE`).

## 5. Cenários Alternativos e de Falha

| ID | Origem | Condição | Comportamento do Sistema | Estado Final e Garantias | Continuidade | Regras | Testes Existentes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `UC-EMP-001-C02` | Passo 2 | O CNPJ informado é inválido ou os campos obrigatórios (`nome`, `cnpj`, `razaoSocial`) estão em branco ou excedem o tamanho máximo | O sistema rejeita a requisição com erro de validação (HTTP 400) detalhando os campos inválidos | Nenhuma empresa é persistida | Encerra | [RN-EMP-001](../../../domain/empresa/rules.md#rn-emp-001--cadastro-e-unicidade-de-cnpj-de-empresa) | Sem teste automatizado dedicado exclusivamente para `EmpresaRequest` |
| `UC-EMP-001-C03` | Passo 4 | O identificador da empresa informado na consulta, atualização ou remoção não existe | O sistema retorna erro de recurso não encontrado (HTTP 404) | Nenhuma alteração no banco | Encerra | — | Sem teste automatizado dedicado exclusivamente para `EmpresaService` |

## 6. Referências

- **Regras de Negócio:**
  - [RN-EMP-001 — Cadastro e Unicidade de CNPJ de Empresa](../../../domain/empresa/rules.md#rn-emp-001--cadastro-e-unicidade-de-cnpj-de-empresa)
- **Contratos / APIs:** [Contrato REST Concordia API](../../../technical/api/concordia-rest-api.md)
- **Casos Relacionados:** [UC-OBR-001 — Importar Planilha Orçamentária Excel](../../obra/UC-OBR-001-importar-planilha-orcamentaria/README.md), [UC-OBR-007 — Gerenciar Cadastro de Obras e Etapas da EAP](../../obra/UC-OBR-007-gerenciar-obras-etapas/README.md)

## 7. Limitações Conhecidas

- Não há interface dedicada de gerenciamento de empresas no frontend (`web/`); atualmente o frontend consome apenas `GET /api/empresas` (`useListar3` em `web/src/pages/ImportarObraPage.tsx`) para popular o seletor opcional de empresa contratada durante a importação de planilha.
