import { Module } from '@nestjs/common';
import { PagesController } from './pages.controller';
import { PagesService } from './pages.service';
import { DatabaseService } from '../database/database.service';
import { MigrationController } from './migration.controller';
import { MigrationService } from './migration.service';

@Module({
  controllers: [PagesController, MigrationController],
  providers: [PagesService, DatabaseService, MigrationService],
  exports: [PagesService] // Export PagesService if it needs to be used by other modules
})
export class PagesModule {}