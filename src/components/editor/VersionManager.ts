interface Version {
  id: string;
  content: string;
  timestamp: Date;
  description: string;
}

export class VersionManager {
  private versions: Version[] = [];
  private maxVersions: number;

  constructor(maxVersions: number = 10) {
    this.maxVersions = maxVersions;
  }

  // Crear una nueva versión
  createVersion(content: string, description?: string): string {
    // Generar descripción por defecto más descriptiva
    const defaultDescription = this.generateDefaultDescription();
    
    const version: Version = {
      id: this.generateId(),
      content,
      timestamp: new Date(),
      description: description || defaultDescription
    };

    this.versions.unshift(version);

    // Mantener solo las últimas versiones
    if (this.versions.length > this.maxVersions) {
      this.versions = this.versions.slice(0, this.maxVersions);
    }

    console.log('📦 Nueva versión creada:', version.id, version.description);
    return version.id;
  }

  // Crear versión de la configuración actual
  createCurrentConfigVersion(content: string): string {
    const description = `Configuración actual - ${new Date().toLocaleString('es-ES')}`;
    return this.createVersion(content, description);
  }

  // Crear versión original/inicial
  createOriginalVersion(content: string): string {
    const description = 'Versión original';
    return this.createVersion(content, description);
  }

  // Obtener una versión específica
  getVersion(id: string): Version | null {
    return this.versions.find(v => v.id === id) || null;
  }

  // Obtener todas las versiones
  getAllVersions(): Version[] {
    return [...this.versions];
  }

  // Restaurar a una versión específica
  restoreVersion(id: string): string | null {
    const version = this.getVersion(id);
    if (version) {
      console.log('🔄 Restaurando versión:', id, version.description);
      return version.content;
    }
    return null;
  }

  // Eliminar una versión
  deleteVersion(id: string): boolean {
    const index = this.versions.findIndex(v => v.id === id);
    if (index !== -1) {
      this.versions.splice(index, 1);
      console.log('🗑️ Versión eliminada:', id);
      return true;
    }
    return false;
  }

  // Obtener la versión más reciente
  getLatestVersion(): Version | null {
    return this.versions.length > 0 ? this.versions[0] : null;
  }

  // Limpiar todas las versiones
  clearVersions(): void {
    this.versions = [];
    console.log('🧹 Todas las versiones eliminadas');
  }

  // Generar ID único
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Generar descripción por defecto
  private generateDefaultDescription(): string {
    const now = new Date();
    const timeString = now.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    const dateString = now.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit'
    });
    
    const versionNumber = this.versions.length + 1;
    return `Versión ${versionNumber} - ${dateString} ${timeString}`;
  }

  // Obtener estadísticas
  getStats(): { count: number; oldestDate: Date | null; newestDate: Date | null } {
    if (this.versions.length === 0) {
      return { count: 0, oldestDate: null, newestDate: null };
    }

    return {
      count: this.versions.length,
      oldestDate: this.versions[this.versions.length - 1].timestamp,
      newestDate: this.versions[0].timestamp
    };
  }
}

export default VersionManager;