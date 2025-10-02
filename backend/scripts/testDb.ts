import prisma from '../src/config/database';

async function testDatabase() {
  try {
    console.log('Probando conexión a la base de datos...');
    
    // Verificar conexión
    await prisma.$connect();
    console.log('✅ Conexión exitosa');
    
    // Contar usuarios
    const userCount = await prisma.user.count();
    console.log(`👥 Usuarios en la base de datos: ${userCount}`);
    
    // Contar páginas
    const pageCount = await prisma.page.count();
    console.log(`📄 Páginas en la base de datos: ${pageCount}`);
    
    // Listar algunas páginas
    const pages = await prisma.page.findMany({
      take: 3,
      select: {
        id: true,
        title: true,
        slug: true,
        createdAt: true
      }
    });
    
    console.log('\n📋 Primeras páginas:');
    pages.forEach(page => {
      console.log(`  - ${page.title} (${page.slug}) - ID: ${page.id}`);
    });
    
    // Probar obtener una página específica
    if (pages.length > 0) {
      const firstPage = await prisma.page.findUnique({
        where: { id: pages[0].id }
      });
      
      if (firstPage) {
        console.log(`\n✅ Página encontrada: ${firstPage.title}`);
        console.log(`   HTML length: ${firstPage.gjsHtml?.length || 0}`);
        console.log(`   CSS length: ${firstPage.gjsCss?.length || 0}`);
        console.log(`   Components length: ${firstPage.gjsComponents?.length || 0}`);
        console.log(`   Styles length: ${firstPage.gjsStyles?.length || 0}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();