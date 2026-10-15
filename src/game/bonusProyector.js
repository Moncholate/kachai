/* ============================================================================
   RONDA BONUS, PROYECTOR: la nave del curso contra Lexicón
   ----------------------------------------------------------------------------
   Escena de 320 × 180 (se ve a pantalla completa, pixelada). Fondo y nave en la
   paleta Apollo (como los escenarios de los duelos); Lexicón, los chibis, las
   hojas, burbujas y dardos en Pear36 (como los personajes).

   EscenaBonus anima todo en un <canvas> y se alimenta de los datos reales:
     · fase: 'intro' (cuenta regresiva) | 'juego' | 'final'
     · aciertos de cada alumno (rooms/{pin}/bonus/hits): cada acierto nuevo es
       un dardo que sale del chibi de ese alumno y revienta una burbuja
     · meta del curso: al pasar 1/3, 2/3 y el total, a Lexicón se le vuela el
       birrete, se le caen los lentes y se rinde. Nunca hay derrota.
   El texto (categoría, barra, reloj) lo pone React encima.
   ========================================================================== */
import { lienzoPear36 } from './pear36.js'
import { CHIBIS, chibi } from './chibis.js'

const AP = {
  ve: ['#19332d', '#25562e', '#468232', '#75a743', '#a8ca58', '#d0da91'],
  ca: ['#4d2b32', '#7a4841', '#ad7757', '#c09473', '#d7b594', '#e7d5b3'],
  na: ['#341c27', '#602c2c', '#884b2b', '#be772b', '#de9e41', '#e8c170'],
  ro: ['#241527', '#411d31', '#752438', '#a53030', '#cf573c', '#da863e'],
  mo: ['#1e1d39', '#402751', '#7a367b', '#a23e8c', '#c65197', '#df84a5'],
  az: ['#172038', '#253a5e', '#3c5e8b', '#4f8fba', '#73bed3', '#a4dddb'],
  gr: ['#090a14', '#10141f', '#151d28', '#202e37', '#394a50', '#577277', '#819796', '#a8b5b2', '#c7cfcc', '#ebede9'],
}
const K = '#272736'
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c }
const PW = 320, PH = 180   // más resolución que antes: así caben los 15 chibis de 16 × 22 en la nave

/* Dibuja una lista de píxeles con su contorno oscuro de 1 px */
function conContorno(px, pts) {
  const set = new Set(pts.map(([x, y]) => x + ',' + y))
  for (const [x, y] of pts) for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!set.has((x + a) + ',' + (y + b))) px(x + a, y + b, K)
  for (const [x, y, c] of pts) px(x, y, c)
}
const elipse = (pts, cx, cy, rx, ry, col) => { for (let y = Math.floor(cy - ry); y <= cy + ry; y++) for (let x = Math.floor(cx - rx); x <= cx + rx; x++) if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1) pts.push([x, y, typeof col === 'function' ? col(x, y) : col]) }

/* ======================= LEXICÓN ======================= */
/* A) Búho erudito: birrete, lentes redondos, sopla burbujas por encima de un diccionario abierto.
   modo: 'sopla' | 'arranca' (arranca una hoja) | 'lanza' (la lanza) | 'rinde'. birrete: si todavía lo tiene. */
function lexiconBuho(px, cx, pie, modo = 'sopla', birrete = true, lentes = true) {
  const cuerpo = [], cy = pie - 14
  elipse(cuerpo, cx, cy, 11, 13.5, (x, y) => (x - cx) + (y - cy) * 0.6 > 6 ? '#8C3F5D' : (y - cy) < -9 && (x - cx) < 2 ? '#F2A65E' : '#BA6156')
  for (const s of [-1, 1]) for (let i = 0; i < 4; i++) for (let j = 0; j <= i; j++) cuerpo.push([cx + s * (8 - j), cy - 15 + i, '#BA6156'])   // penachos
  conContorno(px, cuerpo)
  /* panza clara con plumitas en V */
  const panza = []; elipse(panza, cx, cy + 4, 6.5, 8, (x, y) => ((y - cy) % 3 === 0 && Math.abs(x - cx) % 3 === 1) ? '#C2C2D1' : '#FFFFEB')
  panza.forEach(([x, y, c]) => px(x, y, c))
  /* discos de la cara, lentes y ojos que miran hacia la nave (a la izquierda) */
  const ojo = (ox) => {
    const d = []; elipse(d, ox, cy - 6, 4.6, 4.6, '#F2A65E'); d.forEach(([x, y, c]) => px(x, y, c))
    if (lentes && (modo !== 'rinde' || ox < cx)) for (let a = 0; a < 32; a++) { const t = a / 32 * Math.PI * 2; px(Math.round(ox + Math.cos(t) * 4), Math.round(cy - 6 + Math.sin(t) * 4), '#FFE478') }
    const o = []; elipse(o, ox, cy - 6, 2.6, 2.6, '#FFFFEB'); o.forEach(([x, y, c]) => px(x, y, c))
    px(ox - 1, cy - 6, K); px(ox - 1, cy - 7, K); px(ox, cy - 6, K); px(ox, cy - 7, K)
    px(ox + 1, cy - 8, '#FFFFEB')
  }
  ojo(cx - 5); ojo(cx + 5)
  if (lentes && modo !== 'rinde') { px(cx - 1, cy - 6, '#FFE478'); px(cx, cy - 6, '#FFE478'); px(cx + 1, cy - 6, '#FFE478') }   // puente de los lentes
  else if (lentes) { px(cx + 9, cy - 1, '#FFE478'); px(cx + 10, cy, '#FFE478'); px(cx + 11, cy + 1, '#FFE478') }                   // los lentes se le cayeron de un lado
  /* pico: soplando (redondo) o abierto de sorpresa */
  const pico = modo === 'rinde' ? [[0, 0], [1, 0], [-1, 0], [0, 1], [1, 1], [-1, 1], [0, 2]] : [[0, 0], [-1, 0], [0, 1], [-1, 1], [-2, 1]]
  conContorno(px, pico.map(([a, b]) => [cx + a, cy - 2 + b, '#FFE478']))
  if (modo === 'rinde') px(cx, cy - 1, '#BA6156')
  /* patas */
  for (const s of [-4, 3]) [[0, 0], [1, 0], [2, 0], [1, -1]].forEach(([a, b]) => px(cx + s + a, pie + b, '#F2A65E'))
  if (modo === 'rinde') {
    /* alas arriba, bandera blanca, gota de sudor y el libro en el suelo */
    for (const s of [-1, 1]) { const ala = []; elipse(ala, cx + s * 13, cy - 10, 3, 7, '#8C3F5D'); conContorno(px, ala) }
    for (let y = cy - 30; y <= cy - 14; y++) px(cx + 14, y, '#7E7E8F')
    const bandera = []; for (let y = cy - 30; y <= cy - 25; y++) for (let x = cx + 15; x <= cx + 23; x++) bandera.push([x, y + ((x - cx) % 4 === 0 ? 1 : 0), x > cx + 20 ? '#C2C2D1' : '#FFFFEB']); conContorno(px, bandera)
    ;[[cx - 13, cy - 16], [cx - 13, cy - 15], [cx - 14, cy - 15]].forEach(([x, y]) => px(x, y, '#66FFE3'))
    const libro = []; for (let y = pie - 4; y <= pie; y++) for (let x = cx - 24; x <= cx - 14; x++) libro.push([x, y, y === pie - 4 ? '#FFFFEB' : x === cx - 24 ? '#B0305C' : '#EB564B']); conContorno(px, libro)
    return
  }
  /* alas: las dos sostienen el libro; al arrancar, la izquierda sube con la hoja; al lanzar, se estira hacia la nave */
  const alaIzq = modo === 'arranca' ? [cx - 13, cy - 7, 3, 6] : modo === 'lanza' ? [cx - 16, cy + 1, 6, 2.5] : [cx - 10, cy + 4, 3, 6]
  for (const [ax, ay, rx, ry] of [alaIzq, [cx + 10, cy + 4, 3, 6]]) { const ala = []; elipse(ala, ax, ay, rx, ry, '#8C3F5D'); conContorno(px, ala) }
  if (modo === 'arranca') hoja(px, cx - 21, cy - 17, 'plana')
  const libro = []
  for (let x = cx - 9; x <= cx + 9; x++) { const curva = Math.round(Math.abs(x - cx) * 0.25); for (let y = cy + 6 - curva; y <= cy + 9 - curva + (Math.abs(x - cx) > 7 ? 1 : 0); y++) libro.push([x, y, Math.abs(x - cx) <= 7 ? (y === cy + 6 - curva ? '#FFFFEB' : ((x - cx) % 2 ? '#C2C2D1' : '#FFFFEB')) : '#EB564B']) }
  for (let x = cx - 8; x <= cx + 8; x++) libro.push([x, cy + 10, '#B0305C'])
  conContorno(px, libro)
  px(cx, cy + 6, '#7E7E8F'); px(cx, cy + 7, '#7E7E8F'); px(cx, cy + 8, '#7E7E8F')   // el lomo al centro
  if (modo === 'arranca') { px(cx - 5, cy + 5, '#FFFFEB'); px(cx - 6, cy + 4, '#FFFFEB') }   // el borde roto que queda en el libro
  /* birrete */
  if (birrete) {
    const b = []
    for (let y = cy - 19; y <= cy - 17; y++) for (let x = cx - 9; x <= cx + 9; x++) b.push([x, y, y === cy - 19 ? '#43434F' : K])
    for (let y = cy - 16; y <= cy - 15; y++) for (let x = cx - 5; x <= cx + 5; x++) b.push([x, y, '#43434F'])
    conContorno(px, b)
    for (let y = cy - 19; y <= cy - 12; y++) px(cx + 8 + (y > cy - 18 ? 1 : 0), y, '#FFE478')
    px(cx + 9, cy - 11, '#F2A65E'); px(cx + 10, cy - 11, '#F2A65E')
  }
}

/* La hoja arrancada. forma: 'plana' (de frente), 'canto' (girando, se ve de lado), 'pedazos' (se deshace) */
function hoja(px, x, y, forma) {
  if (forma === 'plana') {
    const pts = []
    for (let j = 0; j < 9; j++) for (let i = (j % 2 ? 1 : 0); i < 7; i++) pts.push([x + i, y + j, j % 2 === 1 && i > 1 && i < 6 ? '#C2C2D1' : '#FFFFEB'])   // borde roto a la izquierda y renglones
    conContorno(px, pts); return
  }
  if (forma === 'canto') { const pts = []; for (let j = 0; j < 9; j++) { pts.push([x, y + j, '#FFFFEB']); pts.push([x + 1, y + j, '#C2C2D1']) } conContorno(px, pts); return }
  ;[[0, 0], [5, -2], [9, 1], [2, 5], [7, 6], [11, 5], [4, 10]].forEach(([a, b], k) => conContorno(px, [[x + a, y + b, '#FFFFEB'], [x + a + 1, y + b, k % 2 ? '#C2C2D1' : '#FFFFEB'], [x + a, y + b + 1, '#FFFFEB']]))
  ;[[-3, 3], [14, 2], [6, -5], [6, 14]].forEach(([a, b]) => px(x + a, y + b, '#FFE478'))
}
/* Rayitas de velocidad detrás de algo que vuela hacia la izquierda */
const rayas = (px, x, y) => { for (let i = 0; i < 3; i++) for (let k = 0; k < 4; k++) px(x + 3 + i * 6 + k, y + i * 3, '#FFFFEB') }

/* Burbuja (sin palabra): aro claro con brillo; o reventando */
function burbuja(px, cx, cy, r, revienta) {
  if (!revienta) {
    for (let y = -r - 1; y <= r + 1; y++) for (let x = -r - 1; x <= r + 1; x++) { const d = Math.hypot(x, y); if (d <= r + 0.4 && d > r - 0.8) px(cx + x, cy + y, '#FFFFEB'); else if (d <= r - 0.8 && (x + y) % 4 === 0 && d > r - 2.4) px(cx + x, cy + y, '#C2C2D1') }
    px(cx - Math.round(r / 2), cy - Math.round(r / 2), '#FFFFEB'); px(cx - Math.round(r / 2) + 1, cy - Math.round(r / 2), '#FFFFEB')
    return
  }
  for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; for (let s = r; s <= r + 3; s++) if ((s + k) % 2) px(cx + Math.round(Math.cos(a) * s), cy + Math.round(Math.sin(a) * s), '#FFFFEB') }
  px(cx, cy, '#FFE478'); px(cx - 1, cy, '#FFE478'); px(cx + 1, cy, '#FFE478'); px(cx, cy - 1, '#FFE478'); px(cx, cy + 1, '#FFE478')
}
/* Dardo de ventosa chico, volando hacia la derecha y un poco arriba */
function dardoChico(px, x, y) {
  for (let i = 0; i < 6; i++) px(x - i, y + Math.round(i * 0.3), i > 4 ? '#8FDE5D' : '#FFE478')
  px(x + 1, y - 1, '#EB564B'); px(x + 1, y, '#EB564B'); px(x + 1, y + 1, '#EB564B')
  px(x - 9, y + 3, '#FFFFEB'); px(x - 12, y + 4, '#FFFFEB')
}

function pintarCielo() {
  const c = mk(PW, PH), g = c.getContext('2d'), p = (x, y, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), 1, 1) }
  let s = 5; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647
  const B = [[0, AP.az[1]], [23, AP.az[2]], [49, AP.az[3]], [74, AP.az[4]], [94, AP.az[5]], [111, AP.ca[5]], [126, AP.na[5]]]
  for (let y = 0; y < PH; y++) { let i = 0; while (i + 1 < B.length && B[i + 1][0] <= y) i++; const sig = B[i + 1], cerca = sig && sig[0] - y <= 2; for (let x = 0; x < PW; x++) p(x, y, cerca && (x + y) % 2 === 0 ? sig[1] : B[i][1]) }
  for (let i = 0; i < 90; i++) p(rnd() * PW, rnd() * 37, rnd() < 0.3 ? AP.gr[9] : AP.az[4])
  const SX = 214, SY = 131
  for (let y = SY - 12; y <= SY + 12; y++) for (let x = SX - 12; x <= SX + 12; x++) { const d = Math.hypot(x - SX, y - SY); if (d <= 4.5) p(x, y, AP.gr[9]); else if (d <= 6.5) p(x, y, AP.ca[5]); else if (d <= 10 && (x + y) % 2 === 0) p(x, y, AP.ca[5]) }
  const isla = (cx, top, ancho, alto, casa) => {
    for (let x = cx - ancho; x <= cx + ancho; x++) { const k = Math.abs(x - cx) / ancho, f = top + 3 + Math.round(alto * (1 - k * k) + Math.sin(x * 1.7) * 1.2); for (let y = top; y <= f; y++) { const luz = x > cx + ancho * 0.25; let col = y <= top + 1 ? (y === top ? AP.ve[3] : AP.ve[2]) : (luz ? AP.gr[6] : AP.gr[5]); if (y > top + 1 && (x * 3 + y * 5) % 11 === 0) col = luz ? AP.gr[7] : AP.gr[4]; p(x, y, col) } }
    if (casa) { const hx = cx - 3, hy = top - 1; for (let y = hy - 5; y <= hy; y++) for (let x = hx; x <= hx + 6; x++) p(x, y, x === hx + 6 ? AP.ca[2] : AP.ca[4]); for (let i = 0; i < 5; i++) for (let x = hx - 1 + i; x <= hx + 7 - i; x++) p(x, hy - 6 - i, i === 0 ? AP.ro[2] : AP.ro[3]); p(hx + 4, hy - 3, AP.na[5]) }
    else { const tx = cx + 2, ty = top - 1; for (let y = ty - 4; y <= ty; y++) p(tx, y, AP.ca[1]); for (let y = ty - 9; y <= ty - 4; y++) for (let x = tx - 3; x <= tx + 3; x++) if ((x - tx) ** 2 + ((y - ty + 6.5) * 1.3) ** 2 <= 10) p(x, y, x > tx ? AP.ve[3] : AP.ve[2]) }
  }
  isla(174, 54, 16, 22, true); isla(120, 30, 9, 12, false)
  return c
}
function capaNubes(semilla, y0, r0, r1, n, ramp) {
  const ancho = PW, c = mk(ancho, PH), g = c.getContext('2d')
  let s = semilla; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647
  const p = (x, y, col) => { g.fillStyle = col; g.fillRect(((Math.round(x) % ancho) + ancho) % ancho, Math.round(y), 1, 1) }
  const bolas = []
  for (let f = 0; f < 2; f++) for (let i = 0; i < n; i++) bolas.push([i * ancho / n + rnd() * 12 + f * ancho / n / 2, y0 + f * 6 + rnd() * 5, (r0 + rnd() * (r1 - r0)) * (f ? 0.9 : 1)])
  bolas.sort((a, b) => a[1] - b[1])
  const cuerpo = (x, y) => { const d = y - y0, i = d < 8 ? 2 : d < 16 ? 3 : 4; return (d === 8 || d === 16) && (x + y) % 2 ? ramp[i - 1] : ramp[i] }
  for (const [cx, cy, r] of bolas) for (let x = Math.round(cx - r); x <= cx + r; x++) { const sup = Math.round(cy - Math.sqrt(Math.max(0, r * r - (x - cx) ** 2)) / 1.15); for (let y = sup; y < PH; y++) { const h = y - sup; p(x, y, h === 0 ? ramp[0] : h <= 2 ? (h === 2 && (x + y) % 2 ? cuerpo(x, y) : ramp[1]) : cuerpo(x, y)) } }
  const d = g.getImageData(0, 0, ancho, PH).data
  for (let x = 0; x < ancho; x++) for (let y = y0 + 6; y < PH; y++) if (!d[(y * ancho + x) * 4 + 3]) p(x, y, cuerpo(x, y))
  return c
}
let capas
function capasProyector() {
  capas ??= {
    CIELO: pintarCielo(),
    NUBES_LEJOS: capaNubes(17, 132, 7, 13, 24, [AP.gr[9], AP.ca[5], AP.gr[8], AP.gr[7], AP.az[4]]),
    NUBES_CERCA: capaNubes(41, 162, 9, 15, 18, [AP.na[5], AP.ca[4], AP.ca[3], AP.mo[2], AP.mo[1]]),
  }
  return capas
}

/* La nave del curso. HT: la baranda de adelante (tapa las piernas de la fila de adelante).
   Detrás de la baranda se ve la cubierta, un piso de tablas visto un poco desde arriba: ahí se para la fila de atrás. */
const HT = 138, CUBIERTA = HT - 13, PROA = 140, PUNTA = 178   // desde PROA los dos costados se juntan en la punta
function nave(g, px) {
  const cx = 38, cy = HT - 72, rx = 86, ry = 34   // el globo, más adelante sobre la nave
  ;[[32, 26], [56, 50], [80, 76], [102, 104], [116, 128]].forEach(([a, b]) => { const y0 = cy + Math.round(ry * Math.sqrt(Math.max(0, 1 - ((a - cx) / rx) ** 2))) - 1; for (let i = 0; i <= 40; i++) { const t = i / 40; px(Math.round(a + (b - a) * t), Math.round(y0 + (CUBIERTA - 5 - y0) * t), AP.gr[4]) } })
  for (let y = cy - ry; y <= cy + ry; y++) for (let x = 0; x <= cx + rx + 5; x++) {
    const nx = (x - cx) / rx, ny = (y - cy) / ry; if (nx * nx + ny * ny > 1) continue
    const borde = (((x + 1 - cx) / rx) ** 2 + ny * ny > 1) || (nx * nx + ((y - 1 - cy) / ry) ** 2 > 1) || (nx * nx + ((y + 1 - cy) / ry) ** 2 > 1)
    const lum = -ny * 0.7 + nx * 0.5, media = Math.sqrt(Math.max(0, 1 - ny * ny))
    let col = lum > 0.45 ? AP.gr[9] : lum > 0.05 ? AP.gr[8] : lum > -0.35 ? AP.gr[7] : AP.gr[6]
    for (const m of [-0.2, 0.2, 0.5, 0.75, 0.93]) if (Math.abs(nx - m * media) < 0.5 / rx) col = lum > 0 ? AP.na[5] : AP.na[4]
    if (Math.abs(ny) < 0.5 / ry || Math.abs(Math.abs(ny) - 0.55) < 0.5 / ry) col = lum > 0 ? AP.na[5] : AP.na[4]
    if (borde) col = AP.gr[3]
    px(x, y, col)
  }
  for (let i = 1; i <= 5; i++) px(cx + rx + i, cy, AP.na[4])
}
/* La cubierta: tablas a lo largo de la nave, con la baranda de atrás (detrás de la fila de atrás) */
/* La proa vista un poco desde arriba: el borde cercano (el casco) sube, el borde lejano (la pared del otro lado)
   baja, y los dos se juntan en la misma punta, como una V. La cubierta queda entre ellos, en triángulo. */
const PUNTA_Y = HT - 15
const uProa = (x) => Math.min(1, Math.max(0, (x - PROA) / (PUNTA - PROA)))
const bordeCerca = (x) => x <= PROA ? HT : Math.round(HT + (PUNTA_Y - HT) * uProa(x) ** 1.3)
const bordeLejos = (x) => x <= PROA ? CUBIERTA - 4 : Math.round(CUBIERTA - 4 + (PUNTA_Y - (CUBIERTA - 4)) * uProa(x))
const pieLejos = (x) => x <= PROA ? CUBIERTA : Math.round(CUBIERTA + (PUNTA_Y - CUBIERTA) * uProa(x))
function pintarCubierta(px) {
  for (let y = CUBIERTA - 4; y < CUBIERTA; y++) for (let x = 0; x < PROA; x++) if (x % 9 === 0 || y === CUBIERTA - 4) px(x, y, y === CUBIERTA - 4 ? AP.ca[2] : AP.ca[1])   // baranda de atrás: pasamanos y postes
  for (let x = 0; x < PUNTA; x++) for (let y = pieLejos(x); y < Math.min(HT, bordeCerca(x)); y++) {
    const f = y - CUBIERTA
    let col = ((f % 3) + 3) % 3 === 2 ? AP.ca[2] : (((f % 6) + 6) % 6 < 3 ? AP.ca[4] : AP.ca[3])   // tablas con sus junturas
    if (((f % 3) + 3) % 3 !== 2 && (x + f * 11) % 23 === 0) col = AP.ca[2]                       // las uniones entre tablas, alternadas
    if (y === pieLejos(x)) col = AP.ca[2]
    px(x, y, col)
  }
  /* El otro costado de la proa (se ve su cara de adentro): se va angostando hasta la punta */
  for (let x = PROA; x < PUNTA; x++) {
    const top = bordeLejos(x), pie = pieLejos(x)
    px(x, top - 1, AP.gr[1])
    for (let y = top; y < pie; y++) px(x, y, y === top ? AP.ca[3] : ((x - PROA) % 5 === 0 ? AP.ca[0] : AP.ca[1]))
  }
}
function casco(px) {
  /* El borde de arriba es bordeCerca; la quilla se curva hacia arriba hasta la misma punta */
  const arriba = bordeCerca
  const abajo = (x) => x < PUNTA - 50 ? HT + 30 : Math.round(HT + 30 - ((x - (PUNTA - 50)) / 50) ** 1.6 * (HT + 30 - PUNTA_Y))
  for (let x = 0; x <= PUNTA; x++) { const a = arriba(x), b = abajo(x); if (b < a) continue; for (let y = a; y <= b; y++) { const f = y - a; let col = f <= 1 ? AP.ca[3] : (f % 4 === 0 ? AP.ca[0] : AP.ca[1]); if (f === 5 || f === 17) col = AP.na[4]; if (f >= 9 && f <= 11 && x > 2 && x < PROA - 4 && x % 7 >= 1 && x % 7 <= 3) col = f === 9 ? AP.na[4] : AP.na[5]; if (y === a || y === b || x === PUNTA) col = AP.gr[1]; px(x, y, col) } }
  for (let x = 0; x <= PUNTA - 6; x += 7) px(x, arriba(x) - 1, AP.na[4])
  /* En la punta, un poste chico con el farol */
  for (let y = PUNTA_Y - 6; y < PUNTA_Y; y++) { px(PUNTA, y, AP.ca[1]); px(PUNTA + 1, y, AP.gr[1]); px(PUNTA - 1, y, AP.gr[1]) }
  px(PUNTA - 1, PUNTA_Y - 10, AP.gr[1]); px(PUNTA, PUNTA_Y - 10, AP.gr[1]); px(PUNTA + 1, PUNTA_Y - 10, AP.gr[1])
  px(PUNTA - 1, PUNTA_Y - 9, AP.na[5]); px(PUNTA, PUNTA_Y - 9, AP.na[5]); px(PUNTA + 1, PUNTA_Y - 9, AP.na[4])
  px(PUNTA - 1, PUNTA_Y - 8, AP.na[4]); px(PUNTA, PUNTA_Y - 8, AP.na[5]); px(PUNTA + 1, PUNTA_Y - 8, AP.na[4]); px(PUNTA, PUNTA_Y - 7, AP.gr[1])
}

/* La nube de Lexicón: varias bolas blancas con relieve y contorno, para que no se pierda en el mar de nubes */
function nubeLexicon(px, cx, pie) {
  const bolas = [[-30, 12, 5], [-22, 8, 8], [-9, 4, 10], [6, 3, 11], [21, 6, 9], [31, 11, 6], [-2, 11, 11]], fondo = pie + 17
  const dentro = (x, y) => y <= fondo && bolas.some(([a, b, r]) => (x - cx - a) ** 2 + (y - pie - b) ** 2 <= r * r)
  for (let y = pie - 10; y <= fondo + 1; y++) for (let x = cx - 40; x <= cx + 40; x++) {
    if (!dentro(x, y)) { if (dentro(x + 1, y) || dentro(x - 1, y) || dentro(x, y + 1) || dentro(x, y - 1)) px(x, y, AP.gr[6]); continue }
    const arribaBola = bolas.some(([a, b, r]) => (x - cx - a) ** 2 + (y - pie - b) ** 2 <= r * r && y - pie - b < -r * 0.35)
    px(x, y, y > fondo - 3 ? AP.gr[7] : y > fondo - 7 ? AP.gr[8] : arribaBola ? AP.gr[9] : AP.gr[8])
  }
}


/* ======================= El motor de la escena ======================= */
export const PW_BONUS = PW, PH_BONUS = PH
const LX = 268, LP = 124
const ORDEN_HEROES = Object.keys(CHIBIS)
/* Puestos en la cubierta: primero la fila de adelante (8, pegada a la baranda), después la de atrás (7, de pie
   sobre las tablas). Con pocos alumnos solo se llena la de adelante. */
const puesto = (i) => i < 8 ? { x: 16 + i * 15, y: HT + 3 - 21, atras: false } : { x: 23 + (i - 8) * 15, y: CUBIERTA + 6 - 21, atras: true }
const azar = (a, b) => a + Math.random() * (b - a)

export class EscenaBonus {
  constructor(canvas, sonido) {
    this.sonido = sonido   // sonido(nombre): los efectos de Lexicón salen del proyector
    this.cv = canvas; canvas.width = PW; canvas.height = PH
    this.g = canvas.getContext('2d')
    this.capa = mk(PW, PH); this.gp = lienzoPear36(this.capa.getContext('2d'))
    this.pxP = (x, y, col) => { this.gp.fillStyle = col; this.gp.fillRect(Math.round(x), Math.round(y), 1, 1) }
    const atras = mk(PW, PH), ga = atras.getContext('2d'), pa = (x, y, col) => { ga.fillStyle = col; ga.fillRect(Math.round(x), Math.round(y), 1, 1) }
    nave(ga, pa); pintarCubierta(pa); this.naveAtras = atras
    const frente = mk(PW, PH), gf = frente.getContext('2d'); casco((x, y, col) => { gf.fillStyle = col; gf.fillRect(Math.round(x), Math.round(y), 1, 1) }); this.naveFrente = frente
    const nube = mk(PW, PH), gn = nube.getContext('2d'); nubeLexicon((x, y, c) => { gn.fillStyle = c; gn.fillRect(x, y, 1, 1) }, LX, LP); this.nube = nube
    this.datos = { fase: 'intro', aciertos: {}, heroes: {}, meta: 12 }
    this.reiniciar()
    this.antes = 0
    this.raf = requestAnimationFrame((t) => this.cuadro(t))
  }
  reiniciar() {
    Object.assign(this, { previos: {}, hojas: [], burbujas: [], dardos: [], vuelan: [], confeti: [], marcas: 0, birrete: true, lentes: true, proxHoja: 0, inicioJuego: null, rindio: false })
  }
  destruir() { cancelAnimationFrame(this.raf) }

  /* fase, aciertos {id: n}, heroes {id: heroId}, meta */
  actualizar(d) {
    if (d.fase === 'intro' && this.datos.fase !== 'intro') this.reiniciar()
    this.datos = { ...this.datos, ...d }
  }

  /* Los héroes del curso en la cubierta (sin repetir, hasta 15) y el puesto de cada alumno */
  cubierta() {
    const ids = Object.keys(this.datos.heroes || {}).sort()
    const heroes = [...new Set(ids.map((id) => this.datos.heroes[id]).filter((h) => CHIBIS[h]))]
    for (const h of ORDEN_HEROES) if (heroes.length < 1) heroes.push(h)   // sin nadie con héroe: al menos uno en la nave
    return heroes.slice(0, 15)
  }

  marca(n, t) {
    if (n < 3) this.sonido?.("lexiconGoal")
    if (n === 1) { this.birrete = false; this.vuelan.push({ tipo: 'birrete', x: LX - 9, y: LP - 33, vx: 34, vy: -42, t0: t }) }
    if (n === 2) { this.lentes = false; this.vuelan.push({ tipo: 'lentes', x: LX - 9, y: LP - 24, vx: 10, vy: -10, t0: t }) }
  }

  cuadro(t) {
    this.raf = requestAnimationFrame((tt) => this.cuadro(tt))
    const dt = Math.min(0.05, (t - this.antes) / 1000); this.antes = t
    const { fase, aciertos = {}, heroes = {}, meta = 12 } = this.datos
    const jugando = fase === 'juego'
    if (jugando && this.inicioJuego == null) { this.inicioJuego = t; this.sonido?.("lexiconHoot") }
    const enCubierta = this.cubierta()

    /* Lexicón: cada 1,6 s arranca una hoja y la lanza; se deshace en 3–4 burbujas al centro del cielo */
    let modo = 'sopla'
    if (jugando) {
      const e = t - this.inicioJuego, c = e % 1600, n = Math.floor(e / 1600)
      modo = c < 450 ? 'arranca' : c < 700 ? 'lanza' : 'sopla'
      if (c >= 450 && n >= this.proxHoja) {
        this.proxHoja = n + 1
        this.sonido?.("lexiconPage")
        this.hojas.push({ x0: LX - 22, y0: LP - 26, x: LX - 22, y: LP - 26, tx: azar(150, 228), ty: azar(30, 78), t0: t, dur: 1000 })
      }
    }
    for (const h of this.hojas) {
      const k = (t - h.t0) / h.dur
      if (k < 1) { h.x = h.x0 + (h.tx - h.x0) * k; h.y = h.y0 + (h.ty - h.y0) * k - Math.sin(k * Math.PI) * 14 }
      else if (!h.rota) { h.rota = t; const nb = 3 + Math.floor(Math.random() * 2); for (let i = 0; i < nb; i++) this.burbujas.push({ x: h.tx + azar(-10, 10), y: h.ty + azar(-6, 6), r: 4 + Math.floor(Math.random() * 3), vx: azar(-6, -2), vy: azar(9, 14), estado: 'nace', tn: t }) }
    }
    this.hojas = this.hojas.filter((h) => !h.rota || t - h.rota < 300)
    for (const b of this.burbujas) {
      if (b.estado === 'pop') continue
      b.x += b.vx * dt; b.y += b.vy * dt
      if (b.estado === 'nace' && t - b.tn > 250) b.estado = 'cae'
      if (b.y > 150) { b.estado = 'pop'; b.tp = t; b.perdida = true }
    }
    this.burbujas = this.burbujas.filter((b) => b.estado !== 'pop' || t - b.tp < 250)

    /* Aciertos nuevos de cada alumno → un dardo desde su chibi (o desde cualquiera, si su héroe no cabe) */
    for (const [id, n] of Object.entries(aciertos)) {
      const antes = this.previos[id] ?? (jugando ? 0 : n)
      this.previos[id] = n
      if (!jugando) continue
      for (let k = 0; k < Math.min(3, n - antes); k++) {
        let b = this.burbujas.find((x) => x.estado === 'cae' && !x.apuntada)
        if (!b) { b = { x: azar(150, 228), y: azar(40, 95), r: 5, vx: azar(-6, -2), vy: azar(9, 14), estado: 'cae', tn: t }; this.burbujas.push(b) }
        b.apuntada = true
        let i = enCubierta.indexOf(heroes[id]); if (i < 0) i = Math.floor(Math.random() * enCubierta.length)
        const p = puesto(i)
        this.dardos.push({ x: p.x + 8, y: p.y + 10, b })
      }
    }
    for (const d of this.dardos) {
      const dx = d.b.x - d.x, dy = d.b.y - d.y, dist = Math.hypot(dx, dy), paso = 220 * dt
      if (dist <= paso + d.b.r) { d.fuera = true; if (d.b.estado !== 'pop') { d.b.estado = 'pop'; d.b.tp = t } }
      else { d.x += dx / dist * paso; d.y += dy / dist * paso }
    }
    this.dardos = this.dardos.filter((d) => !d.fuera)

    /* Metas */
    const total = Object.values(aciertos).reduce((a, n) => a + (n || 0), 0)
    const p = meta > 0 ? total / meta : 0, ya = p >= 1 ? 3 : p >= 2 / 3 ? 2 : p >= 1 / 3 ? 1 : 0
    while (this.marcas < ya) { this.marcas++; this.marca(this.marcas, t) }
    const rinde = this.marcas >= 3
    if (rinde && !this.rindio) {
      this.rindio = true; this.sonido?.("lexiconSurrender")
      this.burbujas.forEach((b) => { b.estado = 'pop'; b.tp = t }); this.hojas = []
      for (let i = 0; i < 60; i++) this.confeti.push({ x: azar(0, PW), y: azar(-90, 0), vy: azar(20, 45), c: ['#FFE478', '#66FFE3', '#FF6B97', '#8FDE5D'][i % 4] })
    }

    /* ---- dibujo ---- */
    const { CIELO, NUBES_LEJOS, NUBES_CERCA } = capasProyector()
    const g = this.g, gp = this.gp, pxP = this.pxP
    const oy = Math.round(Math.sin(t / 900) * 2)
    g.drawImage(CIELO, 0, 0)
    const des = (c, v) => { const o = -(Math.floor(t * v) % PW); g.drawImage(c, o, 0); g.drawImage(c, o + PW, 0) }
    des(NUBES_LEJOS, 0.003)
    g.drawImage(this.naveAtras, 0, oy)
    gp.clearRect(0, 0, PW, PH)
    const celebra = fase === 'final'
    const orden = enCubierta.map((h, i) => [h, i]).sort((a, b) => (puesto(b[1]).atras ? 1 : 0) - (puesto(a[1]).atras ? 1 : 0))
    for (const [h, i] of orden) { const q = puesto(i); chibi(gp, CHIBIS[h], q.x, q.y + oy, celebra && Math.floor(t / 260 + i) % 2 === 0) }
    g.drawImage(this.capa, 0, 0)
    g.drawImage(this.naveFrente, 0, oy)
    gp.clearRect(0, 0, PW, PH)
    const ly = Math.round(Math.sin(t / 700))
    g.drawImage(this.nube, 0, ly)
    lexiconBuho(pxP, LX, LP + ly, rinde ? 'rinde' : modo, this.birrete, this.lentes)
    for (const h of this.hojas) {
      if (!h.rota) { hoja(pxP, h.x, h.y, Math.floor((t - h.t0) / 120) % 2 ? 'canto' : 'plana'); if (t - h.t0 < 500) rayas(pxP, h.x + 7, h.y + 2) }
      else hoja(pxP, h.tx - 6, h.ty - 5, 'pedazos')
    }
    for (const b of this.burbujas) {
      if (b.estado === 'pop') { if (!b.perdida) burbuja(pxP, Math.round(b.x), Math.round(b.y), b.r, true) }
      else burbuja(pxP, Math.round(b.x), Math.round(b.y), b.estado === 'nace' ? Math.max(1, Math.round(b.r * (t - b.tn) / 250)) : b.r, false)
    }
    for (const d of this.dardos) dardoChico(pxP, Math.round(d.x), Math.round(d.y))
    for (const v of this.vuelan) {
      const s = (t - v.t0) / 1000; if (s > 2.5) continue
      const x = Math.round(v.x + v.vx * s), y = Math.round(v.y + v.vy * s + 60 * s * s)
      if (v.tipo === 'birrete') { const b = []; for (let i = 0; i < 13; i++) for (let j = 0; j < 3; j++) b.push([x + i, y + j + Math.round(i * 0.25 * Math.sin(s * 6)), j === 0 ? '#43434F' : '#272736']); conContorno(pxP, b); pxP(x + 12, y + 3, '#FFE478'); pxP(x + 12, y + 4, '#FFE478') }
      else for (const ox of [0, 10]) for (let a = 0; a < 20; a++) { const q = a / 20 * Math.PI * 2; pxP(Math.round(x + ox + Math.cos(q) * 3), Math.round(y + Math.sin(q) * 3), '#FFE478') }
    }
    for (const c of this.confeti) { c.y += c.vy * dt; if (c.y > PH) c.y -= PH + 20; pxP(c.x, c.y, c.c); pxP(c.x + 1, c.y, c.c) }
    g.drawImage(this.capa, 0, 0)
    des(NUBES_CERCA, 0.008)
  }
}
