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
- PostgreSQL

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

Defina as variáveis de conexão com o PostgreSQL e inicie a aplicação:

```bash
cd api
export DB_URL=jdbc:postgresql://localhost:5432/concordia
export DB_USERNAME=postgres
export DB_PASSWORD=postgres
mvn spring-boot:run
```

A documentação Swagger estará disponível em `http://localhost:8080/swagger-ui.html`.
