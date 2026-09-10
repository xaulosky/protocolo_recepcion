import { env } from '../../env.ts';

/**
 * Datos del emisor para el encabezado del DTE, con la validación de los largos
 * que exige `EnvioBOLETA_v11.xsd` (ver api/docs/sii/).
 *
 * El SII rechaza el documento completo si un campo se pasa del máximo, y el
 * rechazo llega después de haber consumido el folio. Por eso se valida antes
 * de emitir y se expone en el panel: es más barato ver "el giro tiene 106 de
 * 80 caracteres" en la configuración que descubrirlo con una boleta rechazada.
 */

/** Largos máximos del esquema oficial. */
const MAX = {
  razonSocial: 100,
  giro: 80,
  dirOrigen: 70,
  cmnaOrigen: 20,
  ciudadOrigen: 20,
} as const;

export interface DatosEmisor {
  rut: string;
  razonSocial: string;
  giro: string;
  acteco: string;
  dirOrigen: string;
  cmnaOrigen: string;
  ciudadOrigen: string;
  nombreSoftware: string;
}

export function datosEmisor(): DatosEmisor {
  return {
    rut:            env.SII_RUT_EMISOR.trim(),
    razonSocial:    env.SII_RAZON_SOCIAL.trim(),
    giro:           env.SII_GIRO.trim(),
    acteco:         env.SII_ACTECO.trim(),
    dirOrigen:      env.SII_DIR_ORIGEN.trim(),
    cmnaOrigen:     env.SII_CMNA_ORIGEN.trim(),
    ciudadOrigen:   env.SII_CIUDAD_ORIGEN.trim(),
    nombreSoftware: env.SII_NOMBRE_SOFTWARE.trim(),
  };
}

/** RUT chileno con guion y dígito verificador, sin puntos: 78155814-1 */
const RUT_RE = /^\d{7,8}-[\dkK]$/;

/**
 * Revisa la configuración del emisor. Devuelve la lista de problemas; vacía
 * significa que está listo para emitir.
 */
export function validarEmisor(): string[] {
  const e = datosEmisor();
  const problemas: string[] = [];

  if (!e.rut) problemas.push('Falta el RUT del emisor (SII_RUT_EMISOR)');
  else if (!RUT_RE.test(e.rut)) {
    problemas.push(`El RUT "${e.rut}" debe ir sin puntos y con guion, por ejemplo 78155814-1`);
  }

  const requerido: [keyof typeof MAX, string, string][] = [
    ['razonSocial',  e.razonSocial,  'la razón social (SII_RAZON_SOCIAL)'],
    ['giro',         e.giro,         'el giro (SII_GIRO)'],
    ['dirOrigen',    e.dirOrigen,    'la dirección de origen (SII_DIR_ORIGEN)'],
    ['cmnaOrigen',   e.cmnaOrigen,   'la comuna de origen (SII_CMNA_ORIGEN)'],
    ['ciudadOrigen', e.ciudadOrigen, 'la ciudad de origen (SII_CIUDAD_ORIGEN)'],
  ];

  for (const [campo, valor, nombre] of requerido) {
    if (!valor) {
      problemas.push(`Falta ${nombre}`);
    } else if (valor.length > MAX[campo]) {
      problemas.push(
        `${nombre.charAt(0).toUpperCase() + nombre.slice(1)} tiene ${valor.length} caracteres y el máximo del SII es ${MAX[campo]}`,
      );
    }
  }

  if (!e.acteco) problemas.push('Falta el código de actividad económica (SII_ACTECO)');
  else if (!/^\d{6}$/.test(e.acteco)) {
    problemas.push(`La actividad económica "${e.acteco}" debe ser un código de 6 dígitos`);
  }

  return problemas;
}
