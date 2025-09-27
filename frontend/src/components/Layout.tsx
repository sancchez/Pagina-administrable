import React from 'react';
import { Link } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-blue-100">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  Acueducto Municipal
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/"
                  className="border-transparent text-gray-600 hover:border-blue-300 hover:text-blue-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                >
                  Inicio
                </Link>
                <Link
                  to="/quienes-somos"
                  className="border-transparent text-gray-600 hover:border-blue-300 hover:text-blue-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                >
                  Quiénes Somos
                </Link>
                <Link
                  to="/informacion-esal"
                  className="border-transparent text-gray-600 hover:border-blue-300 hover:text-blue-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                >
                  Información ESAL
                </Link>
                <Link
                  to="/operacion-gestion"
                  className="border-transparent text-gray-600 hover:border-blue-300 hover:text-blue-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                >
                  Operación y Gestión
                </Link>
                <Link
                  to="/portal-usuario"
                  className="border-transparent text-gray-600 hover:border-blue-300 hover:text-blue-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                >
                  Portal Usuario
                </Link>
                <Link
                  to="/normatividad"
                  className="border-transparent text-gray-600 hover:border-blue-300 hover:text-blue-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                >
                  Normatividad
                </Link>
                <Link
                  to="/contacto"
                  className="border-transparent text-gray-600 hover:border-blue-300 hover:text-blue-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                >
                  Contacto
                </Link>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-blue-900 to-green-900 text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-blue-200 to-green-200 bg-clip-text text-transparent">
                Acueducto Municipal
              </h3>
              <p className="text-blue-100">
                Comprometidos con brindar servicios de agua potable de calidad para nuestra comunidad, 
                garantizando el acceso continuo y confiable al recurso hídrico.
              </p>
            </div>
            <div>
              <h4 className="text-md font-semibold mb-4 text-green-200">Servicios</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/portal-usuario" className="text-blue-100 hover:text-white transition-colors">
                    Portal Usuario
                  </Link>
                </li>
                <li>
                  <Link to="/quienes-somos" className="text-blue-100 hover:text-white transition-colors">
                    Quiénes Somos
                  </Link>
                </li>
                <li>
                  <Link to="/contacto" className="text-blue-100 hover:text-white transition-colors">
                    Contacto
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-md font-semibold mb-4 text-green-200">Información</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/informacion-esal" className="text-blue-100 hover:text-white transition-colors">
                    Información ESAL
                  </Link>
                </li>
                <li>
                  <Link to="/operacion-gestion" className="text-blue-100 hover:text-white transition-colors">
                    Operación y Gestión
                  </Link>
                </li>
                <li>
                  <Link to="/normatividad" className="text-blue-100 hover:text-white transition-colors">
                    Normatividad
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-blue-800">
            <p className="text-center text-blue-200">
              © 2024 Acueducto Municipal. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;