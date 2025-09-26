import React, { useState, memo, useCallback, useMemo } from 'react';
import { useNode } from '@craftjs/core';
import { Mail, Phone, MapPin, Clock, Send, AlertCircle } from 'lucide-react';
import { ContactBlockProps } from '../../types/blocks';

interface ContactInfo {
  type: 'email' | 'phone' | 'address' | 'hours';
  label: string;
  value: string;
  icon?: string;
}

interface FormErrors {
  [key: string]: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: FormErrors;
}

interface ExtendedContactBlockProps extends ContactBlockProps {
  contactInfo?: ContactInfo[];
  formFields?: Array<{
    name: string;
    label: string;
    type: 'text' | 'email' | 'tel' | 'textarea';
    required?: boolean;
    placeholder?: string;
  }>;
}

const ContactBlock: React.FC<ExtendedContactBlockProps> = memo(({
  title = "Contáctanos",
  subtitle = "Estamos aquí para ayudarte",
  contactInfo = [],
  formFields = [],
  submitText = "Enviar Mensaje",
  backgroundColor = "bg-gray-50",
  showMap = false,
  mapEmbedUrl
}) => {
  const {
    connectors: { connect, drag },
    selected
  } = useNode((state) => ({
    selected: state.events.selected
  }));

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const getContactIcon = useCallback((type: string) => {
    switch (type) {
      case 'email': return Mail;
      case 'phone': return Phone;
      case 'address': return MapPin;
      case 'hours': return Clock;
      default: return Mail;
    }
  }, []);

  // Función de validación de email
  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  // Función de validación de teléfono
  const validatePhone = useCallback((phone: string): boolean => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }, []);

  // Función de validación de campos
  const validateField = useCallback((field: any, value: any): string => {
    if (field.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return `${field.label} es requerido`;
    }

    if (field.type === 'email' && value && !validateEmail(value)) {
      return 'Por favor ingrese un email válido';
    }

    if (field.type === 'tel' && value && !validatePhone(value)) {
      return 'Por favor ingrese un número de teléfono válido';
    }

    if (field.type === 'text' && value && typeof value === 'string' && value.length < 2) {
      return `${field.label} debe tener al menos 2 caracteres`;
    }

    if (field.type === 'textarea' && value && typeof value === 'string' && value.length < 10) {
      return `${field.label} debe tener al menos 10 caracteres`;
    }

    return '';
  }, [validateEmail, validatePhone]);

  // Función de validación completa del formulario
  const validateForm = useCallback((): ValidationResult => {
    const newErrors: FormErrors = {};
    let isValid = true;

    formFields.forEach(field => {
      const value = formData[field.name];
      const error = validateField(field, value);
      if (error) {
        newErrors[field.name] = error;
        isValid = false;
      }
    });

    return { isValid, errors: newErrors };
  }, [formFields, formData, validateField]);

  const handleInputChange = useCallback((fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  }, [errors]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitSuccess(false);
    
    const validation = validateForm();
    setErrors(validation.errors);
    
    if (!validation.isValid) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simular envío del formulario
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Contact form submitted:', formData);
      setSubmitSuccess(true);
      setFormData({});
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setErrors({ submit: 'Error al enviar el mensaje. Por favor intente nuevamente.' });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm]);

  return (
    <section 
      ref={(ref) => ref && connect(drag(ref))}
      className={`py-16 ${backgroundColor} ${
        selected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Información de Contacto
              </h3>
              <div className="space-y-4">
                {contactInfo.map((info, index) => {
                  const IconComponent = getContactIcon(info.type);
                  return (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <IconComponent className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{info.label}</h4>
                        <p className="text-gray-600">{info.value}</p>
                      </div>
                    </div>
                  );
                })
                }
              </div>
            </div>

            {/* Map */}
            {showMap && mapEmbedUrl && (
              <div className="rounded-lg overflow-hidden shadow-lg">
                <iframe
                  src={mapEmbedUrl}
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación"
                />
              </div>
            )}
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Envíanos un Mensaje
            </h3>
            
            {/* Mensaje de éxito */}
            {submitSuccess && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                ¡Mensaje enviado exitosamente!
              </div>
            )}

            {/* Error general de envío */}
            {errors.submit && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                {errors.submit}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {formFields.map((field, index) => {
                const hasError = !!errors[field.name];
                const fieldValue = formData[field.name] || '';
                
                return (
                  <div key={index}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        name={field.name}
                        value={fieldValue}
                        placeholder={field.placeholder}
                        rows={4}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
                          hasError 
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                            : 'border-gray-300 focus:ring-blue-500'
                        }`}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                      />
                    ) : (
                      <input
                        type={field.type}
                        name={field.name}
                        value={fieldValue}
                        placeholder={field.placeholder}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
                          hasError 
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                            : 'border-gray-300 focus:ring-blue-500'
                        }`}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                      />
                    )}
                    {/* Mostrar error del campo */}
                    {errors[field.name] && (
                      <p className="text-red-500 text-sm flex items-center mt-1">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {errors[field.name]}
                      </p>
                    )}
                  </div>
                );
              })}
              
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white`}
              >
                <Send className="h-5 w-5" />
                <span>{isSubmitting ? 'Enviando...' : submitText}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
});

// Configuración de Craft.js
const ContactBlockSettings = () => {
  const {
    actions: { setProp },
    title,
    subtitle,
    backgroundColor,
    showMap,
    mapEmbedUrl,
    submitText
  } = useNode((node) => ({
    title: node.data.props.title,
    subtitle: node.data.props.subtitle,
    backgroundColor: node.data.props.backgroundColor,
    showMap: node.data.props.showMap,
    mapEmbedUrl: node.data.props.mapEmbedUrl,
    submitText: node.data.props.submitText
  }));

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Título
        </label>
        <input
          type="text"
          value={title || ''}
          onChange={(e) => setProp((props: ExtendedContactBlockProps) => (props.title = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Subtítulo
        </label>
        <textarea
          value={subtitle || ''}
          onChange={(e) => setProp((props: ExtendedContactBlockProps) => (props.subtitle = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          rows={2}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Color de fondo
        </label>
        <select
          value={backgroundColor || 'bg-gray-50'}
          onChange={(e) => setProp((props: ExtendedContactBlockProps) => (props.backgroundColor = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="bg-gray-50">Gris claro</option>
          <option value="bg-white">Blanco</option>
          <option value="bg-blue-50">Azul claro</option>
          <option value="bg-green-50">Verde claro</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Texto del botón
        </label>
        <input
          type="text"
          value={submitText || ''}
          onChange={(e) => setProp((props: ExtendedContactBlockProps) => (props.submitText = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
      </div>
      
      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={showMap || false}
            onChange={(e) => setProp((props: ExtendedContactBlockProps) => (props.showMap = e.target.checked))}
            className="rounded"
          />
          <span className="text-sm font-medium text-gray-700">Mostrar mapa</span>
        </label>
      </div>
      
      {showMap && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL del mapa
          </label>
          <input
            type="url"
            value={mapEmbedUrl || ''}
            onChange={(e) => setProp((props: ExtendedContactBlockProps) => (props.mapEmbedUrl = e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            placeholder="https://www.google.com/maps/embed?..."
          />
        </div>
      )}
    </div>
  );
};



// Agregar la propiedad craft al componente
ContactBlock.craft = {
  props: {
    title: "Contáctanos",
    subtitle: "Estamos aquí para ayudarte",
    contactInfo: [
      {
        type: 'email',
        label: 'Email',
        value: 'contacto@empresa.com'
      },
      {
        type: 'phone',
        label: 'Teléfono',
        value: '+1 234 567 8900'
      },
      {
        type: 'address',
        label: 'Dirección',
        value: '123 Calle Principal, Ciudad'
      }
    ],
    formFields: [
      {
        name: 'name',
        label: 'Nombre',
        type: 'text',
        required: true,
        placeholder: 'Tu nombre completo'
      },
      {
        name: 'email',
        label: 'Email',
        type: 'email',
        required: true,
        placeholder: 'tu@email.com'
      },
      {
        name: 'message',
        label: 'Mensaje',
        type: 'textarea',
        required: true,
        placeholder: 'Escribe tu mensaje aquí...'
      }
    ],
    submitText: "Enviar Mensaje",
    backgroundColor: "bg-gray-50",
    showMap: false,
    mapEmbedUrl: undefined
  },
  related: {
    settings: ContactBlockSettings
  }
};

export default ContactBlock;
export { ContactBlockSettings };