import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPage() {
    try {
        const page = await prisma.page.findUnique({
            where: { slug: 'portal-usuario' }
        });

        if (!page) {
            console.log('Page not found');
            return;
        }

        console.log('--- PAGE INFO ---');
        console.log('ID:', page.id);
        console.log('Slug:', page.slug);
        console.log('HTML Length:', page.publishedHtml?.length || page.html?.length || 0);

        const html = page.publishedHtml || page.html || '';
        if (html.toLowerCase().includes('site-footer') || html.toLowerCase().includes('footer')) {
            console.log('⚠️ ALERT: The page content contains footer-related strings!');
            // Find where 'footer' appears
            const index = html.toLowerCase().indexOf('footer');
            console.log('Snippet around first "footer":', html.substring(Math.max(0, index - 100), Math.min(html.length, index + 300)));
        } else {
            console.log('No footer strings found in page content.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkPage();
