import { defineConfig } from 'orval'

export default defineConfig({
  concordia: {
    input: '../api/openapi.yaml',
    output: {
      target: './src/api/generated/concordia.ts',
      schemas: './src/api/generated/models',
      client: 'react-query',
      httpClient: 'axios',
      mode: 'tags-split',
      clean: true,
    },
  },
})
