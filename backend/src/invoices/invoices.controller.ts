import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { Invoice } from '../types/database.types';
import { JwtAuthGuard, AdminGuard } from '../auth/jwt-auth.guard';

@Controller('invoices')
export class InvoicesController {
  constructor(private invoicesService: InvoicesService) {}

  @Get(':accountNumber')
  async getInvoice(@Param('accountNumber') accountNumber: string) {
    return this.invoicesService.findByAccountNumber(accountNumber);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get()
  async getAllInvoices() {
    return this.invoicesService.findAll();
  }
}