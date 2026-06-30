#!/bin/bash
# Deploy script — corre esto en Git Bash para desplegar al VPS
set -e

printf '#!/bin/sh\necho "SsalasS1898"\n' > /tmp/askpass.sh && chmod +x /tmp/askpass.sh
export SSH_ASKPASS=/tmp/askpass.sh SSH_ASKPASS_REQUIRE=force

R="ssh -o StrictHostKeyChecking=no -o ConnectTimeout=30 root@207.244.224.159"

echo "==> git pull..."
$R 'cd /var/www/cialo-hub && git pull'

echo "==> Prisma generate + migrate..."
$R 'cd /var/www/cialo-hub/api && npx prisma generate && npx prisma migrate deploy'

echo "==> Build backend..."
$R 'cd /var/www/cialo-hub/api && npm run build'

echo "==> Restart API..."
$R 'pm2 restart cialo-api'

echo "==> Build frontend..."
$R 'cd /var/www/cialo-hub/app && npm run build'

echo "==> Verificando..."
$R 'pm2 status cialo-api | grep -E "online|stopped|error"'

rm -f /tmp/askpass.sh
echo ""
echo "Deploy completado. Visita https://administracion.cialo.cl"
