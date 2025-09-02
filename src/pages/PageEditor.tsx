import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Clock } from 'lucide-react';
import ProfessionalEditor from '../components/editor/ProfessionalEditor';
import PageVersionManager from '../components/admin/PageVersionManager';

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

  const createOriginalVersionIfNeeded = async (pageId: number) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:3001/api/page-versions/page/${pageId}/original`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Versión original creada/verificada:', result.message);
      } else {
        console.log('ℹ️ Versión original ya existe o no se pudo crear');
      }
    } catch (error) {
      console.error('❌ Error al crear versión original:', error);
    }
  };

  const fetchPage = async () => {
    try {
      console.log('🔍 PageEditor: Fetching page with ID:', id);
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
      console.log('📄 PageEditor: Page data received:', pageData);
      console.log('📝 PageEditor: Content from API:', pageData.content);
      
      setPage(pageData);
      const newFormData = {
        title: pageData.title || '',
        slug: pageData.slug || '',
        content: pageData.content || '',
        metaDescription: pageData.metaDescription || '',
        published: pageData.published || false
      };
      
      console.log('📋 PageEditor: Setting formData:', newFormData);
      console.log('🎯 PageEditor: Content being set:', newFormData.content);
      setFormData(newFormData);
      
      // Crear versión original automáticamente si no existe
      await createOriginalVersionIfNeeded(pageData.id);
    } catch (err) {
      console.error('❌ PageEditor: Error fetching page:', err);
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  // Remover esta función no utilizada:
  // const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  //   const { name, value, type } = e.target;
  //   setFormData(prev => ({
  //     ...prev,
  //     [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
  //   }));
  // };

  const handleContentChange = (content: string) => {
    console.log('✏️ PageEditor: Content changed, new content:', content);
    setFormData(prev => ({ ...prev, content }));
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
                {id === 'new' ? 'Nueva Página' : `Editando: ${page?.title || 'Página'}`}
              </h1>
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
        <div className="relative">
          {/* Editor - Centrado */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {(() => {
              console.log('🎨 PageEditor: Rendering ProfessionalEditor with content:', formData.content);
              console.log('📊 PageEditor: FormData state:', formData);
              return null;
            })()}
            <ProfessionalEditor
              content={formData.content}
              onChange={handleContentChange}
              onSave={handleSave}
              saving={saving}
            />
          </div>
          
          {/* Version Manager - Esquina superior derecha */}
          <div className="absolute top-4 right-4 z-50">
            <PageVersionManager 
              pageId={page?.id} 
              onVersionRestore={() => {
                // Recargar la página después de restaurar una versión
                if (page?.id) {
                  fetchPage();
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageEditor;