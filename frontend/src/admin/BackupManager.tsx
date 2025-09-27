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
  const { token } = useAuth();
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [backups, setBackups] = useState<PageBackup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
      const response = await HttpClient.get('/api/pages', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setPages(response.data.data.pages || []);
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
      const response = await HttpClient.get(`/api/pages/${pageId}/backups`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setBackups(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching backups:', error);
      showMessage('error', 'Error al cargar los backups');
    }
  };

  const createBackup = async (pageId: string) => {
    try {
      setIsCreatingBackup(true);
      const response = await HttpClient.post(`/api/pages/${pageId}/backups`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
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
      const response = await HttpClient.post(`/api/pages/${pageId}/restore/${backupId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
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
    </div>
  );
}