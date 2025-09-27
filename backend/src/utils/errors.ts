export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const createError = (statusCode: number, message: string): AppError => {
  return new AppError(message, statusCode);
};

export const handleAsync = (fn: Function) => {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const sendErrorResponse = (res: any, error: any) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message
    });
  }

  // Error de validación de Joi
  if (error.isJoi) {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      details: error.details.map((detail: any) => detail.message)
    });
  }

  // Error de Prisma
  if (error.code) {
    switch (error.code) {
      case 'P2002':
        return res.status(409).json({
          success: false,
          message: 'Ya existe un registro con estos datos'
        });
      case 'P2025':
        return res.status(404).json({
          success: false,
          message: 'Registro no encontrado'
        });
      default:
        return res.status(500).json({
          success: false,
          message: 'Error de base de datos'
        });
    }
  }

  // Error genérico
  console.error('Error no manejado:', error);
  return res.status(500).json({
    success: false,
    message: 'Error interno del servidor'
  });
};