import { PageData } from './craftSerializer';

/**
 * Servicio de respaldo para proteger datos antes de migraciones
 */
export class BackupService {
  /**
   * Crear respaldo de una página individual
   */
  static async createPageBackup(page: PageData): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupData = {
      metadata: {
        backupDate: new Date().toISOString(),
        pageId: page.id,
        pageSlug: page.slug,
        pageTitle: page.title,
        version: '1.0.0'
      },
      originalData: page
    };

    const backupJson = JSON.stringify(backupData, null, 2);
    
    // Guardar en localStorage como respaldo local
    const backupKey = `backup_${page.id}_${timestamp}`;
    localStorage.setItem(backupKey, backupJson);
    
    console.log(`📦 [BackupService] Created backup for page ${page.slug}: ${backupKey}`);
    return backupKey;
  }

  /**
   * Crear respaldo de múltiples páginas
   */
  static async createBulkBackup(pages: PageData[]): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupData = {
      metadata: {
        backupDate: new Date().toISOString(),
        totalPages: pages.length,
        version: '1.0.0',
        type: 'bulk_backup'
      },
      pages: pages
    };

    const backupJson = JSON.stringify(backupData, null, 2);
    const backupKey = `bulk_backup_${timestamp}`;
    
    // Guardar en localStorage
    localStorage.setItem(backupKey, backupJson);
    
    console.log(`📦 [BackupService] Created bulk backup: ${backupKey} (${pages.length} pages)`);
    return backupKey;
  }

  /**
   * Descargar respaldo como archivo
   */
  static downloadBackup(backupKey: string): void {
    const backupData = localStorage.getItem(backupKey);
    if (!backupData) {
      throw new Error(`Backup not found: ${backupKey}`);
    }

    const blob = new Blob([backupData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${backupKey}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log(`💾 [BackupService] Downloaded backup: ${backupKey}`);
  }

  /**
   * Listar todos los respaldos disponibles
   */
  static listBackups(): Array<{key: string, metadata: unknown, size: number}> {
    const backups = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('backup_') || key.startsWith('bulk_backup_'))) {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            backups.push({
              key,
              metadata: parsed.metadata,
              size: data.length
            });
          } catch {
            console.warn(`⚠️ [BackupService] Invalid backup data: ${key}`);
          }
        }
      }
    }
    
    return backups.sort((a, b) => 
      new Date(b.metadata.backupDate).getTime() - new Date(a.metadata.backupDate).getTime()
    );
  }

  /**
   * Restaurar desde respaldo
   */
  static restoreFromBackup(backupKey: string): PageData | PageData[] {
    const backupData = localStorage.getItem(backupKey);
    if (!backupData) {
      throw new Error(`Backup not found: ${backupKey}`);
    }

    try {
      const parsed = JSON.parse(backupData);
      
      if (parsed.metadata.type === 'bulk_backup') {
        console.log(`🔄 [BackupService] Restoring bulk backup: ${backupKey}`);
        return parsed.pages;
      } else {
        console.log(`🔄 [BackupService] Restoring page backup: ${backupKey}`);
        return parsed.originalData;
      }
    } catch {
      throw new Error(`Invalid backup data: ${backupKey}`);
    }
  }

  /**
   * Limpiar respaldos antiguos (más de 30 días)
   */
  static cleanOldBackups(daysToKeep: number = 30): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const backups = this.listBackups();
    let deletedCount = 0;
    
    backups.forEach(backup => {
      const backupDate = new Date(backup.metadata.backupDate);
      if (backupDate < cutoffDate) {
        localStorage.removeItem(backup.key);
        deletedCount++;
        console.log(`🗑️ [BackupService] Deleted old backup: ${backup.key}`);
      }
    });
    
    console.log(`🧹 [BackupService] Cleaned ${deletedCount} old backups`);
    return deletedCount;
  }

  /**
   * Obtener estadísticas de respaldos
   */
  static getBackupStats(): {
    totalBackups: number;
    totalSize: number;
    oldestBackup?: string;
    newestBackup?: string;
  } {
    const backups = this.listBackups();
    
    return {
      totalBackups: backups.length,
      totalSize: backups.reduce((sum, backup) => sum + backup.size, 0),
      oldestBackup: backups.length > 0 ? backups[backups.length - 1].metadata.backupDate : undefined,
      newestBackup: backups.length > 0 ? backups[0].metadata.backupDate : undefined
    };
  }
}

export default BackupService;