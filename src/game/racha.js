/* Distintivo de racha en los personajes (ver docs/personalizacion-personajes.md). Se suma por niveles:
     racha de 3   el arma brilla: se aclara, su contorno se vuelve dorado y late, halo de 1 px, destello y chispitas
     racha de 5   además, un aura de ki dorado alrededor del personaje
     racha de 8+  el personaje entero dorado y el aura "ultra instinto" (blanco → turquesa → azul, llamas altas);
                  la escena oscurece el escenario (oscurece())
   Lo que lanza (proyectil) también brilla y lleva 1 px de aura, para no tapar su forma (la flecha de Janet).
   Cuando la racha se corta, el distintivo se apaga en silencio. Todos los colores son de Pear36.

   El personaje se dibuja en capas aparte (cuerpo, lo lanzado y el cuerpo sin arma, para saber qué brilla), se
   procesan y el resultado se pega en la escena con su transformación (espejo, temblor). */
import { hdDibujar, HDK } from './heroesHD.js'
import { aPear36, lienzoPear36 } from './pear36.js'

export const nivelRacha = (streak) => (streak >= 8 ? 3 : streak >= 5 ? 2 : streak >= 3 ? 1 : 0)
/* El personaje con su nivel de racha (en hd, para que llegue a todas las variantes que arman las escenas). */
const conRachaHechos = new Map()   // siempre el mismo objeto por personaje y nivel: así las escenas no se reinician
export function conRacha(hero, streak) {
  const n = nivelRacha(streak)
  if (!n || !hero) return hero
  const clave = (hero.variante || hero.id) + '|' + n   // con sus colores personalizados (game/personaliza.js)
  if (!conRachaHechos.has(clave)) conRachaHechos.set(clave, { ...hero, hd: { ...hero.hd, racha: n } })
  return conRachaHechos.get(clave)
}
/* La escena oscurece el escenario si alguien está en racha de 8 o más (como el fondo del ultra instinto). */
export function oscurece(g, ...heroes) {
  if (!heroes.some((h) => h && h.hd && h.hd.racha === 3)) return
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0)   // toda la escena, aunque esté temblando por un golpe
  g.fillStyle = 'rgba(20, 14, 40, 0.55)'; g.fillRect(0, 0, g.canvas.width, g.canvas.height)
  g.restore()
}

const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
const hash = (n) => { n = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b); n ^= n >>> 13; n = Math.imul(n, 0xc2b2ae35); return (n ^ (n >>> 16)) >>> 0 }
const rgb = (hex) => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)]
const pear = (r, g, b) => { const n = aPear36((Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b)); return [n >> 16, (n >> 8) & 255, n & 255] }
const KP = pear(...rgb(HDK))   // el contorno de lo lanzado, ya pasado a Pear36

const KI = ['#FFFFEB', '#FFE478', '#F2A65E'].map(rgb)   // ki dorado: luz, medio, sombra
const UI = ['#FFFFEB', '#66FFE3', '#4DA6FF', '#4B5BAB', '#473B78'].map(rgb)   // ultra instinto, de adentro hacia afuera
const ORO = ['#FFFFEB', '#FFE478', '#F2A65E', '#BA6156', '#8C3F5D'].map(rgb)
const C = { blanco: rgb('#FFFFEB'), amarillo: rgb('#FFE478'), naranjo: rgb('#F2A65E') }

/* Lienzos de trabajo (uno de cada uno, del tamaño de la escena). */
const lienzos = {}
function lienzo(nombre, w, h, pear36) {
  let l = lienzos[nombre]
  if (!l || l.c.width !== w || l.c.height !== h) {
    const c = document.createElement('canvas'); c.width = w; c.height = h
    const g = c.getContext('2d', { willReadFrequently: true })
    if (nombre === 'cuerpo') anotaDueno(g)
    l = lienzos[nombre] = { c, g: pear36 ? lienzoPear36(g) : g }
  }
  l.g.clearRect(0, 0, w, h)
  return l
}

/* Qué píxeles son del arma, en la misma pasada en que se dibuja el personaje: el lienzo del cuerpo anota quién
   pintó cada píxel (dueno: 1 = el arma). Lo que se pinta después encima (la mano que agarra el mango) le quita el
   píxel al arma. Dibujarlo dos veces (con y sin arma) para compararlo costaba lo mismo que dibujar otro personaje. */
let dueno = null, marcando = false
function anotaDueno(g) {
  const fillRect = CanvasRenderingContext2D.prototype.fillRect
  let m = null   // la transformación, guardada hasta que cambie (pedirla en cada píxel era lo más caro)
  for (const f of ['save', 'restore', 'translate', 'scale', 'rotate', 'transform', 'setTransform', 'resetTransform']) {
    const orig = CanvasRenderingContext2D.prototype[f]
    g[f] = function (...a) { m = null; return orig.apply(this, a) }
  }
  g.fillRect = function (x, y, w, h) {
    if (dueno) {
      if (!m) m = this.getTransform()
      const W = this.canvas.width, H = this.canvas.height
      const xa = m.a * x + m.c * y + m.e, ya = m.b * x + m.d * y + m.f, xb = m.a * (x + w) + m.c * (y + h) + m.e, yb = m.b * (x + w) + m.d * (y + h) + m.f
      const x0 = Math.max(0, Math.round(Math.min(xa, xb))), x1 = Math.min(W, Math.round(Math.max(xa, xb)))
      const y0 = Math.max(0, Math.round(Math.min(ya, yb))), y1 = Math.min(H, Math.round(Math.max(ya, yb)))
      const v = marcando ? 1 : 0
      for (let yy = y0; yy < y1; yy++) for (let xx = x0; xx < x1; xx++) dueno[yy * W + xx] = v
    }
    fillRect.call(this, x, y, w, h)
  }
}
const marcado = (fn) => fn && ((px, p) => { marcando = true; try { fn(px, p) } finally { marcando = false } })

/* El personaje sin su arma: solo para Malala al embestir, que lleva la escoba detrás del cuerpo (en atras, junto con
   sus gatas, así que no se puede anotar aparte): atras se dibuja como en guardia, que tiene las gatas pero no la escoba. */
const EMBISTE = ['impulso', 'golpe', 'choque', 'sigue']
function sinArma(c) {
  const s = { ...c, arma: undefined, armaDetras: undefined }
  if (c.id === 'malala' && c.atras) s.atras = (px, p) => c.atras(px, EMBISTE.includes(p.fase) ? { ...p, fase: 'guardia' } : p)
  return s
}

/* Dibuja al personaje (y lo que lanza) con su distintivo de racha; sin racha, igual que siempre. */
export function pintaPersonaje(g, c, p, x, y) {
  if (!c.racha || typeof document === 'undefined') {
    hdDibujar(g, x, y, c, p)
    if (c.proyectil) c.proyectil(g, x, y, p)
    return
  }
  const W = g.canvas.width, H = g.canvas.height, N = W * H, nivel = c.racha
  /* El reloj del aura es el de verdad, no el de la pose: hay escenas que dejan la pose quieta (Edith flotando
     mientras invoca la tormenta) y el aura se congelaba. */
  const t = reduce ? 0 : typeof performance !== 'undefined' ? performance.now() : p.t || 0
  const K = rgb((c.contorno || HDK).toUpperCase())
  const malalaEmbiste = c.id === 'malala' && EMBISTE.includes(p.fase)
  const A = lienzo('cuerpo', W, H, true)
  if (nivel < 3 && !malalaEmbiste) {
    dueno = new Uint8Array(N)
    try { hdDibujar(A.g, x, y, { ...c, arma: marcado(c.arma), armaDetras: marcado(c.armaDetras) }, p) } finally { marcando = false }
  } else hdDibujar(A.g, x, y, c, p)
  const delArma = dueno; dueno = null
  const P = lienzo('lanzado', W, H, true); if (c.proyectil) c.proyectil(P.g, x, y, p)
  const full = A.g.getImageData(0, 0, W, H), proj = P.g.getImageData(0, 0, W, H)
  const mProj = alfa(proj)
  let mCuerpo
  if (nivel < 3) {
    /* El arma se aclara y su contorno se vuelve dorado (así brilla aunque quede encima del cuerpo, como la daga
       izquierda de Uchis). Malala al embestir: los píxeles que cambian al dibujarla sin la escoba. */
    if (delArma) mCuerpo = delArma
    else {
      const B = lienzo('sinArma', W, H, true); hdDibujar(B.g, x, y, sinArma(c), p)
      const sin = B.g.getImageData(0, 0, W, H).data, a = full.data
      mCuerpo = new Uint8Array(N)
      for (let i = 0; i < N; i++) { const k = i * 4; if (a[k + 3] && (!sin[k + 3] || a[k] !== sin[k] || a[k + 1] !== sin[k + 1] || a[k + 2] !== sin[k + 2])) mCuerpo[i] = 1 }
    }
    brilla(full, mCuerpo, K, t); brilla(proj, mProj, KP, t)
  } else {
    mCuerpo = oro(full, K); oro(proj, KP)
  }
  destello(full.data, mCuerpo, t, K, W, H); destello(proj.data, mProj, t, KP, W, H)

  /* Todo se arma en memoria y se pega de una vez (pintar píxel a píxel en el lienzo era lo más lento). */
  const sCuerpo = alfa(full), sProj = alfa(proj, 60)   // el polvo casi transparente no lleva aura
  const todo = une(sCuerpo, sProj)
  const S = lienzo('sale', W, H, false), sale = S.g.createImageData(W, H), o = sale.data
  const pon = (x, y, [r, gg, b]) => { if (x < 0 || y < 0 || x >= W || y >= H) return; const k = (y * W + x) * 4; o[k] = r; o[k + 1] = gg; o[k + 2] = b; o[k + 3] = 255 }
  if (nivel >= 2) {
    if (nivel === 3) auraUltra(pon, sCuerpo, t, W, H); else auraKi(pon, sCuerpo, t, W, H)
    if (c.id !== 'xitin') anillo(pon, sProj, todo, nivel === 3 ? UI[1] : KI[1], W, H)   // el arañazo del oso, sin aura: si no, las rayas se vuelven un bloque
  }
  encima(o, full.data); encima(o, proj.data)
  if (nivel < 3) halo(pon, todo, mCuerpo, t, W, H)
  /* Sin arma (desarmado en un overtake, aplaudiendo) la racha de 3 sigue a la vista: chispitas sobre el cuerpo. */
  const brillan = une(mCuerpo, mProj), conArma = brillan.some((v) => v)
  chispas(pon, conArma ? brillan : sCuerpo, t, nivel < 3 && conArma ? 2 : 3, (c.id || '').length, W)
  S.g.putImageData(sale, 0, 0)
  g.drawImage(S.c, 0, 0)
}

/* Lo que dibuja la escena con la racha de quien lo lanza (la flecha de Janet, la tormenta de Edith, la onda de
   July, el arma que vuela al ser desarmado): se dibuja aparte con la misma transformación de la escena y se
   procesa como lo lanzado. Racha de 3: brilla; de 5: además 1 px de ki dorado; de 8: dorado con 1 px de ultra
   instinto. dibujar(g) recibe el lienzo donde dibujar.
   soloAura: conserva sus colores y solo lo rodea de 1 px de luz (el rayo de Edith: aclarado quedaba gris, y con más
   borde se veía muy grueso). Racha de 3: amarillo claro; de 5: dorado; de 8: ultra instinto. */
export function pintaEfecto(g, nivel, t, dibujar, { soloAura = false } = {}) {
  if (!nivel || typeof document === 'undefined') return dibujar(g)
  t = reduce ? 0 : t || 0
  const W = g.canvas.width, H = g.canvas.height
  const E = lienzo('efecto', W, H, true)
  E.g.save(); E.g.setTransform(g.getTransform()); E.g.globalAlpha = g.globalAlpha
  try { dibujar(E.g) } finally { E.g.restore() }
  const img = E.g.getImageData(0, 0, W, H), m = alfa(img)
  if (!soloAura) {
    if (nivel < 3) brilla(img, m, KP, t); else oro(img, KP)
    destello(img.data, m, t, KP, W, H)
  }
  const S = lienzo('saleEfecto', W, H, false), sale = S.g.createImageData(W, H), o = sale.data
  const pon = (x, y, [r, gg, b]) => { if (x < 0 || y < 0 || x >= W || y >= H) return; const k = (y * W + x) * 4; o[k] = r; o[k + 1] = gg; o[k + 2] = b; o[k + 3] = 255 }
  const s = alfa(img, 60)
  if (soloAura) anillo(pon, s, s, nivel === 3 ? UI[1] : nivel === 2 ? KI[1] : KI[0], W, H)
  else if (nivel >= 2) anillo(pon, s, s, nivel === 3 ? UI[1] : KI[1], W, H)
  encima(o, img.data)
  chispas(pon, m, t, nivel < 3 ? 1 : 2, 7, W)
  S.g.putImageData(sale, 0, 0)
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.drawImage(S.c, 0, 0); g.restore()
}

const alfa = (img, min = 1) => { const n = img.data.length / 4, m = new Uint8Array(n); for (let i = 0; i < n; i++) m[i] = img.data[i * 4 + 3] >= min ? 1 : 0; return m }
const une = (a, b) => { const m = new Uint8Array(a.length); for (let i = 0; i < a.length; i++) m[i] = a[i] | b[i]; return m }
const esK = (d, k, k3) => d[k] === k3[0] && d[k + 1] === k3[1] && d[k + 2] === k3[2]
const pinta = (d, i, [r, gg, b]) => { const k = i * 4; d[k] = r; d[k + 1] = gg; d[k + 2] = b; d[k + 3] = d[k + 3] || 255 }

/* El arma (racha de 3 y 5): cada color sube hacia la luz y el contorno se vuelve dorado y late. */
function brilla(img, m, k3, t) {
  const d = img.data, dorado = Math.floor(t / 300) % 2 ? C.amarillo : C.naranjo
  for (let i = 0; i < m.length; i++) {
    if (!m[i] || !d[i * 4 + 3]) continue
    const k = i * 4
    if (esK(d, k, k3)) pinta(d, i, dorado)
    else pinta(d, i, pear(d[k] + (255 - d[k]) * 0.5, d[k + 1] + (247 - d[k + 1]) * 0.5, d[k + 2] + (214 - d[k + 2]) * 0.5))
  }
}

/* Entero dorado (racha de 8), por luminosidad; el contorno y los detalles muy oscuros (ojos) quedan igual. */
function oro(img, k3) {
  const d = img.data, m = new Uint8Array(d.length / 4)
  for (let i = 0; i < m.length; i++) {
    const k = i * 4
    if (!d[k + 3]) continue
    m[i] = 1
    if (esK(d, k, k3)) continue
    const lum = (0.3 * d[k] + 0.59 * d[k + 1] + 0.11 * d[k + 2]) / 255
    if (lum < 0.18) continue
    pinta(d, i, ORO[lum > 0.86 ? 0 : lum > 0.62 ? 1 : lum > 0.44 ? 2 : lum > 0.3 ? 3 : 4])
  }
  return m
}

/* Pega una capa encima de otra (con su transparencia, como el humo o el polvo). */
function encima(o, d) {
  for (let k = 0; k < d.length; k += 4) {
    const a = d[k + 3]
    if (!a) continue
    if (a === 255 || !o[k + 3]) { o[k] = d[k]; o[k + 1] = d[k + 1]; o[k + 2] = d[k + 2]; o[k + 3] = a; continue }
    const f = a / 255, ao = o[k + 3] / 255, af = f + ao * (1 - f)
    for (let j = 0; j < 3; j++) o[k + j] = (d[k + j] * f + o[k + j] * ao * (1 - f)) / af
    o[k + 3] = af * 255
  }
}

/* El rectángulo que ocupa una máscara, con margen. */
function caja(m, W, H, margen) {
  let x0 = W, x1 = -1, y0 = H, y1 = -1
  for (let i = 0; i < m.length; i++) if (m[i]) { const x = i % W, y = (i / W) | 0; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y }
  if (x1 < 0) return null
  return { x0, x1, y0, y1, a: Math.max(0, x0 - margen), b: Math.min(W - 1, x1 + margen), c: Math.max(0, y0 - margen), d: Math.min(H - 1, y1 + margen) }
}

/* Destello: una franja diagonal clara que cruza la zona cada 1,2 s. */
function destello(d, m, t, K, W, H) {
  const r = caja(m, W, H, 0); if (!r) return
  const largo = (r.x1 - r.x0) + (r.y1 - r.y0) + 6, T = t % 1200
  if (T > 600) return
  const pos = Math.floor((T / 600) * largo) - 3
  for (let y = r.y0; y <= r.y1; y++) for (let x = r.x0; x <= r.x1; x++) {
    const i = y * W + x, k = i * 4
    if (!m[i] || (d[k] === K[0] && d[k + 1] === K[1] && d[k + 2] === K[2])) continue
    const s = (x - r.x0) + (r.y1 - y)
    if (s === pos || s === pos + 1) { d[k] = 255; d[k + 1] = 255; d[k + 2] = 235; d[k + 3] = d[k + 3] || 255 }
  }
}

/* Chispitas de 4 puntas sobre la zona; cada una dura 300 ms de cada medio segundo. */
function chispas(pon, m, t, n, semilla, W) {
  if (t % 500 > 300) return
  const pts = []; for (let i = 0; i < m.length; i++) if (m[i]) pts.push(i)
  if (!pts.length) return
  const tic = Math.floor(t / 500), largo = (t % 500) > 80 && (t % 500) < 220 ? 2 : 1
  for (let j = 0; j < n; j++) {
    const i = pts[hash(tic * 31 + j * 7 + semilla) % pts.length], x = i % W, y = (i / W) | 0
    for (let a = 1; a <= largo; a++) { pon(x - a, y, C.amarillo); pon(x + a, y, C.amarillo); pon(x, y - a, C.amarillo); pon(x, y + a, C.amarillo) }
    pon(x, y, C.blanco)
  }
}

/* Halo del arma: 1 px de luz por fuera, que late cada 300 ms. */
function halo(pon, lleno, m, t, W, H) {
  const r = caja(m, W, H, 1); if (!r) return
  const en = (x, y) => x >= 0 && y >= 0 && x < W && y < H && m[y * W + x]
  const col = Math.floor(t / 300) % 2 ? C.blanco : C.amarillo
  for (let y = r.c; y <= r.d; y++) for (let x = r.a; x <= r.b; x++) {
    if (lleno[y * W + x]) continue
    if (en(x + 1, y) || en(x - 1, y) || en(x, y + 1) || en(x, y - 1)) pon(x, y, col)
  }
}

/* Lo lanzado: solo 1 px de aura. */
function anillo(pon, s, todo, col, W, H) {
  const r = caja(s, W, H, 1); if (!r) return
  const en = (x, y) => x >= 0 && y >= 0 && x < W && y < H && s[y * W + x]
  for (let y = r.c; y <= r.d; y++) for (let x = r.a; x <= r.b; x++) {
    if (todo[y * W + x]) continue
    if (en(x + 1, y) || en(x - 1, y) || en(x, y + 1) || en(x, y - 1)) pon(x, y, col)
  }
}

/* Ki dorado (racha de 5): 1 px pegado al cuerpo y llamas bajas que suben, en cuadros de 100 ms. */
function auraKi(pon, s, t, W, H) {
  const r = caja(s, W, H, 6); if (!r) return
  const en = (x, y) => x >= 0 && y >= 0 && x < W && y < H && s[y * W + x]
  const q = Math.floor(t / 100)
  const alto = (x) => 2 + Math.round(1.5 * Math.sin(x * 1.1 + q * 0.9) + 1.5 * Math.sin(x * 0.5 - q * 0.6))
  for (let y = r.c; y <= r.d; y++) for (let x = r.a; x <= r.b; x++) {
    if (en(x, y)) continue
    if (en(x + 1, y) || en(x - 1, y) || en(x, y + 1) || en(x, y - 1) || en(x + 1, y + 1) || en(x - 1, y + 1) || en(x + 1, y - 1) || en(x - 1, y - 1)) { pon(x, y, KI[1]); continue }
    const h = alto(x)
    for (let k = 2; k <= h; k++) if (en(x, y + k)) { pon(x, y, k > h - 2 ? KI[2] : KI[1]); break }
  }
  /* Chispas que suben desde los pies. */
  for (let j = 0; j < 6; j++) {
    const ciclo = 900 + (j % 3) * 200, vuelta = Math.floor((t + j * 170) / ciclo), k = ((t + j * 170) % ciclo) / ciclo
    const x = r.x0 - 3 + (hash(vuelta * 13 + j) % (r.x1 - r.x0 + 7)), y = Math.round(r.y1 - k * (r.y1 - r.y0 + 10))
    pon(x, y, KI[0]); pon(x, y + 1, KI[1])
  }
}

/* Ultra instinto (racha de 8): núcleo blanco pegado al cuerpo que pasa a turquesa y azul con el borde irregular,
   llamas altas y deshilachadas con vetas blancas, y lucecitas que suben. Cuadros de 90 ms. */
function auraUltra(pon, s, t, W, H) {
  const r = caja(s, W, H, 12); if (!r) return
  const en = (x, y) => x >= 0 && y >= 0 && x < W && y < H && s[y * W + x]
  /* Distancia a la silueta (hasta 3), por capas, en vez de mirar 7 × 7 vecinos por píxel. */
  const dist = new Uint8Array(W * H).fill(9)
  for (let i = 0; i < W * H; i++) if (s[i]) dist[i] = 0
  for (let paso = 1; paso <= 3; paso++)
    for (let y = r.c; y <= r.d; y++) for (let x = r.a; x <= r.b; x++) {
      const i = y * W + x
      if (dist[i] <= paso) continue
      let cerca = false
      for (let dy = -1; dy <= 1 && !cerca; dy++) for (let dx = -1; dx <= 1; dx++) {
        const xx = x + dx, yy = y + dy
        if (xx >= 0 && yy >= 0 && xx < W && yy < H && dist[yy * W + xx] === paso - 1) { cerca = true; break }
      }
      if (cerca) dist[i] = paso
    }
  const q = Math.floor(t / 90)
  const alto = (x) => 8 + Math.round(3 * Math.sin(x * 0.8 + q * 0.7) + 2.5 * Math.sin(x * 0.33 - q * 0.45))
  const veta = (x) => hash(x * 17 + Math.floor(q / 3)) % 5 === 0
  for (let y = r.c; y <= r.d; y++) for (let x = r.a; x <= r.b; x++) {
    const cerca = dist[y * W + x]
    if (!cerca) continue
    let col = -1
    if (cerca <= 2) col = cerca - 1
    else if (cerca === 3 && hash(x * 31 + ((y + q) >> 1) * 57) % 2) col = 2
    const h = alto(x)
    let sube = 0
    for (let k = 2; k <= h; k++) if (en(x, y + k)) { sube = k; break }
    if (sube) {
      const f = sube / h
      const hueco = f > 0.45 && hash(x * 7 + ((y + q) >> 1) * 13) % 4 === 0   // llamas deshilachadas: huecos que suben
      if (!hueco) {
        const c2 = veta(x) && f < 0.75 ? 0 : f < 0.35 ? 1 : f < 0.7 ? 2 : f < 0.9 ? 3 : 4
        if (col < 0 || c2 < col) col = c2
      }
    }
    if (col >= 0) pon(x, y, UI[col])
  }
  for (let j = 0; j < 16; j++) {
    const ciclo = 1600 + (j % 4) * 300, vuelta = Math.floor((t + j * 210) / ciclo), k = ((t + j * 210) % ciclo) / ciclo
    const x = r.x0 - 8 + (hash(vuelta * 29 + j * 3) % (r.x1 - r.x0 + 17)), y = Math.round(r.y1 + 2 - k * (r.y1 - r.y0 + 18))
    if (en(x, y)) continue
    pon(x, y, j % 3 ? UI[1] : UI[0])
    if (j % 4 === 0) pon(x, y + 1, UI[2])
  }
}
