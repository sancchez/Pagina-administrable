import { Controller, Post, Param, UseGuards, Body } from '@nestjs/common';
import { JwtAuthGuard, AdminGuard } from '../auth/jwt-auth.guard';
import { MigrationService } from './migration.service';

// Ajuste: el prefijo global 'api' ya se configura en main.ts, por lo que aquí solo debe ser 'admin'
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class MigrationController {
  constructor(private migrationService: MigrationService) {}

  @Post('pages/:slug/migrate')
  async migratePageToJson(@Param('slug') slug: string, @Body() migrationData?: any) {
    console.log(`[API] POST /api/admin/pages/${slug}/migrate - migrating page to JSON`);
    try {
      const result = await this.migrationService.migratePageToJson(slug, migrationData);
      console.log(`[API] POST /api/admin/pages/${slug}/migrate - success`);
      return result;
    } catch (error: any) {
      console.error(`[API] POST /api/admin/pages/${slug}/migrate - error:`, error.message);
      throw error;
    }
  }

  @Post('pages/migrate-all')
  async migrateAllPages() {
    console.log('[API] POST /api/admin/pages/migrate-all - migrating all public pages');
    try {
      const result = await this.migrationService.migrateAllPublicPages();
      console.log('[API] POST /api/admin/pages/migrate-all - success');
      return result;
    } catch (error: any) {
      console.error('[API] POST /api/admin/pages/migrate-all - error:', error.message);
      throw error;
    }
  }
}