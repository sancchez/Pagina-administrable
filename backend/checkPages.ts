import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPublishedPages() {
  try {
    const pages = await prisma.page.findMany({
      where: {
        publishedHtml: { not: null }
      },
      select: {
        slug: true,
        title: true,
        publishedHtml: true
      }
    });

    console.log('📄 Páginas publicadas encontradas:', pages.length);
    
    pages.forEach(page => {
      console.log('\n---');
      console.log('🔗 Slug:', page.slug);
      console.log('📝 Title:', page.title);
      console.log('📏 HTML length:', page.publishedHtml?.length || 0);
      
      const hasButtonActions = page.publishedHtml?.includes('data-action-type') || false;
      console.log('🔘 Contiene data-action-type:', hasButtonActions);
      
      const hasButtonScript = page.publishedHtml?.includes('button-actions.js') || false;
      console.log('📜 Contiene script button-actions.js:', hasButtonScript);
      
      if (hasButtonActions) {
        console.log('🔍 HTML snippet con botones:');
        const snippet = page.publishedHtml?.substring(0, 1000) || '';
        console.log(snippet);
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPublishedPages();