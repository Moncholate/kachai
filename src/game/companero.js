/* ============================================================================
   EL COMPAÑERO EN EL CELULAR
   ----------------------------------------------------------------------------
   Tras cada pregunta, el personaje del alumno reacciona en un escenario chico
   bajo el veredicto (ver player/Heroes.jsx, HeroCompanion). Momentos:
     esperando     respuesta enviada: respira en guardia, con una burbuja "…"
     correcta      celebra (algunos, a su manera)
     sube          correcta y la racha llega a 3, 5 u 8: junta energía, destello y se enciende el nuevo nivel
     parcial       "casi": se rasca la cabeza
     incorrecta    de ÁNIMO, nunca derrotado; la racha se apaga en silencio
     sinRespuesta  saluda: "¡vamos, la próxima!"
   Cada personaje puede tener sus propios gestos (GESTOS). Escenas de 112 × 76
   como los duelos, sobre el escenario de la canción; se diseñaron con la
   profesora en previa-companero.html (oct-2026).
   ========================================================================== */
import { hdPose, HD_OX, HD_OY, hdColor, notaMusical, gataCalico, gataGordita, dagaUchis } from './heroesHD.js'
import { conRacha, oscurece, pintaPersonaje } from './racha.js'
import { pintarEscenario } from './fondos.js'
import { CRUDO, lienzoPear36 } from './pear36.js'

export const W = 112, H = 76
const SUELO = 62, YB = SUELO - (HD_OY + 39), X = Math.round(W / 2 - HD_OX - 15)

function fondo(g, t, escenario) { const a = g[CRUDO]; g[CRUDO] = true; pintarEscenario(g, escenario, t); g[CRUDO] = a }
const sombra = (g, dy = 0) => { g.fillStyle = 'rgba(10,25,12,.45)'; g.fillRect(W / 2 - 7, SUELO + 1, 14, 2); g.fillRect(W / 2 - 5, SUELO + 3, 10, 1) }
const px = (g, x, y, col, w = 1, h = 1) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), w, h) }

/* El brazo de cerca en otra posición ([mano, codo] relativos a su hombro); el del arma queda en guardia. */
function conBrazo(hd, mano, codo) {
  if (!hd.brazoCerca) return hd
  return { ...hd, brazoCerca: { ...hd.brazoCerca, poses: {}, encima: false, todas: [mano, codo] } }
}
function dibuja(g, c, p, dy = 0) {
  if (c.hd.proyectilAtras) c.hd.proyectilAtras(g, X, YB + dy, p)
  pintaPersonaje(g, c.hd, p, X, YB + dy)
}
const cabeza = () => [W / 2 + 1, YB + HD_OY + 1]   // sobre la cabeza, más o menos

/* ---------- Esperando a los demás: en guardia, respirando, con una burbuja de puntos ---------- */
function esperando(g, t, c) {
  dibuja(g, c, { ...hdPose(c.hd, 'guardia', t), t })
  const [cx, cy] = cabeza(), bx = cx + 9, by = cy - 9
  px(g, bx - 1, by, '#FFFFEB', 13, 7); px(g, bx, by - 1, '#FFFFEB', 11, 9)   // burbuja redondeada
  px(g, bx - 1, by + 8, '#FFFFEB', 2, 2); px(g, bx - 3, by + 10, '#FFFFEB')    // colita hacia la cabeza
  const k = Math.floor(t / 400) % 4
  for (let i = 0; i < 3; i++) px(g, bx + 2 + i * 3, by + 3 - (k === i + 1 ? 1 : 0), i < k ? '#272736' : '#C2C2D1', 2, 2)
}

/* ---------- Correcta: la celebración de siempre + estrellitas ---------- */
function estrella(g, x, y, f, col) {
  if (f < 0) return
  const r = [1, 2, 1][f] ?? 0; if (!r) { px(g, x, y, col); return }
  px(g, x - r, y, col, r * 2 + 1, 1); px(g, x, y - r, col, 1, r * 2 + 1); px(g, x, y, '#FFFFEB')
}
function correcta(g, t, c) {
  dibuja(g, c, { ...hdPose(c.hd, 'victoria', t), t })
  const [cx, cy] = cabeza()
  ;[[-16, 4, 0], [17, 0, 300], [-10, -6, 650], [13, 12, 900]].forEach(([dx, dy, d]) => {
    const k = ((t + d) % 1200) / 1200
    estrella(g, cx + dx, cy + dy - k * 3, Math.floor(k * 4) - 1, k < 0.5 ? '#FFE478' : '#F2A65E')
  })
}

/* ---------- Sube la racha: se agacha juntando energía, destello y celebra con el nivel nuevo ---------- */
const ANTES = { 3: 0, 5: 3, 8: 5 }
export const PERIODO_SUBE = 5200
function subeRacha(g, t, heroe, nueva, escenario) {
  const T = t % PERIODO_SUBE, FLASH = 1100
  const c = conRacha(heroe, T < FLASH ? ANTES[nueva] : nueva)
  fondo(g, t, escenario); oscurece(g, c); sombra(g)
  const [cx] = cabeza(), cy = YB + HD_OY + 22   // el pecho
  if (T < FLASH) {
    const k = T / FLASH
    dibuja(g, c, { ...hdPose(c.hd, 'guardia', t), agacha: k > 0.3 ? 2 : 1, t })
    for (let i = 0; i < 10; i++) {   // chispas que convergen al pecho
      const a = i * 0.628 + T / 500, r = 26 * (1 - ((k * 1.6 + i * 0.1) % 1))
      px(g, cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.8, i % 2 ? '#FFE478' : '#FFFFEB')
    }
  } else {
    const propia = GESTOS[heroe.id]?.sube
    if (!propia || !propia(g, T - FLASH, c, nueva, t)) dibuja(g, c, { ...hdPose(c.hd, 'victoria', T - FLASH + 400), t })
    const k = (T - FLASH) / 450
    if (k < 1) {   // anillo de luz que se abre y destello en toda la escena
      g.save(); g.globalAlpha = 0.7 * (1 - k); px(g, 0, 0, '#FFFFEB', W, H); g.restore()
      const r = 4 + k * 40
      for (let i = 0; i < 28; i++) { const a = (i / 28) * Math.PI * 2; px(g, cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.75, nueva >= 8 ? '#66FFE3' : '#FFE478', 2, 2) }
    }
  }
}

/* ======================= GESTOS PROPIOS DE CADA PERSONAJE =======================
   Lo común sirve para todos; aquí cada personaje puede cambiar lo que quiera, de a poco:
     brazo: 'arma'   hace los gestos con el brazo del arma (cuando el brazo de cerca no se ve)
     [momento]       (g, t, c) => dibuja su propia reacción en vez de la común
                     (esperando, correcta, parcial, incorrecta, sinRespuesta)
     sube            (g, T, c, nueva, t) => después del destello de la racha; devuelve false para usar la común */
const GESTOS = {
  agattita: { brazo: 'arma' },    // su patita gris se perdía contra la cabeza gris
  edith: { brazo: 'arma', incorrecta: (g, t, c) => nubeEdith(g, t, c) },   // el brazo oscuro se perdía contra la túnica
  kenny: { incorrecta: (g, t, c) => acordeKenny(g, t, c) },
  malala: { incorrecta: (g, t, c) => gataMalala(g, t, c) },
  latte: { incorrecta: (g, t, c) => barajaLatte(g, t, c) },
  uchis: { correcta: (g, t, c) => malabaresUchis(g, t, c) },
  malia: { incorrecta: (g, t, c) => ollaMalia(g, t, c) },
  tivan: { incorrecta: (g, t, c) => pocionTivan(g, t, c) },
  janet: { correcta: (g, t, c) => flechaHojas(g, t, c) },
  jelic: { incorrecta: (g, t, c) => juramentoJelic(g, t, c) },
  cupe: { incorrecta: (g, t, c) => aullidoCupe(g, t, c) },   // en el podio ya saluda con el florete
  uzu: { incorrecta: (g, t, c) => pechoUzu(g, t, c) },   // en el podio ya prueba la mermelada del cucharón   // al acertar ya lanza sus naipes como fuegos artificiales
  july: { correcta: (g, t, c) => yunqueJuly(g, t, c) },
  xitin: { sube: (g, T, c, nueva, t) => nueva >= 8 && osoXitin(g, T, c, t) },
  /* El águila le tapaba el brazo: en sus gestos se le sube del hombro y aletea sobre su cabeza. */
  patroclus: {
    parcial: (g, t, c) => conAguilaArriba(g, t, c, parcial),
    incorrecta: (g, t, c) => conAguilaArriba(g, t, c, incorrecta),
    sinRespuesta: (g, t, c) => conAguilaArriba(g, t, c, sinRespuesta),
  },
}
const conArma = (c) => !c.hd.brazoCerca || GESTOS[c.id]?.brazo === 'arma'

/* ---------- Parcial: "casi": se rasca la cabeza (detrás de la oreja) y le cae una gotita ---------- */
function gotita(g, t) {
  const [cx, cy] = cabeza(), k = (t % 1600) / 1600
  if (k < 0.7) { const y = cy + 2 + k * 6; px(g, cx + 9, y, '#4DA6FF', 1, 2); px(g, cx + 8, y + 1, '#4DA6FF', 3, 2); px(g, cx + 9, y + 1, '#FFFFEB') }
}
function parcial(g, t, c) {
  if (conArma(c)) {   // con el arma en la mano no se rasca: asiente con la cabeza
    dibuja(g, c, { ...hdPose(c.hd, 'guardia', t), agacha: Math.floor(t / 300) % 2, bob: 0, t })
    return gotita(g, t)
  }
  const rasca = Math.floor(t / 160) % 2   // mano y codo a la distancia de siempre (antes el brazo se estiraba de más)
  const hd = conBrazo(c.hd, [1 + rasca, -8], [-4, -4])
  dibuja(g, { ...c, hd }, { ...hdPose(hd, 'guardia', t), t })
  gotita(g, t)
}

/* ---------- Incorrecta: de ánimo. Puño al aire dos veces con saltito, y vuelve a la guardia, decidido ---------- */
function incorrecta(g, t, c) {
  const T = t % 2600, arma = conArma(c)
  const pump = T < 1300 ? Math.floor(T / 325) % 2 : -1   // 0 = arriba, 1 = abajo; -1 = guardia
  let hd = c.hd, p
  if (pump === 0) {
    if (arma) p = { ...hdPose(hd, 'victoria', 500), t }   // el arma en alto
    else { hd = conBrazo(c.hd, [-3, -10], [-5, -3]); p = { ...hdPose(hd, 'guardia', t), agacha: 0, bob: -2 } }
  } else if (pump === 1) {
    if (!arma) hd = conBrazo(c.hd, [0, -3], [-4, 1])
    p = { ...hdPose(hd, 'guardia', t), agacha: 2 }
  } else p = { ...hdPose(hd, 'guardia', t), t }
  dibuja(g, { ...c, hd }, p)
  if (pump === 0) {   // rayitas de energía junto a lo que levanta
    const [cx, cy] = cabeza(), x = arma ? cx + 16 : cx - 14
    px(g, x, cy - 2, '#FFE478', 1, 2); px(g, x + (arma ? 2 : -3), cy + 1, '#FFE478', 2, 1); px(g, x + (arma ? -2 : 2), cy - 5, '#FFE478', 1, 2)
  }
}

/* ---------- Sin respuesta: saluda para decir "¡vamos, la próxima!" ---------- */
function sinRespuesta(g, t, c) {
  const lado = Math.floor(t / 220) % 2
  if (conArma(c)) return dibuja(g, c, { ...hdPose(c.hd, 'victoria', lado ? 500 : 700), bob: 0, agacha: 0, t })   // agita el arma
  const hd = conBrazo(c.hd, lado ? [-6, -10] : [-2, -11], [-5, -3])
  dibuja(g, { ...c, hd }, { ...hdPose(hd, 'guardia', t), t })
}

/* ---------- Kenny al fallar: rasguea un acorde de ánimo y salen notas del laúd ---------- */
const NOTAS = ['#FFE478', '#66FFE3', '#F2A65E']
function acordeKenny(g, t, c) {
  const T = t % 2600, toca = T < 1700
  const rasgueo = toca && Math.floor(T / 110) % 2
  const mano = rasgueo ? [[3, 8], [-2, 6]] : [[3, 6], [-2, 5]]   // las mismas manos del rasgueo del podio
  const hd = { ...c.hd, brazoCerca: { ...c.hd.brazoCerca, poses: { guardia: mano } } }
  const golpe = toca ? Math.floor(T / 220) % 2 : 0   // cabecea al ritmo
  dibuja(g, { ...c, hd }, { ...hdPose(hd, 'guardia', t), agacha: golpe, bob: 0, t })
  const lx = X + HD_OX + 20, ly = YB + HD_OY + 24   // la caja del laúd
  for (let i = 0; i < 3; i++) {
    const k = (T - i * 380) / 1300
    if (k < 0 || k > 1) continue
    const nx = Math.round(lx + 4 + i * 5 + k * 6 + Math.sin(k * 6 + i) * 2), ny = Math.round(ly - 4 - k * 22)
    notaMusical(g, [[nx, ny, 2, 2], [nx + 1, ny - 4, 1, 5], [nx + 2, ny - 4, 1, 1]], NOTAS[i])
  }
}

/* ---------- Malala al fallar: la gata chica se le acerca, se le restriega en las piernas y ronronea (corazoncitos) ----------
   No se repite: una vez que llegó, se queda restregándose. La gordita sigue sentada atrás, como siempre. */
const CORAZON = [[1, -3], [3, -3], [0, -2], [1, -2], [2, -2], [3, -2], [4, -2], [1, -1], [2, -1], [3, -1], [2, 0]]
function gataMalala(g, t, c) {
  const hd = { ...c.hd, atras: (px, p) => {   // solo la gordita detrás; la chica se dibuja delante
    const baja = (p.bob || 0) + (p.agacha || 0)
    gataGordita((x, y, col) => px(x, y - baja, col), -2, 27, p.t, false)
  } }
  const llega = Math.min(1, t / 700)
  dibuja(g, { ...c, hd }, { ...hdPose(hd, 'guardia', t), agacha: llega >= 1 ? 1 : 0, bob: 0, t })   // baja la vista a mirarla
  const color = hdColor(c.hd), pxE = (x, y, col) => { g.fillStyle = color(col); g.fillRect(X + HD_OX + x, YB + HD_OY + y, 1, 1) }
  const restriega = llega >= 1 ? Math.floor(t / 260) % 2 : 0
  const gx = Math.round(-8 + llega * 11) - restriega, gy = 30 - (llega < 1 && Math.floor(t / 120) % 2 ? 1 : 0)   // pasitos al caminar
  gataCalico(pxE, gx, gy, t, false)
  if (llega >= 1) {   // ronronea: corazones que suben
    const k = ((t - 700) % 1100) / 1100
    if (k < 0.75) CORAZON.forEach(([x, y]) => pxE(gx - 3 + x, gy - 3 + y - Math.round(k * 6), '#F472B6'))
  }
}

/* ---------- July al acertar: parte una roca de un martillazo, y celebra junto a los pedazos ----------
   (Antes era un yunque: gris junto al mazo de hierro, apenas se veía.) La roca lleva musgo arriba para que se
   distinga del mazo; al golpe se parte en dos mitades, saltan piedritas y sale polvo. En la previa se repite cada
   5 s; en el juego quedaría la roca partida mientras July celebra. */
const ROCA = [
  '.....KKKKKK.....',
  '...KKGGGGGGKK...',
  '..KGGgGGGgGGGK..',
  '.KGGGGLGGGLGGLK.',
  '.KLGLLLLLLLLLMK.',
  'KLLLLLLLLLLLLMMK',
  'KLLLLLLLLLLLMMMK',
  'KLLLLLLLLLLMMMmK',
  'KLLLLMMMMMMMMmmK',
  '.KLMMMMMMMMMmmK.',
  '.KMMMMMMMmmmmmK.',
  '..KKKKKKKKKKKK..',
]
const COL_ROCA = { K: '#272736', G: '#8FDE5D', g: '#3CA370', L: '#C2C2D1', M: '#7E7E8F', m: '#606070' }
const GOLPE_JULY = 900, CICLO_JULY = 5000
function roca(g, x0, y0, k) {   // k: 0 entera; de 0 a 1 se abre en dos mitades que caen hacia los lados
  const abre = Math.min(1, k * 3), izq = -Math.round(abre * 3), der = Math.round(abre * 4), cae = abre > 0.5 ? 1 : 0
  ROCA.forEach((f, y) => [...f].forEach((ch, x) => {
    if (!COL_ROCA[ch]) return
    const mitad = x < 8 ? izq : der
    px(g, x0 + x + mitad, y0 + y + (k > 0 && y < 10 ? cae : 0), COL_ROCA[ch])
  }))
  if (k > 0) for (let y = 1; y < 11; y++) { px(g, x0 + 7 + izq, y0 + y + cae, '#272736'); px(g, x0 + 8 + der, y0 + y + cae, '#272736') }   // las caras partidas
}
function piedritas(g, cx, cy, k) {
  if (k <= 0) return
  for (let i = 0; i < 7; i++) {
    const vx = (i - 3) * 4.5, vy = -10 - (i % 3) * 4, tt = Math.min(1, k) * 1.2
    const x = cx + vx * tt, y = Math.min(cy + 8, cy + vy * tt + 22 * tt * tt)   // parábola hasta el suelo
    px(g, x, y, i % 2 ? '#C2C2D1' : '#7E7E8F', 2, i % 3 ? 1 : 2)
  }
  if (k < 0.6) {   // polvo que se abre y se desvanece
    g.save(); g.globalAlpha = 0.5 * (1 - k / 0.6); g.fillStyle = '#C2C2D1'
    for (let i = 0; i < 5; i++) { const r = 2 + k * 10, x = cx + (i - 2) * (3 + k * 8); g.fillRect(Math.round(x - r / 2), Math.round(cy + 6 - r / 3), Math.round(r), Math.round(r / 2)) }
    g.restore()
  }
}
function yunqueJuly(g, t, c) {
  const T = t % CICLO_JULY, x0 = X + HD_OX + 29, y0 = YB + HD_OY + 28   // donde cae el mazo, apoyada en el suelo
  const k = T < GOLPE_JULY ? 0 : (T - GOLPE_JULY) / 700
  roca(g, x0, y0, k)
  if (T < 1700) dibuja(g, c, { ...hdPose(c.hd, 'ataque', T), t })   // el giro completo del mazo; las chispas las pone su efecto
  else dibuja(g, c, { ...hdPose(c.hd, 'victoria', T - 1700 + 400), t })
  piedritas(g, x0 + 8, y0 + 3, k)
}

/* ---------- Xitin al llegar a racha 8: se transforma en oso, ruge y vuelve a ser ella para celebrar ---------- */
function poofVerde(g, k) {
  const cx = W / 2, cy = YB + HD_OY + 20, r = 6 + Math.sin(Math.PI * k) * 12
  g.save(); g.globalAlpha = Math.sin(Math.PI * k) * 0.55; g.fillStyle = '#86EFAC'
  for (let yy = -r; yy <= r; yy++) { const w = Math.sqrt(Math.max(0, r * r - yy * yy)); g.fillRect(Math.round(cx - w), Math.round(cy + yy), Math.round(2 * w) + 1, 1) }
  g.restore()
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + k * 3, rr = r + 2; px(g, cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, i % 2 ? '#FFFFFF' : '#4ADE80', 2, 2) }
}
/* El oso celebrando: las dos garras en alto (la pose en que toma impulso para el zarpazo, sin inclinarse) y,
   si salta, alterna las patas: una sube y la otra baja junto a la cabeza. */
function osoArriba(g, c, t, salta) {   // (su forma solo da el oso desde el golpe: se lo pide así)
  const oso = c.hd.forma({ fase: 'golpe' }), alterna = salta && Math.floor(t / 260) % 2
  const forma = () => alterna ? { ...oso, brazoCerca: { ...oso.brazoCerca, poses: { ...oso.brazoCerca.poses, impulso: [[-3, -9], [-5, -4]] } } } : oso
  const p = { fase: 'impulso', mano: alterna ? [27, -6] : [26, -3], capa: 0, pelo: 0, pies: c.hd.pies, bob: salta && alterna ? -3 : 0, agacha: salta && !alterna ? 1 : 0, t }
  dibuja(g, { ...c, hd: { ...c.hd, forma, proyectil: undefined } }, p)
}
function osoXitin(g, T, c, t) {
  const ella = (p) => dibuja(g, c, p)
  if (T < 300) {   // ¡puf!: parpadea entre ella y el oso
    if (Math.floor(T / 60) % 2) osoArriba(g, c, t, false); else ella({ ...hdPose(c.hd, 'guardia', t), t })
    poofVerde(g, T / 300)
  } else if (T < 1300) {   // ruge con las garras en alto, con las ondas del rugido
    osoArriba(g, c, t, false)
    const k = T - 300
    ;[4, 7, 10].forEach((r, i) => {
      if ((Math.floor(k / 120) + i) % 3 === 2) return
      for (let a = -0.7; a <= 0.7; a += 0.12) px(g, X + HD_OX + 30 + Math.cos(a) * r, YB + HD_OY + 2 + Math.sin(a) * r, '#FFFFEB')
    })
  } else if (T < 2900) osoArriba(g, c, t, true)   // baila de alegría: salta alternando las patas
  else if (T < 3200) {   // vuelve a ser ella
    if (Math.floor(T / 60) % 2 && T < 3140) osoArriba(g, c, t, false); else ella({ ...hdPose(c.hd, 'guardia', t), t })
    poofVerde(g, (T - 2900) / 300)
  } else ella({ ...hdPose(c.hd, 'victoria', T - 3200 + 400), t })
  return true
}

/* ---------- Latte al fallar: baraja de nuevo ("nueva mano"): los naipes pasan en arco de una mano a la otra ---------- */
function naipe(g, x, y, gira) {   // naipe chico de canto o de frente, con su punto rojo
  const w = gira ? 2 : 3, h = 4
  px(g, x - 1, y - 1, '#272736', w + 2, h + 2); px(g, x, y, '#F8F5EE', w, h); px(g, x + 1, y + 1, '#D7263D')
}
function barajaLatte(g, t, c) {
  const T = t % 2600, baraja = T < 1700
  if (!baraja) {   // vuelve a abrir el abanico, con un destello rosado
    dibuja(g, c, { ...hdPose(c.hd, 'guardia', t), t })
    if (T < 2000) { const [cx, cy] = cabeza(); px(g, cx + 12, cy + 12, '#FFFFFF'); px(g, cx + 10, cy + 12, '#F9A8D4', 5, 1); px(g, cx + 12, cy + 10, '#F9A8D4', 1, 5) }
    return
  }
  const d = [17, 26], m = [27, 25]   // mano de cerca (izquierda) y mano del naipe (derecha)
  const hd = conBrazo({ ...c.hd, arma: undefined }, [d[0] - c.hd.brazoCerca.hombro[0], d[1] - c.hd.brazoCerca.hombro[1]], [-2, 3])
  dibuja(g, { ...c, hd }, { ...hdPose(hd, 'guardia', t), mano: m, t })
  const ox = X + HD_OX, oy = YB + HD_OY
  for (let i = 0; i < 4; i++) {   // cuatro naipes, uno tras otro, de la mano derecha a la izquierda
    const k = ((T + i * 150) % 600) / 600
    const x = ox + m[0] + (d[0] - m[0]) * k - 1, y = oy + m[1] - 2 - Math.sin(k * Math.PI) * 6
    naipe(g, Math.round(x), Math.round(y), Math.floor((T + i * 150) / 90) % 2)
  }
}

/* ---------- Uchis al acertar: malabares con sus dos dagas (las suyas, de heroesHD.js) ---------- */
/* Su daga, con contorno, guardada una vez como puntos relativos al centro de la hoja; en el aire gira de a cuartos de
   vuelta (el pixel art no se rota: se cambian filas por columnas). */
let PUNTOS_DAGA = null
function dagaGira(g, cx, cy, cuartos, color) {
  if (!PUNTOS_DAGA) { PUNTOS_DAGA = []; dagaUchis((x, y, col) => PUNTOS_DAGA.push([x, y + 4, col]), 0, 0) }   // centro a media hoja
  PUNTOS_DAGA.forEach(([x, y, col]) => {
    for (let r = 0; r < cuartos; r++) [x, y] = [-y, x]
    g.fillStyle = color(col); g.fillRect(cx + x, cy + y, 1, 1)
  })
}
/* Malabar en "ducha" con dos dagas, a tiempos de BEAT ms: la derecha lanza alto por encima de la cabeza (cada 2
   tiempos, una daga y después la otra) y la izquierda la recibe y se la devuelve por abajo, rápido, frente al pecho.
   Cada daga da la vuelta en 4 tiempos: vuela alto (0 a 2,6), en la izquierda (2,6 a 3), pase bajo (3 a 3,6), en la
   derecha (3,6 a 4). Las manos no se mueven juntas: cuando la derecha lanza, la izquierda espera abajo; cuando la
   izquierda sube a recibir, la derecha está quieta; cuando la derecha amortigua, la izquierda ya soltó.
   Altura de cada mano (negativo = arriba) según el momento dentro de sus 2 tiempos. */
const BEAT = 350
const MANO_DER = [[0, -5], [0.4, 0], [1.6, 0], [1.8, 3], [2, -5]]                       // lanza alto, recibe el pase y amortigua
const MANO_IZQ = [[0, 1], [0.4, -3], [0.6, -3], [0.8, 2], [1.0, -1], [1.3, 0], [2, 1]]   // sube a recibir, amortigua y pasa
const curva = (pts, u) => { for (let n = 1; n < pts.length; n++) if (u <= pts[n][0]) { const [u0, a0] = pts[n - 1], [u1, a1] = pts[n]; return Math.round(a0 + (a1 - a0) * (u - u0) / (u1 - u0)) } return 0 }
function malabaresUchis(g, t, c) {
  const color = hdColor(c.hd), daga = (x, y, cuartos) => dagaGira(g, x, y, cuartos, color)
  const s = t / BEAT, r = s % 2, dDer = curva(MANO_DER, r), dIzq = curva(MANO_IZQ, r)
  const hd = conBrazo({ ...c.hd, arma: undefined }, [-3, 3 + dIzq], [-4, 6 + Math.round(dIzq / 2)])   // la izquierda, con el codo que acompaña
  dibuja(g, { ...c, hd }, { ...hdPose(hd, 'guardia', t), mano: [22, 21 + dDer], agacha: 0, bob: 0, t })
  const ox = X + HD_OX, oy = YB + HD_OY
  const der = [ox + 23, oy + 21 + dDer], izq = [ox + 6, oy + 22 + dIzq]   // dónde está cada mano ahora
  for (let i = 0; i < 2; i++) {
    const q = (((s - 2 * i) % 4) + 4) % 4
    if (q < 2.6) {   // vuela alto: sube casi vertical desde la derecha y cruza por encima de la cabeza (no por la cara)
      const k = q / 2.6, lado = k * k * (3 - 2 * k), y0 = oy + 21 - 9, y1 = oy + 22 - 7
      daga(Math.round(der[0] + (ox + 6 - der[0]) * lado), Math.round(y0 + (y1 - y0) * k - Math.sin(k * Math.PI) * 22), Math.floor(t / 110) % 4)
    } else if (q < 3) daga(izq[0] + 1, izq[1] - 5, 0)   // en la mano izquierda, como la lleva siempre
    else if (q < 3.6) {   // pase bajo, rápido, de canto frente al pecho
      const k = (q - 3) / 0.6
      daga(Math.round(ox + 6 + 17 * k), Math.round(oy + 21 - Math.sin(k * Math.PI) * 3), 1)
    } else daga(der[0], der[1] - 5, 0)   // en la mano derecha, lista para lanzar
  }
}

/* ---------- Malía al fallar: revuelve una ollita de mermelada que burbujea y suelta corazones ("ya viene la próxima") ----------
   El cucharón es el suyo: se dibuja en alto y se refleja de arriba abajo sobre la mano, así queda hundido en la olla
   (el pixel art no se rota). La olla va delante y tapa la cuchara. */
const OLLA = [   // un caldero: más ancho y alto que la cuchara del cucharón, que queda entera adentro
  '.KKKKKKKKKKKKKKK.',
  'KMMMMMMMMMMMMMMMK',
  'KJjJJJJjJJJJJjJJK',
  'KJJJjJJJJJjJJJJJK',
  '.KKKKKKKKKKKKKKK.',
  '.KddMdddddddddmK.',
  'KdMMddddddddddmmK',
  'KdMdddddddddddmmK',
  'KddddddddddddmmmK',
  '.KdddddddddddmmK.',
  '..KKKKKKKKKKKKK..',
]
const COL_OLLA = { K: '#272736', M: '#7E7E8F', d: '#43434F', m: '#272736', J: '#F0407A', j: '#FF7FA6' }
function ollaMalia(g, t, c) {
  const ang = t / 260, mano = [26 + Math.round(Math.cos(ang) * 1.5), 14 + Math.round(Math.sin(ang))]   // la mano da vueltas: revuelve (a esta altura la cuchara no asoma bajo el caldero)
  const arma = (px, p) => c.hd.arma((x, y, col) => px(x, 2 * p.mano[1] - y, col), { ...p, fase: 'alto' })
  dibuja(g, { ...c, hd: { ...c.hd, arma } }, { ...hdPose(c.hd, 'guardia', t), mano, t })
  const x0 = X + HD_OX + 19, y0 = YB + HD_OY + 29
  OLLA.forEach((f, y) => [...f].forEach((k, x) => { if (COL_OLLA[k]) px(g, x0 + x, y0 + y, COL_OLLA[k]) }))
  if (Math.floor(t / 300) % 3 === 0) px(g, x0 + 4 + (Math.floor(t / 900) % 3) * 4, y0 + 2, '#FFD0DE')   // una burbuja que revienta
  for (let i = 0; i < 2; i++) {   // corazones que suben con el vapor
    const k = ((t + i * 700) % 1400) / 1400
    if (k > 0.85) continue
    const hx = x0 + 5 + i * 5 + Math.round(Math.sin(k * 6 + i) * 1.5), hy = y0 - 3 - Math.round(k * 16)
    CORAZON.forEach(([x, y]) => px(g, hx + x, hy + y, k < 0.6 ? '#F472B6' : '#FFB5B5'))
  }
}

/* ---------- Tiván al fallar: azota la poción contra el suelo, explota en humo verde y sale un "1UP" (otra vida para
   intentarlo). El impulso y el azote son las poses de su podio. ---------- */
const LETRAS_1UP = [['.X.', 'XX.', '.X.', '.X.', 'XXX'], ['X.X', 'X.X', 'X.X', 'X.X', 'XXX'], ['XX.', 'X.X', 'XX.', 'X..', 'X..']]
function unoUP(g, x0, y0) {   // "1UP" en letras de 3 × 5, verde con contorno oscuro, como en los juegos de antes
  const pts = []
  LETRAS_1UP.forEach((l, n) => l.forEach((f, y) => [...f].forEach((k, x) => { if (k === 'X') pts.push([x0 + n * 4 + x, y0 + y]) })))
  const llenos = new Set(pts.map(([x, y]) => x + ',' + y))
  pts.forEach(([x, y]) => [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]].forEach(([a, b]) => { if (!llenos.has((x + a) + ',' + (y + b))) px(g, x + a, y + b, '#272736') }))
  pts.forEach(([x, y]) => px(g, x, y, y === y0 ? '#CFFF70' : '#8FDE5D'))
}
function pocionTivan(g, t, c) {
  const T = t % 3200, cae = [X + HD_OX + 31, SUELO - 1]   // donde se rompe la poción
  const LANZA = 640, ROMPE = 760, SALE = 1150
  if (T < 400) dibuja(g, c, { ...hdPose(c.hd, 'guardia', t), t })
  else if (T < LANZA) dibuja(g, c, { ...hdPose(c.hd, 'guardia', t), fase: 'alto', mano: [18, 9], bob: -1, agacha: 0, inclina: -1, t })   // toma impulso, la poción bien arriba
  else if (T < 1000) dibuja(g, { ...c, hd: { ...c.hd, arma: undefined } }, { ...hdPose(c.hd, 'guardia', t), fase: 'golpe', mano: [27, 27], bob: 0, agacha: T < ROMPE ? 3 : 2, inclina: T < ROMPE ? 2 : 1, t })   // la azota
  else {
    const salta = T >= SALE && T < SALE + 600 && Math.floor((T - SALE) / 150) % 2   // salta de gusto al ver la vida extra
    dibuja(g, { ...c, hd: { ...c.hd, arma: T < 1600 ? undefined : c.hd.arma } }, { ...hdPose(c.hd, 'guardia', t), bob: salta ? -2 : 0, agacha: 0, t })
  }
  if (T >= LANZA && T < ROMPE) {   // la poción cae girando hacia el suelo
    const k = (T - LANZA) / (ROMPE - LANZA), x = X + HD_OX + 27 + (cae[0] - X - HD_OX - 27) * k, y = YB + HD_OY + 22 + (cae[1] - YB - HD_OY - 22) * k
    px(g, x - 1, y - 2, '#272736', 4, 5); px(g, x, y - 1, '#5FBF7A', 2, 3); px(g, x, y - 1, '#CFFF70')
  }
  if (T >= ROMPE && T < ROMPE + 900) {   // ¡crash!: vidrios que saltan y humo verde que sube
    const k = (T - ROMPE) / 900
    for (let i = 0; i < 6; i++) { const a = Math.PI + (i / 5) * Math.PI, r = 3 + k * 10; px(g, cae[0] + Math.cos(a) * r, cae[1] + Math.sin(a) * r * 0.7 + k * k * 8, '#66FFE3') }
    g.save(); g.globalAlpha = 0.75 * (1 - k)
    ;[[0, 0, 4], [-4, -2, 3], [4, -3, 3], [0, -6, 3]].forEach(([dx, dy, r], i) => {
      const R = r + k * 4, cx = cae[0] + dx * (1 + k), cy = cae[1] - 3 + dy - k * 8
      g.fillStyle = i % 2 ? '#8FDE5D' : '#3CA370'
      for (let yy = -R; yy <= R; yy++) { const w = Math.sqrt(Math.max(0, R * R - yy * yy)); g.fillRect(Math.round(cx - w), Math.round(cy + yy), Math.round(2 * w) + 1, 1) }
    })
    g.restore()
  }
  if (T >= SALE) {   // el 1UP sale del humo, sube y parpadea al final
    const k = Math.min(1, (T - SALE) / 700), y = Math.round(cae[1] - 10 - k * 20)
    if (T < 2700 || Math.floor(T / 100) % 2) unoUP(g, cae[0] - 2, y)
  }
}

/* ---------- Janet al acertar: monta tres flechas a la vez (a lo Legolas), tensa el arco y las suelta hacia el lado;
   se abren en abanico al volar (separándose: el pixel art no se rota). El arco se dobla con la pose de su ataque. ---------- */
function flechaLado(g, cx, cy) {   // la flecha en vuelo de Janet (la de su proyectil): plumas verdes atrás, punta adelante
  px(g, cx - 1, cy - 1, '#272736', 12, 3)
  px(g, cx + 2, cy, '#B07A44', 7, 1); px(g, cx, cy - 1, '#4ADE80', 2, 3); px(g, cx + 9, cy - 1, '#D9DEE6', 1, 3); px(g, cx + 10, cy, '#D9DEE6')
}
function montada(g, x0, xp, y) {   // una flecha más montada en la cuerda tensa (como la del arco, una fila más arriba o abajo)
  px(g, x0, y, '#B07A44', xp - x0 + 1, 1); px(g, xp + 1, y, '#D9DEE6'); px(g, xp + 2, y, '#272736')
  px(g, x0, y - 1, '#4ADE80', 2, 1); px(g, x0, y + 1, '#4ADE80', 2, 1)
}
function flechaHojas(g, t, c) {
  const T = t % 2800, TENSA = 450, SUELTA = 1150
  const hd = { ...c.hd, proyectil: undefined }   // las flechas las dibuja esta escena
  let p
  if (T < TENSA) p = { ...hdPose(hd, 'guardia', t), t }
  else if (T < SUELTA) p = { ...hdPose(hd, 'ataque', 700), t }   // tensa el arco (la cuerda se estira) y lo mantiene, apuntando
  else if (T < SUELTA + 140) p = { ...hdPose(hd, 'ataque', 830), t }   // suelta
  else if (T < SUELTA + 500) p = { ...hdPose(hd, 'ataque', 1250), t }
  else p = { ...hdPose(hd, 'guardia', t), bob: Math.floor(T / 260) % 2 ? -1 : 0, t }   // satisfecho, con saltitos
  dibuja(g, { ...c, hd }, p)
  const [hx, hy] = p.mano, ox = X + HD_OX + (p.inclina || 0), oy = YB + HD_OY + (p.bob || 0) + (p.agacha || 0) + (hd.bajar || 0)
  if (T >= TENSA && T < SUELTA) [-3, 3].forEach((d) => montada(g, ox + hx - 2, ox + hx + 8, oy + hy + d))   // las otras dos, arriba y abajo
  if (T >= SUELTA && T < SUELTA + 700) {   // las tres vuelan juntas y se abren en abanico
    const k = (T - SUELTA) / 700, cx = Math.round(ox + 34 + k * 70), cy = YB + HD_OY + 20
    ;[-1, 0, 1].forEach((i) => flechaLado(g, cx - Math.abs(i) * 2, Math.round(cy + i * (3 + k * 7))))
  }
}

/* ---------- Jelic al fallar: juramento de caballero. Clava una rodilla con el escudo al frente y la mano en el pecho,
   se queda un momento y se levanta decidido (la pose de hincado es la del rival al que Cupe nombra caballero). ---------- */
/* La cara de Jelic reflexionando: ojos cerrados (la rayita oscura del párpado) y la boca cerrada en una línea tranquila,
   sin la sonrisa de dientes. Sobre las filas 11 a 15 de su cuerpo. */
const CARA_REFLEXIVA = {
  11: { 15: 'S', 19: 'S' },
  12: { 14: 'K', 15: 'K', 19: 'K', 20: 'K' },
  14: { 15: 'S', 16: 's', 17: 's', 18: 's', 19: 'S' },
  15: { 16: 'S', 17: 'S', 18: 'S', 19: 'S' },
}
const reflexiva = new Map()
function caraReflexiva(hd) {
  if (!reflexiva.has(hd.cuerpo)) reflexiva.set(hd.cuerpo, hd.cuerpo.map((f, i) => CARA_REFLEXIVA[i] ? [...f].map((k, x) => CARA_REFLEXIVA[i][x] || k).join('') : f))
  return reflexiva.get(hd.cuerpo)
}
function juramentoJelic(g, t, c) {
  const T = t % 3400, hd = c.hd, [pa, pd] = hd.pies, [sx, sy] = hd.brazoCerca.hombro
  const k = T < 300 ? 0 : T < 650 ? (T - 300) / 350 : T < 2200 ? 1 : T < 2550 ? 1 - (T - 2200) / 350 : 0   // baja y sube
  const enPecho = conBrazo(hd, [5, 3], [1, 6])   // la mano de cerca en el pecho
  const h = k >= 1 ? { ...enPecho, cuerpo: caraReflexiva(hd) } : k > 0.3 ? enPecho : hd   // hincado: ojos y boca cerrados, reflexionando
  const p = { ...hdPose(h, 'guardia', t), agacha: Math.round(k * 7), bob: 0, pies: [[pa[0] - Math.round(k * 7), pa[1]], [pd[0] + Math.round(k * 2), pd[1]]], mano: [hd.manos.guardia[0] + Math.round(k * 2), hd.manos.guardia[1]], t }
  dibuja(g, { ...c, hd: h }, p)
  const [cx, cy] = cabeza()
  if (k >= 1 && T >= 900) [[-9, 10], [11, 6], [2, 1]].forEach(([dx, dy], i) => {   // brillito del juramento
    const f = Math.floor((T - 900 + i * 200) / 150) % 4
    estrella(g, cx + dx, cy + dy + 7, f < 3 ? f : -1, '#FFE478')
  })
  if (T >= 2550 && T < 3100 && Math.floor(T / 200) % 2) px(g, cx - 1, cy - 4, '#FFFFEB')   // ya de pie, decidido
}

/* ---------- Cupe al fallar: aúlla de ánimo ("¡auuu!"): se estira, cierra los ojos, abre la boca en "O" y salen ondas
   de sonido hacia arriba; después vuelve contento, con un saltito y un corazón. ---------- */
/* Cabeza hacia atrás, aullando al cielo: la cara es de frente, así que mirar arriba es subir los rasgos 2 px (se ve
   más mentón) y correr la cabeza 1 px hacia atrás. Ojos cerrados (la rayita) y boca en "O". Sobre las filas de su
   cuerpo: se borra la cara (filas 9 a 14) y se dibuja de nuevo más arriba. */
const CARA_AULLA = {
  8: { 13: 'K', 14: 'K', 21: 'K', 22: 'K' },                                     // ojos cerrados (antes en la fila 11)
  9: { 17: 'K', 18: 'K' },                                                       // naricita
  10: { 10: 'P', 11: 'P', 16: 'K', 17: 'u', 18: 'u', 19: 'K', 23: 'P', 24: 'P' },  // mejillas y boca abierta
  11: { 16: 'K', 17: 'u', 18: 'u', 19: 'K' },
  12: { 17: 'K', 18: 'K' },
}
const aullando = new Map()
function cuerpoAulla(hd) {   // su cuerpo con la cabeza echada atrás (una vez por variante de colores)
  if (!aullando.has(hd.cuerpo)) aullando.set(hd.cuerpo, hd.cuerpo.map((f, i) => {
    if (i > 15) return f
    let fila = [...f].map((k, x) => i >= 8 && i <= 14 && x >= 9 && x <= 24 && (k === 'K' || k === 'P') && !(i === 8 && (x === 9 || x === 24)) ? 'W' : k)   // sin la cara
    if (CARA_AULLA[i]) fila = fila.map((k, x) => CARA_AULLA[i][x] || k)
    return i <= 14 ? fila.join('').slice(1) : fila.join('')   // la cabeza, 1 px hacia atrás
  }))
  return aullando.get(hd.cuerpo)
}
function ondasAullido(g, cx, cy, T) {   // arcos que salen hacia arriba desde la boca, se agrandan y se apagan
  for (let n = 0; n < 3; n++) {
    const k = ((T + n * 330) % 1000) / 1000, r = 6 + k * 14   // nacen sobre la corona (detrás de la cabeza blanca no se veían)
    g.save(); g.globalAlpha = k < 0.7 ? 1 : (1 - k) / 0.3
    for (let a = -2.5; a <= -0.64; a += 0.06) [r, r + 1].forEach((rr) => px(g, cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.75, k < 0.4 ? '#FFFFEB' : '#C2C2D1'))
    g.restore()
  }
}
function aullidoCupe(g, t, c) {
  const T = t % 3000, [cx, cy] = cabeza(), baja = c.hd.bajar || 0
  if (T >= 300 && T < 2000) {
    dibuja(g, { ...c, hd: { ...c.hd, cuerpo: cuerpoAulla(c.hd) } }, { ...hdPose(c.hd, 'guardia', t), bob: -1, agacha: 0, t })   // se estira para aullar
    return ondasAullido(g, cx, cy + baja - 2, T - 300)
  }
  const contento = T >= 2000 ? Math.floor(T / 250) % 2 : 0
  dibuja(g, c, { ...hdPose(c.hd, 'guardia', t), bob: contento ? -1 : 0, t })
  if (T >= 2100 && T < 2800) { const k = (T - 2100) / 700; CORAZON.forEach(([x, y]) => px(g, cx + 10 + x, cy + baja - 2 + y - Math.round(k * 6), '#F472B6')) }
}

/* ---------- Uzu al fallar: se golpea el pecho dos veces, decidido, y le sale vapor de las orejas ---------- */
function vapor(g, x, y, k, lado) {   // nubecita blanca que sale de la oreja hacia su lado y sube
  if (k <= 0 || k >= 1) return
  g.save(); g.globalAlpha = 0.85 * (1 - k)
  const cx = x + lado * Math.round(2 + k * 5), cy = y - Math.round(k * 7), r = 1 + Math.round(k * 2)
  px(g, cx - r, cy, '#FFFFEB', r * 2 + 1, 1); px(g, cx, cy - r, '#FFFFEB', 1, r * 2 + 1); px(g, cx - r + 1, cy - r + 1, '#FFFFEB', r * 2 - 1, r * 2 - 1)
  g.restore()
}
function pechoUzu(g, t, c) {
  const T = t % 2600, golpe = T >= 300 && T < 1300 ? Math.floor((T - 300) / 250) % 2 === 0 : false   // dos golpes al pecho
  const hd = T >= 300 && T < 1300 ? conBrazo(c.hd, golpe ? [4, 4] : [-1, 2], golpe ? [-2, 5] : [-4, 4]) : c.hd
  dibuja(g, { ...c, hd }, { ...hdPose(hd, 'guardia', t), agacha: golpe ? 1 : 0, bob: 0, t })
  const [cx, cy] = cabeza(), oy = cy + 14   // la punta de las orejas (Uzu es bajito y las tiene anchas)
  if (golpe) { px(g, cx - 3, oy + 6, '#FFFFEB'); px(g, cx - 5, oy + 8, '#FFFFEB'); px(g, cx - 1, oy + 9, '#FFFFEB') }   // rayitas del golpe
  if (T >= 900) for (let i = 0; i < 2; i++) {   // vapor de las dos orejas, en bocanadas
    const k = ((T - 900 + i * 300) % 600) / 600
    vapor(g, cx - 14, oy, k, -1); vapor(g, cx + 13, oy, k, 1)
  }
}

/* ---------- Edith al fallar: una nubecita gris le llueve encima; levanta el grimorio, le lanza un rayito en zigzag y la
   nube se deshace en chispas. Después queda contenta. ---------- */
function nubecita(g, cx, cy, r) {   // tres bolitas grises con borde oscuro, más clara arriba
  const bolas = [[-4, 1, 3], [0, -1, 4], [4, 1, 3]].map(([dx, dy, rr]) => [cx + dx, cy + dy, Math.max(1, Math.round(rr * r))])
  const disco = (x0, y0, rr, col) => { for (let yy = -rr; yy <= rr; yy++) { const w = Math.round(Math.sqrt(rr * rr - yy * yy)); px(g, x0 - w, y0 + yy, col, 2 * w + 1, 1) } }
  bolas.forEach(([x, y, rr]) => disco(x, y, rr + 1, '#272736'))
  bolas.forEach(([x, y, rr]) => disco(x, y, rr, '#7E7E8F'))
  bolas.forEach(([x, y, rr]) => disco(x, y - 1, Math.max(0, rr - 1), '#C2C2D1'))
}
/* Edith mirando hacia arriba: la pupila sube a la fila del blanco del ojo y el blanco queda abajo (filas 9 y 10). */
const MIRA_ARRIBA = { 9: { 14: 'K', 18: 'K' }, 10: { 14: 'C', 18: 'C' } }
const miranArriba = new Map()
function ojosArriba(hd) {
  if (!miranArriba.has(hd.cuerpo)) miranArriba.set(hd.cuerpo, hd.cuerpo.map((f, i) => MIRA_ARRIBA[i] ? [...f].map((k, x) => MIRA_ARRIBA[i][x] || k).join('') : f))
  return miranArriba.get(hd.cuerpo)
}
function nubeEdith(g, t, c) {
  const T = t % 3600, [cx, cy] = cabeza(), nx = cx + 5, ny = cy - 6, MIRA = 1100, ALZA = 1550, ZAS = 1800, DESHACE = 2000   // la nube, sobre la cabeza hacia el lado del libro
  const [mx, my] = c.hd.manos.sube, arriba = { ...c.hd, cuerpo: ojosArriba(c.hd) }
  if (T < MIRA) dibuja(g, c, { ...hdPose(c.hd, 'guardia', t), agacha: 1, bob: 0, t })   // le llueve encima: se encoge un poco
  else if (T < ALZA) dibuja(g, { ...c, hd: arriba }, { ...hdPose(c.hd, 'guardia', t), agacha: 0, bob: 0, inclina: -1, t })   // mira hacia arriba: ¿dónde está?
  else if (T < DESHACE + 300) dibuja(g, { ...c, hd: arriba }, { ...hdPose(c.hd, 'guardia', t), mano: c.hd.manos.sube, agacha: 0, bob: 0, t })   // la encontró: levanta el grimorio (en guardia: sin los rayos de su celebración)
  else dibuja(g, c, { ...hdPose(c.hd, 'guardia', t), bob: Math.floor(T / 260) % 2 ? -1 : 0, agacha: 0, t })   // contenta, con saltitos
  if (T < DESHACE) {   // la nube crece y llueve
    nubecita(g, nx, ny, Math.min(1, T / 400))
    if (T > 300) for (let i = 0; i < 5; i++) { const k = ((T + i * 170) % 500) / 500; px(g, nx - 6 + i * 3, ny + 4 + Math.round(k * 8), '#4DA6FF', 1, 2) }
  }
  if (T >= ZAS && T < DESHACE) {   // el rayito, en zigzag, del grimorio a la nube
    const x0 = X + HD_OX + mx + 2, y0 = YB + HD_OY + my - 4, pasos = 5
    let x = x0, y = y0
    for (let i = 1; i <= pasos; i++) {
      const x1 = Math.round(x0 + (nx - x0) * i / pasos + (i < pasos ? (i % 2 ? 2 : -2) : 0)), y1 = Math.round(y0 + (ny + 4 - y0) * i / pasos)
      const n = Math.max(Math.abs(x1 - x), Math.abs(y1 - y))
      for (let j = 0; j <= n; j++) { const xx = Math.round(x + (x1 - x) * j / n), yy = Math.round(y + (y1 - y) * j / n); px(g, xx - 1, yy, '#FFE478', 3, 1); px(g, xx, yy, '#FFFFEB') }
      x = x1; y = y1
    }
  }
  if (T >= DESHACE && T < DESHACE + 600) {   // se deshace en chispas
    const k = (T - DESHACE) / 600
    for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2, r = 2 + k * 12; estrella(g, Math.round(nx + Math.cos(a) * r), Math.round(ny + Math.sin(a) * r * 0.7), k < 0.7 ? i % 2 : 0, i % 2 ? '#FFE478' : '#66FFE3') }
  }
}

/* ---------- Patroclus: el águila deja el hombro y aletea sobre él mientras hace el gesto común ----------
   La del podio (de perfil, chiquita) parecía un pollo: esta es de frente, con las alas abiertas, cabeza blanca
   mirando al rival, pico amarillo ganchudo, cola blanca y garras. Tres cuadros: alas arriba, al medio y abajo. */
const AGUILA_FRENTE = [
  [   // alas arriba
    'KK...................KK',
    'KBK.................KBK',
    'KbBK...............KBbK',
    '.KbLK.....KKK.....KLbK.',
    '.KbBLK...KWWWK...KLBbK.',
    '..KbBLK.KWWWKYK.KLBbK..',
    '..KbBBLKKwWWWYYKLBBbK..',
    '...KbBBLKBwwKYKLBBbK...',
    '....KKbBLLBBBBLLBbKK...',
    '......KKKBbBbBKKK......',
    '........KWWWWWK........',
    '.........KwWwK.........',
    '........KYK.KYK........',
  ],
  [   // alas al medio
    '.......................',
    '.......................',
    '.......................',
    '..........KKK..........',
    '.........KWWWK.........',
    '........KWWWKYK........',
    '..KKKKKKKwWWWYYKKKKKK..',
    '.KLLLLLLLKwwKYKLLLLLLK.',
    'KBLLBLLBLLBBBBLLBLLBLBK',
    'KBBBBBBBBBBbBbBBBBBBBBK',
    'KbKbKbKBKWWWWWKBKbKbKbK',
    '.K.K.K.K.KwWwK.K.K.K.K.',
    '........KYK.KYK........',
  ],
  [   // alas abajo
    '.......................',
    '.......................',
    '.......................',
    '..........KKK..........',
    '.........KWWWK.........',
    '........KWWWKYK........',
    '......KKKwWWWYYKKK.....',
    '....KKLLLKwwKYKLLLKK...',
    '...KBLLBLLBBBBLLBLLBK..',
    '..KbBBBBBBbBbBbBBBBBbK.',
    '.KbBbKBBKWWWWWKBBKbBbK.',
    '.KbKbK.K.KwWwK.K.KbKbK.',
    '..K.K...KYK.KYK...K.K..',
  ],
]
/* Cabeza, pico y cola como el águila posada; las alas en cafés cálidos de Pear36 (el café oscuro se iba a morado y
   en un escenario de noche parecía murciélago). */
const COL_AGUILA = { W: '#F4F4F0', w: '#CFCFC8', Y: '#F2C230', L: '#F2A65E', B: '#BA6156', b: '#8C3F5D' }
function aguilaFrente(g, cx, cy, t, hd) {
  const color = hdColor(hd), filas = AGUILA_FRENTE[[0, 1, 2, 1][((Math.floor(t / 90) % 4) + 4) % 4]]
  filas.forEach((f, y) => [...f].forEach((k, x) => {
    const col = k === 'K' ? '#1A1020' : COL_AGUILA[k]
    if (col) { g.fillStyle = color(col); g.fillRect(Math.round(cx) - 11 + x, Math.round(cy) - 12 + y, 1, 1) }
  }))
}
function conAguilaArriba(g, t, c, gesto) {
  gesto(g, t, { ...c, hd: { ...c.hd, armaDetras: undefined } })   // sin el águila posada
  const [cx, cy] = cabeza()
  aguilaFrente(g, cx + 1 + Math.round(Math.sin(t / 600) * 2), cy - 2 + (Math.floor(t / 180) % 2), t, c.hd)   // flota justo sobre la cabeza
}

const propio = (pinta, nombre) => (g, t, c) => (GESTOS[c.id]?.[nombre] || pinta)(g, t, c)
export const MOMENTOS = {
  esperando: { periodo: 4800, pinta: propio(esperando, 'esperando') },
  correcta: { periodo: 2600, pinta: propio(correcta, 'correcta') },
  parcial: { periodo: 3200, pinta: propio(parcial, 'parcial') },
  incorrecta: { periodo: 2600, pinta: propio(incorrecta, 'incorrecta') },
  sinRespuesta: { periodo: 4400, pinta: propio(sinRespuesta, 'sinRespuesta') },
}

const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
const QUIETO = { esperando: 600, correcta: 1000, sube: 4800, parcial: 300, incorrecta: 2400, sinRespuesta: 300 }   // con movimiento reducido: un cuadro tranquilo

/* Pinta un momento en el lienzo de la escena (112 × 76), con su escenario. heroe: el del alumno con sus colores
   (game/personaliza.js), sin racha; racha: la de ahora (después de esta pregunta). */
export function pintaMomento(g, nombre, t, heroe, racha, escenario) {
  g = lienzoPear36(g)
  if (reduce) t = QUIETO[nombre] || 0
  g.clearRect(0, 0, W, H); g.save()
  if (nombre === 'sube') { subeRacha(g, t, heroe, racha >= 3 ? racha : 3, escenario); g.restore(); return }
  /* Al fallar o no responder la racha se corta: el distintivo se apaga en silencio. */
  const c = conRacha(heroe, nombre === 'incorrecta' || nombre === 'sinRespuesta' ? 0 : racha)
  fondo(g, t, escenario); oscurece(g, c); sombra(g)
  MOMENTOS[nombre].pinta(g, t, c)
  g.restore()
}

/* Qué momento toca tras la pregunta. estado: 'right' | 'partial' | 'wrong' | 'none' (el del veredicto).
   Sube la racha cuando acierta y llega justo a 3, 5 u 8. */
export function momentoDe(estado, racha) {
  if (estado === 'right') return racha === 3 || racha === 5 || racha === 8 ? 'sube' : 'correcta'
  return { partial: 'parcial', wrong: 'incorrecta', none: 'sinRespuesta' }[estado] || 'esperando'
}
