import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPages() {
  console.log('📊 Verificando páginas en la base de datos...\n');

  const pages = await prisma.page.findMany({
    select: {
      id: true,
      slug: true,
      title: true,
      isPublished: true,
      publishedHtml: true,
      html: true,
      updatedAt: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  console.log(`Total de páginas: ${pages.length}\n`);

  pages.forEach((page, index) => {
    console.log(`${index + 1}. ${page.title}`);
    console.log(`   Slug: ${page.slug}`);
    console.log(`   Publicada: ${page.isPublished ? '✅ Sí' : '❌ No'}`);
    console.log(`   publishedHtml: ${page.publishedHtml ? `${page.publishedHtml.length} caracteres` : '❌ vacío'}`);
    console.log(`   html (draft): ${page.html ? `${page.html.length} caracteres` : '❌ vacío'}`);
    console.log(`   Última actualización: ${page.updatedAt.toLocaleString()}`);
    console.log('');
  });

  // Verificar específicamente _header
  const header = pages.find(p => p.slug === '_header');
  if (header) {
    console.log('🎯 HEADER ENCONTRADO:');
    console.log(`   Publicada: ${header.isPublished ? '✅ Sí' : '❌ No - NECESITA PUBLICARSE'}`);
    console.log(`   publishedHtml: ${header.publishedHtml ? `✅ ${header.publishedHtml.length} caracteres` : '❌ VACÍO - NECESITA PUBLICARSE'}`);
  } else {
    console.log('⚠️ NO SE ENCONTRÓ LA PÁGINA _header');
    console.log('   Necesitas crear una página con slug "_header"');
  }

  await prisma.$disconnect();
}

checkPages().catch(console.error);
