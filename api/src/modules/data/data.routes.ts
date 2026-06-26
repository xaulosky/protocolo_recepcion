import type { FastifyInstance } from 'fastify';
import { prisma } from '../../db.ts';

/** Endpoints de solo lectura de la data clínica. Requieren sesión válida. */
export async function dataRoutes(app: FastifyInstance) {
  app.addHook('onRequest', app.authenticate);

  app.get('/treatments', async (req) => {
    const { categoria, q } = req.query as { categoria?: string; q?: string };
    const treatments = await prisma.treatment.findMany({
      where: {
        categoria: categoria && categoria !== 'Todas' ? categoria : undefined,
        OR: q
          ? [
              { nombre: { contains: q, mode: 'insensitive' } },
              { descripcion: { contains: q, mode: 'insensitive' } },
              { categoria: { contains: q, mode: 'insensitive' } },
              { subcategoria: { contains: q, mode: 'insensitive' } },
            ]
          : undefined,
      },
      orderBy: { nombre: 'asc' },
    });
    return { treatments };
  });

  app.get('/treatments/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const treatment = await prisma.treatment.findUnique({
      where: { id },
      include: { profesionales: { include: { professional: true } } },
    });
    if (!treatment) return reply.code(404).send({ error: 'Tratamiento no encontrado' });
    return { treatment };
  });

  app.get('/professionals', async () => ({ professionals: await prisma.professional.findMany({ orderBy: { nombreCompleto: 'asc' } }) }));
  app.get('/products', async () => ({ products: await prisma.product.findMany({ orderBy: [{ brand: 'asc' }, { name: 'asc' }] }) }));
  app.get('/consultations', async () => ({ consultations: await prisma.consultation.findMany({ orderBy: { nombre: 'asc' } }) }));
  app.get('/boxes', async () => ({ boxes: await prisma.box.findMany({ orderBy: { id: 'asc' } }) }));
  app.get('/consents', async () => ({ consents: await prisma.consent.findMany({ orderBy: { treatment: 'asc' } }) }));
  app.get('/faq', async () => ({ faq: await prisma.faqItem.findMany({ orderBy: { categoria: 'asc' } }) }));
  app.get('/protocols', async () => ({ protocols: await prisma.protocol.findMany({ orderBy: { numero: 'asc' } }) }));
  app.get('/scripts', async () => ({ scripts: await prisma.script.findMany({ orderBy: [{ categoria: 'asc' }, { orden: 'asc' }] }) }));
  app.get('/payment-policies', async () => ({ policies: await prisma.paymentPolicy.findMany({ orderBy: { orden: 'asc' } }) }));
  app.get('/internal-protocols', async () => ({ internalProtocols: await prisma.internalProtocol.findMany({ orderBy: { orden: 'asc' } }) }));

  app.get('/stats', async () => {
    const [treatments, professionals, products, consents, consultations, scripts, protocols] = await Promise.all([
      prisma.treatment.count(),
      prisma.professional.count(),
      prisma.product.count(),
      prisma.consent.count(),
      prisma.consultation.count(),
      prisma.script.count(),
      prisma.protocol.count(),
    ]);
    return { stats: { treatments, professionals, products, consents, consultations, scripts, protocols } };
  });
}
