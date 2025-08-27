import Layout from '../components/Layout';
import { CreditCard, FileText, Phone, MessageCircle, Clock, User, Search, Download } from 'lucide-react';

export default function PortalUsuario() {
  const services = [
    {
      icon: CreditCard,
      title: 'Pagar Factura',
      description: 'Realiza el pago de tu factura de forma rápida y segura',
      color: 'from-green-500 to-green-600',
      action: 'Pagar Ahora'
    },
    {
      icon: FileText,
      title: 'Consultar Factura',
      description: 'Consulta el estado de tu factura y historial de pagos',
      color: 'from-blue-500 to-blue-600',
      action: 'Consultar'
    },
    {
      icon: Search,
      title: 'Consultar Consumo',
      description: 'Revisa tu historial de consumo y estadísticas',
      color: 'from-purple-500 to-purple-600',
      action: 'Ver Consumo'
    },
    {
      icon: Download,
      title: 'Descargar Certificados',
      description: 'Obtén certificados de paz y salvo y otros documentos',
      color: 'from-indigo-500 to-indigo-600',
      action: 'Descargar'
    },
    {
      icon: User,
      title: 'Actualizar Datos',
      description: 'Mantén actualizada tu información personal',
      color: 'from-emerald-500 to-emerald-600',
      action: 'Actualizar'
    },
    {
      icon: MessageCircle,
      title: 'Solicitudes y Reclamos',
      description: 'Presenta solicitudes, quejas y reclamos',
      color: 'from-orange-500 to-orange-600',
      action: 'Crear Solicitud'
    }
  ];

  const paymentMethods = [
    {
      name: 'PSE',
      description: 'Pago seguro en línea',
      logo: '🏦'
    },
    {
      name: 'Tarjetas',
      description: 'Visa, Mastercard, Diners',
      logo: '💳'
    },
    {
      name: 'Efecty',
      description: 'Red de pagos nacional',
      logo: '🏪'
    },
    {
      name: 'Baloto',
      description: 'Puntos de pago',
      logo: '🎯'
    }
  ];

  const contactChannels = [
    {
      icon: Phone,
      title: 'Línea de Atención',
      info: '(57) 123-456-789',
      hours: 'Lun - Vie: 8:00 AM - 5:00 PM'
    },
    {
      icon: MessageCircle,
      title: 'Chat en Línea',
      info: 'Disponible 24/7',
      hours: 'Respuesta inmediata'
    },
    {
      icon: Clock,
      title: 'Oficina Principal',
      info: 'Calle Principal #123',
      hours: 'Lun - Vie: 8:00 AM - 4:00 PM'
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            Portal del <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">Usuario</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Accede a todos nuestros servicios en línea de forma fácil y segura. 
            Gestiona tu cuenta, realiza pagos y mantente informado.
          </p>
        </div>
      </section>

      {/* Servicios en Línea */}
      <section className="py-16 px-4 bg-white/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Servicios en Línea
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <div
                  key={index}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 group cursor-pointer"
                >
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${service.color} rounded-full mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{service.title}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  
                  <button className={`w-full bg-gradient-to-r ${service.color} text-white font-semibold py-2 px-4 rounded-lg hover:shadow-lg transition-all duration-200`}>
                    {service.action}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Métodos de Pago */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Métodos de Pago Disponibles
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {paymentMethods.map((method, index) => (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 text-center"
              >
                <div className="text-4xl mb-3">{method.logo}</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{method.name}</h3>
                <p className="text-gray-600 text-sm">{method.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Canales de Atención */}
      <section className="py-16 px-4 bg-white/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Canales de Atención
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {contactChannels.map((channel, index) => {
              const IconComponent = channel.icon;
              return (
                <div
                  key={index}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 text-center"
                >
                  <div className="bg-gradient-to-r from-blue-500 to-green-500 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{channel.title}</h3>
                  <p className="text-gray-700 font-medium mb-1">{channel.info}</p>
                  <p className="text-gray-600 text-sm">{channel.hours}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Formulario de Consulta Rápida */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-gray-200 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                Consulta Rápida de Factura
              </h2>
              
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Cuenta o Cédula
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Ingresa tu número de cuenta o cédula"
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-green-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Consultar Factura
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}