import React from 'react';
import { Wrench, Phone, FileText, CreditCard, MapPin, Clock } from 'lucide-react';

const ServicesSection = () => {
  const services = [
    {
      icon: Wrench,
      title: "Mantenimiento y Reparaciones",
      description: "Servicio técnico especializado para garantizar el funcionamiento óptimo de la red de distribución",
      features: ["Reparación de fugas", "Mantenimiento preventivo", "Instalaciones nuevas"],
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Phone,
      title: "Atención al Cliente",
      description: "Soporte personalizado para resolver todas tus consultas y solicitudes de manera eficiente",
      features: ["Línea de atención 24/7", "Chat en línea", "Visitas domiciliarias"],
      color: "from-green-500 to-green-600"
    },
    {
      icon: FileText,
      title: "Facturación Transparente",
      description: "Sistema de facturación claro y detallado con múltiples opciones de consulta y pago",
      features: ["Facturación digital", "Historial de consumo", "Alertas de vencimiento"],
      color: "from-blue-600 to-green-500"
    },
    {
      icon: CreditCard,
      title: "Métodos de Pago",
      description: "Diversas opciones de pago para tu comodidad y facilidad en el cumplimiento de tus obligaciones",
      features: ["Pago en línea", "Débito automático", "Puntos de pago físicos"],
      color: "from-green-600 to-blue-500"
    },
    {
      icon: MapPin,
      title: "Cobertura Territorial",
      description: "Amplia cobertura en todo el municipio con planes de expansión continua",
      features: ["98% de cobertura", "Expansión rural", "Nuevos desarrollos"],
      color: "from-blue-500 to-green-600"
    },
    {
      icon: Clock,
      title: "Monitoreo Continuo",
      description: "Supervisión constante de la calidad del agua y el funcionamiento del sistema",
      features: ["Control de calidad", "Monitoreo de presión", "Alertas tempranas"],
      color: "from-green-500 to-blue-600"
    }
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-white to-gray-50">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            Nuestros
            <span className="block bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Servicios
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ofrecemos una gama completa de servicios diseñados para garantizar 
            el acceso continuo y confiable al agua potable
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <div
                key={index}
                className="group bg-white rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 hover:border-blue-200"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${service.color} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <IconComponent className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-blue-700 transition-colors">
                  {service.title}
                </h3>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {service.description}
                </p>
                
                <ul className="space-y-2">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mr-3 flex-shrink-0"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <button className="group/btn text-blue-600 font-semibold hover:text-blue-700 transition-colors flex items-center">
                    Más información
                    <svg className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-3xl p-12 text-white">
            <h3 className="text-3xl md:text-4xl font-bold mb-6">
              ¿Necesitas más información?
            </h3>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-blue-100">
              Nuestro equipo está listo para atenderte y resolver todas tus consultas
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-700 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-lg">
                Contactar Ahora
              </button>
              <button className="bg-transparent border-2 border-white/50 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 hover:border-white transition-all duration-300 backdrop-blur-sm">
                Ver Portal de Usuario
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;