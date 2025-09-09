import Layout from '../components/Layout';
import { FileText, Download, Eye, Scale, BookOpen, Shield } from 'lucide-react';

export default function Normatividad() {
  const regulations = [
    {
      title: 'Ley 142 de 1994',
      description: 'Régimen de los servicios públicos domiciliarios',
      category: 'Ley Nacional',
      date: '1994-07-11',
      status: 'Vigente'
    },
    {
      title: 'Decreto 1077 de 2015',
      description: 'Decreto Único Reglamentario del Sector Vivienda, Ciudad y Territorio',
      category: 'Decreto Nacional',
      date: '2015-05-26',
      status: 'Vigente'
    },
    {
      title: 'Resolución CRA 287 de 2004',
      description: 'Metodología tarifaria para el servicio público domiciliario de acueducto',
      category: 'Resolución CRA',
      date: '2004-06-15',
      status: 'Vigente'
    },
    {
      title: 'Decreto 2811 de 1974',
      description: 'Código Nacional de Recursos Naturales Renovables',
      category: 'Decreto Nacional',
      date: '1974-12-18',
      status: 'Vigente'
    },
    {
      title: 'Resolución 2115 de 2007',
      description: 'Características, instrumentos básicos y frecuencias del sistema de control y vigilancia para la calidad del agua',
      category: 'Resolución MinSalud',
      date: '2007-06-22',
      status: 'Vigente'
    },
    {
      title: 'Ley 1176 de 2007',
      description: 'Desarrollo del artículo 356 de la Constitución Política',
      category: 'Ley Nacional',
      date: '2007-12-27',
      status: 'Vigente'
    }
  ];

  const internalPolicies = [
    {
      title: 'Reglamento de Usuarios',
      description: 'Normas y condiciones para la prestación del servicio',
      icon: BookOpen
    },
    {
      title: 'Política de Calidad',
      description: 'Compromiso con la excelencia en el servicio',
      icon: Shield
    },
    {
      title: 'Manual de Procedimientos',
      description: 'Procesos operativos y administrativos',
      icon: FileText
    },
    {
      title: 'Código de Ética',
      description: 'Principios y valores corporativos',
      icon: Scale
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Ley Nacional': return 'bg-blue-100 text-blue-800';
      case 'Decreto Nacional': return 'bg-green-100 text-green-800';
      case 'Resolución CRA': return 'bg-purple-100 text-purple-800';
      case 'Resolución MinSalud': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">Normatividad</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Marco normativo que rige la prestación del servicio público de acueducto. 
            Conoce las leyes, decretos y resoluciones que garantizan un servicio de calidad.
          </p>
        </div>
      </section>

      {/* Marco Normativo Nacional */}
      <section className="py-16 px-4 bg-white/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Marco Normativo Nacional
          </h2>
          
          <div className="space-y-4 max-w-6xl mx-auto">
            {regulations.map((regulation, index) => (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <h3 className="text-xl font-semibold text-gray-800">{regulation.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(regulation.category)}`}>
                        {regulation.category}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{regulation.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Fecha: {new Date(regulation.date).toLocaleDateString('es-CO')}</span>
                      <span className="text-green-600 font-medium">• {regulation.status}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 mt-4 md:mt-0">
                    <button className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                      <Eye className="h-4 w-4" />
                      <span>Ver</span>
                    </button>
                    <button className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
                      <Download className="h-4 w-4" />
                      <span>Descargar</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Políticas Internas */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Políticas y Reglamentos Internos
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {internalPolicies.map((policy, index) => {
              const IconComponent = policy.icon;
              return (
                <div
                  key={index}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="bg-gradient-to-r from-blue-500 to-green-500 p-3 rounded-full group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">{policy.title}</h3>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{policy.description}</p>
                  
                  <div className="flex space-x-2">
                    <button className="flex items-center space-x-2 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm">
                      <Eye className="h-4 w-4" />
                      <span>Ver</span>
                    </button>
                    <button className="flex items-center space-x-2 bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm">
                      <Download className="h-4 w-4" />
                      <span>PDF</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Entidades Reguladoras */}
      <section className="py-16 px-4 bg-white/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Entidades Reguladoras y de Control
          </h2>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <Scale className="h-5 w-5 text-blue-600 mr-2" />
                    Entidades de Regulación
                  </h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <strong>CRA</strong> - Comisión de Regulación de Agua Potable y Saneamiento Básico
                      </div>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <strong>MinVivienda</strong> - Ministerio de Vivienda, Ciudad y Territorio
                      </div>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <strong>MinSalud</strong> - Ministerio de Salud y Protección Social
                      </div>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <Shield className="h-5 w-5 text-green-600 mr-2" />
                    Entidades de Control
                  </h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <strong>SSPD</strong> - Superintendencia de Servicios Públicos Domiciliarios
                      </div>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <strong>Contraloría</strong> - Control fiscal y financiero
                      </div>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <strong>Procuraduría</strong> - Control disciplinario
                      </div>
                    </li>
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