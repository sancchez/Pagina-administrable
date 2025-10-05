import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateHeader() {
  const headerHtml = `
    <header class="bg-white/80 backdrop-blur-md shadow-sm border-b border-blue-100">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <a href="/" class="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Acueducto Municipal
              </a>
            </div>
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <a href="/" class="border-transparent text-gray-600 hover:border-blue-300 hover:text-blue-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">Inicio</a>
              <a href="/quienes-somos" class="border-transparent text-gray-600 hover:border-blue-300 hover:text-blue-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">Quiénes Somos</a>
              <a href="/informacion-esal" class="border-transparent text-gray-600 hover:border-blue-300 hover:text-blue-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">Información ESAL</a>
              <a href="/operacion-gestion" class="border-transparent text-gray-600 hover:border-blue-300 hover:text-blue-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">Operación y Gestión</a>
              <a href="/portal-usuario" class="border-transparent text-gray-600 hover:border-blue-300 hover:text-blue-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">Portal Usuario</a>
              <a href="/normatividad" class="border-transparent text-gray-600 hover:border-blue-300 hover:text-blue-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">Normatividad</a>
              <a href="/contacto" class="border-transparent text-gray-600 hover:border-blue-300 hover:text-blue-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">Contacto</a>
            </div>
          </div>
        </div>
      </nav>
    </header>
  `;

  const headerCss = `
    header { font-family: system-ui, sans-serif; }
    header a { text-decoration: none; }
    @media (max-width: 768px) {
      nav { display: none; }
    }
  `;

  const components: any[] = [];

  await prisma.page.upsert({
    where: { slug: '_header' },
    update: {
      name: 'Header Global',
      gjsHtml: headerHtml,
      gjsCss: headerCss,
      gjsComponents: JSON.stringify(components),
      gjsStyles: JSON.stringify([]),
      grapesData: JSON.stringify({
        'gjs-html': headerHtml,
        'gjs-css': headerCss,
        'gjs-components': components,
        'gjs-styles': []
      }),
      html: headerHtml,
      css: headerCss,
      publishedHtml: headerHtml,
      publishedCss: headerCss,
      isPublished: true
    },
    create: {
      slug: '_header',
      title: 'Header',
      name: 'Header Global',
      gjsHtml: headerHtml,
      gjsCss: headerCss,
      gjsComponents: JSON.stringify(components),
      gjsStyles: JSON.stringify([]),
      grapesData: JSON.stringify({
        'gjs-html': headerHtml,
        'gjs-css': headerCss,
        'gjs-components': components,
        'gjs-styles': []
      }),
      html: headerHtml,
      css: headerCss,
      publishedHtml: headerHtml,
      publishedCss: headerCss,
      isPublished: true
    }
  });

  console.log('✅ Header actualizado con contenido inicial');
}

updateHeader()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    // Relanzamos el error para terminar con código no cero sin depender de tipos Node
    throw err;
  });