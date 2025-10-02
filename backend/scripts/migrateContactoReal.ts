import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CONTACTO_HTML = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contacto - Empresa de Servicios Públicos</title>
</head>
<body>
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

    <!-- Formulario de Contacto -->
    <section class="py-16 px-4">
        <div class="container mx-auto">
            <div class="max-w-4xl mx-auto">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <!-- Formulario -->
                    <div class="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-gray-200 shadow-lg">
                        <h2 class="text-2xl font-bold text-gray-800 mb-6">
                            Envíanos un Mensaje
                        </h2>
                        
                        <form class="space-y-4">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Nombre Completo
                                    </label>
                                    <div class="relative">
                                        <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                        </svg>
                                        <input
                                            type="text"
                                            class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="Tu nombre completo"
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Correo Electrónico
                                    </label>
                                    <div class="relative">
                                        <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                        </svg>
                                        <input
                                            type="email"
                                            class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="tu@email.com"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Teléfono
                                </label>
                                <div class="relative">
                                    <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                                    </svg>
                                    <input
                                        type="tel"
                                        class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="(57) 123-456-789"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Tipo de Solicitud
                                </label>
                                <select class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                                    <option>Selecciona una opción</option>
                                    <option>Información General</option>
                                    <option>Reclamo</option>
                                    <option>Solicitud de Servicio</option>
                                    <option>Reporte de Daño</option>
                                    <option>Otro</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Mensaje
                                </label>
                                <div class="relative">
                                    <svg class="absolute left-3 top-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                                    </svg>
                                    <textarea
                                        rows="4"
                                        class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                                        placeholder="Describe tu consulta o solicitud..."
                                    ></textarea>
                                </div>
                            </div>
                            
                            <button
                                type="submit"
                                class="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-green-600 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                            >
                                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                                </svg>
                                <span>Enviar Mensaje</span>
                            </button>
                        </form>
                    </div>

                    <!-- Mapa y Oficinas -->
                    <div class="space-y-6">
                        <!-- Mapa -->
                        <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
                            <h3 class="text-xl font-semibold text-gray-800 mb-4">Ubicación</h3>
                            <div class="bg-gray-200 rounded-lg h-48 flex items-center justify-center">
                                <p class="text-gray-600">Mapa Interactivo</p>
                            </div>
                        </div>

                        <!-- Oficinas -->
                        <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
                            <h3 class="text-xl font-semibold text-gray-800 mb-4">Nuestras Oficinas</h3>
                            <div class="space-y-4">
                                <div class="border-l-4 border-blue-500 pl-4">
                                    <h4 class="font-semibold text-gray-800">Oficina Principal</h4>
                                    <p class="text-gray-600 text-sm">Calle Principal #123, Centro</p>
                                    <p class="text-gray-600 text-sm">(57) 123-456-789</p>
                                    <p class="text-gray-600 text-sm">Lun - Vie: 8:00 AM - 5:00 PM</p>
                                </div>
                                <div class="border-l-4 border-blue-500 pl-4">
                                    <h4 class="font-semibold text-gray-800">Punto de Atención Norte</h4>
                                    <p class="text-gray-600 text-sm">Carrera 15 #45-67, Barrio Norte</p>
                                    <p class="text-gray-600 text-sm">(57) 123-456-791</p>
                                    <p class="text-gray-600 text-sm">Lun - Vie: 8:00 AM - 4:00 PM</p>
                                </div>
                                <div class="border-l-4 border-blue-500 pl-4">
                                    <h4 class="font-semibold text-gray-800">Punto de Atención Sur</h4>
                                    <p class="text-gray-600 text-sm">Calle 20 #30-45, Barrio Sur</p>
                                    <p class="text-gray-600 text-sm">(57) 123-456-792</p>
                                    <p class="text-gray-600 text-sm">Lun - Vie: 9:00 AM - 4:00 PM</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Emergencias -->
    <section class="py-16 px-4 bg-red-50">
        <div class="container mx-auto text-center">
            <div class="max-w-2xl mx-auto">
                <div class="bg-red-100 border border-red-200 rounded-xl p-8">
                    <h2 class="text-2xl font-bold text-red-800 mb-4">
                        ¿Tienes una Emergencia?
                    </h2>
                    <p class="text-red-700 mb-6">
                        Para reportes de emergencias como fugas, daños en tuberías o falta de agua, 
                        contáctanos inmediatamente a través de nuestra línea de emergencias.
                    </p>
                    <div class="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="tel:+571234567890"
                            class="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                        >
                            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                            </svg>
                            <span>(57) 123-456-790</span>
                        </a>
                        <a
                            href="https://wa.me/573001234567"
                            class="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                        >
                            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                            </svg>
                            <span>WhatsApp</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </section>
</body>
</html>`;

const CONTACTO_CSS = `
/* Estilos específicos para la página de Contacto */
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
}

.bg-gradient-to-r {
    background: linear-gradient(to right, var(--tw-gradient-stops));
}

.from-blue-600 {
    --tw-gradient-from: #2563eb;
    --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(37, 99, 235, 0));
}

.to-green-600 {
    --tw-gradient-to: #16a34a;
}

.bg-clip-text {
    background-clip: text;
    -webkit-background-clip: text;
}

.text-transparent {
    color: transparent;
}

.backdrop-blur-sm {
    backdrop-filter: blur(4px);
}

.transition-all {
    transition-property: all;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
}

.duration-300 {
    transition-duration: 300ms;
}

.hover\\:shadow-xl:hover {
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.focus\\:ring-2:focus {
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

.focus\\:border-blue-500:focus {
    border-color: #3b82f6;
}

.transition-colors {
    transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
}

.from-blue-500 {
    --tw-gradient-from: #3b82f6;
    --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(59, 130, 246, 0));
}

.to-green-500 {
    --tw-gradient-to: #22c55e;
}

.hover\\:from-blue-600:hover {
    --tw-gradient-from: #2563eb;
}

.hover\\:to-green-600:hover {
    --tw-gradient-to: #16a34a;
}

.duration-200 {
    transition-duration: 200ms;
}

.shadow-lg {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.hover\\:shadow-xl:hover {
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.resize-none {
    resize: none;
}

.hover\\:bg-red-700:hover {
    background-color: #b91c1c;
}

.hover\\:bg-green-700:hover {
    background-color: #15803d;
}
`;

async function migrateContactoPage() {
  try {
    console.log('🚀 Iniciando migración de la página de Contacto...');

    // Verificar si la página ya existe
    const existingPage = await prisma.page.findUnique({
      where: { slug: 'contacto' }
    });

    if (existingPage) {
      console.log('📝 Actualizando página existente...');
      await prisma.page.update({
        where: { slug: 'contacto' },
        data: {
          title: 'Contacto',
          html: CONTACTO_HTML,
          css: CONTACTO_CSS,
          isPublished: true,
          updatedAt: new Date()
        }
      });
    } else {
      console.log('✨ Creando nueva página...');
      await prisma.page.create({
        data: {
          name: 'Página de Contacto',
          slug: 'contacto',
          title: 'Contacto',
          html: CONTACTO_HTML,
          css: CONTACTO_CSS,
          isPublished: true
        }
      });
    }

    console.log('✅ Migración de la página de Contacto completada exitosamente');
    console.log('📊 Contenido migrado:');
    console.log(`   - HTML: ${CONTACTO_HTML.length} caracteres`);
    console.log(`   - CSS: ${CONTACTO_CSS.length} caracteres`);
    console.log('🔗 La página está disponible en: /contacto');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    console.log('🎉 Proceso de migración finalizado');
  }
}

// Ejecutar la migración
migrateContactoPage();