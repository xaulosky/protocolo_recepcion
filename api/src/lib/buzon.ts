import { Role } from '@prisma/client';
import { prisma } from '../db.ts';

/**
 * Reconcilia los "buzones" de estación.
 *
 * Un buzón es una conversación privada por cada cuenta Box, cuyos miembros son
 * ese Box + TODOS los usuarios activos con rol RECEPCION. Así, cada box tiene una
 * línea directa con "Recepción" (la ve todo el equipo y cualquiera responde), y
 * ningún box ve la conversación de otro box.
 *
 * Es idempotente: crea los buzones que falten y ajusta la membresía de recepción
 * (agrega recepcionistas nuevos, quita a quienes ya no aplican). Nunca quita al box.
 * Se llama al crear/editar usuarios Box o Recepción.
 */
export async function syncBuzones() {
  const [boxes, recepcionistas] = await Promise.all([
    prisma.user.findMany({ where: { role: Role.BOX, activo: true }, select: { id: true } }),
    prisma.user.findMany({ where: { role: Role.RECEPCION, activo: true }, select: { id: true } }),
  ]);
  const recepIds = recepcionistas.map((r) => r.id);

  for (const box of boxes) {
    const deseados = new Set<string>([box.id, ...recepIds]);

    let conv = await prisma.conversation.findUnique({
      where: { buzonBoxId: box.id },
      select: { id: true },
    });

    if (!conv) {
      conv = await prisma.conversation.create({
        data: {
          esGrupo: true,
          buzonBoxId: box.id,
          members: { create: [...deseados].map((userId) => ({ userId })) },
        },
        select: { id: true },
      });
      continue;
    }

    // Reconciliar miembros = box + recepción activa.
    const actuales = await prisma.conversationMember.findMany({
      where: { conversationId: conv.id },
      select: { id: true, userId: true },
    });
    const actualesSet = new Set(actuales.map((m) => m.userId));

    const faltan = [...deseados].filter((uid) => !actualesSet.has(uid));
    if (faltan.length) {
      await prisma.conversationMember.createMany({
        data: faltan.map((userId) => ({ conversationId: conv!.id, userId })),
        skipDuplicates: true,
      });
    }

    const sobran = actuales.filter((m) => !deseados.has(m.userId)); // nunca incluye al box
    if (sobran.length) {
      await prisma.conversationMember.deleteMany({ where: { id: { in: sobran.map((m) => m.id) } } });
    }
  }
}
