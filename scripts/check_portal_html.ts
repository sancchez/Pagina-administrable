import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPageContent() {
    try {
        const page = await prisma.page.findUnique({
            where: { slug: 'portal-usuario' }
        });

        if (!page) {
            console.log('Page "portal-usuario" not found');
            return;
        }

        const html = page.publishedHtml || page.html || '';
        console.log('--- SLUG: portal-usuario ---');
        console.log('HTML Length:', html.length);
        console.log('HTML Start (200 chars):', html.substring(0, 200));
        console.log('HTML End (200 chars):', html.substring(Math.max(0, html.length - 200)));

        if (html.toLowerCase().includes('entendiendo nuestra factura')) {
            console.log('✅ Found "Entendiendo nuestra factura" in DB content');
            const index = html.toLowerCase().indexOf('entendiendo nuestra factura');
            console.log('Context around "Entendiendo nuestra factura":', html.substring(index - 100, index + 300));
        }

        if (html.toLowerCase().includes('site-footer') || html.toLowerCase().includes('footer')) {
            console.log('⚠️ ALERT: Page content contains "footer" strings');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkPageContent();
