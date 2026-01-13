import prisma from './src/config/database';

async function checkFooter() {
    try {
        // Buscar todas las páginas que contengan 'footer' en su slug
        const footerPages = await prisma.page.findMany({
            where: {
                slug: {
                    contains: 'footer'
                }
            },
            select: {
                id: true,
                title: true,
                slug: true,
                isPublished: true,
                isActive: true,
                createdAt: true,
                updatedAt: true
            }
        });

        console.log('\n📋 Páginas con "footer" en el slug:');
        console.log(JSON.stringify(footerPages, null, 2));

        // Buscar todas las páginas activas
        const allActivePages = await prisma.page.findMany({
            where: {
                isActive: true
            },
            select: {
                id: true,
                title: true,
                slug: true,
                isPublished: true
            },
            orderBy: {
                slug: 'asc'
            }
        });

        console.log('\n\n📄 Todas las páginas activas:');
        console.log(JSON.stringify(allActivePages, null, 2));

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkFooter();
