module.exports = {
  apps: [
    {
      name: 'ecsendia-autos',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: '/var/www/ecsendia-autos',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '600M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '/var/log/pm2/ecsendia-error.log',
      out_file: '/var/log/pm2/ecsendia-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
}
