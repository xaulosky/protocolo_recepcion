module.exports = {
  apps: [
    {
      name: 'cialo-api',
      script: 'dist/server.js',
      cwd: '/var/www/cialo-hub/api',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
    },
  ],
};
