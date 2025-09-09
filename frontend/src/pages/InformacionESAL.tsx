import React from 'react';
import Layout from '../components/Layout';
import { FileText, Download, Eye, Calendar, Building, Users, Shield, Globe } from 'lucide-react';

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-6">
              Información <span className="text-green-300">ESAL</span>
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Transparencia y rendición de cuentas. Accede a toda la información 
              corporativa y documentos oficiales de nuestra empresa.
            </p>
            
            {/* Key Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">100%</div>
                <div className="text-blue-200">Transparencia</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">24/7</div>
                <div className="text-blue-200">Acceso a Información</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">ISO</div>
                <div className="text-blue-200">Certificación</div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          <div className="space-y-16">

            {/* Información Organizacional */}
            <section className="bg-white rounded-2xl shadow-xl p-12">
              <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
                Información Corporativa
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {organizationalInfo.map((info, index) => {
                  const IconComponent = info.icon;
                  return (
                    <div
                      key={index}
                      className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-full">
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
            </section>

            {/* Documentos Oficiales */}
            <section className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-12">
              <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
                Documentos Oficiales
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {documents.map((doc, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-r from-red-500 to-red-600 p-3 rounded-lg">
                          <FileText className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                            {doc.title}
                          </h3>
                          <p className="text-sm text-gray-500">{doc.type} • {doc.size}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 bg-blue-100 px-3 py-1 rounded-full">
                        {new Date(doc.date).toLocaleDateString('es-CO')}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-6">{doc.description}</p>
                    
                    <div className="flex space-x-3">
                      <button className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex-1 justify-center">
                        <Eye className="h-4 w-4" />
                        <span>Ver</span>
                      </button>
                      <button className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex-1 justify-center">
                        <Download className="h-4 w-4" />
                        <span>Descargar</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Marco Legal */}
            <section className="bg-white rounded-2xl shadow-xl p-12">
              <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
                Marco Legal y Regulatorio
              </h2>
              
              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8">
                    <div className="flex items-center mb-6">
                      <div className="bg-blue-600 p-3 rounded-full mr-4">
                        <Shield className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800">Normatividad Aplicable</h3>
                    </div>
                    <ul className="space-y-3 text-gray-600">
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Ley 142 de 1994 - Régimen de Servicios Públicos
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Decreto 1077 de 2015 - Sector Vivienda
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Resolución CRA 287 de 2004
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Decreto 2811 de 1974 - Código Nacional de Recursos Naturales
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-8">
                    <div className="flex items-center mb-6">
                      <div className="bg-green-600 p-3 rounded-full mr-4">
                        <Globe className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800">Entidades de Control</h3>
                    </div>
                    <ul className="space-y-3 text-gray-600">
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Superintendencia de Servicios Públicos
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Comisión de Regulación de Agua Potable (CRA)
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Ministerio de Vivienda, Ciudad y Territorio
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Contraloría Municipal
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </Layout>
  );
}