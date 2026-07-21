import dotenv from 'dotenv';
import Joi from 'joi';

// override: true → el .env del proyecto tiene prioridad sobre variables de
// entorno del sistema. Evita que un DATABASE_URL global de otro proyecto
// (p.ej. postgres) pise la config de este proyecto.
dotenv.config({ override: true });

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(4000),
  DATABASE_URL: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('30d'),
  CORS_ORIGIN: Joi.string().default('http://localhost:5173'),
  CORS_ALLOWED_ORIGINS: Joi.string().default('http://localhost:5173,http://localhost:3000'),
  FRONTEND_URL: Joi.string().default('http://localhost:5173'),
  SMTP_HOST: Joi.string().default('smtp.gmail.com'),
  SMTP_PORT: Joi.number().default(587),
  SMTP_USER: Joi.string().allow(''),
  SMTP_PASS: Joi.string().allow(''),
  MAX_FILE_SIZE: Joi.number().default(5242880), // 5MB
  UPLOAD_PATH: Joi.string().default('./uploads'),
  RATE_LIMIT_WINDOW_MS: Joi.number().default(900000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100),
  SESSION_SECRET: Joi.string().required(),
  ADMIN_EMAIL: Joi.string().email().default('admin@acueducto.com'),
  ADMIN_PASSWORD: Joi.string().default('admin123456'),
}).unknown();

const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const config = {
  env: envVars.NODE_ENV,
  nodeEnv: envVars.NODE_ENV,
  port: envVars.PORT,
  database: {
    url: envVars.DATABASE_URL,
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    expiresIn: envVars.JWT_EXPIRES_IN,
    refreshSecret: envVars.JWT_REFRESH_SECRET,
    refreshExpiresIn: envVars.JWT_REFRESH_EXPIRES_IN,
  },
  cors: {
    origin: envVars.CORS_ORIGIN,
    allowedOrigins: envVars.CORS_ALLOWED_ORIGINS.split(','),
  },
  frontend: {
    url: envVars.FRONTEND_URL,
  },
  email: {
    host: envVars.SMTP_HOST,
    port: envVars.SMTP_PORT,
    user: envVars.SMTP_USER,
    pass: envVars.SMTP_PASS,
  },
  upload: {
    maxFileSize: envVars.MAX_FILE_SIZE,
    path: envVars.UPLOAD_PATH,
  },
  rateLimit: {
    windowMs: envVars.RATE_LIMIT_WINDOW_MS,
    maxRequests: envVars.RATE_LIMIT_MAX_REQUESTS,
  },
  session: {
    secret: envVars.SESSION_SECRET,
  },
  admin: {
    email: envVars.ADMIN_EMAIL,
    password: envVars.ADMIN_PASSWORD,
  },
};