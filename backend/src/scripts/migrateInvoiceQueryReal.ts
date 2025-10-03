import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const INVOICE_QUERY_HTML = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Consulta de Facturas - ESAL</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-gradient-to-br from-blue-50 via-white to-green-50 min-h-screen">
    <div class="container mx-auto px-4 py-8">
        <div class="max-w-2xl mx-auto">
            <div class="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-8">
                <!-- Header -->
                <div class="text-center mb-8">
                    <div class="bg-gradient-to-r from-blue-500 to-green-500 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-file-text text-white text-2xl"></i>
                    </div>
                    <h1 class="text-3xl font-bold text-gray-900">Consulta de Facturas</h1>
                    <p class="text-gray-600 mt-2">
                        Ingrese su número de cuenta o cédula para consultar el estado de su factura
                    </p>
                </div>

                <!-- Formulario de Búsqueda -->
                <div class="space-y-4 mb-6">
                    <div>
                        <label for="account" class="block text-sm font-medium text-gray-700 mb-2">
                            Número de Cuenta / Cédula
                        </label>
                        <div class="relative">
                            <input
                                type="text"
                                id="account"
                                name="account"
                                class="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="Ej: 12345 o 1234567890"
                            />
                            <i class="fas fa-search absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                        </div>
                    </div>

                    <button
                        id="searchBtn"
                        class="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                    >
                        <i class="fas fa-search"></i>
                        <span>Buscar Factura</span>
                    </button>
                </div>

                <!-- Mensaje de Error -->
                <div id="errorMessage" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 hidden">
                    <p class="text-red-600 text-center">Por favor ingrese un número de cuenta válido</p>
                </div>

                <!-- Loading State -->
                <div id="loadingState" class="text-center py-8 hidden">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p class="text-gray-600">Consultando factura...</p>
                </div>

                <!-- Resultado de la Factura -->
                <div id="invoiceResult" class="border-t pt-6 hidden">
                    <h2 class="text-xl font-semibold text-gray-900 mb-6 text-center">
                        Información de la Factura
                    </h2>
                    
                    <div class="space-y-4">
                        <!-- Cliente -->
                        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div class="flex items-center space-x-3">
                                <i class="fas fa-user text-gray-500"></i>
                                <span class="font-medium">Cliente:</span>
                            </div>
                            <span id="customerName" class="text-gray-900">Ana María Rodríguez</span>
                        </div>

                        <!-- Número de Cuenta -->
                        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div class="flex items-center space-x-3">
                                <i class="fas fa-file-text text-gray-500"></i>
                                <span class="font-medium">N° Cuenta:</span>
                            </div>
                            <span id="accountNumber" class="text-gray-900">54321</span>
                        </div>

                        <!-- Monto -->
                        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div class="flex items-center space-x-3">
                                <i class="fas fa-dollar-sign text-gray-500"></i>
                                <span class="font-medium">Monto:</span>
                            </div>
                            <span id="amount" class="text-lg font-bold text-gray-900">$92,500</span>
                        </div>

                        <!-- Fecha de Vencimiento -->
                        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div class="flex items-center space-x-3">
                                <i class="fas fa-calendar text-gray-500"></i>
                                <span class="font-medium">Vence:</span>
                            </div>
                            <span id="dueDate" class="text-gray-900">25/02/2024</span>
                        </div>

                        <!-- Estado -->
                        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <span class="font-medium">Estado:</span>
                            <span id="status" class="px-3 py-1 rounded-full text-sm font-medium text-green-600 bg-green-50">
                                Pagada
                            </span>
                        </div>

                        <!-- Descripción -->
                        <div id="descriptionSection" class="p-4 bg-gray-50 rounded-lg">
                            <span class="font-medium block mb-2">Descripción:</span>
                            <span id="description" class="text-gray-700">Factura de servicios públicos - Febrero 2024</span>
                        </div>

                        <!-- Número de Factura -->
                        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div class="flex items-center space-x-3">
                                <i class="fas fa-hashtag text-gray-500"></i>
                                <span class="font-medium">N° Factura:</span>
                            </div>
                            <span id="invoiceNumber" class="text-gray-900 font-mono">FAC-2024-0215</span>
                        </div>

                        <!-- Período de Facturación -->
                        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div class="flex items-center space-x-3">
                                <i class="fas fa-calendar-alt text-gray-500"></i>
                                <span class="font-medium">Período:</span>
                            </div>
                            <span id="period" class="text-gray-900">Febrero 2024</span>
                        </div>
                    </div>

                    <!-- Información Adicional -->
                    <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p class="text-blue-700 text-sm text-center">
                            💡 Puede pagar en nuestras oficinas o puntos de pago autorizados
                        </p>
                    </div>

                    <!-- Botones de Acción -->
                    <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button class="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                            <i class="fas fa-credit-card"></i>
                            <span>Pagar</span>
                        </button>
                        <button class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                            <i class="fas fa-download"></i>
                            <span>Descargar</span>
                        </button>
                        <button class="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                            <i class="fas fa-print"></i>
                            <span>Imprimir</span>
                        </button>
                    </div>
                </div>

                <!-- Información de Ayuda -->
                <div class="mt-8 p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-gray-200">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4 text-center">
                        ¿Necesita ayuda con su consulta?
                    </h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="text-center">
                            <div class="bg-blue-500 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                                <i class="fas fa-phone text-white"></i>
                            </div>
                            <p class="text-sm font-medium text-gray-700 mb-1">Línea de Atención</p>
                            <p class="text-sm text-gray-600">(57) 123-456-789</p>
                            <p class="text-xs text-gray-500 mt-1">Lun - Vie: 8AM - 5PM</p>
                        </div>
                        
                        <div class="text-center">
                            <div class="bg-green-500 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                                <i class="fas fa-envelope text-white"></i>
                            </div>
                            <p class="text-sm font-medium text-gray-700 mb-1">Email de Soporte</p>
                            <p class="text-sm text-gray-600">facturas@esal.com</p>
                            <p class="text-xs text-gray-500 mt-1">Respuesta en 24 horas</p>
                        </div>
                    </div>
                </div>

                <!-- Tips de Uso -->
                <div class="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 class="text-sm font-semibold text-yellow-800 mb-2 flex items-center">
                        <i class="fas fa-lightbulb mr-2"></i>
                        Consejos para la consulta
                    </h4>
                    <ul class="text-sm text-yellow-700 space-y-1">
                        <li>• Ingrese su número de cuenta tal como aparece en su factura</li>
                        <li>• También puede usar su número de cédula para la consulta</li>
                        <li>• Si no encuentra su factura, verifique que el número sea correcto</li>
                        <li>• Para facturas muy antiguas, contacte nuestro servicio al cliente</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const searchBtn = document.getElementById('searchBtn');
            const accountInput = document.getElementById('account');
            const errorMessage = document.getElementById('errorMessage');
            const loadingState = document.getElementById('loadingState');
            const invoiceResult = document.getElementById('invoiceResult');

            // Datos de ejemplo para la demostración
            const mockInvoices = {
                '54321': {
                    customerName: 'Ana María Rodríguez',
                    accountNumber: '54321',
                    amount: 92500,
                    dueDate: '25/02/2024',
                    status: 'paid',
                    description: 'Factura de servicios públicos - Febrero 2024',
                    invoiceNumber: 'FAC-2024-0215',
                    period: 'Febrero 2024'
                },
                '98765': {
                    customerName: 'Carlos Eduardo Martínez',
                    accountNumber: '98765',
                    amount: 67800,
                    dueDate: '18/02/2024',
                    status: 'pending',
                    description: 'Factura de servicios públicos - Febrero 2024',
                    invoiceNumber: 'FAC-2024-0198',
                    period: 'Febrero 2024'
                },
                '1098765432': {
                    customerName: 'Lucía Fernández Gómez',
                    accountNumber: '1098765432',
                    amount: 105000,
                    dueDate: '10/02/2024',
                    status: 'overdue',
                    description: 'Factura de servicios públicos - Enero 2024',
                    invoiceNumber: 'FAC-2024-0156',
                    period: 'Enero 2024'
                },
                '13579': {
                    customerName: 'Roberto Silva Pérez',
                    accountNumber: '13579',
                    amount: 73200,
                    dueDate: '28/02/2024',
                    status: 'pending',
                    description: 'Factura de servicios públicos - Febrero 2024',
                    invoiceNumber: 'FAC-2024-0234',
                    period: 'Febrero 2024'
                }
            };

            function getStatusColor(status) {
                switch (status) {
                    case 'paid': return 'text-green-600 bg-green-50';
                    case 'pending': return 'text-yellow-600 bg-yellow-50';
                    case 'overdue': return 'text-red-600 bg-red-50';
                    default: return 'text-gray-600 bg-gray-50';
                }
            }

            function getStatusText(status) {
                switch (status) {
                    case 'paid': return 'Pagada';
                    case 'pending': return 'Pendiente';
                    case 'overdue': return 'Vencida';
                    default: return 'Desconocido';
                }
            }

            function searchInvoice() {
                const account = accountInput.value.trim();
                
                // Ocultar mensajes previos
                errorMessage.classList.add('hidden');
                invoiceResult.classList.add('hidden');
                
                if (!account) {
                    errorMessage.querySelector('p').textContent = 'Por favor ingrese un número de cuenta o cédula';
                    errorMessage.classList.remove('hidden');
                    return;
                }

                // Mostrar loading
                loadingState.classList.remove('hidden');
                searchBtn.disabled = true;
                searchBtn.innerHTML = '<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Consultando...';

                // Simular búsqueda
                setTimeout(() => {
                    loadingState.classList.add('hidden');
                    searchBtn.disabled = false;
                    searchBtn.innerHTML = '<i class="fas fa-search mr-2"></i>Buscar Factura';

                    const invoice = mockInvoices[account];
                    
                    if (invoice) {
                        // Mostrar resultado
                        document.getElementById('customerName').textContent = invoice.customerName;
                        document.getElementById('accountNumber').textContent = invoice.accountNumber;
                        document.getElementById('amount').textContent = '$' + invoice.amount.toLocaleString();
                        document.getElementById('dueDate').textContent = invoice.dueDate;
                        document.getElementById('description').textContent = invoice.description;
                        document.getElementById('invoiceNumber').textContent = invoice.invoiceNumber;
                        document.getElementById('period').textContent = invoice.period;
                        
                        const statusElement = document.getElementById('status');
                        statusElement.textContent = getStatusText(invoice.status);
                        statusElement.className = 'px-3 py-1 rounded-full text-sm font-medium ' + getStatusColor(invoice.status);
                        
                        invoiceResult.classList.remove('hidden');
                        invoiceResult.scrollIntoView({ behavior: 'smooth' });
                    } else {
                        errorMessage.querySelector('p').textContent = 'Factura no encontrada. Verifique el número de cuenta o cédula.';
                        errorMessage.classList.remove('hidden');
                    }
                }, 1800);
            }

            searchBtn.addEventListener('click', searchInvoice);
            
            accountInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    searchInvoice();
                }
            });
        });
    </script>
</body>
</html>
`;

const INVOICE_QUERY_CSS = `
/* Estilos adicionales para la página de consulta de facturas */
.container {
    max-width: 1200px;
}

.backdrop-blur-sm {
    backdrop-filter: blur(4px);
}

/* Animaciones */
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

/* Efectos de hover */
button:hover {
    transform: translateY(-1px);
}

.transition-all {
    transition-property: all;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 200ms;
}

/* Estilos para formularios */
input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Loading spinner */
@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.animate-spin {
    animation: spin 1s linear infinite;
}

/* Estados de factura */
.status-paid {
    background-color: #dcfce7;
    color: #166534;
}

.status-pending {
    background-color: #fef3c7;
    color: #92400e;
}

.status-overdue {
    background-color: #fee2e2;
    color: #991b1b;
}

/* Fuente monospace para números */
.font-mono {
    font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .text-3xl {
        font-size: 1.875rem;
    }
    
    .text-2xl {
        font-size: 1.5rem;
    }
    
    .grid-cols-3 {
        grid-template-columns: repeat(1, minmax(0, 1fr));
    }
    
    .grid-cols-2 {
        grid-template-columns: repeat(1, minmax(0, 1fr));
    }
}

@media (max-width: 640px) {
    .p-8 {
        padding: 1.5rem;
    }
    
    .space-x-2 > * + * {
        margin-left: 0.25rem;
    }
    
    .text-sm {
        font-size: 0.75rem;
    }
}

/* Mejoras visuales */
.shadow-lg {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.shadow-xl {
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Iconos Font Awesome */
.fas {
    font-family: "Font Awesome 6 Free";
    font-weight: 900;
}

/* Efectos de gradiente */
.bg-gradient-to-r {
    background-image: linear-gradient(to right, var(--tw-gradient-stops));
}

.from-blue-600 {
    --tw-gradient-from: #2563eb;
    --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(37, 99, 235, 0));
}

.to-blue-700 {
    --tw-gradient-to: #1d4ed8;
}

.hover\:from-blue-700:hover {
    --tw-gradient-from: #1d4ed8;
}

.hover\:to-blue-800:hover {
    --tw-gradient-to: #1e40af;
}

/* Estilos para tips */
.bg-yellow-50 {
    background-color: #fefce8;
}

.border-yellow-200 {
    border-color: #fde68a;
}

.text-yellow-800 {
    color: #92400e;
}

.text-yellow-700 {
    color: #a16207;
}
`;

async function migrateInvoiceQueryPage() {
  try {
    console.log('Iniciando migración de la página de consulta de facturas...');

    // Verificar si la página ya existe
    const existingPage = await prisma.page.findFirst({
      where: { slug: 'consulta-facturas' }
    });

    if (existingPage) {
      // Actualizar página existente
      await prisma.page.update({
        where: { id: existingPage.id },
        data: {
          html: INVOICE_QUERY_HTML,
          css: INVOICE_QUERY_CSS,
          title: 'Consulta de Facturas',
          metaTitle: 'Consulta de Facturas - ESAL',
          metaDescription: 'Consulte el estado de sus facturas de servicios públicos de forma rápida y segura. Ingrese su número de cuenta o cédula.',
          isPublished: true,
          isActive: true
        }
      });
      console.log('✅ Página de consulta de facturas actualizada exitosamente');
    } else {
      // Crear nueva página
      await prisma.page.create({
        data: {
          name: 'Consulta de Facturas',
          title: 'Consulta de Facturas',
          slug: 'consulta-facturas',
          html: INVOICE_QUERY_HTML,
          css: INVOICE_QUERY_CSS,
          metaTitle: 'Consulta de Facturas - ESAL',
          metaDescription: 'Consulte el estado de sus facturas de servicios públicos de forma rápida y segura. Ingrese su número de cuenta o cédula.',
          isPublished: true,
          isActive: true
        }
      });
      console.log('✅ Página de consulta de facturas creada exitosamente');
    }

    console.log(`📄 HTML migrado: ${INVOICE_QUERY_HTML.length} caracteres`);
    console.log(`🎨 CSS migrado: ${INVOICE_QUERY_CSS.length} caracteres`);
    console.log('🌐 Página disponible en: /consulta-facturas');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la migración
migrateInvoiceQueryPage()
  .then(() => {
    console.log('🎉 Migración completada exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error en la migración:', error);
    process.exit(1);
  });