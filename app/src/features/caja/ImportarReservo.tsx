import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { api } from '../../lib/api';
import { money } from '../../lib/format';
import { useApp } from '../../store/app-context';
import type { Venta } from '../../lib/types';
import { Comprobante } from './Comprobante';

/**
 * Venta que llega desde Reservo por la extensión de Chrome.
 *
 * Al confirmar una venta en Reservo, la extensión abre esta app con
 * `?importar=reservo` y le pasa la venta (puente.js, por postMessage: los
 * datos del paciente no pasan por la URL). Aquí se muestra ya cargada
 * —servicios, precios, profesional, medio de pago— para revisarla y
 * registrarla en la caja con la sesión de quien está atendiendo.
 *
 * Los ítems vienen con el nombre y precio de Reservo, no del catálogo: sus
 * cientos de servicios no corresponden uno a uno con los tratamientos de
 * Cialo Hub. Lo único que se puede ajustar es si cada línea es exenta o
 * afecta, que es lo que decide el tipo de boleta.
 */

type MetodoPago = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA';

interface ItemImportado {
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  profesional: string | null;
  exento: boolean;
}

interface VentaImportada {
  origen: 'RESERVO';
  idExterno: string;
  referencia: string | null;
  cliente: string | null;
  metodoPago: MetodoPago;
  descuento: number;
  totalReservo: number | null;
  notas: string | null;
  items: ItemImportado[];
  datosReservo?: { pagos?: { medio: string; monto: number }[]; fecha?: string | null } | null;
}

const PARAM = 'importar';

const METODOS: { id: MetodoPago; label: string }[] = [
  { id: 'EFECTIVO', label: 'Efectivo' },
  { id: 'TARJETA', label: 'Tarjeta' },
  { id: 'TRANSFERENCIA', label: 'Transferencia' },
];

/** ¿Se abrió la app para registrar una venta de Reservo? */
export function hayImportacionReservo(): boolean {
  return new URLSearchParams(window.location.search).get(PARAM) === 'reservo';
}

function avisarExtension(mensaje: Record<string, unknown>) {
  window.postMessage({ fuente: 'cialo-hub', ...mensaje }, window.location.origin);
}

/** Saca ?importar de la URL: al recargar no debe volver a pedir la venta. */
function limpiarUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete(PARAM);
  window.history.replaceState(null, '', url.pathname + url.search + url.hash);
}

type Estado = 'esperando' | 'sin-extension' | 'sin-venta' | 'lista';

export function ImportarReservo({ onVenta, onTerminar }: {
  /** Refresca la cabecera del turno tras registrar. */
  onVenta: () => void;
  /** Vuelve a la venta normal de la caja. */
  onTerminar: () => void;
}) {
  const { toast } = useApp();
  const [estado, setEstado] = useState<Estado>('esperando');
  const [venta, setVenta] = useState<VentaImportada | null>(null);
  const [items, setItems] = useState<ItemImportado[]>([]);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('EFECTIVO');
  const [registrando, setRegistrando] = useState(false);
  const [resultado, setResultado] = useState<{ venta: Venta; duplicada: boolean } | null>(null);

  useEffect(() => {
    const pedir = () => avisarExtension({ tipo: 'listo-importar' });
    const alRecibir = (e: MessageEvent) => {
      if (e.source !== window || e.origin !== window.location.origin) return;
      const d = e.data as { fuente?: string; tipo?: string; venta?: VentaImportada | null };
      if (d?.fuente !== 'cialo-extension') return;
      // El puente pudo cargar después que la app: vuelve a pedir.
      if (d.tipo === 'puente-listo') pedir();
      if (d.tipo === 'importar-venta') {
        if (!d.venta) {
          setEstado('sin-venta');
          return;
        }
        setVenta(d.venta);
        setItems(d.venta.items);
        setMetodoPago(d.venta.metodoPago);
        setEstado('lista');
      }
    };
    window.addEventListener('message', alRecibir);
    pedir();
    // Sin respuesta en unos segundos: la extensión no está en este navegador.
    const espera = window.setTimeout(() => setEstado((s) => (s === 'esperando' ? 'sin-extension' : s)), 4000);
    return () => {
      window.removeEventListener('message', alRecibir);
      window.clearTimeout(espera);
    };
  }, []);

  const subtotal = useMemo(() => items.reduce((s, it) => s + it.precioUnitario * it.cantidad, 0), [items]);
  const descuento = venta?.descuento ?? 0;
  const total = Math.round(subtotal * (1 - descuento / 100));
  const descuadre = venta?.totalReservo != null && Math.abs(venta.totalReservo - total) > 1;

  const cambiarExento = (i: number, exento: boolean) => {
    setItems((prev) => prev.map((it, j) => (j === i ? { ...it, exento } : it)));
  };

  const registrar = async () => {
    if (!venta) return;
    setRegistrando(true);
    try {
      const d = await api.post<{ venta: Venta; duplicada: boolean }>('/caja/ventas/externa', { ...venta, metodoPago, items });
      avisarExtension({
        tipo: 'importacion-resuelta',
        idExterno: venta.idExterno,
        estado: 'registrada',
        numero: d.venta.numero,
        total: d.venta.total,
      });
      limpiarUrl();
      setResultado(d);
      onVenta();
    } catch (e) {
      toast(e instanceof Error && e.message ? e.message : 'No se pudo registrar la venta');
    } finally {
      setRegistrando(false);
    }
  };

  const descartar = () => {
    if (venta) avisarExtension({ tipo: 'importacion-resuelta', idExterno: venta.idExterno, estado: 'descartada' });
    limpiarUrl();
    onTerminar();
  };

  const volver = () => {
    limpiarUrl();
    onTerminar();
  };

  if (resultado) {
    return (
      <>
        {resultado.duplicada && (
          <Aviso>Esta venta ya estaba registrada (N° {resultado.venta.numero}): se muestra su comprobante, no se creó otra.</Aviso>
        )}
        <Comprobante venta={resultado.venta} onNueva={onTerminar} />
      </>
    );
  }

  if (estado === 'esperando') return <Aviso>Cargando la venta desde Reservo…</Aviso>;

  if (estado === 'sin-extension') {
    return (
      <Aviso accion={<button className="btn btn-soft" onClick={volver}>Ir a la caja</button>}>
        No llegó la venta de Reservo: la extensión «Cialo Hub · Ventas de Reservo» no respondió en este navegador.
      </Aviso>
    );
  }

  if (estado === 'sin-venta' || !venta) {
    return (
      <Aviso accion={<button className="btn btn-soft" onClick={volver}>Ir a la caja</button>}>
        No hay ventas de Reservo pendientes de registrar.
      </Aviso>
    );
  }

  const pagosReservo = venta.datosReservo?.pagos ?? [];

  return (
    <div className="no-print card" style={{ padding: 22, maxWidth: 780, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>Venta desde Reservo</div>
          <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>
            Revisa y registra en la caja. Los servicios y precios son los que se cobraron en Reservo.
          </div>
        </div>
        <div style={{ textAlign: 'right', fontSize: 12.5, color: 'var(--text-2)' }}>
          <div><span style={{ color: 'var(--muted-2)' }}>Cliente:</span> {venta.cliente || '—'}</div>
          {venta.datosReservo?.fecha && (
            <div><span style={{ color: 'var(--muted-2)' }}>Fecha en Reservo:</span> {venta.datosReservo.fecha}</div>
          )}
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ color: 'var(--muted-2)', fontSize: 11.5, textAlign: 'left' }}>
              <th style={{ padding: '6px 8px 6px 0', fontWeight: 500 }}>Detalle</th>
              <th style={{ padding: '6px 8px', fontWeight: 500 }}>Profesional</th>
              <th style={{ padding: '6px 8px', fontWeight: 500, textAlign: 'right' }}>Cant.</th>
              <th style={{ padding: '6px 8px', fontWeight: 500, textAlign: 'right' }}>Valor</th>
              <th style={{ padding: '6px 0 6px 8px', fontWeight: 500 }}>Tipo</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={i} style={{ borderTop: '1px solid var(--border-soft)' }}>
                <td style={{ padding: '8px 8px 8px 0', color: 'var(--text)' }}>{it.nombre}</td>
                <td style={{ padding: 8, color: 'var(--text-2)' }}>{it.profesional || '—'}</td>
                <td style={{ padding: 8, textAlign: 'right' }}>{it.cantidad}</td>
                <td style={{ padding: 8, textAlign: 'right', whiteSpace: 'nowrap' }}>{money(it.precioUnitario * it.cantidad)}</td>
                <td style={{ padding: '8px 0 8px 8px' }}>
                  {/* Decide el tipo de boleta: la clínica declara los servicios exentos y los productos afectos. */}
                  <select
                    className="input"
                    value={it.exento ? 'exento' : 'afecto'}
                    onChange={(e) => cambiarExento(i, e.target.value === 'exento')}
                    style={{ fontSize: 12.5, padding: '5px 8px' }}
                  >
                    <option value="exento">Exento (servicio)</option>
                    <option value="afecto">Afecto (producto)</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18, marginTop: 18 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 5 }}>Medio de pago</label>
          <select className="input" value={metodoPago} onChange={(e) => setMetodoPago(e.target.value as MetodoPago)} style={{ width: '100%' }}>
            {METODOS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
          {pagosReservo.length > 0 && (
            <div style={{ fontSize: 11.5, color: 'var(--muted-2)', marginTop: 6 }}>
              En Reservo: {pagosReservo.map((p) => `${p.medio} ${money(p.monto)}`).join(' · ')}
            </div>
          )}
        </div>

        <div style={{ fontSize: 13 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)' }}>
            <span>Subtotal</span><span>{money(subtotal)}</span>
          </div>
          {descuento > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)', marginTop: 2 }}>
              <span>Descuento</span><span>{descuento}%</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 700, color: 'var(--text)', marginTop: 6 }}>
            <span>TOTAL</span><span>{money(total)}</span>
          </div>
          {descuadre && (
            <div style={{ marginTop: 8, fontSize: 12, color: 'var(--orange)' }}>
              En Reservo el total fue {money(venta.totalReservo ?? 0)}. Revisa las líneas antes de registrar.
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20, flexWrap: 'wrap' }}>
        <button className="btn btn-soft" onClick={descartar} disabled={registrando} style={{ padding: '9px 16px', fontSize: 13 }}>
          Descartar
        </button>
        <button className="btn btn-primary" onClick={() => void registrar()} disabled={registrando || items.length === 0} style={{ padding: '9px 18px', fontSize: 13 }}>
          {registrando ? 'Registrando…' : 'Registrar en caja'}
        </button>
      </div>
    </div>
  );
}

function Aviso({ children, accion }: { children: ReactNode; accion?: ReactNode }) {
  return (
    <div className="no-print card" style={{ padding: '16px 20px', maxWidth: 780, margin: '0 auto 14px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: 220, fontSize: 13, color: 'var(--text-2)' }}>{children}</div>
      {accion}
    </div>
  );
}
