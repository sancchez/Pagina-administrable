import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Save, Eye, ArrowLeft, Type, Image as ImageIcon, Bold, Italic, List, Link as LinkIcon } from 'lucide-react';

interface Page {
  id: number;
  title: string;
  slug: string;
  content: string;
  metaDescription?: string;
  published: boolean;
}

export default function AdminEditor() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  
  const [page, setPage] = useState<Page | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const isEditing = Boolean(id);

  useEffect(() => {
    if (isEditing && id) {
      fetchPage(parseInt(id));
    }
  }, [id, isEditing]);

  const fetchPage = async (pageId: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/pages/${pageId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPage(data);
        setTitle(data.title);
        setSlug(data.slug);
        setContent(data.content);
        setMetaDescription(data.metaDescription || '');
      }
    } catch (error) {
      console.error('Error fetching page:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !slug.trim()) {
      alert('Por favor complete el título y slug');
      return;
    }

    setIsSaving(true);
    try {
      const url = isEditing 
        ? `/api/admin/pages/${page!.id}`
        : '/api/admin/pages';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          slug,
          content,
          metaDescription,
        }),
      });

      if (response.ok) {
        alert('Página guardada exitosamente');
        navigate('/admin/dashboard');
      } else {
        alert('Error al guardar la página');
      }
    } catch (error) {
      console.error('Error saving page:', error);
      alert('Error al guardar la página');
    } finally {
      setIsSaving(false);
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!isEditing) {
      setSlug(generateSlug(value));
    }
  };

  const insertHtml = (tag: string) => {
    const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let newText = '';
    switch (tag) {
      case 'h1':
        newText = `<h1>${selectedText || 'Título'}</h1>`;
        break;
      case 'h2':
        newText = `<h2>${selectedText || 'Subtítulo'}</h2>`;
        break;
      case 'p':
        newText = `<p>${selectedText || 'Párrafo'}</p>`;
        break;
      case 'strong':
        newText = `<strong>${selectedText || 'Texto en negrita'}</strong>`;
        break;
      case 'em':
        newText = `<em>${selectedText || 'Texto en cursiva'}</em>`;
        break;
      case 'ul':
        newText = `<ul>\n  <li>${selectedText || 'Elemento de lista'}</li>\n</ul>`;
        break;
      case 'a':
        newText = `<a href="https://ejemplo.com">${selectedText || 'Enlace'}</a>`;
        break;
      case 'img':
        newText = `<img src="https://via.placeholder.com/400x200" alt="${selectedText || 'Descripción de imagen'}" />`;
        break;
    }

    const newContent = content.substring(0, start) + newText + content.substring(end);
    setContent(newContent);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-97px)] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Volver</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Título de la página"
                  className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-0 p-0 w-80"
                />
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="url-slug"
                  className="block text-sm text-gray-500 bg-transparent border-none focus:outline-none focus:ring-0 p-0 mt-1 w-80"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Eye className="h-4 w-4" />
              <span>{showPreview ? 'Editor' : 'Vista Previa'}</span>
            </button>
            
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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
          </div>
        </div>
      </div>

      {/* Meta Description */}
      <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
        <input
          type="text"
          value={metaDescription}
          onChange={(e) => setMetaDescription(e.target.value)}
          placeholder="Descripción meta (SEO)"
          className="w-full text-sm bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-gray-600"
        />
      </div>

      {/* Editor */}
      <div className="flex flex-1 overflow-hidden">
        {!showPreview && (
          <div className="w-64 bg-white border-r border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Type className="h-4 w-4" />
              <span>Herramientas</span>
            </h3>
            
            <div className="space-y-2">
              <button
                onClick={() => insertHtml('h1')}
                className="w-full p-2 text-left border border-gray-200 rounded-lg hover:bg-gray-50 text-sm"
              >
                Título H1
              </button>
              <button
                onClick={() => insertHtml('h2')}
                className="w-full p-2 text-left border border-gray-200 rounded-lg hover:bg-gray-50 text-sm"
              >
                Subtítulo H2
              </button>
              <button
                onClick={() => insertHtml('p')}
                className="w-full p-2 text-left border border-gray-200 rounded-lg hover:bg-gray-50 text-sm"
              >
                Párrafo
              </button>
              <button
                onClick={() => insertHtml('strong')}
                className="w-full p-2 text-left border border-gray-200 rounded-lg hover:bg-gray-50 text-sm flex items-center space-x-2"
              >
                <Bold className="h-4 w-4" />
                <span>Negrita</span>
              </button>
              <button
                onClick={() => insertHtml('em')}
                className="w-full p-2 text-left border border-gray-200 rounded-lg hover:bg-gray-50 text-sm flex items-center space-x-2"
              >
                <Italic className="h-4 w-4" />
                <span>Cursiva</span>
              </button>
              <button
                onClick={() => insertHtml('ul')}
                className="w-full p-2 text-left border border-gray-200 rounded-lg hover:bg-gray-50 text-sm flex items-center space-x-2"
              >
                <List className="h-4 w-4" />
                <span>Lista</span>
              </button>
              <button
                onClick={() => insertHtml('a')}
                className="w-full p-2 text-left border border-gray-200 rounded-lg hover:bg-gray-50 text-sm flex items-center space-x-2"
              >
                <LinkIcon className="h-4 w-4" />
                <span>Enlace</span>
              </button>
              <button
                onClick={() => insertHtml('img')}
                className="w-full p-2 text-left border border-gray-200 rounded-lg hover:bg-gray-50 text-sm flex items-center space-x-2"
              >
                <ImageIcon className="h-4 w-4" />
                <span>Imagen</span>
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 bg-gray-50 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm min-h-96">
            {showPreview ? (
              <div className="p-8">
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </div>
            ) : (
              <textarea
                id="content-editor"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escribe el contenido HTML aquí..."
                className="w-full h-full p-8 border-none focus:outline-none focus:ring-0 resize-none font-mono text-sm"
                style={{ minHeight: '500px' }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}