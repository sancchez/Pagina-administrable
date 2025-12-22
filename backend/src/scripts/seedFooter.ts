
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const footerHtml = `
<footer class="bg-gradient-to-r from-blue-900 to-green-900 text-white">
  <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
      <div class="col-span-1 md:col-span-2">
        <h3 class="text-lg font-semibold mb-4 bg-gradient-to-r from-blue-200 to-green-200 bg-clip-text text-transparent">
          Acueducto Municipal
        </h3>
        <p class="text-blue-100">
          Comprometidos con brindar servicios de agua potable de calidad para nuestra comunidad,
          garantizando el acceso continuo y confiable al recurso hídrico.
        </p>
      </div>
      <div>
        <h4 class="text-md font-semibold mb-4 text-green-200">Servicios</h4>
        <ul class="space-y-2">
          <li>
            <a href="/portal-usuario" class="text-blue-100 hover:text-white transition-colors">
              Portal Usuario
            </a>
          </li>
          <li>
            <a href="/quienes-somos" class="text-blue-100 hover:text-white transition-colors">
              Quiénes Somos
            </a>
          </li>
          <li>
            <a href="/contacto" class="text-blue-100 hover:text-white transition-colors">
              Contacto
            </a>
          </li>
        </ul>
      </div>
      <div>
        <h4 class="text-md font-semibold mb-4 text-green-200">Información</h4>
        <ul class="space-y-2">
          <li>
            <a href="/informacion-esal" class="text-blue-100 hover:text-white transition-colors">
              Información ESAL
            </a>
          </li>
          <li>
            <a href="/operacion-gestion" class="text-blue-100 hover:text-white transition-colors">
              Operación y Gestión
            </a>
          </li>
          <li>
            <a href="/normatividad" class="text-blue-100 hover:text-white transition-colors">
              Normatividad
            </a>
          </li>
        </ul>
      </div>
    </div>
    <div class="mt-8 pt-8 border-t border-blue-800">
      <p class="text-center text-blue-200">
        © 2024 Acueducto Municipal. Todos los derechos reservados.
      </p>
    </div>
  </div>
</footer>
`;

async function seedFooter() {
  try {
    console.log('🌱 Verificando existencia del Footer...');

    const existingFooter = await prisma.page.findFirst({
      where: { slug: '_footer' }
    });

    if (existingFooter) {
      console.log('🔄 El footer ya existe. Actualizando contenido...');
      await prisma.page.update({
        where: { id: existingFooter.id },
        data: {
          title: 'Footer Global',
          content: 'Footer del sitio',
          html: footerHtml,
          publishedHtml: footerHtml,
          isActive: true,
          isPublished: true,
          updatedAt: new Date()
        }
      });
      console.log('✅ Footer actualizado correctamente.');
      return;
    }

    console.log('🛠 Creando página de Footer...');

    await prisma.page.create({
      data: {
        title: 'Footer Global',
        slug: '_footer',
        content: 'Footer del sitio',
        html: footerHtml,
        publishedHtml: footerHtml,
        isActive: true,
        isPublished: true,
      }
    });

    console.log('✅ Footer creado exitosamente.');

  } catch (error) {
    console.error('❌ Error al crear el footer:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedFooter();
