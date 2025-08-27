import { Module } from '@nestjs/common';
import { PagesController } from './pages.controller';
import { PagesService } from './pages.service';
import { DatabaseService } from '../database/database.service';

@Module({
  controllers: [PagesController],
  providers: [PagesService, DatabaseService],
})
export class PagesModule {}