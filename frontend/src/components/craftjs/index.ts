// Importaciones de bloques desde la carpeta blocks
import HeroBlock, { HeroBlockSettings } from '../blocks/HeroBlock';
import ContactBlock, { ContactBlockSettings } from '../blocks/ContactBlock';
import TeamBlock, { TeamBlockSettings } from '../blocks/TeamBlock';
import DocumentsBlock, { DocumentsBlockSettings } from '../blocks/DocumentsBlock';
import ServicesBlock, { ServicesBlockSettings } from '../blocks/ServicesBlock';
import StatsBlock, { StatsBlockSettings } from '../blocks/StatsBlock';
import { FormBlock, FormBlockSettings } from '../blocks/FormBlock';
import { GalleryBlock, GalleryBlockSettings } from '../blocks/GalleryBlock';
import { MapBlock, MapBlockSettings } from '../blocks/MapBlock';
import { TableBlock, TableBlockSettings } from '../blocks/TableBlock';
import { SliderBlock, SliderBlockSettings } from '../blocks/SliderBlock';

// Resolver para Craft.js
export const Resolver = {
  HeroBlock,
  ContactBlock,
  TeamBlock,
  DocumentsBlock,
  ServicesBlock,
  StatsBlock,
  FormBlock,
  GalleryBlock,
  MapBlock,
  TableBlock,
  SliderBlock
};

// Exportaciones individuales
export {
  HeroBlock,
  HeroBlockSettings,
  ContactBlock,
  ContactBlockSettings,
  TeamBlock,
  TeamBlockSettings,
  DocumentsBlock,
  DocumentsBlockSettings,
  ServicesBlock,
  ServicesBlockSettings,
  StatsBlock,
  StatsBlockSettings,
  FormBlock,
  FormBlockSettings,
  GalleryBlock,
  GalleryBlockSettings,
  MapBlock,
  MapBlockSettings,
  TableBlock,
  TableBlockSettings,
  SliderBlock,
  SliderBlockSettings
};

// Componentes disponibles para el editor
export const AvailableComponents = [
  {
    name: 'HeroBlock',
    displayName: 'Hero/Banner',
    category: 'Layout',
    description: 'Sección principal con imagen de fondo y call-to-action'
  },
  {
    name: 'ContactBlock',
    displayName: 'Contacto',
    category: 'Content',
    description: 'Información de contacto con detalles y enlaces'
  },
  {
    name: 'TeamBlock',
    displayName: 'Equipo',
    category: 'Content',
    description: 'Presentación del equipo con fotos y descripciones'
  },
  {
    name: 'DocumentsBlock',
    displayName: 'Documentos',
    category: 'Content',
    description: 'Lista de documentos descargables'
  },
  {
    name: 'ServicesBlock',
    displayName: 'Servicios',
    category: 'Content',
    description: 'Presentación de servicios ofrecidos'
  },
  {
    name: 'StatsBlock',
    displayName: 'Estadísticas',
    category: 'Content',
    description: 'Visualización de estadísticas y números importantes'
  },
  {
    name: 'FormBlock',
    displayName: 'Formulario',
    category: 'Interactive',
    description: 'Formulario personalizable con diferentes tipos de campos'
  },
  {
    name: 'GalleryBlock',
    displayName: 'Galería',
    category: 'Media',
    description: 'Galería de imágenes con diferentes layouts y lightbox'
  },
  {
    name: 'MapBlock',
    displayName: 'Mapa',
    category: 'Interactive',
    description: 'Mapa interactivo con marcadores personalizables'
  },
  {
    name: 'TableBlock',
    displayName: 'Tabla',
    category: 'Content',
    description: 'Tabla de datos editable con funciones avanzadas'
  },
  {
    name: 'SliderBlock',
    displayName: 'Slider/Carrusel',
    category: 'Media',
    description: 'Carrusel de imágenes/contenido con navegación automática'
  }
];

// Categorías de componentes
export const ComponentCategories = {
  Layout: 'Diseño',
  Content: 'Contenido',
  Interactive: 'Interactivo',
  Media: 'Multimedia'
};