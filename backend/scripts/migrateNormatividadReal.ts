import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const NORMATIVIDAD_HTML = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Normatividad - Empresa de Servicios Públicos</title>
</head>
<body>
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
            
            <div class="space-y-4 max-w-6xl mx-auto">
                <!-- Ley 142 de 1994 -->
                <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
                    <div class="flex flex-col md:flex-row md:items-center justify-between">
                        <div class="flex-1">
                            <div class="flex items-center space-x-3 mb-2">
                                <svg class="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
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
                                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                </svg>
                                <span>Ver</span>
                            </button>
                            <button class="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
                                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                                <span>Descargar</span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Decreto 1077 de 2015 -->
                <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
                    <div class="flex flex-col md:flex-row md:items-center justify-between">
                        <div class="flex-1">
                            <div class="flex items-center space-x-3 mb-2">
                                <svg class="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
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
                                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                </svg>
                                <span>Ver</span>
                            </button>
                            <button class="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
                                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                                <span>Descargar</span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Resolución CRA 287 de 2004 -->
                <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
                    <div class="flex flex-col md:flex-row md:items-center justify-between">
                        <div class="flex-1">
                            <div class="flex items-center space-x-3 mb-2">
                                <svg class="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
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
                                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                </svg>
                                <span>Ver</span>
                            </button>
                            <button class="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
                                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                                <span>Descargar</span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Decreto 2811 de 1974 -->
                <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
                    <div class="flex flex-col md:flex-row md:items-center justify-between">
                        <div class="flex-1">
                            <div class="flex items-center space-x-3 mb-2">
                                <svg class="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                                <h3 class="text-xl font-semibold text-gray-800">Decreto 2811 de 1974</h3>
                                <span class="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                    Decreto Nacional
                                </span>
                            </div>
                            <p class="text-gray-600 mb-2">Código Nacional de Recursos Naturales Renovables</p>
                            <div class="flex items-center space-x-4 text-sm text-gray-500">
                                <span>Fecha: 18/12/1974</span>
                                <span class="text-green-600 font-medium">• Vigente</span>
                            </div>
                        </div>
                        
                        <div class="flex space-x-2 mt-4 md:mt-0">
                            <button class="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                </svg>
                                <span>Ver</span>
                            </button>
                            <button class="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
                                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                                <span>Descargar</span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Resolución 2115 de 2007 -->
                <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
                    <div class="flex flex-col md:flex-row md:items-center justify-between">
                        <div class="flex-1">
                            <div class="flex items-center space-x-3 mb-2">
                                <svg class="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
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
                                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                </svg>
                                <span>Ver</span>
                            </button>
                            <button class="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
                                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                                <span>Descargar</span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Ley 1176 de 2007 -->
                <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
                    <div class="flex flex-col md:flex-row md:items-center justify-between">
                        <div class="flex-1">
                            <div class="flex items-center space-x-3 mb-2">
                                <svg class="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                                <h3 class="text-xl font-semibold text-gray-800">Ley 1176 de 2007</h3>
                                <span class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                    Ley Nacional
                                </span>
                            </div>
                            <p class="text-gray-600 mb-2">Desarrollo del artículo 356 de la Constitución Política</p>
                            <div class="flex items-center space-x-4 text-sm text-gray-500">
                                <span>Fecha: 27/12/2007</span>
                                <span class="text-green-600 font-medium">• Vigente</span>
                            </div>
                        </div>
                        
                        <div class="flex space-x-2 mt-4 md:mt-0">
                            <button class="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                </svg>
                                <span>Ver</span>
                            </button>
                            <button class="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
                                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                                <span>Descargar</span>
                            </button>
                        </div>
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
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <!-- Reglamento de Usuarios -->
                <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 group">
                    <div class="flex items-center space-x-4 mb-4">
                        <div class="bg-gradient-to-r from-blue-500 to-green-500 p-3 rounded-full group-hover:scale-110 transition-transform duration-300">
                            <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                            </svg>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-800">Reglamento de Usuarios</h3>
                    </div>
                    
                    <p class="text-gray-600 mb-4">Normas y condiciones para la prestación del servicio</p>
                    
                    <div class="flex space-x-2">
                        <button class="flex items-center space-x-2 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm">
                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                            <span>Ver</span>
                        </button>
                        <button class="flex items-center space-x-2 bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm">
                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            <span>PDF</span>
                        </button>
                    </div>
                </div>

                <!-- Política de Calidad -->
                <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 group">
                    <div class="flex items-center space-x-4 mb-4">
                        <div class="bg-gradient-to-r from-blue-500 to-green-500 p-3 rounded-full group-hover:scale-110 transition-transform duration-300">
                            <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                            </svg>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-800">Política de Calidad</h3>
                    </div>
                    
                    <p class="text-gray-600 mb-4">Compromiso con la excelencia en el servicio</p>
                    
                    <div class="flex space-x-2">
                        <button class="flex items-center space-x-2 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm">
                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                            <span>Ver</span>
                        </button>
                        <button class="flex items-center space-x-2 bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm">
                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            <span>PDF</span>
                        </button>
                    </div>
                </div>

                <!-- Manual de Procedimientos -->
                <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 group">
                    <div class="flex items-center space-x-4 mb-4">
                        <div class="bg-gradient-to-r from-blue-500 to-green-500 p-3 rounded-full group-hover:scale-110 transition-transform duration-300">
                            <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-800">Manual de Procedimientos</h3>
                    </div>
                    
                    <p class="text-gray-600 mb-4">Procesos operativos y administrativos</p>
                    
                    <div class="flex space-x-2">
                        <button class="flex items-center space-x-2 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm">
                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                            <span>Ver</span>
                        </button>
                        <button class="flex items-center space-x-2 bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm">
                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            <span>PDF</span>
                        </button>
                    </div>
                </div>

                <!-- Código de Ética -->
                <div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 group">
                    <div class="flex items-center space-x-4 mb-4">
                        <div class="bg-gradient-to-r from-blue-500 to-green-500 p-3 rounded-full group-hover:scale-110 transition-transform duration-300">
                            <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16l3-1m-3 1l-3-1"></path>
                            </svg>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-800">Código de Ética</h3>
                    </div>
                    
                    <p class="text-gray-600 mb-4">Principios y valores corporativos</p>
                    
                    <div class="flex space-x-2">
                        <button class="flex items-center space-x-2 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm">
                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                            <span>Ver</span>
                        </button>
                        <button class="flex items-center space-x-2 bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm">
                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            <span>PDF</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Entidades Reguladoras -->
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
                                <svg class="h-5 w-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16l3-1m-3 1l-3-1"></path>
                                </svg>
                                Entidades de Regulación
                            </h3>
                            <ul class="space-y-3 text-gray-600">
                                <li class="flex items-start space-x-2">
                                    <div class="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                    <div>
                                        <strong>CRA</strong> - Comisión de Regulación de Agua Potable y Saneamiento Básico
                                    </div>
                                </li>
                                <li class="flex items-start space-x-2">
                                    <div class="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                    <div>
                                        <strong>MinVivienda</strong> - Ministerio de Vivienda, Ciudad y Territorio
                                    </div>
                                </li>
                                <li class="flex items-start space-x-2">
                                    <div class="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                    <div>
                                        <strong>MinSalud</strong> - Ministerio de Salud y Protección Social
                                    </div>
                                </li>
                            </ul>
                        </div>
                        
                        <div>
                            <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                <svg class="h-5 w-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                                </svg>
                                Entidades de Control
                            </h3>
                            <ul class="space-y-3 text-gray-600">
                                <li class="flex items-start space-x-2">
                                    <div class="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                    <div>
                                        <strong>SSPD</strong> - Superintendencia de Servicios Públicos Domiciliarios
                                    </div>
                                </li>
                                <li class="flex items-start space-x-2">
                                    <div class="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                    <div>
                                        <strong>Contraloría</strong> - Control fiscal y financiero
                                    </div>
                                </li>
                                <li class="flex items-start space-x-2">
                                    <div class="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                    <div>
                                        <strong>Procuraduría</strong> - Control disciplinario
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</body>
</html>`;

const NORMATIVIDAD_CSS = `
/* Estilos específicos para la página de Normatividad */
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

.hover\\:shadow-lg:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.hover\\:shadow-xl:hover {
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.transition-colors {
    transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
}

.hover\\:bg-blue-600:hover {
    background-color: #2563eb;
}

.hover\\:bg-green-600:hover {
    background-color: #16a34a;
}

.from-blue-500 {
    --tw-gradient-from: #3b82f6;
    --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(59, 130, 246, 0));
}

.to-green-500 {
    --tw-gradient-to: #22c55e;
}

.group-hover\\:scale-110:hover {
    transform: scale(1.1);
}

.transition-transform {
    transition-property: transform;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
}
`;

async function migrateNormatividadPage() {
  try {
    console.log('🚀 Iniciando migración de la página de Normatividad...');

    // Verificar si la página ya existe
    const existingPage = await prisma.page.findUnique({
      where: { slug: 'normatividad' }
    });

    if (existingPage) {
      console.log('📝 Actualizando página existente...');
      await prisma.page.update({
        where: { slug: 'normatividad' },
        data: {
          title: 'Normatividad',
          html: NORMATIVIDAD_HTML,
          css: NORMATIVIDAD_CSS,
          isPublished: true,
          updatedAt: new Date()
        }
      });
    } else {
      console.log('✨ Creando nueva página...');
      await prisma.page.create({
        data: {
          name: 'Página de Normatividad',
          slug: 'normatividad',
          title: 'Normatividad',
          html: NORMATIVIDAD_HTML,
          css: NORMATIVIDAD_CSS,
          isPublished: true
        }
      });
    }

    console.log('✅ Migración de la página de Normatividad completada exitosamente');
    console.log('📊 Contenido migrado:');
    console.log(`   - HTML: ${NORMATIVIDAD_HTML.length} caracteres`);
    console.log(`   - CSS: ${NORMATIVIDAD_CSS.length} caracteres`);
    console.log('🔗 La página está disponible en: /normatividad');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    console.log('🎉 Proceso de migración finalizado');
  }
}

// Ejecutar la migración
migrateNormatividadPage();