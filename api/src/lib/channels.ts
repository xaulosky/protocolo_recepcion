import { prisma } from '../db.ts';

/**
 * Recalcula la pertenencia de un usuario a los canales por rol.
 * Lo agrega a los canales cuyos `roles` incluyen su rol y lo saca de los demás.
 * Se llama al crear un usuario y al cambiarle el rol.
 */
export async function syncUserChannels(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!user) return;

  const canales = await prisma.conversation.findMany({
    where: { roles: { isEmpty: false } },
    select: { id: true, roles: true },
  });

  for (const c of canales) {
    const debePertenecer = c.roles.includes(user.role);
    const member = await prisma.conversationMember.findUnique({
      where: { conversationId_userId: { conversationId: c.id, userId } },
    });
    if (debePertenecer && !member) {
      await prisma.conversationMember.create({ data: { conversationId: c.id, userId } });
    } else if (!debePertenecer && member) {
      await prisma.conversationMember.delete({ where: { id: member.id } });
    }
  }
}
