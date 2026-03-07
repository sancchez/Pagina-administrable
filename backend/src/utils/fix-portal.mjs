import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixPortalPage() {
    try {
        const page = await prisma.page.findUnique({
            where: { slug: 'portal-usuario' }
        });

        if (!page) {
            console.log('Page not found');
            return;
        }

        const oldCss = page.publishedCss || '';
        const newCss = oldCss.replace(/height:\s*537px;?/gi, 'min-height: 537px;');

        const oldGjsCss = page.css || '';
        const newGjsCss = oldGjsCss.replace(/height:\s*537px;?/gi, 'min-height: 537px;');

        if (oldCss === newCss && oldGjsCss === newGjsCss) {
            console.log('No fixed height found to fix, or already fixed.');
        } else {
            await prisma.page.update({
                where: { slug: 'portal-usuario' },
                data: {
                    publishedCss: newCss,
                    css: newGjsCss
                }
            });
            console.log('✅ Page CSS updated! Fixed height changed to min-height.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixPortalPage();
