import React, { useState, useEffect } from 'react';
import CanvasPageEditor from '../editor/CanvasPageEditor';

interface PageListItem {
  id: string;
  title: string;
  status: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

interface AdminDashboardProps {
  onLogout?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [pages, setPages] = useState<PageListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [creatingPage, setCreatingPage] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  console.log('🏠 [AdminDashboard] Component initialized');

  // Cargar lista de páginas
  const loadPages = async () => {
    console.log('📥 [AdminDashboard] Loading pages list');
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/admin/pages');
      console.log('🌐 [AdminDashboard] API response status:', response.status);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📋 [AdminDashboard] Received pages:', {
        count: data.length,
        pages: data.map((p: any) => ({ id: p.id, title: p.title, status: p.status }))
      });

      setPages(data);
    } catch (err) {
      console.error('❌ [AdminDashboard] Error loading pages:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido al cargar páginas');
    } finally {
      setLoading(false);
    }
  };

  // Crear nueva página
  const handleCreatePage = async () => {
    if (!newPageTitle.trim()) {
      console.warn('⚠️ [AdminDashboard] Empty page title');
      return;
    }

    console.log('➕ [AdminDashboard] Creating new page:', newPageTitle);
    setCreatingPage(true);

    try {
      // Generar ID único basado en el título
      const pageId = newPageTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
        .substring(0, 50) || `page-${Date.now()}`;

      console.log('🆔 [AdminDashboard] Generated page ID:', pageId);

      const defaultContent = {
        meta: { width: 1200 },
        blocks: [
          {
            id: 'welcome-text',
            type: 'text',
            content: `<h1>${newPageTitle}</h1><p>Esta es una nueva página. Comienza a editarla agregando contenido.</p>`,
            x: 100,
            y: 100,
            width: 600,
            height: 120,
            fontSize: 16,
            fontFamily: 'Arial',
            color: '#333333',
            backgroundColor: 'transparent',
            textAlign: 'left'
          }
        ]
      };

      const response = await fetch(`/api/admin/pages/${pageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newPageTitle,
          draft_json: JSON.stringify(defaultContent)
        })
      });

      console.log('🌐 [AdminDashboard] Create page response status:', response.status);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const createdPage = await response.json();
      console.log('✅ [AdminDashboard] Page created successfully:', createdPage);

      // Recargar lista de páginas
      await loadPages();
      
      // Limpiar formulario
      setNewPageTitle('');
      setShowCreateForm(false);
      
      // Abrir editor para la nueva página
      setSelectedPageId(pageId);
    } catch (err) {
      console.error('❌ [AdminDashboard] Error creating page:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido al crear página');
    } finally {
      setCreatingPage(false);
    }
  };

  // Eliminar página
  const handleDeletePage = async (pageId: string, pageTitle: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la página "${pageTitle}"?`)) {
      return;
    }

    console.log('🗑️ [AdminDashboard] Deleting page:', pageId);

    try {
      const response = await fetch(`/api/admin/pages/${pageId}`, {
        method: 'DELETE'
      });

      console.log('🌐 [AdminDashboard] Delete response status:', response.status);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      console.log('✅ [AdminDashboard] Page deleted successfully');
      
      // Recargar lista de páginas
      await loadPages();
    } catch (err) {
      console.error('❌ [AdminDashboard] Error deleting page:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido al eliminar página');
    }
  };

  // Cargar páginas al montar el componente
  useEffect(() => {
    loadPages();
  }, []);

  // Si hay una página seleccionada, mostrar el editor
  if (selectedPageId) {
    return (
      <CanvasPageEditor
        pageId={selectedPageId}
        onBack={() => {
          console.log('🔙 [AdminDashboard] Returning from editor to dashboard');
          setSelectedPageId(null);
          // Recargar páginas para reflejar cambios
          loadPages();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
              <p className="text-gray-600">Gestiona las páginas de tu sitio web</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <span>➕</span>
                <span>Nueva Página</span>
              </button>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Cerrar Sesión
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-red-500 text-xl mr-3">❌</span>
              <div>
                <h3 className="text-red-800 font-medium">Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Create Page Form */}
        {showCreateForm && (
          <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Crear Nueva Página</h2>
            <div className="flex items-center space-x-4">
              <input
                type="text"
                value={newPageTitle}
                onChange={(e) => setNewPageTitle(e.target.value)}
                placeholder="Título de la página"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleCreatePage();
                  }
                }}
              />
              <button
                onClick={handleCreatePage}
                disabled={creatingPage || !newPageTitle.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {creatingPage ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creando...</span>
                  </>
                ) : (
                  <>
                    <span>✅</span>
                    <span>Crear</span>
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setNewPageTitle('');
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Pages List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando páginas...</p>
            </div>
          </div>
        ) : pages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">No hay páginas</h3>
            <p className="text-gray-500 mb-6">Crea tu primera página para comenzar</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Crear Primera Página
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Páginas ({pages.length})</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {pages.map((page) => (
                <div key={page.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900">{page.title}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          page.status === 'published' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {page.status === 'published' ? '🟢 Publicado' : '🟡 Borrador'}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        <span>ID: {page.id}</span>
                        <span className="mx-2">•</span>
                        <span>Versión: {page.version}</span>
                        <span className="mx-2">•</span>
                        <span>Actualizado: {new Date(page.updatedAt).toLocaleDateString()}</span>
                        {page.publishedAt && (
                          <>
                            <span className="mx-2">•</span>
                            <span>Publicado: {new Date(page.publishedAt).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <a
                        href={`/${page.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center space-x-1"
                      >
                        <span>👁️</span>
                        <span>Ver</span>
                      </a>
                      <button
                        onClick={() => {
                          console.log('✏️ [AdminDashboard] Opening editor for page:', page.id);
                          setSelectedPageId(page.id);
                        }}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center space-x-1"
                      >
                        <span>✏️</span>
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => handleDeletePage(page.id, page.title)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center space-x-1"
                      >
                        <span>🗑️</span>
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;