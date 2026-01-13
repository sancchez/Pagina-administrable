
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Fetching all pages...');
    const pages = await prisma.page.findMany();
    console.log(`Found ${pages.length} pages:`);
    pages.forEach(p => {
        console.log(`- ID: ${p.id}, Title: ${p.title}, Slug: ${p.slug}, isActive: ${p.isActive}, isPublished: ${p.isPublished}`);
    });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
