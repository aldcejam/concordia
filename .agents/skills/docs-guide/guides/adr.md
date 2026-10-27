# Guia de CRUD — Architecture Decision Records (ADRs)

Leia este arquivo sempre que precisar **Criar, Consultar, Atualizar ou Substituir** uma decisão técnica em `docs/technical/adr/`.

## 1. Quando Criar um ADR

Registre um ADR depois que uma decisão técnica tiver sido aplicada à implementação e impactar:
- Estrutura de módulos, arquitetura, padrões de comunicação ou topologia de serviços.
- Escolha ou troca de banco de dados, mensageria, bibliotecas estruturais ou provedores de nuvem.
- Estratégias transversais de segurança, autenticação, concorrência, idempotência, cache ou observabilidade.
- Qualquer escolha técnica cujo custo de reversão futuro seja alto.

Não crie ADRs para escolhas triviais de formatação ou detalhes locais de implementação.

Decisões em estudo e alternativas para uma implementação futura ficam em specs, fora de `docs/`. O ADR explica uma escolha já aplicada e seus motivos, sem campos de ciclo de vida ou aprovação.

## 2. Registro e Evolução das Decisões

- **CREATE:**
  1. Verifique o último número em `docs/technical/adr/` e atribua o próximo ID sequencial (`ADR-001`, `ADR-002`...).
  2. Crie o arquivo `docs/technical/adr/ADR-<NNN>-<slug>.md` usando a estrutura da Seção 3.
  3. Atualize o índice em `docs/technical/adr/README.md`; crie-o com o primeiro ADR, listando ID, título, data e link.
- **SUBSTITUIÇÃO:**
  1. Preserve ADRs que registram decisões efetivamente aplicadas no passado.
  2. Depois de implementar a mudança, crie um novo ADR explicando a decisão aplicada e relacionando o registro anterior.
  3. Acrescente ao ADR anterior uma nota histórica com link para a decisão que o substituiu. Atualize a arquitetura atual para apontar para a escolha em uso. A nota descreve a evolução já ocorrida, sem um campo de estado.

---

## 3. Estrutura Padrão Obrigatória (`docs/technical/adr/ADR-<NNN>-<slug>.md`)

```markdown
# ADR-<NNN> — <Título Curto e Decisório>

- **Data:** YYYY-MM-DD
- **Escopo Afetado:** <Módulos, serviços ou camadas impactadas>

## 1. Contexto e Problema
<Descreva as forças técnicas e de negócio em jogo, o problema a ser resolvido e as restrições existentes>.

## 2. Decisão
<Descreva a decisão aplicada e como ela se materializa na implementação>.

## 3. Alternativas Consideradas
- **Alternativa 1 (Escolhida):** <Resumo + razão determinante da escolha>.
- **Alternativa 2:** <Resumo + motivo concreto pelo qual foi descartada>.
- **Alternativa 3:** <Resumo + motivo concreto pelo qual foi descartada>.

## 4. Consequências e Trade-offs
- **Ganhos (Positivas):** <Benefícios obtidos com a decisão>.
- **Custos e Limitações (Negativas):** <Dívidas, complexidade adicional ou riscos existentes e mecanismos de mitigação já aplicados>.

## 5. Referências e Impacto
- **ADRs relacionados:** <Links se houver>
- **Casos de Uso / Componentes afetados:** <Links para UCs ou caminhos de código>
```
