# Guia de CRUD — Casos de Uso e Cenários

Leia este arquivo sempre que precisar **Criar, Ler, Atualizar ou Remover** a documentação de um caso de uso implementado em `docs/use-cases/`.

## 1. Regras de Modelagem

1. **Pasta Dedicada por Caso de Uso:**
   Todo caso de uso vive em `docs/use-cases/<area>/UC-<AREA>-<NNN>-<slug>/` e possui obrigatoriamente um arquivo `README.md`.
2. **Linguagem de Produto e Domínio:**
   O `README.md` do caso descreve o comportamento observável. **Não** inclua nomes de classes, tabelas, queries SQL, componentes de UI ou detalhes de frameworks no fluxo principal (esses detalhes pertencem ao `implementation.md`).
3. **Atores Humanos e Não-Humanos:**
   Fluxos disparados por mensageria, *webhooks* ou *cron jobs* também são casos de uso. Identifique o evento/sistema iniciador sem inventar uma tela ou interação humana.
4. **Numeração de Cenários (`C<NN>`):**
   - O Fluxo Principal recebe sempre o código `UC-<AREA>-<NNN>-C01`.
   - Seu cabeçalho começa pelo ID: `## UC-<AREA>-<NNN>-C01 — Fluxo Principal`. Cenários alternativos podem ser linhas de tabela com o ID completo na primeira coluna.
   - Alternativas de negócio e falhas relevantes recebem `C02`, `C03`, etc.
   - Diferencie **resultados normais do domínio** (ex.: saldo insuficiente, resposta incorreta em avaliação) de **falhas técnicas** (ex.: timeout de integração, falha de persistência).
5. **Descoberta de Borda (Checklist de Análise):**
   Ao documentar um caso, confira o comportamento existente para: (a) entradas inválidas/limites, (b) falta de permissão, (c) repetição da chamada, (d) concorrência, (e) alteração de registro em estado final e (f) falha parcial assíncrona. Descreva apenas o tratamento implementado. Falta de proteção comprovada é uma limitação conhecida, não uma garantia a inventar; melhorias desejadas vão para uma spec ou issue.
6. **Escopo Implementado:**
   Inclua apenas fluxos e cenários existentes. Se parte da funcionalidade ainda não foi entregue, mantenha essa parte na spec. Não use campos de planejamento, aprovação ou verificação documental.

## 2. Operações de CRUD

- **CREATE:**
  1. Confirme a implementação do fluxo. Verifique a sigla da área em `docs/README.md` e o próximo ID disponível no catálogo, incluindo o registro de IDs retirados.
  2. Crie a pasta `docs/use-cases/<area>/UC-<AREA>-<NNN>-<slug>/` e o arquivo `README.md` seguindo exatamente o padrão da Seção 3 abaixo.
  3. Adicione a linha correspondente na tabela de `docs/use-cases/README.md`.
- **UPDATE:**
  1. Atualize passos, precondições, garantias e cenários conforme a implementação efetivamente entregue.
  2. Atualize as regras locais, compartilhadas e a implementação quando afetadas. Crie `business-rules.md` ou `implementation.md` somente quando os critérios dos respectivos guias forem atendidos.
  3. Confira referências ao código, contratos e testes existentes, sem acrescentar cenários futuros.
- **DELETE:**
  1. Nunca reutilize o ID de um caso removido.
  2. Retire o caso e os links correspondentes da documentação atual. Reserve seu ID na seção `IDs Retirados` do catálogo, indicando o motivo e o substituto, se houver. Preserve o conteúdo anterior no histórico do Git.

---

Inclua apenas links para documentos e testes existentes. Omita referências que não se apliquem. Se não houver teste automatizado para um cenário implementado, informe essa lacuna como fato, sem inventar nomes ou cadastrar testes futuros. As seções abaixo são obrigatórias; mantenha o fluxo principal identificado pelo seu ID.

## 3. Estrutura Padrão Obrigatória (`README.md` do Caso de Uso)

```markdown
# UC-<AREA>-<NNN> — <Título com Verbo no Infinitivo>

- **Documentos do Caso:** <Links para business-rules.md e implementation.md somente se existirem>.

## 1. Objetivo e Limites

- **Resultado entregue:** <Valor observável entregue ao final do caso>.
- **Início:** <Evento ou ação exata que inicia o fluxo>.
- **Término:** <Condição que encerra este caso>.
- **Escopo incluído:** <O que faz parte deste caso>.
- **Fora do escopo (Limites):** <O que não faz parte e qual outro UC trata, se aplicável>.

## 2. Ator, Gatilho e Precondições

- **Ator / Iniciador:** <Usuário, sistema externo, evento ou agendamento>.
- **Gatilho:** <Ação ou estímulo inicial>.
- **Permissões exigidas:** <Perfis ou políticas de autorização>.
- **Precondições e Estado Inicial:** <Condições obrigatórias antes da execução>.

## 3. Resultados e Garantias de Estado

- **Efeitos de sucesso:** <Mudanças de estado, registros criados, eventos disparados>.
- **Garantias em caso de falha:** <O que é revertido/preservado e se há efeitos parciais conhecidos>.

## UC-<AREA>-<NNN>-C01 — Fluxo Principal

1. O <iniciador> solicita <ação> informando <dados de entrada>.
2. O sistema valida <condição> aplicando [RN-<ID> — <Título>](<link>).
3. O sistema executa <processamento de domínio> e atualiza o estado para `<Estado>`.
4. O sistema retorna <resposta/resultado> ao iniciador.

## 5. Cenários Alternativos e de Falha

| ID | Origem | Condição | Comportamento do Sistema | Estado Final e Garantias | Continuidade | Regras | Testes Existentes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `UC-<AREA>-<NNN>-C02` | Passo 2 | <Condição tratada no código> | <Resposta implementada> | <Garantia efetiva> | Encerra / Retoma no passo X | [RN-<ID>](<link>) | <Caminho e símbolo do teste, ou Sem teste automatizado localizado> |
| `UC-<AREA>-<NNN>-C03` | Passo 3 | <Falha técnica tratada> | <Resposta implementada> | <Garantia efetiva> | Encerra | — | <Caminho e símbolo do teste, ou Sem teste automatizado localizado> |

## 6. Referências

- **Regras de Negócio:**
  - [RN-<ID> — <Título>](<caminho-relativo>)
- **Contratos / APIs:** [<Nome do Contrato>](../../../technical/api/<arquivo>.md)
- **ADRs Relacionados:** [ADR-<NNN> — <Título>](../../../technical/adr/ADR-<NNN>-<slug>.md)
- **Casos Relacionados:** [UC-<AREA>-<NNN> — <Título>](<caminho-relativo>)

## 7. Limitações Conhecidas

- <Restrição ou comportamento limitado comprovado na implementação, com referência ao código ou teste>.
- <Se não houver limitações identificadas, registrar esse resultado sem inventar uma restrição>.
```
