import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findButtons() {
  try {
    const page = await prisma.page.findUnique({
      where: { slug: 'informacion-esal' },
      select: {
        slug: true,
        title: true,
        publishedHtml: true
      }
    });

    if (!page || !page.publishedHtml) {
      console.log('❌ Página no encontrada o sin HTML');
      return;
    }

    console.log('📄 Analizando:', page.title);
    
    // Buscar cualquier elemento con data-action-type
    const actionTypeMatches = page.publishedHtml.match(/data-action-type="[^"]*"/g);
    console.log('🔍 Atributos data-action-type encontrados:', actionTypeMatches?.length || 0);
    
    if (actionTypeMatches) {
      actionTypeMatches.forEach((match, index) => {
        console.log(`${index + 1}. ${match}`);
      });
    }
    
    // Buscar elementos que contengan data-action-type
    const elementMatches = page.publishedHtml.match(/<[^>]*data-action-type[^>]*>/g);
    console.log('\n🔘 Elementos con data-action-type:', elementMatches?.length || 0);
    
    if (elementMatches) {
      elementMatches.forEach((element, index) => {
        console.log(`\n🔘 Elemento ${index + 1}:`);
        console.log(element);
        
        // Buscar el contexto alrededor del elemento
        const elementIndex = page.publishedHtml!.indexOf(element);
        const start = Math.max(0, elementIndex - 100);
        const end = Math.min(page.publishedHtml!.length, elementIndex + element.length + 100);
        const context = page.publishedHtml!.substring(start, end);
        
        console.log('📝 Contexto:');
        console.log(context);
      });
    }
    
    // Verificar si hay elementos con class que podrían ser botones
    const buttonLikeElements = page.publishedHtml.match(/<[^>]*class="[^"]*btn[^"]*"[^>]*>/g);
    console.log('\n🎯 Elementos con clase "btn":', buttonLikeElements?.length || 0);
    
    if (buttonLikeElements) {
      buttonLikeElements.slice(0, 3).forEach((element, index) => {
        console.log(`${index + 1}. ${element}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findButtons();