
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const pages = await prisma.page.findMany({
        select: {
            id: true,
            title: true,
            slug: true,
            isActive: true,
            isPublished: true
        }
    });

    console.log('--- ALL PAGES IN DB ---');
    console.table(pages);
    console.log('Total pages:', pages.length);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
