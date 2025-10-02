import prisma from '../src/config/database';

async function checkTableStructure() {
  try {
    console.log('Verificando estructura de la tabla pages...');
    
    // Obtener información de la tabla
    const result = await prisma.$queryRaw`PRAGMA table_info(pages);`;
    console.log('Estructura de la tabla pages:');
    console.log(result);
    
    // Intentar obtener una página para ver los campos disponibles
    const page = await prisma.page.findFirst();
    if (page) {
      console.log('\nCampos disponibles en el objeto page:');
      console.log(Object.keys(page));
      
      console.log('\nEjemplo de página:');
      console.log({
        id: page.id,
        title: page.title,
        slug: page.slug,
        // Verificar qué campos existen realmente
        hasGjsHtml: 'gjsHtml' in page,
        hasGjsCss: 'gjsCss' in page,
        hasGjsComponents: 'gjsComponents' in page,
        hasGjsStyles: 'gjsStyles' in page,
        hasHtml: 'html' in page,
        hasCss: 'css' in page,
        hasGrapesData: 'grapesData' in page,
        hasContent: 'content' in page
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTableStructure();