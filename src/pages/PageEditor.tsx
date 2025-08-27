import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Eye, ArrowLeft, AlertCircle, Code, Monitor } from 'lucide-react';

interface Page {
  id: number;
  title: string;
  slug: string;
  content: string;
  metaDescription: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

const PageEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [viewMode, setViewMode] = useState<'code' | 'preview'>('preview'); // Cambiado a 'preview' por defecto
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    metaDescription: '',
    published: false
  });

  useEffect(() => {
    if (id && id !== 'new') {
      fetchPage();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchPage = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:3001/api/admin/pages/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar la página');
      }

      const pageData = await response.json();
      setPage(pageData);
      setFormData({
        title: pageData.title || '',
        slug: pageData.slug || '',
        content: pageData.content || '',
        metaDescription: pageData.metaDescription || '',
        published: pageData.published || false
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem('adminToken');
      const url = id === 'new' 
        ? 'http://localhost:3001/api/admin/pages'
        : `http://localhost:3001/api/admin/pages/${id}`;
      
      const method = id === 'new' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Error al guardar la página');
      }

      const savedPage = await response.json();
      setPage(savedPage);
      
      if (id === 'new') {
        navigate(`/admin/editor/${savedPage.id}`);
      }
      
      alert('Página guardada exitosamente');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Volver al Dashboard
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                {id === 'new' ? 'Nueva Página' : `Editando: ${formData.title || page?.title || 'Página'}`}
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Eye className="h-4 w-4 mr-2" />
                {showPreview ? 'Ocultar Vista Previa' : 'Vista Previa'}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className={`grid gap-6 ${showPreview ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {/* Editor Panel */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium text-gray-900">Editor de Contenido</h2>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setViewMode('preview')}
                    className={`flex items-center px-3 py-2 text-sm rounded-md ${
                      viewMode === 'preview'
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                    }`}
                  >
                    <Monitor className="h-4 w-4 mr-2" />
                    Vista HTML
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('code')}
                    className={`flex items-center px-3 py-2 text-sm rounded-md ${
                      viewMode === 'code'
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                    }`}
                  >
                    <Code className="h-4 w-4 mr-2" />
                    Código
                  </button>
                </div>
              </div>
              
              <div className="space-y-6">
                {/* Content with toggle */}
                <div>
                  {viewMode === 'code' ? (
                    <textarea
                      id="content"
                      name="content"
                      value={formData.content}
                      onChange={handleInputChange}
                      rows={25}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                      placeholder="<div>Contenido HTML de la página...</div>"
                    />
                  ) : (
                    <div className="border border-gray-300 rounded-md min-h-[600px] p-4 bg-white">
                      {formData.content ? (
                        <div 
                          className="prose prose-sm max-w-none"
                          style={{
                            fontFamily: 'inherit',
                            lineHeight: '1.6',
                            color: '#374151'
                          }}
                          dangerouslySetInnerHTML={{ __html: formData.content }}
                        />
                      ) : (
                        <div className="text-center py-12">
                          <Monitor className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500 italic">Cambia a "Código" para escribir contenido HTML...</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Published */}
                <div className="flex items-center pt-4 border-t">
                  <input
                    type="checkbox"
                    id="published"
                    name="published"
                    checked={formData.published}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="published" className="ml-2 block text-sm text-gray-900">
                    Página publicada (visible al público)
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          {showPreview && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Vista Previa Completa</h2>
                <div className="border rounded-lg overflow-hidden">
                  {/* Simulación de navegador */}
                  <div className="bg-gray-100 px-4 py-2 border-b flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="flex-1 bg-white rounded px-3 py-1 text-sm text-gray-600">
                      localhost:5173/{formData.slug || page?.slug || 'pagina'}
                    </div>
                  </div>
                  
                  {/* Contenido de la página */}
                  <div className="bg-white p-6 min-h-96 max-h-96 overflow-y-auto">
                    {formData.content ? (
                      <div 
                        className="prose prose-sm max-w-none"
                        style={{
                          fontFamily: 'system-ui, -apple-system, sans-serif',
                          lineHeight: '1.6',
                          color: '#111827'
                        }}
                        dangerouslySetInnerHTML={{ __html: formData.content }}
                      />
                    ) : (
                      <div className="text-center py-12">
                        <Monitor className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Escribe contenido HTML para ver la vista previa...</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageEditor;