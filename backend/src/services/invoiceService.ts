import { Invoice, InvoiceItem, Payment, InvoiceStatus, PaymentStatus, PaymentMethod } from '@prisma/client';
import prisma from '../config/database';
import { createError } from '../middleware/errorHandler';

export interface CreateInvoiceData {
  userId: string;
  period: string;
  dueDate: Date;
  notes?: string;
  items: CreateInvoiceItemData[];
}

export interface CreateInvoiceItemData {
  description: string;
  quantity: number;
  unitPrice: number;
  category?: string;
}

export interface UpdateInvoiceData {
  dueDate?: Date;
  status?: InvoiceStatus;
  notes?: string;
  items?: UpdateInvoiceItemData[];
}

export interface UpdateInvoiceItemData {
  id?: string;
  description?: string;
  quantity?: number;
  unitPrice?: number;
  category?: string;
}

export interface CreatePaymentData {
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
}

export interface InvoiceFilters {
  search?: string;
  userId?: string;
  status?: InvoiceStatus;
  dateFrom?: Date;
  dateTo?: Date;
  dueDateFrom?: Date;
  dueDateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
}

export interface PaymentFilters {
  search?: string;
  invoiceId?: string;
  userId?: string;
  status?: PaymentStatus;
  method?: PaymentMethod;
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
}

export class InvoiceService {
  /**
   * Crear una nueva factura
   */
  static async createInvoice(data: CreateInvoiceData) {
    try {
      // Verificar que el usuario existe
      const user = await prisma.user.findUnique({
        where: { id: data.userId }
      });

      if (!user) {
        throw createError(404, 'Usuario no encontrado');
      }

      // Calcular totales
      const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      const tax = subtotal * 0.19; // IVA del 19%
      const total = subtotal + tax;

      // Generar número de factura
      const lastInvoice = await prisma.invoice.findFirst({
        orderBy: { invoiceNumber: 'desc' }
      });

      const nextNumber = lastInvoice ? parseInt(lastInvoice.invoiceNumber) + 1 : 1;
      const invoiceNumber = nextNumber.toString().padStart(6, '0');

      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber,
          userId: data.userId,
          period: data.period,
          issueDate: new Date(),
          dueDate: data.dueDate,
          amount: total,
          status: 'PENDING',
          notes: data.notes,
          items: {
            create: data.items.map(item => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.quantity * item.unitPrice,
              category: item.category
            }))
          }
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          },
          items: true,
          payments: true
        }
      });

      return invoice;
    } catch (error: any) {
      if (error.statusCode) throw error;
      throw createError(500, 'Error al crear la factura');
    }
  }

  /**
   * Obtener facturas con filtros y paginación
   */
  static async getInvoices(filters: InvoiceFilters) {
    try {
      const {
        search,
        userId,
        status,
        dateFrom,
        dateTo,
        dueDateFrom,
        dueDateTo,
        minAmount,
        maxAmount,
        page = 1,
        limit = 10
      } = filters;

      const skip = (page - 1) * limit;

      const where: any = {};

      if (search) {
        where.OR = [
          { invoiceNumber: { contains: search, mode: 'insensitive' } },
          { notes: { contains: search, mode: 'insensitive' } },
          { user: { 
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } }
            ]
          }}
        ];
      }

      if (userId) {
        where.userId = userId;
      }

      if (status) {
        where.status = status;
      }

      if (dateFrom || dateTo) {
        where.issueDate = {};
        if (dateFrom) where.issueDate.gte = dateFrom;
        if (dateTo) where.issueDate.lte = dateTo;
      }

      if (dueDateFrom || dueDateTo) {
        where.dueDate = {};
        if (dueDateFrom) where.dueDate.gte = dueDateFrom;
        if (dueDateTo) where.dueDate.lte = dueDateTo;
      }

      if (minAmount || maxAmount) {
        where.total = {};
        if (minAmount) where.total.gte = minAmount;
        if (maxAmount) where.total.lte = maxAmount;
      }

      const [invoices, total] = await Promise.all([
        prisma.invoice.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true
              }
            },
            items: true,
            payments: true,
            _count: {
              select: {
                items: true,
                payments: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.invoice.count({ where })
      ]);

      return {
        invoices,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error: any) {
      throw createError(500, 'Error al obtener las facturas');
    }
  }

  /**
   * Obtener factura por ID
   */
  static async getInvoiceById(id: string) {
    try {
      const invoice = await prisma.invoice.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          },
          items: true,
          payments: {
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      if (!invoice) {
        throw createError(404, 'Factura no encontrada');
      }

      return invoice;
    } catch (error: any) {
      if (error.statusCode) throw error;
      throw createError(500, 'Error al obtener la factura');
    }
  }

  /**
   * Actualizar factura
   */
  static async updateInvoice(id: string, data: UpdateInvoiceData) {
    try {
      const existingInvoice = await prisma.invoice.findUnique({
        where: { id },
        include: { items: true }
      });

      if (!existingInvoice) {
        throw createError(404, 'Factura no encontrada');
      }

      // No permitir actualizar facturas pagadas o canceladas
      if (existingInvoice.status === 'PAID' || existingInvoice.status === 'CANCELLED') {
        throw createError(400, 'No se puede actualizar una factura pagada o cancelada');
      }

      const updateData: any = {};

      if (data.dueDate) updateData.dueDate = data.dueDate;
      if (data.status) updateData.status = data.status;
      if (data.notes !== undefined) updateData.notes = data.notes;

      // Si se actualizan los items, recalcular totales
      if (data.items) {
        // Eliminar items existentes
        await prisma.invoiceItem.deleteMany({
          where: { invoiceId: id }
        });

        const subtotal = data.items.reduce((sum, item) => sum + (item.quantity! * item.unitPrice!), 0);
        const tax = subtotal * 0.19;
        const total = subtotal + tax;

        updateData.subtotal = subtotal;
        updateData.tax = tax;
        updateData.total = total;
        updateData.items = {
          create: data.items.map(item => ({
            description: item.description!,
            quantity: item.quantity!,
            unitPrice: item.unitPrice!,
            total: item.quantity! * item.unitPrice!,
            category: item.category
          }))
        };
      }

      const invoice = await prisma.invoice.update({
        where: { id },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          },
          items: true,
          payments: true
        }
      });

      return invoice;
    } catch (error: any) {
      if (error.statusCode) throw error;
      throw createError(500, 'Error al actualizar la factura');
    }
  }

  /**
   * Eliminar factura (soft delete)
   */
  static async deleteInvoice(id: string) {
    try {
      const invoice = await prisma.invoice.findUnique({
        where: { id }
      });

      if (!invoice) {
        throw createError(404, 'Factura no encontrada');
      }

      // No permitir eliminar facturas con pagos
      const paymentsCount = await prisma.payment.count({
        where: { invoiceId: id }
      });

      if (paymentsCount > 0) {
        throw createError(400, 'No se puede eliminar una factura con pagos registrados');
      }

      await prisma.invoice.update({
        where: { id },
        data: { 
          status: 'CANCELLED',
          updatedAt: new Date()
        }
      });

      return { message: 'Factura eliminada exitosamente' };
    } catch (error: any) {
      if (error.statusCode) throw error;
      throw createError(500, 'Error al eliminar la factura');
    }
  }

  /**
   * Crear pago para una factura
   */
  static async createPayment(data: CreatePaymentData) {
    try {
      const invoice = await prisma.invoice.findUnique({
        where: { id: data.invoiceId },
        include: { payments: true }
      });

      if (!invoice) {
        throw createError(404, 'Factura no encontrada');
      }

      if (invoice.status === 'CANCELLED') {
        throw createError(400, 'No se puede pagar una factura cancelada');
      }

      // Calcular el monto ya pagado
      const paidAmount = invoice.payments
        .filter(p => p.status === 'COMPLETED')
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const remainingAmount = Number(invoice.amount) - paidAmount;

      if (data.amount > remainingAmount) {
        throw createError(400, `El monto excede el saldo pendiente (${remainingAmount})`);
      }

      const payment = await prisma.payment.create({
        data: {
          invoiceId: data.invoiceId,
          amount: data.amount,
         paymentMethod: data.method,
         reference: data.reference,
          status: 'COMPLETED',
          processedAt: new Date()
        },
        include: {
          invoice: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          }
        }
      });

      // Actualizar estado de la factura si está completamente pagada
      const newPaidAmount = paidAmount + data.amount;
      if (newPaidAmount >= Number(invoice.amount)) {
        await prisma.invoice.update({
          where: { id: data.invoiceId },
          data: { status: 'PAID' }
        });
      } else if (newPaidAmount > 0 && invoice.status === 'PENDING') {
         await prisma.invoice.update({
           where: { id: data.invoiceId },
           data: { status: 'SENT' }
         });
       }

      return payment;
    } catch (error: any) {
      if (error.statusCode) throw error;
      throw createError(500, 'Error al crear el pago');
    }
  }

  /**
   * Obtener pagos con filtros
   */
  static async getPayments(filters: PaymentFilters) {
    try {
      const {
        search,
        invoiceId,
        userId,
        status,
        method,
        dateFrom,
        dateTo,
        minAmount,
        maxAmount,
        page = 1,
        limit = 10
      } = filters;

      const skip = (page - 1) * limit;

      const where: any = {};

      if (search) {
        where.OR = [
          { reference: { contains: search, mode: 'insensitive' } },
          { notes: { contains: search, mode: 'insensitive' } },
          { invoice: { invoiceNumber: { contains: search, mode: 'insensitive' } } }
        ];
      }

      if (invoiceId) {
        where.invoiceId = invoiceId;
      }

      if (userId) {
        where.invoice = { userId };
      }

      if (status) {
        where.status = status;
      }

      if (method) {
        where.method = method;
      }

      if (dateFrom || dateTo) {
        where.paidAt = {};
        if (dateFrom) where.paidAt.gte = dateFrom;
        if (dateTo) where.paidAt.lte = dateTo;
      }

      if (minAmount || maxAmount) {
        where.amount = {};
        if (minAmount) where.amount.gte = minAmount;
        if (maxAmount) where.amount.lte = maxAmount;
      }

      const [payments, total] = await Promise.all([
        prisma.payment.findMany({
          where,
          include: {
            invoice: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.payment.count({ where })
      ]);

      return {
        payments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error: any) {
      throw createError(500, 'Error al obtener los pagos');
    }
  }

  /**
   * Obtener estadísticas de facturación
   */
  static async getInvoiceStats() {
    try {
      const [
        totalInvoices,
        totalRevenue,
        pendingInvoices,
        overdueInvoices,
        paidInvoices,
        thisMonthInvoices,
        lastMonthInvoices,
        thisMonthRevenue,
        lastMonthRevenue,
        statusStats,
        monthlyStats
      ] = await Promise.all([
        // Total de facturas
        prisma.invoice.count(),
        
        // Ingresos totales
         prisma.invoice.aggregate({
           where: { status: 'PAID' },
           _sum: { amount: true }
         }),
        
        // Facturas pendientes
         prisma.invoice.count({
           where: { status: { in: ['PENDING', 'SENT'] } }
         }),
        
        // Facturas vencidas
         prisma.invoice.count({
           where: {
             status: { in: ['PENDING', 'SENT'] },
             dueDate: { lt: new Date() }
           }
         }),
        
        // Facturas pagadas
        prisma.invoice.count({
          where: { status: 'PAID' }
        }),
        
        // Facturas de este mes
        prisma.invoice.count({
          where: {
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        }),
        
        // Facturas del mes pasado
        prisma.invoice.count({
          where: {
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
              lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        }),
        
        // Ingresos de este mes
        prisma.invoice.aggregate({
          where: {
            status: 'PAID',
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          },
          _sum: { amount: true }
        }),
        
        // Ingresos del mes pasado
        prisma.invoice.aggregate({
          where: {
            status: 'PAID',
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
              lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          },
          _sum: { amount: true }
        }),
        
        // Estadísticas por estado
        prisma.invoice.groupBy({
          by: ['status'],
          _count: { status: true },
          _sum: { amount: true }
        }),
        
        // Estadísticas mensuales (últimos 6 meses)
        prisma.$queryRaw`
          SELECT 
            DATE_TRUNC('month', "createdAt") as month,
            COUNT(*)::int as count,
            SUM("total")::float as revenue
          FROM "Invoice"
          WHERE "createdAt" >= NOW() - INTERVAL '6 months'
          GROUP BY DATE_TRUNC('month', "createdAt")
          ORDER BY month DESC
        `
      ]);

      const invoiceGrowth = lastMonthInvoices > 0 
        ? ((thisMonthInvoices - lastMonthInvoices) / lastMonthInvoices) * 100 
        : 0;

      const thisMonthRevenueNum = Number(thisMonthRevenue._sum?.amount || 0);
       const lastMonthRevenueNum = Number(lastMonthRevenue._sum?.amount || 0);
       const totalRevenueNum = Number(totalRevenue._sum?.amount || 0);

       const revenueGrowth = lastMonthRevenueNum > 0
         ? ((thisMonthRevenueNum - lastMonthRevenueNum) / lastMonthRevenueNum) * 100
         : 0;

       return {
         total: totalInvoices,
         totalRevenue: totalRevenueNum,
         pending: pendingInvoices,
         overdue: overdueInvoices,
         paid: paidInvoices,
         thisMonth: thisMonthInvoices,
         lastMonth: lastMonthInvoices,
         invoiceGrowth: Math.round(invoiceGrowth * 100) / 100,
         thisMonthRevenue: thisMonthRevenueNum,
         lastMonthRevenue: lastMonthRevenueNum,
         revenueGrowth: Math.round(revenueGrowth * 100) / 100,
         byStatus: statusStats.reduce((acc: any, stat: any) => {
           acc[stat.status] = {
             count: stat._count.status,
             total: Number(stat._sum?.amount || 0)
           };
           return acc;
         }, {}),
        monthlyStats
      };
    } catch (error: any) {
      throw createError(500, 'Error al obtener las estadísticas');
    }
  }

  /**
   * Obtener facturas de un usuario específico
   */
  static async getUserInvoices(userId: string, filters: Omit<InvoiceFilters, 'userId'>) {
    try {
      // Verificar que el usuario existe
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw createError(404, 'Usuario no encontrado');
      }

      return this.getInvoices({ ...filters, userId });
    } catch (error: any) {
      if (error.statusCode) throw error;
      throw createError(500, 'Error al obtener las facturas del usuario');
    }
  }

  /**
   * Obtener facturas vencidas
   */
  static async getOverdueInvoices(limit: number = 10) {
    try {
      const invoices = await prisma.invoice.findMany({
        where: {
          status: { in: ['PENDING', 'OVERDUE'] },
          dueDate: { lt: new Date() }
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          },
          items: true,
          payments: true
        },
        orderBy: { dueDate: 'asc' },
        take: limit
      });

      return invoices;
    } catch (error: any) {
      throw createError(500, 'Error al obtener las facturas vencidas');
    }
  }
}

export default InvoiceService;