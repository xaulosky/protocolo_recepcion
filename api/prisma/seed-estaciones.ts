/**
 * Crea/actualiza los usuarios de estación (Box 1–9 + Recepción) y un canal "General"
 * que conecta a todas las estaciones. Idempotente: se puede correr varias veces.
 * Ejecutar: npx tsx prisma/seed-estaciones.ts
 */
import bcrypt from 'bcryptjs';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

// Estaciones: 9 boxes + recepción. Contraseña = parte local del email + ".2026".
const estaciones = [
  ...Array.from({ length: 9 }, (_, i) => ({
    email: `box${i + 1}@cialo.cl`,
    nombre: `Box ${i + 1}`,
    password: `box${i + 1}.2026`,
  })),
  { email: 'recepcion@cialo.cl', nombre: 'Recepción', password: 'recepcion.2026' },
];

async function main() {
  console.log('Creando usuarios de estación…');
  for (const e of estaciones) {
    const passwordHash = await bcrypt.hash(e.password, 10);
    await prisma.user.upsert({
      where: { email: e.email },
      // No piso la contraseña si el usuario ya existe (por si la cambiaron).
      update: { nombre: e.nombre, role: Role.RECEPCION, activo: true, permisos: ['chat'] },
      create: { email: e.email, nombre: e.nombre, role: Role.RECEPCION, activo: true, permisos: ['chat'], passwordHash },
    });
    console.log(`  ✓ ${e.nombre} (${e.email})`);
  }

  // Canal "General": todos los RECEPCION (incluye las estaciones) quedan conectados.
  console.log('Asegurando canal "General"…');
  let canal = await prisma.conversation.findFirst({ where: { nombre: 'General', roles: { has: Role.RECEPCION } } });
  if (!canal) {
    canal = await prisma.conversation.create({
      data: { esGrupo: true, roles: [Role.RECEPCION], nombre: 'General' },
    });
    console.log('  ✓ canal General creado');
  } else {
    console.log('  · canal General ya existía');
  }

  // Sincroniza miembros: todos los usuarios RECEPCION activos deben pertenecer.
  const recepcionUsers = await prisma.user.findMany({ where: { activo: true, role: Role.RECEPCION }, select: { id: true } });
  let agregados = 0;
  for (const u of recepcionUsers) {
    const existing = await prisma.conversationMember.findUnique({
      where: { conversationId_userId: { conversationId: canal.id, userId: u.id } },
    });
    if (!existing) {
      await prisma.conversationMember.create({ data: { conversationId: canal.id, userId: u.id } });
      agregados++;
    }
  }
  console.log(`  ✓ ${recepcionUsers.length} miembros en el canal (${agregados} nuevos)`);
  console.log('Listo ✅');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
