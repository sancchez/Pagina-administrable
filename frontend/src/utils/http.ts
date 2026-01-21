// HTTP Client para comunicación con el backend
class HttpClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  // Normalizar URL eliminando barras duplicadas
  private normalizeURL(endpoint: string): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${this.baseURL}${cleanEndpoint}`;
  }

  // Obtener token de autenticación del localStorage
  private getAuthToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  // Preparar headers con autenticación si está disponible
  private getHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
    const headers = { ...this.defaultHeaders, ...customHeaders };
    const token = this.getAuthToken();

    if (token) {
      headers.Authorization = `Bearer ${token}`;
      console.log('HttpClient: Token agregado a headers');
    } else {
      console.warn('HttpClient: No se encontró token en localStorage');
    }

    return headers;
  }

  // Manejar respuestas HTTP
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Si es error 401, verificar si hay token
      if (response.status === 401) {
        const token = this.getAuthToken();
        console.error('Error 401 - Token presente:', !!token);
        if (token) {
          console.error('Token value:', token.substring(0, 20) + '...');
        }
        throw new Error(errorData.message || 'Token de acceso requerido');
      }

      throw new Error(errorData.message || `HTTP Error: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }

    return response.text() as unknown as T;
  }

  // GET request
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    let url = this.normalizeURL(endpoint);

    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  // POST request
  async post<T>(endpoint: string, data?: any, customHeaders?: Record<string, string>): Promise<T> {
    const response = await fetch(this.normalizeURL(endpoint), {
      method: 'POST',
      headers: this.getHeaders(customHeaders),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  // PUT request
  async put<T>(endpoint: string, data?: any, customHeaders?: Record<string, string>): Promise<T> {
    const response = await fetch(this.normalizeURL(endpoint), {
      method: 'PUT',
      headers: this.getHeaders(customHeaders),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  // PATCH request
  async patch<T>(endpoint: string, data?: any, customHeaders?: Record<string, string>): Promise<T> {
    const response = await fetch(this.normalizeURL(endpoint), {
      method: 'PATCH',
      headers: this.getHeaders(customHeaders),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(this.normalizeURL(endpoint), {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  // Upload file
  async uploadFile<T>(endpoint: string, file: File, additionalData?: Record<string, string>): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const headers = this.getHeaders();
    // Remove Content-Type header to let browser set it with boundary for FormData
    delete headers['Content-Type'];

    const response = await fetch(this.normalizeURL(endpoint), {
      method: 'POST',
      headers,
      body: formData,
    });

    return this.handleResponse<T>(response);
  }

  // Download file
  async downloadFile(endpoint: string, filename?: string): Promise<void> {
    const response = await fetch(this.normalizeURL(endpoint), {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

// Instancia por defecto del cliente HTTP
const httpClient = new HttpClient();

export default httpClient;
export { HttpClient };