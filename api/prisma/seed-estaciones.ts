/**
 * Crea/actualiza los usuarios de estación: Box 1–9 (rol BOX, solo mensajería) y la
 * cuenta compartida de Recepción (rol RECEPCION, oculta en el selector de DM). Luego
 * sincroniza los "buzones": una línea privada por cada Box con todo el equipo de
 * Recepción. Idempotente: se puede correr varias veces.
 * Ejecutar: npx tsx prisma/seed-estaciones.ts
 */
import bcrypt from 'bcryptjs';
import { PrismaClient, Role } from '@prisma/client';
import { syncBuzones } from '../src/lib/buzon.ts';

const prisma = new PrismaClient();

// 9 boxes (estaciones, solo chat) + cuenta compartida de recepción.
const boxes = Array.from({ length: 9 }, (_, i) => ({
  email: `box${i + 1}@cialo.cl`,
  nombre: `Box ${i + 1}`,
  password: `box${i + 1}.2026`,
}));

async function main() {
  console.log('Creando estaciones Box…');
  for (const b of boxes) {
    const passwordHash = await bcrypt.hash(b.password, 10);
    await prisma.user.upsert({
      where: { email: b.email },
      // No piso la contraseña si el usuario ya existe (por si la cambiaron).
      update: { nombre: b.nombre, role: Role.BOX, activo: true, permisos: [], ocultarEnDM: false },
      create: { email: b.email, nombre: b.nombre, role: Role.BOX, activo: true, permisos: [], ocultarEnDM: false, passwordHash },
    });
    console.log(`  ✓ ${b.nombre} (${b.email})`);
  }

  // Cuenta compartida de recepción (la que corre en los Mac de recepción).
  // Rol RECEPCION (acceso completo) y oculta del selector de DM: se le escribe por
  // el buzón/canal, no como persona individual.
  console.log('Asegurando cuenta de Recepción…');
  const recepHash = await bcrypt.hash('recepcion.2026', 10);
  await prisma.user.upsert({
    where: { email: 'recepcion@cialo.cl' },
    update: { nombre: 'Recepción', role: Role.RECEPCION, activo: true, ocultarEnDM: true },
    create: { email: 'recepcion@cialo.cl', nombre: 'Recepción', role: Role.RECEPCION, activo: true, ocultarEnDM: true, passwordHash: recepHash },
  });
  console.log('  ✓ recepcion@cialo.cl');

  // Buzones: una conversación privada Box ↔ equipo de Recepción por cada box.
  console.log('Sincronizando buzones…');
  await syncBuzones();
  const total = await prisma.conversation.count({ where: { buzonBoxId: { not: null } } });
  console.log(`  ✓ ${total} buzones activos`);
  console.log('Listo ✅');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
