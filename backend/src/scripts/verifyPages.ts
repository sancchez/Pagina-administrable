import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.page.count();
  console.log('PAGE_COUNT:', count);

  const pages = await prisma.page.findMany({
    select: { id: true, slug: true, title: true, isPublished: true },
    orderBy: { slug: 'asc' }
  });

  console.log('PAGES:');
  for (const p of pages) {
    console.log(`- id=${p.id} slug=${p.slug} title=${p.title} published=${p.isPublished}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });