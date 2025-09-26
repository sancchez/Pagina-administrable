import { useState, useCallback } from 'react';
import HttpClient from '../utils/http';

// Tipos para los bloques JSON
interface BlockData {
  type: string;
  props: Record<string, any>;
  children?: BlockData[];
}

interface PageMigration {
  slug: string;
  title: string;
  blocks: BlockData[];
}

// Mapeo de componentes a bloques JSON
const componentToBlockMap: Record<string, (props?: any) => BlockData> = {
  Hero: () => ({
    type: 'HeroBlock',
    props: {
      title: 'Agua Pura para Tu Comunidad',
      subtitle: 'Comprometidos con brindar el mejor servicio de acueducto, garantizando agua potable de calidad las 24 horas del día para toda la comunidad.',
      backgroundGradient: 'from-blue-600 via-blue-500 to-green-500',
      primaryButton: {
        text: 'Pagar Factura',
        icon: 'CreditCard',
        style: 'primary'
      },
      secondaryButton: {
        text: 'Conoce Nuestros Servicios',
        icon: 'ArrowRight',
        style: 'secondary'
      },
      showVideo: true,
      videoText: 'Ver video institucional'
    }
  }),
  
  StatsCards: () => ({
    type: 'StatsBlock',
    props: {
      title: 'Nuestros Números',
      stats: [
        { number: '15,000+', label: 'Usuarios Activos', icon: 'Users' },
        { number: '99.9%', label: 'Disponibilidad', icon: 'Clock' },
        { number: '24/7', label: 'Atención', icon: 'Phone' },
        { number: '100%', label: 'Agua Potable', icon: 'Droplets' }
      ]
    }
  }),
  
  ServicesSection: () => ({
    type: 'ServicesBlock',
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
      ]
    }
  }),
  
  ContactForm: () => ({
    type: 'ContactBlock',
    props: {
      title: 'Contáctanos',
      subtitle: 'Estamos aquí para ayudarte con cualquier consulta',
      contactInfo: [
        { type: 'email', label: 'Email', value: 'contacto@acueducto.com' },
        { type: 'phone', label: 'Teléfono', value: '+57 123 456 7890' },
        { type: 'address', label: 'Dirección', value: 'Calle Principal 123, Ciudad' },
        { type: 'hours', label: 'Horarios', value: 'Lun-Vie 8:00-17:00' }
      ],
      formFields: [
        { name: 'name', label: 'Nombre', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'phone', label: 'Teléfono', type: 'tel' },
        { name: 'message', label: 'Mensaje', type: 'textarea', required: true }
      ],
      showMap: false
    }
  }),
  
  TeamSection: () => ({
    type: 'TeamBlock',
    props: {
      title: 'Nuestro Equipo',
      subtitle: 'Profesionales comprometidos con el servicio de calidad',
      members: [
        {
          name: 'Director General',
          position: 'Gerente General',
          bio: 'Líder con más de 15 años de experiencia en servicios públicos',
          socialLinks: [
            { platform: 'linkedin', url: '#' },
            { platform: 'email', url: 'mailto:gerencia@acueducto.com' }
          ]
        },
        {
          name: 'Jefe Técnico',
          position: 'Coordinador Técnico',
          bio: 'Especialista en sistemas de acueducto y mantenimiento',
          socialLinks: [
            { platform: 'email', url: 'mailto:tecnico@acueducto.com' }
          ]
        }
      ],
      layout: 'grid',
      showBio: true
    }
  })
};

// Páginas a migrar
const pagesToMigrate: PageMigration[] = [
  {
    slug: 'home',
    title: 'Página Principal',
    blocks: [
      componentToBlockMap.Hero(),
      componentToBlockMap.StatsCards(),
      componentToBlockMap.ServicesSection()
    ]
  },
  {
    slug: 'quienes-somos',
    title: 'Quiénes Somos',
    blocks: [
      {
        type: 'HeroBlock',
        props: {
          title: 'Quiénes Somos',
          subtitle: 'Conoce nuestra historia, misión y compromiso con la comunidad',
          backgroundGradient: 'from-green-600 to-blue-600'
        }
      },
      {
        type: 'TextBlock',
        props: {
          title: 'Nuestra Historia',
          content: 'Desde hace más de 20 años, hemos estado comprometidos con brindar el mejor servicio de acueducto a nuestra comunidad. Nuestra empresa nació con la visión de garantizar el acceso al agua potable como un derecho fundamental.'
        }
      },
      {
        type: 'TextBlock',
        props: {
          title: 'Misión',
          content: 'Proporcionar servicios de acueducto de alta calidad, garantizando el suministro continuo de agua potable a todos nuestros usuarios, con un enfoque en la sostenibilidad y el cuidado del medio ambiente.'
        }
      }
    ]
  },
  {
    slug: 'informacion-esal',
    title: 'Información ESAL',
    blocks: [
      {
        type: 'HeroBlock',
        props: {
          title: 'Información ESAL',
          subtitle: 'Transparencia y rendición de cuentas como Entidad Sin Ánimo de Lucro',
          backgroundGradient: 'from-purple-600 to-blue-600'
        }
      },
      {
        type: 'DocumentsBlock',
        props: {
          title: 'Documentos Institucionales',
          documents: [
            { name: 'Estatutos', url: '/docs/estatutos.pdf', type: 'PDF' },
            { name: 'Estados Financieros', url: '/docs/estados-financieros.pdf', type: 'PDF' },
            { name: 'Informe de Gestión', url: '/docs/informe-gestion.pdf', type: 'PDF' }
          ]
        }
      }
    ]
  }
];

export default function PageMigrator() {
  const [migrating, setMigrating] = useState(false);
  const [progress, setProgress] = useState<string[]>([]);
  const [completed, setCompleted] = useState<string[]>([]);

  const addProgress = useCallback((message: string) => {
    setProgress(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  }, []);

  const migratePage = useCallback(async (page: PageMigration) => {
    try {
      addProgress(`🔄 Migrando página: ${page.title}`);
      
      const response = await HttpClient.post(`/api/admin/pages/${page.slug}/migrate`, {
        title: page.title,
        slug: page.slug,
        draft_json: JSON.stringify(page.blocks),
        published_json: JSON.stringify(page.blocks),
        is_published: true
      });
      
      addProgress(`✅ Página ${page.title} migrada exitosamente`);
      setCompleted(prev => [...prev, page.slug]);
      
      return response;
    } catch (error) {
      addProgress(`❌ Error migrando ${page.title}: ${error}`);
      throw error;
    }
  }, [addProgress]);

  const migrateAllPages = useCallback(async () => {
    setMigrating(true);
    setProgress([]);
    setCompleted([]);
    
    try {
      addProgress('🚀 Iniciando migración de páginas públicas...');
      
      for (const page of pagesToMigrate) {
        await migratePage(page);
        // Pequeña pausa entre migraciones
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      addProgress('🎉 ¡Migración completada exitosamente!');
      addProgress(`📊 Total de páginas migradas: ${completed.length}`);
      
    } catch (error) {
      addProgress(`💥 Error durante la migración: ${error}`);
    } finally {
      setMigrating(false);
    }
  }, [migratePage, addProgress, completed.length]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          🔄 Migrador de Páginas Públicas
        </h2>
        
        <p className="text-gray-600 mb-6">
          Este sistema convierte las páginas públicas existentes en bloques JSON editables 
          para el editor visual. Las páginas migradas podrán ser editadas visualmente 
          mientras mantienen su estructura como JSON.
        </p>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Páginas a migrar:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pagesToMigrate.map((page) => (
              <div 
                key={page.slug} 
                className={`p-3 rounded border ${
                  completed.includes(page.slug) 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{page.title}</span>
                  {completed.includes(page.slug) && (
                    <span className="text-green-600 text-sm">✅ Migrada</span>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {page.blocks.length} bloques • /{page.slug}
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={migrateAllPages}
          disabled={migrating}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          {migrating ? '🔄 Migrando...' : '🚀 Iniciar Migración'}
        </button>

        {progress.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Progreso de Migración:</h3>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg max-h-64 overflow-y-auto font-mono text-sm">
              {progress.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}