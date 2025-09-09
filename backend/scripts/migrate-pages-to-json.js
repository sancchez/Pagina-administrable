const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Configuración de páginas públicas con su estructura JSON
const PUBLIC_PAGES = [
  {
    id: 'home',
    title: 'Página de Inicio',
    components: [
      { type: 'hero', id: 'hero-1' },
      { type: 'stats', id: 'stats-1' },
      { type: 'services', id: 'services-1' }
    ]
  },
  {
    id: 'quienes-somos',
    title: 'Quiénes Somos',
    components: [
      { type: 'hero', id: 'hero-about' },
      { type: 'mission-vision', id: 'mission-1' },
      { type: 'team', id: 'team-1' },
      { type: 'history', id: 'history-1' }
    ]
  },
  {
    id: 'informacion-esal',
    title: 'Información ESAL',
    components: [
      { type: 'hero', id: 'hero-esal' },
      { type: 'info-cards', id: 'info-esal-1' },
      { type: 'documents', id: 'docs-esal-1' }
    ]
  },
  {
    id: 'operacion-gestion',
    title: 'Operación y Gestión',
    components: [
      { type: 'hero', id: 'hero-operations' },
      { type: 'process-flow', id: 'process-1' },
      { type: 'management-info', id: 'mgmt-1' }
    ]
  },
  {
    id: 'normatividad',
    title: 'Normatividad',
    components: [
      { type: 'hero', id: 'hero-norms' },
      { type: 'legal-docs', id: 'legal-1' },
      { type: 'regulations', id: 'regs-1' }
    ]
  },
  {
    id: 'contacto',
    title: 'Contacto',
    components: [
      { type: 'hero', id: 'hero-contact' },
      { type: 'contact-form', id: 'form-1' },
      { type: 'contact-info', id: 'info-1' },
      { type: 'map', id: 'map-1' }
    ]
  },
  {
    id: 'portal-usuario',
    title: 'Portal del Usuario',
    components: [
      { type: 'hero', id: 'hero-portal' },
      { type: 'user-services', id: 'services-portal-1' },
      { type: 'quick-access', id: 'quick-1' }
    ]
  },
  {
    id: 'invoice-query',
    title: 'Consulta de Facturas',
    components: [
      { type: 'hero', id: 'hero-invoice' },
      { type: 'invoice-search', id: 'search-1' },
      { type: 'payment-info', id: 'payment-1' }
    ]
  }
];

// Función para generar JSON base de una página
function generatePageJSON(pageConfig) {
  const baseJSON = {
    version: '1.0',
    metadata: {
      title: pageConfig.title,
      slug: pageConfig.id,
      description: `Página ${pageConfig.title} del acueducto municipal`,
      keywords: ['acueducto', 'municipal', pageConfig.title.toLowerCase()],
      lastModified: new Date().toISOString()
    },
    layout: {
      type: 'page',
      className: 'min-h-screen bg-gray-50',
      children: pageConfig.components.map(comp => ({
        id: comp.id,
        type: comp.type,
        props: getDefaultPropsForComponent(comp.type),
        style: {
          margin: '0',
          padding: '0'
        }
      }))
    },
    styles: {
      global: {
        fontFamily: 'Inter, system-ui, sans-serif',
        lineHeight: '1.6'
      }
    }
  };
  
  return baseJSON;
}

// Props por defecto según el tipo de componente
function getDefaultPropsForComponent(type) {
  const defaultProps = {
    'hero': {
      title: 'Título Principal',
      subtitle: 'Subtítulo descriptivo',
      backgroundImage: '/images/hero-bg.jpg',
      ctaText: 'Conocer más',
      ctaLink: '#'
    },
    'stats': {
      items: [
        { label: 'Usuarios', value: '50,000+', icon: 'users' },
        { label: 'Municipios', value: '15', icon: 'map' },
        { label: 'Años', value: '25+', icon: 'calendar' },
        { label: 'Satisfacción', value: '99%', icon: 'heart' }
      ]
    },
    'services': {
      title: 'Nuestros Servicios',
      items: [
        { title: 'Suministro de Agua', description: 'Agua potable 24/7', icon: 'droplets' },
        { title: 'Alcantarillado', description: 'Sistema de drenaje', icon: 'waves' },
        { title: 'Mantenimiento', description: 'Reparaciones y mejoras', icon: 'wrench' }
      ]
    },
    'contact-form': {
      title: 'Contáctanos',
      fields: [
        { name: 'name', label: 'Nombre', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'message', label: 'Mensaje', type: 'textarea', required: true }
      ],
      submitText: 'Enviar Mensaje'
    },
    'contact-info': {
      items: [
        { type: 'phone', label: 'Teléfono', value: '+57 123 456 7890' },
        { type: 'email', label: 'Email', value: 'info@acueducto.gov.co' },
        { type: 'address', label: 'Dirección', value: 'Calle Principal #123' }
      ]
    },
    'mission-vision': {
      mission: 'Proveer servicios de agua potable y saneamiento de calidad.',
      vision: 'Ser el referente en servicios públicos sostenibles.',
      values: ['Calidad', 'Transparencia', 'Sostenibilidad', 'Servicio']
    }
  };
  
  return defaultProps[type] || {};
}

// Función principal de migración
async function migratePages() {
  console.log('🚀 Iniciando migración de páginas públicas a JSON...');
  
  try {
    // Crear audit log para la migración
    await prisma.auditLog.create({
      data: {
        action: 'migrate',
        entity: 'page',
        entity_id: 'all-public-pages',
        meta: JSON.stringify({
          description: 'Migración automática de páginas públicas a formato JSON',
          pages_count: PUBLIC_PAGES.length,
          timestamp: new Date().toISOString()
        })
      }
    });
    
    for (const pageConfig of PUBLIC_PAGES) {
      console.log(`📄 Procesando página: ${pageConfig.title} (${pageConfig.id})`);
      
      // Generar JSON para la página
      const pageJSON = generatePageJSON(pageConfig);
      
      // Verificar si la página ya existe
      const existingPage = await prisma.page.findUnique({
        where: { id: pageConfig.id }
      });
      
      if (existingPage) {
        // Actualizar página existente
        await prisma.page.update({
          where: { id: pageConfig.id },
          data: {
            title: pageConfig.title,
            draft_json: JSON.stringify(pageJSON),
            published_json: JSON.stringify(pageJSON),
            status: 'published',
            publishedAt: new Date(),
            version: existingPage.version + 1
          }
        });
        console.log(`✅ Página actualizada: ${pageConfig.id}`);
      } else {
        // Crear nueva página
        await prisma.page.create({
          data: {
            id: pageConfig.id,
            title: pageConfig.title,
            draft_json: JSON.stringify(pageJSON),
            published_json: JSON.stringify(pageJSON),
            status: 'published',
            publishedAt: new Date(),
            version: 1
          }
        });
        console.log(`🆕 Página creada: ${pageConfig.id}`);
      }
      
      // Crear audit log individual
      await prisma.auditLog.create({
        data: {
          action: 'create',
          entity: 'page',
          entity_id: pageConfig.id,
          meta: JSON.stringify({
            title: pageConfig.title,
            components_count: pageConfig.components.length,
            migrated_at: new Date().toISOString()
          })
        }
      });
    }
    
    console.log('✅ Migración completada exitosamente!');
    console.log(`📊 Total de páginas migradas: ${PUBLIC_PAGES.length}`);
    
    // Mostrar resumen
    const allPages = await prisma.page.findMany();
    console.log('\n📋 Resumen de páginas en base de datos:');
    allPages.forEach(page => {
      console.log(`  - ${page.title} (${page.id}) - ${page.status}`);
    });
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    
    // Crear audit log de error
    await prisma.auditLog.create({
      data: {
        action: 'error',
        entity: 'page',
        entity_id: 'migration-error',
        meta: JSON.stringify({
          error: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
        })
      }
    });
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar migración si se llama directamente
if (require.main === module) {
  migratePages();
}

module.exports = { migratePages, generatePageJSON };