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
  Archive,
  Globe,
  Sparkles,
  Layers,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface Page {
  id: string;
  title: string;
  slug?: string;
  isPublished?: boolean; // Asegurar que esta propiedad exista
  status?: string;
  updatedAt: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(true);
  const [stats, setStats] = useState({
    totalPages: 0,
    publishedPages: 0
  });

  // Crear página: estados del modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const slugify = (s: string) => s
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 64);

  useEffect(() => {
    (async () => {
      await fetchPages();
      setIsLoading(false);
    })();
  }, []);

  const fetchPages = async () => {
    try {
      // Backend devuelve pages con isActive=true por defecto
      // Usar limit=100 para obtener todas las páginas (máximo permitido por el backend)
      const resp: any = await HttpClient.get('/pages?limit=100');
      const list: Page[] = (resp?.data?.pages) || resp?.pages || [];
      setPages(list);

      // Calcular estadísticas
      const published = list.filter(p => p.isPublished).length;
      setStats({
        totalPages: list.length,
        publishedPages: published
      });
    } catch (error) {
      console.error('Error fetching pages:', error);
      setPages([]);
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      // Usar PATCH para togglear
      await HttpClient.patch(`/pages/${id}/toggle-publish`);
      // Actualizar estado localmente
      setPages(pages.map(p =>
        p.id === id ? { ...p, isPublished: !currentStatus } : p
      ));
      // Actualizar stats
      setStats(prev => ({
        ...prev,
        publishedPages: !currentStatus ? prev.publishedPages + 1 : prev.publishedPages - 1
      }));
    } catch (error) {
      console.error('Error toggling publish:', error);
      alert('Error al cambiar el estado de publicación');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar la página "${title}"?`)) return;

    try {
      await HttpClient.delete(`/pages/${id}`);
      // Actualizar lista local
      setPages(pages.filter(p => p.id !== id));
      setStats(prev => ({
        ...prev,
        totalPages: prev.totalPages - 1,
        publishedPages: pages.find(p => p.id === id)?.isPublished ? prev.publishedPages - 1 : prev.publishedPages
      }));
    } catch (error) {
      console.error('Error deleting page:', error);
      alert('Error al eliminar la página');
    }
  };

  const editPage = (slugOrId: string) => {
    navigate(`/admin/dashboard/editor/${slugOrId}`);
  };

  const openCreateModal = () => { setShowCreateModal(true); setNewTitle(''); setNewSlug(''); };
  const handleCreateSubmit = async () => {
    try {
      const title = newTitle.trim();
      const slug = (newSlug.trim() || slugify(newTitle)).trim();
      if (!title || !slug) { alert('Completa título y slug'); return; }
      const resp: any = await HttpClient.post('/pages', { title, slug });
      const created: Page = (resp?.data?.page) || resp?.page || resp;
      setShowCreateModal(false);
      await fetchPages();
      navigate(`/editor/${created?.slug || slug}`);
    } catch (e) {
      console.error('Error creating page:', e);
      alert('No se pudo crear la página');
    }
  };

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
        <div className="bg-gradient-to-br from-blue-600 via-cyan-500 to-green-400 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>

          <button
            onClick={() => setShowWelcomeMessage(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors z-10"
            title="Ocultar mensaje de bienvenida"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-4">
              <Sparkles className="h-8 w-8 text-yellow-300 animate-pulse" />
              <h1 className="text-4xl font-bold">¡Bienvenido a asomielrodas!</h1>
            </div>
            <p className="text-white/90 text-lg font-medium mb-6">
              Gestión de páginas web profesional y moderna
            </p>
            <div className="flex gap-4">
              <button
                onClick={openCreateModal}
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 border border-white/30"
              >
                <Plus className="h-5 w-5" />
                Nueva Página
              </button>
              <Link
                to="/admin/dashboard/backups"
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 border border-white/30"
              >
                <Archive className="h-5 w-5" />
                Ver Backups
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium mb-1">Total de Páginas</p>
              <p className="text-4xl font-bold">{stats.totalPages}</p>
            </div>
            <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
              <Layers className="h-8 w-8" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-emerald-500 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium mb-1">Páginas Publicadas</p>
              <p className="text-4xl font-bold">{stats.publishedPages}</p>
            </div>
            <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
              <Globe className="h-8 w-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Pages Management */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-green-500 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Gestión de Páginas</h2>
              <p className="text-white/80 text-sm">Edita y administra tus páginas web</p>
            </div>
          </div>
          <button
            onClick={openCreateModal}
            className="bg-white text-blue-600 px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-all duration-200 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
          >
            <Plus className="h-5 w-5" />
            <span>Nueva Página</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Título
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  URL
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Última Actualización
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {pages.map((page) => (
                <tr key={page.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 transition-all duration-200">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900 text-base flex items-center gap-2">
                      {page.slug === 'footer' && (
                        <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-md border border-purple-200">Footer</span>
                      )}
                      {page.title}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-sm text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg font-medium border border-blue-200">
                      /{page.slug}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleTogglePublish(page.id, !!page.isPublished)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full transition-colors ${page.isPublished
                        ? 'text-green-700 bg-green-100 border-2 border-green-300 hover:bg-green-200'
                        : 'text-yellow-700 bg-yellow-100 border-2 border-yellow-300 hover:bg-yellow-200'
                        }`}
                      title={page.isPublished ? "Click para despublicar" : "Click para publicar"}
                    >
                      <span className={`w-2 h-2 rounded-full ${page.isPublished ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></span>
                      {page.isPublished ? 'Publicada' : 'Borrador'}
                      {page.isPublished ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      {new Date(page.updatedAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => editPage(page.slug || page.id)}
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-1.5 font-medium hover:scale-105 text-sm"
                        title="Editar"
                      >
                        <Edit3 className="h-4 w-4" />
                        Editar
                      </button>
                      <a
                        href={`/${page.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-1.5 font-medium hover:scale-105 text-sm"
                        title="Ver"
                      >
                        <Eye className="h-4 w-4" />
                        Ver
                      </a>
                      <button
                        onClick={() => handleDelete(page.id, page.title)}
                        className="bg-red-100 text-red-600 px-3 py-2 rounded-lg hover:bg-red-200 transition-all duration-200 flex items-center gap-1.5 font-medium hover:scale-105 text-sm border border-red-200"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {pages.length === 0 && (
            <div className="text-center py-16">
              <div className="bg-gradient-to-br from-blue-100 to-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No hay páginas creadas</h3>
              <p className="text-gray-600 mb-6">Comienza creando tu primera página web</p>
              <button
                onClick={openCreateModal}
                className="bg-gradient-to-r from-blue-600 to-green-500 text-white px-6 py-3 rounded-xl hover:shadow-xl transition-all duration-200 inline-flex items-center gap-2 font-semibold"
              >
                <Plus className="h-5 w-5" />
                Crear Primera Página
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal crear página - Diseño moderno */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in">
            <div className="bg-gradient-to-r from-blue-600 to-green-500 px-6 py-5 text-white">
              <h3 className="text-2xl font-bold">✨ Nueva Página</h3>
              <p className="text-white/80 text-sm mt-1">Crea una nueva página web</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Título de la Página</label>
                <input
                  value={newTitle}
                  onChange={(e) => { setNewTitle(e.target.value); setNewSlug(slugify(e.target.value)); }}
                  className="w-full border-2 border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl px-4 py-3 transition-all outline-none"
                  placeholder="Ej: Acerca de Nosotros"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Slug (URL)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">/</span>
                  <input
                    value={newSlug}
                    onChange={(e) => setNewSlug(slugify(e.target.value))}
                    className="w-full border-2 border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl pl-8 pr-4 py-3 transition-all outline-none"
                    placeholder="acerca-de-nosotros"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">La URL se generará automáticamente del título</p>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateSubmit}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Crear Página
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
