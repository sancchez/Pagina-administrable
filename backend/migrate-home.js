import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const homePageContent = `<section class="py-20 px-4">
  <div class="container mx-auto text-center">
    <h1 class="text-5xl font-bold text-gray-800 mb-6">
      Bienvenido al <span class="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">Acueducto Municipal</span>
    </h1>
    <p class="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
      Comprometidos con brindar agua potable de la más alta calidad para el bienestar de nuestra comunidad.
      Servicio confiable, sostenible y responsable con el medio ambiente.
    </p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <a href="/portal-usuario" class="bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold py-3 px-8 rounded-lg hover:from-blue-600 hover:to-green-600 transition-all duration-200 shadow-lg">
        Portal del Usuario
      </a>
      <a href="/contacto" class="border-2 border-blue-500 text-blue-500 font-semibold py-3 px-8 rounded-lg hover:bg-blue-500 hover:text-white transition-all duration-200">
        Contáctanos
      </a>
    </div>
  </div>
</section>

<section class="py-16 px-4 bg-white/50">
  <div class="container mx-auto">
    <h2 class="text-3xl font-bold text-gray-800 mb-12 text-center">
      Nuestros Servicios
    </h2>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 text-center">
        <div class="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <span class="text-white text-2xl">💧</span>
        </div>
        <h3 class="text-xl font-semibold text-gray-800 mb-3">Suministro de Agua Potable</h3>
        <p class="text-gray-600 mb-4">Agua de excelente calidad las 24 horas del día</p>
        <ul class="text-sm text-gray-600 space-y-1">
          <li>• Tratamiento avanzado</li>
          <li>• Control de calidad constante</li>
          <li>• Distribución confiable</li>
        </ul>
      </div>
      
      <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 text-center">
        <div class="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <span class="text-white text-2xl">🔧</span>
        </div>
        <h3 class="text-xl font-semibold text-gray-800 mb-3">Mantenimiento y Reparaciones</h3>
        <p class="text-gray-600 mb-4">Servicio técnico especializado y oportuno</p>
        <ul class="text-sm text-gray-600 space-y-1">
          <li>• Reparaciones inmediatas</li>
          <li>• Mantenimiento preventivo</li>
          <li>• Atención de emergencias</li>
        </ul>
      </div>
      
      <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 text-center">
        <div class="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <span class="text-white text-2xl">👥</span>
        </div>
        <h3 class="text-xl font-semibold text-gray-800 mb-3">Atención al Cliente</h3>
        <p class="text-gray-600 mb-4">Servicio personalizado y eficiente</p>
        <ul class="text-sm text-gray-600 space-y-1">
          <li>• Atención presencial</li>
          <li>• Línea telefónica</li>
          <li>• Portal web</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<section class="py-16 px-4">
  <div class="container mx-auto">
    <h2 class="text-3xl font-bold text-gray-800 mb-12 text-center">
      Indicadores de Calidad
    </h2>
    
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 text-center">
        <div class="text-3xl font-bold text-blue-600 mb-2">98.5%</div>
        <div class="text-gray-600">Continuidad del Servicio</div>
      </div>
      <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 text-center">
        <div class="text-3xl font-bold text-green-600 mb-2">99.2%</div>
        <div class="text-gray-600">Calidad del Agua</div>
      </div>
      <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 text-center">
        <div class="text-3xl font-bold text-purple-600 mb-2">95.8%</div>
        <div class="text-gray-600">Cobertura</div>
      </div>
      <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 text-center">
        <div class="text-3xl font-bold text-orange-600 mb-2">4.7/5</div>
        <div class="text-gray-600">Satisfacción del Cliente</div>
      </div>
    </div>
  </div>
</section>

<section class="py-16 px-4 bg-white/50">
  <div class="container mx-auto">
    <h2 class="text-3xl font-bold text-gray-800 mb-8 text-center">
      Acceso Rápido
    </h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <a href="/portal-usuario" class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 text-center group">
        <div class="bg-gradient-to-r from-blue-500 to-green-500 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
          <span class="text-white text-2xl">🏠</span>
        </div>
        <h3 class="text-lg font-semibold text-gray-800 mb-2">Portal del Usuario</h3>
        <p class="text-gray-600 text-sm">Consulta tu factura y gestiona tu cuenta</p>
      </a>
      
      <a href="/contacto" class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 text-center group">
        <div class="bg-gradient-to-r from-green-500 to-blue-500 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
          <span class="text-white text-2xl">📞</span>
        </div>
        <h3 class="text-lg font-semibold text-gray-800 mb-2">Contacto</h3>
        <p class="text-gray-600 text-sm">Comunícate con nosotros</p>
      </a>
      
      <a href="/quienes-somos" class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 text-center group">
        <div class="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
          <span class="text-white text-2xl">ℹ️</span>
        </div>
        <h3 class="text-lg font-semibold text-gray-800 mb-2">Quiénes Somos</h3>
        <p class="text-gray-600 text-sm">Conoce nuestra empresa</p>
      </a>
      
      <a href="/normatividad" class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 text-center group">
        <div class="bg-gradient-to-r from-orange-500 to-red-500 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
          <span class="text-white text-2xl">📋</span>
        </div>
        <h3 class="text-lg font-semibold text-gray-800 mb-2">Normatividad</h3>
        <p class="text-gray-600 text-sm">Consulta nuestra normativa</p>
      </a>
    </div>
  </div>
</section>`;

async function migrateHomePage() {
  try {
    console.log('🏠 Iniciando migración de la página de inicio...');
    
    const result = await prisma.page.upsert({
      where: { slug: 'home' },
      update: {
        title: 'Inicio',
        content: homePageContent,
        metaDescription: 'Bienvenido al Acueducto Municipal. Agua potable de calidad, servicio confiable y atención al cliente excepcional para nuestra comunidad.',
        published: true
      },
      create: {
        slug: 'home',
        title: 'Inicio',
        content: homePageContent,
        metaDescription: 'Bienvenido al Acueducto Municipal. Agua potable de calidad, servicio confiable y atención al cliente excepcional para nuestra comunidad.',
        published: true
      }
    });
    
    console.log('✅ Página de inicio migrada exitosamente:', result.title);
    console.log('📄 ID de la página:', result.id);
    console.log('🔗 Slug:', result.slug);
    console.log('📝 Publicada:', result.published);
  } catch (error) {
    console.error('❌ Error al migrar la página de inicio:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateHomePage();