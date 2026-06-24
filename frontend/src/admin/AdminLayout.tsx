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
      id: 'dashboard',
      title: 'Dashboard',
      path: '/admin/dashboard',
      icon: LayoutDashboard,
      color: 'from-blue-600 to-cyan-500',
      description: 'Vista general del sistema'
    },
    {
      id: 'pages',
      title: 'Gestión de Páginas',
      path: '/admin/dashboard',
      icon: Edit3,
      color: 'from-blue-500 to-green-500',
      description: 'Editar y administrar páginas'
    },
    {
      id: 'backups',
      title: 'Backups',
      path: '/admin/dashboard/backups',
      icon: Archive,
      color: 'from-green-600 to-emerald-500',
      description: 'Gestión de respaldos'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-xl border-b border-gray-200 sticky top-0 z-50">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-green-500 p-3 rounded-xl shadow-lg">
                <Globe className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-blue-700">
                  Acueducto El Socorro
                </h1>
                <p className="text-sm text-gray-600">Panel de Administración Web</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* User Info */}
            <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl px-4 py-2 border border-blue-200">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-blue-600">{user.email}</p>
              </div>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-500 rounded-full flex items-center justify-center">
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
                  key={item.id}
                  to={item.path}
                  className={`flex items-center space-x-4 px-4 py-4 rounded-xl transition-all duration-200 group ${active
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
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-600" />
              Acciones Rápidas
            </h3>
            <div className="space-y-2">
              <a
                href="/"
                target="_blank"
                className="flex items-center space-x-2 p-2 rounded-lg text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors"
              >
                <Globe className="h-4 w-4" />
                <span>Ver sitio público</span>
              </a>
              <Link
                to="/admin/dashboard/backups"
                className="flex items-center space-x-2 p-2 rounded-lg text-sm text-green-600 hover:text-green-800 hover:bg-green-50 transition-colors"
              >
                <Archive className="h-4 w-4" />
                <span>Gestión de backups</span>
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}