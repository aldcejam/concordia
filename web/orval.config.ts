import { defineConfig } from 'orval';

export default defineConfig({
  concordia: {
    input: {
      target: 'http://localhost:8080/v3/api-docs',
    },
    output: {
      target: './src/api/generated/concordia.ts',
      schemas: './src/api/generated/models',
      client: 'react-query',
      httpClient: 'fetch',
      mode: 'tags-split',
      clean: true,
    },
  },
});
