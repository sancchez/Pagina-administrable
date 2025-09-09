// Database utility functions for frontend API calls

// Backend server URL
const API_BASE_URL = 'http://localhost:3001';

interface Page {
  id: number;
  title: string;
  slug: string;
  content: string;
  metaDescription?: string;
  published: boolean;
  draftJson?: any;
  publishedJson?: any;
  createdAt: string;
  updatedAt: string;
}

// Get page by ID
export const getPageById = async (id: number): Promise<Page | null> => {
  console.log('🔄 [Database] Iniciando getPageById con ID:', id);
  console.log('🔍 [Database] ID type:', typeof id);
  console.log('🔍 [Database] ID value:', JSON.stringify(id));
  
  try {
    let token = localStorage.getItem('adminToken');
    
    // Limpiar token inválido si es el string 'undefined'
    if (token === 'undefined' || token === 'null' || !token) {
      console.log('🧹 [Database] Limpiando token inválido:', token);
      localStorage.removeItem('adminToken');
      localStorage.setItem('adminToken', 'mock-jwt-token-123');
      token = 'mock-jwt-token-123';
      console.log('✅ [Database] Token válido establecido');
    }
    
    console.log('🔑 [Database] Token obtenido:', token ? 'Presente' : 'Ausente');
    console.log('🔑 [Database] Token completo:', token);
    console.log('🔑 [Database] Tipo de token:', typeof token);
    console.log('🔑 [Database] Longitud del token:', token ? token.length : 0);
    
    const url = `${API_BASE_URL}/api/admin/pages/${id}`;
     console.log('📡 [Database] Enviando GET request a:', url);
     console.log('🌐 [Database] Full URL being called:', url);
     console.log('🌐 [Database] Backend URL:', API_BASE_URL);
     
     const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📡 [Database] Response status:', response.status);
    console.log('📡 [Database] Response statusText:', response.statusText);
    console.log('📡 [Database] Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      if (response.status === 404) {
        console.log('❌ [Database] Página no encontrada (404) para ID:', id);
        return null;
      }
      const errorData = await response.text();
      console.error('❌ [Database] Error en response:', response.status, response.statusText);
      console.error('❌ [Database] Error data:', errorData);
      console.error('❌ [Database] URL that failed:', url);
      throw new Error(`Error fetching page: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ [Database] Página obtenida exitosamente:', {
      id: result.id,
      title: result.title,
      slug: result.slug,
      hasDraftJson: !!result.draftJson,
      hasPublishedJson: !!result.publishedJson
    });
    
    return result;
  } catch (error) {
    console.error('❌ [Database] Error in getPageById:', error);
    throw error;
  }
};

// Update page
export const updatePage = async (id: number, pageData: Partial<Page>): Promise<Page> => {
  console.log('🔄 [Database] Iniciando updatePage con ID:', id);
  console.log('📊 [Database] Datos a actualizar:', {
    id,
    title: pageData.title,
    slug: pageData.slug,
    hasDraftJson: !!pageData.draftJson,
    draftJsonType: typeof pageData.draftJson,
    draftJsonSize: pageData.draftJson ? JSON.stringify(pageData.draftJson).length : 0
  });
  
  try {
    let token = localStorage.getItem('adminToken');
    
    // Limpiar token inválido si es el string 'undefined'
    if (token === 'undefined' || token === 'null' || !token) {
      console.log('🧹 [Database] Limpiando token inválido:', token);
      localStorage.removeItem('adminToken');
      localStorage.setItem('adminToken', 'mock-jwt-token-123');
      token = 'mock-jwt-token-123';
      console.log('✅ [Database] Token válido establecido');
    }
    
    console.log('🔑 [Database] Token obtenido:', token ? 'Presente' : 'Ausente');
    
    const requestBody = {
      ...pageData,
      updatedAt: new Date().toISOString()
    };
    
    console.log('📡 [Database] Enviando PUT request a:', `/api/admin/pages/${id}`);
    console.log('🌐 [Database] URL completa del request:', window.location.origin + `/api/admin/pages/${id}`);
    console.log('🔗 [Database] Base URL actual:', window.location.origin);
    console.log('📦 [Database] Body del request:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(`${API_BASE_URL}/api/admin/pages/${id}`, {
    method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📡 [Database] Response status:', response.status);
    console.log('📡 [Database] Response statusText:', response.statusText);
    console.log('📡 [Database] Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      console.error('❌ [Database] Response no exitosa, status:', response.status);
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('❌ [Database] Error data:', errorData);
      throw new Error(errorData.error || `Error updating page: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ [Database] Página actualizada exitosamente:', {
      id: result.id,
      title: result.title,
      updatedAt: result.updatedAt
    });
    
    return result;
  } catch (error) {
    console.error('❌ [Database] Error in updatePage:', error);
    throw error;
  }
};

// Create new page
export const createPage = async (pageData: Omit<Page, 'id' | 'createdAt' | 'updatedAt'>): Promise<Page> => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_BASE_URL}/api/admin/pages`, {
    method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...pageData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `Error creating page: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in createPage:', error);
    throw error;
  }
};

// Get all pages
export const getAllPages = async (): Promise<Page[]> => {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_BASE_URL}/api/admin/pages`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error fetching pages: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in getAllPages:', error);
    throw error;
  }
};

// Delete page
export const deletePage = async (id: number): Promise<boolean> => {
  try {
    const token = localStorage.getItem('adminToken');
    
    const response = await fetch(`${API_BASE_URL}/api/admin/pages/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting page:', error);
    throw error;
  }
};

// Get page by slug (for public pages)
export const getPageBySlug = async (slug: string): Promise<Page | null> => {
  console.log('🚀 [Database] getPageBySlug INICIADO:', { slug });
  
  try {
    const url = `${API_BASE_URL}/api/pages/${slug}`;
    console.log('📡 [Database] Construyendo URL:', { slug, url, API_BASE_URL });
    
    console.log('📡 [Database] Iniciando fetch request...');
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('📡 [Database] Fetch completado. Response info:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      url: response.url,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log('❌ [Database] Página no encontrada (404) para slug:', slug);
        return null;
      }
      
      let errorData;
      try {
        errorData = await response.text();
        console.error('❌ [Database] Error response body:', errorData);
      } catch (e) {
        console.error('❌ [Database] No se pudo leer error response body:', e);
        errorData = 'No se pudo leer el error';
      }
      
      console.error('❌ [Database] Error completo:', {
        status: response.status,
        statusText: response.statusText,
        url,
        errorData
      });
      
      throw new Error(`Error fetching page by slug: ${response.status} ${response.statusText}`);
    }

    console.log('📄 [Database] Parseando JSON response...');
    const result = await response.json();
    
    console.log('✅ [Database] JSON parseado exitosamente. Datos completos:', {
      fullResult: result,
      resultKeys: Object.keys(result),
      basicInfo: {
        id: result.id,
        title: result.title,
        slug: result.slug,
        published: result.published
      },
      contentInfo: {
        hasContent: !!result.content,
        contentLength: result.content ? result.content.length : 0,
        contentPreview: result.content ? result.content.substring(0, 100) + '...' : null
      },
      canvasInfo: {
        hasDraftJson: !!result.draftJson,
        hasPublishedJson: !!result.publishedJson,
        draftJsonType: typeof result.draftJson,
        publishedJsonType: typeof result.publishedJson,
        draftJsonKeys: result.draftJson && typeof result.draftJson === 'object' ? Object.keys(result.draftJson) : null,
        publishedJsonKeys: result.publishedJson && typeof result.publishedJson === 'object' ? Object.keys(result.publishedJson) : null
      }
    });
    
    return result;
  } catch (error) {
    console.error('❌ [Database] Error COMPLETO en getPageBySlug:', {
      error,
      errorMessage: error instanceof Error ? error.message : 'Error desconocido',
      errorStack: error instanceof Error ? error.stack : null,
      slug
    });
    throw error;
  }
 };