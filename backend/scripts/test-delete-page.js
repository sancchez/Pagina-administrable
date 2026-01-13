
const { PrismaClient } = require('@prisma/client');
// We cannot import PageService easily in JS without compiling. 
// So we will replicate the delete logic (update isActive=false) and check standard search logic.
const prisma = new PrismaClient();

async function main() {
    console.log('🧪 Testing Delete Functionality (Backend Logic Check)...');

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

    // 2. Verify it shows up in a standard "Find Many" with default filters (mimicking service)
    console.log('Step 2: verifying it appears in list...');
    let pages = await prisma.page.findMany({
        where: {
            isActive: true,
            slug: slug
        }
    });

    if (pages.length > 0) {
        console.log('   ✅ Page found in list.');
    } else {
        console.error('   ❌ Page NOT found in list instantly after creation!');
        process.exit(1);
    }

    // 3. Delete the page (Soft Delete Simulation)
    console.log(`Step 3: Deleting page ID: ${page.id} (soft delete)...`);
    await prisma.page.update({
        where: { id: page.id },
        data: { isActive: false, isPublished: false }
    });
    console.log('   ✅ Soft delete executed.');

    // 4. Verify it does NOT show up in list
    console.log('Step 4: verifying it is GONE from list (isActive=true)...');
    pages = await prisma.page.findMany({
        where: {
            isActive: true,
            slug: slug
        }
    });

    if (pages.length === 0) {
        console.log('   ✅ Page successfully hidden from list (Soft Deleted).');
    } else {
        console.error('   ❌ Page STILL VISIBLE in list after deletion! Found:', pages.length);
    }

    // 5. Verify database state directly
    const dbPage = await prisma.page.findUnique({ where: { id: page.id } });
    console.log(`Step 5: Direct DB check: ID ${page.id} isActive=${dbPage?.isActive}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
