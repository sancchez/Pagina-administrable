import prisma from './src/config/database';

async function debugHtml() {
  try {
    const page = await prisma.page.findUnique({
      where: { slug: 'informacion-esal' },
      select: {
        slug: true,
        title: true,
        gjsHtml: true,
        publishedHtml: true
      }
    });

    if (!page) {
      console.log('❌ Página no encontrada');
      return;
    }

    console.log('📄 Página:', page.title);
    console.log('🔗 Slug:', page.slug);
    console.log('\n📝 GJS HTML (original):');
    console.log('Longitud:', page.gjsHtml?.length || 0);
    
    if (page.gjsHtml) {
      // Buscar data-action-type en el HTML original
      const actionTypeMatches = page.gjsHtml.match(/data-action-type="[^"]*"/g);
      console.log('🎯 data-action-type encontrados en gjsHtml:', actionTypeMatches?.length || 0);
      if (actionTypeMatches) {
        actionTypeMatches.forEach((match, i) => {
          console.log(`  ${i + 1}. ${match}`);
        });
      }

      // Buscar scripts con handleClick
      const scriptMatches = page.gjsHtml.match(/<script[^>]*>[\s\S]*?function\s+handleClick[\s\S]*?<\/script>/g);
      console.log('📜 Scripts con handleClick en gjsHtml:', scriptMatches?.length || 0);
    }

    console.log('\n📰 Published HTML (procesado):');
    console.log('Longitud:', page.publishedHtml?.length || 0);
    
    if (page.publishedHtml) {
      // Buscar data-action-type en el HTML publicado
      const actionTypeMatches = page.publishedHtml.match(/data-action-type="[^"]*"/g);
      console.log('🎯 data-action-type encontrados en publishedHtml:', actionTypeMatches?.length || 0);
      if (actionTypeMatches) {
        actionTypeMatches.forEach((match, i) => {
          console.log(`  ${i + 1}. ${match}`);
        });
      }

      // Buscar button-actions.js
      const buttonScript = page.publishedHtml.includes('button-actions.js');
      console.log('📜 button-actions.js presente:', buttonScript);

      // Buscar scripts con handleClick
      const scriptMatches = page.publishedHtml.match(/<script[^>]*>[\s\S]*?function\s+handleClick[\s\S]*?<\/script>/g);
      console.log('📜 Scripts con handleClick en publishedHtml:', scriptMatches?.length || 0);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugHtml();