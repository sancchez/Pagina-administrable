# Validación Robusta de Datos GrapesJS

## Problema Identificado
La aplicación carecía de validación robusta para los datos de GrapesJS, lo que podía resultar en:
- Datos corruptos o malformados guardados en la base de datos
- Vulnerabilidades de seguridad (XSS, inyección de scripts)
- Errores en tiempo de ejecución al cargar páginas
- Pérdida de datos por estructuras inválidas

## Solución Implementada

### 1. Validador Robusto (`grapesValidator.ts`)

Se creó un validador completo que incluye:

#### Validaciones de Estructura
- **Tamaño máximo**: 10MB por datos de GrapesJS
- **Profundidad máxima**: 20 niveles de componentes anidados
- **Cantidad máxima**: 1000 componentes por página
- **Formato JSON**: Validación de sintaxis JSON válida

#### Validaciones de Componentes
- **Etiquetas permitidas**: Lista blanca de etiquetas HTML seguras
- **Atributos seguros**: Eliminación de atributos peligrosos (`onclick`, `onload`, etc.)
- **Contenido sanitizado**: Limpieza de scripts inline y contenido malicioso
- **Estructura recursiva**: Validación de componentes anidados

#### Validaciones de Seguridad
- **Eliminación de scripts**: Remoción de etiquetas `<script>`
- **Eventos inline**: Detección y eliminación de eventos JavaScript
- **Expresiones CSS**: Validación de expresiones peligrosas en CSS
- **URLs de assets**: Validación de URLs válidas

### 2. Integración en PageController

#### Schemas Actualizados
- `createPageSchema`: Validación al crear páginas
- `updatePageSchema`: Validación al actualizar páginas  
- `saveGrapesDataSchema`: Validación robusta al guardar datos del editor

#### Características de Validación
- **Sanitización automática**: Los datos se limpian automáticamente
- **Mensajes detallados**: Errores específicos para cada tipo de problema
- **Advertencias**: Logging de problemas menores que se corrigen automáticamente
- **Datos estructurados**: Retorno de datos validados y sanitizados

### 3. Tipos de Validación

#### Datos GrapesJS Completos
```typescript
interface GrapesJSData {
  pages?: GrapesJSPage[];
  assets?: any[];
  styles?: any[];
  components?: GrapesJSComponent[];
}
```

#### HTML Generado
- Detección de scripts maliciosos
- Validación de eventos inline
- Estructura HTML válida

#### CSS Generado
- Detección de expresiones peligrosas
- Validación de sintaxis CSS
- Limpieza de contenido malicioso

## Beneficios de la Implementación

### 1. Seguridad
- **Prevención XSS**: Eliminación automática de scripts maliciosos
- **Sanitización**: Limpieza de contenido peligroso
- **Lista blanca**: Solo etiquetas y atributos seguros permitidos

### 2. Robustez
- **Validación estructural**: Prevención de datos corruptos
- **Límites de recursos**: Prevención de ataques DoS
- **Recuperación automática**: Corrección de problemas menores

### 3. Mantenibilidad
- **Logging detallado**: Registro de advertencias y errores
- **Mensajes claros**: Información específica sobre problemas
- **Datos consistentes**: Estructura estandarizada garantizada

### 4. Rendimiento
- **Validación eficiente**: Procesamiento optimizado
- **Límites de tamaño**: Prevención de datos excesivamente grandes
- **Caching de validación**: Reutilización de resultados cuando es posible

## Archivos Modificados

### Nuevos Archivos
- `backend/src/utils/grapesValidator.ts`: Validador principal

### Archivos Actualizados
- `backend/src/controllers/pageController.ts`: Integración de validación en todos los schemas

## Uso y Configuración

### Límites Configurables
```typescript
private static readonly MAX_COMPONENT_DEPTH = 20;
private static readonly MAX_COMPONENTS_COUNT = 1000;
private static readonly MAX_DATA_SIZE = 10 * 1024 * 1024; // 10MB
```

### Etiquetas Permitidas
Lista blanca de etiquetas HTML seguras que pueden ser utilizadas en los componentes.

### Validación Personalizada
El validador puede ser extendido para incluir reglas específicas del negocio o validaciones adicionales según las necesidades del proyecto.

## Verificación de la Implementación

1. **Crear página con datos GrapesJS**: Los datos se validan y sanitizan automáticamente
2. **Actualizar página existente**: Validación en tiempo real de cambios
3. **Guardar desde editor**: Validación robusta de datos del editor GrapesJS
4. **Logging de advertencias**: Monitoreo de problemas menores corregidos automáticamente
5. **Rechazo de datos inválidos**: Prevención de guardado de datos corruptos

La implementación garantiza que todos los datos de GrapesJS que se guarden en la base de datos sean válidos, seguros y estructuralmente correctos, mejorando significativamente la robustez y seguridad de la aplicación.