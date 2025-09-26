/**
 * Sistema de cache inteligente para componentes del editor
 * Optimiza la carga y reutilización de componentes pesados
 */

interface CacheEntry<T = any> {
  component: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  totalSize: number;
}

class ComponentCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize: number;
  private maxAge: number; // en milisegundos
  private stats: CacheStats;

  constructor(maxSize = 50, maxAge = 30 * 60 * 1000) { // 30 minutos por defecto
    this.maxSize = maxSize;
    this.maxAge = maxAge;
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalSize: 0
    };

    // Limpiar cache expirado cada 5 minutos
    setInterval(() => this.cleanExpired(), 5 * 60 * 1000);
  }

  /**
   * Obtiene un componente del cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Verificar si ha expirado
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.evictions++;
      return null;
    }

    // Actualizar estadísticas de acceso
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.stats.hits++;

    return entry.component;
  }

  /**
   * Almacena un componente en el cache
   */
  set<T>(key: string, component: T): void {
    // Si el cache está lleno, eliminar el menos usado
    if (this.cache.size >= this.maxSize) {
      this.evictLeastUsed();
    }

    const entry: CacheEntry<T> = {
      component,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccessed: Date.now()
    };

    this.cache.set(key, entry);
    this.stats.totalSize = this.cache.size;
  }

  /**
   * Verifica si un componente existe en el cache
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Verificar si ha expirado
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Elimina un componente específico del cache
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.totalSize = this.cache.size;
    }
    return deleted;
  }

  /**
   * Limpia todo el cache
   */
  clear(): void {
    this.cache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalSize: 0
    };
  }

  /**
   * Elimina entradas expiradas
   */
  private cleanExpired(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.maxAge) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.stats.evictions += cleaned;
      this.stats.totalSize = this.cache.size;
      console.log(`🧹 [ComponentCache] Cleaned ${cleaned} expired entries`);
    }
  }

  /**
   * Elimina el componente menos usado cuando el cache está lleno
   */
  private evictLeastUsed(): void {
    let leastUsedKey = '';
    let leastUsedCount = Infinity;
    let oldestAccess = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      // Priorizar por menor uso, luego por acceso más antiguo
      if (entry.accessCount < leastUsedCount || 
          (entry.accessCount === leastUsedCount && entry.lastAccessed < oldestAccess)) {
        leastUsedKey = key;
        leastUsedCount = entry.accessCount;
        oldestAccess = entry.lastAccessed;
      }
    }

    if (leastUsedKey) {
      this.cache.delete(leastUsedKey);
      this.stats.evictions++;
      console.log(`🗑️ [ComponentCache] Evicted least used component: ${leastUsedKey}`);
    }
  }

  /**
   * Obtiene estadísticas del cache
   */
  getStats(): CacheStats & { hitRate: number } {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;

    return {
      ...this.stats,
      hitRate: Math.round(hitRate * 100) / 100
    };
  }

  /**
   * Precarga componentes frecuentemente usados
   */
  async preloadFrequentComponents(): Promise<void> {
    const frequentComponents = [
      'HeroBlock',
      'TextComponent', 
      'ImageComponent',
      'ButtonComponent',
      'ContainerComponent'
    ];

    console.log('🚀 [ComponentCache] Preloading frequent components...');

    const preloadPromises = frequentComponents.map(async (componentName) => {
      if (!this.has(componentName)) {
        try {
          let component;
          switch (componentName) {
            case 'HeroBlock':
              component = await import('../components/blocks/HeroBlock');
              break;
            case 'TextComponent':
              component = await import('../components/blocks/TextComponent');
              break;
            case 'ImageComponent':
              component = await import('../components/blocks/ImageComponent');
              break;
            case 'ButtonComponent':
              component = await import('../components/blocks/ButtonComponent');
              break;
            case 'ContainerComponent':
              component = await import('../components/blocks/ContainerComponent');
              break;
            default:
              return;
          }
          
          this.set(componentName, component.default);
          console.log(`✅ [ComponentCache] Preloaded ${componentName}`);
        } catch (error) {
          console.warn(`⚠️ [ComponentCache] Failed to preload ${componentName}:`, error);
        }
      }
    });

    await Promise.all(preloadPromises);
    console.log('🎉 [ComponentCache] Preloading completed');
  }
}

// Instancia singleton del cache
export const componentCache = new ComponentCache();

// Hook para usar el cache en componentes React
export const useComponentCache = () => {
  return {
    get: componentCache.get.bind(componentCache),
    set: componentCache.set.bind(componentCache),
    has: componentCache.has.bind(componentCache),
    delete: componentCache.delete.bind(componentCache),
    clear: componentCache.clear.bind(componentCache),
    getStats: componentCache.getStats.bind(componentCache),
    preload: componentCache.preloadFrequentComponents.bind(componentCache)
  };
};

export default componentCache;