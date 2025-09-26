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

// Contenido HTML mejorado para las páginas restantes
const remainingPagesContent = {
  'inicio': {
    title: 'Inicio',
    slug: 'inicio',
    content: `
      <!-- Hero Section -->
      <section class="relative bg-gradient-to-r from-blue-600 to-green-600 text-white py-24">
        <div class="absolute inset-0 bg-black opacity-20"></div>
        <div class="relative container mx-auto px-4 text-center">
          <h1 class="text-6xl font-bold mb-6">Bienvenidos</h1>
          <p class="text-2xl mb-8 max-w-4xl mx-auto">
            Empresa de Servicios Públicos comprometida con brindar agua potable de calidad 
            y saneamiento básico para el bienestar de nuestras comunidades.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <a href="/contacto" class="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              Contáctanos
            </a>
            <a href="/quienes-somos" class="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Conoce Más
            </a>
          </div>
        </div>
      </section>

      <!-- Stats Cards -->
      <section class="py-16 px-4 bg-white">
        <div class="container mx-auto">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div class="text-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 hover:shadow-lg transition-all">
              <div class="text-4xl font-bold text-blue-600 mb-2">25+</div>
              <div class="text-gray-600">Años de Experiencia</div>
            </div>
            <div class="text-center bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-8 hover:shadow-lg transition-all">
              <div class="text-4xl font-bold text-green-600 mb-2">50K+</div>
              <div class="text-gray-600">Usuarios Atendidos</div>
            </div>
            <div class="text-center bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-8 hover:shadow-lg transition-all">
              <div class="text-4xl font-bold text-purple-600 mb-2">15</div>
              <div class="text-gray-600">Municipios</div>
            </div>
            <div class="text-center bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-8 hover:shadow-lg transition-all">
              <div class="text-4xl font-bold text-orange-600 mb-2">99%</div>
              <div class="text-gray-600">Satisfacción</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Services Section -->
      <section class="py-16 px-4 bg-gray-50">
        <div class="container mx-auto">
          <h2 class="text-4xl font-bold text-center text-gray-800 mb-12">Nuestros Servicios</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all">
              <div class="bg-blue-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-800 mb-4">Agua Potable</h3>
              <p class="text-gray-600">Suministro continuo de agua potable de alta calidad, cumpliendo con todos los estándares de salud.</p>
            </div>
            
            <div class="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all">
              <div class="bg-green-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-800 mb-4">Saneamiento Básico</h3>
              <p class="text-gray-600">Sistemas de alcantarillado y tratamiento de aguas residuales para proteger el medio ambiente.</p>
            </div>
            
            <div class="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all">
              <div class="bg-purple-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-800 mb-4">Atención 24/7</h3>
              <p class="text-gray-600">Servicio de emergencias y atención al cliente disponible las 24 horas del día, todos los días del año.</p>
            </div>
          </div>
        </div>
      </section>
    `,
    status: 'published',
    meta_description: 'Empresa de Servicios Públicos líder en suministro de agua potable y saneamiento básico. 25+ años de experiencia sirviendo a más de 50,000 usuarios.',
    meta_keywords: 'inicio, agua potable, saneamiento basico, servicios publicos, acueducto, empresa'
  },
  
  'informacion-esal': {
    title: 'Información ESAL',
    slug: 'informacion-esal',
    content: `
      <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <!-- Hero Section -->
        <div class="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
          <div class="absolute inset-0 bg-black opacity-20"></div>
          <div class="relative container mx-auto px-4 text-center">
            <h1 class="text-5xl font-bold mb-6">
              Información <span class="text-green-300">ESAL</span>
            </h1>
            <p class="text-xl mb-8 max-w-3xl mx-auto">
              Transparencia y rendición de cuentas. Accede a toda la información 
              corporativa y documentos oficiales de nuestra empresa.
            </p>
            
            <!-- Key Stats -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div class="text-center">
                <div class="text-4xl font-bold mb-2">100%</div>
                <div class="text-blue-200">Transparencia</div>
              </div>
              <div class="text-center">
                <div class="text-4xl font-bold mb-2">24/7</div>
                <div class="text-blue-200">Acceso a Información</div>
              </div>
              <div class="text-center">
                <div class="text-4xl font-bold mb-2">ISO</div>
                <div class="text-blue-200">Certificación</div>
              </div>
            </div>
          </div>
        </div>

        <div class="container mx-auto px-4 py-16">
          <div class="space-y-16">

            <!-- Información Organizacional -->
            <section class="bg-white rounded-2xl shadow-xl p-12">
              <h2 class="text-4xl font-bold text-center text-gray-800 mb-12">
                Información Corporativa
              </h2>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                  <div class="flex items-center space-x-4">
                    <div class="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-full">
                      <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 class="text-lg font-semibold text-gray-800">Razón Social</h3>
                      <p class="text-gray-600">Empresa de Servicios Públicos Acueducto Municipal E.S.P.</p>
                    </div>
                  </div>
                </div>

                <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                  <div class="flex items-center space-x-4">
                    <div class="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-full">
                      <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 class="text-lg font-semibold text-gray-800">NIT</h3>
                      <p class="text-gray-600">900.123.456-7</p>
                    </div>
                  </div>
                </div>

                <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                  <div class="flex items-center space-x-4">
                    <div class="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-full">
                      <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 class="text-lg font-semibold text-gray-800">Representante Legal</h3>
                      <p class="text-gray-600">Ing. María González Rodríguez</p>
                    </div>
                  </div>
                </div>

                <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                  <div class="flex items-center space-x-4">
                    <div class="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-full">
                      <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 class="text-lg font-semibold text-gray-800">Fecha de Constitución</h3>
                      <p class="text-gray-600">15 de marzo de 1990</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <!-- Documentos Oficiales -->
            <section class="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-12">
              <h2 class="text-4xl font-bold text-center text-gray-800 mb-12">
                Documentos Oficiales
              </h2>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                <div class="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 group">
                  <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center space-x-3">
                      <div class="bg-gradient-to-r from-red-500 to-red-600 p-3 rounded-lg">
                        <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                      </div>
                      <div>
                        <h3 class="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                          Estatutos Sociales
                        </h3>
                        <p class="text-sm text-gray-500">PDF • 2.5 MB</p>
                      </div>
                    </div>
                    <span class="text-xs text-gray-500 bg-blue-100 px-3 py-1 rounded-full">
                      15/01/2024
                    </span>
                  </div>
                  
                  <p class="text-gray-600 mb-6">Documento constitutivo de la empresa</p>
                  
                  <div class="flex space-x-3">
                    <button class="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex-1 justify-center">
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                      <span>Ver</span>
                    </button>
                    <button class="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex-1 justify-center">
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      <span>Descargar</span>
                    </button>
                  </div>
                </div>

                <div class="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 group">
                  <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center space-x-3">
                      <div class="bg-gradient-to-r from-red-500 to-red-600 p-3 rounded-lg">
                        <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                      </div>
                      <div>
                        <h3 class="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                          Estados Financieros 2023
                        </h3>
                        <p class="text-sm text-gray-500">PDF • 1.8 MB</p>
                      </div>
                    </div>
                    <span class="text-xs text-gray-500 bg-blue-100 px-3 py-1 rounded-full">
                      30/03/2024
                    </span>
                  </div>
                  
                  <p class="text-gray-600 mb-6">Balance general y estado de resultados</p>
                  
                  <div class="flex space-x-3">
                    <button class="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex-1 justify-center">
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                      <span>Ver</span>
                    </button>
                    <button class="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex-1 justify-center">
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      <span>Descargar</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <!-- Marco Legal -->
            <section class="bg-white rounded-2xl shadow-xl p-12">
              <h2 class="text-4xl font-bold text-center text-gray-800 mb-12">
                Marco Legal y Regulatorio
              </h2>
              
              <div class="max-w-4xl mx-auto">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8">
                    <div class="flex items-center mb-6">
                      <div class="bg-blue-600 p-3 rounded-full mr-4">
                        <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                        </svg>
                      </div>
                      <h3 class="text-xl font-semibold text-gray-800">Normatividad Aplicable</h3>
                    </div>
                    <ul class="space-y-3 text-gray-600">
                      <li class="flex items-start">
                        <span class="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Ley 142 de 1994 - Régimen de Servicios Públicos
                      </li>
                      <li class="flex items-start">
                        <span class="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Decreto 1077 de 2015 - Sector Vivienda
                      </li>
                      <li class="flex items-start">
                        <span class="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Resolución CRA 287 de 2004
                      </li>
                      <li class="flex items-start">
                        <span class="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Decreto 2811 de 1974 - Código Nacional de Recursos Naturales
                      </li>
                    </ul>
                  </div>
                  
                  <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-8">
                    <div class="flex items-center mb-6">
                      <div class="bg-green-600 p-3 rounded-full mr-4">
                        <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </div>
                      <h3 class="text-xl font-semibold text-gray-800">Entidades de Control</h3>
                    </div>
                    <ul class="space-y-3 text-gray-600">
                      <li class="flex items-start">
                        <span class="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Superintendencia de Servicios Públicos
                      </li>
                      <li class="flex items-start">
                        <span class="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Comisión de Regulación de Agua Potable (CRA)
                      </li>
                      <li class="flex items-start">
                        <span class="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Ministerio de Vivienda, Ciudad y Territorio
                      </li>
                      <li class="flex items-start">
                        <span class="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Contraloría Municipal
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    `,
    status: 'published',
    meta_description: 'Información corporativa oficial de la empresa. Documentos legales, estados financieros, marco regulatorio y transparencia empresarial.',
    meta_keywords: 'informacion esal, documentos oficiales, estados financieros, marco legal, transparencia'
  },
  
  'normatividad': {
    title: 'Normatividad',
    slug: 'normatividad',
    content: `
      <!-- Hero Section -->
      <section class="py-20 px-4">
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

      <!-- Marco Normativo Nacional -->
      <section class="py-16 px-4 bg-white/50">
        <div class="container mx-auto">
          <h2 class="text-3xl font-bold text-gray-800 mb-8 text-center">
            Marco Normativo Nacional
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Ley 142 de 1994 -->
            <div class="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div class="flex items-center justify-between mb-4">
                <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">Ley Nacional</span>
                <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Vigente</span>
              </div>
              <h3 class="text-xl font-bold text-gray-800 mb-3">Ley 142 de 1994</h3>
              <p class="text-gray-600 mb-4">Régimen de los servicios públicos domiciliarios</p>
              <div class="flex items-center text-sm text-gray-500 mb-4">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                11 de julio de 1994
              </div>
              <div class="flex space-x-2">
                <button class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                  Ver
                </button>
                <button class="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  Descargar
                </button>
              </div>
            </div>

            <!-- Decreto 1077 de 2015 -->
            <div class="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div class="flex items-center justify-between mb-4">
                <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">Decreto Nacional</span>
                <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Vigente</span>
              </div>
              <h3 class="text-xl font-bold text-gray-800 mb-3">Decreto 1077 de 2015</h3>
              <p class="text-gray-600 mb-4">Decreto Único Reglamentario del Sector Vivienda, Ciudad y Territorio</p>
              <div class="flex items-center text-sm text-gray-500 mb-4">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                26 de mayo de 2015
              </div>
              <div class="flex space-x-2">
                <button class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                  Ver
                </button>
                <button class="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  Descargar
                </button>
              </div>
            </div>

            <!-- Resolución CRA 287 de 2004 -->
            <div class="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div class="flex items-center justify-between mb-4">
                <span class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">Resolución CRA</span>
                <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Vigente</span>
              </div>
              <h3 class="text-xl font-bold text-gray-800 mb-3">Resolución CRA 287 de 2004</h3>
              <p class="text-gray-600 mb-4">Metodología tarifaria para el servicio público domiciliario de acueducto</p>
              <div class="flex items-center text-sm text-gray-500 mb-4">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                15 de junio de 2004
              </div>
              <div class="flex space-x-2">
                <button class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                  Ver
                </button>
                <button class="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  Descargar
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Políticas Internas -->
      <section class="py-16 px-4">
        <div class="container mx-auto">
          <h2 class="text-3xl font-bold text-gray-800 mb-8 text-center">
            Políticas y Reglamentos Internos
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 hover:shadow-lg transition-all duration-300 text-center">
              <div class="bg-blue-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-800 mb-2">Reglamento de Usuarios</h3>
              <p class="text-gray-600 text-sm mb-4">Normas y condiciones para la prestación del servicio</p>
              <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                Descargar PDF
              </button>
            </div>

            <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 hover:shadow-lg transition-all duration-300 text-center">
              <div class="bg-green-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-800 mb-2">Política de Calidad</h3>
              <p class="text-gray-600 text-sm mb-4">Compromiso con la excelencia en el servicio</p>
              <button class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm">
                Descargar PDF
              </button>
            </div>

            <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 hover:shadow-lg transition-all duration-300 text-center">
              <div class="bg-purple-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-800 mb-2">Manual de Procedimientos</h3>
              <p class="text-gray-600 text-sm mb-4">Procesos operativos y administrativos</p>
              <button class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm">
                Descargar PDF
              </button>
            </div>

            <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 hover:shadow-lg transition-all duration-300 text-center">
              <div class="bg-orange-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-800 mb-2">Código de Ética</h3>
              <p class="text-gray-600 text-sm mb-4">Principios y valores corporativos</p>
              <button class="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm">
                Descargar PDF
              </button>
            </div>
          </div>
        </div>
      </section>
    `,
    status: 'published',
    meta_description: 'Marco normativo completo que rige los servicios públicos de acueducto. Leyes, decretos, resoluciones y políticas internas.',
    meta_keywords: 'normatividad, leyes, decretos, resoluciones, marco legal, servicios publicos, reglamentos'
  },
  
  'portal-usuario': {
    title: 'Portal del Usuario',
    slug: 'portal-usuario',
    content: `
      <!-- Hero Section -->
      <section class="py-20 px-4 bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div class="container mx-auto text-center">
          <h1 class="text-5xl font-bold mb-6">Portal del Usuario</h1>
          <p class="text-xl mb-8 max-w-3xl mx-auto">
            Accede a todos los servicios en línea. Consulta tu factura, reporta daños, 
            solicita servicios y mantente informado sobre el estado de tu cuenta.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button class="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              Iniciar Sesión
            </button>
            <button class="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Registrarse
            </button>
          </div>
        </div>
      </section>

      <!-- Servicios en Línea -->
      <section class="py-16 px-4">
        <div class="container mx-auto">
          <h2 class="text-3xl font-bold text-gray-800 mb-8 text-center">
            Servicios en Línea
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <!-- Consulta de Factura -->
            <div class="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200">
              <div class="bg-blue-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-800 mb-4">Consulta de Factura</h3>
              <p class="text-gray-600 mb-6">Revisa el detalle de tu factura, historial de consumo y fechas de vencimiento.</p>
              <button class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                Consultar Factura
              </button>
            </div>

            <!-- Pago en Línea -->
            <div class="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200">
              <div class="bg-green-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-800 mb-4">Pago en Línea</h3>
              <p class="text-gray-600 mb-6">Paga tu factura de forma segura con tarjeta de crédito, débito o PSE.</p>
              <button class="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold">
                Pagar Ahora
              </button>
            </div>

            <!-- Reporte de Daños -->
            <div class="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200">
              <div class="bg-red-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-800 mb-4">Reporte de Daños</h3>
              <p class="text-gray-600 mb-6">Reporta fugas, daños en la red o problemas con el servicio de manera rápida.</p>
              <button class="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold">
                Reportar Daño
              </button>
            </div>

            <!-- Solicitud de Servicios -->
            <div class="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200">
              <div class="bg-purple-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 8h.01"></path>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-800 mb-4">Solicitud de Servicios</h3>
              <p class="text-gray-600 mb-6">Solicita nuevas conexiones, reconexiones o cambios en tu servicio.</p>
              <button class="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold">
                Solicitar Servicio
              </button>
            </div>

            <!-- Certificados -->
            <div class="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200">
              <div class="bg-indigo-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-800 mb-4">Certificados</h3>
              <p class="text-gray-600 mb-6">Descarga certificados de paz y salvo, conexión y otros documentos oficiales.</p>
              <button class="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold">
                Descargar Certificados
              </button>
            </div>

            <!-- Atención al Cliente -->
            <div class="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200">
              <div class="bg-orange-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-800 mb-4">Atención al Cliente</h3>
              <p class="text-gray-600 mb-6">Chat en vivo, PQRS y soporte técnico para resolver tus inquietudes.</p>
              <button class="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-colors font-semibold">
                Contactar Soporte
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Información Útil -->
      <section class="py-16 px-4 bg-gray-50">
        <div class="container mx-auto">
          <h2 class="text-3xl font-bold text-gray-800 mb-8 text-center">
            Información Útil
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300">
              <div class="text-3xl font-bold text-blue-600 mb-2">24/7</div>
              <div class="text-gray-600">Atención de Emergencias</div>
            </div>
            
            <div class="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300">
              <div class="text-3xl font-bold text-green-600 mb-2">99.5%</div>
              <div class="text-gray-600">Disponibilidad del Servicio</div>
            </div>
            
            <div class="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300">
              <div class="text-3xl font-bold text-purple-600 mb-2">2 Hrs</div>
              <div class="text-gray-600">Tiempo Promedio de Respuesta</div>
            </div>
            
            <div class="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300">
              <div class="text-3xl font-bold text-orange-600 mb-2">100%</div>
              <div class="text-gray-600">Seguridad en Pagos</div>
            </div>
          </div>
        </div>
      </section>
    `,
    status: 'published',
    meta_description: 'Portal del usuario para servicios en línea. Consulta facturas, realiza pagos, reporta daños y solicita servicios de forma rápida y segura.',
    meta_keywords: 'portal usuario, servicios en linea, consulta factura, pago online, reporte danos, atencion cliente'
  }
};

// Función principal
function updateRemainingPages() {
  console.log('Iniciando actualización de páginas restantes...');
  
  const db = readDatabase();
  let updatedCount = 0;
  
  // Actualizar cada página
  Object.keys(remainingPagesContent).forEach(slug => {
    const pageData = remainingPagesContent[slug];
    const existingPageIndex = db.pages.findIndex(page => page.slug === slug);
    
    if (existingPageIndex !== -1) {
      // Actualizar página existente
      db.pages[existingPageIndex] = {
        ...db.pages[existingPageIndex],
        title: pageData.title,
        content: pageData.content,
        status: pageData.status,
        meta_description: pageData.meta_description,
        meta_keywords: pageData.meta_keywords,
        published_json: {
          blocks: [
            {
              id: 'content-block',
              type: 'html',
              content: pageData.content,
              styles: {
                padding: '0',
                margin: '0'
              }
            }
          ],
          meta: {
            title: pageData.title,
            description: pageData.meta_description,
            keywords: pageData.meta_keywords
          }
        },
        updated_at: new Date().toISOString()
      };
      
      console.log(`✓ Página actualizada: ${pageData.title}`);
      updatedCount++;
    }
  });
  
  // Guardar cambios
  writeDatabase(db);
  
  console.log(`\n=== RESUMEN DE ACTUALIZACIÓN ===`);
  console.log(`Páginas actualizadas: ${updatedCount}`);
  console.log(`Total de páginas en la base de datos: ${db.pages.length}`);
  
  // Mostrar todas las páginas públicas
  const publicPages = db.pages.filter(page => page.published);
  console.log(`\nPáginas públicas disponibles (${publicPages.length}):`);
  publicPages.forEach(page => {
    console.log(`- ${page.title} (${page.slug})`);
  });
  
  console.log('\n¡Actualización completada exitosamente!');
}

// Ejecutar la función
try {
  updateRemainingPages();
} catch (error) {
  console.error('Error durante la actualización:', error.message);
  process.exit(1);
}