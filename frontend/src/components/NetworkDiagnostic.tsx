import React, { useState, useEffect } from 'react';

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
}

export const NetworkDiagnostic: React.FC = () => {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const diagnostics: DiagnosticResult[] = [];

    // Test 1: Direct API call
    try {
      const response = await fetch('http://localhost:3000/api/pages/home');
      if (response.ok) {
        diagnostics.push({
          test: 'Conexión API (Proxy)',
          status: 'success',
          message: 'La conexión a través del proxy funciona correctamente'
        });
      } else {
        diagnostics.push({
          test: 'Conexión API (Proxy)',
          status: 'error',
          message: `Error HTTP: ${response.status} - ${response.statusText}`
        });
      }
    } catch (error: any) {
      diagnostics.push({
        test: 'Conexión API (Proxy)',
        status: 'error',
        message: `Error de conexión: ${error.message}`
      });
    }

    // Test 2: Direct backend call
    try {
      const response = await fetch('http://localhost:3000/api/pages/home');
      if (response.ok) {
        diagnostics.push({
          test: 'Conexión Directa Backend',
          status: 'success',
          message: 'El backend responde correctamente'
        });
      } else {
        diagnostics.push({
          test: 'Conexión Directa Backend',
          status: 'error',
          message: `Error HTTP: ${response.status}`
        });
      }
    } catch (error: any) {