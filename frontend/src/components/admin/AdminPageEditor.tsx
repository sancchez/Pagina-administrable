import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, AlertCircle, Save, Eye, Settings, Code } from 'lucide-react';
import { BlockEditor } from '../editor/BlockEditor';
import { PageRenderer } from '../renderer/PageRenderer';
import { migrateHtmlToJson } from '../../utils/htmlToJsonMigrator';
import { PageData, BlockData } from '../../types/blocks';
import { Button } from '../ui/button';
import { toast } from 'sonner';

interface Page {
  id: number;
  title: string;
  slug: string;
  content?: string;
  draftJson?: BlockData[];
  publishedJson?: BlockData[];
  metaDescription: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AdminPageEditorProps {
  pageId?: number;
  onBack: () => void;
  onSave?: (pageData: PageData) => Promise<void>;
}

export const AdminPageEditor: React.FC<AdminPageEditorProps> = ({
  pageId,
  onBack,
  onSave
}) => {
  const [page, setPage] = useState<Page | null>(null);
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'editor' | 'preview' | 'code'>('editor');
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    metaDescription: '',
    published: false
  });

  // Load page data
  useEffect(() => {
    if (pageId && pageId !== 0) {
      fetchPage();
    } else {
      // New page
      const newPageData: PageData = {
        title: 'Nueva Página',
        slug: 'nueva-pagina',
        draftJson: [],
        publishedJson: undefined,
        published: false,
        layoutType: 'default',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setPageData(newPageData);
      setFormData({
        title: newPageData.title,
        slug: newPageData.slug,
        metaDescription: '',
        published: false
      });
      setLoading(false);
    }
  }, [pageId]);

  const fetchPage = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/pages/${pageId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar la página');
      }

      const pageResponse = await response.json();
      setPage(pageResponse);
      
      // Convert to PageData format
      let blocks: BlockData[] = [];
      
      // Check if we have JSON data first
      if (pageResponse.draftJson && Array.isArray(pageResponse.draftJson)) {
        blocks = pageResponse.draftJson;
      } else if (pageResponse.content) {
        // Migrate HTML content to blocks
        blocks = migrateHtmlToJson(pageResponse.content);
        toast.info('Contenido HTML migrado a bloques automáticamente');
      }

      const convertedPageData: PageData = {
        id: pageResponse.id,
        title: pageResponse.title,
        slug: pageResponse.slug,
        draftJson: blocks,
        publishedJson: pageResponse.publishedJson || undefined,
        published: pageResponse.published,
        layoutType: 'default',
        createdAt: pageResponse.createdAt,
        updatedAt: pageResponse.updatedAt,
      };

      setPageData(convertedPageData);
      setFormData({
        title: pageResponse.title || '',
        slug: pageResponse.slug || '',
        metaDescription: pageResponse.metaDescription || '',
        published: pageResponse.published || false
      });
    } catch (err) {
      console.error('Error fetching page:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = useCallback(async (updatedPageData: PageData) => {
    try {
      setSaving(true);
      setError(null);

      const token = localStorage.getItem('adminToken');
      const url = pageId && pageId !== 0
        ? `/api/admin/pages/${pageId}`
      : '/api/admin/pages';
      
      const method = pageId && pageId !== 0 ? 'PUT' : 'POST';

      // Prepare data for API
      const apiData = {
        title: formData.title,
        slug: formData.slug,
        metaDescription: formData.metaDescription,
        published: formData.published,
        draftJson: updatedPageData.draftJson,
        publishedJson: formData.published ? updatedPageData.draftJson : updatedPageData.publishedJson
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(apiData)
      });

      if (!response.ok) {
        throw new Error('Error al guardar la página');
      }

      const savedPage = await response.json();
      setPage(savedPage);
      
      // Update pageData with saved information
      const updatedData: PageData = {
        ...updatedPageData,
        id: savedPage.id,
        title: formData.title,
        slug: formData.slug,
        published: formData.published,
        updatedAt: new Date().toISOString(),
      };
      
      setPageData(updatedData);
      
      if (onSave) {
        await onSave(updatedData);
      }
      
      toast.success('Página guardada exitosamente');
      
      // If it's a new page, update the URL
      if (!pageId || pageId === 0) {
        window.history.replaceState(null, '', `/admin/editor/${savedPage.id}`);
      }
    } catch (err) {
      console.error('Error saving page:', err);
      setError(err instanceof Error ? err.message : 'Error al guardar');
      toast.error('Error al guardar la página');
    } finally {
      setSaving(false);
    }
  }, [pageId, formData, onSave]);

  const handlePreview = useCallback((previewData: PageData) => {
    setPageData(previewData);
    setViewMode('preview');
  }, []);

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
                onClick={onBack}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Volver al Dashboard
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                {pageId && pageId !== 0 ? `Editando: ${formData.title || 'Página'}` : 'Nueva Página'}
              </h1>
            </div>
            
            {/* View Mode Selector */}
            <div className="flex items-center space-x-2">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('editor')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    viewMode === 'editor'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Settings className="h-4 w-4 mr-1 inline" />
                  Editor
                </button>
                <button
                  onClick={() => setViewMode('preview')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    viewMode === 'preview'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Eye className="h-4 w-4 mr-1 inline" />
                  Vista Previa
                </button>
                <button
                  onClick={() => setViewMode('code')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    viewMode === 'code'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Code className="h-4 w-4 mr-1 inline" />
                  JSON
                </button>
              </div>
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

      {/* Page Settings */}
      {viewMode === 'editor' && (
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Título de la página"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleFormChange('slug', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="url-de-la-pagina"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Descripción
                </label>
                <input
                  type="text"
                  value={formData.metaDescription}
                  onChange={(e) => handleFormChange('metaDescription', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descripción para SEO"
                />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.published}
                  onChange={(e) => handleFormChange('published', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Publicar página</span>
              </label>
              <Button
                onClick={() => pageData && handleSave(pageData)}
                disabled={saving}
                className="flex items-center"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {viewMode === 'editor' && pageData && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <BlockEditor
              initialData={pageData}
              onSave={handleSave}
              onPreview={handlePreview}
            />
          </div>
        )}

        {viewMode === 'preview' && pageData && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Vista Previa</h2>
              <PageRenderer pageData={pageData} />
            </div>
          </div>
        )}

        {viewMode === 'code' && pageData && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Estructura JSON</h2>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(pageData.draftJson, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPageEditor;