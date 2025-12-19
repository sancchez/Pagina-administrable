// Servidor de producción para el frontend
import { preview } from 'vite';

const server = await preview({
  preview: {
    port: 3100,
    host: true,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false
      }
    }
  }
});

server.printUrls();
