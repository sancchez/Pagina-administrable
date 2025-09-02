import { Module } from '@nestjs/common';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { DatabaseService } from '../database/database.service';

@Module({
  controllers: [InvoicesController],
  providers: [InvoicesService, DatabaseService],
})
export class InvoicesModule {}