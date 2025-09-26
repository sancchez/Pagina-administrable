import React, { memo, useCallback, useMemo } from 'react';
import { useNode } from '@craftjs/core';
import { Mail, Linkedin, Twitter, Github, ExternalLink } from 'lucide-react';
import { TeamBlockProps, TeamMember } from '../../types/blocks';

interface SocialLink {
  platform: 'email' | 'linkedin' | 'twitter' | 'github' | 'website';
  url: string;
}

interface ExtendedTeamMember extends TeamMember {
  socialLinks?: SocialLink[];
}

interface ExtendedTeamBlockProps extends TeamBlockProps {
  members?: ExtendedTeamMember[];
}

const socialIconMap = {
  email: Mail,
  linkedin: Linkedin,
  twitter: Twitter,
  github: Github,
  website: ExternalLink
};

const TeamBlock: React.FC<ExtendedTeamBlockProps> = memo(({
  title = "Nuestro Equipo",
  subtitle = "Conoce a las personas que hacen posible nuestro trabajo",
  members = [],
  layout = 'grid',
  backgroundColor = "bg-white",
  showBio = true
}) => {
  const {
    connectors: { connect, drag },
    selected,
    actions: { setProp }
  } = useNode((state) => ({
    selected: state.events.selected
  }));

  // Memoizar función para obtener iconos sociales
  const getSocialIcon = useCallback((platform: string) => {
    const IconComponent = socialIconMap[platform as keyof typeof socialIconMap];
    return IconComponent || ExternalLink;
  }, []);

  // Memoizar función para obtener colores sociales
  const getSocialColor = useCallback((platform: string) => {
    switch (platform) {
      case 'email': return 'text-gray-600 hover:text-gray-800';
      case 'linkedin': return 'text-blue-600 hover:text-blue-800';
      case 'twitter': return 'text-sky-500 hover:text-sky-700';
      case 'github': return 'text-gray-800 hover:text-black';
      case 'website': return 'text-green-600 hover:text-green-800';
      default: return 'text-gray-600 hover:text-gray-800';
    }
  }, []);

  if (layout === 'list') {
    return (
      <section 
        ref={(ref) => ref && connect(drag(ref))}
        className={`py-16 ${backgroundColor} ${
          selected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
        }`}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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

          {/* Team Members List */}
          <div className="space-y-8">
            {members.map((member, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {member.image ? (
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-32 h-32 rounded-full object-cover border-4 border-gray-100"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                        <span className="text-3xl font-bold text-white">
                          {member.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {member.name}
                    </h3>
                    <p className="text-lg text-blue-600 font-semibold mb-4">
                      {member.position}
                    </p>
                    {showBio && member.bio && (
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        {member.bio}
                      </p>
                    )}
                    
                    {/* Social Links */}
                    {member.socialLinks && member.socialLinks.length > 0 && (
                      <div className="flex justify-center md:justify-start space-x-4">
                        {member.socialLinks.map((link, linkIndex) => {
                          const IconComponent = getSocialIcon(link.platform);
                          return (
                            <a
                              key={linkIndex}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`p-2 rounded-lg transition-colors ${getSocialColor(link.platform)}`}
                            >
                              <IconComponent className="h-5 w-5" />
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

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

        {/* Team Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {members.map((member, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow">
              {/* Avatar */}
              <div className="p-6 pb-4">
                {member.image ? (
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-gray-100"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center mx-auto">
                    <span className="text-2xl font-bold text-white">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="px-6 pb-6 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <p className="text-blue-600 font-semibold mb-3">
                  {member.position}
                </p>
                {showBio && member.bio && (
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    {member.bio}
                  </p>
                )}
                
                {/* Social Links */}
                {member.socialLinks && member.socialLinks.length > 0 && (
                  <div className="flex justify-center space-x-3">
                    {member.socialLinks.map((link, linkIndex) => {
                      const IconComponent = getSocialIcon(link.platform);
                      return (
                        <a
                          key={linkIndex}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`p-2 rounded-lg transition-colors ${getSocialColor(link.platform)}`}
                        >
                          <IconComponent className="h-4 w-4" />
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

// Configuración de Craft.js
const TeamBlockSettings = () => {
  const {
    actions: { setProp },
    title,
    subtitle,
    layout,
    backgroundColor,
    showBio
  } = useNode((node) => ({
    title: node.data.props.title,
    subtitle: node.data.props.subtitle,
    layout: node.data.props.layout,
    backgroundColor: node.data.props.backgroundColor,
    showBio: node.data.props.showBio
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
          onChange={(e) => setProp((props: ExtendedTeamBlockProps) => (props.title = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Subtítulo
        </label>
        <textarea
          value={subtitle || ''}
          onChange={(e) => setProp((props: ExtendedTeamBlockProps) => (props.subtitle = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          rows={2}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Diseño
        </label>
        <select
          value={layout || 'grid'}
          onChange={(e) => setProp((props: ExtendedTeamBlockProps) => (props.layout = e.target.value as 'grid' | 'list'))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="grid">Cuadrícula</option>
          <option value="list">Lista</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Color de fondo
        </label>
        <select
          value={backgroundColor || 'bg-white'}
          onChange={(e) => setProp((props: ExtendedTeamBlockProps) => (props.backgroundColor = e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="bg-white">Blanco</option>
          <option value="bg-gray-50">Gris claro</option>
          <option value="bg-blue-50">Azul claro</option>
          <option value="bg-green-50">Verde claro</option>
        </select>
      </div>
      
      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={showBio || false}
            onChange={(e) => setProp((props: ExtendedTeamBlockProps) => (props.showBio = e.target.checked))}
            className="rounded"
          />
          <span className="text-sm font-medium text-gray-700">Mostrar biografía</span>
        </label>
      </div>
    </div>
  );
};

// Configuración de Craft.js para el componente
TeamBlock.craft = {
  props: {
    title: "Nuestro Equipo",
    subtitle: "Conoce a las personas que hacen posible nuestro trabajo",
    members: [
      {
        name: "Ana García",
        position: "CEO & Fundadora",
        bio: "Con más de 10 años de experiencia en tecnología, Ana lidera nuestra visión estratégica.",
        image: undefined,
        socialLinks: [
          { platform: 'linkedin', url: 'https://linkedin.com/in/ana-garcia' },
          { platform: 'email', url: 'mailto:ana@empresa.com' }
        ]
      },
      {
        name: "Carlos López",
        position: "CTO",
        bio: "Experto en desarrollo de software con pasión por la innovación tecnológica.",
        image: undefined,
        socialLinks: [
          { platform: 'github', url: 'https://github.com/carlos-lopez' },
          { platform: 'linkedin', url: 'https://linkedin.com/in/carlos-lopez' }
        ]
      },
      {
        name: "María Rodríguez",
        position: "Diseñadora UX/UI",
        bio: "Especialista en crear experiencias de usuario excepcionales y diseños intuitivos.",
        image: undefined,
        socialLinks: [
          { platform: 'website', url: 'https://maria-design.com' },
          { platform: 'linkedin', url: 'https://linkedin.com/in/maria-rodriguez' }
        ]
      }
    ],
    layout: 'grid',
    backgroundColor: "bg-white",
    showBio: true
  },
  related: {
    settings: TeamBlockSettings
  }
};

export default TeamBlock;
export { TeamBlockSettings };