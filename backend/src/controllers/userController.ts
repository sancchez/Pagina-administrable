/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Obtener todos los usuarios
 *     description: Devuelve una lista paginada de usuarios (solo administradores)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar usuarios por nombre o email
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [ADMIN, USER]
 *         description: Filtrar por rol
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo
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
 *         description: Número de elementos por página
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Usuarios obtenidos exitosamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *   post:
 *     summary: Crear nuevo usuario
 *     description: Crea un nuevo usuario en el sistema (solo administradores)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, firstName, lastName]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email del usuario
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: Contraseña del usuario
 *               firstName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 description: Nombre del usuario
 *               lastName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 description: Apellido del usuario
 *               phone:
 *                 type: string
 *                 description: Teléfono del usuario (opcional)
 *               role:
 *                 type: string
 *                 enum: [ADMIN, USER]
 *                 default: USER
 *                 description: Rol del usuario
 *           example:
 *             email: "usuario@ejemplo.com"
 *             password: "password123"
 *             firstName: "Juan"
 *             lastName: "Pérez"
 *             phone: "+1234567890"
 *             role: "USER"
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Usuario creado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       409:
 *         description: El email ya está registrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Obtener usuario por ID
 *     description: Devuelve un usuario específico por su ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Usuario obtenido exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *   put:
 *     summary: Actualizar usuario
 *     description: Actualiza la información de un usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 description: Nombre del usuario
 *               lastName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 description: Apellido del usuario
 *               phone:
 *                 type: string
 *                 description: Teléfono del usuario
 *               role:
 *                 type: string
 *                 enum: [ADMIN, USER]
 *                 description: Rol del usuario (solo administradores)
 *               isActive:
 *                 type: boolean
 *                 description: Estado activo del usuario (solo administradores)
 *           example:
 *             firstName: "Juan Carlos"
 *             lastName: "Pérez García"
 *             phone: "+1234567890"
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Usuario actualizado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *   delete:
 *     summary: Eliminar usuario
 *     description: Elimina un usuario del sistema (solo administradores)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /api/users/stats:
 *   get:
 *     summary: Obtener estadísticas de usuarios
 *     description: Devuelve estadísticas generales de usuarios (solo administradores)
 *     tags: [Users]
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
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Estadísticas obtenidas exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total de usuarios
 *                       example: 150
 *                     active:
 *                       type: integer
 *                       description: Usuarios activos
 *                       example: 140
 *                     inactive:
 *                       type: integer
 *                       description: Usuarios inactivos
 *                       example: 10
 *                     byRole:
 *                       type: object
 *                       properties:
 *                         ADMIN:
 *                           type: integer
 *                           example: 5
 *                         USER:
 *                           type: integer
 *                           example: 145
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /api/users/{id}/role:
 *   put:
 *     summary: Cambiar rol de usuario
 *     description: Cambia el rol de un usuario (solo administradores)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [ADMIN, USER]
 *                 description: Nuevo rol del usuario
 *           example:
 *             role: "ADMIN"
 *     responses:
 *       200:
 *         description: Rol cambiado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Rol actualizado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /api/users/{id}/toggle-status:
 *   post:
 *     summary: Cambiar estado de usuario
 *     description: Alterna el estado activo/inactivo de un usuario (solo administradores)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Estado cambiado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Estado del usuario actualizado"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/userService';
import Joi from 'joi';

// Esquemas de validación
const createUserSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Debe ser un email válido',
    'any.required': 'El email es requerido',
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'La contraseña debe tener al menos 8 caracteres',
    'any.required': 'La contraseña es requerida',
  }),
  firstName: Joi.string().min(2).max(50).required().messages({
    'string.min': 'El nombre debe tener al menos 2 caracteres',
    'string.max': 'El nombre no puede exceder 50 caracteres',
    'any.required': 'El nombre es requerido',
  }),
  lastName: Joi.string().min(2).max(50).required().messages({
    'string.min': 'El apellido debe tener al menos 2 caracteres',
    'string.max': 'El apellido no puede exceder 50 caracteres',
    'any.required': 'El apellido es requerido',
  }),
  phone: Joi.string().optional().allow(''),
  role: Joi.string().valid("ADMIN", "MANAGER", "USER").optional(),
});

const updateUserSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional().messages({
    'string.min': 'El nombre debe tener al menos 2 caracteres',
    'string.max': 'El nombre no puede exceder 50 caracteres',
  }),
  lastName: Joi.string().min(2).max(50).optional().messages({
    'string.min': 'El apellido debe tener al menos 2 caracteres',
    'string.max': 'El apellido no puede exceder 50 caracteres',
  }),
  phone: Joi.string().optional().allow(''),
  role: Joi.string().valid("ADMIN", "MANAGER", "USER").optional(),
  isActive: Joi.boolean().optional(),
});

const getUsersQuerySchema = Joi.object({
  search: Joi.string().optional(),
  role: Joi.string().valid("ADMIN", "MANAGER", "USER").optional(),
  isActive: Joi.boolean().optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});

const changeRoleSchema = Joi.object({
  role: Joi.string().valid("ADMIN", "MANAGER", "USER").required().messages({
    'any.required': 'El rol es requerido',
    'any.only': 'El rol debe ser uno de los valores válidos',
  }),
});

export class UserController {
  static async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { error, value } = createUserSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: error.details.map(detail => detail.message),
        });
      }

      const user = await UserService.createUser(value);
      return res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        data: user,
      });
    } catch (error) {
      next(error);
      return;
    }
  }

  static async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { error, value } = getUsersQuerySchema.validate(req.query);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Parámetros de consulta inválidos',
          errors: error.details.map(detail => detail.message),
        });
      }

      const result = await UserService.getUsers(value);
      return res.status(200).json({
        success: true,
        message: 'Usuarios obtenidos exitosamente',
        data: result.users,
        pagination: {
          page: result.pagination.page,
          limit: result.pagination.limit,
          total: result.pagination.total,
          totalPages: result.pagination.pages,
        },
      });
    } catch (error) {
      next(error);
      return;
    }
  }

  static async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await UserService.getUserById(id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Usuario obtenido exitosamente',
        data: user,
      });
    } catch (error) {
      next(error);
      return;
    }
  }

  static async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { error, value } = updateUserSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: error.details.map(detail => detail.message),
        });
      }

      const user = await UserService.updateUser(id, value);
      return res.status(200).json({
        success: true,
        message: 'Usuario actualizado exitosamente',
        data: user,
      });
    } catch (error) {
      next(error);
      return;
    }
  }

  static async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await UserService.deleteUser(id);
      
      return res.status(200).json({
        success: true,
        message: 'Usuario eliminado exitosamente',
      });
    } catch (error) {
      next(error);
      return;
    }
  }

  static async getUserStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await UserService.getUserStats();
      return res.status(200).json({
        success: true,
        message: 'Estadísticas de usuarios obtenidas exitosamente',
        data: stats,
      });
    } catch (error) {
      next(error);
      return;
    }
  }

  static async changeUserRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { error, value } = changeRoleSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: error.details.map(detail => detail.message),
        });
      }

      const user = await UserService.changeUserRole(id, value.role);
      return res.status(200).json({
        success: true,
        message: 'Rol de usuario cambiado exitosamente',
        data: user,
      });
    } catch (error) {
      next(error);
      return;
    }
  }

  static async toggleUserStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await UserService.toggleUserStatus(id);
      
      return res.status(200).json({
        success: true,
        message: `Usuario ${user.isActive ? 'activado' : 'desactivado'} exitosamente`,
        data: user,
      });
    } catch (error) {
      next(error);
      return;
    }
  }
}