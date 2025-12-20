import { createRequire } from 'module';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const express = require('express');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4001;

// Log de todas las peticiones
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url}`);
  next();
});

// Proxy para /api hacia el backend
const apiProxy = createProxyMiddleware({
  target: 'http://localhost:4000',
  changeOrigin: true,
  logLevel: 'debug',
  onProxyReq: (proxyReq, req, res) => {
    console.log('🔄 Proxying:', req.method, req.url, '-> http://localhost:4000');
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log('✅ Proxy response:', proxyRes.statusCode);
  },
  onError: (err, req, res) => {
    console.error('❌ Proxy error:', err.message);
  }
});

app.use('/api', apiProxy);

// Servir archivos estáticos del build
app.use(express.static(path.join(__dirname, 'dist')));

// Manejar rutas SPA (todas las rutas devuelven index.html)
app.use((req, res, next) => {
  // Si no es una ruta de API y no es un archivo estático, devolver index.html
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  } else {
    next();
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend server running on http://localhost:${PORT}`);
  console.log(`Proxying /api requests to http://localhost:4000`);
});
