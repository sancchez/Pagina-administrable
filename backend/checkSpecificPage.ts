import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSpecificPage() {
  try {
    const page = await prisma.page.findUnique({
      where: { slug: 'informacion-esal' },
      select: {
        slug: true,
        title: true,
        publishedHtml: true,
        gjsHtml: true
      }
    });

    if (!page) {
      console.log('❌ Página no encontrada');
      return;
    }

    console.log('📄 Página:', page.title);
    console.log('🔗 Slug:', page.slug);
    
    if (page.publishedHtml) {
      console.log('\n🔍 ANÁLISIS DEL HTML PUBLICADO:');
      console.log('📏 Longitud:', page.publishedHtml.length);
      
      // Buscar botones con data-action-type
      const buttonMatches = page.publishedHtml.match(/<button[^>]*data-action-type[^>]*>/g);
      console.log('🔘 Botones encontrados:', buttonMatches?.length || 0);
      
      if (buttonMatches) {
        buttonMatches.forEach((button, index) => {
          console.log(`\n🔘 Botón ${index + 1}:`);
          console.log(button);
          
          // Extraer atributos
          const actionType = button.match(/data-action-type="([^"]*)"/) || button.match(/data-action-type='([^']*)'/) || button.match(/data-action-type=([^\s>]*)/);
          const url = button.match(/data-url="([^"]*)"/) || button.match(/data-url='([^']*)'/) || button.match(/data-url=([^\s>]*)/);
          const target = button.match(/data-target="([^"]*)"/) || button.match(/data-target='([^']*)'/) || button.match(/data-target=([^\s>]*)/);
          
          console.log('  - Action Type:', actionType?.[1] || 'NO ENCONTRADO');
          console.log('  - URL:', url?.[1] || 'NO ENCONTRADO');
          console.log('  - Target:', target?.[1] || 'NO ENCONTRADO');
        });
      }
      
      // Verificar si el script está inyectado
      const hasScript = page.publishedHtml.includes('button-actions.js');
      console.log('\n📜 Script button-actions.js inyectado:', hasScript);
      
      if (hasScript) {
        const scriptMatch = page.publishedHtml.match(/<script[^>]*button-actions\.js[^>]*><\/script>/);
        console.log('📜 Script tag:', scriptMatch?.[0] || 'NO ENCONTRADO');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSpecificPage();