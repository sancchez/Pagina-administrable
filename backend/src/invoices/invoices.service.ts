import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Invoice } from '../types/database.types';

@Injectable()
export class InvoicesService {
  constructor(private databaseService: DatabaseService) {}

  async findByAccountNumber(accountNumber: string) {
    const invoice = await this.databaseService.findInvoiceByAccount(accountNumber);
    if (!invoice) {
      throw new NotFoundException('Factura no encontrada');
    }
    return invoice;
  }

  async findAll() {
    return this.databaseService.findAllInvoices();
  }
}