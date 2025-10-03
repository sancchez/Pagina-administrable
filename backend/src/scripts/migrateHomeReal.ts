import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const HOME_HTML = `
<div class="min-h-screen bg-white">
  <!-- Hero Section -->
  <div class="relative bg-gradient-to-br from-blue-600 via-blue-700 to-green-600 text-white py-24 overflow-hidden">
    <!-- Elementos decorativos de fondo -->
    <div class="absolute inset-0 bg-black/10"></div>
    <div class="absolute top-0 left-0 w-full h-full">
      <div class="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
      <div class="absolute bottom-20 right-10 w-48 h-48 bg-green-400/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
      <div class="absolute top-1/2 left-1/3 w-24 h-24 bg-blue-300/20 rounded-full blur-lg animate-pulse delay-500"></div>
    </div>
    
    <div class="relative container mx-auto px-4 text-center">
      <div class="max-w-4xl mx-auto">
        <!-- Badge superior -->
        <div class="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 mb-8 border border-white/30">
          <svg class="w-4 h-4 mr-2 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span class="text-sm font-medium">Servicio confiable desde 1990</span>
        </div>
        
        <h1 class="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Agua Pura para
          <span class="block bg-gradient-to-r from-green-300 to-blue-300 bg-clip-text text-transparent">
            Tu Comunidad
          </span>
        </h1>
        
        <p class="text-xl md:text-2xl mb-10 max-w-3xl mx-auto text-blue-100 leading-relaxed">
          Brindamos servicios de agua potable de la más alta calidad, garantizando 
          el acceso continuo y confiable al recurso hídrico para todas las familias.
        </p>
        
        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button class="group bg-white text-blue-700 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center">
            Conoce Nuestros Servicios
            <svg class="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
          <button class="group bg-transparent border-2 border-white/50 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 hover:border-white transition-all duration-300 backdrop-blur-sm">
            Portal de Usuario
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Features Section -->
  <section class="py-20 px-4 bg-white">
    <div class="container mx-auto">
      <div class="text-center mb-16">
        <h2 class="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
          ¿Por qué elegir nuestro
          <span class="block bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            servicio?
          </span>
        </h2>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          Nos comprometemos con la excelencia en cada gota de agua que llega a tu hogar
        </p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <!-- Feature 1: Agua de Calidad -->
        <div class="group bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-blue-100/50">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
            <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-800 mb-4 group-hover:text-blue-700 transition-colors">
            Agua de Calidad
          </h3>
          <p class="text-gray-600 leading-relaxed">
            Cumplimos con todos los estándares de calidad nacional e internacional
          </p>
        </div>

        <!-- Feature 2: Servicio Confiable -->
        <div class="group bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-blue-100/50">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
            <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-800 mb-4 group-hover:text-blue-700 transition-colors">
            Servicio Confiable
          </h3>
          <p class="text-gray-600 leading-relaxed">
            Más de 30 años garantizando el suministro continuo de agua potable
          </p>
        </div>

        <!-- Feature 3: Disponibilidad 24/7 -->
        <div class="group bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-blue-100/50">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-green-500 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
            <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-800 mb-4 group-hover:text-blue-700 transition-colors">
            Disponibilidad 24/7
          </h3>
          <p class="text-gray-600 leading-relaxed">
            Servicio ininterrumpido con monitoreo constante de la red
          </p>
        </div>

        <!-- Feature 4: Atención Personalizada -->
        <div class="group bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-blue-100/50">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-600 to-blue-500 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
            <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-800 mb-4 group-hover:text-blue-700 transition-colors">
            Atención Personalizada
          </h3>
          <p class="text-gray-600 leading-relaxed">
            Equipo especializado para resolver todas tus consultas y necesidades
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- Stats Section -->
  <section class="py-20 px-4 bg-gradient-to-br from-gray-50 to-blue-50/30">
    <div class="container mx-auto">
      <div class="text-center mb-16">
        <h2 class="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
          Nuestros
          <span class="block bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Resultados
          </span>
        </h2>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
          Cifras que reflejan nuestro compromiso con la excelencia y el servicio a la comunidad
        </p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <!-- Stat 1: Familias Atendidas -->
        <div class="group relative bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-white/50 backdrop-blur-sm overflow-hidden">
          <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-xl transform translate-x-8 -translate-y-8"></div>
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg relative z-10">
            <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
            </svg>
          </div>
          <div class="relative z-10">
            <h3 class="text-4xl md:text-5xl font-bold text-gray-800 mb-2 group-hover:text-blue-700 transition-colors">
              15,000+
            </h3>
            <h4 class="text-lg font-semibold text-gray-700 mb-3">
              Familias Atendidas
            </h4>
            <p class="text-gray-600 text-sm leading-relaxed">
              Hogares con acceso continuo al servicio
            </p>
          </div>
        </div>

        <!-- Stat 2: Calidad del Agua -->
        <div class="group relative bg-gradient-to-br from-green-50 to-green-100 rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-white/50 backdrop-blur-sm overflow-hidden">
          <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-xl transform translate-x-8 -translate-y-8"></div>
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg relative z-10">
            <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"></path>
            </svg>
          </div>
          <div class="relative z-10">
            <h3 class="text-4xl md:text-5xl font-bold text-gray-800 mb-2 group-hover:text-blue-700 transition-colors">
              99.8%
            </h3>
            <h4 class="text-lg font-semibold text-gray-700 mb-3">
              Calidad del Agua
            </h4>
            <p class="text-gray-600 text-sm leading-relaxed">
              Cumplimiento de estándares internacionales
            </p>
          </div>
        </div>

        <!-- Stat 3: Disponibilidad -->
        <div class="group relative bg-gradient-to-br from-blue-50 to-green-50 rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-white/50 backdrop-blur-sm overflow-hidden">
          <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-xl transform translate-x-8 -translate-y-8"></div>
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-green-500 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg relative z-10">
            <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
            </svg>
          </div>
          <div class="relative z-10">
            <h3 class="text-4xl md:text-5xl font-bold text-gray-800 mb-2 group-hover:text-blue-700 transition-colors">
              24/7
            </h3>
            <h4 class="text-lg font-semibold text-gray-700 mb-3">
              Disponibilidad
            </h4>
            <p class="text-gray-600 text-sm leading-relaxed">
              Servicio ininterrumpido durante todo el año
            </p>
          </div>
        </div>

        <!-- Stat 4: Años de Experiencia -->
        <div class="group relative bg-gradient-to-br from-green-50 to-blue-50 rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-white/50 backdrop-blur-sm overflow-hidden">
          <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-xl transform translate-x-8 -translate-y-8"></div>
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-600 to-blue-500 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg relative z-10">
            <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
            </svg>
          </div>
          <div class="relative z-10">
            <h3 class="text-4xl md:text-5xl font-bold text-gray-800 mb-2 group-hover:text-blue-700 transition-colors">
              30+
            </h3>
            <h4 class="text-lg font-semibold text-gray-700 mb-3">
              Años de Experiencia
            </h4>
            <p class="text-gray-600 text-sm leading-relaxed">
              Décadas sirviendo a la comunidad
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Services Section -->
  <section class="py-20 px-4 bg-gradient-to-br from-white to-gray-50">
    <div class="container mx-auto">
      <div class="text-center mb-16">
        <h2 class="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
          Nuestros
          <span class="block bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Servicios
          </span>
        </h2>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          Ofrecemos una gama completa de servicios diseñados para garantizar 
          el acceso continuo y confiable al agua potable
        </p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <!-- Service 1: Mantenimiento y Reparaciones -->
        <div class="group bg-white rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 hover:border-blue-200">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
            <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-800 mb-4 group-hover:text-blue-700 transition-colors">
            Mantenimiento y Reparaciones
          </h3>
          <p class="text-gray-600 mb-6 leading-relaxed">
            Servicio técnico especializado para garantizar el funcionamiento óptimo de la red de distribución
          </p>
          <ul class="space-y-2">
            <li class="flex items-center text-sm text-gray-600">
              <div class="w-2 h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mr-3 flex-shrink-0"></div>
              Reparación de fugas
            </li>
            <li class="flex items-center text-sm text-gray-600">
              <div class="w-2 h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mr-3 flex-shrink-0"></div>
              Mantenimiento preventivo
            </li>
            <li class="flex items-center text-sm text-gray-600">
              <div class="w-2 h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mr-3 flex-shrink-0"></div>
              Instalaciones nuevas
            </li>
          </ul>
          <div class="mt-6 pt-6 border-t border-gray-100">
            <button class="group/btn text-blue-600 font-semibold hover:text-blue-700 transition-colors flex items-center">
              Más información
              <svg class="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Service 2: Atención al Cliente -->
        <div class="group bg-white rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 hover:border-blue-200">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
            <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-800 mb-4 group-hover:text-blue-700 transition-colors">
            Atención al Cliente
          </h3>
          <p class="text-gray-600 mb-6 leading-relaxed">
            Soporte personalizado para resolver todas tus consultas y solicitudes de manera eficiente
          </p>
          <ul class="space-y-2">
            <li class="flex items-center text-sm text-gray-600">
              <div class="w-2 h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mr-3 flex-shrink-0"></div>
              Línea de atención 24/7
            </li>
            <li class="flex items-center text-sm text-gray-600">
              <div class="w-2 h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mr-3 flex-shrink-0"></div>
              Chat en línea
            </li>
            <li class="flex items-center text-sm text-gray-600">
              <div class="w-2 h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mr-3 flex-shrink-0"></div>
              Visitas domiciliarias
            </li>
          </ul>
          <div class="mt-6 pt-6 border-t border-gray-100">
            <button class="group/btn text-blue-600 font-semibold hover:text-blue-700 transition-colors flex items-center">
              Más información
              <svg class="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Service 3: Facturación Transparente -->
        <div class="group bg-white rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 hover:border-blue-200">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-green-500 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
            <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-800 mb-4 group-hover:text-blue-700 transition-colors">
            Facturación Transparente
          </h3>
          <p class="text-gray-600 mb-6 leading-relaxed">
            Sistema de facturación claro y detallado con múltiples opciones de consulta y pago
          </p>
          <ul class="space-y-2">
            <li class="flex items-center text-sm text-gray-600">
              <div class="w-2 h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mr-3 flex-shrink-0"></div>
              Facturación digital
            </li>
            <li class="flex items-center text-sm text-gray-600">
              <div class="w-2 h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mr-3 flex-shrink-0"></div>
              Historial de consumo
            </li>
            <li class="flex items-center text-sm text-gray-600">
              <div class="w-2 h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mr-3 flex-shrink-0"></div>
              Alertas de vencimiento
            </li>
          </ul>
          <div class="mt-6 pt-6 border-t border-gray-100">
            <button class="group/btn text-blue-600 font-semibold hover:text-blue-700 transition-colors flex items-center">
              Más información
              <svg class="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Service 4: Métodos de Pago -->
        <div class="group bg-white rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 hover:border-blue-200">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-600 to-blue-500 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
            <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-800 mb-4 group-hover:text-blue-700 transition-colors">
            Métodos de Pago
          </h3>
          <p class="text-gray-600 mb-6 leading-relaxed">
            Diversas opciones de pago para tu comodidad y facilidad en el cumplimiento de tus obligaciones
          </p>
          <ul class="space-y-2">
            <li class="flex items-center text-sm text-gray-600">
              <div class="w-2 h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mr-3 flex-shrink-0"></div>
              Pago en línea
            </li>
            <li class="flex items-center text-sm text-gray-600">
              <div class="w-2 h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mr-3 flex-shrink-0"></div>
              Débito automático
            </li>
            <li class="flex items-center text-sm text-gray-600">
              <div class="w-2 h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mr-3 flex-shrink-0"></div>
              Puntos de pago físicos
            </li>
          </ul>
          <div class="mt-6 pt-6 border-t border-gray-100">
            <button class="group/btn text-blue-600 font-semibold hover:text-blue-700 transition-colors flex items-center">
              Más información
              <svg class="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Service 5: Cobertura Territorial -->
        <div class="group bg-white rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 hover:border-blue-200">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-green-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
            <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-800 mb-4 group-hover:text-blue-700 transition-colors">
            Cobertura Territorial
          </h3>
          <p class="text-gray-600 mb-6 leading-relaxed">
            Amplia cobertura en todo el municipio con planes de expansión continua
          </p>
          <ul class="space-y-2">
            <li class="flex items-center text-sm text-gray-600">
              <div class="w-2 h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mr-3 flex-shrink-0"></div>
              98% de cobertura
            </li>
            <li class="flex items-center text-sm text-gray-600">
              <div class="w-2 h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mr-3 flex-shrink-0"></div>
              Expansión rural
            </li>
            <li class="flex items-center text-sm text-gray-600">
              <div class="w-2 h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mr-3 flex-shrink-0"></div>
              Nuevos desarrollos
            </li>
          </ul>
          <div class="mt-6 pt-6 border-t border-gray-100">
            <button class="group/btn text-blue-600 font-semibold hover:text-blue-700 transition-colors flex items-center">
              Más información
              <svg class="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Service 6: Monitoreo Continuo -->
        <div class="group bg-white rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 hover:border-blue-200">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
            <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-800 mb-4 group-hover:text-blue-700 transition-colors">
            Monitoreo Continuo
          </h3>
          <p class="text-gray-600 mb-6 leading-relaxed">
            Supervisión constante de la calidad del agua y el funcionamiento del sistema
          </p>
          <ul class="space-y-2">
            <li class="flex items-center text-sm text-gray-600">
              <div class="w-2 h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mr-3 flex-shrink-0"></div>
              Control de calidad
            </li>
            <li class="flex items-center text-sm text-gray-600">
              <div class="w-2 h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mr-3 flex-shrink-0"></div>
              Monitoreo de presión
            </li>
            <li class="flex items-center text-sm text-gray-600">
              <div class="w-2 h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mr-3 flex-shrink-0"></div>
              Alertas tempranas
            </li>
          </ul>
          <div class="mt-6 pt-6 border-t border-gray-100">
            <button class="group/btn text-blue-600 font-semibold hover:text-blue-700 transition-colors flex items-center">
              Más información
              <svg class="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Call to Action -->
      <div class="text-center mt-16">
        <div class="bg-gradient-to-r from-blue-600 to-green-600 rounded-3xl p-12 text-white">
          <h3 class="text-3xl md:text-4xl font-bold mb-6">
            ¿Necesitas más información?
          </h3>
          <p class="text-xl mb-8 max-w-2xl mx-auto text-blue-100">
            Nuestro equipo está listo para atenderte y resolver todas tus consultas
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button class="bg-white text-blue-700 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-lg">
              Contactar Ahora
            </button>
            <button class="bg-transparent border-2 border-white/50 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 hover:border-white transition-all duration-300 backdrop-blur-sm">
              Ver Portal de Usuario
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>
`;

const HOME_CSS = `
/* Estilos específicos para la página de inicio */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}

.delay-500 {
  animation-delay: 500ms;
}

.delay-1000 {
  animation-delay: 1000ms;
}

/* Gradientes de texto */
.bg-clip-text {
  -webkit-background-clip: text;
  background-clip: text;
}

.text-transparent {
  color: transparent;
}

/* Efectos de hover mejorados */
.group:hover .group-hover\\:scale-110 {
  transform: scale(1.1);
}

.group:hover .group-hover\\:translate-x-1 {
  transform: translateX(0.25rem);
}

.group:hover .group-hover\\:text-blue-700 {
  color: rgb(29 78 216);
}

.group/btn:hover .group-hover\\/btn\\:translate-x-1 {
  transform: translateX(0.25rem);
}

/* Efectos de backdrop blur */
.backdrop-blur-sm {
  backdrop-filter: blur(4px);
}

/* Transiciones suaves */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

.duration-300 {
  transition-duration: 300ms;
}

.duration-500 {
  transition-duration: 500ms;
}

/* Efectos de transformación */
.transform {
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.hover\\:-translate-y-2:hover {
  --tw-translate-y: -0.5rem;
}

.hover\\:-translate-y-3:hover {
  --tw-translate-y: -0.75rem;
}

.hover\\:scale-105:hover {
  --tw-scale-x: 1.05;
  --tw-scale-y: 1.05;
}

/* Sombras mejoradas */
.hover\\:shadow-2xl:hover {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.hover\\:shadow-xl:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Responsive design */
@media (min-width: 768px) {
  .md\\:text-5xl {
    font-size: 3rem;
    line-height: 1;
  }
  
  .md\\:text-7xl {
    font-size: 4.5rem;
    line-height: 1;
  }
  
  .md\\:text-2xl {
    font-size: 1.5rem;
    line-height: 2rem;
  }
  
  .md\\:text-4xl {
    font-size: 2.25rem;
    line-height: 2.5rem;
  }
}

/* Overflow hidden para elementos con efectos */
.overflow-hidden {
  overflow: hidden;
}

/* Z-index para layering */
.relative {
  position: relative;
}

.absolute {
  position: absolute;
}

.z-10 {
  z-index: 10;
}

/* Blur effects */
.blur-xl {
  filter: blur(24px);
}

.blur-2xl {
  filter: blur(40px);
}

.blur-lg {
  filter: blur(16px);
}
`;

async function migrateHomePage() {
  try {
    console.log('🚀 Iniciando migración de la página de inicio...');

    // Verificar si la página ya existe
    const existingPage = await prisma.page.findUnique({
      where: { slug: 'home' }
    });

    if (existingPage) {
      console.log('📝 Actualizando página existente...');
      await prisma.page.update({
        where: { slug: 'home' },
        data: {
          title: 'Inicio',
          html: HOME_HTML,
          css: HOME_CSS,
          gjsHtml: null,
          gjsCss: null,
          grapesData: null,
          isPublished: true,
          updatedAt: new Date()
        }
      });
    } else {
      console.log('✨ Creando nueva página...');
      await prisma.page.create({
        data: {
          name: 'Página de Inicio',
          slug: 'home',
          title: 'Inicio',
          html: HOME_HTML,
          css: HOME_CSS,
          gjsHtml: null,
          gjsCss: null,
          grapesData: null,
          isPublished: true
        }
      });
    }

    console.log('✅ Migración de la página de inicio completada exitosamente');
    console.log('📊 Contenido migrado:');
    console.log(`   - HTML: ${HOME_HTML.length} caracteres`);
    console.log(`   - CSS: ${HOME_CSS.length} caracteres`);
    console.log('🔗 La página está disponible en: /home');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la migración
migrateHomePage()
  .then(() => {
    console.log('🎉 Proceso de migración finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });