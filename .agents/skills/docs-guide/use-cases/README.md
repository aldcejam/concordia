# Catálogo de Casos de Uso

Este catálogo lista somente casos de uso implementados e documentados no sistema. Para criar ou atualizar um caso, consulte o [guia de casos de uso](../guides/use-case.md). Cadastre as siglas das áreas no [mapa documental](../README.md).

## Como ler os códigos e caminhos

Os trechos entre `<` e `>` são marcadores que devem ser substituídos; os sinais não entram no nome final. Em `docs/use-cases/<area>/UC-<AREA>-<NNN>-<slug>/README.md`, `<area>` é o nome da pasta da área em minúsculas, `<AREA>` é sua sigla estável em maiúsculas, `<NNN>` é o próximo número sequencial de três dígitos (`001`, `002`...) e `<slug>` é um resumo curto em `kebab-case`, sem acentos. Assim, `docs/use-cases/pedidos/UC-ORD-001-criar-pedido/README.md` é o caso 001 da área de pedidos (`ORD`), com o slug `criar-pedido`.

`UC` vem de *Use Case* (caso de uso), `RN` significa Regra de Negócio e `ADR` vem de *Architecture Decision Record* (registro de decisão arquitetural). Nos códigos de cenário, `C` significa cenário e os dois dígitos seguintes indicam sua sequência: `UC-ORD-001-C02` é o segundo cenário do caso `UC-ORD-001`. Para detalhes sobre todos os formatos de identificador, consulte as [convenções globais no AGENTS.md](../../AGENTS.md).

Funcionalidades e cenários futuros pertencem a specs, fora de `docs/`. Um fluxo parcialmente entregue entra no catálogo com a descrição apenas da parte que já funciona.

---

## Casos de Uso por Área Funcional

Nenhum caso cadastrado neste modelo. Ao adotar o padrão, organize os casos existentes por área e acrescente apenas links para arquivos que descrevam sua implementação.

Use a estrutura abaixo como exemplo de preenchimento; substitua os marcadores e remova esta instrução no projeto consumidor.

```markdown
### <Nome da Área> (`<SIGLA>`)

| Código | Título | Iniciador Principal | Resultado Observável |
| --- | --- | --- | --- |
| [UC-<AREA>-<NNN>](./<area>/UC-<AREA>-<NNN>-<slug>/README.md) | <Título com verbo no infinitivo> | <Ator ou evento> | <Resultado entregue pelo sistema> |
```

## IDs Retirados

Quando um caso for removido do sistema, retire sua linha do catálogo atual e registre aqui somente seu ID, o motivo da retirada e o substituto, se houver. A descrição anterior permanece no histórico do Git. Esses IDs não podem ser reutilizados.
