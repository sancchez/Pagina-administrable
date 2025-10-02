import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestPage() {
  try {
    console.log('🧪 Creando página de prueba...');
    
    // Crear una página con contenido TSX simple
    const testPage = await prisma.page.create({
      data: {
        name: 'Página de Prueba Simple',
        title: 'Página de Prueba Simple',
        slug: 'prueba-simple',
        content: `
          <Layout>
            <Hero title="Página de Prueba" subtitle="Esta es una página de prueba para validar el flujo" />
            <Target>
              <Card title="Prueba 1" content="Este es el primer elemento de prueba" icon="🧪" />
              <Card title="Prueba 2" content="Este es el segundo elemento de prueba" icon="✅" />
            </Target>
          </Layout>
        `,
        metaTitle: 'Página de Prueba Simple',
        metaDescription: 'Una página de prueba para validar el flujo de migración',
        isPublished: true,
        isActive: true
      }
    });
    
    console.log('✅ Página de prueba creada:', testPage.slug);
    console.log('📄 ID:', testPage.id);
    
  } catch (error) {
    console.error('❌ Error creando página de prueba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createTestPage();
}

export { createTestPage };