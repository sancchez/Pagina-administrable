import React, { useState, memo, useCallback, useMemo } from 'react';
import { useNode } from '@craftjs/core';
import { Users, Clock, Phone, Droplets, TrendingUp, Award, Shield, Zap, AlertCircle } from 'lucide-react';
import { StatsBlockProps, Stat } from '../../types/blocks';

interface StatError {
  [key: string]: string;
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

interface ValidatedStat extends Stat {
  isValid: boolean;
  validationError?: string;
}

const iconMap = {
  Users,
  Clock,
  Phone,
  Droplets,
  TrendingUp,
  Award,
  Shield,
  Zap
};

const StatsBlock: React.FC<StatsBlockProps> = memo(({
  title = 'Nuestros Números',
  subtitle = 'Estadísticas que demuestran nuestro compromiso',
  stats = [
    { number: '15,000+', label: 'Usuarios Activos', icon: 'Users' },
    { number: '99.9%', label: 'Disponibilidad', icon: 'Clock' },
    { number: '24/7', label: 'Atención', icon: 'Phone' },
    { number: '100%', label: 'Agua Potable', icon: 'Droplets' }
  ],
  backgroundColor = 'bg-gray-50'
}) => {
  const [statErrors, setStatErrors] = useState<StatError>({});

  // Validación de números
  const validateNumber = useCallback((number: string): ValidationResult => {
    if (!number || number.trim() === '') {
      return { isValid: false, error: 'Número es requerido' };
    }

    // Permitir números con sufijos comunes (+, %, K, M, B, etc.)
    const numberRegex = /^\d+([.,]\d+)?(\s*[+%KMBkmb]?|\s*\/\s*\d+)?$/;
    if (!numberRegex.test(number.trim())) {
      return { isValid: false, error: 'Formato de número inválido' };
    }

    return { isValid: true };
  }, []);

  // Validación de etiqueta
  const validateLabel = useCallback((label: string): ValidationResult => {
    if (!label || label.trim() === '') {
      return { isValid: false, error: 'Etiqueta es requerida' };
    }

    if (label.length > 50) {
      return { isValid: false, error: 'Etiqueta muy larga (máx. 50 caracteres)' };
    }

    return { isValid: true };
  }, []);

  // Validación de icono
  const validateIcon = useCallback((icon: string): ValidationResult => {
    if (!icon || icon.trim() === '') {
      return { isValid: false, error: 'Icono es requerido' };
    }

    const validIcons = Object.keys(iconMap);
    if (!validIcons.includes(icon)) {
      return { isValid: false, error: `Icono inválido. Válidos: ${validIcons.join(', ')}` };
    }

    return { isValid: true };
  }, []);

  // Validación completa de estadística
  const validateStat = useCallback((stat: Stat): ValidationResult => {
    const numberValidation = validateNumber(stat.number);
    if (!numberValidation.isValid) {
      return numberValidation;
    }

    const labelValidation = validateLabel(stat.label);
    if (!labelValidation.isValid) {
      return labelValidation;
    }

    const iconValidation = validateIcon(stat.icon);
    if (!iconValidation.isValid) {
      return iconValidation;
    }

    return { isValid: true };
  }, [validateNumber, validateLabel, validateIcon]);

  // Formatear número para mostrar
  const formatNumber = useCallback((number: string): string => {
    // Limpiar y formatear el número para mejor presentación
    return number.trim();
  }, []);

  // Estadísticas validadas
  const validatedStats = useMemo(() => {
    return stats.map((stat, index) => {
      const validation = validateStat(stat);
      return {
        ...stat,
        isValid: validation.isValid,
        validationError: validation.error,
        formattedNumber: formatNumber(stat.number)
      };
    });
  }, [stats, validateStat, formatNumber]);

  // Verificar si hay errores generales
  const hasGeneralErrors = useMemo(() => {
    return validatedStats.some(stat => !stat.isValid);
  }, [validatedStats]);
  return (
    <section className={`py-16 px-4 ${backgroundColor}`}>
      <div className="container mx-auto">
        {/* Encabezado */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">{title}</h2>
          {subtitle && (
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
          )}
        </div>

        {/* Mensaje de error general */}
        {hasGeneralErrors && (
          <div className="mb-8 p-4 bg-red-100 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium">Hay errores en las estadísticas que deben corregirse</span>
            </div>
          </div>
        )}

        {/* Grid de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {validatedStats.map((stat, index) => {
            const IconComponent = iconMap[stat.icon as keyof typeof iconMap] || Users;
            const hasError = !stat.isValid;
            
            return (
              <div 
                key={index}
                className={`bg-white rounded-xl p-8 text-center shadow-lg hover:shadow-xl transition-shadow duration-300 border ${
                  hasError ? 'border-red-200 bg-red-50' : 'border-gray-100'
                }`}
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                  hasError ? 'bg-red-100' : 'bg-blue-100'
                }`}>
                  <IconComponent className={`h-8 w-8 ${
                    hasError ? 'text-red-600' : 'text-blue-600'
                  }`} />
                </div>
                
                <div className={`text-3xl font-bold mb-2 ${
                  hasError ? 'text-red-800' : 'text-gray-800'
                }`}>
                  {stat.isValid ? stat.formattedNumber : '---'}
                </div>
                
                <div className={`font-medium mb-2 ${
                  hasError ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {stat.label}
                </div>

                {/* Mensaje de error específico */}
                {hasError && (
                  <div className="mt-3 p-2 bg-red-100 border border-red-200 rounded text-sm">
                    <div className="flex items-center space-x-1 text-red-700">
                      <AlertCircle className="h-3 w-3 flex-shrink-0" />
                      <span>{stat.validationError}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
});

// Configuración de Craft.js
const StatsBlockSettings = () => {
  const {
    actions: { setProp },
    title,
    subtitle,
    backgroundColor
  } = useNode((node) => ({
    title: node.data.props.title,
    subtitle: node.data.props.subtitle,
    backgroundColor: node.data.props.backgroundColor
  }));

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Título
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setProp((props: StatsBlockProps) => (props.title = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Subtítulo
        </label>
        <input
          type="text"
          value={subtitle}
          onChange={(e) => setProp((props: StatsBlockProps) => (props.subtitle = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Color de Fondo
        </label>
        <select
          value={backgroundColor}
          onChange={(e) => setProp((props: StatsBlockProps) => (props.backgroundColor = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="bg-white">Blanco</option>
          <option value="bg-gray-50">Gris Claro</option>
          <option value="bg-blue-50">Azul Claro</option>
          <option value="bg-green-50">Verde Claro</option>
        </select>
      </div>
    </div>
  );
};

// Configuración de Craft.js para el componente
StatsBlock.craft = {
  props: {
    title: 'Nuestros Números',
    subtitle: 'Estadísticas que demuestran nuestro compromiso',
    stats: [
      { number: '15,000+', label: 'Usuarios Activos', icon: 'Users' },
      { number: '99.9%', label: 'Disponibilidad', icon: 'Clock' },
      { number: '24/7', label: 'Atención', icon: 'Phone' },
      { number: '100%', label: 'Agua Potable', icon: 'Droplets' }
    ],
    backgroundColor: 'bg-gray-50'
  },
  related: {
    settings: StatsBlockSettings
  }
};

export default StatsBlock;
export { StatsBlockSettings };