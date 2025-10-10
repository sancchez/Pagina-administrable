import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import HttpClient from '../utils/http';
import { 
  Database, 
  Download, 
  Upload, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw,
  Trash2,
  Calendar,
  FileText,
  ArrowLeft
} from 'lucide-react';

interface PageBackup {
  id: string;
  pageId: string;
  title: string;
  content?: string;
  grapesData?: any;
  createdAt: string;
  version: number;
}

interface Page {
  id: string;
  title: string;
  slug?: string;
  status: string;
  updatedAt: string;
}

export default function BackupManager() {
  const { user, isAuthenticated } = useAuth();
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [backups, setBackups] = useState<PageBackup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [previewBackup, setPreviewBackup] = useState<PageBackup | null>(null);
  const [compareBackup, setCompareBackup] = useState<PageBackup | null>(null);
  const [currentPageContent, setCurrentPageContent] = useState<{ html?: string | null; css?: string | null; gjsHtml?: string | null; gjsCss?: string | null } | null>(null);

  useEffect(() => {
    fetchPages();
  }, []);

  useEffect(() => {
    if (selectedPage) {
      fetchBackups(selectedPage.id);
    }
  }, [selectedPage]);

  const fetchPages = async () => {
    try {
      setIsLoading(true);
      const response = await HttpClient.get('/pages');
      
      if (response?.success) {
        setPages(response.data?.pages || response.pages || []);
      } else if (Array.isArray(response)) {
        setPages(response);
      }
    } catch (error) {
      console.error('Error fetching pages:', error);
      showMessage('error', 'Error al cargar las páginas');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBackups = async (pageId: string) => {
    try {
      const response = await HttpClient.get(`/pages/${pageId}/backups`);
      
      if (response?.success) {
        setBackups(response.data || []);
      } else if (Array.isArray(response)) {
        setBackups(response);
      }
    } catch (error) {
      console.error('Error fetching backups:', error);
      showMessage('error', 'Error al cargar los backups');
    }
  };

  const createBackup = async (pageId: string) => {
    try {
      setIsCreatingBackup(true);
      const response = await HttpClient.post(`/pages/${pageId}/backups`, {});
      
      if (response?.success) {
        showMessage('success', 'Backup creado exitosamente');
        fetchBackups(pageId);
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      showMessage('error', 'Error al crear el backup');
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const restoreBackup = async (pageId: string, backupId: string) => {
    if (!confirm('¿Estás seguro de que quieres restaurar esta versión? Se creará un backup automático del estado actual.')) {
      return;
    }

    try {
      setIsRestoring(true);
      const response = await HttpClient.post(`/pages/${pageId}/restore/${backupId}`, {});
      
      if (response?.success) {
        showMessage('success', 'Página restaurada exitosamente');
        fetchBackups(pageId);
        fetchPages(); // Actualizar la lista de páginas
      }
    } catch (error) {
      console.error('Error restoring backup:', error);
      showMessage('error', 'Error al restaurar el backup');
    } finally {
      setIsRestoring(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-r from-blue-500 to-green-500 p-3 rounded-xl">
            <Database className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Backups</h1>
            <p className="text-gray-600">Administra las copias de seguridad de tus páginas</p>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center space-x-3 ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pages List */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Páginas</h2>
            <p className="text-sm text-gray-600">Selecciona una página para ver sus backups</p>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {pages.map((page) => (
              <button
                key={page.id}
                onClick={() => setSelectedPage(page)}
                className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  selectedPage?.id === page.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{page.title}</h3>
                    <p className="text-sm text-gray-600">/{page.slug || page.id}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      page.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {page.status === 'published' ? 'Publicada' : 'Borrador'}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Backups List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-200">
          {selectedPage ? (
            <>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Backups de "{selectedPage.title}"
                    </h2>
                    <p className="text-sm text-gray-600">
                      Historial de versiones y copias de seguridad
                    </p>
                  </div>
                  <button
                    onClick={() => createBackup(selectedPage.id)}
                    disabled={isCreatingBackup}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                  >
                    {isCreatingBackup ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    <span>{isCreatingBackup ? 'Creando...' : 'Crear Backup'}</span>
                  </button>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {backups.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {backups.map((backup) => (
                      <div key={backup.id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="bg-gray-100 p-2 rounded-lg">
                              <FileText className="h-5 w-5 text-gray-600" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">
                                Versión {backup.version}
                              </h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{formatDate(backup.createdAt)}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-4 w-4" />
                                  <span>Backup automático</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setPreviewBackup(backup)}
                              className="text-gray-700 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                              title="Vista previa"
                            >
                              <FileText className="h-4 w-4" />
                            </button>
                            <button
                              onClick={async () => {
                                setCompareBackup(backup);
                                try {
                                  const resp = await HttpClient.get(`/pages/${selectedPage.id}`);
                                  const page = resp?.data?.page || resp?.data || resp?.page || resp;
                                  setCurrentPageContent({
                                    html: page?.html,
                                    css: page?.css,
                                    gjsHtml: page?.gjsHtml,
                                    gjsCss: page?.gjsCss
                                  });
                                } catch (e) {
                                  console.error('Error obteniendo página actual para comparar', e);
                                  setCurrentPageContent(null);
                                }
                              }}
                              className="text-purple-700 hover:text-purple-900 p-2 rounded-lg hover:bg-purple-50 transition-colors"
                              title="Comparar con versión actual"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => restoreBackup(selectedPage.id, backup.id)}
                              disabled={isRestoring}
                              className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
                              title="Restaurar esta versión"
                            >
                              {isRestoring ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <Upload className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No hay backups disponibles
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Crea tu primer backup para comenzar a gestionar versiones
                    </p>
                    <button
                      onClick={() => createBackup(selectedPage.id)}
                      disabled={isCreatingBackup}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto disabled:opacity-50"
                    >
                      {isCreatingBackup ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      <span>{isCreatingBackup ? 'Creando...' : 'Crear Primer Backup'}</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <ArrowLeft className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Selecciona una página
              </h3>
              <p className="text-gray-600">
                Elige una página de la lista para ver y gestionar sus backups
              </p>
            </div>
          )}
        </div>
      </div>
      {previewBackup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Vista previa - Versión {previewBackup.version}</h3>
                <p className="text-sm text-gray-600">Creado: {formatDate(previewBackup.createdAt)}</p>
              </div>
              <button onClick={() => setPreviewBackup(null)} className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200">Cerrar</button>
            </div>
            <div className="h-[70vh]">
              <iframe
                title="Preview"
                className="w-full h-full"
                srcDoc={`<!DOCTYPE html>
<html>
<head>
  <meta charset='utf-8'/>
  <meta name='viewport' content='width=device-width, initial-scale=1'>
  <title>Vista previa - Versión ${previewBackup.version}</title>
  
  <!-- Fuentes y recursos externos -->
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Roboto', Arial, sans-serif;
    }
    
    /* Estilos base para iconos y elementos comunes */
    .icon, .bi {
      display: inline-block;
      width: 1em;
      height: 1em;
      vertical-align: -0.125em;
    }
    
    /* Soporte para gradientes en texto */
    .text-gradient {
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    /* Estilos específicos del backup */
    ${(previewBackup as any).gjsCss || (previewBackup as any).css || ''}
    
    /* Estilos para componentes GrapesJS */
    ${(() => {
      try {
        // Intentar parsear los estilos de GrapesJS si están disponibles
        const gjsStyles = (previewBackup as any).gjsStyles;
        if (gjsStyles) {
          const styles = JSON.parse(gjsStyles);
          if (Array.isArray(styles) && styles.length > 0) {
            return styles.map(style => {
              if (style.selectors && style.style) {
                const selectors = Array.isArray(style.selectors) 
                  ? style.selectors.join(', ') 
                  : style.selectors;
                
                const styleProps = Object.entries(style.style)
                  .map(([prop, value]) => `${prop}: ${value};`)
                  .join(' ');
                
                return `${selectors} { ${styleProps} }`;
              }
              return '';
            }).join('\n');
          }
        }
        return '';
      } catch (e) {
        console.error('Error parsing gjsStyles', e);
        return '';
      }
    })()}
  </style>
</head>
<body>
  ${(previewBackup as any).gjsHtml || (previewBackup as any).html || (previewBackup as any).content || ''}
  
  <!-- Script para asegurar que las imágenes, iconos y componentes se carguen correctamente -->
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      // Corregir rutas de imágenes relativas
      document.querySelectorAll('img').forEach(img => {
        if (img.src && img.src.startsWith('/')) {
          const originalSrc = img.src;
          img.onerror = function() {
            if (!this.dataset.tried) {
              this.dataset.tried = 'true';
              this.src = window.location.origin + originalSrc;
            }
          };
        }
      });
      
      // Aplicar estilos de componentes GrapesJS si están disponibles
      try {
        const gjsComponents = ${JSON.stringify((previewBackup as any).gjsComponents || '[]')};
        if (gjsComponents && gjsComponents !== '[]') {
          const components = typeof gjsComponents === 'string' ? JSON.parse(gjsComponents) : gjsComponents;
          if (Array.isArray(components)) {
            // Los componentes ya están renderizados en el HTML, solo necesitamos asegurar
            // que cualquier script o funcionalidad especial se inicialice correctamente
            components.forEach(comp => {
              if (comp.script) {
                try {
                  // Ejecutar scripts de componentes si existen
                  new Function(comp.script)();
                } catch (e) {
                  console.error('Error executing component script', e);
                }
              }
            });
          }
        }
      } catch (e) {
        console.error('Error processing GrapesJS components', e);
      }
    });
  </script>
</body>
</html>`}
              />
            </div>
          </div>
        </div>
      )}

      {compareBackup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[85vh] overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Comparar versión {compareBackup.version} vs actual</h3>
                <p className="text-sm text-gray-600">Backup: {formatDate(compareBackup.createdAt)}</p>
              </div>
              <button onClick={() => { setCompareBackup(null); setCurrentPageContent(null); }} className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200">Cerrar</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 h-[75vh]">
              <div className="border-r">
                <div className="p-2 text-sm font-medium">Backup</div>
                <iframe
                  title="Backup Preview"
                  className="w-full h-full"
                  srcDoc={`<!DOCTYPE html>
<html>
<head>
  <meta charset='utf-8'/>
  <meta name='viewport' content='width=device-width, initial-scale=1'>
  <title>Backup - Versión ${compareBackup.version}</title>
  
  <!-- Fuentes y recursos externos -->
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Roboto', Arial, sans-serif;
    }
    
    /* Estilos base para iconos y elementos comunes */
    .icon, .bi {
      display: inline-block;
      width: 1em;
      height: 1em;
      vertical-align: -0.125em;
    }
    
    /* Soporte para gradientes en texto */
    .text-gradient {
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    /* Estilos específicos del backup */
    ${(compareBackup as any).gjsCss || (compareBackup as any).css || ''}
    
    /* Estilos para componentes GrapesJS */
    ${(() => {
      try {
        // Intentar parsear los estilos de GrapesJS si están disponibles
        const gjsStyles = (compareBackup as any).gjsStyles;
        if (gjsStyles) {
          const styles = JSON.parse(gjsStyles);
          if (Array.isArray(styles) && styles.length > 0) {
            return styles.map(style => {
              if (style.selectors && style.style) {
                const selectors = Array.isArray(style.selectors) 
                  ? style.selectors.join(', ') 
                  : style.selectors;
                
                const styleProps = Object.entries(style.style)
                  .map(([prop, value]) => `${prop}: ${value};`)
                  .join(' ');
                
                return `${selectors} { ${styleProps} }`;
              }
              return '';
            }).join('\n');
          }
        }
        return '';
      } catch (e) {
        console.error('Error parsing gjsStyles', e);
        return '';
      }
    })()}
  </style>
</head>
<body>
  ${(compareBackup as any).gjsHtml || (compareBackup as any).html || (compareBackup as any).content || ''}
  
  <!-- Script para asegurar que las imágenes, iconos y componentes se carguen correctamente -->
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      // Corregir rutas de imágenes relativas
      document.querySelectorAll('img').forEach(img => {
        if (img.src && img.src.startsWith('/')) {
          const originalSrc = img.src;
          img.onerror = function() {
            if (!this.dataset.tried) {
              this.dataset.tried = 'true';
              this.src = window.location.origin + originalSrc;
            }
          };
        }
      });
      
      // Aplicar estilos de componentes GrapesJS si están disponibles
      try {
        const gjsComponents = ${JSON.stringify((compareBackup as any).gjsComponents || '[]')};
        if (gjsComponents && gjsComponents !== '[]') {
          const components = typeof gjsComponents === 'string' ? JSON.parse(gjsComponents) : gjsComponents;
          if (Array.isArray(components)) {
            // Los componentes ya están renderizados en el HTML, solo necesitamos asegurar
            // que cualquier script o funcionalidad especial se inicialice correctamente
            components.forEach(comp => {
              if (comp.script) {
                try {
                  // Ejecutar scripts de componentes si existen
                  new Function(comp.script)();
                } catch (e) {
                  console.error('Error executing component script', e);
                }
              }
            });
          }
        }
      } catch (e) {
        console.error('Error processing GrapesJS components', e);
      }
    });
  </script>
</body>
</html>`}
                />
              </div>
              <div>
                <div className="p-2 text-sm font-medium">Versión actual</div>
                <iframe
                  title="Current Version Preview"
                  className="w-full h-full"
                  srcDoc={`<!DOCTYPE html>
<html>
<head>
  <meta charset='utf-8'/>
  <meta name='viewport' content='width=device-width, initial-scale=1'>
  <title>Versión Actual</title>
  
  <!-- Fuentes y recursos externos -->
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Roboto', Arial, sans-serif;
    }
    
    /* Estilos base para iconos y elementos comunes */
    .icon, .bi {
      display: inline-block;
      width: 1em;
      height: 1em;
      vertical-align: -0.125em;
    }
    
    /* Soporte para gradientes en texto */
    .text-gradient {
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    /* Estilos específicos de la versión actual */
    ${currentPageContent?.gjsCss || currentPageContent?.css || ''}
    
    /* Estilos para componentes GrapesJS */
    ${(() => {
      try {
        // Intentar parsear los estilos de GrapesJS si están disponibles
        const gjsStyles = currentPageContent?.gjsStyles;
        if (gjsStyles) {
          const styles = JSON.parse(gjsStyles);
          if (Array.isArray(styles) && styles.length > 0) {
            return styles.map(style => {
              if (style.selectors && style.style) {
                const selectors = Array.isArray(style.selectors) 
                  ? style.selectors.join(', ') 
                  : style.selectors;
                
                const styleProps = Object.entries(style.style)
                  .map(([prop, value]) => `${prop}: ${value};`)
                  .join(' ');
                
                return `${selectors} { ${styleProps} }`;
              }
              return '';
            }).join('\n');
          }
        }
        return '';
      } catch (e) {
        console.error('Error parsing gjsStyles', e);
        return '';
      }
    })()}
  </style>
</head>
<body>
  ${currentPageContent?.gjsHtml || currentPageContent?.html || currentPageContent?.content || ''}
  
  <!-- Script para asegurar que las imágenes, iconos y componentes se carguen correctamente -->
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      // Corregir rutas de imágenes relativas
      document.querySelectorAll('img').forEach(img => {
        if (img.src && img.src.startsWith('/')) {
          const originalSrc = img.src;
          img.onerror = function() {
            if (!this.dataset.tried) {
              this.dataset.tried = 'true';
              this.src = window.location.origin + originalSrc;
            }
          };
        }
      });
      
      // Aplicar estilos de componentes GrapesJS si están disponibles
      try {
        const gjsComponents = ${JSON.stringify(currentPageContent?.gjsComponents || '[]')};
        if (gjsComponents && gjsComponents !== '[]') {
          const components = typeof gjsComponents === 'string' ? JSON.parse(gjsComponents) : gjsComponents;
          if (Array.isArray(components)) {
            // Los componentes ya están renderizados en el HTML, solo necesitamos asegurar
            // que cualquier script o funcionalidad especial se inicialice correctamente
            components.forEach(comp => {
              if (comp.script) {
                try {
                  // Ejecutar scripts de componentes si existen
                  new Function(comp.script)();
                } catch (e) {
                  console.error('Error executing component script', e);
                }
              }
            });
          }
        }
      } catch (e) {
        console.error('Error processing GrapesJS components', e);
      }
    });
  </script>
</body>
</html>`}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}