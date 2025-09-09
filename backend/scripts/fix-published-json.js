const fs = require('fs');
const path = require('path');

// Leer la base de datos
const dbPath = path.join(__dirname, 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

console.log('🔧 Corrigiendo published_json para páginas sin él...');

let updatedCount = 0;

db.pages.forEach(page => {
  if (!page.published_json && page.content && page.published) {
    console.log(`📝 Actualizando página: ${page.title} (${page.slug})`);
    
    // Crear un published_json básico basado en el contenido HTML
    const publishedJson = {
      meta: {
        width: 1200,
        height: 800,
        backgroundColor: "#ffffff"
      },
      blocks: [
        {
          id: `html-content-${page.id}`,
          type: "html",
          content: page.content,
          x: 0,
          y: 0,
          width: 1200,
          height: "auto",
          visible: true,
          locked: false
        }
      ]
    };
    
    page.published_json = JSON.stringify(publishedJson);
    page.updatedAt = new Date().toISOString();
    updatedCount++;
  }
});

if (updatedCount > 0) {
  // Guardar la base de datos actualizada
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  console.log(`✅ Se actualizaron ${updatedCount} páginas con published_json`);
} else {
  console.log('✅ Todas las páginas ya tienen published_json');
}

console.log('\n📋 Estado final de las páginas:');
db.pages.forEach(page => {
  console.log(`- ${page.title} (${page.slug}): ${page.published_json ? '✅ Tiene published_json' : '❌ Sin published_json'}`);
});