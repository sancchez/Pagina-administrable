import prisma from './src/config/database';

async function verificarTodasLasPaginasFooter() {
    try {
        console.log('\n🔍 BUSCANDO TODAS LAS PÁGINAS DE FOOTER\n');
        console.log('='.repeat(70));

        // Buscar TODAS las páginas que contengan "footer" en slug o título
        const footerPages = await prisma.page.findMany({
            where: {
                OR: [
                    { slug: { contains: 'footer' } },
                    { title: { contains: 'footer' } },
                    { title: { contains: 'Footer' } },
                ]
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        console.log(`\n📊 Encontradas ${footerPages.length} página(s) relacionadas con footer:\n`);

        footerPages.forEach((page, index) => {
            console.log(`\n${'─'.repeat(70)}`);
            console.log(`PÁGINA #${index + 1}`);
            console.log(`${'─'.repeat(70)}`);
            console.log(`ID: ${page.id}`);
            console.log(`Título: ${page.title}`);
            console.log(`Slug: ${page.slug}`);
            console.log(`Publicada: ${page.isPublished ? '✅ SÍ' : '❌ NO'}`);
            console.log(`Activa: ${page.isActive ? '✅ SÍ' : '❌ NO'}`);
            console.log(`\nContenido Draft:`);
            console.log(`  - gjsHtml: ${page.gjsHtml ? `${page.gjsHtml.length} caracteres` : '❌ VACÍO'}`);
            console.log(`  - gjsCss: ${page.gjsCss ? `${page.gjsCss.length} caracteres` : '❌ VACÍO'}`);
            console.log(`\nContenido Publicado:`);
            console.log(`  - publishedHtml: ${page.publishedHtml ? `${page.publishedHtml.length} caracteres` : '❌ VACÍO'}`);
            console.log(`  - publishedCss: ${page.publishedCss ? `${page.publishedCss.length} caracteres` : '❌ VACÍO'}`);
            console.log(`\nURL del Editor: http://localhost:5174/admin/dashboard/editor/${page.slug}`);

            if (page.gjsHtml) {
                console.log(`\nPREVIEW gjsHtml (primeros 200 caracteres):`);
                console.log(page.gjsHtml.substring(0, 200) + '...');
            }
        });

        console.log(`\n${'='.repeat(70)}\n`);

        if (footerPages.length === 0) {
            console.log('⚠️  NO SE ENCONTRÓ NINGUNA PÁGINA DE FOOTER');
        } else {
            console.log('💡 RECOMENDACIÓN:');
            console.log('   Abre la URL del editor de cada página para verificar cuál es la correcta.\n');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

verificarTodasLasPaginasFooter();
