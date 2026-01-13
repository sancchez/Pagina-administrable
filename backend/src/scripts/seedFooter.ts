
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const footerHtml = `<footer class="bg-gradient-to-r from-blue-900 to-green-900 text-white">
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
          <li><a href="/portal-usuario" class="text-blue-100 hover:text-white transition-colors">Portal Usuario</a></li>
          <li><a href="/quienes-somos" class="text-blue-100 hover:text-white transition-colors">Quiénes Somos</a></li>
          <li><a href="/contacto" class="text-blue-100 hover:text-white transition-colors">Contacto</a></li>
        </ul>
      </div>
      <div>
        <h4 class="text-md font-semibold mb-4 text-green-200">Información</h4>
        <ul class="space-y-2">
          <li><a href="/informacion-esal" class="text-blue-100 hover:text-white transition-colors">Información ESAL</a></li>
          <li><a href="/operacion-gestion" class="text-blue-100 hover:text-white transition-colors">Operación y Gestión</a></li>
          <li><a href="/normatividad" class="text-blue-100 hover:text-white transition-colors">Normatividad</a></li>
        </ul>
      </div>
    </div>
    <div class="mt-8 pt-8 border-t border-blue-800">
      <p class="text-center text-blue-200">
        © 2024 Acueducto Municipal. Todos los derechos reservados.
      </p>
    </div>
  </div>
</footer>`;

const footerCss = `
/* Estilos del footer */
footer {
  background: linear-gradient(to right, #1e3a8a, #14532d);
  color: white;
  padding: 3rem 0;
}

footer .max-w-7xl {
  max-width: 80rem;
  margin: 0 auto;
  padding: 0 1rem;
}

footer .grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 768px) {
  footer .grid {
    grid-template-columns: repeat(4, 1fr);
  }
  footer .col-span-1.md\\:col-span-2 {
    grid-column: span 2;
  }
}

footer h3, footer h4 {
  font-weight: 600;
  margin-bottom: 1rem;
}

footer h3 {
  font-size: 1.125rem;
  background: linear-gradient(to right, #bfdbfe, #bbf7d0);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

footer h4 {
  color: #bbf7d0;
}

footer p {
  color: #dbeafe;
}

footer ul {
  list-style: none;
  padding: 0;
}

footer ul li {
  margin-top: 0.5rem;
}

footer a {
  color: #dbeafe;
  text-decoration: none;
  transition: color 0.15s;
}

footer a:hover {
  color: white;
}

footer .border-t {
  border-top: 1px solid #1e40af;
  margin-top: 2rem;
  padding-top: 2rem;
}

footer .text-center {
  text-align: center;
}

footer .text-blue-200 {
  color: #bfdbfe;
}
`;

const gjsComponents = JSON.stringify([
  {
    tagName: 'footer',
    type: 'footer',
    classes: ['bg-gradient-to-r', 'from-blue-900', 'to-green-900', 'text-white'],
    components: footerHtml
  }
]);

const gjsStyles = JSON.stringify([]);

async function seedFooter() {
  try {
    console.log('🌱 Verificando existencia del Footer...');

    const existingFooter = await prisma.page.findFirst({
      where: { slug: '_footer' }
    });

    const dataToSave = {
      title: 'Footer del Sitio',
      content: 'Contenido migrado para Footer del Sitio',
      html: footerHtml,
      css: footerCss,
      publishedHtml: footerHtml,
      publishedCss: footerCss,
      gjsHtml: footerHtml,
      gjsCss: footerCss,
      gjsComponents: gjsComponents,
      gjsStyles: gjsStyles,
      isActive: true,
      isPublished: true,
      updatedAt: new Date()
    };

    if (existingFooter) {
      console.log('🔄 El footer ya existe. Sobreescribiendo con versión "bonita"...');
      await prisma.page.update({
        where: { id: existingFooter.id },
        data: dataToSave
      });
      console.log('✅ Footer actualizado correctamente.');
    } else {
      console.log('🛠 Creando página de Footer...');
      await prisma.page.create({
        data: {
          ...dataToSave,
          slug: '_footer',
        }
      });
      console.log('✅ Footer creado exitosamente.');
    }

  } catch (error) {
    console.error('❌ Error al crear el footer:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedFooter();
