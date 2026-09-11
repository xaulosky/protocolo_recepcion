import { useEffect, useState } from 'react';

/**
 * Consulta pública de boletas electrónicas.
 *
 * El SII obliga a publicar las boletas emitidas en un sitio web donde el
 * cliente pueda revisarlas durante los tres meses siguientes a la emisión, y
 * exige que esa dirección vaya impresa bajo el timbre del papel. Es requisito
 * para autorizar la emisión, y lo verifican antes de dictar la resolución.
 *
 * Sin sesión: quien llega tiene el papel en la mano, no una cuenta. Pedimos
 * folio y monto total —los dos están impresos— para que nadie pueda recorrer
 * los folios uno por uno.
 */

const API = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:4000';

interface ItemBoleta {
  nombre: string;
  cantidad: number;
  precioUnitario: number;
}

interface Boleta {
  codigoSii: 39 | 41;
  folio: number;
  fechaEmision: string;
  estado: string;
  neto: number;
  iva: number;
  exento: number;
  total: number;
  items: ItemBoleta[];
  emisor: { rut: string; razonSocial: string; giro: string; direccion: string };
}

const TIPO_LABEL: Record<number, string> = {
  39: 'Boleta Electrónica',
  41: 'Boleta No Afecta o Exenta Electrónica',
};

const ESTADO_LABEL: Record<string, string> = {
  PENDIENTE: 'Emitida, pendiente de envío al SII',
  ENVIADA: 'Enviada al SII',
  ACEPTADA: 'Aceptada por el SII',
  RECHAZADA: 'Rechazada por el SII',
  ANULADA: 'Anulada',
};

const pesos = (n: number) => `$${n.toLocaleString('es-CL')}`;

const fecha = (iso: string) =>
  new Date(iso).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });

export function BoletaPublica() {
  const [folio, setFolio] = useState('');
  const [total, setTotal] = useState('');
  const [boleta, setBoleta] = useState<Boleta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  // El enlace impreso puede traer los datos ya puestos (?folio=…&total=…).
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const f = p.get('folio');
    const t = p.get('total');
    if (f) setFolio(f);
    if (t) setTotal(t);
    if (f && t) void consultar(f, t);
    // Una sola vez, al abrir.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function consultar(f: string, t: string) {
    setCargando(true);
    setError(null);
    setBoleta(null);
    try {
      const r = await fetch(`${API}/boletas/consulta?folio=${encodeURIComponent(f)}&total=${encodeURIComponent(t)}`);
      const body = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(body.error || 'No se pudo consultar la boleta');
      setBoleta(body.boleta);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo consultar la boleta');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="boleta-publica">
      <header>
        <h1>Consulta de boleta electrónica</h1>
        <p>
          Ingresa el número de folio y el monto total que aparecen en tu boleta para verla en línea.
        </p>
      </header>

      <form
        className="buscador"
        onSubmit={(e) => {
          e.preventDefault();
          if (folio && total) void consultar(folio, total);
        }}
      >
        <label>
          N° de folio
          <input
            inputMode="numeric"
            value={folio}
            onChange={(e) => setFolio(e.target.value.replace(/\D/g, ''))}
            placeholder="123"
            required
          />
        </label>
        <label>
          Monto total
          <input
            inputMode="numeric"
            value={total}
            onChange={(e) => setTotal(e.target.value.replace(/\D/g, ''))}
            placeholder="35000"
            required
          />
        </label>
        <button type="submit" disabled={cargando || !folio || !total}>
          {cargando ? 'Buscando…' : 'Consultar'}
        </button>
      </form>

      {error && <p className="aviso error">{error}</p>}

      {boleta && (
        <article className="documento">
          <div className="emisor">
            <strong>{boleta.emisor.razonSocial}</strong>
            <span>{boleta.emisor.giro}</span>
            <span>{boleta.emisor.direccion}</span>
          </div>

          <div className="recuadro">
            <div>R.U.T.: {boleta.emisor.rut}</div>
            <div className="tipo">{TIPO_LABEL[boleta.codigoSii]}</div>
            <div className="folio">N° {boleta.folio}</div>
          </div>

          <dl className="datos">
            <div>
              <dt>Fecha de emisión</dt>
              <dd>{fecha(boleta.fechaEmision)}</dd>
            </div>
            <div>
              <dt>Estado</dt>
              <dd>{ESTADO_LABEL[boleta.estado] ?? boleta.estado}</dd>
            </div>
          </dl>

          <table className="detalle">
            <thead>
              <tr>
                <th>Detalle</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              {boleta.items.map((it, i) => (
                <tr key={i}>
                  <td>
                    {it.nombre}
                    {it.cantidad > 1 && <span className="sub">{it.cantidad} × {pesos(it.precioUnitario)}</span>}
                  </td>
                  <td className="monto">{pesos(it.precioUnitario * it.cantidad)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <table className="totales">
            <tbody>
              {boleta.exento > 0 && (
                <tr><td>Monto exento</td><td className="monto">{pesos(boleta.exento)}</td></tr>
              )}
              {boleta.neto > 0 && (
                <tr><td>Monto neto</td><td className="monto">{pesos(boleta.neto)}</td></tr>
              )}
              {boleta.iva > 0 && (
                <tr><td>IVA 19%</td><td className="monto">{pesos(boleta.iva)}</td></tr>
              )}
              <tr className="total"><td>TOTAL</td><td className="monto">{pesos(boleta.total)}</td></tr>
            </tbody>
          </table>
        </article>
      )}

      <footer>
        <p>
          Las boletas quedan disponibles para consulta durante los tres meses siguientes a su
          emisión. Si necesitas una copia posterior, escríbenos.
        </p>
      </footer>
    </div>
  );
}
