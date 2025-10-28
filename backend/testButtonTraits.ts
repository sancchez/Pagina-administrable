import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testButtonTraits() {
  try {
    console.log('🔍 Probando traits de botones...\n');
    
    // Buscar la página informacion-esal
    const page = await prisma.page.findFirst({
      where: { slug: 'informacion-esal' }
    });
    
    if (!page) {
      console.log('❌ Página informacion-esal no encontrada');
      return;
    }
    
    console.log(`📄 Página encontrada: ${page.title}`);
    console.log(`🆔 ID: ${page.id}\n`);
    
    // Verificar gjsHtml
    if (page.gjsHtml) {
      console.log('📝 Analizando gjsHtml...');
      
      // Buscar elementos button
      const buttonMatches = page.gjsHtml.match(/<button[^>]*>/g);
      console.log(`🔘 Botones encontrados: ${buttonMatches?.length || 0}`);
      
      if (buttonMatches) {
        buttonMatches.forEach((button, index) => {
          console.log(`\n🔘 Botón ${index + 1}:`);
          console.log(button);
          
          // Verificar atributos data-*
          const dataActionType = button.match(/data-action-type="([^"]*)"/);
          const dataUrl = button.match(/data-url="([^"]*)"/);
          const dataTarget = button.match(/data-target="([^"]*)"/);
          const dataTransactionId = button.match(/data-transaction-id="([^"]*)"/);
          const dataAmount = button.match(/data-amount="([^"]*)"/);
          
          console.log(`  ✅ data-action-type: ${dataActionType ? dataActionType[1] : '❌ NO ENCONTRADO'}`);
          console.log(`  ✅ data-url: ${dataUrl ? dataUrl[1] : '❌ NO ENCONTRADO'}`);
          console.log(`  ✅ data-target: ${dataTarget ? dataTarget[1] : '❌ NO ENCONTRADO'}`);
          console.log(`  ✅ data-transaction-id: ${dataTransactionId ? dataTransactionId[1] : '❌ NO ENCONTRADO'}`);
          console.log(`  ✅ data-amount: ${dataAmount ? dataAmount[1] : '❌ NO ENCONTRADO'}`);
        });
      }
      
      // También buscar elementos <a> que podrían ser botones
      const linkMatches = page.gjsHtml.match(/<a[^>]*data-action-type[^>]*>/g);
      console.log(`\n🔗 Enlaces con data-action-type: ${linkMatches?.length || 0}`);
      
      if (linkMatches) {
        linkMatches.forEach((link, index) => {
          console.log(`\n🔗 Enlace ${index + 1}:`);
          console.log(link);
        });
      }
    }
    
    // Verificar publishedHtml
    if (page.publishedHtml) {
      console.log('\n\n📰 Analizando publishedHtml...');
      
      // Buscar elementos con data-action-type
      const actionElements = page.publishedHtml.match(/<[^>]*data-action-type[^>]*>/g);
      console.log(`🎯 Elementos con data-action-type: ${actionElements?.length || 0}`);
      
      if (actionElements) {
        actionElements.forEach((element, index) => {
          console.log(`\n🎯 Elemento ${index + 1}:`);
          console.log(element);
        });
      }
      
      // Verificar si button-actions.js está inyectado
      const hasButtonScript = page.publishedHtml.includes('button-actions.js');
      console.log(`\n📜 button-actions.js inyectado: ${hasButtonScript ? '✅ SÍ' : '❌ NO'}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testButtonTraits();