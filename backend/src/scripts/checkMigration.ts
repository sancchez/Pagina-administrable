import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkMigration() {
  try {
    console.log('🔍 Verificando datos de migración...\n');
    
    // Buscar la página quienes-somos
    const page = await prisma.page.findUnique({
      where: { slug: 'quienes-somos' }
    });

    if (!page) {
      console.log('❌ Página "quienes-somos" no encontrada');
      return;
    }

    console.log(`📄 Página encontrada: ${page.title}`);
    console.log(`🔗 Slug: ${page.slug}`);
    console.log(`📊 gjsComponents length: ${page.gjsComponents?.length || 0}`);
    console.log(`🎨 gjsStyles length: ${page.gjsStyles?.length || 0}`);
    console.log(`📝 html length: ${page.html?.length || 0}`);
    
    if (page.gjsComponents && page.gjsComponents !== '[]' && page.gjsComponents !== '') {
      console.log('\n✅ gjsComponents contiene datos:');
      console.log(page.gjsComponents.substring(0, 200) + '...');
    } else {
      console.log('\n❌ gjsComponents está vacío o es array vacío');
    }

    if (page.gjsStyles && page.gjsStyles !== '[]' && page.gjsStyles !== '') {
      console.log('\n✅ gjsStyles contiene datos:');
      console.log(page.gjsStyles.substring(0, 200) + '...');
    } else {
      console.log('\n❌ gjsStyles está vacío o es array vacío');
    }

  } catch (error) {
    console.error('❌ Error verificando migración:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMigration();