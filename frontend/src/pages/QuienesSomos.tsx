import React from 'react';
import Layout from '../components/Layout';
import { Users, Target, Heart, Award, Calendar, MapPin, Shield, Globe, Lightbulb } from 'lucide-react';

export default function QuienesSomos() {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-6">Quiénes Somos</h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Conoce nuestra historia, misión y el equipo que trabaja incansablemente 
              para brindar servicios públicos de excelencia.
            </p>
            
            {/* Achievement Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-12">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">25+</div>
                <div className="text-blue-200">Años de Experiencia</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">50K+</div>
                <div className="text-blue-200">Usuarios Atendidos</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">15</div>
                <div className="text-blue-200">Municipios</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">99%</div>
                <div className="text-blue-200">Satisfacción</div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          <div className="space-y-16">

            {/* Misión, Visión, Valores */}
            <section className="bg-white rounded-2xl shadow-xl p-12">
              <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">Nuestra Esencia</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Misión */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-6 mx-auto">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Misión</h3>
                  <p className="text-gray-600 text-center leading-relaxed">
                    Brindar servicios públicos de agua potable y saneamiento básico con los más altos 
                    estándares de calidad, contribuyendo al bienestar y desarrollo sostenible de nuestras 
                    comunidades.
                  </p>
                </div>

                {/* Visión */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-8 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-6 mx-auto">
                    <Globe className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Visión</h3>
                  <p className="text-gray-600 text-center leading-relaxed">
                    Ser reconocidos como la empresa líder en servicios públicos de la región, 
                    caracterizada por la innovación, sostenibilidad y excelencia en el servicio al cliente.
                  </p>
                </div>

                {/* Valores */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-8 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full mb-6 mx-auto">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Valores</h3>
                  <ul className="text-gray-600 space-y-3">
                    <li className="flex items-center">
                      <Shield className="w-4 h-4 text-purple-600 mr-3" />
                      Compromiso
                    </li>
                    <li className="flex items-center">
                      <Lightbulb className="w-4 h-4 text-purple-600 mr-3" />
                      Transparencia
                    </li>
                    <li className="flex items-center">
                      <Award className="w-4 h-4 text-purple-600 mr-3" />
                      Innovación
                    </li>
                    <li className="flex items-center">
                      <Globe className="w-4 h-4 text-purple-600 mr-3" />
                      Sostenibilidad
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Historia */}
            <section className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-12">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">Nuestra Historia</h2>
                
                <div className="space-y-8">
                  <div className="flex items-start space-x-6 bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-full flex-shrink-0">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">1990 - Fundación</h3>
                      <p className="text-gray-600">
                        Iniciamos operaciones como una pequeña empresa local con el objetivo de 
                        mejorar el acceso al agua potable en la región.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-6 bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-center w-12 h-12 bg-green-600 rounded-full flex-shrink-0">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">2000 - Expansión</h3>
                      <p className="text-gray-600">
                        Ampliamos nuestros servicios a múltiples municipios, consolidándonos 
                        como un referente regional en servicios públicos.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-6 bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-center w-12 h-12 bg-purple-600 rounded-full flex-shrink-0">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">2010 - Modernización</h3>
                      <p className="text-gray-600">
                        Implementamos tecnologías avanzadas y sistemas de gestión modernos 
                        para mejorar la eficiencia y calidad del servicio.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-6 bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-full flex-shrink-0">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">2020 - Presente</h3>
                      <p className="text-gray-600">
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
    </Layout>
  );
}