/**
 * Diagnóstico de la emisión de boletas. Sólo lee: no emite, no envía, no toca
 * el SII.
 *
 *   npm run sii:diagnostico -- [AAAA-MM-DD]
 *
 * Muestra la configuración vigente, el estado de los folios y los documentos,
 * qué mandaría la cola en su próxima pasada, y arma —sin enviarlo— el Resumen
 * de Ventas Diarias del día indicado (por defecto, ayer) para comprobar que
 * sale bien antes de que el envío automático lo haga solo de madrugada.
 */
import { writeFileSync } from 'node:fs';
import { prisma } from '../src/db.ts';
import { env } from '../src/env.ts';
import { estadoBoletas } from '../src/modules/boletas/boletas.service.ts';
import { cargarCertificado } from '../src/modules/boletas/firma.ts';
import { armarRvd, ayer } from '../src/modules/boletas/rvd.ts';

async function main() {
  const fecha = process.argv[2] ?? ayer();

  const estado = await estadoBoletas();
  console.log('— Configuración —');
  console.log(`  emisión habilitada   ${estado.habilitado ? 'sí' : 'NO'}`);
  console.log(`  ambiente             ${estado.ambiente}${estado.setPruebas ? ' (referencia al SET activa)' : ''}`);
  console.log(`  emisor               ${estado.emisor.rut} · ${estado.emisor.razonSocial}`);
  console.log(`  resolución           N° ${env.SII_NRO_RESOL} del ${env.SII_FCH_RESOL}`);
  console.log(`  sitio de consulta    ${env.SII_URL_CONSULTA}`);
  console.log(`  cola cada            ${env.BOLETAS_COLA_INTERVAL_MIN || 'nunca'} min`);
  console.log(`  RVD a las            ${env.RVD_HORA >= 0 ? `${env.RVD_HORA}:00` : 'nunca'}`);
  if (estado.problemasEmisor.length) {
    console.log('  PROBLEMAS:');
    for (const p of estado.problemasEmisor) console.log('   -', p);
  }

  console.log('\n— Folios —');
  console.log(`  boleta afecta (39)   ${estado.foliosDisponibles.boletaAfecta}`);
  console.log(`  boleta exenta (41)   ${estado.foliosDisponibles.boletaExenta}`);

  const porEstado = await prisma.documentoTributario.groupBy({ by: ['estado'], _count: true });
  console.log('\n— Documentos —');
  if (!porEstado.length) console.log('  (todavía no hay documentos emitidos)');
  for (const g of porEstado) console.log(`  ${g.estado.padEnd(10)} ${g._count}`);

  const sinTimbre = await prisma.documentoTributario.count({ where: { xml: null } });
  if (sinTimbre) console.log(`  ${'SIN TIMBRE'.padEnd(10)} ${sinTimbre}  <- revisar, el folio se consumió`);

  const trabados = await prisma.documentoTributario.findMany({
    where: { estado: { in: ['PENDIENTE', 'RECHAZADA'] }, ultimoError: { not: null } },
    select: { tipo: true, folio: true, estado: true, intentos: true, ultimoError: true },
    orderBy: { folio: 'asc' },
    take: 10,
  });
  for (const d of trabados) {
    console.log(`   folio ${d.folio} (${d.estado}, ${d.intentos} intentos): ${d.ultimoError}`);
  }

  const proxima = await prisma.documentoTributario.findMany({
    where: { estado: 'PENDIENTE', xml: { not: null }, intentos: { lt: 5 } },
    select: { tipo: true, folio: true },
    orderBy: { folio: 'asc' },
    take: 100,
  });
  console.log(`\n— Próxima pasada de la cola —`);
  console.log(`  ${proxima.length} documento(s)${proxima.length ? `: folios ${proxima.map((d) => d.folio).join(', ')}` : ''}`);

  const enviosRvd = await prisma.envioRvd.findMany({ orderBy: { fecha: 'desc' }, take: 5 });
  console.log('\n— Últimos RVD —');
  if (!enviosRvd.length) console.log('  (ninguno)');
  for (const e of enviosRvd) {
    console.log(`  ${e.fecha} sec ${e.secuencia} ${e.estado} ${e.trackId ?? ''} ${e.detalle ?? ''}`);
  }

  // Se arma el reporte del día pedido con el MISMO código que usa el envío
  // automático, sin mandarlo: así lo que se revisa es lo que se enviaría.
  console.log(`\n— RVD de ${fecha} (simulado, NO se envía) —`);
  if (!env.SII_CERT_PATH) {
    console.log('  (sin certificado configurado: no se arma el XML)');
  } else {
    const cert = await cargarCertificado();
    const { xml, emitidas, anulados } = await armarRvd(fecha, 1, cert);
    const total = emitidas.reduce((s, b) => s + b.total, 0);
    console.log(`  ${emitidas.length} emitidas, ${anulados.length} anuladas, total $${total.toLocaleString('es-CL')}`);
    const salida = `/tmp/rvd-${fecha}.xml`;
    writeFileSync(salida, xml, 'latin1');
    console.log(`  XML armado y firmado, ${xml.length} bytes → ${salida}`);
    console.log(`  Validar con: python docs/sii/verificar-envio.py ${salida} ConsumoFolio_v10.xsd`);
  }

  await prisma.$disconnect();
}

void main();
