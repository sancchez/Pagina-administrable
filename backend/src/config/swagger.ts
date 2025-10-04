import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';
import { config } from './env';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Página Admin API',
      version: '1.0.0',
      description: 'API para sistema de administración de páginas web con GrapesJS',
      contact: {
        name: 'Admin System',
        email: 'admin@paginaadmin.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.API_URL || `http://localhost:${config.port}`,
        description: 'Servidor de desarrollo'
      },
      {
        url: 'https://api.paginaadmin.com',
        description: 'Servidor de producción'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT para autenticación. Formato: Bearer {token}'
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Token de acceso faltante o inválido',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  message: {
                    type: 'string',
                    example: 'Token de acceso requerido'
                  },
                  error: {
                    type: 'string',
                    example: 'UNAUTHORIZED'
                  }
                }
              }
            }
          }
        },
        ForbiddenError: {
          description: 'Acceso denegado - permisos insuficientes',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  message: {
                    type: 'string',
                    example: 'Acceso denegado'
                  },
                  error: {
                    type: 'string',
                    example: 'FORBIDDEN'
                  }
                }
              }
            }
          }
        },
        ValidationError: {
          description: 'Error de validación de datos',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  message: {
                    type: 'string',
                    example: 'Datos de entrada inválidos'
                  },
                  error: {
                    type: 'string',
                    example: 'VALIDATION_ERROR'
                  },
                  details: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        field: {
                          type: 'string'
                        },
                        message: {
                          type: 'string'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        NotFoundError: {
          description: 'Recurso no encontrado',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  message: {
                    type: 'string',
                    example: 'Recurso no encontrado'
                  },
                  error: {
                    type: 'string',
                    example: 'NOT_FOUND'
                  }
                }
              }
            }
          }
        },
        InternalServerError: {
          description: 'Error interno del servidor',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  message: {
                    type: 'string',
                    example: 'Error interno del servidor'
                  },
                  error: {
                    type: 'string',
                    example: 'INTERNAL_SERVER_ERROR'
                  }
                }
              }
            }
          }
        },
        RateLimitError: {
          description: 'Límite de solicitudes excedido',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  message: {
                    type: 'string',
                    example: 'Demasiadas solicitudes, intenta más tarde'
                  },
                  error: {
                    type: 'string',
                    example: 'RATE_LIMIT_EXCEEDED'
                  }
                }
              }
            }
          }
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único del usuario'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Correo electrónico del usuario'
            },
            firstName: {
              type: 'string',
              description: 'Nombre del usuario'
            },
            lastName: {
              type: 'string',
              description: 'Apellido del usuario'
            },
            role: {
              type: 'string',
              enum: ['ADMIN', 'USER'],
              description: 'Rol del usuario'
            },
            isActive: {
              type: 'boolean',
              description: 'Estado activo del usuario'
            },
            lastLogin: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Fecha del último inicio de sesión'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización'
            }
          }
        },
        Page: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único de la página'
            },
            title: {
              type: 'string',
              description: 'Título de la página'
            },
            slug: {
              type: 'string',
              description: 'URL amigable de la página'
            },
            content: {
              type: 'object',
              description: 'Contenido de la página en formato GrapesJS'
            },
            htmlContent: {
              type: 'string',
              description: 'Contenido HTML renderizado'
            },
            cssContent: {
              type: 'string',
              description: 'Estilos CSS de la página'
            },
            jsContent: {
              type: 'string',
              description: 'JavaScript personalizado de la página'
            },
            metaTitle: {
              type: 'string',
              nullable: true,
              description: 'Título meta para SEO'
            },
            metaDescription: {
              type: 'string',
              nullable: true,
              description: 'Descripción meta para SEO'
            },
            metaKeywords: {
              type: 'string',
              nullable: true,
              description: 'Palabras clave meta para SEO'
            },
            status: {
              type: 'string',
              enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
              description: 'Estado de la página'
            },
            isHomePage: {
              type: 'boolean',
              description: 'Indica si es la página de inicio'
            },
            userId: {
              type: 'string',
              format: 'uuid',
              description: 'ID del usuario propietario'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Correo electrónico del usuario'
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'Contraseña del usuario'
            }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'confirmPassword', 'firstName', 'lastName'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Correo electrónico del usuario'
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'Contraseña del usuario'
            },
            confirmPassword: {
              type: 'string',
              minLength: 6,
              description: 'Confirmación de contraseña'
            },
            firstName: {
              type: 'string',
              description: 'Nombre del usuario'
            },
            lastName: {
              type: 'string',
              description: 'Apellido del usuario'
            }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string'
            },
            data: {
              type: 'object',
              properties: {
                user: {
                  $ref: '#/components/schemas/User'
                },
                token: {
                  type: 'string',
                  description: 'Token JWT de acceso'
                },
                refreshToken: {
                  type: 'string',
                  description: 'Token de actualización'
                }
              }
            }
          }
        },
        CreatePageRequest: {
          type: 'object',
          required: ['title'],
          properties: {
            title: {
              type: 'string',
              description: 'Título de la página'
            },
            slug: {
              type: 'string',
              description: 'URL amigable (se genera automáticamente si no se proporciona)'
            },
            content: {
              type: 'object',
              description: 'Contenido inicial de la página en formato GrapesJS'
            },
            metaTitle: {
              type: 'string',
              description: 'Título meta para SEO'
            },
            metaDescription: {
              type: 'string',
              description: 'Descripción meta para SEO'
            },
            metaKeywords: {
              type: 'string',
              description: 'Palabras clave meta para SEO'
            }
          }
        },
        UpdatePageRequest: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Título de la página'
            },
            slug: {
              type: 'string',
              description: 'URL amigable'
            },
            content: {
              type: 'object',
              description: 'Contenido de la página en formato GrapesJS'
            },
            htmlContent: {
              type: 'string',
              description: 'Contenido HTML renderizado'
            },
            cssContent: {
              type: 'string',
              description: 'Estilos CSS de la página'
            },
            jsContent: {
              type: 'string',
              description: 'JavaScript personalizado de la página'
            },
            metaTitle: {
              type: 'string',
              description: 'Título meta para SEO'
            },
            metaDescription: {
              type: 'string',
              description: 'Descripción meta para SEO'
            },
            metaKeywords: {
              type: 'string',
              description: 'Palabras clave meta para SEO'
            },
            status: {
              type: 'string',
              enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
              description: 'Estado de la página'
            }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              minimum: 1,
              description: 'Página actual'
            },
            limit: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              description: 'Elementos por página'
            },
            total: {
              type: 'integer',
              minimum: 0,
              description: 'Total de elementos'
            },
            pages: {
              type: 'integer',
              minimum: 0,
              description: 'Total de páginas'
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string'
            },
            data: {
              type: 'object'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string'
            },
            error: {
              type: 'string'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Auth',
        description: 'Endpoints de autenticación y autorización'
      },
      {
        name: 'Users',
        description: 'Gestión de usuarios del sistema'
      },
      {
        name: 'Pages',
        description: 'Gestión de páginas del sitio web con GrapesJS'
      }
    ]
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
    './src/models/*.ts'
  ]
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Application): void => {
  // Configuración personalizada de Swagger UI
  const swaggerOptions = {
    explorer: true,
    swaggerOptions: {
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
      tryItOutEnabled: true,
      requestInterceptor: (req: any) => {
        // Interceptor para agregar headers personalizados si es necesario
        return req;
      },
      responseInterceptor: (res: any) => {
        // Interceptor para procesar respuestas si es necesario
        return res;
      }
    },
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 20px 0 }
      .swagger-ui .info .title { color: #3b82f6 }
      .swagger-ui .scheme-container { background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0 }
      .swagger-ui .btn.authorize { background-color: #10b981; border-color: #10b981 }
      .swagger-ui .btn.authorize:hover { background-color: #059669; border-color: #059669 }
      .swagger-ui .opblock.opblock-post { border-color: #10b981; background: rgba(16, 185, 129, 0.1) }
      .swagger-ui .opblock.opblock-get { border-color: #3b82f6; background: rgba(59, 130, 246, 0.1) }
      .swagger-ui .opblock.opblock-put { border-color: #f59e0b; background: rgba(245, 158, 11, 0.1) }
      .swagger-ui .opblock.opblock-delete { border-color: #ef4444; background: rgba(239, 68, 68, 0.1) }
      .swagger-ui .opblock.opblock-patch { border-color: #8b5cf6; background: rgba(139, 92, 246, 0.1) }
    `,
    customSiteTitle: 'Admin Panel API Documentation',
    customfavIcon: '/favicon.ico'
  };

  // Servir la documentación de Swagger
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerOptions));

  // Endpoint para obtener el JSON de la especificación
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });

  console.log(`📚 Swagger documentation available at: http://localhost:${config.port}/api-docs`);
};

export { specs };