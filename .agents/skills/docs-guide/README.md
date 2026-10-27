# Documentação do Sistema — `<Nome do Projeto>`

> Modelo de entrada para os projetos consumidores. Preencha apenas com componentes, comportamentos e documentos existentes. No acervo de padrões, preserve os marcadores; ao implantar, preencha-os ou remova os itens que não se aplicam. Trabalho futuro pertence a specs, fora de `docs/`.

## 1. Visão Geral do Produto

- **Propósito do Sistema:** `<Descreva em um parágrafo o problema central que o software resolve>`.
- **Domínio de Aplicação:** `<Ex.: comércio eletrônico, educação ou gestão financeira>`.
- **Atores e Sistemas Iniciadores:**
  - `<Ator 1>`: `<Papel principal no sistema>`.
  - `<Sistema externo, evento ou agendamento>`: `<Responsabilidade no fluxo>`.

## 2. Stack Tecnológica e Comandos de Verificação

Detalhes arquiteturais podem ser registrados em `docs/technical/architecture/README.md`, quando esse documento for necessário.

| Camada | Tecnologia / Versão | Diretório no Repositório |
| --- | --- | --- |
| Backend | `<Ex.: Java 21 e Spring Boot 3.x>` | `<Ex.: backend/>` |
| Frontend | `<Ex.: React e TypeScript>` | `<Ex.: frontend/>` |
| Persistência | `<Ex.: PostgreSQL 16>` | `<Ex.: migrations/>` |
| Mensageria / Eventos | `<Ex.: RabbitMQ ou Kafka>` | `<Ex.: backend/messaging/>` |
| Infraestrutura / CI | `<Ex.: Docker Compose e GitLab CI>` | `<Ex.: infra/>` |

### Comandos Oficiais do Repositório

Informe o diretório de execução, pré-requisitos e variáveis necessárias, sem valores de segredos. Inclua somente comandos existentes e conferidos. Remova as linhas que não se aplicam; não registre comandos hipotéticos ou pendências.

| Verificação | Diretório de Execução | Comando Confirmado |
| --- | --- | --- |
| Build / Compilação | `<Diretório>` | `<Comando exato>` |
| Todos os testes | `<Diretório>` | `<Comando exato>` |
| Teste único | `<Diretório>` | `<Comando exato e forma de selecionar o teste>` |
| Linter / Typecheck | `<Diretório>` | `<Comando exato>` |
| Documentação | `<Diretório>` | `<Validador adotado pelo projeto, se houver>` |

### Entrada para Desenvolvimento

Mantenha no [README da raiz](../README.md) os requisitos, instalação, configuração do ambiente, execução local, verificação inicial e processo de contribuição. Acrescente links para instruções específicas quando existirem.

## 3. Mapa de Áreas Funcionais e Domínios

Cadastre as siglas das áreas existentes antes de criar identificadores `UC-<AREA>-<NNN>` e `RN-<AREA>-<NNN>`. Inclua links somente para documentos já criados que descrevam implementações existentes; remova colunas opcionais que não se apliquem.

| Sigla | Área / Domínio | Escopo e Responsabilidade | Pasta de Casos de Uso | Regras de Domínio |
| --- | --- | --- | --- | --- |
| `<SIGLA>` | `<Nome da área>` | `<Responsabilidade implementada>` | `<Link para os casos documentados>` | `<Link para regras documentadas, se houver>` |

## 4. Entradas de Navegação

| Necessidade | Onde Consultar |
| --- | --- |
| Encontrar fluxos implementados e documentados | [Catálogo de Casos de Uso](./use-cases/README.md) |
| Criar ou atualizar documentos | [Guias Documentais](./guides/README.md) |

Acrescente vocabulário, arquitetura, ADRs, contratos e operações a esta navegação somente depois de documentar os componentes existentes correspondentes. Specs não fazem parte do catálogo do sistema.

## 5. Manutenção

- Descreva o comportamento entregue e mantenha referências aos arquivos, símbolos, contratos e testes que o sustentam.
- Atualize os documentos afetados junto da implementação, no mesmo escopo/PR, depois de conferir o resultado.
- Inclua apenas a parte implementada de um fluxo; o restante fica na spec.
- Registre limitações comprovadas como comportamento atual. Mudanças desejadas pertencem a specs ou issues.
- Retire descrições de funcionalidades removidas e preserve seus IDs e histórico conforme os guias.
