import React from 'react';

const SimpleTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-green-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Sistema de Páginas Funcionando</h1>
        <p className="text-lg text-gray-600">El nuevo sistema de páginas dinámicas está operativo</p>
        <div className="mt-8 p-4 bg-white rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-2">Componentes Creados:</h2>
          <ul className="text-left space-y-1">
            <li>✅ DynamicPageContainer</li>
            <li>✅ ContentRenderer</li>
            <li>✅ LoadingState</li>
            <li>✅ ErrorState</li>
            <li>✅ PageDataLoader</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SimpleTest;