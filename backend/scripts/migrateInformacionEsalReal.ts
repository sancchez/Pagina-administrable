import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const INFORMACION_ESAL_HTML = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Información ESAL - Empresa de Servicios Públicos</title>
</head>
<body>
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
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0l-2 9a2 2 0 002 2h8a2 2 0 002-2l-2-9m-6 0V7"></path>
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
                                    15/1/2024
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
                                    30/3/2024
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
                                            Informe de Gestión 2023
                                        </h3>
                                        <p class="text-sm text-gray-500">PDF • 3.2 MB</p>
                                    </div>
                                </div>
                                <span class="text-xs text-gray-500 bg-blue-100 px-3 py-1 rounded-full">
                                    28/2/2024
                                </span>
                            </div>
                            
                            <p class="text-gray-600 mb-6">Reporte anual de actividades y logros</p>
                            
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
                                            Plan Estratégico 2024-2028
                                        </h3>
                                        <p class="text-sm text-gray-500">PDF • 4.1 MB</p>
                                    </div>
                                </div>
                                <span class="text-xs text-gray-500 bg-blue-100 px-3 py-1 rounded-full">
                                    10/1/2024
                                </span>
                            </div>
                            
                            <p class="text-gray-600 mb-6">Planificación estratégica quinquenal</p>
                            
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
</body>
</html>`;

const INFORMACION_ESAL_CSS = `
/* Estilos específicos para la página de Información ESAL */
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
}

.bg-gradient-to-br {
    background: linear-gradient(to bottom right, var(--tw-gradient-stops));
}

.from-blue-50 {
    --tw-gradient-from: #eff6ff;
    --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(239, 246, 255, 0));
}

.to-indigo-100 {
    --tw-gradient-to: #e0e7ff;
}

.bg-gradient-to-r {
    background: linear-gradient(to right, var(--tw-gradient-stops));
}

.from-blue-600 {
    --tw-gradient-from: #2563eb;
    --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(37, 99, 235, 0));
}

.to-indigo-700 {
    --tw-gradient-to: #3730a3;
}

.text-green-300 {
    color: #86efac;
}

.transition-all {
    transition-property: all;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
}

.duration-300 {
    transition-duration: 300ms;
}

.hover\\:shadow-lg:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.hover\\:shadow-xl:hover {
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.group:hover .group-hover\\:text-blue-600 {
    color: #2563eb;
}

.transition-colors {
    transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
}

.hover\\:from-blue-700:hover {
    --tw-gradient-from: #1d4ed8;
}

.hover\\:to-indigo-700:hover {
    --tw-gradient-to: #3730a3;
}

.hover\\:from-green-700:hover {
    --tw-gradient-from: #15803d;
}

.hover\\:to-emerald-700:hover {
    --tw-gradient-to: #047857;
}

.duration-200 {
    transition-duration: 200ms;
}
`;

async function migrateInformacionEsalPage() {
  try {
    console.log('🚀 Iniciando migración de la página de Información ESAL...');

    // Verificar si la página ya existe
    const existingPage = await prisma.page.findUnique({
      where: { slug: 'informacion-esal' }
    });

    if (existingPage) {
      console.log('📝 Actualizando página existente...');
      await prisma.page.update({
        where: { slug: 'informacion-esal' },
        data: {
          title: 'Información ESAL',
          html: INFORMACION_ESAL_HTML,
          css: INFORMACION_ESAL_CSS,
          isPublished: true,
          updatedAt: new Date()
        }
      });
    } else {
      console.log('✨ Creando nueva página...');
      await prisma.page.create({
        data: {
          name: 'Información ESAL',
          slug: 'informacion-esal',
          title: 'Información ESAL',
          html: INFORMACION_ESAL_HTML,
          css: INFORMACION_ESAL_CSS,
          isPublished: true
        }
      });
    }

    console.log('✅ Migración de la página de Información ESAL completada exitosamente');
    console.log('📊 Contenido migrado:');
    console.log(`   - HTML: ${INFORMACION_ESAL_HTML.length} caracteres`);
    console.log(`   - CSS: ${INFORMACION_ESAL_CSS.length} caracteres`);
    console.log('🔗 La página está disponible en: /informacion-esal');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    console.log('🎉 Proceso de migración finalizado');
  }
}

// Ejecutar la migración
migrateInformacionEsalPage();