import { Link } from 'react-router-dom';
import { Droplets, Phone, Mail, MapPin, Clock, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export default function Footer() {
  const quickLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Quiénes Somos', path: '/quienes-somos' },
    { name: 'Portal del Usuario', path: '/portal-usuario' },
    { name: 'Contacto', path: '/contacto' }
  ];

  const services = [
    'Suministro de Agua Potable',
    'Facturación y Recaudo',
    'Atención al Cliente',
    'Mantenimiento de Redes',
    'Control de Calidad'
  ];

  return (
    <footer className="bg-gradient-to-r from-blue-800 via-blue-900 to-green-800 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
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
            
            {/* Redes sociales */}
            <div className="flex space-x-3">
              <a href="#" className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-blue-200">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-blue-100 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Servicios */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-blue-200">Nuestros Servicios</h4>
            <ul className="space-y-2">
              {services.map((service) => (
                <li key={service} className="text-blue-100 text-sm">
                  {service}
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-blue-200">Contacto</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-blue-300" />
                <span className="text-blue-100 text-sm">(57) 123-456-789</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-blue-300" />
                <span className="text-blue-100 text-sm">info@acueducto.gov.co</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-blue-300 mt-0.5" />
                <span className="text-blue-100 text-sm">
                  Calle Principal #123<br />
                  Centro, Ciudad
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-4 w-4 text-blue-300" />
                <span className="text-blue-100 text-sm">
                  Lun - Vie: 8:00 AM - 5:00 PM
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="border-t border-blue-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-blue-200 text-sm">
              © 2025 Acueducto Municipal. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-blue-200 hover:text-white text-sm transition-colors">
                Política de Privacidad
              </a>
              <a href="#" className="text-blue-200 hover:text-white text-sm transition-colors">
                Términos de Servicio
              </a>
              <Link to="/admin" className="text-blue-200 hover:text-white text-sm transition-colors">
                Administración
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}