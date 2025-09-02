import { TextEditingManager } from '../core/TextEditingManager';

/**
 * Interfaz base para todos los plugins
 */
export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author?: string;
  dependencies?: string[];
  
  // Métodos del ciclo de vida
  initialize(manager: TextEditingManager, config?: any): Promise<void> | void;
  destroy(): Promise<void> | void;
  
  // Configuración
  getDefaultConfig?(): any;
  validateConfig?(config: any): boolean;
  
  // Hooks opcionales
  onBeforeEdit?(element: HTMLElement): boolean | Promise<boolean>;
  onAfterEdit?(element: HTMLElement, content: string): void | Promise<void>;
  onContentChange?(content: string, element: HTMLElement): void | Promise<void>;
  onSave?(element: HTMLElement, content: string): void | Promise<void>;
  onCancel?(element: HTMLElement): void | Promise<void>;
}

/**
 * Gestor del sistema de plugins
 */
export class PluginSystem {
  private plugins: Map<string, Plugin> = new Map();
  private pluginConfigs: Map<string, any> = new Map();
  private manager: TextEditingManager;
  private isInitialized = false;

  constructor(manager: TextEditingManager) {
    this.manager = manager;
  }

  /**
   * Registra un plugin en el sistema
   */
  async registerPlugin(plugin: Plugin, config?: any): Promise<boolean> {
    try {
      // Verificar dependencias
      if (plugin.dependencies) {
        for (const dep of plugin.dependencies) {
          if (!this.plugins.has(dep)) {
            console.error(`Plugin ${plugin.id} requiere dependencia: ${dep}`);
            return false;
          }
        }
      }

      // Validar configuración
      const finalConfig = { ...plugin.getDefaultConfig?.(), ...config };
      if (plugin.validateConfig && !plugin.validateConfig(finalConfig)) {
        console.error(`Configuración inválida para plugin: ${plugin.id}`);
        return false;
      }

      // Registrar plugin
      this.plugins.set(plugin.id, plugin);
      this.pluginConfigs.set(plugin.id, finalConfig);

      // Inicializar si el sistema ya está inicializado
      if (this.isInitialized) {
        await plugin.initialize(this.manager, finalConfig);
      }

      console.log(`✅ Plugin registrado: ${plugin.name} v${plugin.version}`);
      return true;
    } catch (error) {
      console.error(`Error registrando plugin ${plugin.id}:`, error);
      return false;
    }
  }

  /**
   * Desregistra un plugin del sistema
   */
  async unregisterPlugin(pluginId: string): Promise<boolean> {
    try {
      const plugin = this.plugins.get(pluginId);
      if (!plugin) {
        console.warn(`Plugin no encontrado: ${pluginId}`);
        return false;
      }

      // Verificar dependencias inversas
      for (const [id, p] of this.plugins) {
        if (p.dependencies?.includes(pluginId)) {
          console.error(`No se puede desregistrar ${pluginId}, requerido por: ${id}`);
          return false;
        }
      }

      // Destruir plugin
      await plugin.destroy();
      
      // Remover del sistema
      this.plugins.delete(pluginId);
      this.pluginConfigs.delete(pluginId);

      console.log(`❌ Plugin desregistrado: ${plugin.name}`);
      return true;
    } catch (error) {
      console.error(`Error desregistrando plugin ${pluginId}:`, error);
      return false;
    }
  }

  /**
   * Inicializa todos los plugins registrados
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.warn('Sistema de plugins ya inicializado');
      return;
    }

    console.log('🔌 Inicializando sistema de plugins...');
    
    // Ordenar plugins por dependencias
    const sortedPlugins = this.topologicalSort();
    
    for (const plugin of sortedPlugins) {
      try {
        const config = this.pluginConfigs.get(plugin.id);
        await plugin.initialize(this.manager, config);
        console.log(`✅ Plugin inicializado: ${plugin.name}`);
      } catch (error) {
        console.error(`Error inicializando plugin ${plugin.id}:`, error);
      }
    }

    this.isInitialized = true;
    console.log('🎉 Sistema de plugins inicializado');
  }

  /**
   * Destruye todos los plugins
   */
  async destroy(): Promise<void> {
    console.log('🔌 Destruyendo sistema de plugins...');
    
    // Destruir en orden inverso
    const plugins = Array.from(this.plugins.values()).reverse();
    
    for (const plugin of plugins) {
      try {
        await plugin.destroy();
        console.log(`❌ Plugin destruido: ${plugin.name}`);
      } catch (error) {
        console.error(`Error destruyendo plugin ${plugin.id}:`, error);
      }
    }

    this.plugins.clear();
    this.pluginConfigs.clear();
    this.isInitialized = false;
  }

  /**
   * Ejecuta hooks de plugins
   */
  async executeHook<T extends keyof Plugin>(
    hookName: T,
    ...args: any[]
  ): Promise<any[]> {
    const results: any[] = [];
    
    for (const plugin of this.plugins.values()) {
      const hook = plugin[hookName] as Function;
      if (typeof hook === 'function') {
        try {
          const result = await hook.apply(plugin, args);
          results.push(result);
        } catch (error) {
          console.error(`Error ejecutando hook ${String(hookName)} en plugin ${plugin.id}:`, error);
        }
      }
    }
    
    return results;
  }

  /**
   * Obtiene un plugin por ID
   */
  getPlugin(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * Obtiene todos los plugins registrados
   */
  getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Obtiene la configuración de un plugin
   */
  getPluginConfig(pluginId: string): any {
    return this.pluginConfigs.get(pluginId);
  }

  /**
   * Actualiza la configuración de un plugin
   */
  updatePluginConfig(pluginId: string, config: any): boolean {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return false;

    if (plugin.validateConfig && !plugin.validateConfig(config)) {
      console.error(`Configuración inválida para plugin: ${pluginId}`);
      return false;
    }

    this.pluginConfigs.set(pluginId, config);
    return true;
  }

  /**
   * Verifica si un plugin está registrado
   */
  hasPlugin(pluginId: string): boolean {
    return this.plugins.has(pluginId);
  }

  /**
   * Ordena plugins por dependencias (topological sort)
   */
  private topologicalSort(): Plugin[] {
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const result: Plugin[] = [];

    const visit = (pluginId: string) => {
      if (visiting.has(pluginId)) {
        throw new Error(`Dependencia circular detectada: ${pluginId}`);
      }
      
      if (visited.has(pluginId)) {
        return;
      }

      visiting.add(pluginId);
      
      const plugin = this.plugins.get(pluginId);
      if (plugin?.dependencies) {
        for (const dep of plugin.dependencies) {
          visit(dep);
        }
      }
      
      visiting.delete(pluginId);
      visited.add(pluginId);
      
      if (plugin) {
        result.push(plugin);
      }
    };

    for (const pluginId of this.plugins.keys()) {
      if (!visited.has(pluginId)) {
        visit(pluginId);
      }
    }

    return result;
  }
}

/**
 * Plugin base abstracto para facilitar la creación de plugins
 */
export abstract class BasePlugin implements Plugin {
  abstract id: string;
  abstract name: string;
  abstract version: string;
  abstract description: string;
  
  author?: string;
  dependencies?: string[];
  
  protected manager?: TextEditingManager;
  protected config?: any;

  async initialize(manager: TextEditingManager, config?: any): Promise<void> {
    this.manager = manager;
    this.config = config;
    await this.onInitialize();
  }

  async destroy(): Promise<void> {
    await this.onDestroy();
    this.manager = undefined;
    this.config = undefined;
  }

  getDefaultConfig(): any {
    return {};
  }

  validateConfig(): boolean {
    return true;
  }

  // Métodos abstractos para implementar
  protected abstract onInitialize(): Promise<void> | void;
  protected abstract onDestroy(): Promise<void> | void;
}