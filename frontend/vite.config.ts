import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Base path para assets - usar ruta relativa para que funcione en cualquier protocolo
  base: './',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    port: 5174,
    host: true,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    port: 5174,
    host: true,
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['grapesjs', 'grapesjs-preset-webpage'],
  },
  build: {
    commonjsOptions: {
      include: [/grapesjs/, /node_modules/],
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'grapesjs-vendor': ['grapesjs', 'grapesjs-preset-webpage'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
});
