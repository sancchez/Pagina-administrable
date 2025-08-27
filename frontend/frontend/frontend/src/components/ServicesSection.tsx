import { Droplets, FileText, Headphones, Wrench, BarChart3, Shield } from 'lucide-react';

export default function ServicesSection() {
  const services = [
    {
      icon: Droplets,
      title: 'Suministro de Agua Potable',
      description: 'Agua de calidad certificada las 24 horas del día, cumpliendo con todos los estándares de salud.',
      features: ['Calidad garantizada', 'Disponibilidad 24/7', 'Presión constante']
    },
    {
      icon: FileText,
      title: 'Facturación Transparente',
      description: 'Sistema de facturación claro y transparente con múltiples opciones de pago.',
      features: ['Facturación digital', 'Pagos en línea', 'Historial detallado']
    },
    {
      icon: Headphones,
      title: 'Atención al Cliente',
      description: 'Servicio de atención personalizada para resolver todas tus consultas y solicitudes.',
      features: ['Soporte 24/7', 'Múltiples canales', 'Respuesta rápida']
    },
    {
      icon: Wrench,
      title: 'Mantenimiento Preventivo',
      description: 'Mantenimiento regular de la infraestructura para garantizar un servicio óptimo.',
      features: ['Inspecciones regulares', 'Reparaciones rápidas', 'Modernización continua']
    },
    {
      icon: BarChart3,
      title: 'Monitoreo de Calidad',
      description: 'Control constante de la calidad del agua mediante análisis físico-químicos y bacteriológicos.',
      features: ['Análisis diarios', 'Certificaciones', 'Reportes públicos']
    },
    {
      icon: Shield,
      title: 'Seguridad Hídrica',
      description: 'Protección de fuentes hídricas y sistemas de distribución para garantizar la continuidad.',
      features: ['Protección de fuentes', 'Sistemas redundantes', 'Plan de contingencia']
    }
  ];

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-blue-600 to-green-600">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Nuestros Servicios
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Ofrecemos una gama completa de servicios para garantizar el acceso a agua potable de calidad
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <div
                key={index}
                className="bg-white/90 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
              >
                <div className="flex items-center mb-4">
                  <div className="bg-gradient-to-r from-blue-600 to-green-600 p-3 rounded-full mr-4 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {service.title}
                  </h3>
                </div>
                
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {service.description}
                </p>
                
                <ul className="space-y-2">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm text-gray-700">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-green-600 rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}