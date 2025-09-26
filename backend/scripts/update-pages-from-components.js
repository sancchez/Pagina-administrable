const fs = require('fs');
const path = require('path');

// Función para leer el archivo db.json
function readDatabase() {
  const dbPath = path.join(__dirname, 'db.json');
  const data = fs.readFileSync(dbPath, 'utf8');
  return JSON.parse(data);
}

// Función para escribir al archivo db.json
function writeDatabase(data) {
  const dbPath = path.join(__dirname, 'db.json');
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

// Contenido HTML mejorado extraído de los componentes React
const improvedPagesContent = {
  'quienes-somos': {
    title: 'Quiénes Somos',
    slug: 'quienes-somos',
    content: `
      <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <!-- Hero Section -->
        <div class="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
          <div class="absolute inset-0 bg-black opacity-20"></div>
          <div class="relative container mx-auto px-4 text-center">
            <h1 class="text-5xl font-bold mb-6">Quiénes Somos</h1>
            <p class="text-xl mb-8 max-w-3xl mx-auto">
              Conoce nuestra historia, misión y el equipo que trabaja incansablemente 
              para brindar servicios públicos de excelencia.
            </p>
            
            <!-- Achievement Stats -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mt-12">
              <div class="text-center">
                <div class="text-4xl font-bold mb-2">25+</div>
                <div class="text-blue-200">Años de Experiencia</div>
              </div>
              <div class="text-center">
                <div class="text-4xl font-bold mb-2">50K+</div>
                <div class="text-blue-200">Usuarios Atendidos</div>
              </div>
              <div class="text-center">
                <div class="text-4xl font-bold mb-2">15</div>
                <div class="text-blue-200">Municipios</div>
              </div>
              <div class="text-center">
                <div class="text-4xl font-bold mb-2">99%</div>
                <div class="text-blue-200">Satisfacción</div>
              </div>
            </div>
          </div>
        </div>

        <div class="container mx-auto px-4 py-16">
          <div class="space-y-16">

            <!-- Misión, Visión, Valores -->
            <section class="bg-white rounded-2xl shadow-xl p-12">
              <h2 class="text-4xl font-bold text-center text-gray-800 mb-12">Nuestra Esencia</h2>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <!-- Misión -->
                <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 hover:shadow-lg transition-all duration-300">
                  <div class="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-6 mx-auto">
                    <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <h3 class="text-2xl font-bold text-gray-800 mb-4 text-center">Misión</h3>
                  <p class="text-gray-600 text-center leading-relaxed">
                    Brindar servicios públicos de agua potable y saneamiento básico con los más altos 
                    estándares de calidad, contribuyendo al bienestar y desarrollo sostenible de nuestras 
                    comunidades.
                  </p>
                </div>

                <!-- Visión -->
                <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-8 hover:shadow-lg transition-all duration-300">
                  <div class="flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-6 mx-auto">
                    <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <h3 class="text-2xl font-bold text-gray-800 mb-4 text-center">Visión</h3>
                  <p class="text-gray-600 text-center leading-relaxed">
                    Ser reconocidos como la empresa líder en servicios públicos de la región, 
                    caracterizada por la innovación, sostenibilidad y excelencia en el servicio al cliente.
                  </p>
                </div>

                <!-- Valores -->
                <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-8 hover:shadow-lg transition-all duration-300">
                  <div class="flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full mb-6 mx-auto">
                    <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                    </svg>
                  </div>
                  <h3 class="text-2xl font-bold text-gray-800 mb-4 text-center">Valores</h3>
                  <ul class="text-gray-600 space-y-3">
                    <li class="flex items-center">
                      <svg class="w-4 h-4 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                      </svg>
                      Compromiso
                    </li>
                    <li class="flex items-center">
                      <svg class="w-4 h-4 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                      </svg>
                      Transparencia
                    </li>
                    <li class="flex items-center">
                      <svg class="w-4 h-4 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                      </svg>
                      Innovación
                    </li>
                    <li class="flex items-center">
                      <svg class="w-4 h-4 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      Sostenibilidad
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <!-- Historia -->
            <section class="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-12">
              <div class="max-w-4xl mx-auto">
                <h2 class="text-4xl font-bold text-center text-gray-800 mb-12">Nuestra Historia</h2>
                
                <div class="space-y-8">
                  <div class="flex items-start space-x-6 bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                    <div class="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-full flex-shrink-0">
                      <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 class="text-xl font-bold text-gray-800 mb-2">1990 - Fundación</h3>
                      <p class="text-gray-600">
                        Iniciamos operaciones como una pequeña empresa local con el objetivo de 
                        mejorar el acceso al agua potable en la región.
                      </p>
                    </div>
                  </div>

                  <div class="flex items-start space-x-6 bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                    <div class="flex items-center justify-center w-12 h-12 bg-green-600 rounded-full flex-shrink-0">
                      <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 class="text-xl font-bold text-gray-800 mb-2">2000 - Expansión</h3>
                      <p class="text-gray-600">
                        Ampliamos nuestros servicios a múltiples municipios, consolidándonos 
                        como un referente regional en servicios públicos.
                      </p>
                    </div>
                  </div>

                  <div class="flex items-start space-x-6 bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                    <div class="flex items-center justify-center w-12 h-12 bg-purple-600 rounded-full flex-shrink-0">
                      <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 class="text-xl font-bold text-gray-800 mb-2">2010 - Modernización</h3>
                      <p class="text-gray-600">
                        Implementamos tecnologías avanzadas y sistemas de gestión modernos 
                        para mejorar la eficiencia y calidad del servicio.
                      </p>
                    </div>
                  </div>

                  <div class="flex items-start space-x-6 bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                    <div class="flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-full flex-shrink-0">
                      <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 class="text-xl font-bold text-gray-800 mb-2">2020 - Presente</h3>
                      <p class="text-gray-600">
                        Continuamos creciendo y adaptándonos a las necesidades cambiantes 
                        de nuestras comunidades, siempre con un enfoque en la sostenibilidad.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    `,
    status: 'published',
    meta_description: 'Conoce la historia, misión, visión y valores de nuestra empresa de servicios públicos. 25+ años brindando agua potable y saneamiento básico de calidad.',
    meta_keywords: 'quienes somos, historia, mision, vision, valores, empresa servicios publicos, acueducto'
  },
  
  'contacto': {
    title: 'Contacto',
    slug: 'contacto',
    content: `
      <!-- Hero Section -->
      <section class="py-20 px-4">
        <div class="container mx-auto text-center">
          <h1 class="text-5xl font-bold text-gray-800 mb-6">
            <span class="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">Contacto</span>
          </h1>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            Estamos aquí para ayudarte. Contáctanos a través de cualquiera de nuestros canales 
            de atención y te brindaremos la mejor asistencia.
          </p>
        </div>
      </section>

      <!-- Información de Contacto -->
      <section class="py-16 px-4 bg-white/50">
        <div class="container mx-auto">
          <h2 class="text-3xl font-bold text-gray-800 mb-8 text-center">
            Información de Contacto
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <!-- Teléfonos -->
            <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 text-center">
              <div class="bg-gradient-to-r from-blue-500 to-green-500 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-800 mb-3">Teléfonos</h3>
              <div class="space-y-1">
                <p class="text-gray-600 text-sm">Línea Principal: (57) 123-456-789</p>
                <p class="text-gray-600 text-sm">Emergencias 24h: (57) 123-456-790</p>
                <p class="text-gray-600 text-sm">WhatsApp: +57 300-123-4567</p>
              </div>
            </div>

            <!-- Correos -->
            <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 text-center">
              <div class="bg-gradient-to-r from-blue-500 to-green-500 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-800 mb-3">Correos Electrónicos</h3>
              <div class="space-y-1">
                <p class="text-gray-600 text-sm">Información: info@acueducto.gov.co</p>
                <p class="text-gray-600 text-sm">Atención al Cliente: atencion@acueducto.gov.co</p>
                <p class="text-gray-600 text-sm">Gerencia: gerencia@acueducto.gov.co</p>
              </div>
            </div>

            <!-- Dirección -->
            <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 text-center">
              <div class="bg-gradient-to-r from-blue-500 to-green-500 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-800 mb-3">Dirección</h3>
              <div class="space-y-1">
                <p class="text-gray-600 text-sm">Calle Principal #123</p>
                <p class="text-gray-600 text-sm">Centro, Ciudad</p>
                <p class="text-gray-600 text-sm">Código Postal: 123456</p>
              </div>
            </div>

            <!-- Horarios -->
            <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 text-center">
              <div class="bg-gradient-to-r from-blue-500 to-green-500 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-800 mb-3">Horarios de Atención</h3>
              <div class="space-y-1">
                <p class="text-gray-600 text-sm">Lunes a Viernes: 8:00 AM - 5:00 PM</p>
                <p class="text-gray-600 text-sm">Sábados: 8:00 AM - 12:00 PM</p>
                <p class="text-gray-600 text-sm">Emergencias: 24 horas</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Oficinas -->
      <section class="py-16 px-4">
        <div class="container mx-auto">
          <h2 class="text-3xl font-bold text-gray-800 mb-8 text-center">
            Nuestras Oficinas
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-lg">
              <h3 class="text-xl font-bold text-gray-800 mb-4">Oficina Principal</h3>
              <div class="space-y-2">
                <p class="text-gray-600 flex items-center">
                  <svg class="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  </svg>
                  Calle Principal #123, Centro
                </p>
                <p class="text-gray-600 flex items-center">
                  <svg class="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                  (57) 123-456-789
                </p>
                <p class="text-gray-600 flex items-center">
                  <svg class="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Lun - Vie: 8:00 AM - 5:00 PM
                </p>
              </div>
            </div>

            <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-lg">
              <h3 class="text-xl font-bold text-gray-800 mb-4">Punto de Atención Norte</h3>
              <div class="space-y-2">
                <p class="text-gray-600 flex items-center">
                  <svg class="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  </svg>
                  Carrera 15 #45-67, Barrio Norte
                </p>
                <p class="text-gray-600 flex items-center">
                  <svg class="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                  (57) 123-456-791
                </p>
                <p class="text-gray-600 flex items-center">
                  <svg class="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Lun - Vie: 8:00 AM - 4:00 PM
                </p>
              </div>
            </div>

            <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-lg">
              <h3 class="text-xl font-bold text-gray-800 mb-4">Punto de Atención Sur</h3>
              <div class="space-y-2">
                <p class="text-gray-600 flex items-center">
                  <svg class="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  </svg>
                  Calle 20 #30-45, Barrio Sur
                </p>
                <p class="text-gray-600 flex items-center">
                  <svg class="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                  (57) 123-456-792
                </p>
                <p class="text-gray-600 flex items-center">
                  <svg class="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Lun - Vie: 9:00 AM - 4:00 PM
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    `,
    status: 'published',
    meta_description: 'Contáctanos para recibir atención personalizada. Teléfonos, correos, direcciones y horarios de nuestras oficinas de atención al cliente.',
    meta_keywords: 'contacto, telefono, correo, direccion, horarios, atencion cliente, oficinas'
  }
};

async function updatePagesWithImprovedContent() {
  try {
    console.log('🔄 Actualizando páginas con contenido mejorado...');
    
    const db = readDatabase();
    let updatedCount = 0;
    
    // Actualizar páginas existentes con contenido mejorado
    for (const page of db.pages) {
      if (improvedPagesContent[page.slug]) {
        const improvedContent = improvedPagesContent[page.slug];
        
        // Actualizar el contenido
        page.title = improvedContent.title;
        page.content = improvedContent.content;
        page.published = improvedContent.published;
        page.meta_description = improvedContent.meta_description;
        page.meta_keywords = improvedContent.meta_keywords;
        page.updated_at = new Date().toISOString();
        
        // Crear estructura JSON para el editor Canvas
        page.published_json = {
          version: "1.0",
          blocks: [
            {
              id: `block-${Date.now()}`,
              type: "html",
              content: improvedContent.content,
              position: { x: 0, y: 0 },
              size: { width: "100%", height: "auto" },
              styles: {
                backgroundColor: "transparent",
                padding: "0",
                margin: "0"
              }
            }
          ],
          settings: {
            title: improvedContent.title,
            meta_description: improvedContent.meta_description,
            meta_keywords: improvedContent.meta_keywords
          }
        };
        
        // Copiar la estructura para draft_json
        page.draft_json = JSON.parse(JSON.stringify(page.published_json));
        
        updatedCount++;
        console.log(`✅ Actualizada página: ${page.title} (${page.slug})`);
      }
    }
    
    // Guardar cambios
    writeDatabase(db);
    
    console.log(`\n🎉 Proceso completado exitosamente!`);
    console.log(`📊 Páginas actualizadas: ${updatedCount}`);
    console.log(`📄 Total de páginas en la base de datos: ${db.pages.length}`);
    
    // Mostrar resumen de páginas
    console.log('\n📋 Resumen de páginas:');
    db.pages.forEach((page, index) => {
      const status = page.published ? '🟢 Pública' : '🟡 Borrador';
      console.log(`${index + 1}. ${page.title} (${page.slug}) - ${status}`);
    });
    
  } catch (error) {
    console.error('❌ Error al actualizar las páginas:', error);
    process.exit(1);
  }
}

// Ejecutar la actualización
updatePagesWithImprovedContent();