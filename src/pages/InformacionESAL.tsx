import Layout from '../components/Layout';
import { FileText, Download, Eye, Calendar, Building, Users } from 'lucide-react';

export default function InformacionESAL() {
  const documents = [
    {
      title: 'Estatutos Sociales',
      description: 'Documento constitutivo de la empresa',
      date: '2024-01-15',
      size: '2.5 MB',
      type: 'PDF'
    },
    {
      title: 'Estados Financieros 2023',
      description: 'Balance general y estado de resultados',
      date: '2024-03-30',
      size: '1.8 MB',
      type: 'PDF'
    },
    {
      title: 'Informe de Gestión 2023',
      description: 'Reporte anual de actividades y logros',
      date: '2024-02-28',
      size: '3.2 MB',
      type: 'PDF'
    },
    {
      title: 'Plan Estratégico 2024-2028',
      description: 'Planificación estratégica quinquenal',
      date: '2024-01-10',
      size: '4.1 MB',
      type: 'PDF'
    }
  ];

  const organizationalInfo = [
    {
      icon: Building,
      title: 'Razón Social',
      content: 'Empresa de Servicios Públicos Acueducto Municipal E.S.P.'
    },
    {
      icon: FileText,
      title: 'NIT',
      content: '900.123.456-7'
    },
    {
      icon: Users,
      title: 'Representante Legal',
      content: 'Ing. María González Rodríguez'
    },
    {
      icon: Calendar,
      title: 'Fecha de Constitución',
      content: '15 de marzo de 1990'
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            Información <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">ESAL</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transparencia y rendición de cuentas. Accede a toda la información 
            corporativa y documentos oficiales de nuestra empresa.
          </p>
        </div>
      </section>

      {/* Información Organizacional */}
      <section className="py-16 px-4 bg-white/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Información Corporativa
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {organizationalInfo.map((info, index) => {
              const IconComponent = info.icon;
              return (
                <div
                  key={index}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-r from-blue-500 to-green-500 p-3 rounded-full">
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{info.title}</h3>
                      <p className="text-gray-600">{info.content}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Documentos Oficiales */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Documentos Oficiales
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {documents.map((doc, index) => (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-r from-red-500 to-red-600 p-2 rounded-lg">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                        {doc.title}
                      </h3>
                      <p className="text-sm text-gray-500">{doc.type} • {doc.size}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {new Date(doc.date).toLocaleDateString('es-CO')}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4">{doc.description}</p>
                
                <div className="flex space-x-3">
                  <button className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200">
                    <Eye className="h-4 w-4" />
                    <span>Ver</span>
                  </button>
                  <button className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200">
                    <Download className="h-4 w-4" />
                    <span>Descargar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Marco Legal */}
      <section className="py-16 px-4 bg-white/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Marco Legal y Regulatorio
          </h2>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Normatividad Aplicable</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Ley 142 de 1994 - Régimen de Servicios Públicos</li>
                    <li>• Decreto 1077 de 2015 - Sector Vivienda</li>
                    <li>• Resolución CRA 287 de 2004</li>
                    <li>• Decreto 2811 de 1974 - Código Nacional de Recursos Naturales</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Entidades de Control</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Superintendencia de Servicios Públicos</li>
                    <li>• Comisión de Regulación de Agua Potable (CRA)</li>
                    <li>• Ministerio de Vivienda, Ciudad y Territorio</li>
                    <li>• Contraloría Municipal</li>
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