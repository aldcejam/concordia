# Guia de CRUD — Regras de Negócio e Vocabulário do Domínio

Leia este arquivo sempre que precisar **Criar, Ler, Atualizar, Promover ou Remover** uma Regra de Negócio (`RN`) ou um termo do Vocabulário (`ubiquitous-language.md`).

Documente somente regras efetivamente aplicadas pelo sistema e termos usados pelo domínio implementado. Regras desejadas e definições para funcionalidades futuras pertencem a specs, fora de `docs/`.

## 1. Onde Localizar e Como Numerar Regras (Prevenção de Colisão)

1. **Regra Exclusiva de um Único Caso de Uso:**
   - **Local:** `docs/use-cases/<area>/UC-<AREA>-<NNN>-<slug>/business-rules.md`
   - **Formato do ID:** `RN-<AREA>-<UC_NNN>-<NN>` (ex.: `RN-BIB-001-01`, `RN-BIB-001-02`).
   - *Nota:* Não crie `business-rules.md` se o caso usar apenas regras compartilhadas de domínio.
2. **Regra Compartilhada (Usada por mais de um caso ou central ao domínio):**
   - **Local:** `docs/domain/<domain>/rules.md`
   - **Formato do ID:** `RN-<AREA>-<NNN>` (ex.: `RN-BIB-001`, `RN-BIB-002`).
3. **Promoção de Regra Exclusiva para Compartilhada:**
   - Quando uma regra local (`RN-BIB-001-01`) passar a ser consumida por outro caso de uso, mova sua definição completa para `docs/domain/<domain>/rules.md` **mantendo seu ID original (`RN-BIB-001-01`)** para não quebrar links no código e nos testes.
   - No `business-rules.md` original, preserve o cabeçalho e substitua o conteúdo por `**Definição movida:**` seguido de um link para a definição no novo local. Isso preserva a âncora antiga e mantém uma única definição da regra.
   - Atualize os links dos consumidores e sua lista na regra. O ID preservado é uma exceção explícita ao formato de novas regras compartilhadas; não o renumere.

## 2. Diretrizes de Escrita

- **Cabeçalho Determinístico:** Sempre inicie a regra com `## RN-<ID> — <Título>`. Nunca use tags HTML `<a id="...">` soltas acima do título.
- **Linguagem de Domínio:** Evite nomes de tabelas, métodos ou bibliotecas no enunciado da regra, exceto quando fizerem parte intrínseca do requisito.
- **Origem da Restrição:** Classifique explicitamente se a regra é uma `Política de Produto`, uma `Invariante de Domínio` ou uma `Limitação Técnica`.
- **Análise de Impacto no UPDATE/DELETE:** Busque o ID completo em `docs/` e nos diretórios existentes de código e testes indicados no mapa documental. Por exemplo: `rg -n -F 'RN-BIB-001' docs/`. Confira o ID completo, pois a busca também encontra IDs com o mesmo prefixo.
- **Correspondência com a Implementação:** Confira condições, cálculos, exceções e limites no código e nos testes. Registre referências existentes na explicação, sem campos de aprovação ou verificação documental. Um defeito comprovado pertence às limitações conhecidas do fluxo; não o transforme em política de produto.
- **Remoção:** Quando a regra deixar de ser aplicada, atualize seus consumidores e retire sua definição da documentação atual. Registre seu ID na seção `IDs Retirados` do arquivo de regras de origem, com o motivo e a substituta, se houver. Preserve o conteúdo anterior no Git e não reutilize o ID.

---

## 3. Estrutura Padrão de Regra de Negócio (`business-rules.md` ou `domain/<domain>/rules.md`)

```markdown
# Regras de Negócio — <Nome do Domínio ou Caso de Uso>

## RN-<ID> — <Título da Regra Implementada>

- **Classificação:** `Política de Produto` | `Invariante de Domínio` | `Limitação Técnica`
- **Consumidores (Casos de Uso):** [UC-<AREA>-<NNN>](<link>)
- **Referências:** <Arquivos e símbolos do código, testes ou contratos que aplicam a regra>.

### Enunciado
Quando <condição de aplicação>, o sistema <comportamento, cálculo ou restrição efetivamente aplicado>.

### Exceções e Limites
- <Condição de contorno ou exceção 1>.
- <Condição de contorno ou exceção 2>.

### Exemplos Concretos
- **Exemplo válido:** <Estado inicial + entrada -> resultado esperado>.
- **Exemplo inválido / borda:** <Estado inicial + entrada -> bloqueio ou comportamento esperado>.
```

---

## 4. Estrutura Padrão de Vocabulário (`docs/domain/ubiquitous-language.md`)

Registre termos usados no domínio implementado, suas distinções semânticas e a equivalência com os símbolos existentes no código-fonte. Termos de uma funcionalidade futura ficam na spec. Quando um conceito não possuir um símbolo próprio, explique sua representação real no sistema.

```markdown
# Vocabulário do Domínio (Ubiquitous Language)

| Termo de Negócio | Representação no Código | Domínio (`<SIGLA>`) | Definição e Distinções | Referências |
| --- | --- | --- | --- | --- |
| <Termo em PT> | `<Símbolo existente ou representação implementada>` | `<SIGLA>` | <Significado usado pelo sistema e distinções>. | <Arquivo, símbolo ou regra correspondente> |
```
