import { Module } from '@nestjs/common';
import { DatabaseService } from './database/database.service';
import { AuthModule } from './auth/auth.module';
import { PagesModule } from './pages/pages.module';
import { InvoicesModule } from './invoices/invoices.module';

@Module({
  imports: [
    AuthModule,
    PagesModule,
    InvoicesModule,
  ],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class AppModule {}