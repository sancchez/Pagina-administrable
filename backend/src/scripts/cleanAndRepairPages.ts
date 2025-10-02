import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function hasGrapesComponents(grapesData: string | null): boolean {
  if (!grapesData) return false;
  try {
    const parsed = JSON.parse(grapesData);
    return !!(parsed.components && Array.isArray(parsed.components) && parsed.components.length > 0);
  } catch {
    return false;
  }
}

function hasGrapesStyles(grapesData: string | null): boolean {
  if (!grapesData) return false;
  try {
    const parsed = JSON.parse(grapesData);
    return !!(parsed.styles && Array.isArray(parsed.styles) && parsed.styles.length > 0);
  } catch {
    return false;
  }
}

async function cleanAndRepairPages() {
  console.log('🧹 Iniciando limpieza y reparación de páginas...\n');

  try {
    // Obtener todas las páginas
    const allPages = await prisma.page.findMany();
    console.log(`📊 Total de páginas encontradas: ${allPages.length}\n`);

    let repairedCount = 0;
    let deletedCount = 0;

    for (const page of allPages) {
      console.log(`🔍 Procesando página: ${page.title || page.slug || page.id}`);

      // Verificar si la página está completamente vacía
      const isCompletelyEmpty = (!page.name || page.name.trim() === '') &&
                               (!page.title || page.title.trim() === '') &&
                               (!page.content || page.content.trim() === '') &&
                               (!page.html || page.html.trim() === '') &&
                               (!page.css || page.css.trim() === '') &&
                               (!page.grapesData || page.grapesData.trim() === '');

      if (isCompletelyEmpty) {
        console.log(`   ❌ Página completamente vacía, eliminando: ${page.id}`);
        await prisma.page.delete({
          where: { id: page.id }
        });
        deletedCount++;
        continue;
      }

      // Reparar campos faltantes
      const updates: any = {};
      let needsUpdate = false;

      // Reparar nombre si está vacío
      if (!page.name || page.name.trim() === '') {
        updates.name = page.title || `Página ${page.slug}` || `Página ${page.id.substring(0, 8)}`;
        needsUpdate = true;
        console.log(`   🔧 Reparando nombre: "${updates.name}"`);
      }

      // Reparar grapesData si está vacío o no tiene componentes/estilos
      if (!page.grapesData || page.grapesData.trim() === '' || 
          !hasGrapesComponents(page.grapesData) || !hasGrapesStyles(page.grapesData)) {
        
        const basicGrapesData = {
          components: [
            {
              type: 'wrapper',
              components: [
                {
                  type: 'text',
                  content: page.content || page.title || 'Contenido de la página',
                  style: {
                    'padding': '20px',
                    'font-family': 'Arial, sans-serif'
                  }
                }
              ]
            }
          ],
          styles: [
            {
              selectors: ['body'],
              style: {
                'margin': '0',
                'padding': '0',
                'font-family': 'Arial, sans-serif'
              }
            }
          ]
        };
        
        updates.grapesData = JSON.stringify(basicGrapesData);
        needsUpdate = true;
        console.log(`   🔧 Reparando grapesData`);
      }

      // Reparar HTML si está vacío
      if (!page.html || page.html.trim() === '') {
        updates.html = `
          <div class="page-content">
            <h1>${page.title || page.name || 'Título de la página'}</h1>
            <div class="content">
              ${page.content || 'Contenido de la página'}
            </div>
          </div>
        `;
        needsUpdate = true;
        console.log(`   🔧 Reparando HTML`);
      }

      // Reparar CSS si está vacío
      if (!page.css || page.css.trim() === '') {
        updates.css = `
          .page-content {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            font-family: Arial, sans-serif;
          }
          
          .page-content h1 {
            color: #333;
            margin-bottom: 20px;
          }
          
          .content {
            line-height: 1.6;
            color: #666;
          }
        `;
        needsUpdate = true;
        console.log(`   🔧 Reparando CSS`);
      }

      // Reparar contenido si está vacío
      if (!page.content || page.content.trim() === '') {
        updates.content = `Contenido para ${page.title || page.name || 'esta página'}`;
        needsUpdate = true;
        console.log(`   🔧 Reparando contenido`);
      }

      // Aplicar actualizaciones si es necesario
      if (needsUpdate) {
        await prisma.page.update({
          where: { id: page.id },
          data: updates
        });
        console.log(`   ✅ Página reparada: ${page.title || page.name || page.id}`);
        repairedCount++;
      } else {
        console.log(`   ✅ Página ya está en buen estado`);
      }
    }

    console.log('\n🎉 LIMPIEZA Y REPARACIÓN COMPLETADA:');
    console.log(`🔧 Páginas reparadas: ${repairedCount}`);
    console.log(`🗑️  Páginas eliminadas: ${deletedCount}`);
    console.log(`📊 Total procesadas: ${allPages.length}`);
    console.log(`✅ Páginas restantes: ${allPages.length - deletedCount}\n`);

  } catch (error) {
    console.error('❌ Error durante la limpieza y reparación:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanAndRepairPages();