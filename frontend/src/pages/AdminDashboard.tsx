import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Edit3, 
  Eye, 
  Plus, 
  Trash2, 
  FileText, 
  DollarSign, 
  MessageSquare,
  TrendingUp,
  Activity,
  LogOut,
  Droplets,
  Clock
} from 'lucide-react';


interface Page {
  id: number;
  title: string;
  slug: string;
  metaDescription?: string;
  published: boolean;
  updatedAt: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    if (!token) {
      navigate('/admin');
      return;
    }
    fetchPages();
  }, [token, navigate]);

  const fetchPages = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/pages', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPages(data);
      }
    } catch (error) {
      console.error('Error fetching pages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para ver página pública
  const viewPage = (page: Page) => {
    // Usar el slug correcto para abrir la página
    let url;
    if (page.slug === 'home' || page.slug === '/') {
      url = '/';
    } else {
      url = `/${page.slug}`;
    }
    window.open(url, '_blank');
  };

  // Función para editar página (usando editor canvas)
  const editPage = (pageId: number) => {
    navigate(`/admin/editor/${pageId}`);
  };

  // Función para crear nueva página
  const createNewPage = () => {
    navigate('/admin/editor/new');
  };

  const deletePage = async (id: number, title: string) => {
    if (!confirm(`¿Estás seguro de eliminar la página "${title}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/pages/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert('Página eliminada exitosamente');
        fetchPages();
      } else {
        alert('Error al eliminar la página');
      }
    } catch (error) {
      console.error('Error deleting page:', error);
      alert('Error al eliminar la página');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin');
  };

  const stats = [
    {
      title: 'Total Páginas',
      value: pages.length,
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      change: '+2 esta semana'
    },
    {
      title: 'Páginas Publicadas',
      value: pages.filter(p => p.published).length,
      icon: Eye,
      color: 'from-green-500 to-green-600',
      change: '100% activas'
    },
    {
      title: 'Facturas Pendientes',
      value: 15,
      icon: DollarSign,
      color: 'from-orange-500 to-orange-600',
      change: '-3 desde ayer'
    },
    {
      title: 'PQR Activos',
      value: 8,
      icon: MessageSquare,
      color: 'from-purple-500 to-purple-600',
      change: '+1 hoy'
    }
  ];

  const recentActivity = [
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
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-green-100 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-green-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-green-600 p-2 rounded-full">
                <Droplets className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Panel Administrativo</h1>
                <p className="text-sm text-gray-600">Acueducto Municipal</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-gray-600 hover:text-gray-800 transition-colors">
                Ver Sitio Web
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Welcome Header */}
          <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl p-8 text-white">
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

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
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
                    <span className="text-gray-600">{stat.change}</span>
                  </div>
                </div>
              );
            })}
          </div>



          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Pages Management */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-800">Gestión de Páginas</h2>
                    <div className="flex space-x-2">
                      <Link
                        to="/admin/canvas-editor/home-test"
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                      >
                        <Edit3 className="h-4 w-4" />
                        <span>🎨 Probar Editor</span>
                      </Link>
                      <button 
                        onClick={createNewPage}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Nueva Página</span>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  {pages.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No hay páginas disponibles</p>
                  ) : (
                    <div className="space-y-4">
                      {pages.map((page) => (
                        <div
                          key={page.id}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800">{page.title}</h3>
                            <p className="text-sm text-gray-600">/{page.slug}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium border ${
                                  page.published
                                    ? 'text-green-600 bg-green-50 border-green-200'
                                    : 'text-gray-600 bg-gray-50 border-gray-200'
                                }`}
                              >
                                {page.published ? 'Publicada' : 'Borrador'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => viewPage(page)}
                              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Ver página pública"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => editPage(page.id)}
                              className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                              title="Editor"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deletePage(page.id, page.title)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar página"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800">Actividad Reciente</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => {
                      const IconComponent = activity.icon;
                      return (
                        <div key={index} className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${activity.color} bg-opacity-10`}>
                            <IconComponent className={`h-4 w-4 ${activity.color}`} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">{activity.action}</p>
                            <p className="text-xs text-gray-600">{activity.item}</p>
                            <p className="text-xs text-gray-500">{activity.time}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}