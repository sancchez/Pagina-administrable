// HTTP utility for centralized API configuration with validations
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Type definitions for API responses
interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  success?: boolean;
}

interface PageData {
  id: string;
  slug: string;
  title: string;
  draft_json?: string;
  published_json?: string;
  created_at: string;
  updated_at: string;
}

interface CreatePageRequest {
  slug: string;
  title: string;
}

// Interfaces para validaciones HTTP
interface HttpValidationResult {
  valid: boolean;
  error?: string;
  warnings?: string[];
}

interface RequestValidation {
  endpoint: string;
  method: string;
  data?: unknown;
  headers?: HeadersInit;
}

interface ResponseValidation {
  status: number;
  data: unknown;
  headers: Headers;
}

/**
 * Validar endpoint de API
 */
function validateEndpoint(endpoint: string): HttpValidationResult {
  const warnings: string[] = [];
  
  // Validar formato básico
  if (!endpoint || typeof endpoint !== 'string') {
    return {
      valid: false,
      error: 'El endpoint debe ser una cadena válida'
    };
  }
  
  // Debe empezar con /
  if (!endpoint.startsWith('/')) {
    return {
      valid: false,
      error: 'El endpoint debe empezar con "/"'
    };
  }
  
  // Validar caracteres peligrosos
  const dangerousChars = /[<>'"&]/;
  if (dangerousChars.test(endpoint)) {
    return {
      valid: false,
      error: 'El endpoint contiene caracteres peligrosos'
    };
  }
  
  // Advertencias
  if (endpoint.length > 200) {
    warnings.push('El endpoint es muy largo');
  }
  
  if (endpoint.includes('//')) {
    warnings.push('El endpoint contiene barras dobles');
  }
  
  return {
    valid: true,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

/**
 * Validar datos de request
 */
function validateRequestData(data: unknown, method: string): HttpValidationResult {
  const warnings: string[] = [];
  
  // GET y DELETE no deberían tener body
  if ((method === 'GET' || method === 'DELETE') && data !== undefined) {
    warnings.push(`Método ${method} no debería incluir datos en el body`);
  }
  
  // POST y PUT deberían tener datos
  if ((method === 'POST' || method === 'PUT') && data === undefined) {
    warnings.push(`Método ${method} generalmente requiere datos en el body`);
  }
  
  // Validar tamaño de datos
  if (data) {
    try {
      const jsonString = JSON.stringify(data);
      const sizeInBytes = new Blob([jsonString]).size;
      
      // Advertir sobre payloads grandes (>1MB)
      if (sizeInBytes > 1024 * 1024) {
        warnings.push('El payload es muy grande (>1MB)');
      }
      
      // Error para payloads extremadamente grandes (>10MB)
      if (sizeInBytes > 10 * 1024 * 1024) {
        return {
          valid: false,
          error: 'El payload es demasiado grande (>10MB)'
        };
      }
    } catch (error) {
      return {
        valid: false,
        error: 'Los datos no se pueden serializar a JSON'
      };
    }
  }
  
  return {
    valid: true,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

/**
 * Validar respuesta HTTP
 */
function validateResponse(validation: ResponseValidation): HttpValidationResult {
  const warnings: string[] = [];
  
  // Validar códigos de estado
  if (validation.status < 100 || validation.status >= 600) {
    return {
      valid: false,
      error: `Código de estado HTTP inválido: ${validation.status}`
    };
  }
  
  // Advertencias para códigos específicos
  if (validation.status >= 400) {
    warnings.push(`Respuesta de error: ${validation.status}`);
  }
  
  if (validation.status === 204 && validation.data) {
    warnings.push('Respuesta 204 No Content contiene datos');
  }
  
  // Validar headers importantes
  const contentType = validation.headers.get('content-type');
  if (validation.data && !contentType) {
    warnings.push('Respuesta con datos pero sin Content-Type');
  }
  
  if (contentType && !contentType.includes('application/json') && validation.data) {
    warnings.push('Content-Type no es JSON pero se esperan datos JSON');
  }
  
  return {
    valid: true,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

/**
 * Validar token de autenticación
 */
function validateAuthToken(token: string | null): HttpValidationResult {
  if (!token) {
    return {
      valid: false,
      error: 'Token de autenticación requerido'
    };
  }
  
  if (token === 'undefined' || token === 'null') {
    return {
      valid: false,
      error: 'Token de autenticación inválido'
    };
  }
  
  if (token.length < 10) {
    return {
      valid: false,
      error: 'Token de autenticación demasiado corto'
    };
  }
  
  return { valid: true };
}

export class HttpClient {
  private static getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('adminToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  private static async handleRequest<T = unknown>(
    endpoint: string, 
    options: RequestInit & { method: string; body?: string }
  ): Promise<T> {
    // Validar endpoint
    const endpointValidation = validateEndpoint(endpoint);
    if (!endpointValidation.valid) {
      throw new Error(`Endpoint inválido: ${endpointValidation.error}`);
    }
    
    // Validar datos si existen
    let requestData: unknown;
    if (options.body) {
      try {
        requestData = JSON.parse(options.body);
      } catch {
        requestData = options.body;
      }
    }
    
    const dataValidation = validateRequestData(requestData, options.method);
    if (!dataValidation.valid) {
      throw new Error(`Datos de request inválidos: ${dataValidation.error}`);
    }
    
    // Realizar request
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    // Validar respuesta
    let responseData: unknown;
    try {
      responseData = await response.json();
    } catch {
      responseData = null;
    }
    
    const responseValidation = validateResponse({
      status: response.status,
      data: responseData,
      headers: response.headers
    });
    
    if (!response.ok) {
      const status = response?.status || 'Unknown';
      const statusText = response?.statusText || 'Unknown Error';
      throw new Error(`HTTP ${status}: ${statusText}`);
    }
    
    // Log warnings si existen
    if (endpointValidation.warnings) {
      console.warn('Advertencias de endpoint:', endpointValidation.warnings);
    }
    if (dataValidation.warnings) {
      console.warn('Advertencias de datos:', dataValidation.warnings);
    }
    if (responseValidation.warnings) {
      console.warn('Advertencias de respuesta:', responseValidation.warnings);
    }
    
    return responseData as T;
  }

  static async get<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.handleRequest<T>(endpoint, {
      method: 'GET',
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers
      },
      ...options
    });
  }

  static async post<T = unknown>(endpoint: string, data?: unknown, options: RequestInit = {}): Promise<T> {
    return this.handleRequest<T>(endpoint, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options
    });
  }

  static async put<T = unknown>(endpoint: string, data?: unknown, options: RequestInit = {}): Promise<T> {
    return this.handleRequest<T>(endpoint, {
      method: 'PUT',
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options
    });
  }

  static async delete<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.handleRequest<T>(endpoint, {
      method: 'DELETE',
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers
      },
      ...options
    });
  }

  // Convenience methods for admin endpoints
  static async getAdminPage(slug: string): Promise<PageData> {
    return this.get<PageData>(`/api/admin/pages/by-slug/${slug}`);
  }

  static async savePageDraft(slug: string, data: unknown): Promise<PageData> {
    return this.put<PageData>(`/api/admin/pages/${slug}`, { draft_json: data });
  }

  static async publishPage(slug: string): Promise<PageData> {
    return this.post<PageData>(`/api/admin/pages/${slug}/publish`);
  }

  static async migratePageFromHtml(slug: string): Promise<ApiResponse<PageData>> {
    return this.post<ApiResponse<PageData>>('/api/admin/migrate-html', { slug });
  }

  // New convenience methods for page management
  static async listPages(): Promise<PageData[]> {
    return this.get<PageData[]>('/api/admin/pages');
  }

  static async createPage(data: CreatePageRequest): Promise<PageData> {
    return this.post<PageData>('/api/admin/pages', data);
  }

  static async deletePage(identifier: string): Promise<ApiResponse> {
    return this.delete<ApiResponse>(`/api/admin/pages/${identifier}`);
  }
}

export default HttpClient;