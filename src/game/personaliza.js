/* Personalización del personaje: color de piel (o pelaje) y de pelo (con barba y cejas) (ver docs/personalizacion-personajes.md).
   Cada material es una rampa de Pear36 (base, sombra, luz) y cada personaje dice qué partes exactas lo usan: letras
   de su dibujo (pal) y colores de brazo y pierna. No se cambia un color en todo el personaje, porque un mismo tono
   puede estar en otra cosa (el café de la piel de Jelic también es el de su búho). Ningún color es el del contorno
   (#272736): la racha reconoce el contorno por ese color. */

/* Rampas: [base, sombra, luz]. */
export const PIELES = {
  rosada: ['#FFB5B5', '#FF9166', '#FFB5B5'],
  durazno: ['#FFB570', '#FF9166', '#FFB570'],
  tostada: ['#F2A65E', '#BA6156', '#FFB570'],
  rojiza: ['#BA6156', '#8C3F5D', '#F2A65E'],
  oscura: ['#8C3F5D', '#5E315B', '#BA6156'],   // propuesta extra (no estaba en la lista): un tono más oscuro
}
export const PELOS = {
  negro: ['#43434F', '#322947', '#606070'],
  cafeOscuro: ['#5E315B', '#3E2347', '#8C3F5D'],
  cafeClaro: ['#BA6156', '#8C3F5D', '#F2A65E'],
  rubio: ['#F2A65E', '#BA6156', '#FFE478'],
  pelirrojo: ['#E36956', '#964253', '#FF9166'],
  blanco: ['#C2C2D1', '#7E7E8F', '#FFFFEB'],
  rosado: ['#FF6B97', '#BD4882', '#FFB5B5'],
  turquesa: ['#4DA6FF', '#4B5BAB', '#66FFE3'],
}
/* Pelajes y pieles de los que no son humanos. */
const PELAJES_GATA = {
  naranjo: ['#FF9166', '#E36956', '#FFB570'],
  crema: ['#FFE478', '#F2A65E', '#FFFFEB'],
  manchada: 'manchada',
}
const PELAJES_PERRO = {
  cafe: ['#BA6156', '#8C3F5D', '#F2A65E'],
  gris: ['#C2C2D1', '#7E7E8F', '#FFFFEB'],
  negro: ['#606070', '#43434F', '#7E7E8F'],   // un gris carbón: con el negro de verdad se perdían los ojos y la nariz
}
const PIELES_GOBLIN = {
  naranjo: ['#F2A65E', '#BA6156', '#FFB570'],
  gris: ['#C2C2D1', '#7E7E8F', '#FFFFEB'],
  amarillo: ['#FFE478', '#F2A65E', '#FFFFEB'],
}

/* Ropa: rampas comunes; cada personaje ofrece solo las que le quedan (sin chocar con su piel ni con su arma). */
export const ROPAS = {
  rojo: ['#EB564B', '#B0305C', '#FF9166'],
  vino: ['#B0305C', '#73275C', '#EB564B'],
  naranjo: ['#E36956', '#964253', '#FFB570'],
  mostaza: ['#F2A65E', '#BA6156', '#FFE478'],
  verde: ['#3CA370', '#3D6E70', '#8FDE5D'],
  verdeBosque: ['#3D6E70', '#323E4F', '#3CA370'],
  azul: ['#4B5BAB', '#473B78', '#4DA6FF'],
  celeste: ['#4DA6FF', '#4B5BAB', '#66FFE3'],
  morado: ['#80366B', '#5A265E', '#BD4882'],
  rosado: ['#FF6B97', '#BD4882', '#FFB5B5'],
  cafe: ['#8C3F5D', '#5E315B', '#BA6156'],
  gris: ['#7E7E8F', '#606070', '#C2C2D1'],
  negro: ['#43434F', '#322947', '#606070'],
  crema: ['#FFFFEB', '#C2C2D1', '#FFFFEB'],
}
const elige = (...nombres) => Object.fromEntries(nombres.map((n) => [n, ROPAS[n]]))
const MANGAS = { luz: 2, base: 0, sombra: 1 }   // las mangas (brazo) o el pantalón (pierna) del color de la prenda

/* Qué partes usa cada material, por personaje. letras: { letra: 0 base | 1 sombra | 2 luz }; brazo y pierna igual
   con sus claves (mano, manoLuz, luz, base, sombra, bota…). */
const B = 0, S = 1, L = 2
const PIEL_HUMANA = (letras, brazo = {}, pierna = {}) => ({ opciones: PIELES, letras, brazo, pierna })
export const PARTES = {
  jelic: { piel: PIEL_HUMANA({ S: B, s: S, z: L }) },
  latte: { piel: PIEL_HUMANA({ S: B, s: S, z: L }), pelo: { letras: { H: B, h: S, i: L, X: B } } },   // X: bigote y barba
  malala: { piel: PIEL_HUMANA({ S: B, s: S }, { mano: B, manoLuz: B }), pelo: { letras: { L: B, l: L } } },   // H, h y j son el sombrero
  malia: { piel: PIEL_HUMANA({ S: B, s: S, z: L }, { mano: B, manoLuz: L }), pelo: { letras: { H: B, h: S } } },
  kenny: { piel: PIEL_HUMANA({ S: B, s: S }, { mano: B, manoLuz: L }), pelo: { letras: { H: B, h: S, i: L, D: L } } },   // D: barba
  tivan: { piel: PIEL_HUMANA({ S: B, s: S }), pelo: { letras: { H: B, h: S, I: L } } },
  patroclus: { piel: PIEL_HUMANA({ S: B, s: S, z: L }, { mano: B, manoLuz: L }), pelo: { letras: { H: B, h: L } } },
  uchis: { piel: PIEL_HUMANA({ S: B, s: S }), pelo: { letras: { H: B, h: S } } },
  janet: { piel: PIEL_HUMANA({ S: B, s: S }, { mano: B, manoLuz: L }), pelo: { letras: { H: B, h: S, D: S } } },   // D: barba
  july: { piel: PIEL_HUMANA({ S: B, s: S, Z: L }, { luz: L, base: B, sombra: S }), pelo: { letras: { W: B, w: S } } },   // su "pelo" es la barba
  edith: { piel: PIEL_HUMANA({ S: B, s: S }), pelo: { letras: { H: B, h: L } } },
  xitin: { piel: PIEL_HUMANA({ S: B, s: S }, { mano: B, manoLuz: B }), pelo: { letras: { H: B, h: S } } },
  agattita: { piel: { opciones: PELAJES_GATA, letras: { F: B, f: S, Z: L, A: B, a: S, Q: L }, brazo: { luz: L, base: B, sombra: S }, pierna: { luz: L, base: B, sombra: S } } },
  cupe: { piel: { opciones: PELAJES_PERRO, letras: { W: B, v: L, w: S }, brazo: { mano: B, manoLuz: L }, pierna: { luz: L, base: B, sombra: S } } },
  uzu: { piel: { opciones: PIELES_GOBLIN, letras: { G: B, g: S, Z: L }, brazo: { luz: L, base: B, sombra: S, mano: S, manoLuz: B }, pierna: { bota: S, botaSombra: S } } },
}
for (const id in PARTES) if (PARTES[id].pelo) PARTES[id].pelo.opciones = PELOS

/* La prenda principal y un acento (pantalón, capa, faja, bufanda…) de cada uno. */
const ROPA = {
  jelic: { opciones: elige('rojo', 'verde', 'morado', 'negro'), letras: { A: B, a: S, Q: L } },
  latte: { opciones: elige('vino', 'azul', 'verdeBosque', 'gris'), letras: { J: B, j: S, k: L }, brazo: MANGAS },
  malala: { opciones: elige('rosado', 'celeste', 'morado', 'rojo'), letras: { Q: 'cuadrille' }, brazo: MANGAS },
  malia: { opciones: elige('vino', 'azul', 'verdeBosque', 'morado'), letras: { N: B, n: L } },   // la falda (el delantal tapa la blusa)
  kenny: { opciones: elige('azul', 'verdeBosque', 'negro', 'mostaza'), letras: { J: B, j: S }, brazo: MANGAS },
  tivan: { opciones: elige('vino', 'azul', 'morado', 'cafe'), letras: { O: B, o: S, P: L } },
  patroclus: { opciones: elige('cafe', 'gris', 'verdeBosque', 'negro'), letras: { T: B }, pierna: MANGAS },   // el pantalón (la camisa la tapan el águila y la pañoleta)
  uchis: { opciones: elige('rosado', 'celeste', 'verde', 'gris'), letras: { C: B, c: S }, brazo: MANGAS },
  janet: { opciones: elige('azul', 'cafe', 'gris', 'vino'), letras: { G: B, g: S }, brazo: MANGAS },
  july: { opciones: elige('cafe', 'vino', 'verdeBosque', 'negro'), letras: { A: B, a: S, l: L } },
  edith: { opciones: elige('azul', 'verdeBosque', 'negro', 'vino'), letras: { P: B, p: S }, brazo: MANGAS },
  xitin: { opciones: elige('verde', 'vino', 'morado', 'negro'), letras: { Ó: B, Ú: S, á: L } },
  agattita: { opciones: elige('azul', 'rosado', 'morado', 'mostaza'), letras: { G: B, g: S, H: L } },
  cupe: { opciones: elige('azul', 'vino', 'verdeBosque', 'negro'), letras: { G: B, g: S }, brazo: MANGAS },
  uzu: { opciones: elige('rojo', 'azul', 'verdeBosque', 'gris'), letras: { T: B, t: S } },
}
const ACENTO = {
  jelic: { opciones: elige('mostaza', 'celeste', 'verde'), letras: { R: B, r: S } },
  latte: { opciones: elige('rojo', 'morado', 'azul'), letras: { C: B, c: S, V: L } },
  malala: { opciones: elige('celeste', 'rosado', 'crema'), letras: { Y: B, y: S } },
  malia: { opciones: elige('celeste', 'rosado', 'verde'), letras: { B: B, b: S }, brazo: MANGAS },   // la blusa y las mangas
  kenny: { opciones: elige('rojo', 'mostaza', 'rosado'), letras: { T: B, t: S } },
  tivan: { opciones: elige('cafe', 'negro', 'azul'), pierna: MANGAS },
  patroclus: { opciones: elige('celeste', 'verde', 'mostaza'), letras: { G: B, g: S, V: L } },
  uchis: { opciones: elige('azul', 'morado', 'verde'), letras: { R: B, r: S, V: L } },
  janet: { opciones: elige('mostaza', 'rojo', 'celeste'), letras: { L: B, l: S } },
  july: { opciones: elige('cafe', 'azul', 'negro'), pierna: MANGAS },
  edith: { opciones: elige('mostaza', 'celeste', 'rosado'), letras: { C: B } },
  xitin: { opciones: elige('mostaza', 'verde', 'celeste'), letras: { í: B, ó: S } },
  agattita: { opciones: elige('cafe', 'azul', 'negro'), letras: { T: B, t: S } },
  cupe: { opciones: elige('azul', 'morado', 'verde'), letras: { V: B, u: S } },
  uzu: { opciones: elige('negro', 'gris', 'azul'), pierna: MANGAS },
}
for (const id in PARTES) { PARTES[id].ropa = ROPA[id]; PARTES[id].acento = ACENTO[id] }

/* Manchas de la gata (calicó): parches fijos de 4 × 4 px (sin puntitos sueltos, que a este tamaño ensucian). */
const MANCHA = { blanco: ['#FFFFEB', '#C2C2D1', '#FFFFEB'], naranjo: ['#F2A65E', '#BA6156', '#FFB570'], negro: ['#43434F', '#322947', '#606070'] }
const hash = (n) => { n = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b); n ^= n >>> 13; return (Math.imul(n, 0xc2b2ae35) >>> 0) }
const manchaEn = (x, y) => { const h = hash(((x >> 2) * 73856093) ^ ((y >> 2) * 19349663)) % 10; return h < 3 ? 'naranjo' : h < 5 ? 'negro' : 'blanco' }

/* El pelo nunca del mismo color que la piel: el rubio de Edith se fundía con su frente tostada. El tono que choca se
   corre al vecino de la rampa: la sombra hacia lo oscuro; la base y la luz hacia lo claro en los pelos claros y hacia
   lo oscuro en los oscuros. */
const CLARO = { '#5E315B': '#8C3F5D', '#8C3F5D': '#BA6156', '#BA6156': '#F2A65E', '#F2A65E': '#FFE478', '#FFE478': '#FFFFEB', '#964253': '#E36956', '#E36956': '#FF9166', '#FF9166': '#FFB570', '#FFB570': '#FFE478', '#FFB5B5': '#FFFFEB' }
const OSCURO = { '#FFFFEB': '#FFE478', '#FFE478': '#F2A65E', '#F2A65E': '#BA6156', '#BA6156': '#8C3F5D', '#8C3F5D': '#5E315B', '#5E315B': '#3E2347', '#FFB570': '#FF9166', '#FF9166': '#E36956', '#E36956': '#964253', '#FFB5B5': '#FF6B97' }
const PELOS_CLAROS = ['rubio', 'pelirrojo', 'blanco', 'rosado', 'turquesa']
function separaDeLaPiel(rampa, nombre, c, partesPiel) {
  const tr = (v) => (typeof v === 'string' ? ((c.mapa && c.mapa[v.toUpperCase()]) || v).toUpperCase() : null)
  const piel = new Set(Object.keys((partesPiel && partesPiel.letras) || {}).map((k) => tr(c.pal[k])).filter(Boolean))
  const usados = new Set(), salida = [...rampa]
  for (const rol of [0, 1, 2]) {
    const mapa = rol === 1 || !PELOS_CLAROS.includes(nombre) ? OSCURO : CLARO
    let col = salida[rol]
    for (let i = 0; i < 4 && (piel.has(col) || usados.has(col)) && mapa[col]; i++) col = mapa[col]   // tampoco igual a otro tono del pelo: se perderían los rulos de Edith
    salida[rol] = col; usados.add(col)
  }
  return salida
}

/* Aplica un material a un diseño: devuelve las letras, brazo y pierna cambiados. */
function aplica(c, partes, rampa) {
  const pal = { ...c.pal }, brazo = { ...c.brazo }, pierna = { ...c.pierna }
  for (const [k, rol] of Object.entries(partes.letras || {})) {
    if (!(k in pal)) continue
    if (rampa === 'manchada') pal[k] = (x, y) => MANCHA[manchaEn(x, y)][rol]
    else if (rol === 'cuadrille') pal[k] = (x, y) => { const i = (x >> 1) & 1, j = (y >> 1) & 1; return i && j ? rampa[1] : i || j ? rampa[0] : '#F4F8F2' }   // el vestido de Malala: cuadrillé con blanco
    else pal[k] = rampa[rol]
  }
  const plano = rampa === 'manchada' ? MANCHA.blanco : rampa   // brazos y piernas de la gata manchada, blancos
  for (const [k, rol] of Object.entries(partes.brazo || {})) if (k in brazo) brazo[k] = plano[rol]
  for (const [k, rol] of Object.entries(partes.pierna || {})) if (k in pierna) pierna[k] = plano[rol]
  return { ...c, pal, brazo, pierna }
}

/* El personaje con sus colores elegidos: eleccion = { piel, pelo, ropa, acento } (nombres de las opciones; lo que
   falta o no existe queda original). Siempre el mismo objeto para la misma elección, para que las escenas no se
   reinicien. */
export const MATERIALES = ['piel', 'pelo', 'ropa', 'acento']
const hechos = new Map()
export function personaliza(hero, eleccion) {
  const partes = hero && PARTES[hero.id]
  if (!partes || !eleccion) return hero
  const usados = MATERIALES.filter((m) => partes[m] && partes[m].opciones[eleccion[m]])
  if (!usados.length) return hero
  const clave = [hero.id, ...MATERIALES.map((m) => (usados.includes(m) ? eleccion[m] : ''))].join('|')
  if (!hechos.has(clave)) {
    let hd = hero.hd
    for (const m of usados) {
      let rampa = partes[m].opciones[eleccion[m]]
      if (m === 'pelo') rampa = separaDeLaPiel(rampa, eleccion.pelo, hd, partes.piel)   // ya con la piel elegida (va antes en MATERIALES)
      hd = aplica(hd, partes[m], rampa)
    }
    hechos.set(clave, { ...hero, hd, variante: clave })
  }
  return hechos.get(clave)
}

/* Para la pantalla "Personaliza": el color de cada círculo (la base de la rampa; el original, el que tiene hoy). */
const traduce = (c, v) => (typeof v === 'string' ? ((c.mapa && c.mapa[v.toUpperCase()]) || v) : null)
export function colorMuestra(hero, mat, opcion) {
  const partes = PARTES[hero.id] && PARTES[hero.id][mat]
  if (!partes) return null
  if (opcion) { const r = partes.opciones[opcion]; return r === 'manchada' ? 'manchada' : r && r[0] }
  const c = hero.hd, base = (o) => Object.keys(o || {}).find((k) => o[k] === 0)
  const k = base(partes.letras)
  if (k && typeof c.pal[k] === 'string') return traduce(c, c.pal[k])
  if (k && typeof c.pal[k] === 'function') return traduce(c, c.pal[k](1, 0))   // el cuadrillé de Malala
  const kb = base(partes.brazo); if (kb) return traduce(c, c.brazo[kb])
  const kp = base(partes.pierna); if (kp) return traduce(c, c.pierna[kp])
  return null
}
/* Los materiales que tiene cada personaje y sus opciones, en orden. */
export const materialesDe = (id) => MATERIALES.filter((m) => PARTES[id] && PARTES[id][m]).map((m) => [m, Object.keys(PARTES[id][m].opciones)])
/* Una elección al azar (cada material puede quedar original). */
export function alAzar(id, azar = Math.random) {
  return Object.fromEntries(materialesDe(id).map(([m, ops]) => { const i = Math.floor(azar() * (ops.length + 1)); return [m, i < ops.length ? ops[i] : null] }).filter(([, v]) => v))
}
