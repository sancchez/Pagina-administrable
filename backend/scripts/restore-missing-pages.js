// Script para restaurar las páginas faltantes en db.json
const fs = require('fs');
const path = require('path');

// Leer la base de datos actual
const dbPath = path.join(__dirname, 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Páginas faltantes que necesitamos agregar
const missingPages = [
  {
    id: 5,
    title: 'Inicio',
    slug: 'inicio',
    content: '<h1>Bienvenido al Acueducto Municipal</h1><p>Agua pura para tu comunidad</p>',
    draftJson: null,
    publishedJson: null,
    metaDescription: 'Página principal del Acueducto Municipal - Servicios de agua potable para la comunidad',
    published: true,
    layoutType: 'default',
    headerConfig: null,
    sidebarEnabled: true,
    sidebarPosition: 'left',
    customCSS: null,
    backgroundColor: null,
    createdAt: '2025-09-06T17:00:00.000Z',
    updatedAt: '2025-09-06T17:00:00.000Z'
  },
  {
    id: 6,
    title: 'Información ESAL',
    slug: 'informacion-esal',
    content: '<h1>Información ESAL</h1><p>Información sobre la Empresa de Servicios de Acueducto y Alcantarillado</p>',
    draftJson: null,
    publishedJson: null,
    metaDescription: 'Información corporativa y legal de la ESAL - Empresa de Servicios de Acueducto',
    published: true,
    layoutType: 'default',
    headerConfig: null,
    sidebarEnabled: true,
    sidebarPosition: 'left',
    customCSS: null,
    backgroundColor: null,
    createdAt: '2025-09-06T17:00:00.000Z',
    updatedAt: '2025-09-06T17:00:00.000Z'
  },
  {
    id: 7,
    title: 'Normatividad',
    slug: 'normatividad',
    content: '<h1>Normatividad</h1><p>Marco normativo y regulatorio del sector de acueducto</p>',
    draftJson: null,
    publishedJson: null,
    metaDescription: 'Marco normativo, leyes y regulaciones del sector de acueducto y alcantarillado',
    published: true,
    layoutType: 'default',
    headerConfig: null,
    sidebarEnabled: true,
    sidebarPosition: 'left',
    customCSS: null,
    backgroundColor: null,
    createdAt: '2025-09-06T17:00:00.000Z',
    updatedAt: '2025-09-06T17:00:00.000Z'
  },
  {
    id: 8,
    title: 'Portal del Usuario',
    slug: 'portal-usuario',
    content: '<h1>Portal del Usuario</h1><p>Acceso a servicios en línea para usuarios del acueducto</p>',
    draftJson: null,
    publishedJson: null,
    metaDescription: 'Portal de servicios en línea - Consulta de facturas, pagos y trámites',
    published: true,
    layoutType: 'default',
    headerConfig: null,
    sidebarEnabled: true,
    sidebarPosition: 'left',
    customCSS: null,
    backgroundColor: null,
    createdAt: '2025-09-06T17:00:00.000Z',
    updatedAt: '2025-09-06T17:00:00.000Z'
  }
];

// Verificar qué páginas ya existen
const existingSlugs = db.pages.map(page => page.slug);
const pagesToAdd = missingPages.filter(page => !existingSlugs.includes(page.slug));

if (pagesToAdd.length > 0) {
  // Agregar las páginas faltantes
  db.pages.push(...pagesToAdd);
  
  // Guardar la base de datos actualizada
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  
  console.log(`✅ Se agregaron ${pagesToAdd.length} páginas faltantes:`);
  pagesToAdd.forEach(page => {
    console.log(`   - ${page.title} (${page.slug})`);
  });
} else {
  console.log('✅ Todas las páginas ya existen en la base de datos');
}

console.log(`\n📊 Total de páginas en la base de datos: ${db.pages.length}`);
db.pages.forEach(page => {
  console.log(`   - ${page.title} (${page.slug})`);
});