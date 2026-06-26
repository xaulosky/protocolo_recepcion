/**
 * Seed: migra la data estática (app/src/data) a Postgres y crea usuarios iniciales.
 * Idempotente: borra y recrea la data clínica; hace upsert de los usuarios.
 * Ejecutar: npm run db:seed
 */
import bcrypt from 'bcryptjs';
import { PrismaClient, Role } from '@prisma/client';
import { env } from '../src/env.ts';

// Data estática del frontend (fuente de verdad de la migración).
import {
  protocolRules,
  paymentPolicies,
  scriptsData,
  protocolsData,
  productsData,
  tratamientosData,
  consentimientosData,
  profesionalesData,
  tratamientosProfesionalesData,
  consultasData,
  boxesData,
  faqData,
} from '../../app/src/data/index.ts';

const prisma = new PrismaClient();

// Helpers para acceder a campos opcionales sin pelear con los tipos inferidos.
const arr = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]) : []);
const opt = <T>(v: T | undefined | null): T | null => (v == null ? null : v);

// Dedupe por id (la data estática tiene algunos ids repetidos). Conserva el último.
function uniqById<T extends { id: string | number }>(rows: T[], label: string): T[] {
  const map = new Map<string | number, T>();
  rows.forEach((r) => map.set(r.id, r));
  const out = [...map.values()];
  if (out.length !== rows.length) console.warn(`  ⚠ ${rows.length - out.length} ids duplicados en ${label} (se conservó el último)`);
  return out;
}

async function seedUsers() {
  const adminHash = await bcrypt.hash(env.SEED_ADMIN_PASSWORD, 10);
  await prisma.user.upsert({
    where: { email: env.SEED_ADMIN_EMAIL },
    update: {},
    create: { email: env.SEED_ADMIN_EMAIL, passwordHash: adminHash, nombre: 'Administrador', role: Role.ADMIN },
  });

  // Recepcionistas (coinciden con los nombres usados en el Kanban del frontend).
  const recepHash = await bcrypt.hash('recepcion123', 10);
  for (const nombre of ['Valentina', 'Camila', 'Daniela']) {
    const email = `${nombre.toLowerCase()}@cialo.cl`;
    await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, passwordHash: recepHash, nombre, role: Role.RECEPCION },
    });
  }
  console.log('✓ Usuarios (admin + 3 recepción)');
}

async function seedClinicData() {
  // Borrado en orden seguro de FKs.
  await prisma.treatmentProfessional.deleteMany();
  await prisma.$transaction([
    prisma.treatment.deleteMany(),
    prisma.professional.deleteMany(),
    prisma.product.deleteMany(),
    prisma.consultation.deleteMany(),
    prisma.box.deleteMany(),
    prisma.consent.deleteMany(),
    prisma.faqItem.deleteMany(),
    prisma.protocol.deleteMany(),
    prisma.script.deleteMany(),
    prisma.paymentPolicy.deleteMany(),
    prisma.internalProtocol.deleteMany(),
  ]);

  // Tratamientos
  await prisma.treatment.createMany({
    data: uniqById(tratamientosData.map((t) => ({
      id: t.id,
      categoria: t.categoria,
      subcategoria: opt((t as { subcategoria?: string }).subcategoria),
      nombre: t.nombre,
      descripcion: t.descripcion,
      profesional: opt((t as { profesional?: string }).profesional),
      especialidad: opt((t as { especialidad?: string }).especialidad),
      valorDesde: opt((t as { valorDesde?: number }).valorDesde),
      valorHasta: opt((t as { valorHasta?: number }).valorHasta),
      duracion: opt((t as { duracion?: string }).duracion),
      sesiones: opt((t as { sesiones?: string }).sesiones),
      protocolo: opt((t as { protocolo?: string }).protocolo),
      requiereEvaluacion: Boolean((t as { requiereEvaluacion?: boolean }).requiereEvaluacion),
      indicaciones: arr((t as { indicaciones?: string[] }).indicaciones),
      contraindicaciones: arr((t as { contraindicaciones?: string[] }).contraindicaciones),
      preTratamiento: arr((t as { preTratamiento?: string[] }).preTratamiento),
      postTratamiento: arr((t as { postTratamiento?: string[] }).postTratamiento),
    })), 'tratamientos'),
  });

  // Profesionales
  await prisma.professional.createMany({
    data: uniqById(profesionalesData.map((p) => ({
      id: p.id,
      nombreCompleto: (p as { nombreCompleto: string }).nombreCompleto,
      especialidad: (p as { especialidad: string }).especialidad,
      rut: opt((p as { rut?: string }).rut),
      telefono: opt((p as { telefono?: string }).telefono),
      email: opt((p as { email?: string }).email),
      disponibilidad: opt((p as { disponibilidad?: unknown }).disponibilidad) as object | null,
      prestaciones: opt((p as { prestaciones?: unknown }).prestaciones) as object | null,
    })), 'profesionales'),
  });

  // Relación tratamiento ↔ profesional (filtrando ids inexistentes y duplicados)
  const tids = new Set(tratamientosData.map((t) => t.id));
  const pids = new Set(profesionalesData.map((p) => p.id));
  const seen = new Set<string>();
  const rels = tratamientosProfesionalesData
    .filter((r) => tids.has(r.tratamientoId) && pids.has(r.profesionalId))
    .filter((r) => {
      const key = `${r.tratamientoId}|${r.profesionalId}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((r) => ({ treatmentId: r.tratamientoId, professionalId: r.profesionalId }));
  await prisma.treatmentProfessional.createMany({ data: rels });

  // Productos
  await prisma.product.createMany({
    data: uniqById(productsData.map((p) => ({
      id: p.id,
      brand: p.brand,
      name: p.name,
      price: p.price,
      category: opt((p as { category?: string }).category),
      description: opt((p as { description?: string }).description),
    })), 'productos'),
  });

  // Consultas
  await prisma.consultation.createMany({
    data: uniqById(consultasData.map((c) => ({
      id: c.id,
      categoria: opt((c as { categoria?: string }).categoria),
      emoji: opt((c as { emoji?: string }).emoji),
      nombre: c.nombre,
      descripcion: (c as { descripcion: string }).descripcion,
      valor: String((c as { valor: string }).valor),
      duracion: opt((c as { duracion?: string }).duracion),
      reembolsable: Boolean((c as { reembolsable?: boolean }).reembolsable),
      profesionales: opt((c as { profesionales?: unknown }).profesionales) as object | null,
    })), 'consultas'),
  });

  // Boxes
  await prisma.box.createMany({
    data: uniqById(boxesData.map((b) => ({
      id: b.id,
      nombre: b.nombre,
      alias: opt((b as { alias?: string }).alias),
      tipo: opt((b as { tipo?: string }).tipo),
      descripcion: opt((b as { descripcion?: string }).descripcion),
      usosPrincipales: arr((b as { usosPrincipales?: string[] }).usosPrincipales),
      equipamiento: opt((b as { equipamiento?: unknown }).equipamiento) as object | null,
    })), 'boxes'),
  });

  // Consentimientos
  await prisma.consent.createMany({
    data: uniqById(consentimientosData.map((c) => ({
      id: c.id,
      title: (c as { title: string }).title,
      treatment: (c as { treatment: string }).treatment,
      introduction: (c as { introduction: string }).introduction,
      beneficios: arr((c as { beneficios?: string[] }).beneficios),
      efectosSecundarios: arr((c as { efectosSecundarios?: string[] }).efectosSecundarios),
      contraindicaciones: arr((c as { contraindicaciones?: string[] }).contraindicaciones),
      cuidados: arr((c as { cuidados?: string[] }).cuidados),
    })), 'consentimientos'),
  });

  // FAQ
  await prisma.faqItem.createMany({
    data: uniqById(faqData.map((f) => ({
      id: f.id,
      categoria: f.categoria,
      pregunta: f.pregunta,
      respuesta: f.respuesta,
      tags: arr((f as { tags?: string[] }).tags),
    })), 'faq'),
  });

  // Protocolos base
  await prisma.protocol.createMany({
    data: uniqById(protocolRules.map((p) => ({
      id: String(p.number),
      numero: Number(p.number),
      titulo: p.title,
      contenido: p.content,
    })), 'protocolos'),
  });

  // Guiones (aplanados por categoría)
  const scriptRows: { categoria: string; titulo: string; contenido: string; nota: string | null; orden: number }[] = [];
  for (const [categoria, items] of Object.entries(scriptsData as Record<string, { title: string; content: string; note?: string }[]>)) {
    items.forEach((it, i) => scriptRows.push({ categoria, titulo: it.title, contenido: it.content, nota: it.note ?? null, orden: i }));
  }
  await prisma.script.createMany({ data: scriptRows });

  // Políticas de pago
  await prisma.paymentPolicy.createMany({
    data: paymentPolicies.map((p, i) => ({
      titulo: (p as { title: string }).title,
      contenido: (p as { content: string }).content,
      tipo: (p as { type?: string }).type ?? 'General',
      orden: i,
    })),
  });

  // Protocolos internos por área
  const internalRows = Object.entries(protocolsData as Record<string, { title: string; icon?: string; color?: string; sections: unknown }>).map(
    ([id, v], i) => ({ id, titulo: v.title, icon: v.icon ?? null, color: v.color ?? null, sections: v.sections as object, orden: i }),
  );
  for (const row of internalRows) {
    await prisma.internalProtocol.create({ data: row });
  }

  console.log(`✓ Data clínica: ${tratamientosData.length} tratamientos, ${profesionalesData.length} profesionales, ${rels.length} relaciones, ${productsData.length} productos, ${scriptRows.length} guiones, ${faqData.length} FAQ`);
}

async function main() {
  console.log('Seeding…');
  await seedUsers();
  await seedClinicData();
  console.log('Listo ✅');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
