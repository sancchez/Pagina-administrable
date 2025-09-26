import React, { useState } from 'react';
import { updatePage, getPageById } from '../utils/database';
import { handleError } from '../utils/errorHandler';

export const TestAPI: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testGetPage = async () => {
    setLoading(true);
    try {
      // Asegurar que hay un token válido
      localStorage.setItem('adminToken', 'mock-jwt-token-123');
      console.log('🧪 [TestAPI] Token establecido en localStorage');
      
      console.log('🧪 [TestAPI] Probando getPageById(2)');
      const page = await getPageById(2);
      console.log('🧪 [TestAPI] Resultado getPageById:', page);
      setResult(`GET exitoso: ${JSON.stringify(page, null, 2)}`);
    } catch (error) {
      console.error('🧪 [TestAPI] Error en getPageById:', error);
      handleError(error, 'TestAPI.testGetPage');
      setResult(`GET falló: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testUpdatePage = async () => {
    setLoading(true);
    try {
      // Asegurar que hay un token válido
      localStorage.setItem('adminToken', 'mock-jwt-token-123');
      console.log('🧪 [TestAPI] Token establecido en localStorage');
      
      console.log('🧪 [TestAPI] Probando updatePage(2)');
      const updatedPage = await updatePage(2, {
        title: 'Test Update',
        updatedAt: new Date().toISOString()
      });
      console.log('🧪 [TestAPI] Resultado updatePage:', updatedPage);
      setResult(`PUT exitoso: ${JSON.stringify(updatedPage, null, 2)}`);
    } catch (error) {
      console.error('🧪 [TestAPI] Error en updatePage:', error);
      handleError(error, 'TestAPI.testUpdatePage');
      setResult(`PUT falló: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testDirectFetch = async () => {
    setLoading(true);
    try {
      console.log('🧪 [TestAPI] Probando fetch directo PUT');
      const response = await fetch('http://localhost:3000/api/admin/pages/2', {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer mock-jwt-token-123',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: 'Direct Test Update',
          updatedAt: new Date().toISOString()
        })
      });
      
      console.log('🧪 [TestAPI] Response status:', response.status);
      console.log('🧪 [TestAPI] Response headers:', Object.fromEntries(response.headers.entries()));
      
      const data = await response.json();
      console.log('🧪 [TestAPI] Response data:', data);
      
      setResult(`Direct PUT: Status ${response.status}, Data: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      console.error('🧪 [TestAPI] Error en fetch directo:', error);
      handleError(error, 'TestAPI.testDirectFetch');
      setResult(`Direct PUT falló: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Test API Endpoints</h2>
      
      <div className="space-y-4">
        <button
          onClick={testGetPage}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test GET Page (ID: 2)
        </button>
        
        <button
          onClick={testUpdatePage}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test UPDATE Page (ID: 2)
        </button>
        
        <button
          onClick={testDirectFetch}
          disabled={loading}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Test Direct PUT Fetch
        </button>
      </div>
      
      {loading && (
        <div className="mt-4 p-3 bg-yellow-100 rounded">
          <p>Ejecutando prueba...</p>
        </div>
      )}
      
      {result && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <h3 className="font-semibold mb-2">Resultado:</h3>
          <pre className="text-sm overflow-auto">{result}</pre>
        </div>
      )}
    </div>
  );
};