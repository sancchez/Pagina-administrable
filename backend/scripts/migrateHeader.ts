import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateHeader() {
  console.log('🔍 Buscando header...');

  const header = await prisma.page.findUnique({
    where: { slug: '_header' }
  });

  if (!header) {
    console.log('❌ Header no encontrado');
    return;
  }

  console.log('📊 Estado actual del header:');
  console.log('  - html:', header.html?.length || 0, 'chars');
  console.log('  - content:', header.content?.length || 0, 'chars');
  console.log('  - gjsHtml:', header.gjsHtml?.length || 0, 'chars');
  console.log('  - publishedHtml:', header.publishedHtml?.length || 0, 'chars');

  // Determinar qué campo tiene el contenido real
  const sourceHtml = header.html || header.content || '';
  const sourceCss = header.css || '';

  if (!sourceHtml) {
    console.log('❌ No hay contenido HTML para migrar');
    return;
  }

  console.log('\n📦 Migrando contenido...');
  console.log('  - Origen: campo "html" (' + sourceHtml.length + ' chars)');

  // Migrar a los campos correctos
  const updated = await prisma.page.update({
    where: { id: header.id },
    data: {
      name: 'Header Global',
      title: header.title || 'Header Global',
      gjsHtml: sourceHtml,
      gjsCss: sourceCss,
      publishedHtml: sourceHtml,
      publishedCss: sourceCss,
      isPublished: true,
      publishedAt: new Date(),
      // Crear estructura básica para GrapesJS
      gjsComponents: JSON.stringify([
        {
          tagName: 'div',
          components: [{ type: 'text', content: sourceHtml }]
        }
      ]),
      gjsStyles: JSON.stringify([]),
      grapesData: JSON.stringify({
        'gjs-html': sourceHtml,
        'gjs-css': sourceCss
      })
    }
  });

  console.log('\n✅ Header migrado exitosamente:');
  console.log('  - gjsHtml:', updated.gjsHtml?.length, 'chars');
  console.log('  - publishedHtml:', updated.publishedHtml?.length, 'chars');
  console.log('  - isPublished:', updated.isPublished);
  console.log('\n🎉 Ahora puedes:');
  console.log('  1. Ver el header en las páginas públicas');
  console.log('  2. Editarlo en: http://localhost:5173/admin/dashboard/editor/_header');
}

migrateHeader()
  .then(() => {
    console.log('\n✅ Migración completada');
    return prisma.$disconnect();
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    return prisma.$disconnect();
  });