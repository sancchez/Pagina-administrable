import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const pages = [
  {
    title: 'Quiénes Somos',
    slug: 'quienes-somos',
    content: `<section class="py-20 px-4">
  <div class="container mx-auto text-center">
    <h1 class="text-5xl font-bold text-gray-800 mb-6">
      <span class="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">Quiénes Somos</span>
    </h1>
    <p class="text-xl text-gray-600 max-w-3xl mx-auto">
      Somos una empresa comprometida con el bienestar de nuestra comunidad, 
      brindando servicios de acueducto de la más alta calidad con responsabilidad social y ambiental.
    </p>
  </div>
</section>

<section class="py-16 px-4 bg-white/50">
  <div class="container mx-auto">
    <h2 class="text-3xl font-bold text-gray-800 mb-8 text-center">
      Áreas Operativas
    </h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300">
        <div class="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <span class="text-white text-2xl">💧</span>
        </div>
        <h3 class="text-xl font-semibold text-gray-800 mb-3 text-center">Captación</h3>
        <p class="text-gray-600 text-center mb-4">Sistemas de captación de agua cruda desde fuentes naturales</p>
        <ul class="text-sm text-gray-600 space-y-1">
          <li>• Bocatomas superficiales</li>
          <li>• Pozos profundos</li>
          <li>• Monitoreo 24/7</li>
        </ul>
      </div>
      
      <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300">
        <div class="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <span class="text-white text-2xl">⚗️</span>
        </div>
        <h3 class="text-xl font-semibold text-gray-800 mb-3 text-center">Tratamiento</h3>
        <p class="text-gray-600 text-center mb-4">Procesos de potabilización con tecnología avanzada</p>
        <ul class="text-sm text-gray-600 space-y-1">
          <li>• Coagulación y floculación</li>
          <li>• Sedimentación</li>
          <li>• Filtración y desinfección</li>
        </ul>
      </div>
      
      <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300">
        <div class="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <span class="text-white text-2xl">🚰</span>
        </div>
        <h3 class="text-xl font-semibold text-gray-800 mb-3 text-center">Distribución</h3>
        <p class="text-gray-600 text-center mb-4">Red de distribución eficiente y confiable</p>
        <ul class="text-sm text-gray-600 space-y-1">
          <li>• Tanques de almacenamiento</li>
          <li>• Redes de conducción</li>
          <li>• Sistemas de presión</li>
        </ul>
      </div>
      
      <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300">
        <div class="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <span class="text-white text-2xl">🔧</span>
        </div>
        <h3 class="text-xl font-semibold text-gray-800 mb-3 text-center">Mantenimiento</h3>
        <p class="text-gray-600 text-center mb-4">Mantenimiento preventivo y correctivo</p>
        <ul class="text-sm text-gray-600 space-y-1">
          <li>• Inspecciones regulares</li>
          <li>• Reparaciones inmediatas</li>
          <li>• Renovación de equipos</li>
        </ul>
      </div>
      
      <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300">
        <div class="bg-gradient-to-r from-teal-500 to-teal-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <span class="text-white text-2xl">📊</span>
        </div>
        <h3 class="text-xl font-semibold text-gray-800 mb-3 text-center">Control de Calidad</h3>
        <p class="text-gray-600 text-center mb-4">Laboratorio y análisis constante</p>
        <ul class="text-sm text-gray-600 space-y-1">
          <li>• Análisis fisicoquímicos</li>
          <li>• Control microbiológico</li>
          <li>• Certificaciones</li>
        </ul>
      </div>
      
      <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300">
        <div class="bg-gradient-to-r from-red-500 to-red-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <span class="text-white text-2xl">👥</span>
        </div>
        <h3 class="text-xl font-semibold text-gray-800 mb-3 text-center">Atención al Cliente</h3>
        <p class="text-gray-600 text-center mb-4">Servicio personalizado y eficiente</p>
        <ul class="text-sm text-gray-600 space-y-1">
          <li>• Atención 24/7</li>
          <li>• Múltiples canales</li>
          <li>• Seguimiento de casos</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<section class="py-16 px-4">
  <div class="container mx-auto">
    <h2 class="text-3xl font-bold text-gray-800 mb-8 text-center">
      Indicadores de Gestión (KPIs)
    </h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
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
    
    <div class="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-gray-200">
      <h3 class="text-2xl font-bold text-gray-800 mb-6 text-center">Metas Operacionales 2024</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 class="text-lg font-semibold text-gray-800 mb-3">Objetivos de Calidad</h4>
          <ul class="space-y-2 text-gray-600">
            <li class="flex items-center"><span class="text-green-500 mr-2">✓</span> Mantener 99% de calidad del agua</li>
            <li class="flex items-center"><span class="text-green-500 mr-2">✓</span> Reducir tiempo de respuesta a reclamos</li>
            <li class="flex items-center"><span class="text-green-500 mr-2">✓</span> Implementar nuevas tecnologías</li>
          </ul>
        </div>
        <div>
          <h4 class="text-lg font-semibold text-gray-800 mb-3">Objetivos de Cobertura</h4>
          <ul class="space-y-2 text-gray-600">
            <li class="flex items-center"><span class="text-blue-500 mr-2">→</span> Ampliar cobertura al 97%</li>
            <li class="flex items-center"><span class="text-blue-500 mr-2">→</span> Conectar 500 nuevos usuarios</li>
            <li class="flex items-center"><span class="text-blue-500 mr-2">→</span> Modernizar infraestructura</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="py-16 px-4 bg-white/50">
  <div class="container mx-auto">
    <h2 class="text-3xl font-bold text-gray-800 mb-8 text-center">
      Sistema de Gestión de Calidad
    </h2>
    
    <div class="max-w-4xl mx-auto">
      <div class="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-gray-200">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 class="text-xl font-semibold text-gray-800 mb-4">Certificaciones</h3>
            <div class="space-y-3">
              <div class="flex items-center space-x-3">
                <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                <span class="text-gray-600">ISO 9001:2015 - Gestión de Calidad</span>
              </div>
              <div class="flex items-center space-x-3">
                <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span class="text-gray-600">ISO 14001:2015 - Gestión Ambiental</span>
              </div>
              <div class="flex items-center space-x-3">
                <div class="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span class="text-gray-600">OHSAS 18001 - Seguridad y Salud</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 class="text-xl font-semibold text-gray-800 mb-4">Procesos Clave</h3>
            <div class="space-y-3">
              <div class="flex items-center space-x-3">
                <div class="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span class="text-gray-600">Gestión de Recursos Hídricos</span>
              </div>
              <div class="flex items-center space-x-3">
                <div class="w-3 h-3 bg-teal-500 rounded-full"></div>
                <span class="text-gray-600">Control de Procesos Operativos</span>
              </div>
              <div class="flex items-center space-x-3">
                <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                <span class="text-gray-600">Mejora Continua</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="mt-8 pt-6 border-t border-gray-200">
          <h3 class="text-xl font-semibold text-gray-800 mb-4 text-center">Política de Calidad</h3>
          <p class="text-gray-600 text-center leading-relaxed">
            Nos comprometemos a suministrar agua potable de excelente calidad, cumpliendo con todos los 
            requisitos legales y normativos, mediante la implementación de un sistema de gestión de calidad 
            que garantice la mejora continua de nuestros procesos y la satisfacción de nuestros usuarios.
          </p>
        </div>
      </div>
    </div>
  </div>
</section>`,
    metaDescription: 'Conoce nuestras operaciones, áreas de gestión, indicadores de calidad y sistema de gestión. Garantizamos un servicio de acueducto eficiente y de excelencia.'
  },
  {
    title: 'Portal del Usuario',
    slug: 'portal-usuario',
    content: `<section class="py-20 px-4">
  <div class="container mx-auto text-center">
    <h1 class="text-5xl font-bold text-gray-800 mb-6">
      Portal del <span class="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">Usuario</span>
    </h1>
    <p class="text-xl text-gray-600 max-w-3xl mx-auto">
      Accede a todos nuestros servicios en línea de forma fácil y segura. 
      Gestiona tu cuenta, realiza pagos y mantente informado.
    </p>
  </div>
</section>

<section class="py-16 px-4 bg-white/50">
  <div class="container mx-auto">
    <h2 class="text-3xl font-bold text-gray-800 mb-8 text-center">
      Servicios en Línea
    </h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 group cursor-pointer">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
          <span class="text-white text-2xl">💳</span>
        </div>
        <h3 class="text-xl font-bold text-gray-800 mb-2">Pagar Factura</h3>
        <p class="text-gray-600 mb-4">Realiza el pago de tu factura de forma rápida y segura</p>
        <button class="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:shadow-lg transition-all duration-200">
          Pagar Ahora
        </button>
      </div>
      
      <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 group cursor-pointer">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
          <span class="text-white text-2xl">📄</span>
        </div>
        <h3 class="text-xl font-bold text-gray-800 mb-2">Consultar Factura</h3>
        <p class="text-gray-600 mb-4">Consulta el estado de tu factura y historial de pagos</p>
        <button class="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:shadow-lg transition-all duration-200">
          Consultar
        </button>
      </div>
      
      <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 group cursor-pointer">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
          <span class="text-white text-2xl">🔍</span>
        </div>
        <h3 class="text-xl font-bold text-gray-800 mb-2">Consultar Consumo</h3>
        <p class="text-gray-600 mb-4">Revisa tu historial de consumo y estadísticas</p>
        <button class="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:shadow-lg transition-all duration-200">
          Ver Consumo
        </button>
      </div>
      
      <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 group cursor-pointer">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
          <span class="text-white text-2xl">⬇️</span>
        </div>
        <h3 class="text-xl font-bold text-gray-800 mb-2">Descargar Certificados</h3>
        <p class="text-gray-600 mb-4">Obtén certificados de paz y salvo y otros documentos</p>
        <button class="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:shadow-lg transition-all duration-200">
          Descargar
        </button>
      </div>
      
      <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 group cursor-pointer">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
          <span class="text-white text-2xl">👤</span>
        </div>
        <h3 class="text-xl font-bold text-gray-800 mb-2">Actualizar Datos</h3>
        <p class="text-gray-600 mb-4">Mantén actualizada tu información personal</p>
        <button class="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold py-2 px-4 rounded-lg hover:shadow-lg transition-all duration-200">
          Actualizar
        </button>
      </div>
      
      <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 group cursor-pointer">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
          <span class="text-white text-2xl">💬</span>
        </div>
        <h3 class="text-xl font-bold text-gray-800 mb-2">Solicitudes y Reclamos</h3>
        <p class="text-gray-600 mb-4">Presenta solicitudes, quejas y reclamos</p>
        <button class="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-2 px-4 rounded-lg hover:shadow-lg transition-all duration-200">
          Crear Solicitud
        </button>
      </div>
    </div>
  </div>
</section>

<section class="py-16 px-4">
  <div class="container mx-auto">
    <h2 class="text-3xl font-bold text-gray-800 mb-8 text-center">
      Métodos de Pago Disponibles
    </h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
      <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 text-center">
        <div class="text-4xl mb-3">🏦</div>
        <h3 class="text-lg font-semibold text-gray-800 mb-2">PSE</h3>
        <p class="text-gray-600 text-sm">Pago seguro en línea</p>
      </div>
      <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 text-center">
        <div class="text-4xl mb-3">💳</div>
        <h3 class="text-lg font-semibold text-gray-800 mb-2">Tarjetas</h3>
        <p class="text-gray-600 text-sm">Visa, Mastercard, Diners</p>
      </div>
      <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 text-center">
        <div class="text-4xl mb-3">🏪</div>
        <h3 class="text-lg font-semibold text-gray-800 mb-2">Efecty</h3>
        <p class="text-gray-600 text-sm">Red de pagos nacional</p>
      </div>
      <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 text-center">
        <div class="text-4xl mb-3">🎯</div>
        <h3 class="text-lg font-semibold text-gray-800 mb-2">Baloto</h3>
        <p class="text-gray-600 text-sm">Puntos de pago</p>
      </div>
    </div>
  </div>
</section>

<section class="py-16 px-4 bg-white/50">
  <div class="container mx-auto">
    <h2 class="text-3xl font-bold text-gray-800 mb-8 text-center">
      Canales de Atención
    </h2>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
      <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 text-center">
        <div class="bg-gradient-to-r from-blue-500 to-green-500 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <span class="text-white text-2xl">📞</span>
        </div>
        <h3 class="text-xl font-bold text-gray-800 mb-2">Línea de Atención</h3>
        <p class="text-gray-700 font-medium mb-1">(57) 123-456-789</p>
        <p class="text-gray-600 text-sm">Lun - Vie: 8:00 AM - 5:00 PM</p>
      </div>
      
      <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 text-center">
        <div class="bg-gradient-to-r from-blue-500 to-green-500 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <span class="text-white text-2xl">💬</span>
        </div>
        <h3 class="text-xl font-bold text-gray-800 mb-2">Chat en Línea</h3>
        <p class="text-gray-700 font-medium mb-1">Disponible 24/7</p>
        <p class="text-gray-600 text-sm">Respuesta inmediata</p>
      </div>
      
      <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 text-center">
        <div class="bg-gradient-to-r from-blue-500 to-green-500 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <span class="text-white text-2xl">🕐</span>
        </div>
        <h3 class="text-xl font-bold text-gray-800 mb-2">Oficina Principal</h3>
        <p class="text-gray-700 font-medium mb-1">Calle Principal #123</p>
        <p class="text-gray-600 text-sm">Lun - Vie: 8:00 AM - 4:00 PM</p>
      </div>
    </div>
  </div>
</section>

<section class="py-16 px-4">
  <div class="container mx-auto">
    <div class="max-w-2xl mx-auto">
      <div class="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-gray-200 shadow-lg">
        <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">
          Consulta Rápida de Factura
        </h2>
        
        <form class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Número de Cuenta
            </label>
            <input
              type="text"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Ingresa tu número de cuenta"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Documento de Identidad
            </label>
            <input
              type="text"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Número de documento"
            />
          </div>
          
          <button
            type="submit"
            class="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-green-600 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Consultar Factura
          </button>
        </form>
      </div>
    </div>
  </div>
</section>`,
    metaDescription: 'Accede a nuestro portal de usuario para gestionar tu cuenta, pagar facturas, consultar consumo y realizar trámites en línea de forma segura y fácil.'
  },
  {
    title: 'Normatividad',
    slug: 'normatividad',
    content: `<section class="py-20 px-4">
  <div class="container mx-auto text-center">
    <h1 class="text-5xl font-bold text-gray-800 mb-6">
      <span class="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">Normatividad</span>
    </h1>
    <p class="text-xl text-gray-600 max-w-3xl mx-auto">
      Marco normativo que rige la prestación del servicio público de acueducto. 
      Conoce las leyes, decretos y resoluciones que garantizan un servicio de calidad.
    </p>
  </div>
</section>

<section class="py-16 px-4 bg-white/50">
  <div class="container mx-auto">
    <h2 class="text-3xl font-bold text-gray-800 mb-8 text-center">
      Marco Normativo Nacional
    </h2>
    
    <div class="space-y-4 max-w-6xl mx-auto">
      <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
        <div class="flex flex-col md:flex-row md:items-center justify-between">
          <div class="flex-1">
            <div class="flex items-center space-x-3 mb-2">
              <span class="text-blue-600 text-xl">📄</span>
              <h3 class="text-xl font-semibold text-gray-800">Ley 142 de 1994</h3>
              <span class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                Ley Nacional
              </span>
            </div>
            <p class="text-gray-600 mb-2">Régimen de los servicios públicos domiciliarios</p>
            <div class="flex items-center space-x-4 text-sm text-gray-500">
              <span>Fecha: 11/07/1994</span>
              <span class="text-green-600 font-medium">• Vigente</span>
            </div>
          </div>
          
          <div class="flex space-x-2 mt-4 md:mt-0">
            <button class="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
              <span>👁️</span>
              <span>Ver</span>
            </button>
            <button class="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
              <span>⬇️</span>
              <span>Descargar</span>
            </button>
          </div>
        </div>
      </div>
      
      <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
        <div class="flex flex-col md:flex-row md:items-center justify-between">
          <div class="flex-1">
            <div class="flex items-center space-x-3 mb-2">
              <span class="text-blue-600 text-xl">📄</span>
              <h3 class="text-xl font-semibold text-gray-800">Decreto 1077 de 2015</h3>
              <span class="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                Decreto Nacional
              </span>
            </div>
            <p class="text-gray-600 mb-2">Decreto Único Reglamentario del Sector Vivienda, Ciudad y Territorio</p>
            <div class="flex items-center space-x-4 text-sm text-gray-500">
              <span>Fecha: 26/05/2015</span>
              <span class="text-green-600 font-medium">• Vigente</span>
            </div>
          </div>
          
          <div class="flex space-x-2 mt-4 md:mt-0">
            <button class="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
              <span>👁️</span>
              <span>Ver</span>
            </button>
            <button class="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
              <span>⬇️</span>
              <span>Descargar</span>
            </button>
          </div>
        </div>
      </div>
      
      <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
        <div class="flex flex-col md:flex-row md:items-center justify-between">
          <div class="flex-1">
            <div class="flex items-center space-x-3 mb-2">
              <span class="text-blue-600 text-xl">📄</span>
              <h3 class="text-xl font-semibold text-gray-800">Resolución CRA 287 de 2004</h3>
              <span class="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                Resolución CRA
              </span>
            </div>
            <p class="text-gray-600 mb-2">Metodología tarifaria para el servicio público domiciliario de acueducto</p>
            <div class="flex items-center space-x-4 text-sm text-gray-500">
              <span>Fecha: 15/06/2004</span>
              <span class="text-green-600 font-medium">• Vigente</span>
            </div>
          </div>
          
          <div class="flex space-x-2 mt-4 md:mt-0">
            <button class="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
              <span>👁️</span>
              <span>Ver</span>
            </button>
            <button class="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
              <span>⬇️</span>
              <span>Descargar</span>
            </button>
          </div>
        </div>
      </div>
      
      <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
        <div class="flex flex-col md:flex-row md:items-center justify-between">
          <div class="flex-1">
            <div class="flex items-center space-x-3 mb-2">
              <span class="text-blue-600 text-xl">📄</span>
              <h3 class="text-xl font-semibold text-gray-800">Resolución 2115 de 2007</h3>
              <span class="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                Resolución MinSalud
              </span>
            </div>
            <p class="text-gray-600 mb-2">Características, instrumentos básicos y frecuencias del sistema de control y vigilancia para la calidad del agua</p>
            <div class="flex items-center space-x-4 text-sm text-gray-500">
              <span>Fecha: 22/06/2007</span>
              <span class="text-green-600 font-medium">• Vigente</span>
            </div>
          </div>
          
          <div class="flex space-x-2 mt-4 md:mt-0">
            <button class="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
              <span>👁️</span>
              <span>Ver</span>
            </button>
            <button class="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
              <span>⬇️</span>
              <span>Descargar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="py-16 px-4">
  <div class="container mx-auto">
    <h2 class="text-3xl font-bold text-gray-800 mb-8 text-center">
      Políticas y Reglamentos Internos
    </h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 group">
        <div class="flex items-center space-x-4 mb-4">
          <div class="bg-gradient-to-r from-blue-500 to-green-500 p-3 rounded-full group-hover:scale-110 transition-transform duration-300">
            <span class="text-white text-xl">📖</span>
          </div>
          <h3 class="text-xl font-semibold text-gray-800">Reglamento de Usuarios</h3>
        </div>
        <p class="text-gray-600 mb-4">Normas y condiciones para la prestación del servicio</p>
        <div class="flex space-x-2">
          <button class="flex items-center space-x-2 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm">
            <span>👁️</span>
            <span>Ver</span>
          </button>
          <button class="flex items-center space-x-2 bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm">
            <span>⬇️</span>
            <span>PDF</span>
          </button>
        </div>
      </div>
      
      <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 group">
        <div class="flex items-center space-x-4 mb-4">
          <div class="bg-gradient-to-r from-blue-500 to-green-500 p-3 rounded-full group-hover:scale-110 transition-transform duration-300">
            <span class="text-white text-xl">🛡️</span>
          </div>
          <h3 class="text-xl font-semibold text-gray-800">Política de Calidad</h3>
        </div>
        <p class="text-gray-600 mb-4">Compromiso con la excelencia en el servicio</p>
        <div class="flex space-x-2">
          <button class="flex items-center space-x-2 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm">
            <span>👁️</span>
            <span>Ver</span>
          </button>
          <button class="flex items-center space-x-2 bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm">
            <span>⬇️</span>
            <span>PDF</span>
          </button>
        </div>
      </div>
      
      <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 group">
        <div class="flex items-center space-x-4 mb-4">
          <div class="bg-gradient-to-r from-blue-500 to-green-500 p-3 rounded-full group-hover:scale-110 transition-transform duration-300">
            <span class="text-white text-xl">📄</span>
          </div>
          <h3 class="text-xl font-semibold text-gray-800">Manual de Procedimientos</h3>
        </div>
        <p class="text-gray-600 mb-4">Procesos operativos y administrativos</p>
        <div class="flex space-x-2">
          <button class="flex items-center space-x-2 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm">
            <span>👁️</span>
            <span>Ver</span>
          </button>
          <button class="flex items-center space-x-2 bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm">
            <span>⬇️</span>
            <span>PDF</span>
          </button>
        </div>
      </div>
      
      <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 group">
        <div class="flex items-center space-x-4 mb-4">
          <div class="bg-gradient-to-r from-blue-500 to-green-500 p-3 rounded-full group-hover:scale-110 transition-transform duration-300">
            <span class="text-white text-xl">⚖️</span>
          </div>
          <h3 class="text-xl font-semibold text-gray-800">Código de Ética</h3>
        </div>
        <p class="text-gray-600 mb-4">Principios y valores corporativos</p>
        <div class="flex space-x-2">
          <button class="flex items-center space-x-2 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm">
            <span>👁️</span>
            <span>Ver</span>
          </button>
          <button class="flex items-center space-x-2 bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm">
            <span>⬇️</span>
            <span>PDF</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="py-16 px-4 bg-white/50">
  <div class="container mx-auto">
    <h2 class="text-3xl font-bold text-gray-800 mb-8 text-center">
      Entidades Reguladoras y de Control
    </h2>
    
    <div class="max-w-4xl mx-auto">
      <div class="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-gray-200">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <span class="text-blue-600 mr-2">⚖️</span>
              Entidades de Regulación
            </h3>
            <ul class="space-y-3 text-gray-600">
              <li class="flex items-center space-x-3">
                <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>CRA - Comisión de Regulación de Agua Potable</span>
              </li>
              <li class="flex items-center space-x-3">
                <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>SSPD - Superintendencia de Servicios Públicos</span>
              </li>
              <li class="flex items-center space-x-3">
                <div class="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span>Ministerio de Vivienda, Ciudad y Territorio</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <span class="text-green-600 mr-2">🔍</span>
              Entidades de Control
            </h3>
            <ul class="space-y-3 text-gray-600">
              <li class="flex items-center space-x-3">
                <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Contraloría General de la República</span>
              </li>
              <li class="flex items-center space-x-3">
                <div class="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>Procuraduría General de la Nación</span>
              </li>
              <li class="flex items-center space-x-3">
                <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Defensoría del Pueblo</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
</div>
    `
  }
];

// Función para migrar las páginas
async function migratePages() {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  try {
    console.log('Iniciando migración de páginas...');
    
    for (const page of pages) {
      console.log(`Migrando página: ${page.title}`);
      
      // Verificar si la página ya existe
      const existingPage = await prisma.page.findUnique({
        where: { slug: page.slug }
      });
      
      if (existingPage) {
        console.log(`Página ${page.slug} ya existe, actualizando...`);
        await prisma.page.update({
          where: { slug: page.slug },
          data: {
            title: page.title,
            content: page.content,
            metaDescription: page.metaDescription
          }
        });
      } else {
        console.log(`Creando nueva página: ${page.slug}`);
        // El script crea las páginas sin el campo published
        await prisma.page.create({
          data: page  // ← No incluye published: true
        });
      }
    }
    
    console.log('✅ Migración completada exitosamente');
    console.log(`Total de páginas migradas: ${pages.length}`);
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la migración
migratePages();

