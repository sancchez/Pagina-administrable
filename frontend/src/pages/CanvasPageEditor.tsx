import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CanvasEditor } from '../components/editor/CanvasEditor';
import { CanvasPage } from '../types/canvas';
import { migrateToCanvasFormat } from '../utils/canvasMigrator';
import { convertPublicPageToCanvas } from '../utils/pageToCanvas';
import { getPageById, updatePage } from '../utils/database';

interface PageData {
  id: number;
  title: string;
  slug: string;
  content: string;
  metaDescription?: string;
  published: boolean;
  draftJson?: any;
  publishedJson?: any;
  createdAt: string;
  updatedAt: string;
}

export const CanvasPageEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVersions, setShowVersions] = useState(false);
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [canvasPage, setCanvasPage] = useState<CanvasPage | null>(null);
  const [migrationStatus, setMigrationStatus] = useState<'pending' | 'migrating' | 'completed' | 'error'>('pending');

  // Cargar datos de la página
  useEffect(() => {
    const loadPage = async () => {
      console.log('🔄 [CanvasPageEditor] Iniciando carga de página con ID:', id);
      console.log('🔄 [CanvasPageEditor] Tipo de ID:', typeof id);
      console.log('🔄 [CanvasPageEditor] ID parseado:', parseInt(id as string));
      console.log('🔍 [CanvasPageEditor] ID value:', JSON.stringify(id));
      console.log('🔍 [CanvasPageEditor] URL params:', window.location.pathname);
      
      if (!id) {
        console.error('❌ [CanvasPageEditor] ID de página no válido');
        setError('ID de página no válido');
        setLoading(false);
        return;
      }

      // Caso especial para prueba directa del editor
      if (id === 'home-test') {
        console.log('🎨 [CanvasPageEditor] Modo de prueba detectado, convirtiendo página de inicio...');
        try {
          setLoading(true);
          const convertedPage = convertPublicPageToCanvas('home');
          console.log('✅ [CanvasPageEditor] Página de prueba convertida exitosamente:', convertedPage);
          
          setCanvasPage(convertedPage);
          setMigrationStatus('completed');
          setLoading(false);
          return;
        } catch (conversionError) {
          console.error('❌ [CanvasPageEditor] Error convirtiendo página de prueba:', conversionError);
          setError('Error al convertir la página de prueba');
          setLoading(false);
          return;
        }
      }

      try {
        setLoading(true);
        console.log('📡 [CanvasPageEditor] Llamando getPageById con ID:', parseInt(id));
        console.log('🔍 [CanvasPageEditor] Calling getPageById with raw ID:', id);
        console.log('🔍 [CanvasPageEditor] Calling getPageById with parsed ID:', parseInt(id));
        const page = await getPageById(parseInt(id));
        console.log('📄 [CanvasPageEditor] Página obtenida:', page);
        
        if (!page) {
          console.error('❌ [CanvasPageEditor] Página no encontrada para ID:', id);
          console.log('🔄 [CanvasPageEditor] Intentando convertir desde página pública...');
          
          // Intentar convertir desde página pública
          try {
            const publicPageId = getPublicPageIdFromEditorId(id);
            console.log('🔍 [CanvasPageEditor] ID de página pública detectado:', publicPageId);
            
            if (publicPageId) {
              const convertedPage = convertPublicPageToCanvas(publicPageId);
              console.log('✅ [CanvasPageEditor] Página pública convertida exitosamente:', convertedPage);
              
              setCanvasPage(convertedPage);
              setMigrationStatus('completed');
              setLoading(false);
              return;
            }
          } catch (conversionError) {
            console.error('❌ [CanvasPageEditor] Error convirtiendo página pública:', conversionError);
          }
          
          setError(`Página con ID ${id} no encontrada. Verifica que el ID sea correcto o crea una nueva página.`);
          setLoading(false);
          return;
        }

        console.log('✅ [CanvasPageEditor] Página cargada exitosamente:', {
          id: page.id,
          title: page.title,
          slug: page.slug,
          hasDraftJson: !!page.draftJson,
          draftJsonType: typeof page.draftJson,
          hasBlocks: page.draftJson?.blocks ? Array.isArray(page.draftJson.blocks) : false
        });
        
        setPageData(page);
        
        // Verificar si ya está en formato Canvas
        if (page.draftJson && page.draftJson.blocks && Array.isArray(page.draftJson.blocks)) {
          console.log('✅ [CanvasPageEditor] Página ya está en formato Canvas, bloques encontrados:', page.draftJson.blocks.length);
          // Ya está en formato Canvas
          setCanvasPage(page.draftJson as CanvasPage);
          setMigrationStatus('completed');
        } else {
          console.log('🔄 [CanvasPageEditor] Página necesita migración a formato Canvas');
          // Necesita migración
          setMigrationStatus('migrating');
          
          try {
            // Primero intentar convertir desde página pública si es posible
            const publicPageId = getPublicPageIdFromSlug(page.slug);
            if (publicPageId) {
              console.log('🔄 [CanvasPageEditor] Convirtiendo desde página pública:', publicPageId);
              const convertedPage = convertPublicPageToCanvas(publicPageId);
              console.log('✅ [CanvasPageEditor] Conversión desde página pública exitosa:', convertedPage);
              
              setCanvasPage(convertedPage);
              setMigrationStatus('completed');
              
              // Guardar la versión convertida
              await updatePage(page.id, {
                ...page,
                draftJson: convertedPage,
                updatedAt: new Date().toISOString()
              });
              
              console.log('✅ [CanvasPageEditor] Página convertida y guardada exitosamente');
              return;
            }
            
            console.log('🔄 [CanvasPageEditor] Iniciando migración de página');
            const migrationResult = migrateToCanvasFormat(page);
            console.log('📊 [CanvasPageEditor] Resultado de migración:', migrationResult);
            
            if (!migrationResult.success || !migrationResult.page) {
              throw new Error(migrationResult.errors?.join(', ') || 'Error en la migración');
            }
            
            const migratedPage = migrationResult.page;
            console.log('✅ [CanvasPageEditor] Migración exitosa, página migrada:', {
              id: migratedPage.id,
              title: migratedPage.title,
              blocksCount: migratedPage.blocks.length
            });
            
            setCanvasPage(migratedPage);
            setMigrationStatus('completed');
            
            console.log('💾 [CanvasPageEditor] Guardando página migrada automáticamente...');
            // Guardar automáticamente la versión migrada
            await updatePage(page.id, {
              ...page,
              draftJson: migratedPage,
              updatedAt: new Date().toISOString()
            });
            
            console.log('✅ [CanvasPageEditor] Página migrada y guardada exitosamente');
          } catch (migrationError) {
            console.error('❌ [CanvasPageEditor] Error durante la migración:', migrationError);
            setError('Error al migrar la página al nuevo formato');
            setMigrationStatus('error');
          }
        }
      } catch (err) {
        console.error('❌ [CanvasPageEditor] Error cargando página:', err);
        setError('Error al cargar la página');
      } finally {
        setLoading(false);
        console.log('🏁 [CanvasPageEditor] Proceso de carga finalizado');
      }
    };

    loadPage();
  }, [id]);

  // Función auxiliar para mapear ID del editor a ID de página pública
  const getPublicPageIdFromEditorId = (editorId: string): string | null => {
    const idMap: Record<string, string> = {
      '1': 'home',
      '2': 'quienes-somos',
      '3': 'contacto',
      '4': 'informacion-esal',
      '5': 'operacion-gestion',
      '6': 'normatividad'
    };
    
    return idMap[editorId] || null;
  };

  // Función auxiliar para mapear slug a ID de página pública
  const getPublicPageIdFromSlug = (slug: string): string | null => {
    const slugMap: Record<string, string> = {
      'inicio': 'home',
      'home': 'home',
      'quienes-somos': 'quienes-somos',
      'contacto': 'contacto',
      'informacion-esal': 'informacion-esal',
      'operacion-gestion': 'operacion-gestion',
      'normatividad': 'normatividad'
    };
    
    return slugMap[slug] || null;
  };

  // Manejar guardado
  const handleSave = async (updatedCanvasPage: CanvasPage) => {
    if (!pageData) return;

    try {
      setSaving(true);
      setError(null);
      
      const updatedPage = {
        ...pageData,
        draftJson: updatedCanvasPage,
        updatedAt: new Date().toISOString()
      };

      await updatePage(pageData.id, updatedPage);
      setPageData(updatedPage);
      setCanvasPage(updatedCanvasPage);
      
      console.log('Página guardada exitosamente en la base de datos');
    } catch (err) {
      console.error('Error guardando página:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al guardar la página';
      setError(errorMessage);
      throw err; // Re-throw para que el CanvasEditor pueda manejar el error
    } finally {
      setSaving(false);
    }
  };

  // Manejar restauración de versión
  const handleRestoreVersion = async (version: any) => {
    if (!confirm('¿Estás seguro de que quieres restaurar esta versión? Los cambios no guardados se perderán.')) {
      return;
    }

    try {
      setCanvasPage(version.canvasData);
      setPageData({
        ...pageData!,
        draftJson: version.canvasData
      });
      console.log('Versión restaurada exitosamente');
    } catch (err) {
      console.error('Error restaurando versión:', err);
      setError('Error al restaurar la versión');
    }
  };

  // Manejar publicación de versión
  const handlePublishVersion = async (version: any) => {
    if (!confirm('¿Estás seguro de que quieres publicar esta versión?')) {
      return;
    }

    try {
      const response = await fetch(`/api/pages/${id}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          versionId: version.id,
          canvasData: version.canvasData
        }),
      });

      if (!response.ok) {
        throw new Error('Error al publicar la versión');
      }

      console.log('Versión publicada exitosamente');
    } catch (err) {
      console.error('Error publicando versión:', err);
      setError('Error al publicar la versión');
    }
  };

  // Manejar navegación de vuelta
  const handleBack = () => {
    navigate('/admin');
  };

  // Estados de carga
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Cargando Editor</h2>
          <p className="text-gray-600">
            {migrationStatus === 'migrating' 
              ? 'Migrando página al nuevo formato...'
              : 'Preparando el editor visual...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center max-w-md">
          <div className="mb-4">
            <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Reintentar
            </button>
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!canvasPage || !pageData) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Datos no disponibles</h2>
          <p className="text-gray-600 mb-4">No se pudieron cargar los datos de la página.</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Panel principal del editor */}
      <div className="flex-1 flex flex-col">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {(() => {
          console.log('🎨 [CanvasPageEditor] Rendering CanvasEditor with:', {
            canvasPage: {
              id: canvasPage?.id,
              title: canvasPage?.title,
              blocksCount: canvasPage?.blocks?.length || 0,
              blocks: canvasPage?.blocks?.map(b => ({
                id: b.id,
                type: b.type,
                content: b.content?.substring(0, 30)
              })) || []
            },
            saving,
            readOnly: saving
          });
          return (
            <CanvasEditor
              page={canvasPage}
              onSave={handleSave}
              onBack={handleBack}
              readOnly={saving}
            />
          );
        })()}
      </div>
      
      {/* Panel lateral de versiones - Temporalmente deshabilitado */}
      <div className={`transition-all duration-300 ${showVersions ? 'w-80' : 'w-0'} overflow-hidden`}>
        {showVersions && (
          <div className="h-full border-l border-gray-200 p-4">
            <h3 className="text-lg font-semibold mb-4">Versiones</h3>
            <p className="text-gray-600">Panel de versiones en desarrollo</p>
          </div>
        )}
      </div>
      
      {/* Botón toggle para versiones */}
      <button
        onClick={() => setShowVersions(!showVersions)}
        className={`fixed right-4 top-1/2 transform -translate-y-1/2 z-50 p-3 bg-white border border-gray-200 rounded-l-lg shadow-lg hover:bg-gray-50 transition-all ${
          showVersions ? 'translate-x-0' : 'translate-x-0'
        }`}
        title={showVersions ? 'Ocultar versiones' : 'Mostrar versiones'}
      >
        <svg
          className={`h-5 w-5 text-gray-600 transition-transform ${showVersions ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </div>
  );
};