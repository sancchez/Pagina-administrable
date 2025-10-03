import { PrismaClient } from '@prisma/client';
import { processIconsInHtml } from '../utils/iconMapper';

const prisma = new PrismaClient();

const OPERACION_GESTION_HTML = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Operación y Gestión - ESAL</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-gradient-to-br from-blue-50 via-white to-green-50 min-h-screen">
    <!-- Hero Section -->
    <section class="py-20 px-4">
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
                        <i class="fas fa-chart-bar text-white text-2xl"></i>
                    </div>
                    <h3 class="text-3xl font-bold text-gray-800 mb-2">98.5%</h3>
                    <h4 class="text-lg font-semibold text-gray-700 mb-2">Cobertura del Servicio</h4>
                    <p class="text-gray-600 text-sm">Población con acceso al servicio</p>
                </div>

                <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 text-center group">
                    <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                        <i class="fas fa-chart-bar text-white text-2xl"></i>
                    </div>
                    <h3 class="text-3xl font-bold text-gray-800 mb-2">23.8 hrs/día</h3>
                    <h4 class="text-lg font-semibold text-gray-700 mb-2">Continuidad</h4>
                    <p class="text-gray-600 text-sm">Promedio de horas de servicio</p>
                </div>

                <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 text-center group">
                    <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                        <i class="fas fa-chart-bar text-white text-2xl"></i>
                    </div>
                    <h3 class="text-3xl font-bold text-gray-800 mb-2">99.9%</h3>
                    <h4 class="text-lg font-semibold text-gray-700 mb-2">Calidad del Agua</h4>
                    <p class="text-gray-600 text-sm">Cumplimiento normativo</p>
                </div>

                <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 text-center group">
                    <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                        <i class="fas fa-chart-bar text-white text-2xl"></i>
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
                            <i class="fas fa-tint text-white text-2xl"></i>
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
                            <i class="fas fa-cogs text-white text-2xl"></i>
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
                            <i class="fas fa-wrench text-white text-2xl"></i>
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
                            <i class="fas fa-chart-line text-white text-2xl"></i>
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

    <!-- Procesos de Calidad -->
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
                                <i class="fas fa-shield-alt text-blue-600 text-xl mr-3"></i>
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
                                <i class="fas fa-bolt text-green-600 text-xl mr-3"></i>
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
    </section>
</body>
</html>
`;

const OPERACION_GESTION_CSS = `
/* Estilos adicionales para la página de Operación y Gestión */
.container {
    max-width: 1200px;
}

.backdrop-blur-sm {
    backdrop-filter: blur(4px);
}

.bg-clip-text {
    -webkit-background-clip: text;
    background-clip: text;
}

.text-transparent {
    color: transparent;
}

.group:hover .group-hover\\:scale-110 {
    transform: scale(1.1);
}

.transition-all {
    transition-property: all;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

.duration-300 {
    transition-duration: 300ms;
}

.hover\\:shadow-xl:hover {
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Animaciones personalizadas */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-fade-in-up {
    animation: fadeInUp 0.6s ease-out;
}

/* Responsive adjustments */
/* Font Awesome */
.fas, .fa-solid {
    font-family: "Font Awesome 6 Free";
    font-weight: 900;
}

.far, .fa-regular {
    font-family: "Font Awesome 6 Free";
    font-weight: 400;
}

.fab, .fa-brands {
    font-family: "Font Awesome 6 Brands";
    font-weight: 400;
}

@media (max-width: 768px) {
    .text-5xl {
        font-size: 2.5rem;
    }
    
    .text-3xl {
        font-size: 1.875rem;
    }
    
    .text-2xl {
        font-size: 1.5rem;
    }
}
`;

async function migrateOperacionGestionPage() {
  try {
    console.log('Iniciando migración de la página de Operación y Gestión...');

    // Verificar si la página ya existe
    const existingPage = await prisma.page.findFirst({
      where: { slug: 'operacion-gestion' }
    });

    if (existingPage) {
      // Actualizar página existente
      await prisma.page.update({
        where: { id: existingPage.id },
        data: {
          html: processIconsInHtml(OPERACION_GESTION_HTML),
          css: OPERACION_GESTION_CSS,
          gjsHtml: undefined,
        gjsCss: undefined,
        grapesData: undefined,
          title: 'Operación y Gestión',
          metaTitle: 'Operación y Gestión - ESAL',
          metaDescription: 'Conoce cómo operamos y gestionamos nuestros procesos para garantizar un servicio de agua potable eficiente, confiable y de calidad.',
          isPublished: true,
          isActive: true
        }
      });
      console.log('✅ Página de Operación y Gestión actualizada exitosamente');
    } else {
      // Crear nueva página
      await prisma.page.create({
        data: {
          name: 'Operación y Gestión',
          title: 'Operación y Gestión',
          slug: 'operacion-gestion',
          html: processIconsInHtml(OPERACION_GESTION_HTML),
          css: OPERACION_GESTION_CSS,
          gjsHtml: undefined,
      gjsCss: undefined,
          grapesData: null,
          metaTitle: 'Operación y Gestión - ESAL',
          metaDescription: 'Conoce cómo operamos y gestionamos nuestros procesos para garantizar un servicio de agua potable eficiente, confiable y de calidad.',
          isPublished: true,
          isActive: true
        }
      });
      console.log('✅ Página de Operación y Gestión creada exitosamente');
    }

    console.log(`📄 HTML migrado: ${OPERACION_GESTION_HTML.length} caracteres`);
    console.log(`🎨 CSS migrado: ${OPERACION_GESTION_CSS.length} caracteres`);
    console.log('🌐 Página disponible en: /operacion-gestion');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la migración
migrateOperacionGestionPage()
  .then(() => {
    console.log('🎉 Migración completada exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error en la migración:', error);
    process.exit(1);
  });