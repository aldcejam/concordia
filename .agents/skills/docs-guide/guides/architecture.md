# Guia de CRUD — Arquitetura Geral e Atributos de Qualidade

Leia este arquivo sempre que precisar **Criar, Ler ou Atualizar** a documentação de arquitetura e atributos de qualidade em `docs/technical/architecture/`.

## 1. Organização da Arquitetura (Baseada em arc42)

Não crie arquivos vazios para cada seção do arc42. Mantenha em `docs/technical/architecture/README.md` a visão consolidada da arquitetura do sistema e crie arquivos complementares na mesma pasta apenas quando um tópico (como segurança, mensageria ou multi-tenancy) exigir aprofundamento extenso.

Sempre que um novo serviço, fila, banco de dados ou padrão transversal for introduzido no código:
1. Atualize a seção correspondente em `docs/technical/architecture/README.md`.
2. Atualize a tabela resumida de Stack em `docs/README.md` se uma tecnologia principal tiver mudado.
3. Registre a motivação em um ADR quando a decisão atender aos critérios do [guia de ADRs](./adr.md). Ampliações rotineiras de uma decisão existente podem apenas referenciá-la.

## 2. Limites e Garantias Implementados

Descreva a arquitetura existente, seus limites configurados e as garantias sustentadas pelos mecanismos implementados. Metas desejadas, SLOs ainda não atendidos e redesenhos futuros pertencem a specs. Para cada atributo, explique:

- **Estímulo e Contexto:** A condição de execução e o ambiente a que a descrição se aplica.
- **Limite ou Garantia:** O que a implementação realmente limita ou garante, com suas condições e exceções.
- **Mecanismo e Referências:** O componente, configuração, contrato ou teste que sustenta a descrição.

Inclua resultados de medições apenas quando existirem, com ambiente e condições da medição. Um resultado observado não deve ser descrito como garantia geral. Não acrescente campos de aprovação ou medição documental.

---

## 3. Estrutura Padrão (`docs/technical/architecture/README.md`)

```markdown
# Arquitetura do Sistema

## 1. Contexto e Fronteiras (C4 Nível 1 e 2)
<Descreva os limites do sistema, seus contêineres principais (APIs, workers, frontends, bancos, brokers) e sistemas externos integrados. Inclua diagrama Mermaid quando útil>.

## 2. Organização Modular e Regras de Dependência
<Explique como o código é dividido (ex.: pacotes por domínio/feature, camadas Controller -> Application -> Domain -> Infrastructure) e quais dependências entre pacotes ou camadas são proibidas>.

## 3. Conceitos e Políticas Transversais
- **Autenticação e Autorização:** <Estratégia adotada>.
- **Transações, Concorrência e Idempotência:** <Padrão global adotado>.
- **Tratamento de Erros e Observabilidade:** <Padrão de logs, métricas, tracing e payloads de erro>.

## 4. Atributos de Qualidade, Limites e Garantias

| Atributo | Contexto / Estímulo | Limite ou Garantia Implementada | Mecanismo e Referências |
| --- | --- | --- | --- |
| Desempenho | <Operação e ambiente existentes> | <Limite efetivamente configurado> | <Configuração, arquivo e símbolo correspondentes> |
| Consistência | <Evento ou operação existente> | <Garantia real, condições e exceções> | <Mecanismo e testes existentes> |

## 5. Riscos Conhecidos e Dívidas Técnicas Arquiteturais
- **Risco / Dívida 1:** <Gargalo ou limitação comprovado, impacto atual e referência correspondente>. Correções futuras ficam em specs ou issues.
```
