
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Checking for missing pages...');

    const pagesToCheck = [
        { slug: 'contactos', title: 'Contactos', content: '<h1>Contactos</h1><p>Esta es la página de contactos.</p>' },
        { slug: 'footer', title: 'Footer', content: '<footer>Footer Content</footer>' },
        { slug: '_footer', title: 'Footer Global', content: '<footer>Global Footer Content</footer>' }
    ];

    for (const p of pagesToCheck) {
        const existing = await prisma.page.findFirst({
            where: {
                slug: p.slug
            }
        });

        if (existing) {
            console.log(`✅ Page found: "${existing.title}" (slug: ${existing.slug})`);
            console.log(`   - ID: ${existing.id}`);
            console.log(`   - isActive: ${existing.isActive}`);
            console.log(`   - isPublished: ${existing.isPublished}`);

            if (!existing.isActive) {
                console.log(`   ⚠️ Page is INACTIVE (Soft Deleted). Reactivating...`);
                await prisma.page.update({
                    where: { id: existing.id },
                    data: { isActive: true }
                });
                console.log(`   ✨ Page reactivated!`);
            }
        } else {
            console.log(`❌ Page NOT found: (slug: ${p.slug})`);
            // User asked to fix missing pages. "Contactos" and "Footer" are essential.
            // We will create them if they don't exist, but only valid ones.
            // The user mentioned "contactos" and "footer".
            // _footer is used in seed, so it might be the real one.

            if (p.slug === 'contactos' || p.slug === 'footer') {
                // Strategy: Create valid placeholders if truly missing.
                // Note: If '_footer' exists, maybe 'footer' isn't needed, but I'll create it if requested.
            }
        }
    }

    // Double check "contactos" specifically, as it's a common user page
    const contactos = await prisma.page.findFirst({ where: { slug: 'contactos' } });
    if (!contactos) {
        console.log('🛠️ Creating "contactos" page...');
        await prisma.page.create({
            data: {
                title: 'Contactos',
                slug: 'contactos',
                name: 'Contactos',
                content: '<h1>Contactos</h1><p>Póngase en contacto con nosotros.</p>',
                isActive: true,
                isPublished: false
            }
        });
        console.log('✨ "contactos" page created.');
    }

    // Check footer - usually `_footer` is the system one, but user said "footer". 
    // I will check if `_footer` exists (from seed) and if not create it.
    const underscoreFooter = await prisma.page.findFirst({ where: { slug: '_footer' } });
    const normalFooter = await prisma.page.findFirst({ where: { slug: 'footer' } });

    if (!underscoreFooter && !normalFooter) {
        console.log('🛠️ Creating "_footer" page (system default)...');
        await prisma.page.create({
            data: {
                title: 'Footer',
                slug: '_footer',
                name: 'Footer',
                content: '<footer><p>Footer content</p></footer>',
                isActive: true,
                isPublished: true
            }
        });
        console.log('✨ "_footer" page created.');
    } else {
        if (underscoreFooter && !underscoreFooter.isActive) {
            console.log('   ⚠️ "_footer" is INACTIVE. Reactivating...');
            await prisma.page.update({ where: { id: underscoreFooter.id }, data: { isActive: true } });
            console.log('   ✨ "_footer" reactivated.');
        }
    }

}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
