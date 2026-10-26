import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Base path para assets - usar ruta absoluta para que funcione en rutas anidadas
  base: '/',
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
        // El worker de PDF.js (pdf.worker.min.mjs) se emite como .js: algunos
        // nginx/Apache no conocen .mjs y lo sirven con un MIME que el navegador
        // rechaza para módulos, y el visor de PDF dejaría de funcionar.
        assetFileNames: (asset) =>
          asset.name?.endsWith('.mjs') ? 'assets/[name]-[hash].js' : 'assets/[name]-[hash][extname]',
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
