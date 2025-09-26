import { useState, memo, useCallback, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Droplets, AlertCircle } from 'lucide-react';

interface MenuItem {
  name: string;
  path: string;
  external?: boolean;
  disabled?: boolean;
}

interface NavigationError {
  path: string;
  message: string;
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

function Navbar() {
  const location = useLocation();
  const [navigationErrors, setNavigationErrors] = useState<NavigationError[]>([]);

  const menuItems: MenuItem[] = useMemo(() => [
    { name: 'Inicio', path: '/' },
    { name: 'Quiénes Somos', path: '/quienes-somos' },
    { name: 'Información ESAL', path: '/informacion-esal' },
    { name: 'Operación y Gestión', path: '/operacion-gestion' },
    { name: 'Portal del Usuario', path: '/portal-usuario' },
    { name: 'Normatividad', path: '/normatividad' },
    { name: 'Contacto', path: '/contacto' }
  ], []);

  // Validación de rutas
  const validatePath = useCallback((path: string): ValidationResult => {
    if (!path) {
      return { isValid: false, error: 'Ruta no puede estar vacía' };
    }
    
    if (!path.startsWith('/')) {
      return { isValid: false, error: 'Ruta debe comenzar con /' };
    }
    
    if (path.includes('//')) {
      return { isValid: false, error: 'Ruta no puede contener barras dobles' };
    }
    
    if (path.length > 100) {
      return { isValid: false, error: 'Ruta demasiado larga' };
    }
    
    return { isValid: true };
  }, []);

  // Validación de elementos del menú
  const validateMenuItem = useCallback((item: MenuItem): ValidationResult => {
    if (!item.name || item.name.trim().length === 0) {
      return { isValid: false, error: 'Nombre del elemento no puede estar vacío' };
    }
    
    if (item.name.length > 50) {
      return { isValid: false, error: 'Nombre del elemento demasiado largo' };
    }
    
    return validatePath(item.path);
  }, [validatePath]);

  // Elementos del menú validados
  const validatedMenuItems = useMemo(() => {
    return menuItems.map(item => {
      const validation = validateMenuItem(item);
      return {
        ...item,
        isValid: validation.isValid,
        error: validation.error
      };
    });
  }, [menuItems, validateMenuItem]);

  // Verificar si hay errores generales
  const hasNavigationErrors = useMemo(() => {
    return validatedMenuItems.some(item => !item.isValid) || navigationErrors.length > 0;
  }, [validatedMenuItems, navigationErrors]);

  const isActive = useCallback((path: string) => {
    return location.pathname === path;
  }, [location.pathname]);

  // Manejo de errores de navegación
  const handleNavigationError = useCallback((path: string, error: string) => {
    setNavigationErrors(prev => {
      const existing = prev.find(err => err.path === path);
      if (existing) {
        return prev.map(err => err.path === path ? { ...err, message: error } : err);
      }
      return [...prev, { path, message: error }];
    });
  }, []);

  const clearNavigationError = useCallback((path: string) => {
    setNavigationErrors(prev => prev.filter(err => err.path !== path));
  }, []);

  return (
    <>
      <nav className="bg-gradient-to-r from-blue-800 via-blue-700 to-green-700 shadow-xl sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center space-x-3 group"
              onClick={() => clearNavigationError('/')}
            >
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
              {validatedMenuItems.map((item) => {
                const hasError = !item.isValid;
                const navigationError = navigationErrors.find(err => err.path === item.path);
                
                return (
                  <div key={item.name} className="relative group">
                    <Link
                      to={item.path}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-1 ${
                        hasError
                          ? 'bg-red-500/20 text-red-200 border border-red-400/30'
                          : isActive(item.path)
                          ? 'bg-white/20 text-white shadow-md backdrop-blur-sm'
                          : 'text-blue-100 hover:bg-white/10 hover:text-white'
                      } ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={(e) => {
                        if (item.disabled || hasError) {
                          e.preventDefault();
                          if (hasError && item.error) {
                            handleNavigationError(item.path, item.error);
                          }
                          return;
                        }
                        clearNavigationError(item.path);
                      }}
                      title={hasError ? item.error : item.name}
                    >
                      <span>{item.name}</span>
                      {hasError && (
                        <AlertCircle className="h-3 w-3 text-red-300" />
                      )}
                    </Link>
                    
                    {/* Tooltip de error */}
                    {(hasError || navigationError) && (
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-red-600 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                        {item.error || navigationError?.message}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
      
      {/* Mensaje de error general */}
      {hasNavigationErrors && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <div>
              <p className="text-sm text-red-700">
                Se detectaron problemas en la navegación. Algunos enlaces pueden no funcionar correctamente.
              </p>
              {navigationErrors.length > 0 && (
                <ul className="mt-2 text-xs text-red-600">
                  {navigationErrors.map((error, index) => (
                    <li key={index}>• {error.path}: {error.message}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default memo(Navbar);