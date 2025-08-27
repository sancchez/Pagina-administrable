import { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Calendar, 
  Users, 
  DollarSign, 
  FileText, 
  MessageSquare,
  Eye,
  Activity,
  PieChart,
  LineChart
} from 'lucide-react';

export default function ReportsAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedReport, setSelectedReport] = useState('overview');

  const stats = {
    totalUsers: 1250,
    totalInvoices: 3420,
    totalRevenue: 125000000,
    totalPQR: 89,
    websiteViews: 15420,
    avgResponseTime: '2.3 días'
  };

  const chartData = {
    invoices: [
      { month: 'Ene', amount: 8500000 },
      { month: 'Feb', amount: 9200000 },
      { month: 'Mar', amount: 8800000 },
      { month: 'Abr', amount: 9500000 },
      { month: 'May', amount: 10200000 },
      { month: 'Jun', amount: 11000000 }
    ],
    pqr: [
      { type: 'Peticiones', count: 35, color: 'bg-blue-500' },
      { type: 'Quejas', count: 28, color: 'bg-orange-500' },
      { type: 'Reclamos', count: 18, color: 'bg-red-500' },
      { type: 'Sugerencias', count: 8, color: 'bg-purple-500' }
    ]
  };

  const reports = [
    {
      id: 'overview',
      title: 'Resumen General',
      description: 'Vista general de todas las métricas',
      icon: BarChart3
    },
    {
      id: 'financial',
      title: 'Reporte Financiero',
      description: 'Ingresos, facturas y pagos',
      icon: DollarSign
    },
    {
      id: 'users',
      title: 'Análisis de Usuarios',
      description: 'Comportamiento y estadísticas de usuarios',
      icon: Users
    },
    {
      id: 'pqr',
      title: 'Reporte PQR',
      description: 'Análisis de peticiones, quejas y reclamos',
      icon: MessageSquare
    },
    {
      id: 'website',
      title: 'Analytics Web',
      description: 'Tráfico y comportamiento en el sitio',
      icon: Eye
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
              Reportes y Analytics
            </h1>
            <p className="text-gray-600">Análisis detallado del rendimiento del sistema</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="week">Última semana</option>
              <option value="month">Último mes</option>
              <option value="quarter">Último trimestre</option>
              <option value="year">Último año</option>
            </select>
            
            <button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Exportar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Report Types */}
      <div className="grid md:grid-cols-5 gap-4">
        {reports.map((report) => {
          const IconComponent = report.icon;
          return (
            <button
              key={report.id}
              onClick={() => setSelectedReport(report.id)}
              className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                selectedReport === report.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <IconComponent className={`h-6 w-6 mb-2 ${
                selectedReport === report.id ? 'text-blue-600' : 'text-gray-600'
              }`} />
              <h3 className="font-semibold text-gray-900 text-sm">{report.title}</h3>
              <p className="text-xs text-gray-600 mt-1">{report.description}</p>
            </button>
          );
        })}
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Usuarios Totales</p>
              <p className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
            </div>
            <Users className="h-8 w-8 text-blue-200" />
          </div>
          <div className="flex items-center mt-2 text-sm">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span className="text-blue-100">+12% vs mes anterior</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Facturas</p>
              <p className="text-2xl font-bold">{stats.totalInvoices.toLocaleString()}</p>
            </div>
            <FileText className="h-8 w-8 text-green-200" />
          </div>
          <div className="flex items-center mt-2 text-sm">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span className="text-green-100">+8% vs mes anterior</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Ingresos</p>
              <p className="text-2xl font-bold">${(stats.totalRevenue / 1000000).toFixed(1)}M</p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-200" />
          </div>
          <div className="flex items-center mt-2 text-sm">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span className="text-purple-100">+15% vs mes anterior</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">PQR Activos</p>
              <p className="text-2xl font-bold">{stats.totalPQR}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-orange-200" />
          </div>
          <div className="flex items-center mt-2 text-sm">
            <Activity className="h-4 w-4 mr-1" />
            <span className="text-orange-100">Tiempo resp: {stats.avgResponseTime}</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm">Visitas Web</p>
              <p className="text-2xl font-bold">{stats.websiteViews.toLocaleString()}</p>
            </div>
            <Eye className="h-8 w-8 text-indigo-200" />
          </div>
          <div className="flex items-center mt-2 text-sm">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span className="text-indigo-100">+25% vs mes anterior</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Eficiencia</p>
              <p className="text-2xl font-bold">94.2%</p>
            </div>
            <BarChart3 className="h-8 w-8 text-emerald-200" />
          </div>
          <div className="flex items-center mt-2 text-sm">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span className="text-emerald-100">+3% vs mes anterior</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Ingresos Mensuales</h3>
            <LineChart className="h-5 w-5 text-gray-600" />
          </div>
          
          <div className="space-y-4">
            {chartData.invoices.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item.month}</span>
                <div className="flex items-center space-x-3 flex-1 mx-4">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                      style={{ width: `${(item.amount / 11000000) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  ${(item.amount / 1000000).toFixed(1)}M
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* PQR Distribution */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Distribución de PQR</h3>
            <PieChart className="h-5 w-5 text-gray-600" />
          </div>
          
          <div className="space-y-4">
            {chartData.pqr.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <span className="text-sm text-gray-700">{item.type}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${item.color}`}
                      style={{ width: `${(item.count / 89) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-8 text-right">
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Reports Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Reportes Detallados</h3>
        </div>
        
        <div className="p-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left">
              <FileText className="h-6 w-6 text-blue-600 mb-2" />
              <h4 className="font-semibold text-gray-900">Reporte Mensual</h4>
              <p className="text-sm text-gray-600">Resumen completo del mes</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-500">PDF • 2.3 MB</span>
                <Download className="h-4 w-4 text-gray-400" />
              </div>
            </button>

            <button className="p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200 text-left">
              <DollarSign className="h-6 w-6 text-green-600 mb-2" />
              <h4 className="font-semibold text-gray-900">Estado Financiero</h4>
              <p className="text-sm text-gray-600">Balance e ingresos</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-500">Excel • 1.8 MB</span>
                <Download className="h-4 w-4 text-gray-400" />
              </div>
            </button>

            <button className="p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 text-left">
              <Users className="h-6 w-6 text-purple-600 mb-2" />
              <h4 className="font-semibold text-gray-900">Análisis de Usuarios</h4>
              <p className="text-sm text-gray-600">Comportamiento y métricas</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-500">PDF • 1.5 MB</span>
                <Download className="h-4 w-4 text-gray-400" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}