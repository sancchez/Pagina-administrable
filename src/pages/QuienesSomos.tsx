import React, { useState } from 'react';
import Layout from '../components/Layout';
import EditorWithPalette from '../components/editor/EditorWithPalette';
import EditableTitle from '../components/editor/components/EditableTitle';
import { Users, Target, Eye, Award, History, MapPin } from 'lucide-react';

export default function QuienesSomos() {
  const [title, setTitle] = useState('Quiénes Somos');
  const [subtitle, setSubtitle] = useState('Somos una empresa de servicios públicos comprometida con brindar agua potable de calidad a toda la comunidad, con más de 30 años de experiencia y servicio.');
  const [isEditorMode, setIsEditorMode] = useState(true);

  if (isEditorMode) {
    return (
      <Layout>
        <div className="relative h-screen">
          {/* Botón para salir del modo editor */}
          <button
            onClick={() => setIsEditorMode(false)}
            className="absolute top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Salir del Editor
          </button>
          <EditorWithPalette />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Botón para entrar al modo editor */}
      <button
        onClick={() => setIsEditorMode(true)}
        className="fixed top-4 right-4 z-50 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
      >
        Modo Editor
      </button>
      
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <EditableTitle
            initialText={title}
            onTextChange={setTitle}
            className="text-5xl font-bold text-gray-800 mb-6"
            placeholder="Escribe el título de la página"
            level={1}
          />
          <EditableTitle
            initialText={subtitle}
            onTextChange={setSubtitle}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            placeholder="Escribe el subtítulo"
            level={2}
          />
        </div>
      </section>

      {/* Misión, Visión, Valores */}
      <section className="py-16 px-4 bg-white/50">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 hover:shadow-xl transition-all duration-300">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Misión</h3>
              <p className="text-gray-600 leading-relaxed">
                Garantizar el suministro de agua potable de calidad a toda la comunidad, 
                mediante la gestión eficiente de los recursos hídricos y la prestación de 
                un servicio confiable, sostenible y accesible.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 hover:shadow-xl transition-all duration-300">
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <Eye className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Visión</h3>
              <p className="text-gray-600 leading-relaxed">
                Ser reconocidos como la empresa líder en servicios de acueducto a nivel regional, 
                destacándonos por nuestra excelencia operativa, innovación tecnológica y 
                compromiso con el desarrollo sostenible.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 hover:shadow-xl transition-all duration-300">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Valores</h3>
              <ul className="text-gray-600 space-y-2">
                <li>• Transparencia y honestidad</li>
                <li>• Compromiso con la calidad</li>
                <li>• Responsabilidad ambiental</li>
                <li>• Servicio al cliente</li>
                <li>• Innovación continua</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Historia */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Nuestra Historia</h2>
            <p className="text-xl text-gray-600">Más de tres décadas sirviendo a la comunidad</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              <div className="flex items-start space-x-6">
                <div className="bg-gradient-to-r from-blue-500 to-green-500 p-3 rounded-full">
                  <History className="h-6 w-6 text-white" />
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">1990 - Fundación</h3>
                  <p className="text-gray-600">
                    Inicio de operaciones como empresa municipal de servicios públicos, 
                    con el objetivo de mejorar la calidad de vida de los habitantes.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-6">
                <div className="bg-gradient-to-r from-green-500 to-blue-500 p-3 rounded-full">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">2000 - Expansión</h3>
                  <p className="text-gray-600">
                    Ampliación de la cobertura del servicio a zonas rurales y 
                    modernización de la infraestructura existente.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-6">
                <div className="bg-gradient-to-r from-purple-500 to-green-500 p-3 rounded-full">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">2010 - Certificaciones</h3>
                  <p className="text-gray-600">
                    Obtención de certificaciones de calidad ISO 9001 y 
                    reconocimientos por excelencia en el servicio.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-6">
                <div className="bg-gradient-to-r from-emerald-500 to-blue-500 p-3 rounded-full">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">2020 - Presente</h3>
                  <p className="text-gray-600">
                    Implementación de tecnologías digitales, sistemas de monitoreo 
                    inteligente y programas de sostenibilidad ambiental.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      </EditorWithPalette>
    </Layout>
  );
}