const fs = require('fs');
const path = require('path');

// Leer la base de datos
const dbPath = path.join(__dirname, 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

console.log('📋 Páginas en la base de datos:');
console.log('================================');

db.pages.forEach(page => {
  console.log(`ID: ${page.id}`);
  console.log(`Título: ${page.title}`);
  console.log(`Slug: ${page.slug}`);
  console.log(`Publicado: ${page.published}`);
  console.log(`Tiene contenido HTML: ${page.content ? 'Sí' : 'No'}`);
  console.log(`Tiene published_json: ${page.published_json ? 'Sí' : 'No'}`);
  console.log(`URL Frontend: http://localhost:5173/${page.slug === 'inicio' ? '' : page.slug}`);
  console.log(`API Endpoint: http://localhost:3001/api/pages/${page.slug}`);
  console.log('---');
});

console.log(`\n📊 Total: ${db.pages.length} páginas`);
console.log(`📊 Publicadas: ${db.pages.filter(p => p.published).length} páginas`);