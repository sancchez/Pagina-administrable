// Importaciones de componentes
import HeroBlockComponent, { HeroBlockSettings as HeroBlockSettingsComponent } from './HeroBlock';
import ContactBlockComponent, { ContactBlockSettings as ContactBlockSettingsComponent } from './ContactBlock';
import TeamBlockComponent, { TeamBlockSettings as TeamBlockSettingsComponent } from './TeamBlock';
import DocumentsBlockComponent, { DocumentsBlockSettings as DocumentsBlockSettingsComponent } from './DocumentsBlock';
import ServicesBlockComponent, { ServicesBlockSettings as ServicesBlockSettingsComponent } from './ServicesBlock';
import StatsBlockComponent, { StatsBlockSettings as StatsBlockSettingsComponent } from './StatsBlock';
import { FormBlock as FormBlockComponent, FormBlockSettings as FormBlockSettingsComponent } from './FormBlock';
import { GalleryBlock as GalleryBlockComponent, GalleryBlockSettings as GalleryBlockSettingsComponent } from './GalleryBlock';
import { MapBlock as MapBlockComponent, MapBlockSettings as MapBlockSettingsComponent } from './MapBlock';
import { TableBlock as TableBlockComponent, TableBlockSettings as TableBlockSettingsComponent } from './TableBlock';
import { SliderBlock as SliderBlockComponent, SliderBlockSettings as SliderBlockSettingsComponent } from './SliderBlock';

// Exportaciones de componentes
export { default as HeroBlock, HeroBlockSettings } from './HeroBlock';
export { default as ContactBlock, ContactBlockSettings } from './ContactBlock';
export { default as TeamBlock, TeamBlockSettings } from './TeamBlock';
export { default as DocumentsBlock, DocumentsBlockSettings } from './DocumentsBlock';
export { default as ServicesBlock, ServicesBlockSettings } from './ServicesBlock';
export { default as StatsBlock, StatsBlockSettings } from './StatsBlock';
export { FormBlock, FormBlockSettings } from './FormBlock';
export { GalleryBlock, GalleryBlockSettings } from './GalleryBlock';
export { MapBlock, MapBlockSettings } from './MapBlock';
export { TableBlock, TableBlockSettings } from './TableBlock';
export { SliderBlock, SliderBlockSettings } from './SliderBlock';

// Resolver para Craft.js
export const Resolver = {
  HeroBlock: HeroBlockComponent,
  ContactBlock: ContactBlockComponent,
  TeamBlock: TeamBlockComponent,
  DocumentsBlock: DocumentsBlockComponent,
  ServicesBlock: ServicesBlockComponent,
  StatsBlock: StatsBlockComponent,
  FormBlock: FormBlockComponent,
  GalleryBlock: GalleryBlockComponent,
  MapBlock: MapBlockComponent,
  TableBlock: TableBlockComponent,
  SliderBlock: SliderBlockComponent
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