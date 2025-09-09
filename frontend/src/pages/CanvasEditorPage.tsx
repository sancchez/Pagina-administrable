import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CanvasEditor } from '../components/editor/CanvasEditor';
import { CanvasPage } from '../types/canvas';
import { migrateToCanvasFormat } from '../utils/canvasMigrator';
import { convertPublicPageToCanvas } from '../utils/pageToCanvas';
import { ArrowLeft, Save, Eye, Settings } from 'lucide-react';

interface PageData {
  id: number;
  title: string;
  slug: string;
  content: any;
  published: boolean;
  metaDescription?: string;
  updatedAt: string;
}

export default function CanvasEditorPage() {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState<CanvasPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    if (!token) {
      navigate('/admin');
      return;
    }

    if (pageId && pageId !== 'new') {
      fetchPage();
    } else {
      // Crear nueva página
      createNewPage();
    }
  }, [pageId, token, navigate]);

  const fetchPage = async () => {
    try {
      console.log('🔍 [CanvasEditorPage] Fetching page:', pageId);
      const response = await fetch(`http://localhost:3001/api/admin/pages/${pageId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const pageData: PageData = await response.json();
        console.log('📄 [CanvasEditorPage] Page data from API:', pageData);
        console.log('📄 [CanvasEditorPage] Content structure:', pageData.content);
        
        // Usar el migrador para convertir correctamente el contenido
        let canvasPage: CanvasPage;
        
        // Si ya tiene contenido en formato canvas, usarlo directamente
        if (pageData.content?.blocks && Array.isArray(pageData.content.blocks)) {
          console.log('📄 [CanvasEditorPage] Using existing canvas blocks');
          canvasPage = {
            id: pageData.id.toString(),
            title: pageData.title,
            slug: pageData.slug,
            blocks: pageData.content.blocks,
            settings: pageData.content.settings || {
              width: 1200,
              height: 800,
              backgroundColor: '#ffffff',
              padding: { top: 20, right: 20, bottom: 20, left: 20 },
              responsive: true,
              seo: {
                title: pageData.title,
                description: pageData.metaDescription || '',
                keywords: []
              }
            },
            status: pageData.published ? 'published' : 'draft',
            version: 1,
            metadata: {
              createdAt: pageData.updatedAt,
              updatedAt: pageData.updatedAt,
              publishedAt: pageData.published ? pageData.updatedAt : undefined,
              createdBy: 'admin',
              lastEditedBy: 'admin'
            }
          };
        } else {
          console.log('📄 [CanvasEditorPage] Migrating content to canvas format');
          // Usar el migrador para convertir contenido existente
          const migrationResult = migrateToCanvasFormat(pageData);
          
          if (migrationResult.success && migrationResult.page) {
            canvasPage = migrationResult.page;
            console.log('✅ [CanvasEditorPage] Migration successful');
          } else {
            console.log('⚠️ [CanvasEditorPage] Migration failed, using page converter');
            // Fallback: usar el convertidor de páginas públicas
            canvasPage = convertPublicPageToCanvas(pageData.slug);
            canvasPage.id = pageData.id.toString();
            canvasPage.title = pageData.title;
          }
        }
        
        console.log('🎨 [CanvasEditorPage] Converted canvas page:', canvasPage);
        console.log('🧱 [CanvasEditorPage] Blocks count:', canvasPage.blocks.length);
        setPage(canvasPage);
      } else {
        console.error('Error fetching page');
        navigate('/admin/dashboard');
      }
    } catch (error) {
      console.error('Error fetching page:', error);
      navigate('/admin/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const createNewPage = () => {
    const newPage: CanvasPage = {
      id: 'new',
      title: 'Nueva Página',
      slug: 'nueva-pagina',
      blocks: [],
      settings: {
        width: 1200,
        height: 800,
        backgroundColor: '#ffffff',
        padding: { top: 20, right: 20, bottom: 20, left: 20 },
        responsive: true,
        seo: {
          title: 'Nueva Página',
          description: '',
          keywords: []
        }
      },
      status: 'draft',
      version: 1,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'admin',
        lastEditedBy: 'admin'
      }
    };
    
    setPage(newPage);
    setIsLoading(false);
  };

  const handleSave = async (updatedPage: CanvasPage) => {
    setIsSaving(true);
    
    try {
      const pageData = {
        title: updatedPage.title,
        slug: updatedPage.slug,
        content: {
          blocks: updatedPage.blocks,
          settings: updatedPage.settings
        },
        published: updatedPage.status === 'published',
        metaDescription: updatedPage.settings.seo.description
      };

      const url = pageId === 'new' 
        ? 'http://localhost:3001/api/admin/pages'
        : `http://localhost:3001/api/admin/pages/${pageId}`;
      
      const method = pageId === 'new' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(pageData),
      });

      if (response.ok) {
        const savedPage = await response.json();
        
        // Si era una página nueva, redirigir al editor con el ID real
        if (pageId === 'new') {
          navigate(`/admin/editor/${savedPage.id}`, { replace: true });
        }
        
        setLastSaved(new Date());
        setPage(updatedPage);
        
        // Mostrar notificación de éxito
        console.log('Página guardada exitosamente');
      } else {
        console.error('Error saving page');
        alert('Error al guardar la página');
      }
    } catch (error) {
      console.error('Error saving page:', error);
      alert('Error al guardar la página');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    navigate('/admin/dashboard');
  };

  const handlePreview = () => {
    if (page && page.slug) {
      const url = page.slug === 'home' ? '/' : `/${page.slug}`;
      window.open(url, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando editor...</p>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Error al cargar la página</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header del editor */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Volver</span>
            </button>
            
            <div className="h-6 w-px bg-gray-300" />
            
            <div>
              <h1 className="text-xl font-semibold text-gray-800">{page.title}</h1>
              <p className="text-sm text-gray-500">/{page.slug}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {lastSaved && (
              <span className="text-sm text-gray-500">
                Guardado {lastSaved.toLocaleTimeString()}
              </span>
            )}
            
            <button
              onClick={handlePreview}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <Eye className="h-4 w-4" />
              <span>Vista previa</span>
            </button>
            
            <button
              onClick={() => handleSave(page)}
              disabled={isSaving}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? 'Guardando...' : 'Guardar'}</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Editor Canvas */}
      <div className="h-[calc(100vh-80px)]">
        <CanvasEditor
          page={page}
          onSave={handleSave}
          onBack={handleBack}
        />
      </div>
    </div>
  );
}