import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PagesModule } from './pages/pages.module';
import { AuthModule } from './auth/auth.module';
import { AuditModule } from './audit/audit.module';
import { InvoicesModule } from './invoices/invoices.module';
import { AssetsModule } from './assets/assets.module';
import { CollaborationModule } from './collaboration/collaboration.module';
import { DatabaseService } from './database/database.service';

@Module({
  imports: [
    AuthModule,
    PagesModule,
    InvoicesModule,
    AuditModule,
    AssetsModule,
    CollaborationModule,
  ],
  controllers: [AppController],
  providers: [AppService, DatabaseService],
  exports: [DatabaseService],
})
export class AppModule {}