
import { PrismaClient } from '@prisma/client';
import { PageService } from '../src/services/pageService';

const prisma = new PrismaClient();

async function main() {
    console.log('🧪 Testing Delete Functionality...');

    // 1. Create a dummy page
    const slug = `delete-test-${Date.now()}`;
    console.log(`Step 1: Creating test page with slug "${slug}"...`);

    const page = await prisma.page.create({
        data: {
            title: 'Delete Test Page',
            slug: slug,
            name: 'Delete Test Page',
            content: '<p>Test content</p>',
            isActive: true
        }
    });
    console.log(`   ✅ Created page ID: ${page.id}`);

    // 2. Verify it shows up in getPages via Service (mimicking Controller)
    console.log('Step 2: verifying it appears in getPages()...');
    let result = await PageService.getPages({ search: slug });
    const found = result.pages.find(p => p.id === page.id);
    if (found) {
        console.log('   ✅ Page found in list.');
    } else {
        console.error('   ❌ Page NOT found in list instantly after creation!');
        process.exit(1);
    }

    // 3. Delete the page
    console.log(`Step 3: Deleting page ID: ${page.id}...`);
    await PageService.deletePage(page.id);
    console.log('   ✅ deletePage() executed successfully.');

    // 4. Verify it does NOT show up in getPages
    console.log('Step 4: verifying it is GONE from getPages()...');
    result = await PageService.getPages({ search: slug }); // searching by slug to be specific
    const foundAfter = result.pages.find(p => p.id === page.id);

    if (!foundAfter) {
        console.log('   ✅ Page successfully hidden from list (Soft Deleted).');
    } else {
        console.error('   ❌ Page STILL VISIBLE in list after deletion!');
        console.log('      isActive:', foundAfter.isActive);
    }

    // 5. Verify database state directly
    const dbPage = await prisma.page.findUnique({ where: { id: page.id } });
    console.log(`Step 5: Direct DB check: ID ${page.id} isActive=${dbPage?.isActive}`);

    // Cleanup (optional, but good for test hygiene - hard delete)
    // await prisma.page.delete({ where: { id: page.id } });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
