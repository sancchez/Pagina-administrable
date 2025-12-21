const path = require('path');

module.exports = {
  apps: [
    {
      name: 'pagina-admin',
      // Script a ejecutar (ruta absoluta desde el directorio backend)
      script: './dist/index.js',
      // Directorio de trabajo - desde la raíz del proyecto
      cwd: path.join(__dirname, 'backend'),
      // Intérprete
      interpreter: 'node',
      interpreter_args: '',
      // Modo de ejecución
      exec_mode: 'fork',
      instances: 1,
      // Reinicio automático
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      // Variables de entorno
      env_production: {
        NODE_ENV: 'production',
        PORT: 4000
      },
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      },
      // Logs
      error_file: path.join(__dirname, 'backend', 'logs', 'pm2-error.log'),
      out_file: path.join(__dirname, 'backend', 'logs', 'pm2-out.log'),
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      // Manejo de errores y reintentos
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      // Health check y timeouts
      listen_timeout: 10000,
      kill_timeout: 5000,
      shutdown_with_message: true,
      // Esperar que el servidor esté listo antes de considerar la app como "online"
      wait_ready: true,
      // Tiempo máximo de espera para el evento ready
      listen_timeout: 10000
    }
  ]
};
