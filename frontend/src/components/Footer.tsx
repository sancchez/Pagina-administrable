import { useState, memo, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Droplets, Phone, Mail, MapPin, Clock, Facebook, Twitter, Instagram, Youtube, AlertCircle } from 'lucide-react';

interface QuickLink {
  name: string;
  path: string;
  external?: boolean;
}

interface SocialLink {
  name: string;
  url: string;
  icon: React.ComponentType<any>;
}

interface ContactInfo {
  type: 'phone' | 'email' | 'address' | 'hours';
  value: string;
  icon: React.ComponentType<any>;
}

interface ValidationError {
  field: string;
  message: string;
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

function Footer() {
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const quickLinks: QuickLink[] = useMemo(() => [
    { name: 'Inicio', path: '/' },
    { name: 'Quiénes Somos', path: '/quienes-somos' },
    { name: 'Portal del Usuario', path: '/portal-usuario' },
    { name: 'Contacto', path: '/contacto' }
  ], []);

  const socialLinks: SocialLink[] = useMemo(() => [
    { name: 'Facebook', url: 'https://facebook.com/acueducto', icon: Facebook },
    { name: 'Twitter', url: 'https://twitter.com/acueducto', icon: Twitter },
    { name: 'Instagram', url: 'https://instagram.com/acueducto', icon: Instagram },
    { name: 'YouTube', url: 'https://youtube.com/acueducto', icon: Youtube }
  ], []);

  const contactInfo: ContactInfo[] = useMemo(() => [
    { type: 'phone', value: '(57) 123-456-789', icon: Phone },
    { type: 'email', value: 'info@acueducto.gov.co', icon: Mail },
    { type: 'address', value: 'Calle Principal #123\nCentro, Ciudad', icon: MapPin },
    { type: 'hours', value: 'Lun - Vie: 8:00 AM - 5:00 PM', icon: Clock }
  ], []);

  const services = useMemo(() => [
    'Suministro de Agua Potable',
    'Facturación y Recaudo',
    'Atención al Cliente',
    'Mantenimiento de Redes',
    'Control de Calidad'
  ], []);

  // Validación de URLs
  const validateUrl = useCallback((url: string): ValidationResult => {
    if (!url) {
      return { isValid: false, error: 'URL no puede estar vacía' };
    }
    
    try {
      new URL(url);
      return { isValid: true };
    } catch {
      return { isValid: false, error: 'URL no válida' };
    }
  }, []);

  // Validación de rutas internas
  const validatePath = useCallback((path: string): ValidationResult => {
    if (!path) {
      return { isValid: false, error: 'Ruta no puede estar vacía' };
    }
    
    if (!path.startsWith('/')) {
      return { isValid: false, error: 'Ruta debe comenzar con /' };
    }
    
    return { isValid: true };
  }, []);

  // Validación de email
  const validateEmail = useCallback((email: string): ValidationResult => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
      return { isValid: false, error: 'Email no puede estar vacío' };
    }
    
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Formato de email inválido' };
    }
    
    return { isValid: true };
  }, []);

  // Validación de teléfono
  const validatePhone = useCallback((phone: string): ValidationResult => {
    const phoneRegex = /^\([0-9]{2}\)\s[0-9]{3}-[0-9]{3}-[0-9]{3}$/;
    
    if (!phone) {
      return { isValid: false, error: 'Teléfono no puede estar vacío' };
    }
    
    if (!phoneRegex.test(phone)) {
      return { isValid: false, error: 'Formato de teléfono inválido' };
    }
    
    return { isValid: true };
  }, []);

  // Validación de información de contacto
  const validateContactInfo = useCallback((contact: ContactInfo): ValidationResult => {
    switch (contact.type) {
      case 'email':
        return validateEmail(contact.value);
      case 'phone':
        return validatePhone(contact.value);
      case 'address':
      case 'hours':
        return contact.value.trim().length > 0 
          ? { isValid: true } 
          : { isValid: false, error: 'Campo no puede estar vacío' };
      default:
        return { isValid: true };
    }
  }, [validateEmail, validatePhone]);

  // Enlaces rápidos validados
  const validatedQuickLinks = useMemo(() => {
    return quickLinks.map(link => {
      const validation = validatePath(link.path);
      return {
        ...link,
        isValid: validation.isValid,
        error: validation.error
      };
    });
  }, [quickLinks, validatePath]);

  // Enlaces sociales validados
  const validatedSocialLinks = useMemo(() => {
    return socialLinks.map(link => {
      const validation = validateUrl(link.url);
      return {
        ...link,
        isValid: validation.isValid,
        error: validation.error
      };
    });
  }, [socialLinks, validateUrl]);

  // Información de contacto validada
  const validatedContactInfo = useMemo(() => {
    return contactInfo.map(contact => {
      const validation = validateContactInfo(contact);
      return {
        ...contact,
        isValid: validation.isValid,
        error: validation.error
      };
    });
  }, [contactInfo, validateContactInfo]);

  // Verificar si hay errores generales
  const hasValidationErrors = useMemo(() => {
    return validatedQuickLinks.some(link => !link.isValid) ||
           validatedSocialLinks.some(link => !link.isValid) ||
           validatedContactInfo.some(contact => !contact.isValid) ||
           validationErrors.length > 0;
  }, [validatedQuickLinks, validatedSocialLinks, validatedContactInfo, validationErrors]);

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
    <footer className="bg-gradient-to-r from-blue-800 via-blue-900 to-green-800 text-white">
      {/* Mostrar errores generales de validación */}
      {hasValidationErrors && (
        <div className="bg-red-600 text-white px-4 py-2 text-sm">
          <div className="container mx-auto flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            <span>Se detectaron errores en la información del footer. Revise los enlaces y datos de contacto.</span>
          </div>
        </div>
      )}
      
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
              {validatedSocialLinks.map((social, index) => {
                const IconComponent = social.icon;
                return (
                  <div key={index} className="relative">
                    <a 
                      href={social.url} 
                      className={`p-2 rounded-full transition-colors ${
                        social.isValid 
                          ? 'bg-white/10 hover:bg-white/20' 
                          : 'bg-red-500/20 hover:bg-red-500/30'
                      }`}
                      title={social.error || social.name}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <IconComponent className="h-4 w-4" />
                      {!social.isValid && (
                        <AlertCircle className="h-2 w-2 absolute -top-1 -right-1 text-red-400" />
                      )}
                    </a>
                    {social.error && (
                      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-xs px-2 py-1 rounded shadow-lg z-10 opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap">
                        {social.error}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-blue-200">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              {validatedQuickLinks.map((link, index) => (
                <li key={index} className="relative">
                  <Link
                    to={link.path}
                    className={`text-sm transition-colors ${
                      link.isValid 
                        ? 'text-blue-100 hover:text-white' 
                        : 'text-red-300 hover:text-red-100'
                    }`}
                    title={link.error || undefined}
                  >
                    {link.name}
                    {!link.isValid && (
                      <AlertCircle className="h-3 w-3 ml-1 inline text-red-400" />
                    )}
                  </Link>
                  {link.error && (
                    <div className="absolute left-0 top-full mt-1 bg-red-600 text-white text-xs px-2 py-1 rounded shadow-lg z-10 opacity-0 hover:opacity-100 transition-opacity">
                      {link.error}
                    </div>
                  )}
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
              {validatedContactInfo.map((contact, index) => {
                const IconComponent = contact.icon;
                return (
                  <div key={index} className="flex items-start space-x-3 relative">
                    <IconComponent className={`h-4 w-4 mt-0.5 ${
                      contact.isValid ? 'text-blue-300' : 'text-red-400'
                    }`} />
                    <div className="flex-1">
                      <span className={`text-sm ${
                        contact.isValid ? 'text-blue-100' : 'text-red-300'
                      }`}>
                        {contact.type === 'address' ? (
                          contact.value.split('\n').map((line, i) => (
                            <span key={i}>
                              {line}
                              {i < contact.value.split('\n').length - 1 && <br />}
                            </span>
                          ))
                        ) : (
                          contact.value
                        )}
                        {!contact.isValid && (
                          <AlertCircle className="h-3 w-3 ml-1 inline text-red-400" />
                        )}
                      </span>
                      {contact.error && (
                        <div className="absolute left-0 top-full mt-1 bg-red-600 text-white text-xs px-2 py-1 rounded shadow-lg z-10 opacity-0 hover:opacity-100 transition-opacity">
                          {contact.error}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
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
};

export default memo(Footer);