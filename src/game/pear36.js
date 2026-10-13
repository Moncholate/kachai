/* Paleta Pear36 (lospec.com/palette-list/pear36) para los efectos de las escenas: humo, chispas, confeti,
   rayos, mermelada... Cada color se cambia por el más parecido de Pear36 antes de pintarlo (así las
   transparencias se mezclan ya con colores de la paleta). Los personajes traen su propia tabla (c.mapa en
   heroesHD.js); el fondo del bosque no pasa por aquí. */
const PEAR36 = ['5E315B', '8C3F5D', 'BA6156', 'F2A65E', 'FFE478', 'CFFF70', '8FDE5D', '3CA370', '3D6E70', '323E4F', '322947', '473B78',
  '4B5BAB', '4DA6FF', '66FFE3', 'FFFFEB', 'C2C2D1', '7E7E8F', '606070', '43434F', '272736', '3E2347', '57294B', '964253', 'E36956', 'FFB570',
  'FF9166', 'EB564B', 'B0305C', '73275C', '422445', '5A265E', '80366B', 'BD4882', 'FF6B97', 'FFB5B5']
/* Colores que conviene fijar a mano (el contorno de siempre pasa al contorno Pear36). */
const A_MANO = { '1A1020': '272736' }

const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }
const oklab = (n) => {
  const r = lin(n >> 16), g = lin((n >> 8) & 255), b = lin(n & 255)
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b), m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b), s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s]
}
const croma = ([, a, b]) => Math.hypot(a, b)
const PALETA = PEAR36.map((h) => { const n = parseInt(h, 16), lab = oklab(n); return { n, lab, gris: croma(lab) < 0.03 } })

const cache = new Map()
/* Número de color (0xRRGGBB) -> el de Pear36 más parecido. Un color con tinte (un café, un verde apagado) no cae en un gris. */
export function aPear36(n) {
  let v = cache.get(n); if (v !== undefined) return v
  const fijo = A_MANO[n.toString(16).padStart(6, '0').toUpperCase()]
  if (fijo) v = parseInt(fijo, 16)
  else {
    const lab = oklab(n), conTinte = croma(lab) > 0.035
    let mejor = Infinity
    for (const p of PALETA) {
      if (conTinte && p.gris) continue
      const d = (lab[0] - p.lab[0]) ** 2 + (lab[1] - p.lab[1]) ** 2 + (lab[2] - p.lab[2]) ** 2
      if (d < mejor) { mejor = d; v = p.n }
    }
  }
  cache.set(n, v); return v
}

const cacheEstilo = new Map()
const hex = (n) => '#' + n.toString(16).padStart(6, '0')
/* Un fillStyle ("#RRGGBB", "#RGB", "rgb(...)", "rgba(...)") pasado a Pear36; lo demás queda igual. */
export function estiloPear36(v) {
  if (typeof v !== 'string') return v
  let r = cacheEstilo.get(v); if (r !== undefined) return r
  let m
  if ((m = v.match(/^#([0-9a-f]{6})$/i))) r = hex(aPear36(parseInt(m[1], 16)))
  else if ((m = v.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i))) r = hex(aPear36(parseInt(m[1] + m[1] + m[2] + m[2] + m[3] + m[3], 16)))
  else if ((m = v.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/i))) {
    const n = aPear36((+m[1] << 16) | (+m[2] << 8) | +m[3])
    r = m[4] === undefined ? hex(n) : `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${m[4]})`
  } else r = v
  cacheEstilo.set(v, r); return r
}

/* El lienzo de una escena con los colores pasados a Pear36 al elegirlos (fillStyle). Se marca una sola vez;
   con g[CRUDO] = true (el fondo del bosque) los colores quedan como vienen. */
export const CRUDO = Symbol('crudo')
const MARCADO = Symbol('pear36')
const descriptor = (o) => { for (let p = Object.getPrototypeOf(o); p; p = Object.getPrototypeOf(p)) { const d = Object.getOwnPropertyDescriptor(p, 'fillStyle'); if (d) return d } return null }
export function lienzoPear36(g) {
  if (!g || g[MARCADO]) return g
  const d = descriptor(g)
  let propio = g.fillStyle
  Object.defineProperty(g, 'fillStyle', {
    configurable: true,
    get() { return d ? d.get.call(this) : propio },
    set(v) { const c = this[CRUDO] ? v : estiloPear36(v); if (d) d.set.call(this, c); else propio = c },
  })
  g[MARCADO] = true
  return g
}
