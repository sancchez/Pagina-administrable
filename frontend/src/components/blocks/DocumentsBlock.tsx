import React, { useState, memo, useCallback, useMemo } from 'react';
import { useNode } from '@craftjs/core';
import { FileText, Download, ExternalLink, File, FileImage, FileVideo, AlertCircle, CheckCircle } from 'lucide-react';
import { DocumentsBlockProps, DocumentItem } from '../../types/blocks';

type DocumentType = 'PDF' | 'DOC' | 'XLS' | 'IMG' | 'VIDEO' | 'OTHER';

interface DocumentError {
  [key: string]: string;
}

interface DownloadState {
  [key: string]: 'idle' | 'downloading' | 'success' | 'error';
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

interface ExtendedDocumentItem extends DocumentItem {
  type: DocumentType;
}

interface ExtendedDocumentsBlockProps extends DocumentsBlockProps {
  documents?: ExtendedDocumentItem[];
}

const typeIconMap = {
  PDF: FileText,
  DOC: FileText,
  XLS: FileText,
  IMG: FileImage,
  VIDEO: FileVideo,
  OTHER: File
};

const typeColorMap = {
  PDF: {
    bg: 'bg-red-100',
    icon: 'text-red-600',
    border: 'border-red-200'
  },
  DOC: {
    bg: 'bg-blue-100',
    icon: 'text-blue-600',
    border: 'border-blue-200'
  },
  XLS: {
    bg: 'bg-green-100',
    icon: 'text-green-600',
    border: 'border-green-200'
  },
  IMG: {
    bg: 'bg-purple-100',
    icon: 'text-purple-600',
    border: 'border-purple-200'
  },
  VIDEO: {
    bg: 'bg-yellow-100',
    icon: 'text-yellow-600',
    border: 'border-yellow-200'
  },
  OTHER: {
    bg: 'bg-gray-100',
    icon: 'text-gray-600',
    border: 'border-gray-200'
  }
};

const DocumentsBlock: React.FC<ExtendedDocumentsBlockProps> = memo(({
  title = 'Documentos',
  subtitle = 'Accede a nuestros documentos institucionales',
  documents = [
    { name: 'Estatutos', url: '/docs/estatutos.pdf', type: 'PDF', size: '2.5 MB' },
    { name: 'Estados Financieros', url: '/docs/estados-financieros.pdf', type: 'PDF', size: '1.8 MB' },
    { name: 'Informe de Gestión', url: '/docs/informe-gestion.pdf', type: 'PDF', size: '3.2 MB' }
  ],
  layout = 'grid'
}) => {
  const [downloadStates, setDownloadStates] = useState<DownloadState>({});
  const [documentErrors, setDocumentErrors] = useState<DocumentError>({});

  // Validación de URL
  const validateUrl = useCallback((url: string): ValidationResult => {
    if (!url || url.trim() === '') {
      return { isValid: false, error: 'URL es requerida' };
    }
    
    try {
      new URL(url.startsWith('http') ? url : `https://example.com${url}`);
      return { isValid: true };
    } catch {
      return { isValid: false, error: 'URL inválida' };
    }
  }, []);

  // Validación de tipo de archivo
  const validateFileType = useCallback((type: DocumentType): ValidationResult => {
    const validTypes: DocumentType[] = ['PDF', 'DOC', 'XLS', 'IMG', 'VIDEO', 'OTHER'];
    if (!validTypes.includes(type)) {
      return { isValid: false, error: 'Tipo de archivo no válido' };
    }
    return { isValid: true };
  }, []);

  // Validación de tamaño de archivo
  const validateFileSize = useCallback((size?: string): ValidationResult => {
    if (!size) return { isValid: true };
    
    const sizeRegex = /^\d+(\.\d+)?\s*(B|KB|MB|GB)$/i;
    if (!sizeRegex.test(size)) {
      return { isValid: false, error: 'Formato de tamaño inválido' };
    }
    return { isValid: true };
  }, []);

  // Validación completa del documento
  const validateDocument = useCallback((doc: ExtendedDocumentItem): ValidationResult => {
    if (!doc.name || doc.name.trim() === '') {
      return { isValid: false, error: 'Nombre del documento es requerido' };
    }

    const urlValidation = validateUrl(doc.url);
    if (!urlValidation.isValid) {
      return urlValidation;
    }

    const typeValidation = validateFileType(doc.type);
    if (!typeValidation.isValid) {
      return typeValidation;
    }

    const sizeValidation = validateFileSize(doc.size);
    if (!sizeValidation.isValid) {
      return sizeValidation;
    }

    return { isValid: true };
  }, [validateUrl, validateFileType, validateFileSize]);

  // Manejo de descarga con validación
  const handleDownload = useCallback(async (doc: ExtendedDocumentItem, index: number) => {
    const docKey = `${index}-${doc.name}`;
    
    // Validar documento antes de descargar
    const validation = validateDocument(doc);
    if (!validation.isValid) {
      setDocumentErrors(prev => ({
        ...prev,
        [docKey]: validation.error || 'Error de validación'
      }));
      return;
    }

    // Limpiar errores previos
    setDocumentErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[docKey];
      return newErrors;
    });

    setDownloadStates(prev => ({ ...prev, [docKey]: 'downloading' }));

    try {
      // Simular descarga con delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // En un caso real, esto manejaría la descarga
      console.log('📥 Descargando documento:', doc.name);
      window.open(doc.url, '_blank');
      
      setDownloadStates(prev => ({ ...prev, [docKey]: 'success' }));
      
      // Limpiar estado de éxito después de 3 segundos
      setTimeout(() => {
        setDownloadStates(prev => {
          const newStates = { ...prev };
          delete newStates[docKey];
          return newStates;
        });
      }, 3000);
    } catch (error) {
      console.error('Error al descargar:', error);
      setDownloadStates(prev => ({ ...prev, [docKey]: 'error' }));
      setDocumentErrors(prev => ({
        ...prev,
        [docKey]: 'Error al descargar el archivo'
      }));
    }
  }, [validateDocument]);

  // Manejo de vista previa
  const handlePreview = useCallback((doc: ExtendedDocumentItem, index: number) => {
    const docKey = `${index}-${doc.name}`;
    
    const validation = validateDocument(doc);
    if (!validation.isValid) {
      setDocumentErrors(prev => ({
        ...prev,
        [docKey]: validation.error || 'Error de validación'
      }));
      return;
    }

    // Limpiar errores previos
    setDocumentErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[docKey];
      return newErrors;
    });

    window.open(doc.url, '_blank');
  }, [validateDocument]);

  // Documentos validados
  const validatedDocuments = useMemo(() => {
    return documents.map((doc, index) => {
      const validation = validateDocument(doc);
      return {
        ...doc,
        isValid: validation.isValid,
        validationError: validation.error
      };
    });
  }, [documents, validateDocument]);

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="container mx-auto">
        {/* Encabezado */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">{title}</h2>
          {subtitle && (
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">{subtitle}</p>
          )}
        </div>

        {/* Grid/Lista de documentos */}
        <div className={`${
          layout === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4 max-w-4xl mx-auto'
        }`}>
          {validatedDocuments.map((doc, index) => {
            const IconComponent = typeIconMap[doc.type];
            const colors = typeColorMap[doc.type];
            const docKey = `${index}-${doc.name}`;
            const downloadState = downloadStates[docKey] || 'idle';
            const hasError = documentErrors[docKey] || !doc.isValid;
            const errorMessage = documentErrors[docKey] || doc.validationError;
            
            return (
              <div 
                key={index}
                className={`bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300 border ${
                  hasError ? 'border-red-200 bg-red-50' : 'border-gray-200'
                } group`}
              >
                <div className="flex items-start space-x-4">
                  {/* Icono del tipo de archivo */}
                  <div className={`flex-shrink-0 w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center ${colors.border} border`}>
                    <IconComponent className={`h-6 w-6 ${colors.icon}`} />
                  </div>
                  
                  {/* Información del documento */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate">
                      {doc.name}
                    </h3>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                      <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">
                        {doc.type}
                      </span>
                      {doc.size && (
                        <span>{doc.size}</span>
                      )}
                      {downloadState === 'success' && (
                        <span className="inline-flex items-center space-x-1 text-green-600 text-xs">
                          <CheckCircle className="h-3 w-3" />
                          <span>Descargado</span>
                        </span>
                      )}
                    </div>
                    
                    {doc.description && (
                      <p className="text-gray-600 text-sm mb-3">{doc.description}</p>
                    )}
                    
                    {/* Mensaje de error */}
                    {hasError && (
                      <div className="flex items-center space-x-2 text-red-600 text-sm mb-3 p-2 bg-red-100 rounded">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <span>{errorMessage}</span>
                      </div>
                    )}
                    
                    {/* Botones de acción */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDownload(doc, index)}
                        disabled={downloadState === 'downloading' || !doc.isValid}
                        className={`inline-flex items-center space-x-1 text-sm font-medium transition-colors ${
                          downloadState === 'downloading' || !doc.isValid
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-blue-600 hover:text-blue-700'
                        }`}
                      >
                        <Download className={`h-4 w-4 ${
                          downloadState === 'downloading' ? 'animate-spin' : ''
                        }`} />
                        <span>
                          {downloadState === 'downloading' ? 'Descargando...' : 'Descargar'}
                        </span>
                      </button>
                      
                      <button
                        onClick={() => handlePreview(doc, index)}
                        disabled={!doc.isValid}
                        className={`inline-flex items-center space-x-1 text-sm font-medium transition-colors ${
                          !doc.isValid
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-600 hover:text-gray-700'
                        }`}
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>Ver</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
});

// Configuración de Craft.js
const DocumentsBlockSettings = () => {
  const {
    actions: { setProp },
    title,
    subtitle,
    layout
  } = useNode((node) => ({
    title: node.data.props.title,
    subtitle: node.data.props.subtitle,
    layout: node.data.props.layout
  }));

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Título
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setProp((props: ExtendedDocumentsBlockProps) => (props.title = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Subtítulo
        </label>
        <input
          type="text"
          value={subtitle}
          onChange={(e) => setProp((props: ExtendedDocumentsBlockProps) => (props.subtitle = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Diseño
        </label>
        <select
          value={layout}
          onChange={(e) => setProp((props: ExtendedDocumentsBlockProps) => (props.layout = e.target.value as 'grid' | 'list'))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="grid">Cuadrícula</option>
          <option value="list">Lista</option>
        </select>
      </div>
    </div>
  );
};

// Configuración de Craft.js para el componente
DocumentsBlock.craft = {
  props: {
    title: 'Documentos',
    subtitle: 'Accede a nuestros documentos institucionales',
    documents: [
      { name: 'Estatutos', url: '/docs/estatutos.pdf', type: 'PDF', size: '2.5 MB' },
      { name: 'Estados Financieros', url: '/docs/estados-financieros.pdf', type: 'PDF', size: '1.8 MB' },
      { name: 'Informe de Gestión', url: '/docs/informe-gestion.pdf', type: 'PDF', size: '3.2 MB' }
    ],
    layout: 'grid'
  },
  related: {
    settings: DocumentsBlockSettings
  }
};

export default DocumentsBlock;
export { DocumentsBlockSettings };