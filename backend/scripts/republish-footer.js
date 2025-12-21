const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function republishFooter() {
  try {
    const footer = await prisma.page.findUnique({
      where: { slug: '_footer' }
    });

    if (!footer) {
      console.error('Footer no encontrado');
      process.exit(1);
    }

    console.log('Footer encontrado:', {
      id: footer.id,
      slug: footer.slug,
      gjsCssLen: footer.gjsCss?.length || 0,
      publishedCssLen: footer.publishedCss?.length || 0
    });

    // Actualizar publishedCss con gjsCss
    const updated = await prisma.page.update({
      where: { id: footer.id },
      data: {
        publishedCss: footer.gjsCss,
        publishedAt: new Date(),
        updatedAt: new Date()
      }
    });

    console.log('Footer republicado exitosamente:', {
      publishedCssLen: updated.publishedCss?.length || 0
    });

    await prisma.$disconnect();
    process.exit(0);
  } catch (e) {
    console.error('Error:', e);
    await prisma.$disconnect();
    process.exit(1);
  }
}

republishFooter();
