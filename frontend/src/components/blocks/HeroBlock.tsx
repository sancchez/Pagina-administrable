import React, { memo, useCallback, useMemo } from 'react';
import { useNode } from '@craftjs/core';
import { ArrowRight, Play, CreditCard, Users, Clock, Phone, Droplets } from 'lucide-react';
import { HeroBlockProps } from '../../types/blocks';
import { JSONContent } from '@tiptap/core';

interface ButtonConfig {
  text: string;
  icon: string;
  style: 'primary' | 'secondary';
}

interface ExtendedHeroBlockProps extends HeroBlockProps {
  primaryButton?: ButtonConfig;
  secondaryButton?: ButtonConfig;
}

const iconMap = {
  ArrowRight,
  Play,
  CreditCard,
  Users,
  Clock,
  Phone,
  Droplets
};

const HeroBlock = memo(({
  title = 'Título del Hero',
  subtitle = 'Subtítulo descriptivo del hero section',
  backgroundGradient = 'from-blue-600 via-blue-500 to-green-500',
  primaryButton,
  secondaryButton,
  showVideo = false,
  videoText = 'Ver video'
}: ExtendedHeroBlockProps) => {
  const {
    connectors: { connect, drag },
    selected,
    actions: { setProp }
  } = useNode((state) => ({
    selected: state.events.selected
  }));

  // Helper function to render text content (string or JSONContent)
  const renderTextContent = useCallback((content: string | JSONContent | undefined, fallback: string) => {
    if (!content) return fallback;
    if (typeof content === 'string') return content;
    // For JSONContent, extract text content
    if (content.content) {
      return content.content.map(node => 
        node.type === 'text' ? node.text : ''
      ).join('');
    }
    return fallback;
  }, []);

  // Memoizar los iconos para evitar recálculos
  const PrimaryIcon = useMemo(() => 
    primaryButton?.icon ? iconMap[primaryButton.icon as keyof typeof iconMap] : CreditCard,
    [primaryButton?.icon]
  );
  
  const SecondaryIcon = useMemo(() => 
    secondaryButton?.icon ? iconMap[secondaryButton.icon as keyof typeof iconMap] : ArrowRight,
    [secondaryButton?.icon]
  );

  return (
    <section 
      ref={(ref) => connect(drag(ref))}
      className={`relative py-20 px-4 overflow-hidden bg-gradient-to-br ${backgroundGradient} ${
        selected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
      }`}
    >
      {/* Background decorativo */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-800/30 to-green-800/30"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Título principal */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="text-white">{renderTextContent(title, 'Título del Hero')}</span>
          </h1>

          {/* Subtítulo */}
          <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            {renderTextContent(subtitle, 'Subtítulo descriptivo del hero section')}
          </p>

          {/* Botones de acción */}
          {(primaryButton || secondaryButton) && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              {primaryButton && (
                <button className="bg-white text-blue-700 hover:bg-blue-50 font-semibold px-8 py-4 rounded-full transition-all duration-300 flex items-center space-x-2 shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
                  <PrimaryIcon className="h-5 w-5" />
                  <span>{primaryButton.text}</span>
                </button>
              )}
              
              {secondaryButton && (
                <button className="bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 flex items-center space-x-2 hover:bg-white/30 hover:border-white/50 hover:shadow-lg">
                  <span>{secondaryButton.text}</span>
                  <SecondaryIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          )}

          {/* Video demo */}
          {showVideo && (
            <div className="relative max-w-2xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <button className="group flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mx-auto mb-4 hover:scale-110 transition-transform duration-300 shadow-xl">
                  <Play className="h-8 w-8 text-white ml-1 group-hover:scale-110 transition-transform" />
                </button>
                <p className="text-white font-medium">{videoText}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
});

// Configuración de Craft.js
const HeroBlockSettings = () => {
  const {
    actions: { setProp },
    title,
    subtitle,
    backgroundGradient,
    showVideo,
    videoText
  } = useNode((node) => ({
    title: node.data.props.title,
    subtitle: node.data.props.subtitle,
    backgroundGradient: node.data.props.backgroundGradient,
    showVideo: node.data.props.showVideo,
    videoText: node.data.props.videoText
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
          onChange={(e) => setProp((props: ExtendedHeroBlockProps) => (props.title = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Subtítulo
        </label>
        <textarea
          value={subtitle || ''}
          onChange={(e) => setProp((props: ExtendedHeroBlockProps) => (props.subtitle = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          rows={3}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Gradiente de fondo
        </label>
        <select
          value={backgroundGradient || 'from-blue-600 via-blue-500 to-green-500'}
          onChange={(e) => setProp((props: ExtendedHeroBlockProps) => (props.backgroundGradient = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="from-blue-600 via-blue-500 to-green-500">Azul a Verde</option>
          <option value="from-purple-600 via-pink-500 to-red-500">Púrpura a Rojo</option>
          <option value="from-gray-600 via-gray-500 to-gray-400">Gris</option>
          <option value="from-indigo-600 via-blue-500 to-cyan-500">Índigo a Cian</option>
        </select>
      </div>
      
      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={showVideo || false}
            onChange={(e) => setProp((props: ExtendedHeroBlockProps) => (props.showVideo = e.target.checked))}
            className="rounded"
          />
          <span className="text-sm font-medium text-gray-700">Mostrar video</span>
        </label>
      </div>
      
      {showVideo && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Texto del video
          </label>
          <input
            type="text"
            value={videoText || ''}
            onChange={(e) => setProp((props: ExtendedHeroBlockProps) => (props.videoText = e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
      )}
    </div>
  );
};

// Configuración de Craft.js para el componente
HeroBlock.craft = {
  props: {
    title: 'Título del Hero',
    subtitle: 'Subtítulo descriptivo del hero section',
    backgroundGradient: 'from-blue-600 via-blue-500 to-green-500',
    primaryButton: undefined,
    secondaryButton: undefined,
    showVideo: false,
    videoText: 'Ver video'
  },
  related: {
    settings: HeroBlockSettings
  }
};

export default HeroBlock;
export { HeroBlockSettings };