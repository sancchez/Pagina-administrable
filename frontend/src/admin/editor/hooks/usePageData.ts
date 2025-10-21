import { useState, useCallback } from 'react';
import { PageData, ApiResponse } from '../types';
import { normalizeError, ErrorInfo } from '../../../utils/errorHandler';
import HttpClient from '../../../utils/http';

export const usePageData = (slug?: string) => {
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorInfo | null>(null);

  const loadPageData = useCallback(async () => {
    if (!slug) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await HttpClient.get<ApiResponse<PageData>>(`/api/pages/${slug}`);
      
      if (response.data.success) {
        setPageData(response.data.data);
      } else {
        throw new Error(response.data.error || 'Error al cargar la página');
      }
    } catch (err) {
      const errorInfo = normalizeError(err);
      setError(errorInfo);
      console.error('Error cargando página:', errorInfo);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  return {
    pageData,
    loading,
    error,
    loadPageData,
    setPageData
  };
};