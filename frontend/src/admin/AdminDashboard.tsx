import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HttpClient from '../utils/http';
import { 
  Edit3, 
  Eye, 
  Plus, 
  Trash2, 
  FileText, 
  DollarSign, 
  Users, 
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  MessageSquare,
  Globe,
  Database,
  Activity,
  RefreshCw
} from 'lucide-react';

interface Page {
  id: string;
  title: string;
  slug?: string;
  draft_json?: any;
  published_json?: any;
  status: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  version: number;
}

export default function AdminDashboard() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(true);
  const [stats, setStats] = useState({
    totalPages: 0,
    publishedPages: 0,
    pendingInvoices: 0,
    activePQR: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    fetchPages();
    fetchStats();
    fetchRecentActivity();
  }, []);

  const fetchPages = async () => {
    try {
      const response = await HttpClient.get('/pages');
      
      // Verificar que la respuesta tenga la estructura esperada
      let pagesData = [];
      if (response?.success && response?.data && response?.data?.pages) {
        pagesData = response.data.pages;
      } else if (response?.pages) {
        pagesData = response.pages;
      } else if (Array.isArray(response)) {
        pagesData = response;
      }
      
      setPages(pagesData);

      setStats(prev => ({
        ...prev,
        totalPages: pagesData.length,
        publishedPages: pagesData.filter((p: any) => p.published || p.status === 'published' || p.isPublished || p.isActive).length
      }));
    } catch (error) {
      console.error('Error fetching pages:', error);
      // Si hay error de autenticación, redirigir al login
      navigate('/admin');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const invoicesData: any = await HttpClient.get('/invoices');
      // Verificar que invoicesData tenga la estructura correcta
      const invoices = invoicesData?.data?.invoices || invoicesData?.invoices || [];
      const pendingInvoices = Array.isArray(invoices) ? invoices.filter((inv: any) => inv.status === 'pending').length : 0;
      setStats(prev => ({
        ...prev,
        pendingInvoices,
        activePQR: 0
      }));
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const data: any = await HttpClient.get('/audit-logs?limit=4');
      const activities = (data.logs || []).map((log: any) => {
        let action = 'Acción realizada';
        let icon = Edit3;
        let color = 'text-blue-600';
        switch (log.action) {
          case 'create':
            action = log.entity === 'page' ? 'Página creada' : 'Elemento creado';
            icon = FileText;
            color = 'text-green-600';
            break;
          case 'update':
            action = log.entity === 'page' ? 'Página editada' : 'Elemento actualizado';
            icon = Edit3;
            color = 'text-blue-600';
            break;
          case 'publish':
            action = 'Página publicada';
            icon = Eye;
            color = 'text-purple-600';
            break;
          default:
            action = `${log.action} realizada`;
        }
        return {
          action,
          item: log.entity_id || 'Elemento',
          time: new Date(log.createdAt).toLocaleString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit'
          }),
          icon,
          color
        };
      });
      setRecentActivity(activities);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      setRecentActivity([]);
    }
  };

  const deletePage = async (id: string, title: string) => {
    if (!confirm(`¿Estás seguro de eliminar la página "${title}"?`)) {
      return;
    }
    try {
      await HttpClient.delete(`/api/admin/pages/${id}`);
      alert('Página eliminada exitosamente');
      fetchPages();
    } catch (error) {
      console.error('Error deleting page:', error);
      alert('Error al eliminar la página');
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'published'
      ? 'text-green-600 bg-green-50 border-green-200' 
      : 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const createNewPage = () => {
    navigate('/admin/dashboard/editor/home');
  };

  const editPage = (slugOrId: string) => {
    navigate(`/admin/dashboard/editor/${slugOrId}`);
  };

  // Stats data
  const statsCards = [
    {
      title: 'Total Páginas',
      value: stats.totalPages,
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      change: '+2 esta semana'
    },
    {
      title: 'Páginas Publicadas',
      value: stats.publishedPages,
      icon: Eye,
      color: 'from-green-500 to-green-600',
      change: '100% activas'
    },
    {
      title: 'Facturas Pendientes',
      value: stats.pendingInvoices,
      icon: DollarSign,
      color: 'from-orange-500 to-orange-600',
      change: '-3 desde ayer'
    },
    {
      title: 'PQR Activos',
      value: stats.activePQR,
      icon: MessageSquare,
      color: 'from-purple-500 to-purple-600',
      change: '+1 hoy'
    }
  ];

  // Fallback activity data si no hay datos de la API
  const fallbackActivity = [
    {
      action: 'Página editada',
      item: 'Quiénes Somos',
      time: 'Hace 2 horas',
      icon: Edit3,
      color: 'text-blue-600'
    },
    {
      action: 'Nueva factura',
      item: 'Cuenta #12345',
      time: 'Hace 4 horas',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      action: 'PQR respondido',
      item: 'Queja #001',
      time: 'Hace 6 horas',
      icon: MessageSquare,
      color: 'text-purple-600'
    },
    {
      action: 'Usuario creado',
      item: 'admin@test.com',
      time: 'Hace 1 día',
      icon: Users,
      color: 'text-indigo-600'
    }
  ];

  const displayActivity = recentActivity.length > 0 ? recentActivity : fallbackActivity;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      {showWelcomeMessage && (
        <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl p-8 text-white relative">
          <button
            onClick={() => setShowWelcomeMessage(false)}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
            title="Ocultar mensaje de bienvenida"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">¡Bienvenido al Dashboard!</h1>
              <p className="text-blue-100 text-lg">
                Gestiona tu acueducto municipal desde un solo lugar
              </p>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <Activity className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                </div>
              </div>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600">{stat.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Actividad Reciente</h2>
              <Link
                to="/admin/reports"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Ver todo
              </Link>
            </div>
            
            <div className="space-y-4">
              {displayActivity.map((activity, index) => {
                const IconComponent = activity.icon;
                return (
                  <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`p-2 rounded-lg bg-gray-100`}>
                      <IconComponent className={`h-4 w-4 ${activity.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600">{activity.item}</p>
                    </div>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Acciones Rápidas</h3>
            <div className="space-y-3">
              <Link
                to="/admin/content"
                className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors group"
              >
                <Edit3 className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-800 group-hover:text-blue-900">
                  Editar Contenido
                </span>
              </Link>
              
              <Link
                to="/admin/migrator"
                className="flex items-center space-x-3 p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors group"
              >
                <RefreshCw className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-purple-800 group-hover:text-purple-900">
                  Migrar Páginas a JSON
                </span>
              </Link>
              
              <Link
                to="/admin/invoices"
                className="flex items-center space-x-3 p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors group"
              >
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800 group-hover:text-green-900">
                  Nueva Factura
                </span>
              </Link>
              
              <Link
                to="/admin/pqr"
                className="flex items-center space-x-3 p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors group"
              >
                <MessageSquare className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-purple-800 group-hover:text-purple-900">
                  Revisar PQR
                </span>
              </Link>
              
              <Link
                to="/"
                target="_blank"
                className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group"
              >
                <Globe className="h-5 w-5 text-gray-600" />
                <span className="font-medium text-gray-800 group-hover:text-gray-900">
                  Ver Sitio Público
                </span>
              </Link>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Estado del Sistema</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Base de Datos</span>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">Activa</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Servidor Web</span>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">Funcionando</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Último Backup</span>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-yellow-600">Hace 2 horas</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pages Management Preview */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Gestión de Páginas</h2>
          <button
            onClick={createNewPage}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nueva Página</span>
          </button>
        </div>

        {/* Accesos rápidos a páginas públicas */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Páginas Públicas</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { title: 'Inicio', slug: 'home' },
              { title: 'Quiénes Somos', slug: 'quienes-somos' },
              { title: 'Información ESAL', slug: 'informacion-esal' },
              { title: 'Operación y Gestión', slug: 'operacion-gestion' },
              { title: 'Portal de Usuario', slug: 'portal-usuario' },
              { title: 'Normatividad', slug: 'normatividad' },
              { title: 'Contacto', slug: 'contacto' }
            ].map((pg) => (
              <button
                key={pg.slug}
                onClick={() => editPage(pg.slug)}
                className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700"
                title={`Editar ${pg.title}`}
              >
                <Edit3 className="inline h-4 w-4 mr-1 align-middle" />
                <span className="align-middle">{pg.title}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Título
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actualizada
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pages.slice(0, 5).map((page) => (
                <tr key={page.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{page.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <code className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      /{page.slug || page.id}
                    </code>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(page.status)}`}>
                      {page.status === 'published' ? 'Publicada' : 'Borrador'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(page.updatedAt).toLocaleDateString('es-CO')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => editPage(page.slug || page.id)}
                        className="text-blue-600 hover:text-blue-700 transition-colors"
                        title="Editar página"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deletePage(page.id, page.title)}
                        className="text-red-600 hover:text-red-700 transition-colors"
                        title="Eliminar página"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pages.length === 0 && (
          <div className="text-center py-12">
            <Edit3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay páginas</h3>
            <p className="text-gray-600 mb-6">Crea tu primera página para comenzar</p>
            <Link 
              to="/admin/content" 
              className="bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:from-blue-600 hover:to-green-600 transition-all duration-200"
            >
              Crear Nueva Página
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}