# Regras de Negócio — Cadastro de Empresas (`EMP`)

## RN-EMP-001 — Cadastro e Unicidade de CNPJ de Empresa

- **Classificação:** `Invariante de Domínio`
- **Consumidores (Casos de Uso):** [UC-EMP-001](../../use-cases/empresa/UC-EMP-001-gerenciar-empresas/README.md), [UC-OBR-001](../../use-cases/obra/UC-OBR-001-importar-planilha-orcamentaria/README.md), [UC-OBR-007](../../use-cases/obra/UC-OBR-007-gerenciar-obras-etapas/README.md)
- **Referências:** `api/src/main/java/br/com/concordia/domain/empresa/entities/Empresa.java`, `api/src/main/java/br/com/concordia/domain/empresa/EmpresaService.java`, `api/src/main/java/br/com/concordia/infrastructure/empresa/dtos/EmpresaRequest.java`, `api/src/main/java/br/com/concordia/infrastructure/empresa/dtos/EmpresaParcialRequest.java`

### Enunciado
Quando uma empresa é criada ou atualizada, o sistema valida que `nome`, `cnpj` e `razaoSocial` não estejam em branco (na criação e atualização integral) e que o `cnpj` seja um número de Cadastro Nacional da Pessoa Jurídica válido segundo o dígito verificador (`@CNPJ`), mantendo unicidade na coluna `empresa.cnpj`.

### Exceções e Limites
- Na atualização parcial (`PATCH /api/empresas/{id}`), apenas os campos não nulos enviados no payload são atualizados, mas caso `cnpj` seja informado, ele deve ser válido segundo `@CNPJ`.
- Quando uma obra referencia um `idEmpresa` no cadastro ou na importação de planilha, a empresa deve existir previamente no banco; caso contrário, o sistema lança `EntityNotFoundException` (HTTP `404 Not Found`).

### Exemplos Concretos
- **Exemplo válido:** Enviar `POST /api/empresas` com `nome = "Construtora Horizonte"`, `cnpj = "11.222.333/0001-81"` e `razaoSocial = "Construtora Horizonte LTDA"` -> cria a empresa e retorna HTTP `201 Created`.
- **Exemplo inválido / borda:** Enviar `POST /api/empresas` com `cnpj = "11.111.111/1111-11"` -> recusado pela validação de entrada com HTTP `400 Bad Request` (`invalidFields` indicando o campo `cnpj`).
