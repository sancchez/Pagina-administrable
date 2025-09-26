import React from 'react';
import { useNode } from '@craftjs/core';
import { Droplets, Wrench, Phone, Settings, Shield, Clock, Users, Award } from 'lucide-react';
import { ServicesBlockProps, Service } from '../../types/blocks';

// Extendemos la interface Service para incluir los colores específicos
interface ExtendedService extends Omit<Service, 'color'> {
  color: 'blue' | 'green' | 'purple' | 'red' | 'yellow' | 'indigo';
}

interface ExtendedServicesBlockProps extends Omit<ServicesBlockProps, 'services'> {
  services?: ExtendedService[];
}

const iconMap = {
  Droplets,
  Wrench,
  Phone,
  Settings,
  Shield,
  Clock,
  Users,
  Award
};

const colorMap = {
  blue: {
    bg: 'bg-blue-100',
    icon: 'text-blue-600',
    border: 'border-blue-200',
    hover: 'hover:bg-blue-50'
  },
  green: {
    bg: 'bg-green-100',
    icon: 'text-green-600',
    border: 'border-green-200',
    hover: 'hover:bg-green-50'
  },
  purple: {
    bg: 'bg-purple-100',
    icon: 'text-purple-600',
    border: 'border-purple-200',
    hover: 'hover:bg-purple-50'
  },
  red: {
    bg: 'bg-red-100',
    icon: 'text-red-600',
    border: 'border-red-200',
    hover: 'hover:bg-red-50'
  },
  yellow: {
    bg: 'bg-yellow-100',
    icon: 'text-yellow-600',
    border: 'border-yellow-200',
    hover: 'hover:bg-yellow-50'
  },
  indigo: {
    bg: 'bg-indigo-100',
    icon: 'text-indigo-600',
    border: 'border-indigo-200',
    hover: 'hover:bg-indigo-50'
  }
};

const ServicesBlock: React.FC<ExtendedServicesBlockProps> = ({
  title = 'Nuestros Servicios',
  subtitle = 'Ofrecemos una amplia gama de servicios para satisfacer todas tus necesidades',
  services = [
    {
      title: 'Suministro de Agua',
      description: 'Agua potable de calidad las 24 horas',
      icon: 'Droplets',
      color: 'blue'
    },
    {
      title: 'Mantenimiento',
      description: 'Mantenimiento preventivo y correctivo',
      icon: 'Wrench',
      color: 'green'
    },
    {
      title: 'Atención al Cliente',
      description: 'Soporte técnico y comercial',
      icon: 'Phone',
      color: 'purple'
    }
  ],
  layout = 'grid'
}) => {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="container mx-auto">
        {/* Encabezado */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">{title}</h2>
          {subtitle && (
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">{subtitle}</p>
          )}
        </div>

        {/* Grid/Lista de servicios */}
        <div className={`${
          layout === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' 
            : 'space-y-6 max-w-4xl mx-auto'
        }`}>
          {services.map((service, index) => {
            if (!service) return null;
            
            const IconComponent = iconMap[service.icon as keyof typeof iconMap] || Droplets;
            const colors = colorMap[service.color] || colorMap.blue;
            
            return (
              <div 
                key={index}
                className={`bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border ${colors?.border || 'border-gray-200'} ${colors?.hover || 'hover:bg-gray-50'} group`}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 ${colors?.bg || 'bg-gray-100'} rounded-lg mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className={`h-6 w-6 ${colors?.icon || 'text-gray-600'}`} />
                </div>
                
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {service.title || 'Sin título'}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {service.description || 'Sin descripción'}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// Configuración de Craft.js
const ServicesBlockSettings = () => {
  const {
    actions: { setProp },
    title,
    subtitle,
    layout
  } = useNode((node) => ({
    title: node.data.props.title,
    subtitle: node.data.props.subtitle,
    layout: node.data.props.layout
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
          onChange={(e) => setProp((props: ExtendedServicesBlockProps) => (props.title = e.target.value))}
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
          onChange={(e) => setProp((props: ExtendedServicesBlockProps) => (props.subtitle = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Diseño
        </label>
        <select
          value={layout}
          onChange={(e) => setProp((props: ExtendedServicesBlockProps) => (props.layout = e.target.value as 'grid' | 'list'))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="grid">Cuadrícula</option>
          <option value="list">Lista</option>
        </select>
      </div>
    </div>
  );
};

// Configuración de Craft.js para el componente
ServicesBlock.craft = {
  props: {
    title: 'Nuestros Servicios',
    subtitle: 'Ofrecemos una amplia gama de servicios para satisfacer todas tus necesidades',
    services: [
      {
        title: 'Suministro de Agua',
        description: 'Agua potable de calidad las 24 horas',
        icon: 'Droplets',
        color: 'blue'
      },
      {
        title: 'Mantenimiento',
        description: 'Mantenimiento preventivo y correctivo',
        icon: 'Wrench',
        color: 'green'
      },
      {
        title: 'Atención al Cliente',
        description: 'Soporte técnico y comercial',
        icon: 'Phone',
        color: 'purple'
      }
    ],
    layout: 'grid'
  },
  related: {
    settings: ServicesBlockSettings
  }
};

export default ServicesBlock;
export { ServicesBlockSettings };