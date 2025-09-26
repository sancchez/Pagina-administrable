import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard, AdminGuard } from '../auth/jwt-auth.guard';

@Controller('audit-logs')
export class AuditController {
  constructor(private auditService: AuditService) {
    console.log('[AuditController] Controller initialized');
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get()
  async getAuditLogs(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    console.log(`[API] GET /api/audit-logs - fetching audit logs`, {
      limit: limit || 'no limit',
      offset: offset || 'no offset'
    });
    
    try {
      const limitNum = limit ? parseInt(limit, 10) : 10;
      const offsetNum = offset ? parseInt(offset, 10) : 0;
      
      const result = await this.auditService.getAuditLogs(limitNum, offsetNum);
      console.log(`[API] GET /api/audit-logs - success, found ${result.logs.length} logs`);
      return result;
    } catch (error) {
      console.error('[API] GET /api/audit-logs - error:', error.message);
      throw error;
    }
  }
}