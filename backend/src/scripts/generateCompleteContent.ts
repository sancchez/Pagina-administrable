import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function generateCompleteContent() {
  console.log('🚀 Generando contenido completo para todas las páginas\n');

  try {
    // Obtener todas las páginas
    const pages = await prisma.page.findMany();

    console.log(`📊 Encontradas ${pages.length} páginas para procesar\n`);

    let processedCount = 0;
    let updatedCount = 0;

    for (const page of pages) {
      console.log(`🔄 Procesando página: ${page.title} (${page.slug})`);

      let needsUpdate = false;
      const updateData: any = {};

      // Verificar si necesita contenido
      if (!page.content || page.content.trim() === '') {
        updateData.content = `Contenido de la página ${page.title}. Esta página contiene información importante sobre ${page.title.toLowerCase()} en el portal ESAL.`;
        needsUpdate = true;
        console.log(`   📝 Generando contenido`);
      }

      // Verificar si necesita grapesData
      if (!page.grapesData) {
        const defaultGrapesData = {
          components: [
            {
              type: 'wrapper',
              components: [
                {
                  type: 'text',
                  content: `<h1>${page.title}</h1>`,
                  style: {
                    'text-align': 'center',
                    'padding': '2rem 0',
                    'color': '#2c5aa0',
                    'font-size': '2.5rem'
                  }
                },
                {
                  type: 'text',
                  content: `<p>Bienvenido a la página de ${page.title}. Aquí encontrarás toda la información relevante sobre nuestros servicios.</p>`,
                  style: {
                    'text-align': 'center',
                    'padding': '1rem 2rem',
                    'font-size': '1.2rem',
                    'color': '#666'
                  }
                },
                {
                  type: 'text',
                  content: `<div class="content-section"><h2>Información Principal</h2><p>Esta sección contiene la información principal de ${page.title.toLowerCase()}.</p></div>`,
                  style: {
                    'padding': '2rem',
                    'background': '#f8fafc',
                    'margin': '2rem',
                    'border-radius': '8px'
                  }
                }
              ],
              style: {
                'min-height': '100vh',
                'font-family': 'Segoe UI, sans-serif'
              }
            }
          ],
          styles: [
            {
              selectors: ['wrapper'],
              style: {
                'min-height': '100vh',
                'font-family': 'Segoe UI, sans-serif',
                'background': '#ffffff'
              }
            },
            {
              selectors: ['text'],
              style: {
                'line-height': '1.6'
              }
            },
            {
              selectors: ['content-section'],
              style: {
                'padding': '2rem',
                'background': '#f8fafc',
                'border-radius': '8px',
                'margin': '1rem 0'
              }
            }
          ]
        };

        updateData.grapesData = JSON.stringify(defaultGrapesData);
        needsUpdate = true;
        console.log(`   🎨 Generando datos GrapesJS`);
      }

      // Verificar metaTitle y metaDescription
      if (!page.metaTitle) {
        updateData.metaTitle = `${page.title} - Portal ESAL`;
        needsUpdate = true;
        console.log(`   🏷️ Generando meta título`);
      }

      if (!page.metaDescription) {
        updateData.metaDescription = `Información sobre ${page.title.toLowerCase()} en el portal oficial de ESAL - Empresa de Servicios de Acueducto y Alcantarillado`;
        needsUpdate = true;
        console.log(`   📄 Generando meta descripción`);
      }

      // Actualizar si es necesario
      if (needsUpdate) {
        updateData.updatedAt = new Date();
        
        await prisma.page.update({
          where: { id: page.id },
          data: updateData
        });

        updatedCount++;
        console.log(`   ✅ Página actualizada`);
      } else {
        console.log(`   ⏭️ Página ya completa`);
      }

      processedCount++;
      console.log(''); // Línea en blanco
    }

    console.log('🎉 GENERACIÓN DE CONTENIDO COMPLETADA\n');
    console.log(`📊 RESUMEN:`);
    console.log(`   📄 Páginas procesadas: ${processedCount}`);
    console.log(`   ✅ Páginas actualizadas: ${updatedCount}`);
    console.log(`   ⏭️ Páginas ya completas: ${processedCount - updatedCount}`);

    // Análisis final
    console.log('\n🔍 ANÁLISIS FINAL:');
    
    const finalPages = await prisma.page.findMany();
    const stats = {
      total: finalPages.length,
      withContent: finalPages.filter(p => p.content && p.content.trim() !== '').length,
      withHtml: finalPages.filter(p => p.html && p.html.trim() !== '').length,
      withCss: finalPages.filter(p => p.css && p.css.trim() !== '').length,
      withGrapesData: finalPages.filter(p => p.grapesData && p.grapesData.trim() !== '').length,
      withMetaTitle: finalPages.filter(p => p.metaTitle && p.metaTitle.trim() !== '').length,
      withMetaDescription: finalPages.filter(p => p.metaDescription && p.metaDescription.trim() !== '').length,
      published: finalPages.filter(p => p.isPublished).length,
      active: finalPages.filter(p => p.isActive).length
    };

    console.log(`   📊 Total de páginas: ${stats.total}`);
    console.log(`   📝 Con contenido: ${stats.withContent}/${stats.total}`);
    console.log(`   🌐 Con HTML: ${stats.withHtml}/${stats.total}`);
    console.log(`   🎨 Con CSS: ${stats.withCss}/${stats.total}`);
    console.log(`   🍇 Con datos GrapesJS: ${stats.withGrapesData}/${stats.total}`);
    console.log(`   🏷️ Con meta título: ${stats.withMetaTitle}/${stats.total}`);
    console.log(`   📄 Con meta descripción: ${stats.withMetaDescription}/${stats.total}`);
    console.log(`   📢 Publicadas: ${stats.published}/${stats.total}`);
    console.log(`   ✅ Activas: ${stats.active}/${stats.total}`);

    if (stats.withContent === stats.total && 
        stats.withHtml === stats.total && 
        stats.withCss === stats.total && 
        stats.withGrapesData === stats.total) {
      console.log('\n🎊 ¡TODAS LAS PÁGINAS ESTÁN COMPLETAS!');
    } else {
      console.log('\n⚠️ Algunas páginas aún necesitan datos adicionales');
    }

  } catch (error) {
    console.error('❌ Error durante la generación de contenido:', error);
  } finally {
    await prisma.$disconnect();
  }
}

generateCompleteContent();