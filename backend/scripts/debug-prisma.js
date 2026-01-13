
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Connecting...');
        await prisma.$connect();
        console.log('Connected!');

        // List all models if possible, or just count pages
        const count = await prisma.page.count();
        console.log(`Page count: ${count}`);

    } catch (e) {
        console.log('FULL ERROR MESSAGE:');
        console.log(e.message);
        if (e.code) console.log('ERROR CODE:', e.code);
        if (e.meta) console.log('ERROR META:', JSON.stringify(e.meta, null, 2));
    } finally {
        await prisma.$disconnect();
    }
}

main();
