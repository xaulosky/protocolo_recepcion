#!/bin/bash
# Setup inicial en el VPS — ejecutar una sola vez como root (o con sudo)
# Uso: bash setup.sh

set -e
APP_DIR=/var/www/cialo-hub

echo "=== 1. Dependencias del sistema ==="
apt-get update -q
apt-get install -y curl git nginx certbot python3-certbot-nginx

echo "=== 2. Node.js 22 LTS ==="
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs

echo "=== 3. PM2 ==="
npm install -g pm2

echo "=== 4. Clonar repositorio ==="
mkdir -p $APP_DIR
git clone https://github.com/xaulosky/protocolo_recepcion.git $APP_DIR
# Si ya existe: cd $APP_DIR && git pull

echo "=== 5. Instalar dependencias API ==="
cd $APP_DIR/api
npm ci

echo "=== 6. Instalar dependencias Frontend ==="
cd $APP_DIR/app
npm ci

echo "=== 7. Construir Frontend ==="
npm run build

echo "=== 8. Construir API ==="
cd $APP_DIR/api
npm run build

echo ""
echo "=== SIGUIENTE PASO: crear api/.env en el servidor ==="
echo "cp $APP_DIR/api/.env.example $APP_DIR/api/.env"
echo "nano $APP_DIR/api/.env   # editar con los valores reales"
echo ""
echo "=== SIGUIENTE PASO: migrar base de datos ==="
echo "cd $APP_DIR/api && npx prisma migrate deploy && npm run db:seed"
echo ""
echo "=== SIGUIENTE PASO: copiar nginx.conf ==="
echo "cp $APP_DIR/deploy/nginx.conf /etc/nginx/sites-available/administracion.cialo.cl"
echo "ln -s /etc/nginx/sites-available/administracion.cialo.cl /etc/nginx/sites-enabled/"
echo "nginx -t && systemctl reload nginx"
echo ""
echo "=== SIGUIENTE PASO: SSL con certbot ==="
echo "certbot --nginx -d administracion.cialo.cl"
echo ""
echo "=== SIGUIENTE PASO: iniciar API con PM2 ==="
echo "cd $APP_DIR/api && pm2 start ecosystem.config.cjs"
echo "pm2 save && pm2 startup"
