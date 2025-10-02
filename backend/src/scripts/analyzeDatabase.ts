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

async function analyzeDatabase() {
  console.log('🔍 Analizando estado de la base de datos...\n');

  try {
    const pages = await prisma.page.findMany();

    console.log(`📊 Total de páginas: ${pages.length}\n`);

    // Contadores de problemas
    const stats = {
      total: pages.length,
      missingName: pages.filter(p => !p.name || p.name.trim() === '').length,
      missingTitle: pages.filter(p => !p.title || p.title.trim() === '').length,
      missingSlug: pages.filter(p => !p.slug || p.slug.trim() === '').length,
      missingContent: pages.filter(p => !p.content || p.content.trim() === '').length,
      missingHtml: pages.filter(p => !p.html || p.html.trim() === '').length,
      missingCss: pages.filter(p => !p.css || p.css.trim() === '').length,
      missingGrapesData: pages.filter(p => !p.grapesData || p.grapesData.trim() === '').length,
      missingGjsComponents: pages.filter(p => !hasGrapesComponents(p.grapesData)).length,
      missingGjsStyles: pages.filter(p => !hasGrapesStyles(p.grapesData)).length,
    };

    // Buscar slugs duplicados
    const slugCounts = pages.reduce((acc, page) => {
      if (page.slug) {
        acc[page.slug] = (acc[page.slug] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const duplicatedSlugs = Object.entries(slugCounts).filter(([_, count]) => count > 1);

    // Páginas completamente vacías
    const emptyPages = pages.filter(page => 
      (!page.name || page.name.trim() === '') &&
      (!page.title || page.title.trim() === '') &&
      (!page.slug || page.slug.trim() === '') &&
      (!page.content || page.content.trim() === '') &&
      (!page.html || page.html.trim() === '') &&
      (!page.css || page.css.trim() === '') &&
      (!page.grapesData || page.grapesData.trim() === '')
    );

    // Páginas saludables (tienen datos básicos)
    const healthyPages = pages.filter(page => 
      page.name && page.name.trim() !== '' &&
      page.title && page.title.trim() !== '' &&
      page.slug && page.slug.trim() !== ''
    );

    console.log('🚨 PROBLEMAS DETECTADOS:\n');
    console.log(`❌ Páginas sin nombre: ${stats.missingName}`);
    console.log(`❌ Páginas sin título: ${stats.missingTitle}`);
    console.log(`❌ Páginas sin slug: ${stats.missingSlug}`);
    console.log(`❌ Páginas sin contenido: ${stats.missingContent}`);
    console.log(`❌ Páginas sin HTML: ${stats.missingHtml}`);
    console.log(`❌ Páginas sin CSS: ${stats.missingCss}`);
    console.log(`❌ Páginas sin datos GrapesJS: ${stats.missingGrapesData}`);
    console.log(`❌ Páginas sin componentes GrapesJS: ${stats.missingGjsComponents}`);
    console.log(`❌ Páginas sin estilos GrapesJS: ${stats.missingGjsStyles}\n`);

    console.log(`🔄 Slugs duplicados: ${duplicatedSlugs.length}`);
    console.log(`💀 Páginas completamente vacías: ${emptyPages.length}`);
    console.log(`✅ Páginas saludables: ${healthyPages.length}\n`);

    if (duplicatedSlugs.length > 0) {
      console.log('🔄 SLUGS DUPLICADOS:');
      duplicatedSlugs.forEach(([slug, count]) => {
        console.log(`   - "${slug}": ${count} páginas`);
      });
      console.log('');
    }

    console.log('📋 RESUMEN:');
    console.log(`Total: ${stats.total} páginas`);
    console.log(`Saludables: ${healthyPages.length}`);
    console.log(`Con problemas: ${stats.total - healthyPages.length}`);
    console.log(`Completamente vacías: ${emptyPages.length}\n`);

    // Mostrar ejemplos de páginas
    console.log('📄 PÁGINAS DE EJEMPLO:\n');
    const examplePages = pages.slice(0, 3);
    
    for (const page of examplePages) {
      console.log(`--- Página: ${page.title} ---`);
      console.log(`ID: ${page.id}`);
      console.log(`Título: ${page.title}`);
      console.log(`Slug: ${page.slug}`);
      console.log(`Contenido: ${page.content ? page.content.substring(0, 50) + '...' : 'VACÍO'}`);
      console.log(`HTML: ${page.html ? page.html.substring(0, 50) + '...' : 'VACÍO'}`);
      console.log(`GrapesJS Components: ${hasGrapesComponents(page.grapesData) ? 'PRESENTE' : 'VACÍO'}`);
      console.log(`Publicada: ${page.isPublished}`);
      console.log(`Activa: ${page.isActive}\n`);
    }

  } catch (error) {
    console.error('❌ Error durante el análisis:', error);
  } finally {
    await prisma.$disconnect();
  }
}

analyzeDatabase();