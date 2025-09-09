import React from 'react';

const TestPage: React.FC = () => {
  return (
    <div style={{ padding: '20px', backgroundColor: 'white', minHeight: '100vh' }}>
      <h1 style={{ color: 'red', fontSize: '32px', marginBottom: '20px' }}>PÁGINA DE PRUEBA</h1>
      <p style={{ color: 'black', fontSize: '18px', marginBottom: '10px' }}>
        Esta es una página de prueba para verificar que el renderizado funciona correctamente.
      </p>
      <div style={{ backgroundColor: 'lightblue', padding: '20px', borderRadius: '8px' }}>
        <h2 style={{ color: 'darkblue', fontSize: '24px', marginBottom: '10px' }}>Información de Prueba</h2>
        <p style={{ color: 'darkblue', fontSize: '16px' }}>
          Si puedes ver este contenido, significa que el sistema de renderizado está funcionando.
        </p>
      </div>
    </div>
  );
};

export default TestPage;