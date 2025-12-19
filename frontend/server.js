// Servidor de producción para el frontend
import { preview } from 'vite';

const server = await preview({
  preview: {
    port: 3100,
    host: true,
    strictPort: true
  }
});

server.printUrls();
