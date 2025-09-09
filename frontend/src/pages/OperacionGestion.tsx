import Layout from '../components/Layout';
import { Settings, BarChart3, Wrench, Shield, Zap, Droplets } from 'lucide-react';

export default function OperacionGestion() {
  const operationalAreas = [
    {
      icon: Droplets,
      title: 'Captación y Tratamiento',
      description: 'Procesos de captación de agua cruda y tratamiento para garantizar la calidad.',
      details: [
        'Captación de fuentes superficiales y subterráneas',
        'Planta de tratamiento con tecnología avanzada',
        'Control de calidad en tiempo real',
        'Laboratorio certificado para análisis'
      ]
    },
    {
      icon: Settings,
      title: 'Distribución',
      description: 'Red de distribución que lleva el agua tratada hasta cada usuario.',
      details: [
        'Red de tuberías de 150 km de extensión',
        'Estaciones de bombeo automatizadas',
        'Tanques de almacenamiento estratégicos',
        'Sistema de telemetría y control'
      ]
    },
    {
      icon: Wrench,
      title: 'Mantenimiento',
      description: 'Programas de mantenimiento preventivo y correctivo de la infraestructura.',
      details: [
        'Mantenimiento preventivo programado',
        'Respuesta rápida a emergencias',
        'Renovación de redes obsoletas',
        'Calibración de equipos de medición'
      ]
    },
    {
      icon: BarChart3,
      title: 'Monitoreo y Control',
      description: 'Sistemas de monitoreo continuo para garantizar la calidad del servicio.',
      details: [
        'Centro de control 24/7',
        'Sensores de presión y caudal',
        'Alertas automáticas de anomalías',
        'Reportes en tiempo real'
      ]
    }
  ];

  const kpis = [
    {
      title: 'Cobertura del Servicio',
      value: '98.5%',
      description: 'Población con acceso al servicio',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Continuidad',
      value: '23.8 hrs/día',
      description: 'Promedio de horas de servicio',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Calidad del Agua',
      value: '99.9%',
      description: 'Cumplimiento normativo',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Eficiencia Comercial',
      value: '94.2%',
      description: 'Índice de recaudo',
      color: 'from-emerald-500 to-emerald-600'
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            Operación y <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">Gestión</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Conoce cómo operamos y gestionamos nuestros procesos para garantizar 
            un servicio de agua potable eficiente, confiable y de calidad.
          </p>
        </div>
      </section>

      {/* KPIs */}
      <section className="py-16 px-4 bg-white/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Indicadores de Gestión
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpis.map((kpi, index) => (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 text-center group"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${kpi.color} rounded-full mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-2">{kpi.value}</h3>
                <h4 className="text-lg font-semibold text-gray-700 mb-2">{kpi.title}</h4>
                <p className="text-gray-600 text-sm">{kpi.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Áreas Operacionales */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Áreas Operacionales
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {operationalAreas.map((area, index) => {
              const IconComponent = area.icon;
              return (
                <div
                  key={index}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-gray-200 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center mb-6">
                    <div className="bg-gradient-to-r from-blue-500 to-green-500 p-4 rounded-full mr-4">
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">{area.title}</h3>
                      <p className="text-gray-600">{area.description}</p>
                    </div>
                  </div>
                  
                  <ul className="space-y-3">
                    {area.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mt-2"></div>
                        <span className="text-gray-700">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Procesos de Calidad */}
      <section className="py-16 px-4 bg-white/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Sistema de Gestión de Calidad
          </h2>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center mb-4">
                    <Shield className="h-6 w-6 text-blue-600 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-800">Certificaciones</h3>
                  </div>
                  <ul className="space-y-2 text-gray-600">
                    <li>• ISO 9001:2015 - Gestión de Calidad</li>
                    <li>• ISO 14001:2015 - Gestión Ambiental</li>
                    <li>• OHSAS 18001 - Seguridad y Salud</li>
                    <li>• Certificación ICONTEC</li>
                  </ul>
                </div>
                
                <div>
                  <div className="flex items-center mb-4">
                    <Zap className="h-6 w-6 text-green-600 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-800">Mejora Continua</h3>
                  </div>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Auditorías internas regulares</li>
                    <li>• Revisión por la dirección</li>
                    <li>• Acciones correctivas y preventivas</li>
                    <li>• Capacitación continua del personal</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}