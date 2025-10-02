import { Router } from 'express';
import { InvoiceController } from '../controllers/invoiceController';
import { authenticate, authorize } from '../middleware/auth';
import { generalLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Invoice:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID único de la factura
 *         invoiceNumber:
 *           type: string
 *           description: Número de factura
 *         userId:
 *           type: string
 *           description: ID del usuario
 *         issueDate:
 *           type: string
 *           format: date-time
 *           description: Fecha de emisión
 *         dueDate:
 *           type: string
 *           format: date-time
 *           description: Fecha de vencimiento
 *         subtotal:
 *           type: number
 *           description: Subtotal de la factura
 *         tax:
 *           type: number
 *           description: Impuestos
 *         total:
 *           type: number
 *           description: Total de la factura
 *         status:
 *           type: string
 *           enum: [PENDING, PARTIAL, PAID, OVERDUE, CANCELLED]
 *           description: Estado de la factura
 *         notes:
 *           type: string
 *           description: Notas adicionales
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *         user:
 *           $ref: '#/components/schemas/User'
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/InvoiceItem'
 *         payments:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Payment'
 *     
 *     InvoiceItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID único del elemento
 *         description:
 *           type: string
 *           description: Descripción del elemento
 *         quantity:
 *           type: number
 *           description: Cantidad
 *         unitPrice:
 *           type: number
 *           description: Precio unitario
 *         total:
 *           type: number
 *           description: Total del elemento
 *         category:
 *           type: string
 *           description: Categoría del elemento
 *         invoiceId:
 *           type: string
 *           description: ID de la factura
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *     
 *     Payment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID único del pago
 *         invoiceId:
 *           type: string
 *           description: ID de la factura
 *         amount:
 *           type: number
 *           description: Monto del pago
 *         method:
 *           type: string
 *           enum: [CASH, CARD, TRANSFER, CHECK, OTHER]
 *           description: Método de pago
 *         status:
 *           type: string
 *           enum: [PENDING, COMPLETED, FAILED, CANCELLED]
 *           description: Estado del pago
 *         reference:
 *           type: string
 *           description: Referencia del pago
 *         notes:
 *           type: string
 *           description: Notas del pago
 *         paidAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de pago
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         invoice:
 *           $ref: '#/components/schemas/Invoice'
 *     
 *     CreateInvoiceRequest:
 *       type: object
 *       required:
 *         - userId
 *         - dueDate
 *         - items
 *       properties:
 *         userId:
 *           type: string
 *           format: uuid
 *           description: ID del usuario
 *         dueDate:
 *           type: string
 *           format: date-time
 *           description: Fecha de vencimiento
 *         notes:
 *           type: string
 *           maxLength: 500
 *           description: Notas adicionales
 *         items:
 *           type: array
 *           minItems: 1
 *           items:
 *             type: object
 *             required:
 *               - description
 *               - quantity
 *               - unitPrice
 *             properties:
 *               description:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 200
 *                 description: Descripción del elemento
 *               quantity:
 *                 type: number
 *                 minimum: 0.01
 *                 description: Cantidad
 *               unitPrice:
 *                 type: number
 *                 minimum: 0.01
 *                 description: Precio unitario
 *               category:
 *                 type: string
 *                 maxLength: 100
 *                 description: Categoría del elemento
 *     
 *     UpdateInvoiceRequest:
 *       type: object
 *       properties:
 *         dueDate:
 *           type: string
 *           format: date-time
 *           description: Fecha de vencimiento
 *         status:
 *           type: string
 *           enum: [PENDING, PARTIAL, PAID, OVERDUE, CANCELLED]
 *           description: Estado de la factura
 *         notes:
 *           type: string
 *           maxLength: 500
 *           description: Notas adicionales
 *         items:
 *           type: array
 *           minItems: 1
 *           items:
 *             type: object
 *             required:
 *               - description
 *               - quantity
 *               - unitPrice
 *             properties:
 *               id:
 *                 type: string
 *                 format: uuid
 *                 description: ID del elemento (para actualización)
 *               description:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 200
 *                 description: Descripción del elemento
 *               quantity:
 *                 type: number
 *                 minimum: 0.01
 *                 description: Cantidad
 *               unitPrice:
 *                 type: number
 *                 minimum: 0.01
 *                 description: Precio unitario
 *               category:
 *                 type: string
 *                 maxLength: 100
 *                 description: Categoría del elemento
 *     
 *     CreatePaymentRequest:
 *       type: object
 *       required:
 *         - amount
 *         - method
 *       properties:
 *         amount:
 *           type: number
 *           minimum: 0.01
 *           description: Monto del pago
 *         method:
 *           type: string
 *           enum: [CASH, CARD, TRANSFER, CHECK, OTHER]
 *           description: Método de pago
 *         reference:
 *           type: string
 *           maxLength: 100
 *           description: Referencia del pago
 *         notes:
 *           type: string
 *           maxLength: 500
 *           description: Notas del pago
 */

/**
 * @swagger
 * /api/invoices:
 *   post:
 *     summary: Crear una nueva factura
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateInvoiceRequest'
 *     responses:
 *       201:
 *         description: Factura creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     invoice:
 *                       $ref: '#/components/schemas/Invoice'
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.post('/', authenticate, authorize("ADMIN", "MANAGER"), generalLimiter, InvoiceController.createInvoice);

/**
 * @swagger
 * /api/invoices:
 *   get:
 *     summary: Obtener lista de facturas con filtros
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar en número de factura, notas o datos del usuario
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por usuario (solo admin/manager)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, PARTIAL, PAID, OVERDUE, CANCELLED]
 *         description: Filtrar por estado
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de emisión desde
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de emisión hasta
 *       - in: query
 *         name: dueDateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de vencimiento desde
 *       - in: query
 *         name: dueDateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de vencimiento hasta
 *       - in: query
 *         name: minAmount
 *         schema:
 *           type: number
 *         description: Monto mínimo
 *       - in: query
 *         name: maxAmount
 *         schema:
 *           type: number
 *         description: Monto máximo
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Elementos por página
 *     responses:
 *       200:
 *         description: Lista de facturas obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     invoices:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Invoice'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         pages:
 *                           type: integer
 *       401:
 *         description: No autorizado
 */
router.get('/', authenticate, authorize("ADMIN", "MANAGER"), InvoiceController.getInvoices);

/**
 * @swagger
 * /api/invoices/my:
 *   get:
 *     summary: Obtener facturas del usuario autenticado
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar en número de factura o notas
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, PARTIAL, PAID, OVERDUE, CANCELLED]
 *         description: Filtrar por estado
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de emisión desde
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de emisión hasta
 *       - in: query
 *         name: dueDateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de vencimiento desde
 *       - in: query
 *         name: dueDateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de vencimiento hasta
 *       - in: query
 *         name: minAmount
 *         schema:
 *           type: number
 *         description: Monto mínimo
 *       - in: query
 *         name: maxAmount
 *         schema:
 *           type: number
 *         description: Monto máximo
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Elementos por página
 *     responses:
 *       200:
 *         description: Facturas del usuario obtenidas exitosamente
 *       401:
 *         description: No autorizado
 */
router.get('/my', authenticate, InvoiceController.getMyInvoices);

/**
 * @swagger
 * /api/invoices/overdue:
 *   get:
 *     summary: Obtener facturas vencidas
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Número máximo de facturas a obtener
 *     responses:
 *       200:
 *         description: Facturas vencidas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     invoices:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Invoice'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.get('/overdue', authenticate, authorize("ADMIN", "MANAGER"), InvoiceController.getOverdueInvoices);

/**
 * @swagger
 * /api/invoices/stats:
 *   get:
 *     summary: Obtener estadísticas de facturación
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         totalRevenue:
 *                           type: number
 *                         pending:
 *                           type: integer
 *                         overdue:
 *                           type: integer
 *                         paid:
 *                           type: integer
 *                         thisMonth:
 *                           type: integer
 *                         lastMonth:
 *                           type: integer
 *                         invoiceGrowth:
 *                           type: number
 *                         thisMonthRevenue:
 *                           type: number
 *                         lastMonthRevenue:
 *                           type: number
 *                         revenueGrowth:
 *                           type: number
 *                         byStatus:
 *                           type: object
 *                         monthlyStats:
 *                           type: array
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.get('/stats', authenticate, authorize("ADMIN", "MANAGER"), InvoiceController.getInvoiceStats);

/**
 * @swagger
 * /api/invoices/user/{userId}:
 *   get:
 *     summary: Obtener facturas de un usuario específico
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del usuario
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar en número de factura o notas
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, PARTIAL, PAID, OVERDUE, CANCELLED]
 *         description: Filtrar por estado
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de emisión desde
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de emisión hasta
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Elementos por página
 *     responses:
 *       200:
 *         description: Facturas del usuario obtenidas exitosamente
 *       404:
 *         description: Usuario no encontrado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.get('/user/:userId', authenticate, authorize("ADMIN", "MANAGER"), InvoiceController.getUserInvoices);

/**
 * @swagger
 * /api/invoices/{id}:
 *   get:
 *     summary: Obtener una factura por ID
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la factura
 *     responses:
 *       200:
 *         description: Factura obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     invoice:
 *                       $ref: '#/components/schemas/Invoice'
 *       404:
 *         description: Factura no encontrada
 *       401:
 *         description: No autorizado
 */
router.get('/:id', authenticate, authorize("ADMIN", "MANAGER", "USER"), InvoiceController.getInvoiceById);

/**
 * @swagger
 * /api/invoices/{id}:
 *   put:
 *     summary: Actualizar una factura
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la factura
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateInvoiceRequest'
 *     responses:
 *       200:
 *         description: Factura actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     invoice:
 *                       $ref: '#/components/schemas/Invoice'
 *       400:
 *         description: Datos de entrada inválidos
 *       404:
 *         description: Factura no encontrada
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.put('/:id', authenticate, authorize("ADMIN", "MANAGER"), generalLimiter, InvoiceController.updateInvoice);

/**
 * @swagger
 * /api/invoices/{id}:
 *   delete:
 *     summary: Eliminar una factura
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la factura
 *     responses:
 *       200:
 *         description: Factura eliminada exitosamente
 *       400:
 *         description: No se puede eliminar la factura
 *       404:
 *         description: Factura no encontrada
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.delete('/:id', authenticate, authorize("ADMIN", "MANAGER"), InvoiceController.deleteInvoice);

/**
 * @swagger
 * /api/invoices/{id}/payments:
 *   post:
 *     summary: Registrar un pago para una factura
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la factura
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePaymentRequest'
 *     responses:
 *       201:
 *         description: Pago registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     payment:
 *                       $ref: '#/components/schemas/Payment'
 *       400:
 *         description: Datos de entrada inválidos
 *       404:
 *         description: Factura no encontrada
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.post('/:id/payments', authenticate, authorize("ADMIN", "MANAGER"), generalLimiter, InvoiceController.createPayment);

/**
 * @swagger
 * /api/invoices/payments:
 *   get:
 *     summary: Obtener lista de pagos con filtros
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar en referencia, notas o número de factura
 *       - in: query
 *         name: invoiceId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por factura
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por usuario
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, COMPLETED, FAILED, CANCELLED]
 *         description: Filtrar por estado
 *       - in: query
 *         name: method
 *         schema:
 *           type: string
 *           enum: [CASH, CARD, TRANSFER, CHECK, OTHER]
 *         description: Filtrar por método de pago
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de pago desde
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de pago hasta
 *       - in: query
 *         name: minAmount
 *         schema:
 *           type: number
 *         description: Monto mínimo
 *       - in: query
 *         name: maxAmount
 *         schema:
 *           type: number
 *         description: Monto máximo
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Elementos por página
 *     responses:
 *       200:
 *         description: Lista de pagos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     payments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Payment'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         pages:
 *                           type: integer
 *       401:
 *         description: No autorizado
 */
router.get('/payments', authenticate, authorize("ADMIN", "MANAGER"), InvoiceController.getPayments);

export default router;