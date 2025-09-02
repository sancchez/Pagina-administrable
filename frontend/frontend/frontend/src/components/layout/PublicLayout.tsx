import { Outlet, Link } from 'react-router-dom';
import { Droplets, FileText, Info } from 'lucide-react';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-green-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-800 via-blue-700 to-green-700 shadow-xl sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full shadow-lg group-hover:shadow-xl transition-all duration-300">
                <Droplets className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  Acueducto Municipal
                </h1>
                <p className="text-xs text-blue-100 font-medium">Agua Pura, Servicio Confiable</p>
              </div>
            </Link>

            {/* Navigation Menu */}
            <div className="flex items-center space-x-1">
              <Link
                to="/"
                className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-blue-100 hover:bg-white/10 hover:text-white"
              >
                Inicio
              </Link>
              <Link
                to="/quienes-somos"
                className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-blue-100 hover:bg-white/10 hover:text-white"
              >
                Quiénes Somos
              </Link>
              <Link
                to="/informacion-esal"
                className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-blue-100 hover:bg-white/10 hover:text-white"
              >
                Información ESAL
              </Link>
              <Link
                to="/operacion-gestion"
                className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-blue-100 hover:bg-white/10 hover:text-white"
              >
                Operación y Gestión
              </Link>
              <Link
                to="/portal-usuario"
                className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-blue-100 hover:bg-white/10 hover:text-white"
              >
                Portal del Usuario
              </Link>
              <Link
                to="/normatividad"
                className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-blue-100 hover:bg-white/10 hover:text-white"
              >
                Normatividad
              </Link>
              <Link
                to="/contacto"
                className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-blue-100 hover:bg-white/10 hover:text-white"
              >
                Contacto
              </Link>
              <Link
                to="/admin"
                className="ml-4 bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 hover:bg-white/30 hover:border-white/50 hover:shadow-lg"
              >
                Admin
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-blue-800 via-blue-900 to-green-800 text-white mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-white/20 p-2 rounded-full">
                  <Droplets className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Acueducto Municipal</h3>
                  <p className="text-sm text-blue-200">Agua Pura, Servicio Confiable</p>
                </div>
              </div>
              <p className="text-blue-100 text-sm leading-relaxed">
                Comprometidos con brindar agua potable de calidad a toda nuestra comunidad, 
                garantizando un servicio confiable, sostenible y accesible para todos.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-4 text-blue-200">Servicios</h3>
              <ul className="space-y-2 text-blue-100">
                <li className="text-sm">• Suministro de agua potable</li>
                <li className="text-sm">• Facturación electrónica</li>
                <li className="text-sm">• Atención al cliente</li>
                <li className="text-sm">• Mantenimiento de redes</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-4 text-blue-200">Contacto</h3>
              <div className="text-blue-100 space-y-2">
                <p className="text-sm">📞 (57) 123-456-789</p>
                <p className="text-sm">📧 info@acueducto.gov.co</p>
                <p className="text-sm">📍 Calle Principal #123, Centro</p>
                <p className="text-sm">🕒 Lun - Vie: 8:00 AM - 5:00 PM</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-blue-700 pt-6 mt-8 text-center text-blue-200">
            <p className="text-sm">&copy; 2025 Acueducto Municipal. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}