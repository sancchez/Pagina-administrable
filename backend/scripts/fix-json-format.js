const fs = require('fs');
const path = require('path');

// Leer la base de datos
const dbPath = path.join(__dirname, 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

console.log('🔧 Corrigiendo formato de published_json...');

let fixedCount = 0;

db.pages.forEach(page => {
  if (page.published_json) {
    // Si published_json es un objeto, convertirlo a string
    if (typeof page.published_json === 'object') {
      console.log(`📝 Convirtiendo objeto a JSON string para: ${page.title} (${page.slug})`);
      page.published_json = JSON.stringify(page.published_json);
      page.updatedAt = new Date().toISOString();
      fixedCount++;
    }
    // Si es string, verificar que sea JSON válido
    else if (typeof page.published_json === 'string') {
      try {
        JSON.parse(page.published_json);
        console.log(`✅ JSON válido para: ${page.title} (${page.slug})`);
      } catch (e) {
        console.log(`❌ JSON inválido para: ${page.title} (${page.slug}), recreando...`);
        
        // Recrear published_json básico
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
              content: page.content || '',
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
        fixedCount++;
      }
    }
  }
});

if (fixedCount > 0) {
  // Guardar la base de datos actualizada
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  console.log(`✅ Se corrigieron ${fixedCount} páginas`);
} else {
  console.log('✅ Todos los JSON están en formato correcto');
}

console.log('\n📋 Verificación final:');
db.pages.forEach(page => {
  if (page.published_json) {
    try {
      const parsed = JSON.parse(page.published_json);
      console.log(`✅ ${page.title} (${page.slug}): JSON válido con ${parsed.blocks?.length || 0} bloques`);
    } catch (e) {
      console.log(`❌ ${page.title} (${page.slug}): JSON inválido`);
    }
  } else {
    console.log(`⚠️ ${page.title} (${page.slug}): Sin published_json`);
  }
});