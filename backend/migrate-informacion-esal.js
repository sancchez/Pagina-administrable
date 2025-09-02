import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const htmlContent = `<section class="py-20 px-4">
  <div class="container mx-auto text-center">
    <h1 class="text-5xl font-bold text-gray-800 mb-6">
      <span class="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">Información ESAL</span>
    </h1>
    <p class="text-xl text-gray-600 max-w-3xl mx-auto">
      Conoce más sobre nuestra empresa, documentos oficiales y marco normativo que rige nuestras operaciones.
    </p>
  </div>
</section>

<section class="py-16 px-4 bg-white/50">
  <div class="container mx-auto">
    <h2 class="text-3xl font-bold text-gray-800 mb-8 text-center">
      Información Corporativa
    </h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
      <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300">
        <div class="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-gray-800 mb-3 text-center">Razón Social</h3>
        <p class="text-gray-600 text-center">Empresa de Servicios Públicos Acueducto Municipal E.S.P.</p>
      </div>
      
      <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300">
        <div class="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-gray-800 mb-3 text-center">NIT</h3>
        <p class="text-gray-600 text-center">900.123.456-7</p>
      </div>
      
      <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300">
        <div class="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-gray-800 mb-3 text-center">Dirección</h3>
        <p class="text-gray-600 text-center">Calle Principal #123, Centro, Ciudad</p>
      </div>
    </div>
  </div>
</section>

<section class="py-16 px-4">
  <div class="container mx-auto">
    <h2 class="text-3xl font-bold text-gray-800 mb-8 text-center">
      Documentos Oficiales
    </h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
      <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 group">
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center space-x-3">
            <div class="bg-gradient-to-r from-red-500 to-red-600 p-2 rounded-lg">
              <svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                Estatutos Sociales
              </h3>
              <p class="text-sm text-gray-500">PDF • 2.1 MB</p>
            </div>
          </div>
          <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            15/3/2024
          </span>
        </div>
        <p class="text-gray-600 mb-4">Documento constitutivo de la empresa</p>
        <div class="flex space-x-3">
          <button class="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200">
            <span>Ver</span>
          </button>
          <button class="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200">
            <span>Descargar</span>
          </button>
        </div>
      </div>
      
      <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 group">
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center space-x-3">
            <div class="bg-gradient-to-r from-red-500 to-red-600 p-2 rounded-lg">
              <svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                Informe de Gestión 2023
              </h3>
              <p class="text-sm text-gray-500">PDF • 3.2 MB</p>
            </div>
          </div>
          <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            28/2/2024
          </span>
        </div>
        <p class="text-gray-600 mb-4">Reporte anual de actividades y logros</p>
        <div class="flex space-x-3">
          <button class="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200">
            <span>Ver</span>
          </button>
          <button class="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200">
            <span>Descargar</span>
          </button>
        </div>
      </div>
      
      <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 group">
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center space-x-3">
            <div class="bg-gradient-to-r from-red-500 to-red-600 p-2 rounded-lg">
              <svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                Plan Estratégico 2024-2028
              </h3>
              <p class="text-sm text-gray-500">PDF • 4.1 MB</p>
            </div>
          </div>
          <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            10/1/2024
          </span>
        </div>
        <p class="text-gray-600 mb-4">Planificación estratégica quinquenal</p>
        <div class="flex space-x-3">
          <button class="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200">
            <span>Ver</span>
          </button>
          <button class="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200">
            <span>Descargar</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="py-16 px-4 bg-white/50">
  <div class="container mx-auto">
    <h2 class="text-3xl font-bold text-gray-800 mb-8 text-center">
      Marco Legal y Regulatorio
    </h2>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
      <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
        <div class="flex items-center space-x-3 mb-4">
          <div class="bg-gradient-to-r from-purple-500 to-purple-600 p-2 rounded-lg">
            <svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-800">Ley 142 de 1994</h3>
        </div>
        <p class="text-gray-600">Régimen de servicios públicos domiciliarios</p>
      </div>
      
      <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
        <div class="flex items-center space-x-3 mb-4">
          <div class="bg-gradient-to-r from-purple-500 to-purple-600 p-2 rounded-lg">
            <svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-800">Decreto 1077 de 2015</h3>
        </div>
        <p class="text-gray-600">Sector vivienda, ciudad y territorio</p>
      </div>
      
      <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
        <div class="flex items-center space-x-3 mb-4">
          <div class="bg-gradient-to-r from-purple-500 to-purple-600 p-2 rounded-lg">
            <svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-800">Resolución CRA</h3>
        </div>
        <p class="text-gray-600">Comisión de Regulación de Agua Potable</p>
      </div>
    </div>
  </div>
</section>`;

async function migrateInformacionEsal() {
  try {
    console.log('Iniciando migración de página Información ESAL...');
    
    const page = await prisma.page.upsert({
      where: { slug: 'informacion-esal' },
      update: {
        title: 'Información ESAL',
        content: htmlContent,
        metaDescription: 'Información corporativa, documentos oficiales y marco normativo de la Empresa de Servicios Públicos Acueducto Municipal E.S.P.',
        published: true
      },
      create: {
        title: 'Información ESAL',
        slug: 'informacion-esal',
        content: htmlContent,
        metaDescription: 'Información corporativa, documentos oficiales y marco normativo de la Empresa de Servicios Públicos Acueducto Municipal E.S.P.',
        published: true
      }
    });
    
    console.log('✅ Página "Información ESAL" migrada exitosamente:', page.id);
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar migración
migrateInformacionEsal();