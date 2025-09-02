import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Star, 
  RotateCcw, 
  Trash2, 
  Loader2, 
  ChevronDown,
  Save
} from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from 'sonner';

interface PageVersion {
  id: number;
  pageId: number;
  title: string;
  content: string;
  description: string;
  isOriginal: boolean;
  isActive: boolean;
  createdAt: string;
}

interface PageVersionManagerProps {
  pageId?: number;
  onVersionRestore?: () => void;
}

export default function PageVersionManager({ pageId, onVersionRestore }: PageVersionManagerProps) {
  const [versions, setVersions] = useState<PageVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [newVersionDescription, setNewVersionDescription] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(true);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const loadVersions = async () => {
    if (!pageId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/page-versions/page/${pageId}`);
      if (response.ok) {
        const data = await response.json();
        setVersions(data);
      } else {
        toast.error('Error al cargar las versiones');
      }
    } catch (error) {
      console.error('Error loading versions:', error);
      toast.error('Error al cargar las versiones');
    } finally {
      setLoading(false);
    }
  };

  const createOriginalVersion = async () => {
    if (!pageId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/page-versions/page/${pageId}/original`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        toast.success(result.message || 'Versión original creada exitosamente');
        loadVersions();
      } else {
        toast.error('Error al crear la versión original');
      }
    } catch (error) {
      console.error('Error creating original version:', error);
      toast.error('Error al crear la versión original');
    } finally {
      setLoading(false);
    }
  };

  const saveNewVersion = async () => {
    if (!pageId || !newVersionDescription.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/page-versions/page/${pageId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: newVersionDescription.trim()
        })
      });
      
      if (response.ok) {
        toast.success('Nueva versión guardada');
        setNewVersionDescription('');
        loadVersions();
      } else {
        toast.error('Error al guardar la versión');
      }
    } catch (error) {
      console.error('Error saving version:', error);
      toast.error('Error al guardar la versión');
    } finally {
      setLoading(false);
    }
  };

  const restoreVersion = async (versionId: number) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/page-versions/${versionId}/restore`, {
        method: 'PUT'
      });
      
      if (response.ok) {
        toast.success('Versión restaurada exitosamente');
        loadVersions();
        if (onVersionRestore) {
          onVersionRestore();
        }
      } else {
        toast.error('Error al restaurar la versión');
      }
    } catch (error) {
      console.error('Error restoring version:', error);
      toast.error('Error al restaurar la versión');
    } finally {
      setLoading(false);
    }
  };

  const setAsOriginal = async (versionId: number) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/page-versions/${versionId}/set-original`, {
        method: 'PUT'
      });
      
      if (response.ok) {
        toast.success('Versión marcada como original');
        loadVersions();
      } else {
        toast.error('Error al marcar como original');
      }
    } catch (error) {
      console.error('Error setting as original:', error);
      toast.error('Error al marcar como original');
    } finally {
      setLoading(false);
    }
  };

  const deleteVersion = async (versionId: number) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/page-versions/${versionId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        toast.success('Versión eliminada');
        loadVersions();
      } else {
        toast.error('Error al eliminar la versión');
      }
    } catch (error) {
      console.error('Error deleting version:', error);
      toast.error('Error al eliminar la versión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pageId) {
      loadVersions();
    }
  }, [pageId]);

  if (!pageId) {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 w-80">
        <div className="p-4 text-center">
          <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Selecciona una página para gestionar versiones</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 w-80">
      {/* Header compacto */}
      <div 
        className="flex items-center justify-between p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-800">Versiones</h3>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-600 transition-transform ${isCollapsed ? '' : 'rotate-180'}`} />
      </div>

      {/* Contenido desplegable */}
      {!isCollapsed && (
        <div className="p-3 space-y-3 max-h-96 overflow-y-auto">
          {/* Crear versión original */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="text-xs font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <Star className="h-3 w-3" />
              Crear Versión Original
            </h4>
            <p className="text-xs text-blue-600 mb-2">
              Guarda la configuración actual como versión original.
            </p>
            <Button
              onClick={createOriginalVersion}
              disabled={loading}
              className="w-full text-xs py-1.5"
              variant="outline"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Star className="h-3 w-3 mr-1" />
                  Crear Original
                </>
              )}
            </Button>
          </div>

          {/* Guardar nueva versión */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <h4 className="text-xs font-semibold text-green-800 mb-2">Nueva Versión</h4>
            <input
              type="text"
              value={newVersionDescription}
              onChange={(e) => setNewVersionDescription(e.target.value)}
              placeholder="Descripción..."
              className="w-full px-2 py-1 text-xs border border-green-300 rounded mb-2 focus:outline-none focus:ring-1 focus:ring-green-500"
              onKeyPress={(e) => e.key === 'Enter' && saveNewVersion()}
            />
            <Button
              onClick={saveNewVersion}
              disabled={loading || !newVersionDescription.trim()}
              className="w-full text-xs py-1.5"
              variant="outline"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-3 w-3 mr-1" />
                  Guardar
                </>
              )}
            </Button>
          </div>

          {/* Lista de versiones */}
          {loading && (
            <div className="text-center py-4">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
              <p className="text-xs text-gray-500 mt-2">Cargando...</p>
            </div>
          )}

          {!loading && versions.length === 0 && (
            <div className="text-center py-4">
              <Clock className="h-6 w-6 text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-500">No hay versiones guardadas</p>
            </div>
          )}

          {!loading && versions.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-800">Versiones Guardadas</h4>
              {versions
                .sort((a, b) => {
                  if (a.isActive && !b.isActive) return -1;
                  if (!a.isActive && b.isActive) return 1;
                  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                })
                .map((version) => (
                  <div
                    key={version.id}
                    className={`p-2 rounded border ${
                      version.isOriginal
                        ? 'bg-blue-50 border-blue-200'
                        : version.isActive
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-1">
                          {version.isOriginal && (
                            <Star className="h-3 w-3 text-blue-600" />
                          )}
                          <span className="text-xs font-medium text-gray-800 truncate">
                            {version.description || `Versión ${version.id}`}
                          </span>
                          {version.isActive && (
                            <span className="text-xs bg-green-100 text-green-700 px-1 py-0.5 rounded">
                              Activa
                            </span>
                          )}
                          {version.isOriginal && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-1 py-0.5 rounded">
                              Original
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600">
                          {formatDate(version.createdAt)}
                        </p>
                      </div>
                      <div className="flex gap-1 ml-2">
                        {!version.isActive && (
                          <Button
                            onClick={() => restoreVersion(version.id)}
                            disabled={loading}
                            variant="outline"
                            className="text-xs py-1 px-1.5 h-6"
                            title="Restaurar"
                          >
                            <RotateCcw className="h-3 w-3" />
                          </Button>
                        )}
                        {!version.isOriginal && (
                          <Button
                            onClick={() => setAsOriginal(version.id)}
                            disabled={loading}
                            variant="outline"
                            className="text-xs py-1 px-1.5 h-6"
                            title="Marcar como original"
                          >
                            <Star className="h-3 w-3" />
                          </Button>
                        )}
                        {!version.isActive && !version.isOriginal && (
                          <Button
                            onClick={() => deleteVersion(version.id)}
                            disabled={loading}
                            variant="outline"
                            className="text-xs py-1 px-1.5 h-6 text-red-600 hover:text-red-700"
                            title="Eliminar"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}