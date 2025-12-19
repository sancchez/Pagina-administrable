module.exports = {
  apps: [
    {
      name: 'pagina-admin-backend',
      script: './dist/index.js',
      cwd: './backend',
      interpreter: 'node',
      interpreter_args: '',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      // Manejo de errores y reintentos
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      // Health check
      listen_timeout: 10000,
      kill_timeout: 5000,
      shutdown_with_message: true
    },
    {
      name: 'pagina-admin-frontend',
      script: './production-server.js',
      cwd: './frontend',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        PORT: 3100
      },
      error_file: './logs/pm2-frontend-error.log',
      out_file: './logs/pm2-frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      // Manejo de errores y reintentos
      min_uptime: '2s',
      max_restarts: 5,
      restart_delay: 2000,
      listen_timeout: 10000,
      kill_timeout: 5000,
      shutdown_with_message: true
    }
  ]
};
