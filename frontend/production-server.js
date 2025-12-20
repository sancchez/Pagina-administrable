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

// Parsear JSON body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Proxy manual para /api hacia el backend
app.use('/api', async (req, res, next) => {
  try {
    // req.url no incluye /api porque Express lo quita al montar el middleware
    // Necesitamos agregarlo de vuelta
    const targetUrl = `http://localhost:4000/api${req.url}`;
    console.log('🔄 Proxying:', req.method, `/api${req.url}`, '-> http://localhost:4000');

    const options = {
      method: req.method,
      headers: {
        ...req.headers,
        host: 'localhost:4000'
      }
    };

    // Agregar body si existe (POST, PUT, PATCH, etc.)
    if (req.body && Object.keys(req.body).length > 0) {
      options.body = JSON.stringify(req.body);
      options.headers['content-type'] = 'application/json';
    }

    const response = await fetch(targetUrl, options);

    console.log('✅ Proxy response:', response.status);

    // Copiar headers de la respuesta, excepto los de compresión
    // (fetch ya descomprime automáticamente)
    const excludeHeaders = ['content-encoding', 'content-length', 'transfer-encoding'];
    response.headers.forEach((value, key) => {
      if (!excludeHeaders.includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
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
