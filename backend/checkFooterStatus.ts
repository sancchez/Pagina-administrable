import prisma from './src/config/database';

async function checkFooterStatus() {
    try {
        // Buscar la página footer
        const footerPage = await prisma.page.findUnique({
            where: {
                slug: 'footer'
            }
        });

        if (footerPage) {
            console.log('\n✅ Página Footer encontrada:');
            console.log('ID:', footerPage.id);
            console.log('Título:', footerPage.title);
            console.log('Slug:', footerPage.slug);
            console.log('Publicada:', footerPage.isPublished);
            console.log('Activa:', footerPage.isActive);
            console.log('Tiene gjsHtml:', !!footerPage.gjsHtml);
            console.log('Tiene gjsCss:', !!footerPage.gjsCss);
            console.log('Tiene publishedHtml:', !!footerPage.publishedHtml);
            console.log('Tiene publishedCss:', !!footerPage.publishedCss);

            if (footerPage.publishedHtml) {
                console.log('\n📄 Preview de publishedHtml (primeros 200 caracteres):');
                console.log(footerPage.publishedHtml.substring(0, 200));
            }
        } else {
            console.log('\n❌ No se encontró página con slug "footer"');

            // Buscar páginas similares
            const similarPages = await prisma.page.findMany({
                where: {
                    OR: [
                        { slug: { contains: 'footer' } },
                        { title: { contains: 'footer' } },
                        { title: { contains: 'Footer' } },
                    ]
                },
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    isPublished: true,
                    isActive: true
                }
            });

            if (similarPages.length > 0) {
                console.log('\n📋 Páginas similares encontradas:');
                similarPages.forEach(p => {
                    console.log(`- ${p.title} (slug: ${p.slug}) - Publicada: ${p.isPublished}`);
                });
            }
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkFooterStatus();
