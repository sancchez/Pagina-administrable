import React from 'react';
import { Users, Droplets, Clock, Award } from 'lucide-react';

interface EditableStatsCardsProps {
  className?: string;
}

export default function EditableStatsCards({ className = '' }: EditableStatsCardsProps) {
  return (
    <section 
      className={`py-16 bg-white ${className}`}
      data-editable-type="seccion-estadisticas"
      data-movable="true"
      data-background-editable="true"
    >
      <div className="container mx-auto px-4">
        {/* Título de la sección editable */}
        <div 
          className="text-center mb-12"
          data-editable-type="contenedor-titulo"
          data-movable="true"
        >
          <h2 
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            data-editable-type="titulo"
            data-movable="true"
            contentEditable
            suppressContentEditableWarning
          >
            Nuestros Números Hablan
          </h2>
          <p 
            className="text-xl text-gray-600 max-w-2xl mx-auto"
            data-editable-type="parrafo"
            data-movable="true"
            contentEditable
            suppressContentEditableWarning
          >
            Más de una década sirviendo a nuestra comunidad con excelencia y compromiso
          </p>
        </div>

        {/* Grid de estadísticas editables */}
        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          data-editable-type="grid-estadisticas"
          data-movable="true"
        >
          {/* Tarjeta 1 */}
          <div 
            className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            data-editable-type="tarjeta-estadistica"
            data-movable="true"
            data-resizable="true"
            data-background-editable="true"
          >
            <div 
              className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4"
              data-editable-type="icono-contenedor"
              data-movable="true"
              data-background-editable="true"
            >
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 
              className="text-3xl font-bold text-blue-600 mb-2"
              data-editable-type="numero"
              data-movable="true"
              contentEditable
              suppressContentEditableWarning
            >
              15,000+
            </h3>
            <p 
              className="text-gray-700 font-medium"
              data-editable-type="descripcion"
              data-movable="true"
              contentEditable
              suppressContentEditableWarning
            >
              Familias Atendidas
            </p>
          </div>

          {/* Tarjeta 2 */}
          <div 
            className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            data-editable-type="tarjeta-estadistica"
            data-movable="true"
            data-resizable="true"
            data-background-editable="true"
          >
            <div 
              className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4"
              data-editable-type="icono-contenedor"
              data-movable="true"
              data-background-editable="true"
            >
              <Droplets className="h-8 w-8 text-white" />
            </div>
            <h3 
              className="text-3xl font-bold text-green-600 mb-2"
              data-editable-type="numero"
              data-movable="true"
              contentEditable
              suppressContentEditableWarning
            >
              99.9%
            </h3>
            <p 
              className="text-gray-700 font-medium"
              data-editable-type="descripcion"
              data-movable="true"
              contentEditable
              suppressContentEditableWarning
            >
              Pureza del Agua
            </p>
          </div>

          {/* Tarjeta 3 */}
          <div 
            className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            data-editable-type="tarjeta-estadistica"
            data-movable="true"
            data-resizable="true"
            data-background-editable="true"
          >
            <div 
              className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4"
              data-editable-type="icono-contenedor"
              data-movable="true"
              data-background-editable="true"
            >
              <Clock className="h-8 w-8 text-white" />
            </div>
            <h3 
              className="text-3xl font-bold text-purple-600 mb-2"
              data-editable-type="numero"
              data-movable="true"
              contentEditable
              suppressContentEditableWarning
            >
              24/7
            </h3>
            <p 
              className="text-gray-700 font-medium"
              data-editable-type="descripcion"
              data-movable="true"
              contentEditable
              suppressContentEditableWarning
            >
              Servicio Continuo
            </p>
          </div>

          {/* Tarjeta 4 */}
          <div 
            className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            data-editable-type="tarjeta-estadistica"
            data-movable="true"
            data-resizable="true"
            data-background-editable="true"
          >
            <div 
              className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4"
              data-editable-type="icono-contenedor"
              data-movable="true"
              data-background-editable="true"
            >
              <Award className="h-8 w-8 text-white" />
            </div>
            <h3 
              className="text-3xl font-bold text-orange-600 mb-2"
              data-editable-type="numero"
              data-movable="true"
              contentEditable
              suppressContentEditableWarning
            >
              12+
            </h3>
            <p 
              className="text-gray-700 font-medium"
              data-editable-type="descripcion"
              data-movable="true"
              contentEditable
              suppressContentEditableWarning
            >
              Años de Experiencia
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}