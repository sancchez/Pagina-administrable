import React, { useState, useEffect } from 'react';
import { Upload, CheckCircle, XCircle, AlertCircle, Trash2, RefreshCw } from 'lucide-react';
import { renderTsxToHtml, extractGrapesJSData, getPageMetadata } from '../utils/tsxRenderer';

interface StaticPage {
  slug: string;
  name: string;
  component: string;
}

interface DynamicPage {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  createdAt: string;
}

interface MigrationStatus {
  [key: string]: 'pending' | 'migrating' | 'success' | 'error';
}

const PageMigration: React.FC = () => {
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus>({});
  const [dynamicPages, setDynamicPages] = useState<DynamicPage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lista de páginas estáticas disponibles
  const staticPages: StaticPage[] = [
    { slug: 'home', name: 'Página de Inicio', component: 'HomePage' },
    { slug: 'quienes-somos', name: 'Quiénes Somos', component: 'QuienesSomos' },
    { slug: 'contacto', name: 'Contacto', component: 'Contacto' },
    { slug: 'informacion-esal', name: 'Información ESAL', component: 'InformacionESAL' },
    { slug: 'normatividad', name: 'Normatividad', component: 'Normatividad' },
    { slug: 'operacion-gestion', name: 'Operación y Gestión', component: 'OperacionGestion' },
    { slug: 'portal-usuario', name: 'Portal Usuario', component: 'PortalUsuario' },
    { slug: 'invoice', name: 'Facturación', component: 'InvoicePage' },
    { slug: 'invoice-query', name: 'Consulta de Facturas', component: 'InvoiceQuery' }
  ];

  // Cargar páginas dinámicas existentes
  const loadDynamicPages = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/pages/published');
      
      if (response.ok) {
        const data = await response.json();
        setDynamicPages(data.data || []);
      } else {
        throw new Error('Error al cargar páginas dinámicas');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDynamicPages();
  }, []);

  const updateStatus = (slug: string, status: MigrationStatus[string]) => {
    setMigrationStatus(prev => ({ ...prev, [slug]: status }));
  };

  // Función para generar componentes y estilos de GrapesJS apropiados
  const generateGrapesJSData = (page: StaticPage) => {
    // Generar componentes estructurados para GrapesJS
    const gjsComponents = [
      {
        type: 'wrapper',
        components: [
          {
            type: 'container',
            classes: ['main-container'],
            components: [
              {
                type: 'text',
                tagName: 'h1',
                classes: ['page-title'],
                components: [{ type: 'textnode', content: page.name }]
              },
              {
                type: 'text',
                tagName: 'p',
                classes: ['migration-info'],
                components: [{ 
                  type: 'textnode', 
                  content: `Esta página ha sido migrada desde el componente estático ${page.component}.` 
                }]
              },
              {
                type: 'text',
                tagName: 'p',
                classes: ['editor-info'],
                components: [{ 
                  type: 'textnode', 
                  content: 'Puedes editarla usando el editor GrapesJS. Agrega más contenido, imágenes, botones y personaliza el diseño.' 
                }]
              },
              {
                type: 'container',
                classes: ['content-section'],
                components: [
                  {
                    type: 'text',
                    tagName: 'h2',
                    classes: ['section-title'],
                    components: [{ type: 'textnode', content: 'Contenido de la Página' }]
                  },
                  {
                    type: 'text',
                    tagName: 'p',
                    classes: ['section-text'],
                    components: [{ 
                      type: 'textnode', 
                      content: 'Aquí puedes agregar el contenido específico de esta página. Utiliza el editor para personalizar completamente el diseño.' 
                    }]
                  }
                ]
              }
            ]
          }
        ]
      }
    ];

    // Generar estilos estructurados para GrapesJS
    const gjsStyles = [
      {
        selectors: [{ name: 'main-container', type: 1 }],
        style: {
          'max-width': '1200px',
          'margin': '0 auto',
          'padding': '40px 20px',
          'font-family': 'system-ui, -apple-system, sans-serif'
        }
      },
      {
        selectors: [{ name: 'page-title', type: 1 }],
        style: {
          'color': '#2563eb',
          'text-align': 'center',
          'margin-bottom': '30px',
          'font-size': '2.5rem',
          'font-weight': 'bold',
          'line-height': '1.2'
        }
      },
      {
        selectors: [{ name: 'migration-info', type: 1 }],
        style: {
          'font-size': '1.1rem',
          'text-align': 'center',
          'color': '#6b7280',
          'margin-bottom': '20px',
          'line-height': '1.6'
        }
      },
      {
        selectors: [{ name: 'editor-info', type: 1 }],
        style: {
          'font-size': '1rem',
          'text-align': 'center',
          'color': '#9ca3af',
          'margin-bottom': '40px',
          'font-style': 'italic'
        }
      },
      {
        selectors: [{ name: 'content-section', type: 1 }],
        style: {
          'background-color': '#f9fafb',
          'padding': '30px',
          'border-radius': '8px',
          'border': '1px solid #e5e7eb'
        }
      },
      {
        selectors: [{ name: 'section-title', type: 1 }],
        style: {
          'color': '#374151',
          'margin-bottom': '20px',
          'font-size': '1.5rem',
          'font-weight': '600'
        }
      },
      {
        selectors: [{ name: 'section-text', type: 1 }],
        style: {
          'color': '#6b7280',
          'line-height': '1.6',
          'font-size': '1rem'
        }
      }
    ];

    return { gjsComponents, gjsStyles };
  };

  const migratePage = async (page: StaticPage) => {
    updateStatus(page.slug, 'migrating');
    
    try {
      // Renderizar el componente TSX a HTML real
      const renderedHtml = renderTsxToHtml(page.slug);
      console.log(`📄 HTML renderizado para ${page.slug}:`, renderedHtml.substring(0, 200));
      
      // Extraer componentes y estilos de GrapesJS desde el HTML renderizado
      const { gjsComponents, gjsStyles } = extractGrapesJSData(renderedHtml);
      console.log(`🎨 Datos GrapesJS extraídos para ${page.slug}:`, { 
        componentsCount: gjsComponents.length, 
        stylesCount: gjsStyles.length 
      });
      
      // Obtener metadatos de la página
      const metadata = getPageMetadata(page.slug);
      
      // Crear página dinámica con datos completos de GrapesJS
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: metadata.title,
          slug: page.slug,
          gjsHtml: renderedHtml, // HTML real renderizado desde TSX
          gjsCss: '', // Los estilos están en los gjsStyles
          gjsComponents: JSON.stringify(gjsComponents), // Componentes extraídos por GrapesJS
          gjsStyles: JSON.stringify(gjsStyles), // Estilos extraídos por GrapesJS
          html: renderedHtml, // Para compatibilidad
          css: '',   // Para compatibilidad
          metaTitle: metadata.metaTitle,
          metaDescription: metadata.metaDescription,
          metaKeywords: metadata.metaKeywords,
          isPublished: true
        })
      });

      if (response.ok) {
        updateStatus(page.slug, 'success');
        console.log(`✅ Página ${page.slug} migrada exitosamente`);
        await loadDynamicPages(); // Recargar la lista
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al migrar la página');
      }
    } catch (err) {
      console.error(`❌ Error migrando página ${page.slug}:`, err);
      updateStatus(page.slug, 'error');
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const deleteDynamicPage = async (pageId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/pages/${pageId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadDynamicPages(); // Recargar la lista
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar la página');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  const migrateAllPages = async () => {
    for (const page of staticPages) {
      if (migrationStatus[page.slug] !== 'success') {
        await migratePage(page);
        // Pequeña pausa entre migraciones
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  };

  const getStatusIcon = (status: MigrationStatus[string]) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'migrating':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: MigrationStatus[string]) => {
    switch (status) {
      case 'success':
        return 'Migrada';
      case 'error':
        return 'Error';
      case 'migrating':
        return 'Migrando...';
      default:
        return 'Pendiente';
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Migración de Páginas
        </h1>
        <p className="text-gray-600">
          Convierte páginas estáticas de React a páginas dinámicas editables con GrapesJS
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <XCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Páginas Estáticas */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Páginas Estáticas
            </h2>
            <p className="text-gray-600 text-sm">
              Páginas React que pueden ser migradas a dinámicas
            </p>
          </div>
          
          <div className="p-6">
            <div className="mb-4">
              <button
                onClick={migrateAllPages}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Upload className="w-4 h-4 mr-2" />
                Migrar Todas las Páginas
              </button>
            </div>

            <div className="space-y-3">
              {staticPages.map((page) => (
                <div
                  key={page.slug}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{page.name}</h3>
                    <p className="text-sm text-gray-500">/{page.slug}</p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(migrationStatus[page.slug])}
                      <span className="text-sm text-gray-600">
                        {getStatusText(migrationStatus[page.slug])}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => migratePage(page)}
                      disabled={isLoading || migrationStatus[page.slug] === 'migrating'}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Migrar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Páginas Dinámicas */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Páginas Dinámicas
                </h2>
                <p className="text-gray-600 text-sm">
                  Páginas existentes en la base de datos
                </p>
              </div>
              <button
                onClick={loadDynamicPages}
                disabled={isLoading}
                className="bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {dynamicPages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No hay páginas dinámicas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dynamicPages.map((page) => (
                  <div
                    key={page.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{page.title}</h3>
                      <p className="text-sm text-gray-500">/{page.slug}</p>
                      <p className="text-xs text-gray-400">
                        {page.isPublished ? 'Publicada' : 'Borrador'} • {new Date(page.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <a
                        href={`/admin/dashboard/editor/${page.slug}`}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        Editar
                      </a>
                      <button
                        onClick={() => deleteDynamicPage(page.id)}
                        disabled={isLoading}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageMigration;