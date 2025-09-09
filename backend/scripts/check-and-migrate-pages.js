const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAndMigratePages() {
  try {
    console.log('🔍 Verificando páginas en la base de datos...');
    
    // Obtener todas las páginas
    const pages = await prisma.page.findMany({
      orderBy: { id: 'asc' }
    });
    
    console.log(`📊 Total de páginas encontradas: ${pages.length}`);
    console.log('\n📋 Lista de páginas:');
    
    pages.forEach((page, index) => {
      console.log(`${index + 1}. ID: ${page.id} | Slug: ${page.slug} | Título: ${page.title}`);
      console.log(`   Publicada: ${page.published ? '✅' : '❌'} | Contenido: ${page.content ? page.content.substring(0, 100) + '...' : 'Sin contenido'}`);
      console.log('---');
    });
    
    // Verificar si las páginas tienen contenido HTML rico
    const pagesWithRichContent = pages.filter(page => 
      page.content && 
      (page.content.includes('<div') || 
       page.content.includes('style=') || 
       page.content.includes('class=') ||
       page.content.includes('<svg'))
    );
    
    console.log(`\n🎨 Páginas con contenido rico (HTML/CSS): ${pagesWithRichContent.length}`);
    pagesWithRichContent.forEach(page => {
      console.log(`- ${page.title} (${page.slug})`);
    });
    
    // Verificar páginas sin contenido rico
    const pagesWithPlainContent = pages.filter(page => 
      !page.content || 
      (!page.content.includes('<div') && 
       !page.content.includes('style=') && 
       !page.content.includes('class=') &&
       !page.content.includes('<svg'))
    );
    
    console.log(`\n📝 Páginas con contenido simple/sin estilos: ${pagesWithPlainContent.length}`);
    pagesWithPlainContent.forEach(page => {
      console.log(`- ${page.title} (${page.slug})`);
    });
    
    console.log('\n✅ Verificación completada.');
    
  } catch (error) {
    console.error('❌ Error al verificar páginas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndMigratePages();