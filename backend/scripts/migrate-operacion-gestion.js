const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateOperacionGestion() {
  try {
    console.log('Migrando página operacion-gestion...');
    
    const fullContent = `<section class="py-20 px-4">
  <div class="container mx-auto text-center">
    <h1 class="text-5xl font-bold text-gray-800 mb-6">
      Operación y <span class="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">Gestión</span>
    </h1>
    <p class="text-xl text-gray-600 max-w-3xl mx-auto">
      Conoce cómo operamos y gestionamos nuestros procesos para garantizar 
      un servicio de agua potable eficiente, confiable y de calidad.
    </p>
  </div>
</section>

<!-- KPIs -->
<section class="py-16 px-4 bg-white/50">
  <div class="container mx-auto">
    <h2 class="text-3xl font-bold text-gray-800 mb-8 text-center">
      Indicadores de Gestión
    </h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 text-center group">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
          <span class="text-white text-2xl">📊</span>
        </div>
        <h3 class="text-3xl font-bold text-gray-800 mb-2">98.5%</h3>
        <h4 class="text-lg font-semibold text-gray-700 mb-2">Cobertura del Servicio</h4>
        <p class="text-gray-600 text-sm">Población con acceso al servicio</p>
      </div>
      
      <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 text-center group">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
          <span class="text-white text-2xl">⏰</span>
        </div>
        <h3 class="text-3xl font-bold text-gray-800 mb-2">23.8 hrs/día</h3>
        <h4 class="text-lg font-semibold text-gray-700 mb-2">Continuidad</h4>
        <p class="text-gray-600 text-sm">Promedio de horas de servicio</p>
      </div>
      
      <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 text-center group">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
          <span class="text-white text-2xl">💧</span>
        </div>
        <h3 class="text-3xl font-bold text-gray-800 mb-2">99.9%</h3>
        <h4 class="text-lg font-semibold text-gray-700 mb-2">Calidad del Agua</h4>
        <p class="text-gray-600 text-sm">Cumplimiento normativo</p>
      </div>
      
      <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 text-center group">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
          <span class="text-white text-2xl">💰</span>
        </div>
        <h3 class="text-3xl font-bold text-gray-800 mb-2">94.2%</h3>
        <h4 class="text-lg font-semibold text-gray-700 mb-2">Eficiencia Comercial</h4>
        <p class="text-gray-600 text-sm">Índice de recaudo</p>
      </div>
    </div>
  </div>
</section>

<!-- Áreas Operacionales -->
<section class="py-16 px-4">
  <div class="container mx-auto">
    <h2 class="text-3xl font-bold text-gray-800 mb-8 text-center">
      Áreas Operacionales
    </h2>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div class="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-gray-200 hover:shadow-xl transition-all duration-300">
        <div class="flex items-center mb-6">
          <div class="bg-gradient-to-r from-blue-500 to-green-500 p-4 rounded-full mr-4">
            <span class="text-white text-2xl">💧</span>
          </div>
          <div>
            <h3 class="text-2xl font-bold text-gray-800">Captación y Tratamiento</h3>
            <p class="text-gray-600">Procesos de captación de agua cruda y tratamiento para garantizar la calidad.</p>
          </div>
        </div>
        
        <ul class="space-y-3">
          <li class="flex items-start space-x-3">
            <div class="w-2 h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mt-2"></div>
            <span class="text-gray-700">Captación de fuentes superficiales y subterráneas</span>
          </li>
          <li class="flex items-start space-x-3">
            <div class="w-2 h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mt-2"></div>
            <span class="text-gray-700">Planta de tratamiento con tecnología avanzada</span>
          </li>
          <li class="flex items-start space-x-3">
            <div class="w-2 h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mt-2"></div>
            <span class="text-gray-700">Control de calidad en tiempo real</span>
          </li>
          <li class="flex items-start space-x-3">
            <div class="w-2 h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mt-2"></div>
            <span class="text-gray-700">Laboratorio certificado para análisis</span>
          </li>
        </ul>
      </div>
      
      <div class="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-gray-200 hover:shadow-xl transition-all duration-300">
        <div class="flex items-center mb-6">
          <div class="bg-gradient-to-r from-blue-500 to-green-500 p-4 rounded-full mr-4">
            <span class="text-white text-2xl">🔧</span>
          </div>
          <div>
            <h3 class="text-2xl font-bold text-gray-800">Distribución</h3>
            <p class="text-gray-600">Red de distribución que lleva el agua tratada hasta cada usuario.</p>
          </div>
        </div>
        
        <ul class="space-y-3">
          <li class="flex items-start space-x-3">
            <div class="w-2 h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mt-2"></div>
            <span class="text-gray-700">Red de tuberías de 150 km de extensión</span>
          </li>
          <li class="flex items-start space-x-3">
            <div class="w-2 h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mt-2"></div>
            <span class="text-gray-700">Estaciones de bombeo automatizadas</span>
          </li>
          <li class="flex items-start space-x-3">
            <div class="w-2 h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mt-2"></div>
            <span class="text-gray-700">Tanques de almacenamiento estratégicos</span>
          </li>
          <li class="flex items-start space-x-3">
            <div class="w-2 h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mt-2"></div>
            <span class="text-gray-700">Sistema de telemetría y control</span>
          </li>
        </ul>
      </div>
      
      <div class="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-gray-200 hover:shadow-xl transition-all duration-300">
        <div class="flex items-center mb-6">
          <div class="bg-gradient-to-r from-blue-500 to-green-500 p-4 rounded-full mr-4">
            <span class="text-white text-2xl">🔨</span>
          </div>
          <div>
            <h3 class="text-2xl font-bold text-gray-800">Mantenimiento</h3>
            <p class="text-gray-600">Programas de mantenimiento preventivo y correctivo de la infraestructura.</p>
          </div>
        </div>
        
        <ul class="space-y-3">
          <li class="flex items-start space-x-3">
            <div class="w-2 h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mt-2"></div>
            <span class="text-gray-700">Mantenimiento preventivo programado</span>
          </li>
          <li class="flex items-start space-x-3">
            <div class="w-2 h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mt-2"></div>
            <span class="text-gray-700">Respuesta rápida a emergencias</span>
          </li>
          <li class="flex items-start space-x-3">
            <div class="w-2 h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mt-2"></div>
            <span class="text-gray-700">Renovación de redes obsoletas</span>
          </li>
          <li class="flex items-start space-x-3">
            <div class="w-2 h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mt-2"></div>
            <span class="text-gray-700">Calibración de equipos de medición</span>
          </li>
        </ul>
      </div>
      
      <div class="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-gray-200 hover:shadow-xl transition-all duration-300">
        <div class="flex items-center mb-6">
          <div class="bg-gradient-to-r from-blue-500 to-green-500 p-4 rounded-full mr-4">
            <span class="text-white text-2xl">📊</span>
          </div>
          <div>
            <h3 class="text-2xl font-bold text-gray-800">Monitoreo y Control</h3>
            <p class="text-gray-600">Sistemas de monitoreo continuo para garantizar la calidad del servicio.</p>
          </div>
        </div>
        
        <ul class="space-y-3">
          <li class="flex items-start space-x-3">
            <div class="w-2 h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mt-2"></div>
            <span class="text-gray-700">Centro de control 24/7</span>
          </li>
          <li class="flex items-start space-x-3">
            <div class="w-2 h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mt-2"></div>
            <span class="text-gray-700">Sensores de presión y caudal</span>
          </li>
          <li class="flex items-start space-x-3">
            <div class="w-2 h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mt-2"></div>
            <span class="text-gray-700">Alertas automáticas de anomalías</span>
          </li>
          <li class="flex items-start space-x-3">
            <div class="w-2 h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mt-2"></div>
            <span class="text-gray-700">Reportes en tiempo real</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</section>

<!-- Sistema de Gestión de Calidad -->
<section class="py-16 px-4 bg-white/50">
  <div class="container mx-auto">
    <h2 class="text-3xl font-bold text-gray-800 mb-8 text-center">
      Sistema de Gestión de Calidad
    </h2>
    
    <div class="max-w-4xl mx-auto">
      <div class="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-gray-200">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div class="flex items-center mb-4">
              <span class="text-blue-600 text-2xl mr-3">🛡️</span>
              <h3 class="text-xl font-semibold text-gray-800">Certificaciones</h3>
            </div>
            <ul class="space-y-2 text-gray-600">
              <li>• ISO 9001:2015 - Gestión de Calidad</li>
              <li>• ISO 14001:2015 - Gestión Ambiental</li>
              <li>• OHSAS 18001 - Seguridad y Salud</li>
              <li>• Certificación ICONTEC</li>
            </ul>
          </div>
          
          <div>
            <div class="flex items-center mb-4">
              <span class="text-green-600 text-2xl mr-3">⚡</span>
              <h3 class="text-xl font-semibold text-gray-800">Mejora Continua</h3>
            </div>
            <ul class="space-y-2 text-gray-600">
              <li>• Auditorías internas regulares</li>
              <li>• Revisión por la dirección</li>
              <li>• Acciones correctivas y preventivas</li>
              <li>• Capacitación continua del personal</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`;
    
    await prisma.page.upsert({
      where: { slug: 'operacion-gestion' },
      update: {
        title: 'Operación y Gestión',
        content: fullContent,
        metaDescription: 'Procesos operativos y sistemas de gestión del servicio de acueducto. Conoce nuestras áreas de captación, tratamiento, distribución y control de calidad.'
      },
      create: {
        title: 'Operación y Gestión',
        slug: 'operacion-gestion',
        content: fullContent,
        metaDescription: 'Procesos operativos y sistemas de gestión del servicio de acueducto. Conoce nuestras áreas de captación, tratamiento, distribución y control de calidad.',
        published: true
      }
    });
    
    console.log('✅ Página operacion-gestion migrada exitosamente con contenido completo');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateOperacionGestion();