/**
 * Migración puntual (producción): convierte las cuentas Box existentes de rol
 * RECEPCION a rol BOX, crea sus buzones (línea privada con el equipo de Recepción)
 * y las saca de los canales por rol (ej. "Recepción"), donde ya no corresponden.
 * No crea ni modifica las cuentas de recepcionistas. Idempotente.
 * Ejecutar: npx tsx prisma/migrate-boxes-to-buzon.ts
 */
import { PrismaClient, Role } from '@prisma/client';
import { syncBuzones } from '../src/lib/buzon.ts';
import { syncUserChannels } from '../src/lib/channels.ts';

const prisma = new PrismaClient();

async function main() {
  // Cuentas Box por email (box1@cialo.cl … box9@cialo.cl).
  const emails = Array.from({ length: 9 }, (_, i) => `box${i + 1}@cialo.cl`);
  const boxes = await prisma.user.findMany({
    where: { email: { in: emails } },
    select: { id: true, email: true, role: true },
  });
  console.log(`Encontradas ${boxes.length} cuentas Box.`);

  // 1) Rol BOX.
  for (const b of boxes) {
    if (b.role !== Role.BOX) {
      await prisma.user.update({ where: { id: b.id }, data: { role: Role.BOX } });
      console.log(`  ✓ ${b.email}: ${b.role} → BOX`);
    } else {
      console.log(`  · ${b.email}: ya es BOX`);
    }
  }

  // 2) Buzones (uno por box, con todo el equipo de Recepción).
  console.log('Sincronizando buzones…');
  await syncBuzones();
  const totalBuzones = await prisma.conversation.count({ where: { buzonBoxId: { not: null } } });
  console.log(`  ✓ ${totalBuzones} buzones activos`);

  // 3) Sacar a los boxes de los canales por rol (ya no son RECEPCION).
  console.log('Re-sincronizando canales…');
  for (const b of boxes) await syncUserChannels(b.id);
  console.log('  ✓ canales actualizados');

  console.log('Listo ✅');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
