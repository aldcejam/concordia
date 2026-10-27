# Guia de CRUD — Implementação Técnica, Guardrails e Diagramas

Leia este arquivo sempre que precisar **Criar, Ler ou Atualizar** o arquivo `implementation.md` de um caso de uso ou elaborar diagramas técnicos.

## 1. Quando Criar e Como Manter o `implementation.md`

1. **Critério de Existência:** Crie `docs/use-cases/<area>/UC-.../implementation.md` para um caso já implementado que envolva orquestração entre camadas, transações relevantes, eventos/filas, integrações externas ou **guardrails técnicos específicos**. Para casos triviais, uma seção curta de referências técnicas no final do `README.md` do caso é suficiente.
2. **Referencie Símbolos, Nunca Números de Linha:** Aponte sempre para `caminho/do/arquivo` + `Classe.metodo()` ou `funcao()`. Números de linha quebram a cada refatoração.
3. **Zero Transcrição de Código:** Não copie blocos de código da aplicação para o Markdown. Descreva a responsabilidade de cada participante, os limites transacionais e os efeitos de estado.
4. **Guardrails Locais (O que NÃO fazer):** Esta é a seção mais importante para evitar regressões por agentes de IA e desenvolvedores. Registre restrições técnicas daquele fluxo que não são óbvias apenas lendo uma classe isolada (ex.: proibições de acoplamento, chamadas externas fora de `@Transactional`, exigência de chaves de idempotência).
5. **Somente Implementação Existente:** Confira arquivos, símbolos, contratos, transações e testes antes de descrevê-los. Desenhos ainda não aplicados ficam na spec. Omita participantes e mecanismos ausentes; não inclua campos de situação, referência verificada ou aprovação documental.

## 2. Regras para Diagramas (Mermaid)

Inclua diagramas apenas quando esclarecerem interações ou estados complexos:
- **Sequência (`sequenceDiagram`):** Mostre fronteiras entre aplicações, banco, mensageria e APIs externas. Omita *getters*, *mappers* triviais e *helpers* locais. Nunca represente efeitos assíncronos como se concluíssem sincronicamente dentro da requisição.
- **Estados (`stateDiagram-v2`):** Use quando o caso depender de máquina de estados, bloqueios ou retomadas, referenciando os códigos das `RN-*` nas transições.
- **Classes (`classDiagram`):** Identifique sempre como *Visão parcial das classes participantes deste caso de uso*, exibindo apenas atributos e relações pertinentes ao fluxo.

---

## 3. Estrutura Padrão Obrigatória (`implementation.md`)

```markdown
# Implementação Técnica — UC-<AREA>-<NNN> (<Título>)

## 1. Pontos de Entrada e Participantes

| Camada / Papel | Caminho do Arquivo | Símbolo Principal | Responsabilidade no Fluxo |
| --- | --- | --- | --- |
| Entrada (Controller/Consumer/UI) | `<caminho/arquivo>` | `<Simbolo>` | Recebe o estímulo e valida o contrato de entrada |
| Aplicação / Orquestração | `<caminho/arquivo>` | `<Simbolo>` | Coordena o fluxo, transação e chamadas de domínio |
| Domínio | `<caminho/arquivo>` | `<Simbolo>` | Aplica regras de negócio (`RN-...`) e invariantes |
| Persistência / Mensageria / Integração | `<caminho/arquivo>` | `<Simbolo>` | Persiste estado, publica eventos ou chama serviços externos |

## 2. Percurso Técnico, Transações e Eventos

1. **Entrada e Contrato:** <Validação de schema/DTO e autenticação/autorização aplicada>.
2. **Controle Transacional e Persistência:** <Onde a transação abre e fecha, locks aplicados e tabelas/coleções afetadas>.
3. **Eventos e Processamento Assíncrono:** <Eventos publicados, garantias de entrega (ex.: Outbox, DLQ) e consumidores>.
4. **Tratamento de Falhas e Retentativas:** <Exceções lançadas, códigos de retorno, timeouts e políticas de retry>.

## 3. Guardrails e Restrições Técnicas (O que NÃO fazer)

> Explique as restrições aplicadas neste fluxo, relacionando-as ao código, às regras e às decisões técnicas existentes. Melhorias desejadas e desenhos futuros ficam na spec.

- **Isolamento e Camadas:** <Ex.: Nunca invoque `XRepository` fora de `YService`>.
- **Transação e Performance:** <Ex.: Nunca execute chamada HTTP/S3 dentro da transação de banco de dados>.
- **Concorrência e Idempotência:** <Ex.: Garanta verificação de idempotência por `<chave>` antes de processar o evento>.
- **Armadilhas Conhecidas:** <Ex.: Não substitua a coleção inteira em atualizações parciais para não violar `RN-...`>.

## 4. Diagramas

*(Adicione blocos `mermaid` de sequência, estados ou classes somente se agregarem clareza ao texto acima).*

## 5. Rastreabilidade de Testes Automatizados

| Cenário / Regra | Tipo de Teste | Arquivo de Teste | Nome do Teste / Método |
| --- | --- | --- | --- |
| `UC-<AREA>-<NNN>-C01` | Integração / Unitário | `<caminho existente>` | `<símbolo existente>` |

<Liste somente testes existentes. Se não houver teste para algum comportamento implementado, descreva essa lacuna em texto, sem cadastrar um teste futuro>.
```
