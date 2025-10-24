import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface GrapesJSData {
  'gjs-html': string;
  'gjs-css': string;
  'gjs-components': any[];
  'gjs-styles': any[];
}

function hasValidGrapesData(grapesData: string | null): boolean {
  if (!grapesData) return false;
  try {
    const parsed = JSON.parse(grapesData);
    return !!(
      parsed['gjs-html'] && 
      parsed['gjs-css'] !== undefined &&
      Array.isArray(parsed['gjs-components']) && 
      Array.isArray(parsed['gjs-styles'])
    );
  } catch {
    return false;
  }
}

function generateDefaultGrapesData(page: any): GrapesJSData {
  // Crear contenido HTML básico basado en el título y contenido existente
  const title = page.title || page.name || 'Página sin título';
  const existingHtml = page.html || page.gjsHtml || '';
  const existingCss = page.css || page.gjsCss || '';
  
  // Si ya tiene HTML válido, usarlo como base
  let htmlContent = '';
  if (existingHtml && existingHtml.trim() !== '') {
    htmlContent = existingHtml;
  } else {
    // Generar HTML básico
    htmlContent = `
      <div class="page-container">
        <div class="page-header">
          <h1 class="page-title">${title}</h1>
        </div>
        <div class="page-content">
          <p>Contenido de la página ${title}. Esta página ha sido migrada automáticamente.</p>
          <p>Puedes editar este contenido usando el editor visual.</p>
        </div>
      </div>
    `;
  }

  // CSS básico mejorado
  let cssContent = existingCss || `
    .page-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    
    .page-header {
      text-align: center;
      margin-bottom: 3rem;
      padding-bottom: 2rem;
      border-bottom: 2px solid #e2e8f0;
    }
    
    .page-title {
      font-size: 2.5rem;
      font-weight: 700;
      color: #2c5aa0;
      margin: 0;
      text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .page-content {
      background: #f8fafc;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    }
    
    .page-content p {
      margin-bottom: 1.5rem;
      font-size: 1.1rem;
    }
    
    .page-content p:last-child {
      margin-bottom: 0;
    }
    
    @media (max-width: 768px) {
      .page-container {
        padding: 1rem;
      }
      
      .page-title {
        font-size: 2rem;
      }
      
      .page-content {
        padding: 1.5rem;
      }
    }
  `;

  // Componentes GrapesJS estructurados
  const components = [
    {
      type: 'wrapper',
      classes: ['page-container'],
      components: [
        {
          type: 'wrapper',
          classes: ['page-header'],
          components: [
            {
              type: 'text',
              content: `<h1 class="page-title">${title}</h1>`,
              classes: ['page-title']
            }
          ]
        },
        {
          type: 'wrapper',
          classes: ['page-content'],
          components: [
            {
              type: 'text',
              content: `<p>Contenido de la página ${title}. Esta página ha sido migrada automáticamente.</p>`,
            },
            {
              type: 'text',
              content: `<p>Puedes editar este contenido usando el editor visual.</p>`,
            }
          ]
        }
      ]
    }
  ];

  // Estilos GrapesJS
  const styles = [
    {
      selectors: ['.page-container'],
      style: {
        'max-width': '1200px',
        'margin': '0 auto',
        'padding': '2rem',
        'font-family': "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        'line-height': '1.6',
        'color': '#333'
      }
    },
    {
      selectors: ['.page-header'],
      style: {
        'text-align': 'center',
        'margin-bottom': '3rem',
        'padding-bottom': '2rem',
        'border-bottom': '2px solid #e2e8f0'
      }
    },
    {
      selectors: ['.page-title'],
      style: {
        'font-size': '2.5rem',
        'font-weight': '700',
        'color': '#2c5aa0',
        'margin': '0',
        'text-shadow': '0 2px 4px rgba(0,0,0,0.1)'
      }
    },
    {
      selectors: ['.page-content'],
      style: {
        'background': '#f8fafc',
        'padding': '2rem',
        'border-radius': '12px',
        'box-shadow': '0 4px 6px rgba(0,0,0,0.05)'
      }
    }
  ];

  return {
    'gjs-html': htmlContent.trim(),
    'gjs-css': cssContent.trim(),
    'gjs-components': components,
    'gjs-styles': styles
  };
}

async function migrateGrapesData() {
  console.log('🚀 Iniciando migración de datos GrapesJS...\n');

  try {
    // Obtener todas las páginas excepto "Quienes somos"
    const pages = await prisma.page.findMany({
      where: {
        NOT: {
          OR: [
            { slug: 'quienes-somos' },
            { title: { contains: 'Quienes somos' } },
            { title: { contains: 'quienes somos' } }
          ]
        }
      }
    });

    console.log(`📊 Encontradas ${pages.length} páginas para migrar (excluyendo "Quienes somos")\n`);

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const page of pages) {
      console.log(`🔄 Procesando: ${page.title} (${page.slug})`);

      try {
        // Verificar si ya tiene datos válidos de GrapesJS
        if (hasValidGrapesData(page.grapesData)) {
          console.log(`   ✅ Ya tiene datos válidos, omitiendo`);
          skippedCount++;
          continue;
        }

        // Generar nuevos datos de GrapesJS
        const newGrapesData = generateDefaultGrapesData(page);
        
        // Crear backup si tiene contenido previo
        if (page.grapesData || page.html || page.css) {
          await prisma.pageBackup.create({
            data: {
              pageId: page.id,
              title: `Backup antes de migración - ${page.title}`,
              gjsHtml: page.gjsHtml || page.html || '',
              gjsCss: page.gjsCss || page.css || '',
              gjsComponents: page.gjsComponents || '[]',
              gjsStyles: page.gjsStyles || '[]'
            }
          });
          console.log(`   💾 Backup creado`);
        }

        // Actualizar la página con los nuevos datos
        await prisma.page.update({
          where: { id: page.id },
          data: {
            grapesData: JSON.stringify(newGrapesData),
            gjsHtml: newGrapesData['gjs-html'],
            gjsCss: newGrapesData['gjs-css'],
            gjsComponents: JSON.stringify(newGrapesData['gjs-components']),
            gjsStyles: JSON.stringify(newGrapesData['gjs-styles']),
            html: newGrapesData['gjs-html'],
            css: newGrapesData['gjs-css'],
            content: `Contenido migrado para ${page.title}`,
            name: page.name || page.title || `Página ${page.slug}`,
            updatedAt: new Date()
          }
        });

        console.log(`   ✅ Migrada exitosamente`);
        migratedCount++;

      } catch (pageError) {
        console.error(`   ❌ Error procesando página ${page.id}:`, pageError);
        errorCount++;
      }
    }

    console.log('\n📋 RESUMEN DE MIGRACIÓN:');
    console.log(`✅ Páginas migradas: ${migratedCount}`);
    console.log(`⏭️  Páginas omitidas (ya válidas): ${skippedCount}`);
    console.log(`❌ Errores: ${errorCount}`);
    console.log(`📊 Total procesadas: ${pages.length}`);

    if (migratedCount > 0) {
      console.log('\n🎉 Migración completada exitosamente!');
      console.log('💡 Las páginas ahora deberían cargar correctamente en el editor.');
    }

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la migración
if (require.main === module) {
  migrateGrapesData()
    .then(() => {
      console.log('✅ Script de migración finalizado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en el script de migración:', error);
      process.exit(1);
    });
}

export { migrateGrapesData };