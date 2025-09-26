import { Outlet, Link } from 'react-router-dom';
import { Droplets, AlertCircle } from 'lucide-react';
import { useState, useCallback, useMemo, memo } from 'react';

// Interfaces para validación
interface NavigationItem {
  name: string;
  path: string;
  isSpecial?: boolean;
}

interface ValidationError {
  field: string;
  message: string;
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

function PublicLayout() {
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  // Elementos de navegación memoizados
  const navigationItems: NavigationItem[] = useMemo(() => [
    { name: 'Inicio', path: '/' },
    { name: 'Quiénes Somos', path: '/quienes-somos' },
    { name: 'Información ESAL', path: '/informacion-esal' },
    { name: 'Operación y Gestión', path: '/operacion-gestion' },
    { name: 'Portal del Usuario', path: '/portal-usuario' },
    { name: 'Normatividad', path: '/normatividad' },
    { name: 'Contacto', path: '/contacto' },
    { name: 'Admin', path: '/admin', isSpecial: true }
  ], []);

  // Validación de rutas
  const validatePath = useCallback((path: string): ValidationResult => {
    if (!path) {
      return { isValid: false, error: 'Ruta no puede estar vacía' };
    }
    
    if (!path.startsWith('/')) {
      return { isValid: false, error: 'Ruta debe comenzar con /' };
    }
    
    // Validar caracteres permitidos en rutas
    const validPathRegex = /^[a-zA-Z0-9\-_\/]+$/;
    if (!validPathRegex.test(path)) {
      return { isValid: false, error: 'Ruta contiene caracteres no válidos' };
    }
    
    return { isValid: true };
  }, []);

  // Validación de elementos de navegación
  const validateNavigationItem = useCallback((item: NavigationItem): ValidationResult => {
    if (!item.name || item.name.trim().length === 0) {
      return { isValid: false, error: 'Nombre del elemento no puede estar vacío' };
    }
    
    return validatePath(item.path);
  }, [validatePath]);

  // Elementos de navegación validados
  const validatedNavigationItems = useMemo(() => {
    return navigationItems.map(item => {
      const validation = validateNavigationItem(item);
      return {
        ...item,
        isValid: validation.isValid,
        error: validation.error
      };
    });
  }, [navigationItems, validateNavigationItem]);

  // Verificar si hay errores de validación
  const hasValidationErrors = useMemo(() => {
    return validatedNavigationItems.some(item => !item.isValid) || validationErrors.length > 0;
  }, [validatedNavigationItems, validationErrors]);

  // Manejo de errores de validación
  const handleValidationError = useCallback((field: string, error: string) => {
    setValidationErrors(prev => {
      const existing = prev.find(err => err.field === field);
      if (existing) {
        return prev.map(err => err.field === field ? { ...err, message: error } : err);
      }
      return [...prev, { field, message: error }];
    });
  }, []);

  const clearValidationError = useCallback((field: string) => {
    setValidationErrors(prev => prev.filter(err => err.field !== field));
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-green-100">
      {/* Errores de validación generales */}
      {hasValidationErrors && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-700 font-medium">Errores de validación en la navegación</p>
          </div>
          <div className="mt-2 text-sm text-red-600">
            {validatedNavigationItems
              .filter(item => !item.isValid)
              .map((item, index) => (
                <div key={index} className="mt-1">
                  • {item.name}: {item.error}
                </div>
              ))}
            {validationErrors.map((error, index) => (
              <div key={index} className="mt-1">
                • {error.field}: {error.message}
              </div>
            ))}
          </div>
        </div>
      )}

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
              {validatedNavigationItems.map((item, index) => {
                const baseClasses = "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200";
                const validClasses = item.isSpecial
                  ? "ml-4 bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 hover:bg-white/30 hover:border-white/50 hover:shadow-lg"
                  : "text-blue-100 hover:bg-white/10 hover:text-white";
                const invalidClasses = "text-red-200 bg-red-500/20 border border-red-400/30";
                
                return (
                  <div key={index} className="relative group">
                    <Link
                      to={item.isValid ? item.path : '#'}
                      className={`${baseClasses} ${
                        item.isValid ? validClasses : invalidClasses
                      }`}
                      onClick={(e) => {
                        if (!item.isValid) {
                          e.preventDefault();
                          handleValidationError(`nav-${index}`, item.error || 'Error de validación');
                        }
                      }}
                    >
                      {item.name}
                      {!item.isValid && (
                        <AlertCircle className="inline-block ml-1 h-3 w-3" />
                      )}
                    </Link>
                    
                    {/* Tooltip de error */}
                    {!item.isValid && item.error && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-red-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                        {item.error}
                      </div>
                    )}
                  </div>
                );
              })}
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

export default memo(PublicLayout);