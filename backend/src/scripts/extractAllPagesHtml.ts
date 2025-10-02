#!/usr/bin/env ts-node

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// Lista de páginas a extraer
const pages = [
  { slug: 'home', name: 'Inicio' },
  { slug: 'informacion-esal', name: 'Información ESAL' },
  { slug: 'contacto', name: 'Contacto' },
  { slug: 'normatividad', name: 'Normatividad' },
  { slug: 'operacion-gestion', name: 'Operación y Gestión' },
  { slug: 'portal-usuario', name: 'Portal Usuario' },
  { slug: 'invoice', name: 'Facturación' },
  { slug: 'invoice-query', name: 'Consulta de Facturas' }
];

async function extractAllPagesHtml() {
  console.log('🚀 Extrayendo HTML real de todas las páginas...\n');
  console.log('📋 Para extraer el HTML real, necesitas:');
  console.log('1. Abrir cada página en el navegador');
  console.log('2. Usar F12 > Elements > Copiar el HTML del body');
  console.log('3. Usar F12 > Styles > Copiar los estilos CSS');
  console.log('');

  const outputDir = join(__dirname, 'extracted-html');
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  // Crear archivos de plantilla para cada página
  for (const page of pages) {
    console.log(`📄 Creando plantilla para: ${page.name} (${page.slug})`);
    
    const htmlTemplate = `<!-- HTML extraído del navegador para ${page.name} -->
<!-- URL: http://localhost:5173/${page.slug === 'home' ? '' : page.slug} -->
<!-- Instrucciones: -->
<!-- 1. Abrir la URL en el navegador -->
<!-- 2. F12 > Elements > Clic derecho en <body> > Copy > Copy outerHTML -->
<!-- 3. Reemplazar este comentario con el HTML copiado -->

<div class="placeholder">
  <h1>Plantilla para ${page.name}</h1>
  <p>Reemplazar con HTML real del navegador</p>
</div>`;

    const cssTemplate = `/* CSS extraído del navegador para ${page.name} */
/* URL: http://localhost:5173/${page.slug === 'home' ? '' : page.slug} */
/* Instrucciones: */
/* 1. Abrir la URL en el navegador */
/* 2. F12 > Styles > Copiar todos los estilos aplicados */
/* 3. Reemplazar este comentario con el CSS copiado */

.placeholder {
  padding: 2rem;
  text-align: center;
  background: #f0f0f0;
}`;
    
    writeFileSync(
      join(outputDir, `${page.slug}.html`),
      htmlTemplate
    );
    
    writeFileSync(
      join(outputDir, `${page.slug}.css`),
      cssTemplate
    );
    
    console.log(`   - Plantilla creada: extracted-html/${page.slug}.html y .css`);
  }
  
  console.log('');
  console.log('🎉 Plantillas creadas!');
  console.log('📝 Ahora necesitas extraer manualmente el HTML y CSS de cada página desde el navegador.');
  console.log('💡 Tip: Usa las URLs mostradas en cada archivo para acceder a las páginas.');
}

if (require.main === module) {
  extractAllPagesHtml()
    .then(() => {
      console.log('✅ Proceso completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en el proceso:', error);
      process.exit(1);
    });
}

export { extractAllPagesHtml };