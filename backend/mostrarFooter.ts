import prisma from './src/config/database';

async function mostrarContenidoFooter() {
    try {
        const footer = await prisma.page.findUnique({
            where: { slug: '_footer' }
        });

        if (!footer) {
            console.log('NO EXISTE _footer');

            // Buscar footer sin guion bajo
            const footerSinGuion = await prisma.page.findUnique({
                where: { slug: 'footer' }
            });

            if (footerSinGuion) {
                console.log('EXISTE footer (sin guion bajo)');
                console.log('slug:', footerSinGuion.slug);
                console.log('gjsHtml length:', footerSinGuion.gjsHtml?.length || 0);
            }
            return;
        }

        console.log('FOOTER ENCONTRADO:');
        console.log('slug:', footer.slug);
        console.log('title:', footer.title);
        console.log('gjsHtml length:', footer.gjsHtml?.length || 0);
        console.log('publishedHtml length:', footer.publishedHtml?.length || 0);

        console.log('\n--- INICIO gjsHtml ---');
        console.log(footer.gjsHtml?.substring(0, 500) || 'VACIO');
        console.log('--- FIN gjsHtml ---');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

mostrarContenidoFooter();
