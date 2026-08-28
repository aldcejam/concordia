# Concordia

Monorepositório da aplicação Concordia.

## Estrutura

- `web`: React, TypeScript, Vite, Material UI, TanStack Query e Orval.
- `api`: Java 21, Spring Boot, Spring Web MVC, Spring Data JPA, Spring Security e PostgreSQL.
- `tmp`: versão anterior preservada localmente e ignorada pelo Git.

## Pré-requisitos

- Node.js 20.19 ou superior
- Java 21
- Maven 3.8 ou superior
- Docker com Docker Compose

## Frontend

```bash
cd web
npm install
npm run dev
```

Para regenerar o cliente HTTP tipado a partir do contrato da API:

```bash
npm run generate:api
```

## Backend

Inicie o PostgreSQL na raiz do projeto:

```bash
docker compose up -d postgres
```

Em seguida, inicie a aplicação:

```bash
cd api
mvn spring-boot:run
```

Por padrão, o banco usa `concordia` como nome e `postgres` como usuário e senha. Esses valores podem ser alterados pelas variáveis `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` e `POSTGRES_PORT`; ajuste também `DB_URL`, `DB_USERNAME` e `DB_PASSWORD` ao iniciar a API.

A documentação Swagger estará disponível em `http://localhost:8080/swagger-ui.html`.
