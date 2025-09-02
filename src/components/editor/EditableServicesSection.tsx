import React from 'react';
import { Droplets, Wrench, Phone, FileText, CreditCard, Users } from 'lucide-react';

interface EditableServicesSectionProps {
  className?: string;
}

export default function EditableServicesSection({ className = '' }: EditableServicesSectionProps) {
  return (
    <section 
      className={`py-20 bg-gradient-to-br from-gray-50 to-blue-50 ${className}`}
      data-editable-type="seccion-servicios"
      data-movable="true"
      data-background-editable="true"
    >
      <div className="container mx-auto px-4">
        {/* Encabezado de la sección */}
        <div 
          className="text-center mb-16"
          data-editable-type="encabezado-servicios"
          data-movable="true"
        >
          <h2 
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
            data-editable-type="titulo"
            data-movable="true"
            contentEditable
            suppressContentEditableWarning
          >
            Nuestros Servicios
          </h2>
          <p 
            className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            data-editable-type="parrafo"
            data-movable="true"
            contentEditable
            suppressContentEditableWarning
          >
            Ofrecemos una gama completa de servicios de acueducto diseñados para satisfacer 
            todas las necesidades de nuestra comunidad con la más alta calidad.
          </p>
        </div>

        {/* Grid de servicios */}
        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
          data-editable-type="grid-servicios"
          data-movable="true"
        >
          {/* Servicio 1 */}
          <div 
            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200"
            data-editable-type="tarjeta-servicio"
            data-movable="true"
            data-resizable="true"
            data-background-editable="true"
          >
            <div 
              className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6"
              data-editable-type="icono-servicio"
              data-movable="true"
              data-background-editable="true"
            >
              <Droplets className="h-8 w-8 text-white" />
            </div>
            <h3 
              className="text-2xl font-bold text-gray-900 mb-4"
              data-editable-type="titulo-servicio"
              data-movable="true"
              contentEditable
              suppressContentEditableWarning
            >
              Suministro de Agua Potable
            </h3>
            <p 
              className="text-gray-600 leading-relaxed"
              data-editable-type="descripcion-servicio"
              data-movable="true"
              contentEditable
              suppressContentEditableWarning
            >
              Agua potable de la más alta calidad, tratada y purificada según los estándares 
              internacionales, disponible las 24 horas del día.
            </p>
          </div>

          {/* Servicio 2 */}
          <div 
            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-green-200"
            data-editable-type="tarjeta-servicio"
            data-movable="true"
            data-resizable="true"
            data-background-editable="true"
          >
            <div 
              className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6"
              data-editable-type="icono-servicio"
              data-movable="true"
              data-background-editable="true"
            >
              <Wrench className="h-8 w-8 text-white" />
            </div>
            <h3 
              className="text-2xl font-bold text-gray-900 mb-4"
              data-editable-type="titulo-servicio"
              data-movable="true"
              contentEditable
              suppressContentEditableWarning
            >
              Mantenimiento y Reparaciones
            </h3>
            <p 
              className="text-gray-600 leading-relaxed"
              data-editable-type="descripcion-servicio"
              data-movable="true"
              contentEditable
              suppressContentEditableWarning
            >
              Servicio técnico especializado para mantenimiento preventivo y correctivo 
              de redes de distribución y conexiones domiciliarias.
            </p>
          </div>

          {/* Servicio 3 */}
          <div 
            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-purple-200"
            data-editable-type="tarjeta-servicio"
            data-movable="true"
            data-resizable="true"
            data-background-editable="true"
          >
            <div 
              className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6"
              data-editable-type="icono-servicio"
              data-movable="true"
              data-background-editable="true"
            >
              <Phone className="h-8 w-8 text-white" />
            </div>
            <h3 
              className="text-2xl font-bold text-gray-900 mb-4"
              data-editable-type="titulo-servicio"
              data-movable="true"
              contentEditable
              suppressContentEditableWarning
            >
              Atención al Cliente 24/7
            </h3>
            <p 
              className="text-gray-600 leading-relaxed"
              data-editable-type="descripcion-servicio"
              data-movable="true"
              contentEditable
              suppressContentEditableWarning
            >
              Línea de atención permanente para reportes, consultas y emergencias. 
              Nuestro equipo está siempre disponible para ayudarte.
            </p>
          </div>

          {/* Servicio 4 */}
          <div 
            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-orange-200"
            data-editable-type="tarjeta-servicio"
            data-movable="true"
            data-resizable="true"
            data-background-editable="true"
          >
            <div 
              className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-6"
              data-editable-type="icono-servicio"
              data-movable="true"
              data-background-editable="true"
            >
              <FileText className="h-8 w-8 text-white" />
            </div>
            <h3 
              className="text-2xl font-bold text-gray-900 mb-4"
              data-editable-type="titulo-servicio"
              data-movable="true"
              contentEditable
              suppressContentEditableWarning
            >
              Facturación Transparente
            </h3>
            <p 
              className="text-gray-600 leading-relaxed"
              data-editable-type="descripcion-servicio"
              data-movable="true"
              contentEditable
              suppressContentEditableWarning
            >
              Sistema de facturación claro y detallado con múltiples opciones de pago 
              y consulta en línea de tu historial de consumo.
            </p>
          </div>

          {/* Servicio 5 */}
          <div 
            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-red-200"
            data-editable-type="tarjeta-servicio"
            data-movable="true"
            data-resizable="true"
            data-background-editable="true"
          >
            <div 
              className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-6"
              data-editable-type="icono-servicio"
              data-movable="true"
              data-background-editable="true"
            >
              <CreditCard className="h-8 w-8 text-white" />
            </div>
            <h3 
              className="text-2xl font-bold text-gray-900 mb-4"
              data-editable-type="titulo-servicio"
              data-movable="true"
              contentEditable
              suppressContentEditableWarning
            >
              Pagos en Línea
            </h3>
            <p 
              className="text-gray-600 leading-relaxed"
              data-editable-type="descripcion-servicio"
              data-movable="true"
              contentEditable
              suppressContentEditableWarning
            >
              Plataforma segura para realizar pagos en línea, consultar facturas 
              y gestionar tu cuenta desde la comodidad de tu hogar.
            </p>
          </div>

          {/* Servicio 6 */}
          <div 
            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-teal-200"
            data-editable-type="tarjeta-servicio"
            data-movable="true"
            data-resizable="true"
            data-background-editable="true"
          >
            <div 
              className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center mb-6"
              data-editable-type="icono-servicio"
              data-movable="true"
              data-background-editable="true"
            >
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 
              className="text-2xl font-bold text-gray-900 mb-4"
              data-editable-type="titulo-servicio"
              data-movable="true"
              contentEditable
              suppressContentEditableWarning
            >
              Programas Comunitarios
            </h3>
            <p 
              className="text-gray-600 leading-relaxed"
              data-editable-type="descripcion-servicio"
              data-movable="true"
              contentEditable
              suppressContentEditableWarning
            >
              Iniciativas de educación ambiental y uso responsable del agua, 
              fortaleciendo el compromiso con nuestra comunidad.
            </p>
          </div>
        </div>

        {/* Llamada a la acción */}
        <div 
          className="text-center"
          data-editable-type="cta-servicios"
          data-movable="true"
        >
          <h3 
            className="text-2xl font-bold text-gray-900 mb-4"
            data-editable-type="titulo-cta"
            data-movable="true"
            contentEditable
            suppressContentEditableWarning
          >
            ¿Necesitas más información?
          </h3>
          <p 
            className="text-gray-600 mb-8 max-w-2xl mx-auto"
            data-editable-type="descripcion-cta"
            data-movable="true"
            contentEditable
            suppressContentEditableWarning
          >
            Nuestro equipo de atención al cliente está listo para resolver todas tus dudas 
            y brindarte el mejor servicio.
          </p>
          <button 
            className="bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold px-8 py-4 rounded-full hover:from-blue-700 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            data-editable-type="boton-cta"
            data-movable="true"
            data-resizable="true"
          >
            <span 
              contentEditable
              suppressContentEditableWarning
              data-editable-type="texto-boton"
            >
              Contáctanos Ahora
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}