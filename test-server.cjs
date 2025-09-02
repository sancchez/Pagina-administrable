const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`🔥 [${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', req.body);
  }
  next();
});

// Simulated database file
const dbFile = path.join(__dirname, 'test-db.json');

// Initialize test database
if (!fs.existsSync(dbFile)) {
  const initialData = {
    pages: [
      {
        id: 1,
        title: "Página de Prueba",
        slug: "test-page",
        content: "<h1>Contenido de prueba</h1><p>Esta es una página de prueba.</p>",
        metaDescription: "Página de prueba",
        published: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        title: "Segunda Página",
        slug: "second-page",
        content: "<h1>Segunda página</h1><p>Contenido de la segunda página.</p>",
        metaDescription: "Segunda página",
        published: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  };
  fs.writeFileSync(dbFile, JSON.stringify(initialData, null, 2));
}

// Helper functions
function readDB() {
  try {
    const data = fs.readFileSync(dbFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    return { pages: [] };
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing database:', error);
    return false;
  }
}

// Routes

// Get all pages
app.get('/api/admin/pages', (req, res) => {
  console.log('📄 Getting all pages');
  const db = readDB();
  res.json(db.pages);
});

// Get page by ID
app.get('/api/admin/pages/:id', (req, res) => {
  const id = parseInt(req.params.id);
  console.log(`📄 Getting page with ID: ${id}`);
  
  const db = readDB();
  const page = db.pages.find(p => p.id === id);
  
  if (!page) {
    return res.status(404).json({ error: 'Page not found' });
  }
  
  res.json(page);
});

// Create new page
app.post('/api/admin/pages', (req, res) => {
  console.log('📝 Creating new page');
  console.log('Request body:', req.body);
  
  const db = readDB();
  const newId = Math.max(...db.pages.map(p => p.id), 0) + 1;
  
  const newPage = {
    id: newId,
    title: req.body.title || 'Nueva Página',
    slug: req.body.slug || `page-${newId}`,
    content: req.body.content || '',
    metaDescription: req.body.metaDescription || '',
    published: req.body.published || false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  db.pages.push(newPage);
  
  if (writeDB(db)) {
    console.log('✅ Page created successfully:', newPage);
    res.status(201).json(newPage);
  } else {
    console.log('❌ Error creating page');
    res.status(500).json({ error: 'Error creating page' });
  }
});

// Update page
app.put('/api/admin/pages/:id', (req, res) => {
  const id = parseInt(req.params.id);
  console.log(`📝 Updating page with ID: ${id}`);
  console.log('Request body:', req.body);
  
  const db = readDB();
  const pageIndex = db.pages.findIndex(p => p.id === id);
  
  if (pageIndex === -1) {
    console.log('❌ Page not found');
    return res.status(404).json({ error: 'Page not found' });
  }
  
  // Update page
  const updatedPage = {
    ...db.pages[pageIndex],
    title: req.body.title || db.pages[pageIndex].title,
    slug: req.body.slug || db.pages[pageIndex].slug,
    content: req.body.content || db.pages[pageIndex].content,
    metaDescription: req.body.metaDescription || db.pages[pageIndex].metaDescription,
    published: req.body.published !== undefined ? req.body.published : db.pages[pageIndex].published,
    updatedAt: new Date().toISOString()
  };
  
  db.pages[pageIndex] = updatedPage;
  
  if (writeDB(db)) {
    console.log('✅ Page updated successfully:', updatedPage);
    res.json(updatedPage);
  } else {
    console.log('❌ Error updating page');
    res.status(500).json({ error: 'Error updating page' });
  }
});

// Delete page
app.delete('/api/admin/pages/:id', (req, res) => {
  const id = parseInt(req.params.id);
  console.log(`🗑️ Deleting page with ID: ${id}`);
  
  const db = readDB();
  const pageIndex = db.pages.findIndex(p => p.id === id);
  
  if (pageIndex === -1) {
    return res.status(404).json({ error: 'Page not found' });
  }
  
  db.pages.splice(pageIndex, 1);
  
  if (writeDB(db)) {
    console.log('✅ Page deleted successfully');
    res.json({ message: 'Page deleted successfully' });
  } else {
    console.log('❌ Error deleting page');
    res.status(500).json({ error: 'Error deleting page' });
  }
});

// Get page by slug (public route)
app.get('/api/pages/:slug', (req, res) => {
  const slug = req.params.slug;
  console.log(`📄 Getting public page with slug: ${slug}`);
  
  const db = readDB();
  const page = db.pages.find(p => p.slug === slug && p.published);
  
  if (!page) {
    console.log(`❌ Page not found: ${slug}`);
    return res.status(404).json({ error: 'Page not found' });
  }
  
  console.log(`✅ Page found: ${page.title}`);
  res.json(page);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Test server is running' });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Test server running on http://localhost:${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
  console.log(`🔍 Waiting for requests...`);
  console.log(`💡 Press Ctrl+C to stop the server`);
});

// Keep the process alive
process.stdin.resume();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down test server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});