import { createHash, randomBytes } from 'node:crypto';
import { prisma } from '../db.ts';
import { env } from '../env.ts';

/** Genera un refresh token opaco y guarda su hash (sha256) en la BD. */
export async function issueRefreshToken(userId: string): Promise<string> {
  const token = randomBytes(48).toString('base64url');
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({ data: { userId, tokenHash, expiresAt } });
  return token;
}

/** Valida un refresh token y, si es válido, lo rota (revoca el viejo, emite uno nuevo). */
export async function rotateRefreshToken(token: string): Promise<{ userId: string; token: string } | null> {
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const record = await prisma.refreshToken.findUnique({ where: { tokenHash } });
  if (!record || record.revokedAt || record.expiresAt < new Date()) return null;
  await prisma.refreshToken.update({ where: { id: record.id }, data: { revokedAt: new Date() } });
  const next = await issueRefreshToken(record.userId);
  return { userId: record.userId, token: next };
}

/** Revoca un refresh token (logout). */
export async function revokeRefreshToken(token: string): Promise<void> {
  const tokenHash = createHash('sha256').update(token).digest('hex');
  await prisma.refreshToken.updateMany({ where: { tokenHash, revokedAt: null }, data: { revokedAt: new Date() } });
}
