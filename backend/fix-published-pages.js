const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixPublishedPages() {
  try {
    console.log('🔧 Actualizando páginas para establecer published: true...');
    
    // Actualizar todas las páginas para que estén publicadas
    const result = await prisma.page.updateMany({
      where: {
        published: {
          not: true
        }
      },
      data: {
        published: true
      }
    });
    
    console.log(`✅ ${result.count} páginas actualizadas exitosamente`);
    
    // Verificar el estado actual
    const allPages = await prisma.page.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        published: true
      }
    });
    
    console.log('📋 Estado actual de las páginas:');
    allPages.forEach(page => {
      console.log(`  - ${page.title} (${page.slug}): ${page.published ? '✅ Publicada' : '❌ No publicada'}`);
    });
    
  } catch (error) {
    console.error('❌ Error al actualizar páginas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixPublishedPages();