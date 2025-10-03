import { PrismaClient } from '@prisma/client';
import { processIconsInHtml } from '../utils/iconMapper';

const prisma = new PrismaClient();

const PORTAL_USUARIO_HTML = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portal del Usuario - ESAL</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-gradient-to-br from-blue-50 via-white to-green-50 min-h-screen">
    <!-- Hero Section -->
    <section class="py-20 px-4">
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

    <!-- Servicios en Línea -->
    <section class="py-16 px-4 bg-white/50">
        <div class="container mx-auto">
            <h2 class="text-3xl font-bold text-gray-800 mb-8 text-center">
                Servicios en Línea
            </h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <!-- Pagar Factura -->
                <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 group cursor-pointer">
                    <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                        <i class="fas fa-credit-card text-white text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">Pagar Factura</h3>
                    <p class="text-gray-600 mb-4">Realiza el pago de tu factura de forma rápida y segura</p>
                    <button class="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:shadow-lg transition-all duration-200">
                        Pagar Ahora
                    </button>
                </div>

                <!-- Consultar Factura -->
                <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 group cursor-pointer">
                    <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                        <i class="fas fa-file-text text-white text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">Consultar Factura</h3>
                    <p class="text-gray-600 mb-4">Consulta el estado de tu factura y historial de pagos</p>
                    <button class="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:shadow-lg transition-all duration-200">
                        Consultar
                    </button>
                </div>

                <!-- Consultar Consumo -->
                <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 group cursor-pointer">
                    <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                        <i class="fas fa-search text-white text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">Consultar Consumo</h3>
                    <p class="text-gray-600 mb-4">Revisa tu historial de consumo y estadísticas</p>
                    <button class="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:shadow-lg transition-all duration-200">
                        Ver Consumo
                    </button>
                </div>

                <!-- Descargar Certificados -->
                <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 group cursor-pointer">
                    <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                        <i class="fas fa-download text-white text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">Descargar Certificados</h3>
                    <p class="text-gray-600 mb-4">Obtén certificados de paz y salvo y otros documentos</p>
                    <button class="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:shadow-lg transition-all duration-200">
                        Descargar
                    </button>
                </div>

                <!-- Actualizar Datos -->
                <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 group cursor-pointer">
                    <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                        <i class="fas fa-user text-white text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">Actualizar Datos</h3>
                    <p class="text-gray-600 mb-4">Mantén actualizada tu información personal</p>
                    <button class="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold py-2 px-4 rounded-lg hover:shadow-lg transition-all duration-200">
                        Actualizar
                    </button>
                </div>

                <!-- Solicitudes y Reclamos -->
                <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 group cursor-pointer">
                    <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                        <i class="fas fa-comment-dots text-white text-2xl"></i>
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

    <!-- Métodos de Pago -->
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

    <!-- Canales de Atención -->
    <section class="py-16 px-4 bg-white/50">
        <div class="container mx-auto">
            <h2 class="text-3xl font-bold text-gray-800 mb-8 text-center">
                Canales de Atención
            </h2>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 text-center">
                    <div class="bg-gradient-to-r from-blue-500 to-green-500 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-phone text-white text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-800 mb-2">Línea de Atención</h3>
                    <p class="text-gray-700 font-medium mb-1">(57) 123-456-789</p>
                    <p class="text-gray-600 text-sm">Lun - Vie: 8:00 AM - 5:00 PM</p>
                </div>

                <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 text-center">
                    <div class="bg-gradient-to-r from-blue-500 to-green-500 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-comment-dots text-white text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-800 mb-2">Chat en Línea</h3>
                    <p class="text-gray-700 font-medium mb-1">Disponible 24/7</p>
                    <p class="text-gray-600 text-sm">Respuesta inmediata</p>
                </div>

                <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 text-center">
                    <div class="bg-gradient-to-r from-blue-500 to-green-500 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-clock text-white text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-800 mb-2">Oficina Principal</h3>
                    <p class="text-gray-700 font-medium mb-1">Calle Principal #123</p>
                    <p class="text-gray-600 text-sm">Lun - Vie: 8:00 AM - 4:00 PM</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Formulario de Consulta Rápida -->
    <section class="py-16 px-4">
        <div class="container mx-auto">
            <div class="max-w-2xl mx-auto">
                <div class="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-gray-200 shadow-lg">
                    <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">
                        Consulta Rápida de Factura
                    </h2>
                    
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Número de Cuenta o Cédula
                            </label>
                            <input
                                type="text"
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="Ingresa tu número de cuenta o cédula"
                            />
                        </div>
                        
                        <button class="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-green-600 transition-all duration-200 shadow-lg hover:shadow-xl">
                            Consultar Factura
                        </button>
                    </div>

                    <!-- Ejemplo de resultado de consulta -->
                    <div class="mt-6 p-6 bg-gray-50 rounded-lg" style="display: none;" id="invoice-result">
                        <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
                            <i class="fas fa-check-circle text-green-500"></i>
                            Información de Factura
                        </h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p class="text-sm text-gray-600">Número de Factura</p>
                                <p class="font-semibold">INV-2024-001</p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-600">Valor a Pagar</p>
                                <p class="font-semibold text-lg">$85,000</p>
                            </div>
                        </div>
                        <button class="mt-4 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
                            Pagar Ahora
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Información Adicional -->
    <section class="py-16 px-4 bg-white/50">
        <div class="container mx-auto">
            <div class="max-w-4xl mx-auto">
                <div class="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-gray-200">
                    <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">
                        Información Importante
                    </h2>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <i class="fas fa-info-circle text-blue-600"></i>
                                Horarios de Atención
                            </h3>
                            <ul class="space-y-2 text-gray-600">
                                <li>• Lunes a Viernes: 8:00 AM - 5:00 PM</li>
                                <li>• Sábados: 8:00 AM - 12:00 PM</li>
                                <li>• Domingos y Festivos: Cerrado</li>
                                <li>• Emergencias: 24/7</li>
                            </ul>
                        </div>
                        
                        <div>
                            <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <i class="fas fa-shield-alt text-green-600"></i>
                                Seguridad
                            </h3>
                            <ul class="space-y-2 text-gray-600">
                                <li>• Conexión SSL segura</li>
                                <li>• Datos protegidos</li>
                                <li>• Pagos certificados</li>
                                <li>• Privacidad garantizada</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <script>
        // Script básico para mostrar ejemplo de consulta
        document.addEventListener('DOMContentLoaded', function() {
            const consultarBtn = document.querySelector('button[onclick*="Consultar"]');
            const invoiceResult = document.getElementById('invoice-result');
            
            if (consultarBtn && invoiceResult) {
                consultarBtn.addEventListener('click', function() {
                    setTimeout(() => {
                        invoiceResult.style.display = 'block';
                        invoiceResult.scrollIntoView({ behavior: 'smooth' });
                    }, 1000);
                });
            }
        });
    </script>
</body>
</html>
`;

const PORTAL_USUARIO_CSS = `
/* Estilos adicionales para la página de Portal Usuario */
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

.duration-200 {
    transition-duration: 200ms;
}

.hover\\:shadow-xl:hover {
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.hover\\:shadow-lg:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Efectos de hover para botones */
button:hover {
    transform: translateY(-1px);
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

/* Estilos para formularios */
input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Responsive adjustments */
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
    
    .grid-cols-3 {
        grid-template-columns: repeat(1, minmax(0, 1fr));
    }
}

@media (max-width: 640px) {
    .grid-cols-2 {
        grid-template-columns: repeat(1, minmax(0, 1fr));
    }
}

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

/* Mejoras visuales */
.shadow-lg {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.shadow-xl {
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
`;

async function migratePortalUsuarioPage() {
  try {
    console.log('Iniciando migración de la página de Portal Usuario...');

    // Verificar si la página ya existe
    const existingPage = await prisma.page.findFirst({
      where: { slug: 'portal-usuario' }
    });

    if (existingPage) {
      // Actualizar página existente
      await prisma.page.update({
        where: { id: existingPage.id },
        data: {
          html: processIconsInHtml(PORTAL_USUARIO_HTML),
          css: PORTAL_USUARIO_CSS,
          title: 'Portal del Usuario',
          metaTitle: 'Portal del Usuario - ESAL',
          metaDescription: 'Accede a todos nuestros servicios en línea de forma fácil y segura. Gestiona tu cuenta, realiza pagos y mantente informado.',
          isPublished: true,
          isActive: true
        }
      });
      console.log('✅ Página de Portal Usuario actualizada exitosamente');
    } else {
      // Crear nueva página
      await prisma.page.create({
        data: {
          name: 'Portal del Usuario',
          title: 'Portal del Usuario',
          slug: 'portal-usuario',
          html: processIconsInHtml(PORTAL_USUARIO_HTML),
          css: PORTAL_USUARIO_CSS,
          metaTitle: 'Portal del Usuario - ESAL',
          metaDescription: 'Accede a todos nuestros servicios en línea de forma fácil y segura. Gestiona tu cuenta, realiza pagos y mantente informado.',
          isPublished: true,
          isActive: true
        }
      });
      console.log('✅ Página de Portal Usuario creada exitosamente');
    }

    console.log(`📄 HTML migrado: ${PORTAL_USUARIO_HTML.length} caracteres`);
    console.log(`🎨 CSS migrado: ${PORTAL_USUARIO_CSS.length} caracteres`);
    console.log('🌐 Página disponible en: /portal-usuario');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la migración
migratePortalUsuarioPage()
  .then(() => {
    console.log('🎉 Migración completada exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error en la migración:', error);
    process.exit(1);
  });