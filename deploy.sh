#!/bin/bash
# Deploy script — corre esto en Git Bash para desplegar al VPS.
#
# Autentica con llave SSH. NO pongas contraseñas en este archivo: está
# versionado, y una credencial en el repo queda expuesta a todo el que lo lea.
#
# Si el servidor te pide contraseña, la llave no está instalada. Instálala una
# sola vez desde tu terminal (te la va a pedir esa vez, y nunca más):
#   ssh-copy-id -i ~/.ssh/id_ed25519.pub root@207.244.224.159
set -e

HOST="${DEPLOY_HOST:-root@207.244.224.159}"
APP_DIR="${DEPLOY_DIR:-/var/www/cialo-hub}"

# BatchMode: si la llave no sirve, falla al tiro en vez de quedarse esperando
# una contraseña que nadie va a escribir.
R="ssh -o BatchMode=yes -o StrictHostKeyChecking=accept-new -o ConnectTimeout=30 $HOST"

echo "==> Verificando acceso por llave..."
if ! $R 'echo ok' > /dev/null 2>&1; then
  echo "ERROR: no se pudo entrar por llave SSH a $HOST"
  echo "Instálala con: ssh-copy-id -i ~/.ssh/id_ed25519.pub $HOST"
  exit 1
fi

echo "==> git pull..."
$R "cd $APP_DIR && git pull"

echo "==> Prisma generate + migrate..."
$R "cd $APP_DIR/api && npx prisma generate && npx prisma migrate deploy"

echo "==> Build backend..."
$R "cd $APP_DIR/api && npm run build"

echo "==> Restart API..."
$R 'pm2 restart cialo-api'

echo "==> Build frontend..."
$R "cd $APP_DIR/app && npm run build"

echo "==> Verificando..."
$R 'pm2 status cialo-api | grep -E "online|stopped|error"'

echo ""
echo "Deploy completado. Visita https://administracion.cialo.cl"
