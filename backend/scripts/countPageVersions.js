const { PrismaClient } = require('@prisma/client');
(async () => {
  const prisma = new PrismaClient();
  try {
    const total = await prisma.pageVersion.count();
    console.log('page_versions', total);
    const topPages = await prisma.page.findMany({
      select: { id: true, slug: true },
      orderBy: { updatedAt: 'desc' },
      take: 10
    });
    console.log('recent pages (id, slug):', topPages);
  } catch (e) {
    console.error('error', e);
  } finally {
    await prisma.$disconnect();
  }
})();