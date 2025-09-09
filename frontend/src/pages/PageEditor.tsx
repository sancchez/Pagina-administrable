import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CraftEditor } from '../components/editor/CraftEditor';
import { BlockData } from '../types/blocks';
import { migrateHtmlToJson } from '../utils/htmlToJsonMigrator';
import { adaptMigratorBlocksToEditor } from '../utils/blockAdapter';

interface Page {
  id: number;
  title: string;
  slug: string;
  content?: string;
  draftJson?: any;
  publishedJson?: any;
  metaDescription: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

const PageEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState<Page | null>(null);
  const [pageData, setPageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && id !== 'new') {
      fetchPage();
    } else {
      // New page
      const newPageData = {
        id: '',
        title: 'Nueva Página',
        blocks: [],
        settings: {}
      };
      setPageData(newPageData);
      setLoading(false);
    }
  }, [id]);

  const saveMigratedContent = async (pageId: number, blocks: BlockData[]) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/pages/${pageId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          draftJson: { blocks }
        })
      });
      
      if (response.ok) {
        console.log('Contenido migrado guardado automáticamente');
      }
    } catch (error) {
      console.error('Error guardando contenido migrado:', error);
    }
  };

  const fetchPage = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/pages/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar la página');
      }

      const pageResponse = await response.json();
      setPage(pageResponse);
      
      // Convert to PageData format for CraftEditor
      let migratorBlocks: BlockData[] = [];
      
      // Use published content first, then draft, then migrate HTML content
      if (pageResponse.publishedJson && pageResponse.publishedJson.blocks) {
        migratorBlocks = pageResponse.publishedJson.blocks;
      } else if (pageResponse.draftJson && pageResponse.draftJson.blocks) {
        migratorBlocks = pageResponse.draftJson.blocks;
      } else if (pageResponse.content) {
        // Migrate HTML content to blocks automatically
        console.log('Migrando contenido HTML a bloques JSON para:', pageResponse.title);
        migratorBlocks = migrateHtmlToJson(pageResponse.content);
        
        // Auto-save migrated content to preserve it
        if (migratorBlocks.length > 0) {
          await saveMigratedContent(pageResponse.id, migratorBlocks);
        }
      }
      
      // Convert migrator blocks to editor format
      const editorBlocks = adaptMigratorBlocksToEditor(migratorBlocks);

      const convertedPageData = {
        id: pageResponse.id.toString(),
        title: pageResponse.title,
        blocks: editorBlocks,
        settings: {
          backgroundColor: pageResponse.backgroundColor,
          backgroundImage: pageResponse.backgroundImage,
          maxWidth: pageResponse.maxWidth
        }
      };
      
      console.log('Datos convertidos para CraftEditor:', {
        originalBlocks: migratorBlocks.length,
        convertedBlocks: editorBlocks.length,
        blocks: editorBlocks
      });

      setPageData(convertedPageData);
    } catch (err) {
      console.error('Error fetching page:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando editor...</p>
        </div>
      </div>
    );
  }

  const handleSave = async (updatedPageData: any) => {
    try {
      const token = localStorage.getItem('adminToken');
      const url = id && id !== 'new'
        ? `/api/admin/pages/${id}`
        : '/api/admin/pages';
      
      const method = id && id !== 'new' ? 'PUT' : 'POST';

      const apiData = {
        title: updatedPageData.title,
        slug: page?.slug || 'nueva-pagina',
        metaDescription: page?.metaDescription || '',
        published: false,
        draftJson: { blocks: updatedPageData.blocks || [] },
        publishedJson: null
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(apiData)
      });

      if (!response.ok) {
        throw new Error('Error al guardar la página');
      }

      const savedPage = await response.json();
      setPageData(updatedPageData);
      
      // If it's a new page, navigate to edit mode
      if (id === 'new') {
        navigate(`/admin/pages/${savedPage.id}`);
      }
    } catch (error) {
      console.error('Error saving page:', error);
      throw error;
    }
  };

  if (!pageData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando página...</p>
        </div>
      </div>
    );
  }

  return (
    <CraftEditor
      pageData={pageData}
      onSave={handleSave}
      onBack={() => navigate('/admin/dashboard')}
    />
  );
};

export default PageEditor;