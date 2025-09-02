import { Module } from '@nestjs/common';
import { PagesController } from './pages.controller';
import { PagesService } from './pages.service';
import { PageVersionsController } from './page-versions.controller';
import { PageVersionsService } from './page-versions.service';
import { DatabaseService } from '../database/database.service';

@Module({
  controllers: [PagesController, PageVersionsController],
  providers: [PagesService, PageVersionsService, DatabaseService],
})
export class PagesModule {}