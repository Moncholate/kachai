/* Ronda bonus, CELULAR: escena del cielo (Apollo), la barquilla y el personaje con la ballesta de
   ventosas (Pear36). Las capas del cielo se pintan la primera vez que se piden (no al importar). */
import { hdDibujar, hdPose, hdContorno, hdLinea } from './heroesHD.js'
import { lienzoPear36 } from './pear36.js'

/* ================= Paleta Apollo (la misma de fondos.js) ================= */
export const AP = {
  ve: ['#19332d', '#25562e', '#468232', '#75a743', '#a8ca58', '#d0da91'],
  ca: ['#4d2b32', '#7a4841', '#ad7757', '#c09473', '#d7b594', '#e7d5b3'],
  na: ['#341c27', '#602c2c', '#884b2b', '#be772b', '#de9e41', '#e8c170'],
  ro: ['#241527', '#411d31', '#752438', '#a53030', '#cf573c', '#da863e'],
  mo: ['#1e1d39', '#402751', '#7a367b', '#a23e8c', '#c65197', '#df84a5'],
  az: ['#172038', '#253a5e', '#3c5e8b', '#4f8fba', '#73bed3', '#a4dddb'],
  gr: ['#090a14', '#10141f', '#151d28', '#202e37', '#394a50', '#577277', '#819796', '#a8b5b2', '#c7cfcc', '#ebede9'],
}
export const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c }
export const W = 112, H = 212

/* ---------- Cielo fijo: degradado, estrellas, sol, islas, nubecitas ---------- */
function pintarCielo() {
  const c = mk(W, H), g = c.getContext('2d')
  const p = (x, y, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), 1, 1) }
  let s = 5; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647
  const BANDAS = [[0, AP.az[1]], [26, AP.az[2]], [58, AP.az[3]], [92, AP.az[4]], [118, AP.az[5]], [136, AP.ca[5]], [150, AP.na[5]]]
  for (let y = 0; y < H; y++) {
    let i = 0; while (i + 1 < BANDAS.length && BANDAS[i + 1][0] <= y) i++
    const sig = BANDAS[i + 1], cerca = sig && sig[0] - y <= 3
    for (let x = 0; x < W; x++) p(x, y, cerca && (x + y) % 2 === 0 ? sig[1] : BANDAS[i][1])
  }
  for (let i = 0; i < 40; i++) { const x = rnd() * W, y = rnd() * 40; p(x, y, rnd() < 0.3 ? AP.gr[9] : AP.az[4]) }
  ;[[18, 9], [77, 14], [99, 5]].forEach(([x, y]) => { p(x, y, AP.gr[9]); p(x - 1, y, AP.az[5]); p(x + 1, y, AP.az[5]); p(x, y - 1, AP.az[5]); p(x, y + 1, AP.az[5]) })
  /* Sol bajo, entre las nubes */
  const SX = 86, SY = 152
  for (let y = SY - 12; y <= SY + 12; y++) for (let x = SX - 12; x <= SX + 12; x++) {
    const d = Math.hypot(x - SX, y - SY)
    if (d <= 4.5) p(x, y, AP.gr[9]); else if (d <= 6.5) p(x, y, AP.ca[5]); else if (d <= 10 && (x + y) % 2 === 0) p(x, y, AP.ca[5])
  }
  /* Isla flotante (lejos: colores apagados por la distancia) */
  const isla = (cx, top, ancho, alto, casa) => {
    for (let x = cx - ancho; x <= cx + ancho; x++) {
      const k = Math.abs(x - cx) / ancho, fondo = top + 3 + Math.round(alto * (1 - k * k) + Math.sin(x * 1.7) * 1.2)
      for (let y = top; y <= fondo; y++) {
        const luz = x > cx + ancho * 0.25
        let col = y <= top + 1 ? (y === top ? AP.ve[3] : AP.ve[2]) : (luz ? AP.mo[2] : AP.mo[1])
        if (y > top + 1 && (x * 3 + y * 5) % 11 === 0) col = luz ? AP.mo[3] : AP.mo[0]
        if (y > top + 1 && y < top + 4 && (x + y) % 3 === 0) col = AP.ve[1]   // raíces y pasto que cuelga
        p(x, y, col)
      }
    }
    for (let x = cx - ancho - 1; x <= cx + ancho + 1; x += 3) p(x, top - 1, AP.ve[3])
    if (casa) {
      const hx = cx - 3, hy = top - 1
      for (let y = hy - 5; y <= hy; y++) for (let x = hx; x <= hx + 6; x++) p(x, y, x === hx + 6 ? AP.ca[2] : AP.ca[4])
      for (let i = 0; i < 5; i++) for (let x = hx - 1 + i; x <= hx + 7 - i; x++) p(x, hy - 6 - i, i === 0 ? AP.ro[2] : AP.ro[3])
      p(hx + 2, hy - 1, AP.ca[0]); p(hx + 2, hy, AP.ca[0]); p(hx + 4, hy - 3, AP.na[5])
      for (let y = hy - 14; y < hy - 7; y++) p(hx + 5, y, AP.ca[1])   // chimenea / mástil
      p(hx + 6, hy - 14, AP.ro[4]); p(hx + 7, hy - 14, AP.ro[4]); p(hx + 6, hy - 13, AP.ro[3])
    } else {
      const tx = cx + 2, ty = top - 1   // un árbol
      for (let y = ty - 4; y <= ty; y++) p(tx, y, AP.ca[1])
      for (let y = ty - 9; y <= ty - 4; y++) for (let x = tx - 3; x <= tx + 3; x++) if ((x - tx) ** 2 + ((y - ty + 6.5) * 1.3) ** 2 <= 10) p(x, y, x > tx ? AP.ve[3] : AP.ve[2])
    }
  }
  isla(90, 78, 15, 24, true)
  isla(52, 44, 8, 13, false)
  /* Nubecitas sueltas a media altura */
  const nubecita = (cx, cy, L) => { for (let k = 0; k < L; k++) { p(cx + k, cy, k > 1 && k < L - 2 ? AP.gr[9] : AP.az[5]); if (k > 2 && k < L - 3) p(cx + k, cy - 1, AP.gr[9]); p(cx + k, cy + 1, AP.az[4]) } }
  nubecita(60, 108, 12); nubecita(30, 70, 9); nubecita(96, 120, 10)
  return c
}

/* ---------- Mar de nubes en capas (franjas anchas que se repiten al desplazarse) ---------- */
function capaNubes(semilla, y0, r0, r1, n, ramp) {
  const ancho = 224, c = mk(ancho, H), g = c.getContext('2d')
  let s = semilla; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647
  const p = (x, y, col) => { g.fillStyle = col; g.fillRect(((Math.round(x) % ancho) + ancho) % ancho, Math.round(y), 1, 1) }
  /* Bolas en dos hileras; las de más abajo van delante. Cada bola: borde iluminado arriba y el cuerpo se oscurece con la altura de la capa (no por bola), así se funden. */
  const bolas = []
  for (let fila = 0; fila < 2; fila++) for (let i = 0; i < n; i++) bolas.push([i * ancho / n + rnd() * 12 + fila * ancho / n / 2, y0 + fila * 6 + rnd() * 5, (r0 + rnd() * (r1 - r0)) * (fila ? 0.9 : 1)])
  bolas.sort((a, b) => a[1] - b[1])
  const cuerpo = (x, y) => { const d = y - y0; const i = d < 8 ? 2 : d < 16 ? 3 : 4; return (d === 8 || d === 16) && (x + y) % 2 ? ramp[i - 1] : ramp[i] }
  for (const [cx, cy, r] of bolas) for (let x = Math.round(cx - r); x <= cx + r; x++) {
    const dx = x - cx, sup = Math.round(cy - Math.sqrt(Math.max(0, r * r - dx * dx)) / 1.15)
    for (let y = sup; y < H; y++) {
      const hondo = y - sup
      p(x, y, hondo === 0 ? ramp[0] : hondo <= 2 ? (hondo === 2 && (x + y) % 2 ? cuerpo(x, y) : ramp[1]) : cuerpo(x, y))
    }
  }
  /* Base continua: rellena los huecos entre bolas (si no, se ve una línea de cielo de arriba a abajo) */
  const d = g.getImageData(0, 0, ancho, H).data
  for (let x = 0; x < ancho; x++) for (let y = y0 + 6; y < H; y++) if (!d[(y * ancho + x) * 4 + 3]) p(x, y, cuerpo(x, y))
  return c
}
let capas
export function capasCielo() {
  capas ??= {
    CIELO: pintarCielo(),
    CAPA_LEJOS: capaNubes(17, 150, 6, 11, 12, [AP.gr[9], AP.ca[5], AP.gr[8], AP.gr[7], AP.az[4]]),
    CAPA_MEDIO: capaNubes(29, 168, 8, 14, 9, [AP.na[5], AP.ca[5], AP.ca[4], AP.ca[3], AP.mo[2]]),
    CAPA_CERCA: capaNubes(41, 200, 9, 15, 7, [AP.na[5], AP.ca[4], AP.ca[3], AP.mo[2], AP.mo[1]]),
  }
  return capas
}

/* ---------- La nave ---------- */
export function globoYCuerdas(g, oy, t) {
  const p = (x, y, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), 1, 1) }
  const HT = H - 46 + oy, cx = -6, cy = HT - 62, rx = 34, ry = 19
  /* Cuerdas: del globo a la barquilla */
  ;[[4, 0], [14, 10], [22, 22], [26, 32]].forEach(([a, b]) => hdLinea(a, cy + Math.round(ry * Math.sqrt(1 - ((a - cx) / rx) ** 2)) - 1, b, HT - 1, (x, y) => p(x, y, AP.gr[4])))
  /* El globo: blanco con costillas doradas, luz del sol desde la derecha */
  for (let y = cy - ry - 1; y <= cy + ry + 1; y++) for (let x = 0; x <= cx + rx + 6; x++) {
    const nx = (x - cx) / rx, ny = (y - cy) / ry, d = nx * nx + ny * ny
    if (d > 1) continue
    const borde = (((x + 1 - cx) / rx) ** 2 + ny * ny > 1) || (nx * nx + ((y - 1 - cy) / ry) ** 2 > 1) || (nx * nx + ((y + 1 - cy) / ry) ** 2 > 1)
    const lum = -ny * 0.7 + nx * 0.5
    let col = lum > 0.45 ? AP.gr[9] : lum > 0.05 ? AP.gr[8] : lum > -0.35 ? AP.gr[7] : AP.gr[6]
    const media = Math.sqrt(Math.max(0, 1 - ny * ny))
    for (const m of [-0.15, 0.25, 0.55, 0.8, 0.95]) if (Math.abs(nx - m * media) < 0.5 / rx) col = lum > 0 ? AP.na[5] : AP.na[4]
    if (Math.abs(ny) < 0.5 / ry || Math.abs(Math.abs(ny) - 0.55) < 0.5 / ry) col = lum > 0 ? AP.na[5] : AP.na[4]
    if (borde) col = AP.gr[3]
    p(x, y, col)
  }
  /* Punta dorada adelante */
  for (let i = 1; i <= 4; i++) p(cx + rx + i, cy, i === 4 ? AP.na[5] : AP.na[4]); p(cx + rx + 1, cy - 1, AP.na[3]); p(cx + rx + 1, cy + 1, AP.na[3])
}
export function barquilla(g, oy, t) {
  const p = (x, y, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), 1, 1) }
  const HT = H - 46 + oy
  const arriba = (x) => x > 34 ? HT - Math.round((x - 34) * 0.5) : HT
  const abajo = (x) => HT + 20 - Math.max(0, Math.round((x - 16) * 0.62))
  for (let x = 0; x <= 46; x++) {
    const a = arriba(x), b = abajo(x)
    if (b <= a) continue
    for (let y = a; y <= b; y++) {
      const fila = y - a
      let col = fila <= 1 ? AP.ca[3] : (fila % 4 === 0 ? AP.ca[0] : AP.ca[1])
      if (fila === 4 || fila === 13) col = AP.na[4]
      if (fila >= 7 && fila <= 9 && x > 1 && x < 34 && x % 5 >= 1 && x % 5 <= 2) col = fila === 7 ? AP.na[4] : AP.na[5]   // ventanitas encendidas
      if (y === a || y === b || x === 46) col = AP.gr[1]
      p(x, y, col)
    }
  }
  for (let x = 0; x <= 44; x += 6) p(x, arriba(x) - 1, AP.na[4])   // remaches dorados en la baranda
  /* Faro en la proa */
  const fx = 44, fy = arriba(44) - 1
  for (let y = fy - 7; y < fy; y++) p(fx, y, AP.ca[0])
  const late = Math.floor(t / 400) % 2
  p(fx + 1, fy - 7, AP.gr[1]); p(fx + 1, fy - 6, AP.na[5]); p(fx + 2, fy - 6, AP.na[5]); p(fx + 1, fy - 5, AP.na[4]); p(fx + 2, fy - 5, AP.na[4]); p(fx + 1, fy - 4, AP.gr[1]); p(fx + 2, fy - 4, AP.gr[1])
  if (late) { p(fx + 3, fy - 6, AP.ca[5]); p(fx + 3, fy - 5, AP.ca[5]) }
  /* Hélice bajo la popa */
  const hx = 10, hy = abajo(10) + 2
  p(hx, hy - 1, AP.gr[4]); p(hx, hy, AP.gr[5])
  if (Math.floor(t / 90) % 2) { for (let i = -4; i <= 4; i++) p(hx + i, hy + 1, Math.abs(i) > 2 ? AP.gr[7] : AP.gr[6]) }
  else { for (let i = -2; i <= 2; i++) p(hx + i, hy + 1, AP.gr[6]); p(hx, hy + 2, AP.gr[6]) }
}

/* ================= Personaje con la ballesta (Pear36) ================= */
const COL = { B: '#66FFE3', b: '#4DA6FF', bb: '#4B5BAB', O: '#F2A65E', Y: '#FFE478', W: '#FFFFEB', D: '#FFE478', R: '#EB564B', r: '#BA6156', G: '#8FDE5D' }
const eje = (ang) => { const a = ang * Math.PI / 180; return [Math.cos(a), -Math.sin(a), Math.sin(a), Math.cos(a)] }
function ballesta(px, ax, ay, ang, estado) {
  const [ux, uy, vx, vy] = eje(ang)
  const at = (t, k) => [Math.round(ax + ux * t + vx * k), Math.round(ay + uy * t + vy * k)]
  const pts = [], dardo = []
  for (let dy = -22; dy <= 22; dy++) for (let dx = -22; dx <= 22; dx++) {
    const t = dx * ux + dy * uy, k = dx * vx + dy * vy, x = ax + dx, y = ay + dy, e = 0.55
    const enT = (t0, t1) => t >= t0 - e && t <= t1 + e, enK = (k0, k1) => k >= k0 - e && k <= k1 + e
    const tc = 10 - (k * k) / 16
    if (Math.abs(k) <= 7 + e && Math.abs(t - tc) <= 0.9) pts.push([x, y, Math.abs(k) >= 6 ? COL.Y : t < tc ? COL.Y : COL.O])
    else if (enT(-7, 12) && enK(-1, 0)) pts.push([x, y, k < -0.5 ? COL.B : COL.b])
    else if (enT(-7, -6) && enK(1, 2)) pts.push([x, y, COL.bb])
    else if (enT(-2, -1) && enK(1, 4)) pts.push([x, y, COL.bb])
    else if (enT(0, 0) && enK(1, 1)) pts.push([x, y, COL.bb])
    if (estado === 'cargada') {
      if (enT(1, 13) && enK(-2, -2)) dardo.push([x, y, t < 3 ? COL.G : COL.D])
      else if (enT(14, 15) && enK(-4, 0)) dardo.push([x, y, t > 14.5 ? COL.r : COL.R])
    }
  }
  hdContorno(px, pts)
  const tip = 10 - 49 / 16, [x1, y1] = at(tip, -7), [x2, y2] = at(tip, 7)
  if (estado === 'cargada' || estado === 'tensa') { const [nx, ny] = at(1, -1); hdLinea(x1, y1, nx, ny, (x, y) => px(x, y, COL.W)); hdLinea(x2, y2, nx, ny, (x, y) => px(x, y, COL.W)) }
  else if (estado === 'vacia') hdLinea(x1, y1, x2, y2, (x, y) => px(x, y, COL.W))
  else { const [mx, my] = at(tip + 3, 2); hdLinea(x1, y1, mx, my, (x, y) => px(x, y, COL.W)); const [bx, by] = at(tip - 2, 9); hdLinea(x2, y2, bx, by, (x, y) => px(x, y, COL.W)) }   // rota: la cuerda cuelga suelta
  if (dardo.length) hdContorno(px, dardo)
}
export function dardo(px, x, y, ang, estela) {
  const [ux, uy, vx, vy] = eje(ang), pts = []
  for (let dy = -14; dy <= 14; dy++) for (let dx = -14; dx <= 14; dx++) {
    const t = dx * ux + dy * uy, k = dx * vx + dy * vy, e = 0.55
    if (t >= -11 - e && t <= -2 + e && Math.abs(k) <= e) pts.push([x + dx, y + dy, t < -9 ? COL.G : COL.D])
    else if (t >= -1 - e && t <= 0 + e && Math.abs(k) <= 2 + e) pts.push([x + dx, y + dy, t > -0.5 ? COL.r : COL.R])
  }
  hdContorno(px, pts)
  if (estela) for (let s = 15; s <= 27; s += 4) { px(Math.round(x - ux * s - vx * 2), Math.round(y - uy * s - vy * 2), COL.W); px(Math.round(x - ux * (s + 2) + vx * 2), Math.round(y - uy * (s + 2) + vy * 2), COL.W) }
}


/* Poses. ancla: por dónde pasa la culata (respecto del hombro). echa: cuánto se va hacia atrás todo lo que está
   sobre los hombros (el torso se arquea de a poco). codo / codoCerca: dónde dobla cada brazo. atras: qué hace la
   mano de atrás al recargar. */
export const POSES = {
  guardia: { ang: 0, ancla: [1, 6], nombre: 'Guardia' },
  a0: { ang: 0, ancla: [2, -3], nombre: 'Al frente' },
  a45: { ang: 45, ancla: [1, -3], echa: -3, codo: [5, -1], codoCerca: [9, 3], nombre: '45°' },
  a90: { ang: 90, ancla: [0, -4], manoT: 5, echa: -6, codo: [5, -3], codoCerca: [5, 3], nombre: 'Arriba' },
  d0: { ang: 0, ancla: [1, -3], nombre: 'Dispara al frente' },
  d45: { ang: 45, ancla: [0, -2], echa: -4, codo: [5, 0], codoCerca: [9, 4], nombre: 'Dispara 45°' },
  d90: { ang: 90, ancla: [0, -3], manoT: 5, echa: -7, codo: [5, -2], codoCerca: [5, 4], nombre: 'Dispara arriba' },
  r1: { ang: -45, ancla: [1, 5], atras: 'cuerda', nombre: 'Recarga: tensa' },
  r2: { ang: -45, ancla: [1, 5], atras: 'punta', nombre: 'Recarga: pone el dardo' },
  trabada: { ang: 0, ancla: [1, 6], nombre: 'Trabada' },
}
export const ESTADO_POSE = { guardia: 'cargada', a0: 'cargada', a45: 'cargada', a90: 'cargada', d0: 'vacia', d45: 'vacia', d90: 'vacia', r1: 'tensa', r2: 'cargada', trabada: 'rota' }
export const HW = 64, HH = 76, HX = 8, YB = 17, OX = HX + 8, OY = YB + 6
/* Dónde está la cara de cada personaje (x0, y0, x1, y1 en sus coordenadas): ojos, cejas y boca se mueven en bloque, sin torcerse */
const BOCAS = { jelic: [11, 8, 23, 17] }   // Jelic: toda la abertura del casco, para que el borde calce con la cara

function render(c, p) { const cv = mk(HW, HH); hdDibujar(lienzoPear36(cv.getContext('2d', { willReadFrequently: true })), HX, YB, c, p); return cv.getContext('2d').getImageData(0, 0, HW, HH) }
const cache = new Map()
export function cuadroHeroe(h, nombre, estado = ESTADO_POSE[nombre]) {
  const clave = h.id + nombre + estado
  if (cache.has(clave)) return cache.get(clave)
  const pose = POSES[nombre], base = h.hd
  const [sx, sy] = base.hombro, ancla = [sx + pose.ancla[0], sy + pose.ancla[1]]
  const [ux, uy, vx, vy] = eje(pose.ang)
  const en = (t, k) => [Math.round(ancla[0] + ux * t + vx * k), Math.round(ancla[1] + uy * t + vy * k)]
  const manoAdelante = en(pose.manoT || 7, 2)
  const manoAtras = pose.atras === 'cuerda' ? en(1, -1) : pose.atras === 'punta' ? en(3, -3) : en(-1.5, 3)
  const cerca = base.brazoCerca, colCerca = (cerca && cerca.col) || base.brazo
  const arma = (px) => {
    ballesta(px, ancla[0], ancla[1], pose.ang, estado)
    const m = (base.brazoGrueso || 3) >= 3 ? 2 : 1, pts = []
    for (let i = -1; i <= m; i++) for (let j = -1; j <= m; j++) pts.push([manoAtras[0] + i, manoAtras[1] + j, i === -1 || j === -1 ? colCerca.manoLuz || colCerca.mano : colCerca.mano])
    hdContorno(px, pts)
  }
  let brazoCerca = cerca
  if (cerca) { const [cx, cy] = cerca.hombro, dm = [manoAtras[0] - cx, manoAtras[1] - cy]; brazoCerca = { ...cerca, poses: {}, todas: [dm, pose.codoCerca || [Math.round(dm[0] / 2) - 1, Math.max(Math.round(dm[1] / 2) + 3, 3)]], encima: false } }
  const limpio = { ...base, armaDetras: null, retoque: undefined, brazoAtras: undefined, codos: undefined, codoDinamico: undefined, manoDinamica: undefined, atras: base.id === 'malala' ? undefined : base.atras }
  const p = { ...hdPose(base, 'guardia', 0), fase: 'ballesta', agacha: 0 }
  /* A: con ballesta y brazos. C: solo el cuerpo (sin armas ni brazo de cerca, el otro brazo recogido) */
  const A = render({ ...limpio, arma, manoEncima: true, brazoCerca, codos: pose.codo ? { ballesta: [sx + pose.codo[0], sy + pose.codo[1]] } : undefined }, { ...p, mano: manoAdelante })
  const C = render({ ...limpio, arma: undefined, brazoCerca: undefined, manoEncima: false }, { ...p, mano: [sx, sy + 3] })
  const out = new ImageData(HW, HH), o = out.data, a = A.data, cc = C.data
  const capCab = new ImageData(HW, HH), oc = capCab.data   // la cabeza va en su propia capa
  const cuello = OY + sy - 2, pivX = OX + 16, pivY = cuello
  const esCabeza = (x, y) => y < cuello && cc[(y * HW + x) * 4 + 3]
  /* 1) el cuerpo sin la cabeza */
  for (let i = 0; i < HW * HH; i++) { const y = (i / HW) | 0, x = i % HW; if (!esCabeza(x, y) && cc[i * 4 + 3]) for (let k = 0; k < 4; k++) o[i * 4 + k] = cc[i * 4 + k] }
  /* 2) la cabeza se inclina hacia atrás sin cambiar de tamaño: primero cada columna sube según lo adelante que está
        (el mentón sube, la nuca baja) y después cada fila se corre hacia atrás según lo alta que está.
        Son corrimientos enteros: cada píxel se mueve, ninguno se estira ni se repite. */
  const sube = pose.subeCab || 0, atras = pose.atrasCab || 0
  /* La cara se mueve en bloque: si no, la sonrisa queda chueca y las cejas enojadas */
  const bo = BOCAS[base.id], enBoca = (x, y) => bo && x >= OX + bo[0] && x <= OX + bo[2] && y >= OY + bo[1] && y <= OY + bo[3]
  for (let y = 0; y < HH; y++) for (let x = 0; x < HW; x++) {
    if (!esCabeza(x, y)) continue
    const xc = enBoca(x, y) ? OX + (bo[0] + bo[2]) / 2 : x
    const y1 = y - Math.round((xc - pivX) * sube)
    const x1 = x - Math.round((pivY - y1) * atras)
    if (x1 < 0 || y1 < 0 || x1 >= HW || y1 >= HH) continue
    const i = (y1 * HW + x1) * 4, j = (y * HW + x) * 4
    for (let k = 0; k < 4; k++) oc[i + k] = cc[j + k]
  }
  /* 3) aparte, todo lo que cambia con la ballesta: brazos, manos, ballesta */
  const enc = new ImageData(HW, HH), e = enc.data
  for (let i = 0; i < HW * HH; i++) {
    const j = i * 4
    if (a[j + 3] && (!cc[j + 3] || a[j] !== cc[j] || a[j + 1] !== cc[j + 1] || a[j + 2] !== cc[j + 2])) for (let k = 0; k < 4; k++) e[j + k] = a[j + k]
  }
  /* 4) la espalda se echa atrás: cada fila sobre la cadera se corre un poco más. Los brazos y la ballesta
        se corren en bloque, lo mismo que el hombro: así la ballesta sigue derecha (no se pasa de los 90°). */
  const tmp = mk(HW, HH); tmp.getContext('2d').putImageData(out, 0, 0)
  const tmpE = mk(HW, HH); tmpE.getContext('2d').putImageData(enc, 0, 0)
  const fin = mk(HW, HH), gf = fin.getContext('2d'), cadera = OY + base.caderas[0][1], echa = pose.echa || 0
  /* Todo lo que está sobre los hombros (cabeza, sombrero, colas, mandíbulas) se corre entero, sin cortes;
     solo el torso, entre los hombros y la cadera, se arquea de a poco. */
  const corta = OY + sy + 2
  const corre = (y) => y >= cadera ? 0 : y <= corta ? echa : Math.round(echa * (cadera - y) / (cadera - corta))
  for (let y = 0; y < HH; y++) gf.drawImage(tmp, 0, y, HW, 1, corre(y), y, HW, 1)
  /* La cabeza se corre entera, lo mismo que el cuello: si se corriera fila por fila, la cara se estiraría en diagonal */
  const tmpC = mk(HW, HH); tmpC.getContext('2d').putImageData(capCab, 0, 0)
  gf.drawImage(tmpC, echa, 0)
  const dh = corre(OY + sy)
  gf.drawImage(tmpE, dh, 0)
  const [bx, by] = en(15, -2)
  const res = { cv: fin, boca: [OX + bx + dh, OY + by], cabeza: [OX + 15 + (pose.echa || 0), OY - 3], cadera }
  cache.set(clave, res)
  return res
}

/* Altura de la cubierta (donde la baranda tapa al personaje), con el vaivén de la nave */
export const cubierta = (oy) => H - 46 + oy
