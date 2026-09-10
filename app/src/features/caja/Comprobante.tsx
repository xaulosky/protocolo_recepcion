import { useApp } from '../../store/app-context';
import { money, fmtDateTime } from '../../lib/format';
import { Icon } from '../../lib/icons';
import type { Venta, VentaItem } from '../../lib/types';

const METODO_LABEL: Record<string, string> = {
  EFECTIVO: 'Efectivo', TARJETA: 'Tarjeta', TRANSFERENCIA: 'Transferencia',
};

const TIPO_DTE_LABEL: Record<string, string> = {
  BOLETA_AFECTA: 'Boleta electrónica',
  BOLETA_EXENTA: 'Boleta electrónica exenta',
};

const ESTADO_DTE_LABEL: Record<string, string> = {
  PENDIENTE: 'Pendiente de envío al SII',
  ENVIADA:   'Enviada al SII',
  ACEPTADA:  'Aceptada por el SII',
  RECHAZADA: 'Rechazada por el SII',
  ANULADA:   'Anulada',
};

/** Nombre del profesional de una línea, si la prestación lo registró. */
function profesionalDe(it: VentaItem): string | null {
  return it.profesionalNombre?.trim() || null;
}

/**
 * Comprobante de venta. Panel normal en el flujo de la página (NO usa el Modal
 * compartido: su overlay lleva `no-print` y desaparecería completo al imprimir).
 * El resto de la UI de Caja va envuelto en `no-print`, así `window.print()`
 * deja solo este recibo.
 */
export function Comprobante({ venta, onNueva }: { venta: Venta; onNueva: () => void }) {
  const { toast } = useApp();
  const doc = venta.documento ?? null;

  // Profesionales distintos que participaron, para el encabezado.
  const profesionales = Array.from(
    new Set(venta.items.map(profesionalDe).filter((n): n is string => Boolean(n))),
  );

  const texto = () => [
    'CLÍNICA CIALO',
    doc
      ? `${TIPO_DTE_LABEL[doc.tipo]} N° ${doc.folio}`
      : `Comprobante de venta N° ${venta.numero}`,
    `Fecha: ${fmtDateTime(venta.createdAt)}`,
    venta.cliente ? `Cliente: ${venta.cliente}` : null,
    profesionales.length ? `Atendido por: ${profesionales.join(', ')}` : null,
    `Cajero: ${venta.vendedor?.nombre ?? '—'}`,
    '',
    ...venta.items.map((it) => {
      const prof = profesionalDe(it);
      return `${it.cantidad} × ${it.nombre}${prof ? ` (${prof})` : ''} — ${money(it.precioUnitario * it.cantidad)}`;
    }),
    '',
    `Subtotal: ${money(venta.subtotal)}`,
    venta.descuento > 0 ? `Descuento: ${venta.descuento}%` : null,
    doc && doc.exento > 0 ? `Exento: ${money(doc.exento)}` : null,
    doc && doc.neto > 0 ? `Neto: ${money(doc.neto)}` : null,
    doc && doc.iva > 0 ? `IVA (19%): ${money(doc.iva)}` : null,
    `TOTAL: ${money(venta.total)} (${METODO_LABEL[venta.metodoPago]})`,
  ].filter((l) => l !== null).join('\n');

  const copiar = () => {
    navigator.clipboard.writeText(texto()).then(() => toast('Comprobante copiado'));
  };

  const whatsapp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(texto())}`, '_blank');
  };

  return (
    <div className="comprobante-wrap" style={{ maxWidth: 460, margin: '0 auto' }}>
      <div className="card comprobante" style={{ padding: 26 }}>
        {/* Encabezado */}
        <div style={{ textAlign: 'center', borderBottom: '1px dashed var(--border)', paddingBottom: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Clínica Cialo</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
            {doc ? `${TIPO_DTE_LABEL[doc.tipo]} N° ${doc.folio}` : `Comprobante de venta N° ${venta.numero}`}
          </div>
          {doc && (
            <div style={{ fontSize: 11, color: 'var(--muted-2)', marginTop: 1 }}>
              Venta interna N° {venta.numero}
            </div>
          )}
          <div style={{ fontSize: 11.5, color: 'var(--muted-2)', marginTop: 2 }}>{fmtDateTime(venta.createdAt)}</div>
        </div>

        {/* Partes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 14, fontSize: 12.5, color: 'var(--text-2)' }}>
          {venta.cliente && <div><span style={{ color: 'var(--muted-2)' }}>Cliente:</span> {venta.cliente}</div>}
          {profesionales.length > 0 && (
            <div><span style={{ color: 'var(--muted-2)' }}>Atendido por:</span> {profesionales.join(', ')}</div>
          )}
          <div><span style={{ color: 'var(--muted-2)' }}>Cajero:</span> {venta.vendedor?.nombre ?? '—'}</div>
          <div><span style={{ color: 'var(--muted-2)' }}>Pago:</span> {METODO_LABEL[venta.metodoPago]}</div>
        </div>

        {/* Detalle */}
        <div style={{ borderTop: '1px solid var(--border-soft)', paddingTop: 10 }}>
          {venta.items.map((it) => {
            const prof = profesionalDe(it);
            return (
              <div key={it.id} style={{ padding: '4px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 12.5 }}>
                  <span style={{ color: 'var(--text)' }}>{it.cantidad} × {it.nombre}</span>
                  <span style={{ color: 'var(--text)', fontWeight: 500, flexShrink: 0 }}>
                    {money(it.precioUnitario * it.cantidad)}
                  </span>
                </div>
                {prof && (
                  <div style={{ fontSize: 11, color: 'var(--muted-2)', marginTop: 1 }}>Prof. {prof}</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Totales, con desglose tributario cuando hay boleta */}
        <div style={{ borderTop: '1px dashed var(--border)', marginTop: 10, paddingTop: 10, fontSize: 12.5 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)' }}>
            <span>Subtotal</span><span>{money(venta.subtotal)}</span>
          </div>
          {venta.descuento > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)', marginTop: 2 }}>
              <span>Descuento</span><span>{venta.descuento}%</span>
            </div>
          )}
          {doc && doc.exento > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)', marginTop: 2 }}>
              <span>Exento</span><span>{money(doc.exento)}</span>
            </div>
          )}
          {doc && doc.neto > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)', marginTop: 2 }}>
              <span>Neto</span><span>{money(doc.neto)}</span>
            </div>
          )}
          {doc && doc.iva > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)', marginTop: 2 }}>
              <span>IVA (19%)</span><span>{money(doc.iva)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700, color: 'var(--text)', marginTop: 8 }}>
            <span>TOTAL</span><span>{money(venta.total)}</span>
          </div>
        </div>

        {/* Pie tributario */}
        {doc ? (
          <div style={{ textAlign: 'center', fontSize: 10.5, color: 'var(--muted-2)', marginTop: 14, lineHeight: 1.5 }}>
            {TIPO_DTE_LABEL[doc.tipo]} · Folio {doc.folio}
            <br />
            {ESTADO_DTE_LABEL[doc.estado] ?? doc.estado}
          </div>
        ) : (
          <div style={{ textAlign: 'center', fontSize: 10.5, color: 'var(--muted-2)', marginTop: 14 }}>
            Documento interno — no válido como boleta
          </div>
        )}

        <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--muted-2)', marginTop: 10 }}>
          ¡Gracias por su compra!
        </div>
      </div>

      <div className="no-print" style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button className="btn btn-primary" style={{ padding: '9px 16px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }} onClick={onNueva}>
          <Icon name="plus" size={14} /> Nueva venta
        </button>
        <button className="btn btn-soft" style={{ padding: '9px 14px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }} onClick={copiar}>
          <Icon name="copy" size={13} /> Copiar
        </button>
        <button className="btn btn-soft" style={{ padding: '9px 14px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => window.print()}>
          <Icon name="print" size={13} /> Imprimir
        </button>
        <button className="btn btn-soft" style={{ padding: '9px 14px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }} onClick={whatsapp}>
          <Icon name="msg" size={13} /> WhatsApp
        </button>
      </div>
    </div>
  );
}
