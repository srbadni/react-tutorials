import { defineConfig } from 'vite';
import { createSearchHandler } from './server/search-api.mjs';

export default defineConfig({
  plugins: [
    {
      name: 'local-search-api',
      configureServer(server) {
        server.middlewares.use(createSearchHandler());
      },
      configurePreviewServer(server) {
        server.middlewares.use(createSearchHandler());
      },
    },
  ],
  server: { host: '127.0.0.1', port: 5173, strictPort: true },
  preview: { host: '127.0.0.1', port: 4173, strictPort: true },
});
