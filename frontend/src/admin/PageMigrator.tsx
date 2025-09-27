import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Download,
  RefreshCw,
  Code,
  Eye
} from 'lucide-react';

interface MigrationResult {
  success: boolean;
  message: string;
  grapesData?: any;
  error?: string;
}

const PageMigrator = () => {
  const { user } = useAuth();
  const [htmlContent, setHtmlContent] = useState('');
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/html') {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setHtmlContent(content);
      };
      reader.readAsText(file);
    } else {
      alert('Por favor selecciona un archivo HTML válido');
    }
  };

  const migrateHtml = async () => {
    if (!htmlContent.trim()) {
      alert('Por favor ingresa o selecciona contenido HTML para migrar');
      return;
    }

    setIsLoading(true);
    setMigrationResult(null);

    try {
      const response = await fetch('/api/admin/migrate-html', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/html',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: htmlContent,
      });

      if (response.ok) {
        const data = await response.json();
        setMigrationResult({
          success: true,
          message: 'HTML migrado exitosamente a formato GrapesJS',
          grapesData: data
        });
      } else {
        const errorText = await response.text();
        setMigrationResult({
          success: false,
          message: 'Error en la migración',
          error: errorText
        });
      }
    } catch (error) {
      setMigrationResult({
        success: false,
        message: 'Error de conexión',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadGrapesData = () => {
    if (migrationResult?.grapesData) {
      const dataStr = JSON.stringify(migrationResult.grapesData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'grapes-data.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const clearAll = () => {
    setHtmlContent('');
    setSelectedFile(null);
    setMigrationResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Migrador de Páginas</h1>
          <p className="text-gray-600">Convierte HTML estático a formato GrapesJS editable</p>
        </div>
        <button
          onClick={clearAll}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Limpiar Todo
        </button>
      </div>

      {/* Upload Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Cargar HTML
        </h2>
        
        <div className="space-y-4">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar archivo HTML
            </label>
            <input
              type="file"
              accept=".html,.htm"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {selectedFile && (
              <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Archivo cargado: {selectedFile.name}
              </p>
            )}
          </div>

          {/* Manual HTML Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              O pegar HTML manualmente
            </label>
            <textarea
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              placeholder="Pega tu código HTML aquí..."
              className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            />
          </div>
        </div>
      </div>

      {/* Migration Button */}
      <div className="flex justify-center">
        <button
          onClick={migrateHtml}
          disabled={isLoading || !htmlContent.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg flex items-center gap-2 font-semibold"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Code className="w-5 h-5" />
          )}
          {isLoading ? 'Migrando...' : 'Migrar a GrapesJS'}
        </button>
      </div>

      {/* Results Section */}
      {migrationResult && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            {migrationResult.success ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
            Resultado de la Migración
          </h2>

          {migrationResult.success ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium">{migrationResult.message}</p>
              </div>

              {migrationResult.grapesData && (
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <button
                      onClick={downloadGrapesData}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Descargar JSON
                    </button>
                    
                    <button
                      onClick={() => {
                        const dataStr = JSON.stringify(migrationResult.grapesData, null, 2);
                        navigator.clipboard.writeText(dataStr);
                        alert('Datos copiados al portapapeles');
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Copiar JSON
                    </button>
                  </div>

                  <details className="border border-gray-200 rounded-lg">
                    <summary className="p-3 bg-gray-50 cursor-pointer font-medium flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Ver datos GrapesJS generados
                    </summary>
                    <div className="p-4 bg-gray-50">
                      <pre className="text-xs overflow-auto max-h-60 bg-white p-3 rounded border">
                        {JSON.stringify(migrationResult.grapesData, null, 2)}
                      </pre>
                    </div>
                  </details>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">{migrationResult.message}</p>
              {migrationResult.error && (
                <p className="text-red-600 text-sm mt-2">{migrationResult.error}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Instrucciones de Uso</h3>
        <ul className="space-y-2 text-blue-800">
          <li className="flex items-start gap-2">
            <span className="font-bold">1.</span>
            <span>Carga un archivo HTML o pega el código HTML que deseas migrar</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">2.</span>
            <span>Haz clic en "Migrar a GrapesJS" para convertir el HTML</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">3.</span>
            <span>Descarga o copia los datos JSON generados</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">4.</span>
            <span>Usa estos datos en el editor GrapesJS para crear páginas editables</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PageMigrator;