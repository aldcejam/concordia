# Runbook: Ambiente Local, Banco de Dados e Execução dos Serviços

| Campo | Valor |
| --- | --- |
| **Serviço / Componente** | PostgreSQL (`compose.yaml`), Backend (`api/`) e Frontend (`web/`) |
| **Criticidade** | `Média` (Ambiente de Desenvolvimento e Validação Local) |
| **Última Verificação** | `2026-04-19` |

## Quando Usar (Sintomas / Gatilhos)

- Ao inicializar o ambiente de desenvolvimento do Concordia pela primeira vez.
- Ao diagnosticar falhas de conexão JDBC (`Connection refused` na porta `5432`) ou erros de conexão do frontend com a API (`http://localhost:8080`).
- Ao executar a bateria completa de validação automatizada antes de abrir ou revisar um Pull Request.

## Pré-requisitos

- Docker e Docker Compose instalados e em execução.
- JDK 25 e Maven (`mvn`) instalados para o módulo `api/`.
- Node.js 20+ e `npm` instalados para o módulo `web/`.

## Diagnóstico Rápido

1. Verificar se o container do PostgreSQL está ativo e saudável:
   ```bash
   docker compose ps
   ```
2. Verificar se o backend responde na porta `8080`:
   ```bash
   curl -i http://localhost:8080/api/obras
   ```
3. Conferir os arquivos de configuração do backend em `api/src/main/resources/application.yaml` e `api/src/main/resources/application-dev.yml`:
   - `DB_URL` (padrão `jdbc:postgresql://localhost:5432/concordia`)
   - `DB_USERNAME` (padrão `postgres`)
   - `DB_PASSWORD` (padrão `postgres`)
   - `OPENROUTER_API_KEY` / `CONCORDIA_IA_API_KEY` / `OPENAI_API_KEY` (opcional para IA)

## Procedimento Passo a Passo

### 1. Subir o Banco de Dados PostgreSQL

```bash
docker compose up -d postgres
```

- **Resultado esperado:** Container `postgres:17-alpine` em execução expondo a porta `5432` com database `concordia` e usuário/senha `postgres`.

### 2. Iniciar o Backend Spring Boot (`api/`)

```bash
cd api && SPRING_PROFILES_ACTIVE=dev mvn spring-boot:run
```

> [!TIP]
> Para habilitar as recomendações via provedor de IA (`UC-OBR-004`) em vez do fallback determinístico local, exporte a variável `OPENROUTER_API_KEY` antes de iniciar o backend:
> ```bash
> export OPENROUTER_API_KEY="<SUA_CHAVE_OPENROUTER>"
> cd api && SPRING_PROFILES_ACTIVE=dev mvn spring-boot:run
> ```

- **Resultado esperado:** Aplicação iniciada na porta `8080` e Swagger UI acessível em `http://localhost:8080/swagger` (quando executado com `SPRING_PROFILES_ACTIVE=dev`).

### 3. Iniciar o Frontend React/Vite (`web/`)

```bash
cd web && npm install && npm run dev
```

- **Resultado esperado:** Servidor Vite ativo em `http://localhost:5173`.

### 4. Iniciar o Catálogo Storybook e Servidor MCP (Opcional para desenvolvimento de UI)

```bash
cd web && npm run storybook
```

- **Resultado esperado:** Catálogo disponível em `http://localhost:6006` e endpoint MCP ativo em `http://localhost:6006/mcp`.

### 5. Executar Validação Completa (Testes + Build)

```bash
cd api && mvn test
cd web && npm run lint && npm run build && npm run test && npm run test:e2e
```

## Rollback / Mitigação

Caso o esquema do banco local fique inconsistente durante experimentos de desenvolvimento, recrie o volume do container PostgreSQL:

> [!CAUTION]
> O comando abaixo apaga todos os dados locais do banco `concordia` no container Docker.

```bash
docker compose down -v && docker compose up -d postgres
```
