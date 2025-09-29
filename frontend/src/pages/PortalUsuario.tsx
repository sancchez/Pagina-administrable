import React, { useState } from 'react';
import Layout from '../components/Layout';
import { CreditCard, FileText, Phone, MessageCircle, Clock, User, Search, Download, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useLoadingState, LoadingButton } from '../components/common/LoadingState';

interface Invoice {
  id: string;
  accountNumber: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  period: string;
}

interface UserData {
  name: string;
  email: string;
  phone: string;
  address: string;
  accountNumber: string;
}

export default function PortalUsuario() {
  const [activeService, setActiveService] = useState<string | null>(null);
  const paymentLoading = useLoadingState();
  const invoiceLoading = useLoadingState();
  const consumptionLoading = useLoadingState();
  const requestLoading = useLoadingState();
  const profileLoading = useLoadingState();
  
  const [invoiceData, setInvoiceData] = useState<Invoice | null>(null);
  const [userData, setUserData] = useState<UserData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    accountNumber: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [consumptionData, setConsumptionData] = useState<unknown[]>([]);
  const [requestForm, setRequestForm] = useState({
    type: '',
    description: '',
    priority: 'medium'
  });
  // Funciones para manejar servicios
  const handlePayInvoice = async () => {
    if (!invoiceData) {
      toast.error('Primero debes consultar tu factura');
      return;
    }
    
    await paymentLoading.execute(async () => {
      // Simular pago
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Pago procesado exitosamente');
      setInvoiceData({ ...invoiceData, status: 'paid' });
    });
  };

  const handleInvoiceQuery = async () => {
    if (!searchQuery.trim()) {
      toast.error('Ingresa tu número de cuenta o cédula');
      return;
    }
    
    await invoiceLoading.execute(async () => {
      // Simular consulta de factura
      await new Promise(resolve => setTimeout(resolve, 1500));
      const mockInvoice: Invoice = {
        id: 'INV-2024-001',
        accountNumber: searchQuery,
        amount: 85000,
        dueDate: '2024-02-15',
        status: 'pending',
        period: 'Enero 2024'
      };
      setInvoiceData(mockInvoice);
      toast.success('Factura encontrada');
    });
  };

  const handleConsumptionQuery = async () => {
    await consumptionLoading.execute(async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockConsumption = [
        { month: 'Enero 2024', consumption: 15, cost: 85000 },
        { month: 'Diciembre 2023', consumption: 18, cost: 95000 },
        { month: 'Noviembre 2023', consumption: 12, cost: 75000 }
      ];
      setConsumptionData(mockConsumption);
      setActiveService('consumption');
      toast.success('Datos de consumo cargados');
    });
  };

  const handleUpdateUserData = async () => {
    if (!userData.name || !userData.email) {
      toast.error('Completa los campos obligatorios');
      return;
    }
    
    await profileLoading.execute(async () => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Datos actualizados correctamente');
      setActiveService(null);
    });
  };
    
  const handleCreateRequest = async () => {
    if (!requestForm.type || !requestForm.description) {
      toast.error('Completa todos los campos');
      return;
    }
    
    await requestLoading.execute(async () => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Solicitud creada exitosamente');
      setRequestForm({ type: '', description: '', priority: 'medium' });
      setActiveService(null);
    });
  };

  const handleDownloadCertificate = async () => {
    await profileLoading.execute(async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Certificado descargado exitosamente');
    });
  };

  const services = [
    {
      icon: CreditCard,
      title: 'Pagar Factura',
      description: 'Realiza el pago de tu factura de forma rápida y segura',
      color: 'from-green-500 to-green-600',
      action: 'Pagar Ahora',
      handler: handlePayInvoice,
      id: 'pay'
    },
    {
      icon: FileText,
      title: 'Consultar Factura',
      description: 'Consulta el estado de tu factura y historial de pagos',
      color: 'from-blue-500 to-blue-600',
      action: 'Consultar',
      handler: () => setActiveService('invoice'),
      id: 'invoice'
    },
    {
      icon: Search,
      title: 'Consultar Consumo',
      description: 'Revisa tu historial de consumo y estadísticas',
      color: 'from-purple-500 to-purple-600',
      action: 'Ver Consumo',
      handler: handleConsumptionQuery,
      id: 'consumption'
    },
    {
      icon: Download,
      title: 'Descargar Certificados',
      description: 'Obtén certificados de paz y salvo y otros documentos',
      color: 'from-indigo-500 to-indigo-600',
      action: 'Descargar',
      handler: handleDownloadCertificate,
      id: 'download'
    },
    {
      icon: User,
      title: 'Actualizar Datos',
      description: 'Mantén actualizada tu información personal',
      color: 'from-emerald-500 to-emerald-600',
      action: 'Actualizar',
      handler: () => setActiveService('profile'),
      id: 'profile'
    },
    {
      icon: MessageCircle,
      title: 'Solicitudes y Reclamos',
      description: 'Presenta solicitudes, quejas y reclamos',
      color: 'from-orange-500 to-orange-600',
      action: 'Crear Solicitud',
      handler: () => setActiveService('request'),
      id: 'request'
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
                  
                  <LoadingButton
                    onClick={service.handler}
                    loading={
                      (service.id === 'pay' && paymentLoading.loading) ||
                      (service.id === 'invoice' && invoiceLoading.loading) ||
                      (service.id === 'consumption' && consumptionLoading.loading) ||
                      (service.id === 'download' && profileLoading.loading) ||
                      (service.id === 'profile' && profileLoading.loading) ||
                      (service.id === 'request' && requestLoading.loading)
                    }
                    className={`w-full bg-gradient-to-r ${service.color} text-white font-semibold py-2 px-4 rounded-lg hover:shadow-lg transition-all duration-200`}
                  >
                    {service.action}
                  </LoadingButton>
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

      {/* Formularios Dinámicos */}
      {activeService && (
        <section className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl p-8 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {activeService === 'invoice' && 'Consultar Factura'}
                    {activeService === 'consumption' && 'Historial de Consumo'}
                    {activeService === 'profile' && 'Actualizar Datos Personales'}
                    {activeService === 'request' && 'Crear Solicitud o Reclamo'}
                  </h2>
                  <button
                    onClick={() => setActiveService(null)}
                    className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                  >
                    ×
                  </button>
                </div>

                {/* Formulario de Consulta de Factura */}
                {activeService === 'invoice' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número de Cuenta o Cédula
                      </label>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Ingresa tu número de cuenta o cédula"
                      />
                    </div>
                    
                    <LoadingButton
                      onClick={handleInvoiceQuery}
                      loading={invoiceLoading.loading}
                      className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-green-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Consultar Factura
                    </LoadingButton>

                    {/* Mostrar datos de factura */}
                    {invoiceData && (
                      <div className="mt-6 p-6 bg-gray-50 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          Información de Factura
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Número de Factura</p>
                            <p className="font-semibold">{invoiceData.id}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Período</p>
                            <p className="font-semibold">{invoiceData.period}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Valor a Pagar</p>
                            <p className="font-semibold text-lg">${invoiceData.amount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Fecha de Vencimiento</p>
                            <p className="font-semibold">{invoiceData.dueDate}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Estado</p>
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                              invoiceData.status === 'paid' ? 'bg-green-100 text-green-800' :
                              invoiceData.status === 'overdue' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {invoiceData.status === 'paid' ? 'Pagada' :
                               invoiceData.status === 'overdue' ? 'Vencida' : 'Pendiente'}
                            </span>
                          </div>
                        </div>
                        {invoiceData.status === 'pending' && (
                          <LoadingButton
                            onClick={handlePayInvoice}
                            loading={paymentLoading.loading}
                            className="mt-4 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                          >
                            Pagar Ahora
                          </LoadingButton>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Historial de Consumo */}
                {activeService === 'consumption' && consumptionData.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Historial de Consumo</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="border border-gray-300 px-4 py-2 text-left">Período</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Consumo (m³)</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Valor</th>
                          </tr>
                        </thead>
                        <tbody>
                          {consumptionData.map((item, index) => (
                            <tr key={index}>
                              <td className="border border-gray-300 px-4 py-2">{item.month}</td>
                              <td className="border border-gray-300 px-4 py-2">{item.consumption}</td>
                              <td className="border border-gray-300 px-4 py-2">${item.cost.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Formulario de Actualización de Datos */}
                {activeService === 'profile' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo *</label>
                        <input
                          type="text"
                          value={userData.name}
                          onChange={(e) => setUserData({...userData, name: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Tu nombre completo"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                        <input
                          type="email"
                          value={userData.email}
                          onChange={(e) => setUserData({...userData, email: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="tu@email.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                        <input
                          type="tel"
                          value={userData.phone}
                          onChange={(e) => setUserData({...userData, phone: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Tu número de teléfono"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Número de Cuenta</label>
                        <input
                          type="text"
                          value={userData.accountNumber}
                          onChange={(e) => setUserData({...userData, accountNumber: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Tu número de cuenta"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                      <textarea
                        value={userData.address}
                        onChange={(e) => setUserData({...userData, address: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                        placeholder="Tu dirección completa"
                      />
                    </div>
                    <LoadingButton
                      onClick={handleUpdateUserData}
                      loading={profileLoading.loading}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                      Actualizar Datos
                    </LoadingButton>
                  </div>
                )}

                {/* Formulario de Solicitudes y Reclamos */}
                {activeService === 'request' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Solicitud *</label>
                      <select
                        value={requestForm.type}
                        onChange={(e) => setRequestForm({...requestForm, type: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Selecciona el tipo</option>
                        <option value="queja">Queja</option>
                        <option value="reclamo">Reclamo</option>
                        <option value="solicitud">Solicitud</option>
                        <option value="sugerencia">Sugerencia</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Prioridad</label>
                      <select
                        value={requestForm.priority}
                        onChange={(e) => setRequestForm({...requestForm, priority: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="low">Baja</option>
                        <option value="medium">Media</option>
                        <option value="high">Alta</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Descripción *</label>
                      <textarea
                        value={requestForm.description}
                        onChange={(e) => setRequestForm({...requestForm, description: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={5}
                        placeholder="Describe detalladamente tu solicitud o reclamo"
                      />
                    </div>
                    <LoadingButton
                      onClick={handleCreateRequest}
                      loading={requestLoading.loading}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                      Enviar Solicitud
                    </LoadingButton>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Formulario de Consulta Rápida */}
      {!activeService && (
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-gray-200 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                  Consulta Rápida de Factura
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de Cuenta o Cédula
                    </label>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Ingresa tu número de cuenta o cédula"
                    />
                  </div>
                  
                  <LoadingButton
                    onClick={handleInvoiceQuery}
                    loading={invoiceLoading.loading}
                    className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-green-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Consultar Factura
                  </LoadingButton>
                </div>

                {/* Mostrar datos de factura en consulta rápida */}
                {invoiceData && (
                  <div className="mt-6 p-6 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Información de Factura
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Número de Factura</p>
                        <p className="font-semibold">{invoiceData.id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Valor a Pagar</p>
                        <p className="font-semibold text-lg">${invoiceData.amount.toLocaleString()}</p>
                      </div>
                    </div>
                    {invoiceData.status === 'pending' && (
                      <LoadingButton
                        onClick={handlePayInvoice}
                        loading={paymentLoading.loading}
                        className="mt-4 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                      >
                        Pagar Ahora
                      </LoadingButton>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}