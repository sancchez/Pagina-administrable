import { Module } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { DatabaseService } from '../database/database.service';

@Module({
  controllers: [AssetsController],
  providers: [AssetsService, DatabaseService],
})
export class AssetsModule {}