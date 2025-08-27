import Layout from '../components/Layout';
import { Phone, Mail, MapPin, Clock, MessageCircle, Send, User } from 'lucide-react';

export default function Contacto() {
  const contactInfo = [
    {
      icon: Phone,
      title: 'Teléfonos',
      details: [
        'Línea Principal: (57) 123-456-789',
        'Emergencias 24h: (57) 123-456-790',
        'WhatsApp: +57 300-123-4567'
      ]
    },
    {
      icon: Mail,
      title: 'Correos Electrónicos',
      details: [
        'Información: info@acueducto.gov.co',
        'Atención al Cliente: atencion@acueducto.gov.co',
        'Gerencia: gerencia@acueducto.gov.co'
      ]
    },
    {
      icon: MapPin,
      title: 'Dirección',
      details: [
        'Calle Principal #123',
        'Centro, Ciudad',
        'Código Postal: 123456'
      ]
    },
    {
      icon: Clock,
      title: 'Horarios de Atención',
      details: [
        'Lunes a Viernes: 8:00 AM - 5:00 PM',
        'Sábados: 8:00 AM - 12:00 PM',
        'Emergencias: 24 horas'
      ]
    }
  ];

  const offices = [
    {
      name: 'Oficina Principal',
      address: 'Calle Principal #123, Centro',
      phone: '(57) 123-456-789',
      hours: 'Lun - Vie: 8:00 AM - 5:00 PM'
    },
    {
      name: 'Punto de Atención Norte',
      address: 'Carrera 15 #45-67, Barrio Norte',
      phone: '(57) 123-456-791',
      hours: 'Lun - Vie: 8:00 AM - 4:00 PM'
    },
    {
      name: 'Punto de Atención Sur',
      address: 'Calle 20 #30-45, Barrio Sur',
      phone: '(57) 123-456-792',
      hours: 'Lun - Vie: 9:00 AM - 4:00 PM'
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">Contacto</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Estamos aquí para ayudarte. Contáctanos a través de cualquiera de nuestros canales 
            de atención y te brindaremos la mejor asistencia.
          </p>
        </div>
      </section>

      {/* Información de Contacto */}
      <section className="py-16 px-4 bg-white/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Información de Contacto
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => {
              const IconComponent = info.icon;
              return (
                <div
                  key={index}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 text-center"
                >
                  <div className="bg-gradient-to-r from-blue-500 to-green-500 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">{info.title}</h3>
                  <div className="space-y-1">
                    {info.details.map((detail, detailIndex) => (
                      <p key={detailIndex} className="text-gray-600 text-sm">{detail}</p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Formulario de Contacto */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Formulario */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-gray-200 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Envíanos un Mensaje
                </h2>
                
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre Completo
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Tu nombre completo"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Correo Electrónico
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="email"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="tu@email.com"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="(57) 123-456-789"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Solicitud
                    </label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                      <option>Selecciona una opción</option>
                      <option>Información General</option>
                      <option>Reclamo</option>
                      <option>Solicitud de Servicio</option>
                      <option>Reporte de Daño</option>
                      <option>Otro</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mensaje
                    </label>
                    <div className="relative">
                      <MessageCircle className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <textarea
                        rows={4}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                        placeholder="Describe tu consulta o solicitud..."
                      ></textarea>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-green-600 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                  >
                    <Send className="h-5 w-5" />
                    <span>Enviar Mensaje</span>
                  </button>
                </form>
              </div>

              {/* Mapa y Oficinas */}
              <div className="space-y-6">
                {/* Mapa */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Ubicación</h3>
                  <div className="bg-gray-200 rounded-lg h-48 flex items-center justify-center">
                    <p className="text-gray-600">Mapa Interactivo</p>
                  </div>
                </div>

                {/* Oficinas */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Nuestras Oficinas</h3>
                  <div className="space-y-4">
                    {offices.map((office, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4">
                        <h4 className="font-semibold text-gray-800">{office.name}</h4>
                        <p className="text-gray-600 text-sm">{office.address}</p>
                        <p className="text-gray-600 text-sm">{office.phone}</p>
                        <p className="text-gray-600 text-sm">{office.hours}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Emergencias */}
      <section className="py-16 px-4 bg-red-50">
        <div className="container mx-auto text-center">
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-100 border border-red-200 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-red-800 mb-4">
                ¿Tienes una Emergencia?
              </h2>
              <p className="text-red-700 mb-6">
                Para reportes de emergencias como fugas, daños en tuberías o falta de agua, 
                contáctanos inmediatamente a través de nuestra línea de emergencias.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="tel:+571234567890"
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Phone className="h-5 w-5" />
                  <span>(57) 123-456-790</span>
                </a>
                <a
                  href="https://wa.me/573001234567"
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}