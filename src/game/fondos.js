/* ============================================================================
   ESCENARIOS DE LOS DUELOS (pixel art, 112 × 76, paleta Apollo de Lospec)
   ----------------------------------------------------------------------------
   Ocho escenarios, uno por tema musical: el duelo después de una pregunta se
   pelea en el escenario de la canción que sonó en esa pregunta (ver
   FONDO_POR_TEMA y escenarioDe). Todos pintados en código con las rampas de
   Apollo (los personajes van en Pear36). El suelo está en y = 57 (los pies en
   62) y el centro (x ≈ 42–70) queda para el foco de cada escena: barco, torre,
   castillo, volcán, puerta de la ciudad, fogata. Nada alto se planta delante
   de los personajes (parecería que lo pisan).

   Cada escenario se pinta una vez por cuadro de animación (1 o 4 cuadros, que
   cambian cada 300 ms) y se guarda; encima van sus detalles vivos (gaviotas,
   brasas, copos…), que se dibujan en cada cuadro.
   Previa de todos: previa-fondos.html (con npx vite).
   ========================================================================== */
import { ANSWERING_TRACKS, FINAL_TRACKS, answeringTrack, finalTrack } from '../host/sound.js'

const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c }
const W = 112, H = 76

/* ======================= COSTA =======================
   Inspirada en una ilustración de una bahía: cielo con nubes, cerro a la izquierda,
   barco al centro (en el hueco entre los dos héroes), arena donde pisan (suelo en y=62).
   f = cuadro de la animación (0..3): brillos del mar y espuma de las olas. */
function pintarCosta(f) {
  const c = mk(W, H), g = c.getContext('2d')
  let s = 11; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647
  const p = (x, y, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), 1, 1) }
  const HOR = 37

  // cielo, de azul intenso arriba a celeste en el horizonte (con tramado entre franjas)
  const CIELO = ['#3c5e8b', '#3c5e8b', '#4f8fba', '#4f8fba', '#73bed3', '#a4dddb']
  for (let y = 0; y < HOR; y++) {
    const k = (y / HOR) * CIELO.length, i = Math.floor(k), fr = k - i
    for (let x = 0; x < W; x++) p(x, y, CIELO[fr > 0.78 && (x + y) % 2 === 0 ? Math.min(i + 1, CIELO.length - 1) : i])
  }
  // nubes finas, en hilos
  for (let i = 0; i < 10; i++) {
    const x0 = rnd() * W * 0.75, y0 = 3 + rnd() * 15, L = 6 + rnd() * 14
    for (let k = 0; k < L; k++) p(x0 + k, y0 + Math.floor(k / 9), k > L * 0.25 && k < L * 0.75 ? '#ebede9' : '#a4dddb')
  }
  // nubes grandes a la derecha y nubecitas sobre el horizonte
  const nube = (cx, cy, r) => {
    for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r; x <= cx + r; x++) {
      if ((x - cx) ** 2 + ((y - cy) * 1.2) ** 2 > r * r || y >= HOR) continue
      const d = (y - cy) / r
      p(x, y, d < -0.2 ? '#ebede9' : d < 0.4 ? '#c7cfcc' : '#a8b5b2')
    }
  }
  ;[[104, 12, 9], [93, 17, 8], [111, 20, 8], [84, 24, 6], [99, 25, 7], [108, 29, 6], [76, 30, 4], [86, 31, 5], [33, 31, 3], [39, 30, 4], [45, 32, 3]].forEach(([x, y, r]) => nube(x, y, r))

  // cerro a la izquierda: cara en sombra, cara con sol y la cumbre verde
  const cresta = [[0, 18], [8, 13], [16, 10], [22, 11], [30, 20], [40, 29], [50, 35], [55, 37]]
  const alto = (x) => { for (let i = 1; i < cresta.length; i++) { const [x0, y0] = cresta[i - 1], [x1, y1] = cresta[i]; if (x <= x1) return y0 + (y1 - y0) * (x - x0) / (x1 - x0) } return HOR }
  for (let x = 0; x < 55; x++) {
    const ry = Math.round(alto(x))
    for (let y = ry; y < HOR; y++) {
      const sol = x > 17 || (x >= 15 && (x + y) % 2 === 0)
      let col = sol ? '#577277' : '#402751'
      if ((x * 5 + y * 2) % 9 === 0) col = sol ? '#394a50' : '#1e1d39'
      const verde = x < 33 ? 3 + (x % 3 === 0 ? 1 : 0) : 1
      if (y - ry < verde) col = y === ry ? '#75a743' : '#468232'
      if (y >= HOR - 2) col = (x + y) % 2 ? '#819796' : col
      p(x, y, col)
    }
  }

  // mar: más profundo lejos, turquesa cerca de la orilla
  const MAR = [[HOR, '#a4dddb'], [HOR + 1, '#253a5e'], [41, '#3c5e8b'], [46, '#4f8fba'], [50, '#73bed3'], [54, '#a4dddb']]
  for (let y = HOR; y < 58; y++) {
    let i = 0; while (i + 1 < MAR.length && MAR[i + 1][0] <= y) i++
    for (let x = 0; x < W; x++) p(x, y, MAR[i + 1] && MAR[i + 1][0] === y + 1 && (x + y) % 2 === 0 ? MAR[i + 1][1] : MAR[i][1])
  }
  for (let i = 0; i < 90; i++) {   // reflejos en el agua
    const x = rnd() * W, y = HOR + 2 + rnd() * 16, L = 2 + rnd() * 4
    for (let k = 0; k < L; k++) p(x + k, y, y < 46 ? '#4f8fba' : '#a4dddb')
  }
  for (let i = 0; i < 26; i++) {   // destellos que titilan
    const x = rnd() * W, y = HOR + 2 + rnd() * 15
    if ((i + f) % 3 === 0) { p(x, y, '#ebede9'); p(x - 1, y, '#a4dddb'); p(x + 1, y, '#a4dddb') }
  }

  // barco al centro, a lo lejos
  const casco = [[36, 50, 70, '#ad7757'], [37, 51, 69, '#7a4841'], [38, 52, 68, '#4d2b32'], [39, 54, 66, '#4d2b32']]
  casco.forEach(([y, a, b, col]) => { for (let x = a; x <= b; x++) p(x, y, col) })
  for (let x = 50; x <= 53; x++) { p(x, 34, '#7a4841'); p(x, 35, '#ad7757') }
  for (let k = 0; k < 6; k++) p(70 + k, 36 - Math.round(k * 0.6), '#4d2b32')
  for (let x = 53; x <= 67; x++) if ((x + f) % 4 === 0) p(x, 40, '#253a5e')
  const vela = (mx, y0, y1, w) => {
    for (let y = y0; y <= y1; y++) {
      const borde = y === y0 || y === y1
      for (let x = mx - w; x <= mx + w; x++) {
        if (borde && (x === mx - w || x === mx + w)) continue
        p(x + (borde ? 0 : 1), y, x <= mx - w + 1 ? '#c7cfcc' : x >= mx + w - 1 ? '#c7cfcc' : '#ebede9')
      }
    }
  }
  ;[[57, 18], [64, 21]].forEach(([mx, top]) => { for (let y = top; y <= 35; y++) p(mx, y, '#4d2b32') })
  vela(57, 19, 23, 3); vela(57, 25, 32, 4); vela(64, 23, 26, 2); vela(64, 28, 33, 3)
  for (let y = 24; y <= 35; y++) for (let x = 66; x <= 70; x++) if (x - 66 < (y - 24) * 0.42) p(x, y, '#ebede9')
  p(58, 18, '#cf573c'); p(59, 18, '#cf573c'); p(58, 17, '#cf573c')

  // rocas en el agua con espuma
  const roca = (x, y, w) => {
    for (let i = 0; i < w; i++) {
      const h = Math.round(Math.sin((i + 0.5) / w * Math.PI) * w * 0.45) + 1
      for (let k = 0; k < h; k++) p(x + i, y - k, k === h - 1 ? '#a8b5b2' : i < w / 2 ? '#819796' : '#577277')
    }
    for (let i = -1; i <= w; i++) p(x + i, y + 1, (i + f) % 3 ? '#ebede9' : '#a4dddb')
  }
  roca(24, 46, 7); roca(32, 47, 4); roca(80, 44, 4)

  // la arena donde pelean: orilla ondulada, arena mojada y seca
  const orilla = (x) => 57 + Math.round(Math.sin(x / 9) * 1.2 + Math.sin(x / 4 + 1) * 0.6)
  for (let x = 0; x < W; x++) {
    const o = orilla(x)
    for (let y = o; y < H; y++) {
      let col = y < o + 3 ? '#c09473' : y > 71 ? '#c09473' : '#d7b594'
      const r = rnd()
      if (r < 0.06) col = y < o + 3 ? '#ad7757' : '#c09473'
      else if (r < 0.1 && y >= o + 3) col = '#e7d5b3'
      p(x, y, col)
    }
  }
  // espuma de las olas (sube y baja)
  const sube = [0, -1, -1, 0][f]
  for (let x = 0; x < W; x++) {
    const o = orilla(x)
    if ((x + f * 3) % 11 !== 0) p(x, o - 1 + sube, '#ebede9')
    if (Math.sin(x / 3 + f * 1.6) > 0.2) p(x, o - 2 + sube, '#a4dddb')
    if (sube < 0 && x % 7 < 4) p(x, o, '#c7cfcc')
  }
  for (let x = 0; x < W; x++) if ((x + f * 2) % 9 < 3) p(x, 52, '#a4dddb')
  // conchitas y una estrella de mar
  for (let i = 0; i < 6; i++) { const x = 18 + rnd() * 80, y = 64 + rnd() * 10; p(x, y, '#df84a5'); p(x + 1, y, '#ebede9') }
  ;[[94, 68], [93, 67], [95, 67], [92, 69], [96, 69], [94, 67]].forEach(([x, y]) => p(x, y, '#cf573c'))

  // palmera colgando en la esquina de arriba
  for (let a = 0; a < 5; a++) {   // cada hoja: nervio curvo y foliolos colgando a ambos lados
    const an = Math.PI * (0.06 + a * 0.1), L = 18 + a * 2
    for (let k = 3; k < L; k++) {
      const x = -3 + Math.cos(an) * k, y = -3 + Math.sin(an) * k + k * k * 0.016, largo = Math.max(1, Math.round(4 * Math.sin((k / L) * Math.PI)))
      for (let j = 1; j <= largo; j++) { p(x - j * 0.4, y + j, j === largo ? '#25562e' : '#468232'); p(x + j * 0.7, y + j * 0.6, k > L - 5 ? '#a8ca58' : '#75a743') }
      p(x, y, '#25562e')
    }
  }
  // arbusto con flores en la esquina de abajo y pasto de duna a la derecha
  for (let y = 62; y < H; y++) for (let x = 0; x < 16; x++) {
    if ((x - 2) ** 2 + ((y - 76) * 1.1) ** 2 > 150) continue
    const r = rnd(); p(x, y, r < 0.25 ? '#468232' : r < 0.6 ? '#25562e' : '#19332d')
  }
  ;[[4, 66], [9, 70], [2, 71], [12, 73], [6, 74]].forEach(([x, y]) => { p(x, y, '#df84a5'); p(x - 1, y, '#a23e8c'); p(x + 1, y, '#a23e8c'); p(x, y - 1, '#a23e8c'); p(x, y + 1, '#a23e8c') })
  const mata = (bx, by, s) => { for (let b = 0; b < 5; b++) { const an = -Math.PI / 2 + s * (b * 0.3 - 0.6); for (let k = 0; k < 9 - b; k++) p(bx + Math.cos(an) * k, by + Math.sin(an) * k, b % 2 ? '#468232' : '#75a743') } }
  mata(108, 76, -1); mata(103, 76, -1)
  return c
}
/* Gaviotas que cruzan el cielo (se dibujan en cada cuadro, con los colores de la paleta). */
function gaviotas(g, t, col) {
  const s = t / 1000
  ;[0, 1, 2].forEach((i) => {
    const x = Math.round(W + 8 - ((s * (6 + i) + i * 47) % (W + 16))), y = Math.round(7 + i * 5 + Math.sin(s * 1.5 + i) * 1.5), arriba = Math.floor(s * 4 + i) % 2
    g.fillStyle = col('#ebede9'); g.fillRect(x - 1, y, 3, 1)
    g.fillStyle = col('#819796'); g.fillRect(x - 2, y + (arriba ? -1 : 1), 1, 1); g.fillRect(x + 2, y + (arriba ? -1 : 1), 1, 1)
  })
}

/* ======================= BOSQUE NUEVO =======================
   Pintado directo con las rampas de Apollo. Capas: neblina con troncos lejanos, arbustos,
   rayos de luz por el centro, árboles grandes a los lados, copas arriba, lianas, pasto con
   sendero, helechos y hongos al frente. El centro queda despejado para los golpes. */
const AP = {
  ve: ['#19332d', '#25562e', '#468232', '#75a743', '#a8ca58', '#d0da91'],
  ca: ['#4d2b32', '#7a4841', '#ad7757', '#c09473', '#d7b594', '#e7d5b3'],
  na: ['#341c27', '#602c2c', '#884b2b', '#be772b', '#de9e41', '#e8c170'],
  ro: ['#241527', '#411d31', '#752438', '#a53030', '#cf573c', '#da863e'],
  mo: ['#1e1d39', '#402751', '#7a367b', '#a23e8c', '#c65197', '#df84a5'],
  az: ['#172038', '#253a5e', '#3c5e8b', '#4f8fba', '#73bed3', '#a4dddb'],
  gr: ['#090a14', '#10141f', '#151d28', '#202e37', '#394a50', '#577277', '#819796', '#a8b5b2', '#c7cfcc', '#ebede9'],
}
const MAS_LUZ = {}, MAS_SOMBRA = {}
Object.values(AP).forEach((r) => r.forEach((c, i) => { MAS_LUZ[c] = r[Math.min(i + 1, r.length - 1)]; MAS_SOMBRA[c] = r[Math.max(i - 1, 0)] }))

function pintarBosqueNuevo() {
  const buf = new Array(W * H).fill(AP.gr[4])
  let s = 23; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647
  const p = (x, y, col) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && x < W && y >= 0 && y < H) buf[y * W + x] = col }
  const en = (x, y) => buf[Math.round(y) * W + Math.round(x)]
  const G = AP.gr, V = AP.ve, C = AP.ca
  const FONDO = 57

  // neblina del fondo: oscura arriba, más clara abajo (tramado entre franjas)
  const BANDAS = [[0, 2], [9, 3], [19, 4], [31, 5]]
  const neb = (x, y) => { let i = 0; while (i + 1 < BANDAS.length && BANDAS[i + 1][0] <= y) i++; const sig = BANDAS[i + 1]; return G[sig && sig[0] === y + 1 && (x + y) % 2 === 0 ? sig[1] : BANDAS[i][1]] }
  for (let y = 0; y < FONDO; y++) for (let x = 0; x < W; x++) p(x, y, neb(x, y))
  // árboles lejanos: troncos y copas un tono más oscuros que la neblina
  for (let i = 0; i < 11; i++) {
    const x0 = Math.round(rnd() * W), w = 2 + Math.round(rnd()), top = 4 + rnd() * 8
    for (let y = Math.round(top); y < FONDO; y++) for (let k = 0; k < w; k++) p(x0 + k + Math.round(Math.sin(y / 9 + i) * 0.6), y, MAS_SOMBRA[neb(x0, y)])
    for (let j = 0; j < 3; j++) { const cx = x0 + (rnd() - 0.5) * 10, cy = top + rnd() * 6, r = 3 + rnd() * 4; for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r; x <= cx + r; x++) if ((x - cx) ** 2 + ((y - cy) * 1.3) ** 2 <= r * r) p(x, y, MAS_SOMBRA[neb(x, y)]) }
  }
  // árboles del medio, más oscuros, con el borde de luz hacia el centro
  ;[[24, 5, 1], [86, 6, -1]].forEach(([x0, w, lado]) => {
    for (let y = 0; y < FONDO; y++) { const dx = Math.round(Math.sin(y / 7) * 0.8); for (let k = 0; k < w; k++) p(x0 + k + dx, y, (lado > 0 ? k === w - 1 : k === 0) ? G[4] : G[3]) }
  })
  // arbustos en la línea del fondo
  for (let x = 0; x < W; x++) {
    const h = 5 + Math.round(Math.sin(x / 5) * 2 + Math.sin(x / 2.3 + 1)), t = FONDO - h
    for (let y = t; y < FONDO; y++) p(x, y, y === t ? V[2] : rnd() < 0.2 ? V[0] : V[1])
  }
  // rayos de luz que entran en diagonal por el centro
  const rayos = [[64, 8], [76, 4], [57, 3]]
  for (let y = 0; y < FONDO; y++) for (let x = 0; x < W; x++) {
    for (const [x0, w] of rayos) {
      const a = x0 - y * 0.38
      if (x >= a && x < a + w) { const borde = x < a + 1 || x >= a + w - 1; if (!borde || (x + y) % 2 === 0) p(x, y, MAS_LUZ[en(x, y)]) }
    }
  }
  // árboles grandes a los lados (izquierda y derecha en espejo), con raíces hacia el centro
  const arbol = (izq) => {
    const X = (x) => (izq ? x : W - 1 - x)
    for (let y = 0; y < FONDO + 2; y++) {
      const cx = 4 + Math.round(Math.sin(y / 8) * 1.2), ancho = 8 + Math.max(0, y - 40) * 0.7
      for (let x = -3; x <= cx + ancho; x++) {
        const u = (x + 3) / (cx + ancho + 3)
        let col = u > 0.93 ? C[3] : u > 0.75 ? C[2] : u > 0.4 ? C[1] : C[0]
        if ((x * 7 + Math.floor(y / 3)) % 5 === 0 && u < 0.93) col = MAS_SOMBRA[col]
        if (u > 0.5 && rnd() < 0.08) col = rnd() < 0.5 ? V[2] : V[3]   // musgo
        p(X(x), y, col)
      }
    }
    for (let r = 0; r < 3; r++) {   // raíces
      const y0 = 46 + r * 4, L = 10 + r * 3
      for (let k = 0; k < L; k++) { const x = 10 + k + r * 2, y = y0 + k * (0.55 - r * 0.1); p(X(x), y, C[2]); p(X(x), y + 1, C[1]); p(X(x), y + 2, C[0]); if (k % 3 === 0) p(X(x), y - 1, V[3]) }
    }
    for (let k = 0; k < 40; k++) { const x = 6 + Math.round(Math.sin(k / 3) * 2), y = 6 + k; p(X(x), y, V[1]); if (k % 3 === 0) p(X(x + 1), y, V[3]) }   // hiedra
  }
  arbol(true); arbol(false)
  // copas: racimos de hojas arriba, más tupidos a los lados, con luz desde arriba
  for (let y = 0; y < 3; y++) for (let x = 46; x < 72; x++) p(x, y, (x + y) % 3 ? AP.az[5] : G[9])
  for (let i = 0; i < 22; i++) {
    const cx = rnd() * W, cy = rnd() * 9 - 1, r = 4 + rnd() * 5
    if (cx > 44 && cx < 72 && rnd() < 0.7) continue
    for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r; x <= cx + r; x++) {
      const d = (x - cx) ** 2 + ((y - cy) * 1.4) ** 2; if (d > r * r) continue
      const arriba = y < cy - r * 0.25, q = rnd()
      p(x, y, d > r * r * 0.8 && y > cy ? V[0] : arriba ? (q < 0.3 ? V[3] : q < 0.4 ? V[4] : V[2]) : q < 0.5 ? V[1] : q < 0.8 ? V[2] : V[0])
    }
  }
  // lianas colgando
  ;[8, 19, 31, 40, 78, 90, 99, 106].forEach((x, i) => {
    const L = 8 + ((i * 7) % 13)
    for (let k = 0; k < L; k++) { const px = x + Math.round(Math.sin(k / 4 + i) * 0.8), y = 6 + k; p(px, y, V[1]); if (k % 3 === 1) p(px + (k % 2 ? 1 : -1), y, V[3]) }
  })

  // suelo de pasto con una mancha de luz al centro y un sendero de tierra
  for (let y = FONDO; y < H; y++) for (let x = 0; x < W; x++) {
    const luz = ((x - 58) / 30) ** 2 + ((y - 64) / 7) ** 2 < 1, q = rnd()
    let col = y < FONDO + 2 ? V[1] : V[2]
    if (q < 0.12) col = V[1]; else if (q < 0.2) col = V[3]
    if (luz && (q > 0.55 || (x + y) % 2 === 0)) col = MAS_LUZ[col]
    p(x, y, col)
  }
  for (let y = FONDO + 1; y < H; y++) {
    const medio = (y - FONDO) * 1.1 + 2, cx = 56 + Math.round(Math.sin(y / 6) * 2)
    for (let x = Math.round(cx - medio); x <= Math.round(cx + medio); x++) {
      const borde = x === Math.round(cx - medio) || x === Math.round(cx + medio), q = rnd()
      p(x, y, borde ? C[1] : q < 0.1 ? C[4] : q < 0.3 ? C[3] : C[2])
    }
  }
  for (let x = 0; x < W; x += 2) { const h = 1 + Math.floor(rnd() * 3); for (let y = 0; y < h; y++) p(x, FONDO - y, V[3]) }
  // flores y hongos
  for (let i = 0; i < 10; i++) { const x = rnd() * W, y = FONDO + 3 + rnd() * 15; if (x > 40 && x < 72) continue; p(x, y, i % 2 ? AP.mo[5] : AP.na[5]); p(x, y + 1, V[1]) }
  const hongo = (x, y) => { p(x, y, C[4]); p(x, y - 1, C[4]); for (let k = -2; k <= 2; k++) p(x + k, y - 2, AP.ro[3]); for (let k = -1; k <= 1; k++) p(x + k, y - 3, AP.ro[4]); p(x - 1, y - 2, C[5]); p(x + 1, y - 3, C[5]) }
  hongo(19, 64); hongo(24, 66); hongo(94, 65)
  // helechos oscuros en las esquinas de adelante
  const helecho = (bx, by, sg) => { for (let b = 0; b < 6; b++) { const an = -Math.PI / 2 + sg * (b * 0.3 - 0.4); for (let k = 0; k < 15 - b; k++) { const x = bx + Math.cos(an) * k, y = by + Math.sin(an) * k + k * k * 0.02 * sg * (b - 2); p(x, y, V[0]); if (k % 2) { p(x + sg, y, V[1]); p(x - sg, y + 1, V[1]) } } } }
  helecho(2, 76, 1); helecho(110, 76, -1)

  const c = mk(W, H), g = c.getContext('2d'), d = g.createImageData(W, H)
  buf.forEach((col, i) => { const n = parseInt(col.slice(1), 16); d.data.set([n >> 16, (n >> 8) & 255, n & 255, 255], i * 4) })
  g.putImageData(d, 0, 0); return c
}
/* ======================= PRADERA =======================
   Trigal dorado con montañas y pinos al fondo, cielo nublado que se entibia hacia la derecha
   (donde está el sol). Pintada directo con Apollo. f = cuadro (0..3): el pasto se mece y una
   ola de luz recorre el campo. */
function pintarPradera(f) {
  const buf = new Array(W * H).fill(AP.gr[6])
  let s = 31; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647
  const p = (x, y, col) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && x < W && y >= 0 && y < H) buf[y * W + x] = col }
  const en = (x, y) => buf[Math.round(y) * W + Math.round(x)]
  const G = AP.gr, V = AP.ve, C = AP.ca, N = AP.na
  const HOR = 40, PISO = 57

  // cielo nublado: gris azulado arriba a la izquierda, claro y tibio hacia el sol (abajo a la derecha)
  const CIELO = [G[4], G[5], G[6], G[7], G[8], C[5], N[5]]
  for (let y = 0; y < HOR; y++) for (let x = 0; x < W; x++) {
    const n = Math.sin(x / 9 + y / 4) * 0.6 + Math.sin(x / 17 - y / 6) * 0.4 + Math.sin(x / 5 + y / 2.5) * 0.15
    let t = 0.2 + (y / HOR) * 0.45 + (x / W) * 0.3 + n * 0.16
    if (x > 70 && y > 18) t += ((x - 70) / 42) * ((y - 18) / 22) * 0.35   // brillo del sol
    t = Math.max(0, Math.min(0.999, t)) * CIELO.length
    const i = Math.floor(t), fr = t - i
    p(x, y, CIELO[fr > 0.6 && (x + y) % 2 === 0 ? Math.min(i + 1, CIELO.length - 1) : i])
    if (n > 0.75 && y < 28) p(x, y, MAS_LUZ[en(x, y)])   // bordes de luz en las nubes
  }

  // montañas: primero las lejanas (en la bruma), después las grandes. La cara derecha recibe el sol.
  const monte = (px, py, mitad, sombra, medio, luz) => {
    for (let x = Math.round(px - mitad); x <= px + mitad; x++) {
      const rugoso = Math.round(Math.sin(x * 1.7) * 0.6 + Math.sin(x / 3) * 0.8)
      const top = py + Math.abs(x - px) * ((HOR - py) / mitad) + rugoso
      for (let y = Math.max(0, Math.round(top)); y < HOR; y++) {
        let col = x > px + 1 ? luz : x > px - 2 ? medio : sombra
        if (x > px + 3 && (x - px + y) % 11 === 0) col = medio   // pliegues
        if (x < px - 3 && (px - x + y * 2) % 13 === 0) col = MAS_SOMBRA[sombra]
        if (y > HOR - 4 && (x + y) % 2 === 0) col = G[6]   // bruma al pie
        p(x, y, col)
      }
    }
  }
  monte(58, 29, 26, G[6], G[7], C[3]); monte(110, 28, 14, G[6], G[7], C[3])
  monte(22, 18, 24, C[1], C[2], C[3]); monte(72, 17, 22, C[1], C[2], C[3]); monte(80, 20, 16, C[1], C[2], C[3]); monte(96, 22, 20, C[1], C[2], C[3])

  // pinos oscuros a la izquierda
  const pino = (bx, h) => {
    for (let k = 0; k < h; k++) {
      const y = HOR - h + k, w = Math.round(k * 0.38) + (k % 3 === 2 ? 1 : 0)
      for (let x = -w; x <= w; x++) p(bx + x, y, x > 0 ? (x === w && k % 3 === 1 ? V[2] : V[1]) : V[0])
    }
  }
  for (let x = 0; x < 30; x += 3) pino(x + Math.round(rnd() * 2), 6 + Math.round(rnd() * 5))
  for (let x = 32; x < 46; x += 4) pino(x, 4 + Math.round(rnd() * 3))

  // el trigal: fino y claro a lo lejos, matas grandes adelante
  for (let y = HOR; y < H; y++) for (let x = 0; x < W; x++) {
    const lejos = y < 47, q = rnd()
    let col = lejos ? N[5] : y < 58 ? N[5] : N[4]
    if (q < 0.1) col = lejos ? C[5] : MAS_LUZ[col]; else if (q < 0.18) col = MAS_SOMBRA[col]
    if (y === HOR) col = (x + f) % 3 ? C[4] : N[5]
    p(x, y, col)
  }
  for (let i = 0; i < 160; i++) {   // trazos horizontales del campo lejano y del medio
    const y = HOR + 1 + Math.floor(rnd() * 16), x = rnd() * W, L = 2 + rnd() * (y < 47 ? 5 : 3)
    for (let k = 0; k < L; k++) p(x + k, y, y < 47 ? (i % 2 ? C[5] : N[4]) : (i % 2 ? C[5] : N[4]))
  }
  // ola de luz que recorre el campo con el viento
  for (let y = HOR + 2; y < 62; y++) for (let x = 0; x < W; x++) {
    const m = (((x - y * 0.6 - f * 9) % 44) + 44) % 44
    if (m < 5 && (m > 0 && m < 4 || (x + y) % 2 === 0)) p(x, y, MAS_LUZ[en(x, y)])
  }
  // sendero de tierra que serpentea desde el fondo hacia adelante
  const senda = (y) => 36 + (y - HOR) * 0.3 + Math.sin(y / 5) * 2, anchoS = (y) => 0.6 + (y - HOR) * 0.2
  for (let y = HOR + 1; y < H; y++) {
    const cx = senda(y), w = anchoS(y)
    const a = Math.round(cx - w), b = Math.round(cx + w)
    for (let x = a; x <= b; x++) { const q = rnd(); p(x, y, x === a || x === b ? C[1] : q < 0.15 ? C[3] : q < 0.25 ? C[1] : C[2]) }
  }
  // espiga de trigo: tallo que se inclina con el viento y una espiga con granos y bigotes arriba
  const espiga = (x, base, h, lejos) => {
    const viento = (0.6 + Math.sin(f * Math.PI / 2 + x / 7) * 0.6) * (h / 12)
    let tx = x, ty = base - h
    for (let k = 0; k < h; k++) {
      const u = k / h, bx = Math.round(x + viento * u * u * 2.2)
      p(bx, base - k, u < 0.4 ? N[3] : lejos ? N[5] : N[4])
      tx = bx; ty = base - k
    }
    const largo = h > 9 ? 3 : 2
    for (let k = 0; k < largo; k++) { p(tx, ty - k, k % 2 ? N[3] : lejos ? C[5] : N[5]); p(tx + 1, ty - k, lejos ? N[5] : C[5]) }
    if (h > 6) p(tx + 1 + Math.round(viento), ty - largo, C[5])   // bigote
  }
  // muro de trigo plantado DETRÁS de los que pelean: crece hacia adelante y el sendero lo corta
  for (let y = 46; y <= PISO; y++) {
    const h = Math.round(2 + (y - 46) * 1.15), paso = y < 51 ? 2 : 3
    for (let x = (y % 2) * 1.5 - 2; x < W + 2; x += paso) {
      const xx = Math.round(x + Math.sin(y * 3.1 + x) * 0.8)
      if (Math.abs(xx - senda(y)) < anchoS(y) + 0.5) continue
      espiga(xx, y, h + ((xx * 7 + y) % 3) - 1, y < 50)
    }
  }
  // donde pisan: trigo bajo y aplastado
  for (let i = 0; i < 70; i++) {
    const y = PISO + 2 + rnd() * 19, x = rnd() * W
    if (Math.abs(x - senda(y)) < anchoS(y) + 1) continue
    for (let b = -1; b <= 1; b++) for (let k = 0; k < 3; k++) p(x + b + Math.round(k * 0.5), y - k, k === 2 ? N[5] : N[4])
  }
  // matas altas solo en las esquinas de adelante (donde no hay personajes)
  ;[[2, 76, 15], [6, 76, 12], [10, 76, 9], [0, 72, 11], [109, 76, 15], [105, 76, 12], [101, 76, 9], [111, 72, 11]].forEach(([x, y, h]) => espiga(x, y, h, false))
  const c = mk(W, H), g = c.getContext('2d'), d = g.createImageData(W, H)
  buf.forEach((col, i) => { const n = parseInt(col.slice(1), 16); d.data.set([n >> 16, (n >> 8) & 255, n & 255, 255], i * 4) })
  g.putImageData(d, 0, 0); return c
}
/* ======================= VOLCÁN =======================
   Volcán en erupción al centro (en el hueco entre los héroes): cráter encendido, penacho de fuego
   y ríos de lava que bajan por la ladera. Cielo de humo rojo, agujas de roca en silueta, un río
   de lava detrás de los que pelean y una cascada de lava en la roca de la derecha. Suelo de roca
   volcánica oscura con grietas encendidas. Pintado con Apollo.
   f = cuadro (0..3): la lava corre, el cráter late y el penacho cambia. */
function pintarVolcan(f) {
  const buf = new Array(W * H).fill(AP.ro[1])
  const p = (x, y, col) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && x < W && y >= 0 && y < H) buf[y * W + x] = col }
  const en = (x, y) => buf[Math.round(y) * W + Math.round(x)]
  const R = AP.ro, N = AP.na, G = AP.gr, C = AP.ca
  const PISO = 57, PX = 56, PY = 13, RIO = 51
  const lava = (x, y, borde) => p(x, y, borde ? R[4] : (x + y * 2 + f * 3) % 7 === 0 ? AP.ca[5] : (x * 3 + y + f) % 4 === 0 ? N[4] : N[5])

  // cielo de humo: casi negro arriba, rojo hacia el horizonte, con volutas más claras y más oscuras
  const CIELO = [R[0], R[1], R[2], R[3], R[4]]
  for (let y = 0; y < 46; y++) for (let x = 0; x < W; x++) {
    const n = Math.sin(x / 8 + Math.sin(y / 3 + x / 20) * 1.6 + y / 5) * 0.6 + Math.sin(x / 15 - y / 4) * 0.4
    let t = (y / 46) * 0.7 + n * 0.14 + Math.max(0, 1 - Math.hypot(x - PX, (y - PY) * 1.1) / 40) * 0.4 - 0.08
    t = Math.max(0, Math.min(0.999, t)) * CIELO.length
    const i = Math.floor(t)
    p(x, y, CIELO[t - i > 0.7 && (x + y) % 2 === 0 ? Math.min(i + 1, CIELO.length - 1) : i])
  }
  // agujas de roca lejanas en silueta, con el filo rojo
  for (let i = 0; i < 22; i++) {
    const cx = (i * 47) % W + (i % 3), h = 5 + ((i * 13) % 9), base = 47, w = 1.5 + (i % 3) * 0.6
    for (let k = 0; k < h; k++) { const ww = Math.round(w * (k / h) + 0.4); for (let dx = -ww; dx <= ww; dx++) p(cx + dx, base - h + k, dx === -ww ? R[2] : R[0]) }
  }

  // el volcán: ladera izquierda tibia, derecha oscura, con surcos que bajan desde el cráter
  for (let y = PY; y < 49; y++) {
    const m = 3 + (y - PY) * 1.25 + (y > 40 ? (y - 40) * 1.4 : 0)
    for (let x = Math.round(PX - m); x <= Math.round(PX + m); x++) {
      const u = (x - PX) / (y - PY + 3), fr = ((u * 3 + Math.sin(y / 2.5) * 0.1) % 1 + 1) % 1
      let col = x < PX ? (fr < 0.25 ? N[0] : fr < 0.5 ? N[1] : R[1]) : (fr < 0.3 ? G[2] : R[0])
      if (x === Math.round(PX - m)) col = R[2]   // filo iluminado por el cielo
      p(x, y, col)
    }
  }
  // ríos de lava por la ladera (se ensanchan al bajar)
  const surcos = [[-1, -0.55, 0.9], [1, 0.45, 1.3], [0, 0.05, 2.1]]
  surcos.forEach(([dx0, pend, fase]) => {
    for (let y = PY + 1; y < 50; y++) {
      const x = PX + dx0 + (y - PY) * pend + Math.sin(y / 3 + fase) * 1.4, w = y > 32 ? 1 : 0
      for (let k = -w; k <= w; k++) lava(x + k, y, k !== 0 && w > 0)
      if ((x + y) % 2 === 0) p(x + w + 1, y, R[2])   // brillo alrededor
    }
  })
  // cráter encendido y su halo
  for (let y = PY - 6; y < PY + 6; y++) for (let x = PX - 9; x <= PX + 9; x++) {
    const d = Math.hypot(x - PX, (y - PY) * 1.4)
    if (d < 9 && d > 4 && (x + y) % 2 === 0 && en(x, y) !== N[5]) p(x, y, MAS_LUZ[en(x, y)] ?? en(x, y))
  }
  for (let x = PX - 4; x <= PX + 4; x++) { p(x, PY, Math.abs(x - PX) < 2 ? C[5] : N[5]); p(x, PY + 1, N[4]) }
  // penacho de fuego que sube del cráter
  const lenguas = [[0, 12], [-1, 10], [1, 11], [-2, 7], [2, 8], [-3, 5], [3, 5]]
  lenguas.forEach(([dx, h], i) => {
    const alto = h + [0, 1, 2, 1][(f + i) % 4]
    for (let k = 1; k <= alto; k++) {
      const x = PX + dx + Math.round(Math.sin(k / 2 + f + i) * 0.8 * (k / alto)), u = k / alto
      p(x, PY - k, u < 0.35 ? C[5] : u < 0.6 ? N[5] : u < 0.85 ? R[5] : R[4])
      if (dx === 0 && u < 0.5) { p(x - 1, PY - k, N[4]); p(x + 1, PY - k, N[4]) }
    }
  })

  // río de lava que cruza detrás de los que pelean, con el suelo enrojecido a su alrededor
  for (let y = 46; y < PISO + 1; y++) for (let x = 0; x < W; x++) {
    const c = RIO + Math.sin(x / 9) * 1.6 + Math.sin(x / 4 + 1) * 0.5, d = Math.abs(y - c)
    if (y >= 48) p(x, y, d < 4.5 ? R[1] : (x + y) % 2 === 0 ? R[0] : G[2])
    if (d < 4.5 && d >= 2.2 && (x + y) % 2 === 0) p(x, y, R[2])
    if (d < 2.2) lava(x, y, d > 1.4)
  }
  // el suelo: roca volcánica con manchas grandes (sin ladrillos) y grietas encendidas que se ramifican
  for (let y = PISO; y < H; y++) for (let x = 0; x < W; x++) {
    const n = Math.sin(x / 7 + y / 3) + Math.sin(x / 17 - y / 5) * 0.8
    p(x, y, n > 0.9 ? G[3] : n < -1 ? G[1] : y < PISO + 3 ? R[0] : G[2])
  }
  for (let x = 0; x < W; x++) p(x, PISO, R[1])
  let semilla = 5; const azar = () => (semilla = (semilla * 16807) % 2147483647) / 2147483647
  const grieta = (x, y, pasos, dir) => {
    for (let k = 0; k < pasos; k++) {
      lava(x, y, false); p(x, y - 1, (x + y) % 2 ? R[2] : en(x, y - 1)); p(x + 1, y, R[1])
      if (azar() < 0.55) y += 1; else x += dir
      if (azar() < 0.15) x -= dir
      if (k > 4 && azar() < 0.08) grieta(x, y, Math.round(pasos / 3), -dir)   // rama
    }
  }
  grieta(34, PISO + 1, 20, -1); grieta(48, PISO + 1, 18, 1); grieta(70, PISO + 1, 20, 1); grieta(60, PISO + 6, 14, -1)
  // roca alta a la izquierda y farallón con cascada de lava a la derecha
  for (let y = 18; y < PISO + 4; y++) {
    const borde = Math.round(9 - Math.max(0, 26 - y) * 0.5 + Math.sin(y / 3) * 1.2)
    for (let x = 0; x <= borde; x++) p(x, y, x >= borde - 1 ? R[2] : (x + Math.floor(y / 3)) % 4 === 0 ? G[1] : G[2])
  }
  for (let y = 26; y < PISO + 6; y++) {
    const borde = Math.round(W - 14 + Math.sin(y / 4) * 1.5 - (y > 45 ? (y - 45) * 0.2 : 0))
    for (let x = borde; x < W; x++) p(x, y, x <= borde + 1 ? R[3] : (x + Math.floor(y / 3)) % 5 === 0 ? G[1] : G[2])
  }
  for (let x = W - 16; x < W; x++) p(x, 26 + Math.round(Math.abs(Math.sin(x)) * 1), R[2])
  for (let y = 27; y < PISO + 2; y++) for (let x = W - 8; x < W - 5; x++) lava(x, y + ((y + f * 2) % 3 === 0 ? 0 : 0), x === W - 8 || (y * 2 + f * 3 + x) % 9 === 0)   // la cascada
  for (let y = PISO; y < PISO + 5; y++) for (let x = W - 13; x < W; x++) { const d = Math.hypot(x - (W - 6.5), (y - PISO - 2) * 2); if (d < 6) lava(x, y, d > 4) }   // poza

  const c = mk(W, H), g = c.getContext('2d'), d = g.createImageData(W, H)
  buf.forEach((col, i) => { const n = parseInt(col.slice(1), 16); d.data.set([n >> 16, (n >> 8) & 255, n & 255, 255], i * 4) })
  g.putImageData(d, 0, 0); return c
}
/* Brasas que suben del cráter y del río, y ceniza que cae. */
function volcanVivo(g, t, col) {
  const s = t / 1000
  for (let i = 0; i < 16; i++) {
    const desdeRio = i % 2 === 1, k = (s * (0.3 + (i % 4) * 0.05) + i / 16) % 1
    const x = Math.round((desdeRio ? (i * 23) % W : 56 + Math.sin(i * 2.1) * 8 * k) + Math.sin(s * 2 + i) * 2), y = Math.round((desdeRio ? 50 : 10) - k * (desdeRio ? 30 : 12))
    if (k < 0.8) { g.fillStyle = col(k < 0.4 ? '#e8c170' : '#cf573c'); g.fillRect(x, y, 1, 1) }
  }
  for (let i = 0; i < 10; i++) {
    const x = Math.round(((i * 41.3 + s * 3) % (W + 4)) - 2), y = Math.round((i * 17.7 + s * (4 + (i % 3))) % 50)
    g.fillStyle = col('#394a50'); g.fillRect(x, y, 1, 1)
  }
}

/* ======================= DESIERTO =======================
   Boca de un cañón de roca rojiza (paredes a los lados y un arco arriba, con el borde que mira
   al sol en naranjo). Al fondo, en la bruma cálida, la puerta de una ciudad con cúpulas, justo
   en el hueco entre los héroes. Dunas con ondas, una aguja de roca y un bloque tallado al frente.
   Pintada con Apollo. f = cuadro (0..3): polvo que se mueve sobre las dunas. */
function pintarDesierto(f) {
  const buf = new Array(W * H).fill(AP.ca[5])
  const p = (x, y, col) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && x < W && y >= 0 && y < H) buf[y * W + x] = col }
  const en = (x, y) => buf[Math.round(y) * W + Math.round(x)]
  const rect = (x, y, w, h, col) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) p(x + i, y + j, col) }
  const C = AP.ca, N = AP.na, R = AP.ro, G = AP.gr, V = AP.ve
  const PISO = 57, SOLX = 70, SOLY = 22

  // cielo de bruma cálida: arena arriba, casi blanco alrededor del sol
  for (let y = 0; y < 48; y++) for (let x = 0; x < W; x++) {
    const d = Math.hypot(x - SOLX, (y - SOLY) * 1.4)
    let t = d < 10 ? 0 : d < 20 ? 1 : d < 34 ? 2 : 3
    if ((x + y) % 2 === 0 && [10, 20, 34].some((r) => Math.abs(d - r) < 1.5)) t = Math.max(0, t - 1)
    p(x, y, [G[9], C[5], N[5], C[4]][t])
  }

  // la ciudad lejana, pálida por la bruma: muralla, puerta, torres con cúpulas
  const cupula = (cx, cy, r) => {
    for (let y = cy - r * 1.5; y <= cy; y++) for (let x = cx - r; x <= cx + r; x++) {
      const k = (cy - y) / (r * 1.5), w = r * Math.sin(Math.acos(Math.min(1, Math.max(-1, k * 1.25 - 0.25)))) * (1 - k * 0.55)
      if (Math.abs(x - cx) <= w) p(x, y, x > cx ? C[4] : C[3])
    }
    p(cx, cy - r * 1.5 - 1, C[3]); p(cx, cy - r * 1.5 - 2, C[3])
  }
  const torre = (x0, w, top) => { for (let y = top; y < 46; y++) for (let x = x0; x < x0 + w; x++) p(x, y, x === x0 ? C[2] : x > x0 + w / 2 ? C[4] : C[3]) }
  torre(34, 6, 30); torre(40, 4, 26); torre(72, 7, 29); torre(79, 4, 32)
  cupula(37, 30, 3); cupula(42, 26, 2); cupula(75.5, 29, 3)
  for (let y = 33; y < 46; y++) for (let x = 30; x < 86; x++) p(x, y, (y - 33) % 4 === 0 || (x + Math.floor((y - 33) / 4) * 3) % 7 === 0 ? C[3] : C[4])   // muralla
  torre(48, 5, 24); torre(60, 5, 24)
  for (let x = 48; x < 65; x += 2) p(x, 32, C[3])
  ;[[48, 23], [52, 23], [60, 23], [64, 23]].forEach(([x, y]) => { p(x, y, C[4]); p(x, y - 1, C[4]); p(x, y - 2, C[3]) })   // remates en punta
  cupula(50.5, 23, 2); cupula(62.5, 23, 2); cupula(56.5, 31, 3)
  for (let y = 35; y < 46; y++) for (let x = 53; x < 61; x++) if (y > 38 || (x - 56.5) ** 2 + ((y - 38.5) * 1.2) ** 2 <= 13) p(x, y, x < 55 ? C[1] : C[2])   // la puerta
  ;[[50, 30], [62, 30], [50, 37], [62, 37]].forEach(([x, y]) => { p(x, y, C[2]); p(x, y + 1, C[2]); p(x + 1, y, C[2]); p(x + 1, y + 1, C[2]) })   // relieves de las pilastras
  // palmeras frente a la muralla
  const palmera = (x, base, h) => {
    for (let k = 0; k < h; k++) p(x + Math.round(k * 0.12), base - k, C[2])
    const tx = x + Math.round(h * 0.12), ty = base - h
    ;[[-1, 0.4], [1, 0.4], [-1, 1.2], [1, 1.2], [0, -1]].forEach(([lado, caida]) => { for (let k = 1; k < 5; k++) p(tx + lado * k, ty + Math.round(k * k * 0.12 * caida) - (lado === 0 ? k : 0), k > 2 ? V[3] : V[2]) })
  }
  palmera(45, 46, 9); palmera(68, 46, 8); palmera(83, 46, 6)

  // dunas: la cara que mira al sol (derecha) clara, la otra en sombra, con polvo que se mueve
  const duna = (base, amp, frec, fase, luz, medio, sombra) => {
    const alto = (x) => base - amp * (0.5 + 0.5 * Math.sin(x / frec + fase)) - Math.sin(x / (frec * 0.43) + fase * 2) * amp * 0.25
    for (let x = 0; x < W; x++) {
      const top = Math.round(alto(x)), sube = alto(x + 1) < alto(x)
      for (let y = top; y < H; y++) p(x, y, y === top ? luz : sube ? medio : (y - top < 3 ? sombra : medio))
    }
  }
  duna(48, 5, 9, 1.0, C[5], C[4], C[3])
  duna(54, 6, 13, 3.2, C[4], C[3], C[2])
  for (let y = 44; y < 56; y++) for (let x = 0; x < W; x++) {   // polvo
    const m = (((x + y * 0.8 - f * 7) % 36) + 36) % 36
    if (m < 4 && (x + y) % 2 === 0) p(x, y, MAS_LUZ[en(x, y)] ?? en(x, y))
  }
  // el suelo donde pelean: arena con ondas del viento
  for (let y = PISO; y < H; y++) for (let x = 0; x < W; x++) {
    const r = ((y * 1.3 + Math.sin(x / 6 + y) * 1.4) % 4 + 4) % 4
    p(x, y, r < 0.45 && y > PISO + 2 ? C[2] : y < PISO + 4 ? C[4] : C[3])
  }
  for (let x = 0; x < W; x++) { const top = Math.round(PISO - 1 + Math.sin(x / 8) * 1); for (let y = top; y < PISO; y++) p(x, y, C[4]) }

  // aguja de roca tallada por el viento, detrás del héroe de la izquierda
  for (let y = 26; y < PISO; y++) {
    const k = (y - 26) / (PISO - 26), cx = 30 - k * 5 + Math.sin(y / 4) * 0.6, w = 1 + k * 5
    for (let x = Math.round(cx - w); x <= Math.round(cx + w); x++) {
      const lado = x >= cx + w - 1.5
      let col = lado ? N[3] : x > cx ? C[2] : C[1]
      if (!lado && (y + Math.floor(x / 2)) % 5 === 0) col = C[0]   // vetas
      p(x, y, col)
    }
  }
  for (let x = 18; x < 40; x++) { const h = Math.round(Math.max(0, 3 - Math.abs(x - 27) * 0.25)); for (let k = 0; k < h; k++) p(x, PISO - k, k === h - 1 ? C[5] : C[4]) }   // arena acumulada

  // paredes del cañón: masas de roca oscura con pocas capas, y el filo que mira al sol en naranjo
  const pared = (izq) => {
    const X = (x) => (izq ? x : W - 1 - x)
    for (let y = 0; y < H; y++) {
      const borde = 15 + Math.round(Math.sin(y / 7) * 2.5 + Math.sin(y / 2.6 + 1) * 1) - (y > 50 ? Math.round((y - 50) * 0.3) : 0) + (izq ? 0 : -2)
      for (let x = -1; x < borde; x++) {
        const veta = Math.floor(y + x * 0.4 + Math.sin(x / 3) * 1.5)
        let col = veta % 8 === 0 ? C[1] : veta % 8 === 1 ? R[1] : x < borde * 0.5 ? R[1] : C[0]
        if (x >= borde - 2) col = (y + x) % 5 === 0 ? N[3] : N[4]
        else if (x >= borde - 4) col = N[2]
        else if (x >= borde - 7 && veta % 8 > 3) col = C[1]
        p(X(x), y, col)
      }
    }
  }
  pared(true); pared(false)
  // losa de roca que cuelga arriba como un arco, con la panza iluminada por el reflejo de la arena
  for (let x = 0; x < 80; x++) {
    const abajo = Math.round(11 - x * 0.12 + Math.sin(x / 5) * 1.2 + Math.sin(x / 2.1) * 0.5)
    if (abajo < 1) continue
    for (let y = 0; y <= abajo; y++) {
      const veta = Math.floor(y * 1.4 + x * 0.15)
      let col = y === abajo ? N[3] : y === abajo - 1 ? N[2] : veta % 6 === 0 ? C[1] : y < 2 ? R[1] : C[0]
      p(x, y, col)
    }
  }
  // sombra de las paredes sobre la arena
  for (let y = PISO; y < H; y++) for (let x = 0; x < W; x++) {
    const sombraIzq = x < 22 + (y - PISO) * 0.3 && (x > 12 || y > 66), sombraDer = x > W - 24 - (y - PISO) * 0.2
    if ((sombraIzq || sombraDer) && (en(x, y) === C[3] || en(x, y) === C[4] || en(x, y) === C[2])) p(x, y, MAS_SOMBRA[en(x, y)])
  }

  // columna rota de pie (estrías, la punta quebrada) y un trozo caído medio enterrado
  const quiebre = [0, 2, 1, 3, 1, 0, 2]
  for (let x = 5; x < 12; x++) {
    const top = 59 + quiebre[x - 5]
    for (let y = top; y < 72; y++) {
      const u = x - 5
      let col = u === 0 ? C[2] : u === 6 ? C[2] : u % 2 === 1 ? C[3] : u < 3 ? C[5] : C[4]   // estrías verticales
      if (y === top) col = C[5]
      p(x, y, col)
    }
  }
  for (let x = 3; x < 14; x++) { p(x, 72, C[4]); p(x, 73, C[2]) }   // la base
  for (let x = 4; x < 13; x++) p(x, 71, C[3])
  for (let y = 66; y < 72; y++) for (let x = 14; x < 22; x++) {    // tambor caído: cilindro acostado
    const cara = x < 17, dy = y - 69, dx = x - 15.5
    if (cara && dx * dx + dy * dy * 1.2 > 7) continue
    p(x, y, cara ? (dx * dx + dy * dy < 2.5 ? C[4] : C[3]) : y === 66 ? C[5] : y < 69 ? C[4] : C[3])
  }
  for (let x = 13; x < 24; x++) p(x, 72, C[4])   // arena que lo tapa
  const piedra = (cx, cy, r) => { for (let y = cy - r; y <= cy; y++) for (let x = cx - r - 1; x <= cx + r + 1; x++) if (((x - cx) / (r + 1)) ** 2 + ((y - cy) / r) ** 2 <= 1) p(x, y, y === cy - r ? C[4] : x > cx ? C[3] : C[2]) }
  piedra(101, 70, 3); piedra(95, 73, 2); piedra(26, 75, 2)

  const c = mk(W, H), g = c.getContext('2d'), d = g.createImageData(W, H)
  buf.forEach((col, i) => { const n = parseInt(col.slice(1), 16); d.data.set([n >> 16, (n >> 8) & 255, n & 255, 255], i * 4) })
  g.putImageData(d, 0, 0); return c
}
/* Arena que vuela con el viento a ras del suelo y un ave que planea a lo lejos. */
function desiertoVivo(g, t, col) {
  const s = t / 1000
  for (let i = 0; i < 12; i++) {
    const v = 18 + (i % 4) * 6, x = Math.round(W + 6 - ((s * v + i * 29) % (W + 14))), y = Math.round(50 + (i * 7) % 24 + Math.sin(s * 2 + i) * 1)
    g.fillStyle = col(i % 3 ? '#e7d5b3' : '#d7b594'); g.fillRect(x, y, 2 + (i % 3), 1)
  }
  const an = s * 0.5, x = Math.round(64 + Math.cos(an) * 12), y = Math.round(12 + Math.sin(an) * 3), ala = Math.floor(s * 2) % 3 === 0
  g.fillStyle = col('#4d2b32'); g.fillRect(x - 2, y + (ala ? -1 : 0), 2, 1); g.fillRect(x, y, 1, 1); g.fillRect(x + 1, y + (ala ? -1 : 0), 2, 1)
}

/* ======================= NOCHE ESTRELLADA =======================
   Campamento de noche: cielo azul casi negro con la Vía Láctea en diagonal, montañas y pinos en
   silueta, un lago que refleja el cielo y la fogata, y la fogata al centro (entre los héroes)
   que tiñe de naranjo el suelo. Pino oscuro a la izquierda. Pintada con Apollo.
   f = cuadro (0..3): las llamas, la luz que respira alrededor y estrellas que titilan. */
function pintarNoche(f) {
  const buf = new Array(W * H).fill(AP.gr[1])
  let s = 71; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647
  const p = (x, y, col) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && x < W && y >= 0 && y < H) buf[y * W + x] = col }
  const en = (x, y) => buf[Math.round(y) * W + Math.round(x)]
  const G = AP.gr, A = AP.az, N = AP.na, R = AP.ro, C = AP.ca, V = AP.ve
  const LAGO = 45, ORILLA = 52, FX = 56, FY = 55   // la fogata, atrás (junto a la orilla), para que no la pisen
  const DY = FY - 60   // todo lo de la fogata se dibujó pensando en FY = 60

  // cielo: casi negro arriba, azul hacia el horizonte
  const CIELO = [G[1], A[0], A[0], A[1], A[2]]
  for (let y = 0; y < LAGO; y++) for (let x = 0; x < W; x++) {
    const t = Math.min(0.999, (y / LAGO) ** 1.3) * CIELO.length, i = Math.floor(t)
    p(x, y, CIELO[t - i > 0.65 && (x + y) % 2 === 0 ? Math.min(i + 1, CIELO.length - 1) : i])
  }
  // Vía Láctea: una franja en diagonal, más clara en el centro, con polvo cálido y vetas oscuras
  const via = (x, y) => Math.abs((y - (x - 34) * 0.52) * 0.89)
  for (let y = 0; y < 40; y++) for (let x = 0; x < W; x++) {
    const d = via(x, y) + Math.sin(x / 5 + y / 3) * 1.2, c = en(x, y)
    if (d < 7 && ((x + y) % 2 === 0 || d < 4)) p(x, y, MAS_LUZ[c])
    if (d < 2.5 && (x + y) % 2 === 0) p(x, y, MAS_LUZ[MAS_LUZ[c]])
    if (d < 3.5 && Math.sin(x / 2.3 + y * 1.1) > 0.85) p(x, y, c)                 // vetas oscuras
    if (d < 4 && (x * 13 + y * 7) % 19 === 0) p(x, y, C[2])                       // polvo cálido
  }
  // estrellas: muchas chicas, más tupidas en la Vía Láctea, algunas cálidas o azuladas
  for (let i = 0; i < 150; i++) {
    const x = rnd() * W, y = rnd() * 40, cerca = via(x, y) < 8
    if (!cerca && rnd() < 0.45) continue
    const q = rnd(), col = q < 0.1 ? N[5] : q < 0.2 ? A[5] : q < 0.5 ? G[9] : q < 0.8 ? G[8] : G[7]
    if (!((i % 7 === 0) && f % 2 === 1)) p(x, y, col)   // unas pocas titilan
  }
  ;[[14, 8], [92, 6], [70, 18], [104, 28], [40, 24]].forEach(([x, y], i) => {
    const brillo = (i + f) % 4 !== 0
    p(x, y, '#ffffff'); if (brillo) { p(x - 1, y, G[7]); p(x + 1, y, G[7]); p(x, y - 1, G[7]); p(x, y + 1, G[7]) }
  })

  // montañas en silueta a la derecha, con un filo apenas iluminado
  const monte = (px, py, mitad) => {
    for (let x = Math.round(px - mitad); x <= px + mitad; x++) {
      const top = Math.round(py + Math.abs(x - px) * ((LAGO - py) / mitad) * 0.9 + Math.sin(x / 2.5) * 0.8)
      for (let y = top; y < LAGO; y++) p(x, y, y === top ? A[1] : A[0])
    }
  }
  monte(84, 27, 26); monte(104, 31, 16); monte(66, 34, 14); monte(20, 35, 22)
  // pinos del otro lado del lago
  for (let x = -2; x < W + 2; x += 2 + Math.round(rnd() * 2)) {
    const h = 3 + Math.round(rnd() * 6)
    for (let k = 0; k < h; k++) { const w = Math.floor(k / 2.2); for (let dx = -w; dx <= w; dx++) p(x + dx, LAGO - h + k, G[1]) }
  }
  for (let x = 0; x < W; x++) p(x, LAGO - 1, G[1])

  // el lago: refleja el cielo (más oscuro), estrellas sueltas y la luz de la fogata
  for (let y = LAGO; y < ORILLA; y++) for (let x = 0; x < W; x++) {
    let col = y < LAGO + 2 ? G[2] : (y + Math.floor(x / 6)) % 3 === 0 ? A[1] : A[0]
    p(x, y, col)
  }
  for (let i = 0; i < 14; i++) { const x = rnd() * W, y = LAGO + 2 + rnd() * 5; p(x, y, G[7]); p(x + 1, y, G[6]) }
  for (let y = LAGO + 1; y < ORILLA; y++) {
    const w = 2 + (y - LAGO) * 0.6
    if ((y + f) % 2 === 0) for (let x = Math.round(FX - w); x <= FX + w; x++) if ((x + y * 3 + f * 2) % 6 !== 0) p(x, y, Math.abs(x - FX) < w * 0.35 ? N[4] : Math.abs(x - FX) < w * 0.7 ? N[2] : N[1])
  }

  // el suelo: tierra oscura que se vuelve naranja cerca del fuego (la luz respira un poco)
  const luz = [N[3], N[2], N[1], C[0], N[0], R[0]], radio = [6, 11, 17, 24, 32]
  const respira = [0, 1, 0.5, -0.5][f]
  for (let y = ORILLA; y < H; y++) for (let x = 0; x < W; x++) {
    const d = Math.hypot(x - FX, (y - FY) * 2.2) - respira + ((x + y) % 2) * 1.2
    let i = radio.findIndex((r) => d < r); if (i < 0) i = luz.length - 1
    let col = luz[i]
    if ((x * 11 + y * 17) % 29 === 0) col = MAS_LUZ[col] ?? col           // piedritas y ramitas
    if ((x * 7 + y * 5) % 37 === 0) col = MAS_SOMBRA[col] ?? col
    p(x, y, col)
  }
  for (let x = 0; x < W; x++) p(x, ORILLA, Math.abs(x - FX) < 16 ? N[2] : G[2])
  // piedras del círculo de la fogata, iluminadas desde adentro
  const piedra = (cx, cy, rx, lado) => {
    for (let y = cy - 1; y <= cy + 1; y++) for (let x = cx - rx; x <= cx + rx; x++) {
      if (y === cy - 1 && Math.abs(x - cx) === rx) continue
      p(x, y, y === cy - 1 ? N[4] : (x - cx) * lado > 0 ? N[3] : C[1])
    }
  }
  ;[[48, 62, 2, 1], [53, 64, 2, 1], [59, 64, 2, -1], [64, 62, 2, -1]].forEach(([x, y, r, l]) => piedra(x, y + DY, r, l))
  // rocas grandes en las esquinas con el borde que mira al fuego en naranjo
  const roca = (cx, cy, rx, ry, lado) => {
    for (let y = cy - ry; y <= cy + ry; y++) for (let x = cx - rx; x <= cx + rx; x++) {
      const e = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2; if (e > 1) continue
      const borde = (x - cx) * lado > rx * 0.45 && y < cy + ry * 0.3
      p(x, y, borde ? N[2] : y < cy - ry * 0.4 ? C[0] : G[2])
    }
  }
  roca(6, 70, 9, 6, 1); roca(106, 72, 9, 5, -1); roca(96, 66, 4, 3, -1)

  // la fogata: troncos cruzados, brasas y llamas que cambian en cada cuadro
  const tronco = (x0, y0, x1, y1) => { const L = Math.hypot(x1 - x0, y1 - y0); for (let k = 0; k <= L; k++) { const x = x0 + (x1 - x0) * k / L, y = y0 + (y1 - y0) * k / L; p(x, y, C[1]); p(x, y + 1, C[0]) } p(x0, y0, N[4]) }
  tronco(50, 62 + DY, 55, 56 + DY); tronco(62, 62 + DY, 57, 56 + DY); tronco(51, 61 + DY, 61, 61 + DY)
  for (let x = 52; x <= 60; x++) if ((x + f) % 2 === 0) p(x, 60 + DY, R[4])
  for (let x = 50; x <= 62; x++) {
    const h = Math.max(0, 8 - Math.abs(x - FX) * 1.4 + Math.round(Math.sin(x * 1.7 + f * 1.9) * 1.5)), base = 60 + DY
    for (let k = 0; k < h; k++) {
      const u = k / h, cerca = Math.abs(x - FX) < 2
      p(x, base - k, u < 0.35 && cerca ? C[5] : u < 0.5 ? N[5] : u < 0.75 ? N[4] : u < 0.9 ? R[5] : R[4])
    }
  }
  ;[[FX + [0, 1, -1, 1][f], 50 + DY], [FX + [-2, -1, 1, 0][f], 52 + DY]].forEach(([x, y]) => { p(x, y, R[4]); p(x, y - 1, R[3]) })   // lenguas sueltas

  // pino oscuro a la izquierda: tronco con el lado que mira al fuego apenas tibio, y ramas en silueta
  for (let y = 0; y < ORILLA + 2; y++) { const x = Math.round(7 + y * 0.04); p(x, y, C[0]); p(x + 1, y, y > 30 ? N[1] : C[0]); p(x - 1, y, G[1]) }
  const ramas = [[8, 4, -1, 9], [8, 9, 1, 11], [8, 14, -1, 8], [8, 18, 1, 13], [8, 24, 1, 9], [8, 28, -1, 7], [8, 33, 1, 7]]
  ramas.forEach(([x0, y0, lado, L]) => {
    for (let k = 0; k < L; k++) {
      const x = x0 + lado * k, y = y0 + k * 0.25
      p(x, y, G[1]); const caida = 1 + Math.round(Math.sin((k / L) * Math.PI) * 3)
      for (let j = 1; j <= caida; j++) if ((k + j) % 2 === 0 || j < 2) p(x, y + j, j === caida ? V[0] : G[1])
    }
  })
  // pino chico a la derecha y matas de pasto en silueta
  for (let k = 0; k < 18; k++) { const y = 34 + k, w = Math.round(k * 0.35) + (k % 3 === 2 ? 1 : 0); for (let dx = -w; dx <= w; dx++) p(104 + dx, y, G[1]) }
  const mata = (bx, by, s) => { for (let b = 0; b < 5; b++) { const an = -Math.PI / 2 + s * (b * 0.28 - 0.55); for (let k = 0; k < 7 - (b % 2) * 2; k++) p(bx + Math.cos(an) * k, by + Math.sin(an) * k, Math.abs(bx - FX) < 30 && k > 2 ? N[1] : G[1]) } }
  mata(24, 57, 1); mata(30, 55, -1); mata(84, 56, 1); mata(90, 58, -1); mata(16, 76, 1); mata(100, 76, -1)

  const c = mk(W, H), g = c.getContext('2d'), d = g.createImageData(W, H)
  buf.forEach((col, i) => { const n = parseInt(col.slice(1), 16); d.data.set([n >> 16, (n >> 8) & 255, n & 255, 255], i * 4) })
  g.putImageData(d, 0, 0); return c
}
/* Chispas que suben de la fogata y, de vez en cuando, una estrella fugaz. */
function nocheViva(g, t, col) {
  const s = t / 1000
  for (let i = 0; i < 7; i++) {
    const k = (s * 0.55 + i / 7) % 1, x = Math.round(56 + Math.sin(k * 7 + i * 2) * (2 + k * 4) + (i % 3 - 1)), y = Math.round(46 - k * 24)
    if (k < 0.85) { g.fillStyle = col(k < 0.4 ? '#e8c170' : '#da863e'); g.fillRect(x, y, 1, 1) }
  }
  const ciclo = s % 9
  if (ciclo < 0.6) {   // estrella fugaz, cada 9 s
    const k = ciclo / 0.6, x = Math.round(30 + k * 40), y = Math.round(4 + k * 12)
    g.fillStyle = col('#ffffff'); g.fillRect(x, y, 1, 1)
    g.fillStyle = col('#c7cfcc'); g.fillRect(x - 1, y - 1, 1, 1); g.fillRect(x - 2, y - 1, 1, 1)
    g.fillStyle = col('#577277'); g.fillRect(x - 3, y - 2, 1, 1); g.fillRect(x - 4, y - 2, 1, 1)
  }
}

/* ======================= NIEVE =======================
   Ruinas en la nieve a la hora azul: cielo azul profundo, una montaña nevada (cara iluminada
   blanca, sombra azul), ruinas a la izquierda con ventanas góticas y antorchas encendidas, una
   escalera de piedra al centro, menhires con gorro de nieve y un árbol pelado en la esquina.
   Frío azul + luz naranja de las antorchas. Pintada con Apollo, sin ruido de píxeles sueltos.
   f = cuadro (0..3): las llamas de las antorchas y el brillo de las ventanas. */
function pintarNieve(f) {
  const buf = new Array(W * H).fill(AP.az[2])
  const p = (x, y, col) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && x < W && y >= 0 && y < H) buf[y * W + x] = col }
  const en = (x, y) => buf[Math.round(y) * W + Math.round(x)]
  const rect = (x, y, w, h, col) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) p(x + i, y + j, col) }
  const G = AP.gr, A = AP.az, N = AP.na, R = AP.ro, C = AP.ca
  const PISO = 57

  // cielo de la hora azul: oscuro arriba, más claro y gris hacia el horizonte
  const CIELO = [A[1], A[2], A[3], G[6]]
  for (let y = 0; y < 52; y++) for (let x = 0; x < W; x++) {
    const t = Math.min(0.999, y / 46) * CIELO.length, i = Math.min(CIELO.length - 1, Math.floor(t))
    p(x, y, CIELO[t - i > 0.7 && (x + y) % 2 === 0 ? Math.min(i + 1, CIELO.length - 1) : i])
  }

  // montañas: cara izquierda iluminada (blanca), cara derecha en sombra azul, con vetas de roca
  const monte = (px, py, izq, der, base, luz, cresta, sombra, veta) => {
    for (let x = 0; x < W; x++) {
      const top = py + (x < px ? (px - x) * izq : (x - px) * der) + Math.round(Math.abs(Math.sin(x / 3)) * 1.4 + Math.sin(x / 7) * 1.5)
      if (top >= base) continue
      for (let y = Math.max(0, Math.round(top)); y < base; y++) {
        // crestas en abanico desde la cumbre: cada una con su lado claro y su canaleta en sombra
        const u = (x - px) / (y - py + 2), fr = ((u * 3.2 + Math.sin(y / 3) * 0.12) % 1 + 1) % 1
        let col
        if (x < px) col = y < top + 1.5 ? cresta : fr < 0.22 ? sombra : fr < 0.4 ? MAS_SOMBRA[luz] : luz
        else col = fr < 0.3 ? veta : fr > 0.85 ? MAS_SOMBRA[luz] : sombra
        if ((fr > 0.18 && fr < 0.24) && y > top + 4 && (x + y) % 3 === 0) col = G[4]   // roca en las canaletas
        p(x, y, col)
      }
    }
  }
  monte(22, 9, 0.8, 0.9, 50, G[6], G[7], A[3], A[2])        // lejana, detrás de las ruinas (en la bruma)
  monte(104, 22, 0.7, 0.5, 52, G[7], G[8], A[3], A[2])      // baja a la derecha
  monte(90, 19, 0.9, 0.6, 52, G[7], G[8], A[3], A[2])       // hombro de la grande
  monte(76, 11, 0.85, 0.75, 52, G[8], G[9], A[3], A[2])     // la grande
  // bruma suave sobre el pie de las montañas
  for (let y = 40; y < 52; y++) for (let x = 0; x < W; x++) if (y > 46 || (x + y) % 2 === 0) p(x, y, MAS_LUZ[en(x, y)])

  // árbol pelado que entra por la esquina de arriba a la derecha
  const rama = (x, y, an, L, grosor) => {
    for (let k = 0; k < L; k++) {
      const px = x + Math.cos(an) * k, py = y + Math.sin(an) * k
      p(px, py, G[2]); if (grosor > 1) p(px, py + 1, G[2])
    }
    if (L > 4) {
      const fx = x + Math.cos(an) * L, fy = y + Math.sin(an) * L
      rama(fx, fy, an - 0.5, L * 0.6, grosor - 1); rama(fx, fy, an + 0.45, L * 0.55, grosor - 1)
    }
  }
  rama(113, 2, Math.PI * 0.86, 12, 3); rama(113, 12, Math.PI * 0.95, 9, 2); rama(105, 0, Math.PI * 0.62, 7, 2)

  // ruinas a la izquierda: piedra azulada en bloques, cima rota con nieve, ventanas góticas encendidas
  const cima = (x) => {
    if (x < 9) return 14 + (x % 3 === 0 ? 1 : 0)            // torre rota
    if (x < 12) return 24
    if (x < 25) return 10 + Math.abs(x - 18) % 3              // la parte alta del centro
    if (x < 29) return 22 + (x % 2)
    if (x < 33) return 30                                     // muro derrumbado
    if (x < 42) return 19 + (x === 41 ? 3 : 0)
    return 99
  }
  for (let x = 0; x < 42; x++) for (let y = cima(x); y < 52; y++) {
    const fila = Math.floor((y - 2) / 3), junta = (y - 2) % 3 === 0 || (x + fila * 3) % 6 === 0
    let col = junta ? G[3] : G[4]
    if (cima(x - 1) > y || x === 0) col = G[5]                // borde iluminado a la izquierda
    if (cima(x + 1) > y && x > 0) col = A[1]                  // borde en sombra a la derecha
    if (y < cima(x) + 2) col = y === cima(x) ? G[9] : G[8]   // nieve encima
    p(x, y, col)
  }
  // arco grande abierto (se ve el cielo a través)
  for (let y = 26; y < 44; y++) for (let x = 13; x < 21; x++) if (y > 30 || (x - 17) ** 2 + ((y - 30) * 1.3) ** 2 <= 16) p(x, y, CIELO[Math.min(3, Math.floor((y / 46) * 4))])
  // ventanas góticas con luz cálida y un halo sobre la piedra
  const ventana = (x0, y0, h, chispa) => {
    for (let dy = -3; dy <= h + 2; dy++) for (let dx = -3; dx <= 6; dx++) {
      const x = x0 + dx, y = y0 + dy, c = en(x, y)
      if ((c === G[4] || c === G[3]) && (x + y) % 2 === 0 && Math.abs(dx - 1.5) + Math.abs(dy - h / 2) < h / 2 + 3) p(x, y, c === G[4] ? C[1] : N[1])
    }
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < 4; dx++) {
      if (dy === 0 && (dx === 0 || dx === 3)) continue
      const borde = dx === 0 || dx === 3 || dy === 0
      p(x0 + dx, y0 + dy, borde ? N[3] : dy > h - 3 ? N[4] : (chispa ? N[5] : N[4]))
    }
    p(x0 + 1, y0 - 1, N[3]); p(x0 + 2, y0 - 1, N[3])
  }
  ventana(3, 22, 9, f % 2 === 0); ventana(23, 28, 8, f !== 1); ventana(35, 26, 8, f !== 3)
  // antorchas sobre la torre y el muro, con llamas que cambian en cada cuadro
  const antorcha = (x, y) => {
    rect(x, y, 1, 3, G[2]); p(x - 1, y, G[2]); p(x + 1, y, G[2])
    for (let dy = -4; dy <= 2; dy++) for (let dx = -3; dx <= 3; dx++) { const c = en(x + dx, y + dy); if ((x + dx + y + dy) % 2 === 0 && dx * dx + dy * dy < 10 && (c === G[4] || c === G[3])) p(x + dx, y + dy, C[1]) }
    const llamas = [
      [[0, -1, N[4]], [0, -2, N[5]], [-1, -1, R[5]], [1, -1, R[5]], [0, -3, N[5]]],
      [[0, -1, N[4]], [0, -2, N[5]], [-1, -2, R[5]], [1, -1, R[5]], [-1, -3, N[5]]],
      [[0, -1, N[4]], [0, -2, N[5]], [1, -2, R[5]], [-1, -1, R[5]], [1, -3, N[5]]],
      [[0, -1, N[4]], [0, -2, N[4]], [-1, -1, R[5]], [1, -1, R[5]], [0, -3, N[5]], [0, -4, R[5]]],
    ]
    llamas[f].forEach(([dx, dy, c]) => p(x + dx, y + dy, c))
  }
  antorcha(2, 12); antorcha(39, 17)

  // el suelo nevado: lomas suaves, con manchas grandes de luz y sombra (sin ruido)
  const suelo = (x) => 50 + Math.round(Math.sin(x / 13) * 1.5 + Math.sin(x / 5 + 2) * 0.6)
  for (let x = 0; x < W; x++) for (let y = suelo(x); y < H; y++) {
    const sh = Math.sin(x / 9 + y / 4) + Math.sin(x / 23 - y / 7) * 0.8
    let col = sh > 0.9 ? G[8] : sh < -1.1 ? A[3] : G[7]
    if (y === suelo(x)) col = G[9]
    if (y > 71) col = sh > 0.4 ? G[7] : A[3]
    p(x, y, col)
  }
  // luz cálida de las ruinas sobre la nieve
  for (let y = 50; y < 58; y++) for (let x = 0; x < 44; x++) if ((x + y) % 2 === 0 && ((x - 22) / 24) ** 2 + ((y - 52) / 5) ** 2 < 1) p(x, y, C[4])

  // escalera de piedra al centro, subiendo hacia las ruinas
  for (let k = 0; k < 9; k++) {
    const y = 56 - k * 2, x0 = Math.round(50 - k * 1.6), w = 10 - Math.floor(k / 3)
    for (let i = 0; i < w; i++) { p(x0 + i, y - 1, k > 5 ? C[4] : G[8]); p(x0 + i, y, G[4]) }
    p(x0 + w, y - 1, G[3]); p(x0 + w, y, A[1]); p(x0 - 1, y, G[5])
  }

  // menhires con gorro de nieve y su sombra azul sobre la nieve
  const menhir = (cx, base, w, h) => {
    for (let y = base - h; y < base; y++) {
      const r = y - (base - h) < 2 ? w - 1 : w
      for (let x = cx - r; x <= cx + r; x++) {
        let col = x < cx - r + 1 ? G[5] : x > cx ? G[3] : G[4]
        if (y < base - h + 2) col = y === base - h ? G[9] : G[8]
        if ((x * 3 + y * 5) % 11 === 0 && y > base - h + 2) col = G[2]
        p(x, y, col)
      }
    }
    for (let k = 0; k < w * 2 + 3; k++) p(cx + w + k, base - 1 + (k % 2), A[3])
  }
  menhir(66, 46, 1, 6); menhir(90, 52, 2, 10); menhir(26, 54, 2, 8); menhir(107, 66, 4, 20)

  // rocas oscuras con nieve en la esquina de abajo a la izquierda
  const roca = (cx, cy, rx, ry) => { for (let y = cy - ry; y <= cy + ry; y++) for (let x = cx - rx; x <= cx + rx; x++) if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1) p(x, y, y < cy - ry * 0.35 ? (y < cy - ry * 0.7 ? G[9] : G[8]) : x < cx - rx * 0.3 ? G[4] : G[3]) }
  roca(4, 72, 8, 5); roca(14, 75, 5, 3)

  const c = mk(W, H), g = c.getContext('2d'), d = g.createImageData(W, H)
  buf.forEach((col, i) => { const n = parseInt(col.slice(1), 16); d.data.set([n >> 16, (n >> 8) & 255, n & 255, 255], i * 4) })
  g.putImageData(d, 0, 0); return c
}
/* Copos que caen con el viento y una bandada de cuervos sobre la montaña. */
function nieveViva(g, t, col) {
  const s = t / 1000
  for (let i = 0; i < 30; i++) {
    const v = 6 + (i % 5) * 2, x = Math.round(((i * 37.7 + s * (3 + (i % 3)) + Math.sin(s * 1.3 + i) * 2) % (W + 6)) - 3)
    const y = Math.round((i * 23.3 + s * v) % (H + 4)) - 2
    g.fillStyle = col(i % 3 === 0 ? '#ebede9' : '#c7cfcc'); g.fillRect(x, y, i % 5 === 0 ? 2 : 1, 1)
  }
  for (let i = 0; i < 6; i++) {
    const x = Math.round(((s * 5 + i * 4.3) % (W + 40)) - 20 + Math.sin(s + i) * 2), y = Math.round(8 + (i % 3) * 2 + Math.sin(s * 1.7 + i) * 1.2), ala = Math.floor(s * 6 + i) % 2
    g.fillStyle = col('#151d28'); g.fillRect(x, y, 1, 1); g.fillRect(x - 1, y - ala, 1, 1); g.fillRect(x + 1, y - ala, 1, 1)
  }
}

/* ======================= VILLA =======================
   Plaza de un pueblo al atardecer (cielo morado a naranjo), casas con entramado de madera a
   los lados, torre del reloj y escalera al centro, pueblo en la loma del fondo. Pintada con
   Apollo. f = cuadro (0..3): la banderita de la torre y los faroles que titilan. */
function pintarVilla(f) {
  const buf = new Array(W * H).fill(AP.mo[2])
  let s = 47; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647
  const p = (x, y, col) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && x < W && y >= 0 && y < H) buf[y * W + x] = col }
  const rect = (x, y, w, h, col) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) p(x + i, y + j, col) }
  const C = AP.ca, N = AP.na, R = AP.ro, M = AP.mo, V = AP.ve, G = AP.gr
  const PISO = 57

  // cielo del atardecer con nubes alargadas iluminadas por abajo
  const CIELO = [M[1], M[2], M[3], M[4], M[5], R[5], N[5]]
  for (let y = 0; y < 40; y++) for (let x = 0; x < W; x++) {
    const t = Math.min(0.999, (y / 36) * (0.9 + Math.sin(x / 20) * 0.05)) * CIELO.length, i = Math.floor(t)
    p(x, y, CIELO[t - i > 0.65 && (x + y) % 2 === 0 ? Math.min(i + 1, CIELO.length - 1) : i])
  }
  ;[[4, 6, 30], [60, 9, 40], [20, 15, 34], [78, 18, 30]].forEach(([x0, y0, L]) => {
    for (let k = 0; k < L; k++) { const g = Math.sin((k / L) * Math.PI); p(x0 + k, y0, M[3]); if (g > 0.3) p(x0 + k, y0 + 1, g > 0.7 ? R[5] : M[5]); if (g > 0.6) p(x0 + k, y0 - 1, M[2]) }
  })
  // loma del fondo con el pueblo lejano en silueta y ventanitas encendidas
  for (let x = 0; x < W; x++) { const top = Math.round(30 + Math.sin(x / 14) * 3 + Math.sin(x / 5) * 0.8); for (let y = top; y < 48; y++) p(x, y, y === top ? M[3] : M[2]) }
  for (let x = 4; x < W - 4; x += 5 + Math.round(rnd() * 3)) {
    const w = 3 + Math.round(rnd() * 2), base = Math.round(30 + Math.sin(x / 14) * 3) + 2, h = 3 + Math.round(rnd() * 3)
    rect(x, base - h, w, h, M[1]); for (let k = 0; k <= w; k++) p(x + k - 0.5, base - h - Math.min(k, w - k) * 0.7 + 0.5, M[1])
    if (rnd() < 0.6) p(x + 1, base - h + 1, N[5])
  }

  // muro de piedra con arcos y arbustos encima, y la escalera del centro
  for (let y = 40; y < PISO; y++) for (let x = 0; x < W; x++) p(x, y, (y % 4 === 0 || (x + (Math.floor(y / 4) % 2) * 3) % 6 === 0) ? C[1] : C[2])
  for (let a = 5; a < W; a += 15) for (let y = 45; y < PISO; y++) for (let x = a; x < a + 7; x++) if (y > 47 || (x - a - 3) ** 2 + (y - 48) ** 2 <= 10) p(x, y, x === a ? C[0] : M[1])
  for (let x = 0; x < W; x++) { const h = 1 + Math.round(Math.abs(Math.sin(x / 3)) * 2); for (let k = 0; k < h; k++) p(x, 40 - k, k === h - 1 ? V[3] : V[2]) }
  for (let y = 41; y < PISO; y++) { const paso = Math.floor((y - 41) / 2), a = 48 - paso, b = 64 + paso; for (let x = a; x <= b; x++) p(x, y, (y - 41) % 2 === 0 ? C[4] : C[2]) }

  // torre del reloj al centro, con su aguja y la banderita
  for (let y = 12; y < 41; y++) for (let x = 51; x <= 61; x++) p(x, y, x <= 52 ? C[2] : x >= 59 ? C[4] : (y + (x % 3)) % 5 === 0 ? C[2] : C[3])
  for (let y = -1; y <= 1; y++) for (let x = -2; x <= 2; x++) if (x * x + y * y * 2 <= 5) p(56 + x, 20 + y, C[5])
  p(56, 20, C[0]); p(56, 19, C[0]); p(57, 20, C[0])
  rect(54, 27, 4, 6, M[1]); p(55, 26, M[1]); p(56, 26, M[1]); rect(55, 28, 2, 4, (f % 2) ? N[5] : N[4])
  for (let y = 2; y < 13; y++) { const w = Math.round((y - 2) * 0.62); for (let x = -w; x <= w; x++) p(56 + x, y, x < 0 ? R[2] : x === w ? R[4] : R[3]) }
  rect(50, 12, 13, 1, R[1])
  p(56, 1, C[0]); p(56, 0, C[0]); [[57, 0], [58, f % 2 ? 0 : 1], [59, f < 2 ? 0 : 1]].forEach(([x, y]) => p(x, y, R[4]))

  // una casa con entramado de madera: muros crema, vigas oscuras, ventanas encendidas y flores
  const casa = ({ x0, w, piso, pico, techo, luzDer }) => {
    const ancho = w + 8, cx = x0 + w / 2
    for (let y = piso; y < PISO; y++) for (let x = x0; x < x0 + w; x++) {
      const borde = luzDer ? x >= x0 + w - 2 : x <= x0 + 1
      p(x, y, borde ? C[5] : C[4])
    }
    for (let x = x0; x < x0 + w; x += 7) for (let y = piso; y < PISO; y++) p(x, y, C[0])
    ;[piso, piso + 11, piso + 22].forEach((y) => { if (y < PISO) rect(x0, y, w, 1, C[0]) })
    for (let x = x0; x + 7 <= x0 + w; x += 7) for (let k = 1; k < 7; k++) { p(x + k, piso + 11 - Math.round(k * 1.5), C[1]); if (piso + 22 < PISO - 2) p(x + k, piso + 22 - Math.round(k * 1.5), C[1]) }
    for (let x = x0 + 2; x + 4 < x0 + w; x += 7) for (const y of [piso + 3, piso + 13]) {
      if (y + 6 > PISO - 3) continue
      rect(x, y, 4, 5, C[0]); rect(x + 1, y + 1, 2, 3, (x + y + f) % 9 === 0 ? N[4] : N[5]); p(x + 1, y + 3, N[4]); p(x + 2, y + 3, N[4])
      rect(x - 1, y + 5, 6, 1, V[1]); p(x, y + 4, M[5]); p(x + 3, y + 4, R[4])
    }
    const puerta = luzDer ? x0 + 3 : x0 + w - 8
    for (let y = PISO - 9; y < PISO; y++) for (let x = puerta; x < puerta + 5; x++) if (y > PISO - 8 || (x > puerta && x < puerta + 4)) p(x, y, x === puerta + 2 ? C[0] : C[1])
    // techo de tejas: hileras con junturas y luz en el lado iluminado
    for (let y = pico; y <= piso; y++) {
      const m = Math.round(((y - pico) / (piso - pico)) * (ancho / 2))
      for (let x = Math.round(cx - m); x <= Math.round(cx + m); x++) {
        let col = (y - pico) % 3 === 2 ? techo[0] : (x + Math.floor((y - pico) / 3) * 2) % 4 === 0 ? techo[0] : techo[1]
        if ((luzDer ? x > cx + m - 2 : x < cx - m + 2) && col === techo[1]) col = techo[2]
        if (y === piso) col = AP.ro[1]
        p(x, y, col)
      }
    }
    const ch = luzDer ? cx + 5 : cx - 8
    rect(ch, pico + 2, 3, 6, C[2]); rect(ch - 1, pico + 1, 5, 1, C[1])
    return [ch + 1, pico]
  }
  casa({ x0: 70, w: 15, piso: 34, pico: 22, techo: [R[2], R[3], R[4]], luzDer: false })
  casa({ x0: 26, w: 14, piso: 36, pico: 25, techo: [N[1], N[2], N[3]], luzDer: true })
  const humo1 = casa({ x0: -4, w: 32, piso: 24, pico: 4, techo: [R[2], R[3], R[4]], luzDer: true })
  const humo2 = casa({ x0: 84, w: 32, piso: 22, pico: 3, techo: [C[0], C[1], C[2]], luzDer: false })
  CHIMENEAS = [humo1, humo2]

  // faroles a los lados de la escalera
  ;[45, 67].forEach((x) => {
    rect(x, 42, 1, PISO - 42, G[3]); rect(x - 1, PISO - 1, 3, 1, G[3])
    rect(x - 1, 38, 3, 4, G[3]); p(x, 39, f === 2 ? N[4] : N[5]); p(x, 40, N[5])
    ;[[-2, 39], [2, 39], [0, 36], [-2, 41], [2, 41]].forEach(([dx, dy]) => { if ((dx + dy + f) % 2 === 0) p(x + dx, dy, R[5]) })
  })

  // plaza de adoquines: hileras más altas cuanto más cerca
  let y = PISO, fila = 0
  while (y < H) {
    const h = 2 + Math.floor(fila / 2), w = 4 + fila, off = (fila % 2) * Math.floor(w / 2)
    for (let j = 0; j < h && y + j < H; j++) for (let x = 0; x < W; x++) {
      const junta = j === h - 1 || (x + off) % w === 0, q = ((x + off) / w | 0) * 7 + fila * 3
      p(x, y + j, junta ? C[2] : j === 0 ? C[4] : q % 5 === 0 ? C[4] : q % 7 === 0 ? C[2] : C[3])
    }
    y += h; fila++
  }
  rect(0, PISO, W, 1, C[1])
  // al frente: barriles a la izquierda, cajas y una maceta a la derecha
  const barril = (x, y) => { for (let j = 0; j < 9; j++) for (let i = 0; i < 7; i++) { const b = j === 1 || j === 7; p(x + i, y + j, b ? G[4] : i === 0 ? N[1] : i < 3 ? N[2] : i < 5 ? N[3] : N[4]) } rect(x, y, 7, 1, N[1]) }
  barril(1, 66); barril(7, 68)
  const caja = (x, y, w) => { for (let j = 0; j < w; j++) for (let i = 0; i < w; i++) p(x + i, y + j, i === 0 || j === 0 || i === w - 1 || j === w - 1 || i === j ? C[1] : C[2]) }
  caja(100, 66, 8); caja(105, 70, 7)
  rect(94, 70, 5, 5, R[3]); rect(94, 70, 5, 1, R[4]); for (let i = 0; i < 7; i++) p(93 + i, 69 - (i % 2), i % 3 ? V[3] : M[5])

  const c = mk(W, H), g = c.getContext('2d'), d = g.createImageData(W, H)
  buf.forEach((col, i) => { const n = parseInt(col.slice(1), 16); d.data.set([n >> 16, (n >> 8) & 255, n & 255, 255], i * 4) })
  g.putImageData(d, 0, 0); return c
}
let CHIMENEAS = []
/* Humo de las chimeneas y palomas que cruzan el cielo. */
function humoYPalomas(g, t, col) {
  const s = t / 1000
  CHIMENEAS.forEach(([x, y], j) => {
    for (let i = 0; i < 4; i++) {
      const k = ((s * 0.5 + i / 4 + j * 0.13) % 1), px = Math.round(x + k * 8 + Math.sin(k * 6 + i) * 1), py = Math.round(y - k * 14)
      g.fillStyle = col(k < 0.5 ? '#a8b5b2' : '#819796'); g.fillRect(px, py, k < 0.6 ? 2 : 1, k < 0.6 ? 2 : 1)
    }
  })
  ;[0, 1].forEach((i) => {
    const x = Math.round(W + 8 - ((s * (8 + i * 2) + i * 60) % (W + 16))), y = Math.round(8 + i * 5 + Math.sin(s * 2 + i) * 1.5), ala = Math.floor(s * 5 + i) % 2
    g.fillStyle = col('#c7cfcc'); g.fillRect(x - 1, y, 3, 1)
    g.fillStyle = col('#577277'); g.fillRect(x - 2, y + (ala ? -1 : 0), 1, 1); g.fillRect(x + 2, y + (ala ? -1 : 0), 1, 1)
  })
}

/* Pájaros a lo lejos y semillas que vuelan con el viento. */
function semillas(g, t, col) {
  const s = t / 1000
  ;[0, 1].forEach((i) => {
    const x = Math.round(((s * (4 + i) + i * 50) % (W + 16)) - 8), y = Math.round(10 + i * 6 + Math.sin(s + i) * 1.5), ala = Math.floor(s * 3 + i) % 2
    g.fillStyle = col('#202e37'); g.fillRect(x, y, 1, 1); g.fillRect(x - 1, y + (ala ? -1 : 0), 1, 1); g.fillRect(x + 1, y + (ala ? -1 : 0), 1, 1)
  })
  ;[0, 1, 2, 3].forEach((i) => {
    const x = Math.round(((s * 14 + i * 31) % (W + 10)) - 5), y = Math.round(30 + i * 7 + Math.sin(s * 2 + i * 2) * 3)
    g.fillStyle = col('#e7d5b3'); g.fillRect(x, y, 1, 1)
  })
}

/* Luciérnagas que titilan y hojas que caen. */
function luciernagas(g, t, col) {
  ;[[14, 30], [30, 44], [50, 22], [80, 40], [96, 26], [66, 50]].forEach(([bx, by], i) => {
    if (Math.sin(t / 420 + i * 1.7) < -0.2) return
    const x = Math.round(bx + Math.sin(t / 1300 + i) * 6), y = Math.round(by + Math.cos(t / 1700 + i * 2) * 3)
    g.fillStyle = col('#d0da91'); g.fillRect(x - 1, y, 3, 1); g.fillRect(x, y - 1, 1, 3)
    g.fillStyle = col('#e8c170'); g.fillRect(x, y, 1, 1)
  })
  ;[0, 1, 2].forEach((i) => {
    const y = Math.round((t / 90 + i * 23) % 64), x = Math.round(((i * 37 + 20) + Math.sin(t / 600 + i) * 5 + y * 0.3) % W)
    g.fillStyle = col(i % 2 ? '#a8ca58' : '#75a743'); g.fillRect(x, y, 2, 1)
  })
}


/* ======================= USO EN EL JUEGO ======================= */
const ESCENARIOS = {
  bosque: { pintar: pintarBosqueNuevo, cuadros: 1, vivo: luciernagas },
  costa: { pintar: pintarCosta, cuadros: 4, vivo: gaviotas },
  pradera: { pintar: pintarPradera, cuadros: 4, vivo: semillas },
  villa: { pintar: pintarVilla, cuadros: 4, vivo: humoYPalomas },
  noche: { pintar: pintarNoche, cuadros: 4, vivo: nocheViva },
  desierto: { pintar: pintarDesierto, cuadros: 4, vivo: desiertoVivo },
  nieve: { pintar: pintarNieve, cuadros: 4, vivo: nieveViva },
  volcan: { pintar: pintarVolcan, cuadros: 4, vivo: volcanVivo },
}
export const NOMBRES_ESCENARIOS = Object.keys(ESCENARIOS)

/* Qué escenario va con cada tema (elegido por la profesora, oct-2026). */
export const FONDO_POR_TEMA = {
  answering: 'bosque',    // Tick Tack Minigame
  answering2: 'costa',    // Clockwork Groove
  answering3: 'villa',    // Village Quest
  answering4: 'noche',    // Ticking Pulse
  answering5: 'desierto', // Pendulum Kingdom
  answering6: 'pradera',  // Garden Groove
  final: 'nieve',         // Final Question
  final2: 'volcan',       // Final Sprint
}
export const TEMAS_CON_FONDO = [...ANSWERING_TRACKS, ...FINAL_TRACKS]

/* El escenario de la pregunta en curso: el de la canción que suena (o sonó) en ella, con la
   misma cuenta que usa el proyector para elegir la música. El podio usa el de la final. */
export function escenarioDe(state) {
  if (!state) return 'bosque'
  const ultima = state.phase === 'end' || (!state.practice && state.total != null && state.qIndex + 1 >= state.total)
  return FONDO_POR_TEMA[ultima ? finalTrack(state.round) : answeringTrack(state.round, state.qIndex)] || 'bosque'
}

const sinCambio = (h) => h
const pintados = {}
/* Pinta el escenario en g (t en ms: anima el agua, el fuego, las nubes…). */
export function pintarEscenario(g, nombre, t = 0) {
  const clave = ESCENARIOS[nombre] ? nombre : 'bosque', e = ESCENARIOS[clave]
  const cuadros = (pintados[clave] ??= Array.from({ length: e.cuadros }, (_, f) => e.pintar(f)))
  const tt = Math.max(0, t)
  g.drawImage(cuadros[Math.floor(tt / 300) % cuadros.length], 0, 0)
  e.vivo(g, tt, sinCambio)
}
