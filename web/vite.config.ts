import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { domscribe } from '@domscribe/react/vite';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    domscribe({
      relay: {
        autoStart: true,
        host: '127.0.0.1',
      },
      overlay: {
        initialMode: 'expanded',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
