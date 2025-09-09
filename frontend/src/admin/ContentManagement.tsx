import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Eye, 
  Save, 
  RefreshCw, 
  Monitor, 
  Smartphone,
  Image as ImageIcon,
  Link as LinkIcon,
  Video,
  Type,
  Bold,
  Italic,
  List,
  AlignLeft,
  AlignCenter,
  AlignRight
} from 'lucide-react';

interface Page {
  id: number;
  title: string;
  slug: string;
  content: string;
  metaDescription?: string;
  published: boolean;
  updatedAt: string;
}

export default function ContentManagement() {
  const { token } = useAuth();
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const response = await fetch('/api/admin/pages', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPages(data);
      }
    } catch (error) {
      console.error('Error fetching pages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPage = async (page: Page) => {
    try {
      const response = await fetch(`/api/admin/pages/${page.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedPage(data);
        setContent(data.content);
        setTitle(data.title);
        setMetaDescription(data.metaDescription || '');
      }
    } catch (error) {
      console.error('Error loading page:', error);
    }
  };

  const savePage = async () => {
    if (!selectedPage) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/pages/${selectedPage.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          content,
          metaDescription,
        }),
      });

      if (response.ok) {
        alert('Página guardada exitosamente');
        fetchPages();
      } else {
        alert('Error al guardar la página');
      }
    } catch (error) {
      console.error('Error saving page:', error);
      alert('Error al guardar la página');
    } finally {
      setSaving(false);
    }
  };

  const insertHtml = (tag: string, value?: string) => {
    const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let newText = '';
    switch (tag) {
      case 'h1':
        newText = `<h1 class="text-4xl font-bold text-gray-800 mb-6">${selectedText || 'Título Principal'}</h1>`;
        break;
      case 'h2':
        newText = `<h2 class="text-3xl font-semibold text-gray-800 mb-4">${selectedText || 'Subtítulo'}</h2>`;
        break;
      case 'h3':
        newText = `<h3 class="text-2xl font-semibold text-gray-800 mb-3">${selectedText || 'Subtítulo Menor'}</h3>`;
        break;
      case 'p':
        newText = `<p class="text-gray-600 mb-4 leading-relaxed">${selectedText || 'Párrafo de texto'}</p>`;
        break;
      case 'strong':
        newText = `<strong class="font-bold text-gray-800">${selectedText || 'Texto en negrita'}</strong>`;
        break;
      case 'em':
        newText = `<em class="italic text-gray-700">${selectedText || 'Texto en cursiva'}</em>`;
        break;
      case 'ul':
        newText = `<ul class="list-disc list-inside mb-4 text-gray-600 space-y-2">\n  <li>${selectedText || 'Elemento de lista'}</li>\n  <li>Otro elemento</li>\n</ul>`;
        break;
      case 'ol':
        newText = `<ol class="list-decimal list-inside mb-4 text-gray-600 space-y-2">\n  <li>${selectedText || 'Primer elemento'}</li>\n  <li>Segundo elemento</li>\n</ol>`;
        break;
      case 'a':
        const url = value || prompt('Ingrese la URL:') || 'https://ejemplo.com';
        newText = `<a href="${url}" class="text-blue-600 hover:text-blue-800 underline">${selectedText || 'Enlace'}</a>`;
        break;
      case 'img':
        const imgUrl = value || prompt('Ingrese la URL de la imagen:') || 'https://via.placeholder.com/400x200';
        newText = `<img src="${imgUrl}" alt="${selectedText || 'Descripción de imagen'}" class="w-full max-w-2xl mx-auto rounded-lg shadow-lg mb-6" />`;
        break;
      case 'video':
        const videoUrl = value || prompt('Ingrese la URL del video (YouTube):') || '';
        if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
          const videoId = videoUrl.includes('youtu.be') 
            ? videoUrl.split('/').pop()?.split('?')[0]
            : videoUrl.split('v=')[1]?.split('&')[0];
          newText = `<div class="relative w-full max-w-2xl mx-auto mb-6"><iframe class="w-full h-64 rounded-lg shadow-lg" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe></div>`;
        }
        break;
      case 'div-center':
        newText = `<div class="text-center mb-6">${selectedText || 'Contenido centrado'}</div>`;
        break;
      case 'div-card':
        newText = `<div class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-lg mb-6">${selectedText || 'Contenido de tarjeta'}</div>`;
        break;
    }

    const newContent = content.substring(0, start) + newText + content.substring(end);
    setContent(newContent);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-137px)] flex flex-col">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
              Gestión de Contenidos
            </h1>
            <p className="text-gray-600">Edita el contenido de las páginas de tu sitio web</p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Page Selector */}
            <select
              value={selectedPage?.id || ''}
              onChange={(e) => {
                const page = pages.find(p => p.id === parseInt(e.target.value));
                if (page) loadPage(page);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-w-48"
            >
              <option value="">Seleccionar página...</option>
              {pages.map((page) => (
                <option key={page.id} value={page.id}>
                  {page.title} ({page.slug})
                </option>
              ))}
            </select>

            {selectedPage && (
              <>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    showPreview 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <Eye className="h-4 w-4" />
                  <span>{showPreview ? 'Editor' : 'Vista Previa'}</span>
                </button>

                <button
                  onClick={savePage}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Guardar</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {selectedPage ? (
        <div className="flex flex-1 space-x-6 overflow-hidden">
          {/* Editor Panel */}
          {!showPreview && (
            <div className="w-80 bg-white rounded-xl shadow-lg border border-gray-200 p-6 overflow-y-auto">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <Type className="h-5 w-5 text-blue-600" />
                <span>Herramientas de Edición</span>
              </h3>

              {/* Page Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meta Descripción</label>
                  <textarea
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                  />
                </div>
              </div>

              {/* Text Tools */}
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">Títulos</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => insertHtml('h1')} className="p-2 text-xs border border-gray-200 rounded hover:bg-gray-50">H1</button>
                    <button onClick={() => insertHtml('h2')} className="p-2 text-xs border border-gray-200 rounded hover:bg-gray-50">H2</button>
                    <button onClick={() => insertHtml('h3')} className="p-2 text-xs border border-gray-200 rounded hover:bg-gray-50">H3</button>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">Formato</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => insertHtml('p')} className="p-2 text-xs border border-gray-200 rounded hover:bg-gray-50 flex items-center justify-center">
                      <Type className="h-3 w-3 mr-1" />
                      Párrafo
                    </button>
                    <button onClick={() => insertHtml('strong')} className="p-2 text-xs border border-gray-200 rounded hover:bg-gray-50 flex items-center justify-center">
                      <Bold className="h-3 w-3 mr-1" />
                      Negrita
                    </button>
                    <button onClick={() => insertHtml('em')} className="p-2 text-xs border border-gray-200 rounded hover:bg-gray-50 flex items-center justify-center">
                      <Italic className="h-3 w-3 mr-1" />
                      Cursiva
                    </button>
                    <button onClick={() => insertHtml('div-center')} className="p-2 text-xs border border-gray-200 rounded hover:bg-gray-50 flex items-center justify-center">
                      <AlignCenter className="h-3 w-3 mr-1" />
                      Centrar
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">Listas</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => insertHtml('ul')} className="p-2 text-xs border border-gray-200 rounded hover:bg-gray-50 flex items-center justify-center">
                      <List className="h-3 w-3 mr-1" />
                      Lista
                    </button>
                    <button onClick={() => insertHtml('ol')} className="p-2 text-xs border border-gray-200 rounded hover:bg-gray-50">
                      1. Lista
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">Medios</h4>
                  <div className="space-y-2">
                    <button onClick={() => insertHtml('img')} className="w-full p-2 text-xs border border-gray-200 rounded hover:bg-gray-50 flex items-center justify-center">
                      <ImageIcon className="h-3 w-3 mr-1" />
                      Insertar Imagen
                    </button>
                    <button onClick={() => insertHtml('video')} className="w-full p-2 text-xs border border-gray-200 rounded hover:bg-gray-50 flex items-center justify-center">
                      <Video className="h-3 w-3 mr-1" />
                      Video YouTube
                    </button>
                    <button onClick={() => insertHtml('a')} className="w-full p-2 text-xs border border-gray-200 rounded hover:bg-gray-50 flex items-center justify-center">
                      <LinkIcon className="h-3 w-3 mr-1" />
                      Enlace
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">Componentes</h4>
                  <button onClick={() => insertHtml('div-card')} className="w-full p-2 text-xs border border-gray-200 rounded hover:bg-gray-50">
                    Tarjeta
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {showPreview ? (
              <div className="h-full flex flex-col">
                {/* Preview Controls */}
                <div className="bg-gray-50 border-b border-gray-200 p-4 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">Vista Previa</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setPreviewMode('desktop')}
                      className={`p-2 rounded ${previewMode === 'desktop' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                    >
                      <Monitor className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setPreviewMode('mobile')}
                      className={`p-2 rounded ${previewMode === 'mobile' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                    >
                      <Smartphone className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Preview Content */}
                <div className="flex-1 overflow-auto bg-gray-100 p-8">
                  <div className={`mx-auto bg-white rounded-lg shadow-lg overflow-hidden ${
                    previewMode === 'mobile' ? 'max-w-sm' : 'max-w-4xl'
                  }`}>
                    <div className="p-8">
                      <h1 className="text-3xl font-bold text-gray-800 mb-6">{title}</h1>
                      <div 
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: content }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col">
                <div className="bg-gray-50 border-b border-gray-200 p-4">
                  <h3 className="font-semibold text-gray-800">Editor HTML</h3>
                </div>
                <textarea
                  id="content-editor"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Escribe o pega tu contenido HTML aquí..."
                  className="flex-1 p-6 border-none focus:outline-none focus:ring-0 resize-none font-mono text-sm leading-relaxed"
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-white rounded-xl shadow-lg border border-gray-200 flex items-center justify-center">
          <div className="text-center">
            <Edit3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Selecciona una página para editar</h3>
            <p className="text-gray-600">Elige una página del menú desplegable para comenzar a editar su contenido</p>
          </div>
        </div>
      )}
    </div>
  );
}