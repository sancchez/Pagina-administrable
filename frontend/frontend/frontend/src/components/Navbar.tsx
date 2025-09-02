import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Droplets } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  const menuItems = [
    { name: 'Inicio', path: '/' },
    { name: 'Quiénes Somos', path: '/quienes-somos' },
    { name: 'Información ESAL', path: '/informacion-esal' },
    { name: 'Operación y Gestión', path: '/operacion-gestion' },
    { name: 'Portal del Usuario', path: '/portal-usuario' },
    { name: 'Normatividad', path: '/normatividad' },
    { name: 'Contacto', path: '/contacto' }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-gradient-to-r from-blue-800 via-blue-700 to-green-700 shadow-xl sticky top-0 z-50">
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
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-white/20 text-white shadow-md backdrop-blur-sm'
                    : 'text-blue-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}