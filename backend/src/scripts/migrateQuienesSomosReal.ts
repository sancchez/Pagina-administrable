#!/usr/bin/env ts-node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * HTML real extraído del componente QuienesSomos.tsx
 * Este es el contenido REAL, no simulado
 */
const QUIENES_SOMOS_HTML = `
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
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="6"></circle>
                <circle cx="12" cy="12" r="2"></circle>
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
                <circle cx="12" cy="12" r="10"></circle>
                <path d="m4.93 4.93 4.24 4.24"></path>
                <path d="m14.83 9.17 4.24-4.24"></path>
                <path d="m14.83 14.83 4.24 4.24"></path>
                <path d="m9.17 14.83-4.24 4.24"></path>
                <circle cx="12" cy="12" r="4"></circle>
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
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-800 mb-4 text-center">Valores</h3>
            <ul class="text-gray-600 space-y-3">
              <li class="flex items-center">
                <svg class="w-4 h-4 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4"></path>
                  <path d="M21 12c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1"></path>
                  <path d="M3 12c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1"></path>
                  <path d="M12 21c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1"></path>
                  <path d="M12 3c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1"></path>
                </svg>
                Compromiso
              </li>
              <li class="flex items-center">
                <svg class="w-4 h-4 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="m15 14 5-5-5-5"></path>
                  <path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5v0A5.5 5.5 0 0 0 9.5 20H13"></path>
                </svg>
                Transparencia
              </li>
              <li class="flex items-center">
                <svg class="w-4 h-4 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                  <path d="M4 22h16"></path>
                  <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                  <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                  <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
                </svg>
                Innovación
              </li>
              <li class="flex items-center">
                <svg class="w-4 h-4 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="m4.93 4.93 4.24 4.24"></path>
                  <path d="m14.83 9.17 4.24-4.24"></path>
                  <path d="m14.83 14.83 4.24 4.24"></path>
                  <path d="m9.17 14.83-4.24 4.24"></path>
                  <circle cx="12" cy="12" r="4"></circle>
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
                  <path d="M8 2v4"></path>
                  <path d="M16 2v4"></path>
                  <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                  <path d="M3 10h18"></path>
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
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="m22 21-3-3m0 0a5.5 5.5 0 1 1-7.78-7.78 5.5 5.5 0 0 1 7.78 7.78Z"></path>
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
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                  <path d="M4 22h16"></path>
                  <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                  <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                  <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
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
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
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
`;

const QUIENES_SOMOS_CSS = `
/* Estilos específicos para Quiénes Somos */
.min-h-screen { min-height: 100vh; }
.bg-gradient-to-br { background: linear-gradient(to bottom right, var(--tw-gradient-stops)); }
.from-blue-50 { --tw-gradient-from: #eff6ff; --tw-gradient-to: rgb(239 246 255 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.to-indigo-100 { --tw-gradient-to: #e0e7ff; }
.bg-gradient-to-r { background: linear-gradient(to right, var(--tw-gradient-stops)); }
.from-blue-600 { --tw-gradient-from: #2563eb; --tw-gradient-to: rgb(37 99 235 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.to-indigo-700 { --tw-gradient-to: #4338ca; }
.text-white { color: rgb(255 255 255); }
.py-20 { padding-top: 5rem; padding-bottom: 5rem; }
.relative { position: relative; }
.absolute { position: absolute; }
.inset-0 { inset: 0px; }
.bg-black { background-color: rgb(0 0 0); }
.opacity-20 { opacity: 0.2; }
.container { width: 100%; }
.mx-auto { margin-left: auto; margin-right: auto; }
.px-4 { padding-left: 1rem; padding-right: 1rem; }
.text-center { text-align: center; }
.text-5xl { font-size: 3rem; line-height: 1; }
.font-bold { font-weight: 700; }
.mb-6 { margin-bottom: 1.5rem; }
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }
.mb-8 { margin-bottom: 2rem; }
.max-w-3xl { max-width: 48rem; }
.grid { display: grid; }
.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.gap-8 { gap: 2rem; }
.mt-12 { margin-top: 3rem; }
.text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
.mb-2 { margin-bottom: 0.5rem; }
.text-blue-200 { color: rgb(191 219 254); }
.py-16 { padding-top: 4rem; padding-bottom: 4rem; }
.space-y-16 > :not([hidden]) ~ :not([hidden]) { margin-top: 4rem; }
.bg-white { background-color: rgb(255 255 255); }
.rounded-2xl { border-radius: 1rem; }
.shadow-xl { box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1); }
.p-12 { padding: 3rem; }
.text-gray-800 { color: rgb(31 41 55); }
.mb-12 { margin-bottom: 3rem; }
.rounded-xl { border-radius: 0.75rem; }
.p-8 { padding: 2rem; }
.hover\\:shadow-lg:hover { box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1); }
.transition-all { transition-property: all; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
.duration-300 { transition-duration: 300ms; }
.flex { display: flex; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.w-16 { width: 4rem; }
.h-16 { height: 4rem; }
.bg-blue-600 { background-color: rgb(37 99 235); }
.rounded-full { border-radius: 9999px; }
.mb-6 { margin-bottom: 1.5rem; }
.w-8 { width: 2rem; }
.h-8 { height: 2rem; }
.text-2xl { font-size: 1.5rem; line-height: 2rem; }
.mb-4 { margin-bottom: 1rem; }
.text-gray-600 { color: rgb(75 85 99); }
.leading-relaxed { line-height: 1.625; }
.bg-green-600 { background-color: rgb(22 163 74); }
.bg-purple-600 { background-color: rgb(147 51 234); }
.space-y-3 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.75rem; }
.w-4 { width: 1rem; }
.h-4 { height: 1rem; }
.text-purple-600 { color: rgb(147 51 234); }
.mr-3 { margin-right: 0.75rem; }
.from-gray-50 { --tw-gradient-from: #f9fafb; --tw-gradient-to: rgb(249 250 251 / 0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.to-blue-50 { --tw-gradient-to: #eff6ff; }
.max-w-4xl { max-width: 56rem; }
.space-y-8 > :not([hidden]) ~ :not([hidden]) { margin-top: 2rem; }
.items-start { align-items: flex-start; }
.space-x-6 > :not([hidden]) ~ :not([hidden]) { margin-left: 1.5rem; }
.rounded-lg { border-radius: 0.5rem; }
.p-6 { padding: 1.5rem; }
.shadow-md { box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); }
.transition-shadow { transition-property: box-shadow; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
.w-12 { width: 3rem; }
.h-12 { height: 3rem; }
.flex-shrink-0 { flex-shrink: 0; }
.w-6 { width: 1.5rem; }
.h-6 { height: 1.5rem; }
.bg-indigo-600 { background-color: rgb(79 70 229); }

@media (min-width: 768px) {
  .md\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}

@media (min-width: 1024px) {
  .container { max-width: 1024px; }
}

@media (min-width: 1280px) {
  .container { max-width: 1280px; }
}
`;

async function migrateQuienesSomosReal() {
  try {
    console.log('🚀 Migrando página Quiénes Somos con contenido REAL...');

    // Verificar si la página ya existe
    let page = await prisma.page.findUnique({
      where: { slug: 'quienes-somos' }
    });

    if (page) {
      // Actualizar página existente
      page = await prisma.page.update({
        where: { slug: 'quienes-somos' },
        data: {
          title: 'Quiénes Somos',
          html: QUIENES_SOMOS_HTML.trim(),
          css: QUIENES_SOMOS_CSS.trim(),
          content: null, // Limpiar contenido legacy
          grapesData: null, // Se generará cuando se edite en GrapesJS
          gjsHtml: undefined,
          gjsCss: undefined,
          isPublished: true,
          isActive: true,
          updatedAt: new Date()
        }
      });
      console.log('✅ Página Quiénes Somos actualizada con contenido REAL');
    } else {
      // Crear nueva página
      page = await prisma.page.create({
        data: {
          name: 'quienes-somos',
          title: 'Quiénes Somos',
          slug: 'quienes-somos',
          html: QUIENES_SOMOS_HTML.trim(),
          css: QUIENES_SOMOS_CSS.trim(),
          grapesData: null,
          gjsHtml: undefined,
          gjsCss: undefined,
          isPublished: true,
          isActive: true
        }
      });
      console.log('✅ Página Quiénes Somos creada con contenido REAL');
    }

    console.log('🎉 Migración de Quiénes Somos completada exitosamente!');
    console.log('📝 La página ahora contiene el contenido REAL del componente TSX');

  } catch (error) {
    console.error('❌ Error migrando Quiénes Somos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar migración
if (require.main === module) {
  migrateQuienesSomosReal().catch((error) => {
    console.error('💥 Error en la migración:', error);
    process.exit(1);
  });
}

export { migrateQuienesSomosReal };