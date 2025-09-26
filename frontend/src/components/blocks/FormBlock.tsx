import React, { useState, memo, useCallback, useMemo } from 'react';
import { useNode } from '@craftjs/core';
import { Settings, Trash2, Plus, Minus, AlertCircle } from 'lucide-react';

interface FormField {
  id: string;
  type: 'text' | 'email' | 'textarea' | 'select' | 'checkbox' | 'radio';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

interface FormErrors {
  [key: string]: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: FormErrors;
}

interface FormBlockProps {
  title?: string;
  description?: string;
  fields?: FormField[];
  submitText?: string;
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: number;
  padding?: number;
}

const defaultFields: FormField[] = [
  {
    id: 'name',
    type: 'text',
    label: 'Nombre',
    placeholder: 'Ingrese su nombre',
    required: true
  },
  {
    id: 'email',
    type: 'email',
    label: 'Email',
    placeholder: 'correo@ejemplo.com',
    required: true
  },
  {
    id: 'message',
    type: 'textarea',
    label: 'Mensaje',
    placeholder: 'Escriba su mensaje aquí...',
    required: false
  }
];

export const FormBlock: React.FC<FormBlockProps> = memo(({
  title = 'Formulario de Contacto',
  description = 'Complete el siguiente formulario y nos pondremos en contacto con usted.',
  fields = defaultFields,
  submitText = 'Enviar',
  backgroundColor = '#ffffff',
  textColor = '#333333',
  borderRadius = 8,
  padding = 24
}) => {
  const {
    connectors: { connect, drag },
    selected,
    actions: { setProp }
  } = useNode((state) => ({
    selected: state.events.selected
  }));

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Función de validación de email
  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  // Función de validación de campos
  const validateField = useCallback((field: FormField, value: any): string => {
    if (field.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return `${field.label} es requerido`;
    }

    if (field.type === 'email' && value && !validateEmail(value)) {
      return 'Por favor ingrese un email válido';
    }

    if (field.type === 'text' && value && typeof value === 'string' && value.length < 2) {
      return `${field.label} debe tener al menos 2 caracteres`;
    }

    return '';
  }, [validateEmail]);

  // Función de validación completa del formulario
  const validateForm = useCallback((): ValidationResult => {
    const newErrors: FormErrors = {};
    let isValid = true;

    fields.forEach(field => {
      const value = formData[field.id];
      const error = validateField(field, value);
      if (error) {
        newErrors[field.id] = error;
        isValid = false;
      }
    });

    return { isValid, errors: newErrors };
  }, [fields, formData, validateField]);

  const handleInputChange = useCallback((fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
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
      console.log('Form submitted:', formData);
      setSubmitSuccess(true);
      setFormData({});
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: 'Error al enviar el formulario. Por favor intente nuevamente.' });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm]);

  const renderField = useCallback((field: FormField) => {
    const hasError = !!errors[field.id];
    const fieldValue = formData[field.id] || '';
    
    const commonProps = {
      id: field.id,
      required: field.required,
      value: fieldValue,
      className: `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
        hasError 
          ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
          : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
      }`,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        handleInputChange(field.id, e.target.value);
      }
    };

    switch (field.type) {
      case 'text':
      case 'email':
        return (
          <input
            {...commonProps}
            type={field.type}
            placeholder={field.placeholder}
          />
        );
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            placeholder={field.placeholder}
            rows={4}
          />
        );
      case 'select':
        return (
          <select {...commonProps}>
            <option value="">Seleccione una opción</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        );
      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              id={field.id}
              checked={!!formData[field.id]}
              className={`mr-2 ${hasError ? 'border-red-500' : ''}`}
              onChange={(e) => handleInputChange(field.id, e.target.checked)}
            />
            <label htmlFor={field.id} className="text-sm">{field.label}</label>
          </div>
        );
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center">
                <input
                  type="radio"
                  id={`${field.id}_${index}`}
                  name={field.id}
                  value={option}
                  className="mr-2"
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                />
                <label htmlFor={`${field.id}_${index}`} className="text-sm">{option}</label>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  }, [formData, errors, handleInputChange]);

  return (
    <div
      ref={(ref) => connect(drag(ref))}
      className={`relative ${selected ? 'ring-2 ring-blue-500' : ''}`}
      style={{
        backgroundColor,
        color: textColor,
        borderRadius: `${borderRadius}px`,
        padding: `${padding}px`
      }}
    >
      {selected && (
        <div className="absolute -top-8 left-0 bg-blue-500 text-white px-2 py-1 rounded text-xs">
          Formulario
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">{title}</h2>
          <p className="text-gray-600">{description}</p>
        </div>
        
        {/* Mensaje de éxito */}
        {submitSuccess && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            ¡Formulario enviado exitosamente!
          </div>
        )}

        {/* Error general de envío */}
        {errors.submit && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            {errors.submit}
          </div>
        )}

        <div className="space-y-4">
          {fields.map((field) => (
            <div key={field.id} className="space-y-1">
              {field.type !== 'checkbox' && (
                <label htmlFor={field.id} className="block text-sm font-medium">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
              )}
              {renderField(field)}
              {/* Mostrar error del campo */}
              {errors[field.id] && (
                <p className="text-red-500 text-sm flex items-center mt-1">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors[field.id]}
                </p>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
            } text-white`}
          >
            {isSubmitting ? 'Enviando...' : submitText}
          </button>
        </div>
      </form>
    </div>
  );
});

const FormBlockSettings = () => {
  const {
    actions: { setProp },
    props
  } = useNode((node) => ({
    props: node.data.props
  }));

  const [newField, setNewField] = useState<Partial<FormField>>({
    type: 'text',
    label: '',
    required: false
  });

  const addField = () => {
    if (newField.label) {
      const field: FormField = {
        id: Date.now().toString(),
        type: newField.type as FormField['type'],
        label: newField.label,
        placeholder: newField.placeholder,
        required: newField.required || false,
        options: newField.options
      };
      
      setProp((props: FormBlockProps) => {
        props.fields = [...(props.fields || []), field];
      });
      
      setNewField({ type: 'text', label: '', required: false });
    }
  };

  const removeField = (fieldId: string) => {
    setProp((props: FormBlockProps) => {
      props.fields = props.fields?.filter(f => f.id !== fieldId) || [];
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Título</label>
        <input
          type="text"
          value={props.title || ''}
          onChange={(e) => setProp((props: FormBlockProps) => props.title = e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Descripción</label>
        <textarea
          value={props.description || ''}
          onChange={(e) => setProp((props: FormBlockProps) => props.description = e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          rows={3}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Texto del Botón</label>
        <input
          type="text"
          value={props.submitText || ''}
          onChange={(e) => setProp((props: FormBlockProps) => props.submitText = e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Color de Fondo</label>
        <input
          type="color"
          value={props.backgroundColor || '#ffffff'}
          onChange={(e) => setProp((props: FormBlockProps) => props.backgroundColor = e.target.value)}
          className="w-full h-10 border border-gray-300 rounded-md"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Color de Texto</label>
        <input
          type="color"
          value={props.textColor || '#333333'}
          onChange={(e) => setProp((props: FormBlockProps) => props.textColor = e.target.value)}
          className="w-full h-10 border border-gray-300 rounded-md"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Radio de Borde</label>
        <input
          type="range"
          min="0"
          max="20"
          value={props.borderRadius || 8}
          onChange={(e) => setProp((props: FormBlockProps) => props.borderRadius = parseInt(e.target.value))}
          className="w-full"
        />
        <span className="text-sm text-gray-500">{props.borderRadius || 8}px</span>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Padding</label>
        <input
          type="range"
          min="8"
          max="48"
          value={props.padding || 24}
          onChange={(e) => setProp((props: FormBlockProps) => props.padding = parseInt(e.target.value))}
          className="w-full"
        />
        <span className="text-sm text-gray-500">{props.padding || 24}px</span>
      </div>
      
      <div className="border-t pt-4">
        <h4 className="font-medium mb-2">Campos del Formulario</h4>
        
        <div className="space-y-2 mb-4">
          {props.fields?.map((field: FormField) => (
            <div key={field.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <span className="text-sm">{field.label} ({field.type})</span>
              <button
                onClick={() => removeField(field.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        
        <div className="space-y-2 p-3 border border-gray-200 rounded">
          <h5 className="text-sm font-medium">Agregar Campo</h5>
          
          <select
            value={newField.type}
            onChange={(e) => setNewField(prev => ({ ...prev, type: e.target.value as FormField['type'] }))}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="text">Texto</option>
            <option value="email">Email</option>
            <option value="textarea">Área de Texto</option>
            <option value="select">Selección</option>
            <option value="checkbox">Checkbox</option>
            <option value="radio">Radio</option>
          </select>
          
          <input
            type="text"
            placeholder="Etiqueta del campo"
            value={newField.label || ''}
            onChange={(e) => setNewField(prev => ({ ...prev, label: e.target.value }))}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          />
          
          <input
            type="text"
            placeholder="Placeholder (opcional)"
            value={newField.placeholder || ''}
            onChange={(e) => setNewField(prev => ({ ...prev, placeholder: e.target.value }))}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          />
          
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              checked={newField.required || false}
              onChange={(e) => setNewField(prev => ({ ...prev, required: e.target.checked }))}
              className="mr-2"
            />
            Campo requerido
          </label>
          
          <button
            onClick={addField}
            className="w-full bg-blue-500 text-white py-1 px-2 rounded text-sm hover:bg-blue-600"
          >
            <Plus size={16} className="inline mr-1" />
            Agregar Campo
          </button>
        </div>
      </div>
    </div>
  );
};

FormBlock.craft = {
  props: {
    title: 'Formulario de Contacto',
    description: 'Complete el siguiente formulario y nos pondremos en contacto con usted.',
    fields: defaultFields,
    submitText: 'Enviar',
    backgroundColor: '#ffffff',
    textColor: '#333333',
    borderRadius: 8,
    padding: 24
  },
  related: {
    settings: FormBlockSettings
  }
};

export { FormBlockSettings };