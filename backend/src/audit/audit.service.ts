import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AuditService {
  constructor(private db: DatabaseService) {
    console.log('[AuditService] Service initialized');
  }

  async getAuditLogs(limit: number = 10, offset: number = 0) {
    console.log(`[AuditService] getAuditLogs(limit: ${limit}, offset: ${offset})`);
    
    try {
      // Obtener logs de auditoría con paginación
      const logs = await this.db.auditLog.findMany({
        orderBy: {
          createdAt: 'desc'
        },
        take: limit,
        skip: offset
      });

      // Obtener el total de logs para paginación
      const total = await this.db.auditLog.count();

      console.log(`[AuditService] Found ${logs.length} logs out of ${total} total`);

      return {
        logs,
        total,
        limit,
        offset,
        hasMore: offset + logs.length < total
      };
    } catch (error) {
      console.error('[AuditService] Error fetching audit logs:', error);
      throw error;
    }
  }

  async createAuditLog(action: string, entity: string, entityId: string, meta?: any, userId?: number) {
    console.log(`[AuditService] Creating audit log: ${action} ${entity} ${entityId}`);
    
    try {
      const auditLog = await this.db.auditLog.create({
        data: {
          action,
          entity,
          entity_id: entityId,
          meta: meta ? JSON.stringify(meta) : null,
          user_id: userId || null
        }
      });

      console.log(`[AuditService] Audit log created with ID: ${auditLog.id}`);
      return auditLog;
    } catch (error) {
      console.error('[AuditService] Error creating audit log:', error);
      throw error;
    }
  }
}