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

// Proxy manual para /api hacia el backend
app.use('/api', async (req, res, next) => {
  try {
    console.log('🔄 Proxying:', req.method, req.url, '-> http://localhost:4000');

    const targetUrl = `http://localhost:4000${req.url}`;
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        ...req.headers,
        host: 'localhost:4000'
      }
    });

    console.log('✅ Proxy response:', response.status);

    // Copiar headers de la respuesta
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    res.status(response.status);
    const data = await response.text();
    res.send(data);
  } catch (error) {
    console.error('❌ Proxy error:', error.message);
    next(error);
  }
});

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
