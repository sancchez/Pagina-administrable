import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { 
  Droplets, 
  LayoutDashboard, 
  Edit3, 
  LogOut, 
  FileText, 
  DollarSign, 
  Users, 
  MessageSquare,
  Settings,
  BarChart3,
  HelpCircle,
  Globe,
  Database,
  Shield,
  Bell,
  X,
  Archive,
  Upload
} from 'lucide-react';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showHelpBox, setShowHelpBox] = useState(true);

  if (!user) {
    return <Navigate to="/admin" replace />;
  }

  const handleLogout = () => {
    logout();
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const menuItems = [
    {
      title: 'Dashboard',
      path: '/admin/dashboard',
      icon: LayoutDashboard,
      color: 'from-blue-500 to-blue-600',
      description: 'Vista general del sistema'
    },
    {
      title: 'Editor',
      path: '/admin/dashboard/editor/home',
      icon: Edit3,
      color: 'from-green-500 to-green-600',
      description: 'Editor de páginas'
    },
    {
      title: 'Gestión de Facturas',
      path: '/admin/dashboard/invoices',
      icon: DollarSign,
      color: 'from-purple-500 to-purple-600',
      description: 'Administrar facturas'
    },
    {
      title: 'PQR y Solicitudes',
      path: '/admin/dashboard/pqr',
      icon: MessageSquare,
      color: 'from-orange-500 to-orange-600',
      description: 'Peticiones, quejas y reclamos'
    },
    {
      title: 'Gestión de Usuarios',
      path: '/admin/dashboard/users',
      icon: Users,
      color: 'from-indigo-500 to-indigo-600',
      description: 'Administrar usuarios'
    },
    {
      title: 'Reportes y Analytics',
      path: '/admin/dashboard/reports',
      icon: BarChart3,
      color: 'from-emerald-500 to-emerald-600',
      description: 'Estadísticas y reportes'
    },
    {
      title: 'Backups',
      path: '/admin/dashboard/backups',
      icon: Archive,
      color: 'from-cyan-500 to-cyan-600',
      description: 'Gestión de respaldos'
    },
    {
      title: 'Migración de Páginas',
      path: '/admin/dashboard/migration',
      icon: Upload,
      color: 'from-yellow-500 to-yellow-600',
      description: 'Migrar páginas estáticas a dinámicas'
    },
    {
      title: 'Configuración',
      path: '/admin/dashboard/settings',
      icon: Settings,
      color: 'from-gray-500 to-gray-600',
      description: 'Configuración del sistema'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-25 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-xl border-b border-gray-200 sticky top-0 z-50">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-500 to-green-500 p-3 rounded-xl shadow-lg">
                <Droplets className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  Panel Administrativo
                </h1>
                <p className="text-sm text-gray-600">Acueducto Municipal - Sistema de Gestión</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">3</span>
            </button>

            {/* User Info */}
            <div className="flex items-center space-x-3 bg-gray-50 rounded-xl px-4 py-2">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-gray-600">{user.email}</p>
              </div>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">{user.firstName?.charAt(0) || 'U'}</span>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors px-4 py-2 rounded-xl hover:bg-red-50 border border-gray-200 hover:border-red-200"
            >
              <LogOut className="h-4 w-4" />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-80 bg-white shadow-xl border-r border-gray-200 min-h-[calc(100vh-89px)]">
          <nav className="p-6 space-y-3">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-4 px-4 py-4 rounded-xl transition-all duration-200 group ${
                    active
                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg transform scale-105` 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${active ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-gray-200'}`}>
                    <IconComponent className={`h-5 w-5 ${active ? 'text-white' : 'text-gray-600 group-hover:text-gray-800'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{item.title}</div>
                    <div className={`text-xs ${active ? 'text-white/80' : 'text-gray-500'}`}>
                      {item.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Quick Actions */}
          <div className="p-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3">Acciones Rápidas</h3>
            <div className="space-y-2">
              <a
                href="/"
                target="_blank"
                className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Globe className="h-4 w-4" />
                <span>Ver sitio público</span>
              </a>
              <Link
                to="/admin/dashboard/reports"
                className="flex items-center space-x-2 text-sm text-green-600 hover:text-green-800 transition-colors"
              >
                <Database className="h-4 w-4" />
                <span>Backup de datos</span>
              </Link>
              <Link
                to="/admin/dashboard/settings"
                className="flex items-center space-x-2 text-sm text-purple-600 hover:text-purple-800 transition-colors"
              >
                <Shield className="h-4 w-4" />
                <span>Configurar seguridad</span>
              </Link>
            </div>
          </div>

          {/* Help Section */}
          {showHelpBox && (
            <div className="absolute bottom-6 left-6 right-6">
              <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-xl p-4 text-white relative">
                <button 
                  onClick={() => setShowHelpBox(false)}
                  className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="flex items-center space-x-3 mb-2">
                  <HelpCircle className="h-5 w-5" />
                  <span className="font-semibold">¿Necesitas ayuda?</span>
                </div>
                <p className="text-sm text-blue-100 mb-3">
                  Consulta nuestra documentación o contacta soporte técnico.
                </p>
                <button className="bg-white/20 hover:bg-white/30 text-white text-sm px-3 py-1 rounded-lg transition-colors">
                  Ver Guía
                </button>
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}