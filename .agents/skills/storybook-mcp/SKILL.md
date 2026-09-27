---
name: storybook-mcp
description: Use o MCP do Storybook do Concordia para consultar componentes, props, stories e testes antes de criar ou alterar UI reutilizável.
---

# Storybook MCP do Concordia

Use esta skill quando a tarefa alterar componentes React, tema, stories, páginas que compõem o design system ou documentação visual em `web/**`.

## Servidor e pré-condições

- O MCP se chama `concordia-storybook` e aponta para `http://localhost:6006/mcp`.
- Se o Storybook não estiver em execução, inicie-o em outro processo com `cd web && npm run storybook` antes de fazer consultas runtime.
- O catálogo fica em `System Design/**`; a referência geral é `System Design/Overview`.
- O arquivo `.mcp.json` registra a configuração compartilhável do projeto. Não adicione credenciais ou URLs de produção.

## Fluxo obrigatório para UI

1. Use `docs-list` para descobrir componentes documentados que atendem ao pedido.
2. Use `docs-show` no componente escolhido para verificar props, variantes, estados e exemplos.
3. Se a informação não for suficiente, use `docs-show-story` em uma story específica.
4. Use `get-storybook-story-instructions` antes de escrever ou atualizar uma story; aplique as recomendações retornadas para controles, estados e testes de interação.
5. Reutilize os componentes existentes e os tokens semânticos do tema. Não invente props, variantes, classes ou valores de token.
6. Depois da alteração, use `stories-preview` para inspecionar visualmente as stories relevantes e `test-run` para validar as stories, incluindo acessibilidade quando disponível.

## Regras do design system

- Stories de componentes reutilizáveis devem estar em `web/src/components/<level>/<Component>/<Component>.stories.tsx` e usar títulos `System Design/<Level>/<Component>`.
- A página de catálogo deve permanecer em `System Design/Overview`; não crie uma rota de produção para ela.
- Use dados mockados determinísticos e callbacks de `storybook/test`; stories não podem buscar API, depender de autenticação, ler storage ou chamar provedores externos.
- Mostre os estados relevantes do componente: padrão, carregando, erro, vazio, desabilitado, responsivo e modo escuro quando suportados.
- Ao alterar um componente, altere sua story correspondente na mesma mudança.

## Segurança contra alucinação

Nunca presuma uma propriedade porque o nome parece comum ou porque outra biblioteca a possui. Se uma prop não aparecer em `docs-show`, `docs-show-story` ou no código local, não a use; confirme a decisão com o usuário quando ela for necessária.

Se o MCP estiver indisponível, informe a limitação e faça fallback para as stories e tipos locais. Não simule respostas do MCP nem declare uma validação que não foi executada.
