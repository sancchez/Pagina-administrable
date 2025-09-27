import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateUserRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - firstName
 *         - lastName
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Email del usuario
 *         password:
 *           type: string
 *           minLength: 8
 *           description: Contraseña del usuario
 *         firstName:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           description: Nombre del usuario
 *         lastName:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           description: Apellido del usuario
 *         phone:
 *           type: string
 *           description: Teléfono del usuario (opcional)
 *         role:
 *           type: string
 *           enum: [ADMIN, MANAGER, USER]
 *           description: Rol del usuario (opcional, por defecto USER)
 *     
 *     UpdateUserRequest:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           description: Nombre del usuario
 *         lastName:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           description: Apellido del usuario
 *         phone:
 *           type: string
 *           description: Teléfono del usuario
 *         role:
 *           type: string
 *           enum: [ADMIN, MANAGER, USER]
 *           description: Rol del usuario
 *         isActive:
 *           type: boolean
 *           description: Estado activo del usuario
 *     
 *     UserResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               $ref: '#/components/schemas/User'
 *     
 *     UsersListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             users:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *             pagination:
 *               type: object
 *               properties:
 *                 page:
 *                   type: number
 *                 limit:
 *                   type: number
 *                 total:
 *                   type: number
 *                 pages:
 *                   type: number
 *     
 *     UserStats:
 *       type: object
 *       properties:
 *         total:
 *           type: number
 *           description: Total de usuarios
 *         active:
 *           type: number
 *           description: Usuarios activos
 *         inactive:
 *           type: number
 *           description: Usuarios inactivos
 *         byRole:
 *           type: object
 *           properties:
 *             ADMIN:
 *               type: number
 *             MANAGER:
 *               type: number
 *             USER:
 *               type: number
 */

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Crear nuevo usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: Usuario no autenticado
 *       403:
 *         description: Sin permisos para crear usuarios
 *       409:
 *         description: El usuario ya existe
 */
router.post('/', authenticate, authorize(UserRole.ADMIN, UserRole.MANAGER), UserController.createUser);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Obtener lista de usuarios con filtros
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nombre, apellido o email
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [ADMIN, MANAGER, USER]
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
 *         description: Elementos por página
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UsersListResponse'
 *       400:
 *         description: Parámetros de consulta inválidos
 *       401:
 *         description: Usuario no autenticado
 *       403:
 *         description: Sin permisos para ver usuarios
 */
router.get('/', authenticate, authorize(UserRole.ADMIN, UserRole.MANAGER), UserController.getUsers);

/**
 * @swagger
 * /api/users/stats:
 *   get:
 *     summary: Obtener estadísticas de usuarios
 *     tags: [Usuarios]
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
 *                       $ref: '#/components/schemas/UserStats'
 *       401:
 *         description: Usuario no autenticado
 *       403:
 *         description: Sin permisos para ver estadísticas
 */
router.get('/stats', authenticate, authorize(UserRole.ADMIN, UserRole.MANAGER), UserController.getUserStats);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Obtener usuario por ID
 *     tags: [Usuarios]
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
 *               $ref: '#/components/schemas/UserResponse'
 *       401:
 *         description: Usuario no autenticado
 *       403:
 *         description: Sin permisos para ver este usuario
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/:id', authenticate, authorize(UserRole.ADMIN, UserRole.MANAGER), UserController.getUserById);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Actualizar usuario
 *     tags: [Usuarios]
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
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: Usuario no autenticado
 *       403:
 *         description: Sin permisos para actualizar usuarios
 *       404:
 *         description: Usuario no encontrado
 */
router.put('/:id', authenticate, authorize(UserRole.ADMIN, UserRole.MANAGER), UserController.updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Eliminar usuario (soft delete)
 *     tags: [Usuarios]
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
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: No puedes eliminar tu propia cuenta
 *       401:
 *         description: Usuario no autenticado
 *       403:
 *         description: Sin permisos para eliminar usuarios
 *       404:
 *         description: Usuario no encontrado
 */
router.delete('/:id', authenticate, authorize(UserRole.ADMIN), UserController.deleteUser);

/**
 * @swagger
 * /api/users/{id}/role:
 *   patch:
 *     summary: Cambiar rol de usuario
 *     tags: [Usuarios]
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
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [ADMIN, MANAGER, USER]
 *                 description: Nuevo rol del usuario
 *     responses:
 *       200:
 *         description: Rol cambiado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Datos inválidos o no puedes cambiar tu propio rol
 *       401:
 *         description: Usuario no autenticado
 *       403:
 *         description: Sin permisos para cambiar roles
 *       404:
 *         description: Usuario no encontrado
 */
router.patch('/:id/role', authenticate, authorize(UserRole.ADMIN), UserController.changeUserRole);

/**
 * @swagger
 * /api/users/{id}/toggle-status:
 *   patch:
 *     summary: Activar/desactivar usuario
 *     tags: [Usuarios]
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
 *         description: Estado del usuario cambiado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: No puedes cambiar tu propio estado
 *       401:
 *         description: Usuario no autenticado
 *       403:
 *         description: Sin permisos para cambiar estados de usuarios
 *       404:
 *         description: Usuario no encontrado
 */
router.patch('/:id/toggle-status', authenticate, authorize(UserRole.ADMIN, UserRole.MANAGER), UserController.toggleUserStatus);

export default router;