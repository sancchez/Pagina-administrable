import React, { useState } from 'react';
import { seedPages } from '../utils/seedPages';
import { migrateAllPages } from '../utils/migratePages';
import { getAllPages, deletePage } from '../utils/database';

const DatabaseUtils: React.FC = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [pages, setPages] = useState<any[]>([]);

  const handleSeedPages = async () => {
    setIsSeeding(true);
    setMessage('');
    
    try {
      await seedPages();
      setMessage('✅ Páginas creadas exitosamente!');
      await loadPages();
    } catch (error) {
      setMessage(`❌ Error: ${error}`);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleMigratePages = async () => {
    setIsSeeding(true);
    setMessage('');
    
    try {
      await migrateAllPages();
      setMessage('✅ Páginas migradas con Canvas completo exitosamente!');
      await loadPages();
    } catch (error) {
      setMessage(`❌ Error: ${error}`);
    } finally {
      setIsSeeding(false);
    }
  };

  const loadPages = async () => {
    setIsLoading(true);
    try {
      const allPages = await getAllPages();
      setPages(allPages);
    } catch (error) {
      setMessage(`❌ Error cargando páginas: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePage = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta página?')) {
      return;
    }
    
    try {
      await deletePage(id);
      setMessage('✅ Página eliminada exitosamente!');
      await loadPages();
    } catch (error) {
      setMessage(`❌ Error eliminando página: ${error}`);
    }
  };

  React.useEffect(() => {
    loadPages();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Utilidades de Base de Datos</h1>
        
        {/* Controles */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Acciones</h2>
          
          <div className="flex gap-4 mb-4">
            <button
              onClick={handleSeedPages}
              disabled={isSeeding}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isSeeding ? 'Creando páginas...' : '🌱 Poblar páginas de ejemplo'}
            </button>
            
            <button
              onClick={handleMigratePages}
              disabled={isSeeding}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
            >
              {isSeeding ? 'Migrando páginas...' : '🚀 Migrar páginas (Canvas completo)'}
            </button>
            
            <button
              onClick={loadPages}
              disabled={isLoading}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? 'Cargando...' : '🔄 Recargar páginas'}
            </button>
          </div>
          
          {message && (
            <div className={`p-3 rounded ${
              message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {message}
            </div>
          )}
        </div>
        
        {/* Lista de páginas */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Páginas en la base de datos ({pages.length})</h2>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Cargando páginas...</p>
            </div>
          ) : pages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No hay páginas en la base de datos</p>
              <p className="text-sm mt-2">Usa el botón "Poblar páginas de ejemplo" para crear algunas páginas</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">ID</th>
                    <th className="px-4 py-2 text-left">Título</th>
                    <th className="px-4 py-2 text-left">Slug</th>
                    <th className="px-4 py-2 text-left">Estado</th>
                    <th className="px-4 py-2 text-left">Canvas</th>
                    <th className="px-4 py-2 text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pages.map((page) => (
                    <tr key={page.id} className="border-t">
                      <td className="px-4 py-2">{page.id}</td>
                      <td className="px-4 py-2 font-medium">{page.title}</td>
                      <td className="px-4 py-2 text-blue-600">/{page.slug}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          page.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {page.published ? 'Publicado' : 'Borrador'}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          page.draftJson ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {page.draftJson ? 'Canvas' : 'HTML'}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex gap-2">
                          <a
                            href={`/admin/canvas/${page.id}`}
                            target="_blank"
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            ✏️ Editar
                          </a>
                          <a
                            href={`/${page.slug}`}
                            target="_blank"
                            className="text-green-600 hover:text-green-800 text-sm"
                          >
                            👁️ Ver
                          </a>
                          <button
                            onClick={() => handleDeletePage(page.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Información adicional */}
        <div className="bg-blue-50 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">ℹ️ Información</h3>
          <ul className="text-blue-700 space-y-1 text-sm">
            <li>• Las páginas creadas tendrán contenido Canvas de ejemplo</li>
            <li>• Puedes editar las páginas usando el editor Canvas</li>
            <li>• Las páginas públicas se renderizan automáticamente con CanvasRenderer</li>
            <li>• El auto-guardado ahora funciona cada 10 segundos (mejorado desde 2 segundos)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DatabaseUtils;