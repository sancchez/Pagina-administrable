import React from 'react';
import { useParams } from 'react-router-dom';

// Importar todas las páginas estáticas
import HomePage from '../pages/HomePage';
import Contacto from '../pages/Contacto';
import QuienesSomos from '../pages/QuienesSomos';
import InformacionESAL from '../pages/InformacionESAL';
import Normatividad from '../pages/Normatividad';
import OperacionGestion from '../pages/OperacionGestion';
import PortalUsuario from '../pages/PortalUsuario';
import InvoicePage from '../pages/InvoicePage';
import InvoiceQuery from '../pages/InvoiceQuery';

// Mapeo de slugs a componentes
const pageComponents: Record<string, React.ComponentType> = {
  'home': HomePage,
  'contacto': Contacto,
  'quienes-somos': QuienesSomos,
  'informacion-esal': InformacionESAL,
  'normatividad': Normatividad,
  'operacion-gestion': OperacionGestion,
  'portal-usuario': PortalUsuario,
  'invoice': InvoicePage,
  'invoice-query': InvoiceQuery,
  // Alias adicionales
  'inicio': HomePage,
  'nosotros': QuienesSomos,
  'contactanos': Contacto,
  'portal': PortalUsuario,
};

const PageRenderer: React.FC = () => {
  const { slug = 'home' } = useParams<{ slug: string }>();
  
  // Buscar el componente correspondiente al slug
  const PageComponent = pageComponents[slug.toLowerCase()];

  // Si no se encuentra la página, mostrar error 404
  if (!PageComponent) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Página no encontrada</h2>
          <p className="text-gray-600 mb-6">
            La página "{slug}" no existe o no está disponible.
          </p>
          <div className="text-sm text-gray-500 bg-gray-100 p-3 rounded">
            <strong>Páginas disponibles:</strong><br/>
            {Object.keys(pageComponents).join(', ')}
          </div>
          <a 
            href="/" 
            className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ir al inicio
          </a>
        </div>
      </div>
    );
  }

  // Renderizar el componente de la página
  return <PageComponent />;
};

export default PageRenderer;