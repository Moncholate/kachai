/* ============================================================================
   PERSONAJES DE KACHAI (pixel art estilo SNES, en tres cuartos)
   ----------------------------------------------------------------------------
   Quince personajes que cada alumno elige al entrar. Aparecen en su celular en
   los duelos del ranking, en el podio y aplaudiendo. Todo se dibuja en canvas.
   El motor y los diseños están en heroesHD.js (se armaron uno a uno con la
   profesora en la página «Personajes mejorados», oct-2026). Los diseños
   anteriores quedan guardados en heroesClasicos.js como referencia.

   Reglas de la profesora:
     · nada de violencia: ganar es DESARMAR (el arma vuela y queda en el suelo;
       el rival queda de pie con las manos arriba). Algunos ganan a su manera:
       Malala lo convierte en sapo, Janet le clava el arma en el borde con una
       flecha, el oso de Xitin lo hace huir, Jelic lo deja viendo estrellas, Latte lo encandila, Cupe lo
       desarma y lo nombra caballero, Malía le da mermelada y le da sueño, y Agattita lo atrapa con enredaderas y le brota una flor.
     · en el podio, quien gana celebra y el resto aplaude.
   ========================================================================== */
import { HEROES as CLASICOS } from './heroesClasicos.js'
import { HD_POR_ID, HD_BASE_POR_ID, hdDibujar, hdPose, HD_OX, HD_OY, HDK, sapoMalala, flechaJanet, pajaritos, enredaRival, florCabeza, hombreraOso } from './heroesHD.js'

const K = HDK

/* Cada personaje: los datos de siempre (nombre, clase, frase) + su diseño en tres cuartos. */
const T = CLASICOS.map(({ id, nombre, clase, desc, frase }) => ({ id, nombre, clase, desc, frase, hd: HD_POR_ID[id] }))

/* ======================= ESCENARIO ======================= */
const W = 112, SUELO = 62, YB = SUELO - (HD_OY + 39);
/* Selva del árbol gigante (inspirada en la portada de Secret of Mana). Se pinta una vez
   en un lienzo aparte; en cada cuadro solo se copia y se agregan los ibis que vuelan. */
let FONDO = null;
function pintarFondo() {
  const c = document.createElement("canvas"); c.width = W; c.height = 76;
  const g = c.getContext("2d");
  let semilla = 7; const rnd = () => (semilla = (semilla * 16807) % 2147483647) / 2147483647;
  const p = (x, y, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), 1, 1); };
  // fondo de selva, de oscuro a menos oscuro
  ["#16301C", "#1B3A20", "#204424", "#264E28", "#2C582C"].forEach((col, i) => { g.fillStyle = col; g.fillRect(0, i * 11, W, 11); });
  // follaje lejano en puntitos
  for (let i = 0; i < 700; i++) { const x = rnd() * W, y = rnd() * 55; p(x, y, ["#3E6A30", "#5A8A3A", "#7FA84A", "#A8C25A"][Math.floor(rnd() * 4 * (1 - y / 80))]); }
  // el árbol gigante: tronco cubierto de musgo que se ensancha en raíces
  for (let y = 0; y < 56; y++) {
    const ancho = 13 + Math.max(0, y - 28) * 1.5, cx = 56 + Math.sin(y / 7) * 2;
    for (let x = Math.round(cx - ancho); x <= Math.round(cx + ancho); x++) { const k = (x * 3 + y * 7) % 11; p(x, y, k < 2 ? "#3E6428" : k < 4 ? "#86A848" : "#5E8A3A"); }
  }
  for (let i = 0; i < 14; i++) { const x = 45 + rnd() * 22, y0 = rnd() * 20, L = 20 + rnd() * 20; for (let y = y0; y < y0 + L; y++) p(x + Math.sin(y / 5), y, "#3A5E26"); }
  for (let i = 0; i < 140; i++) { const y = rnd() * 56, a = 13 + Math.max(0, y - 28) * 1.5; p(56 + (rnd() * 2 - 1) * a, y, "#C2D66A"); }
  // musgo que cuelga desde arriba
  for (let i = 0; i < 24; i++) { const x = rnd() * W, L = 5 + rnd() * 20; for (let y = 0; y < L; y++) p(x, y, y % 3 ? "#8DB04A" : "#B5CC5E"); }
  // rosetas turquesa a la izquierda
  const roseta = (cx, cy, r) => { for (let a = 0; a < 16; a++) { const an = a / 16 * Math.PI * 2; for (let k = 2; k <= r; k++) p(cx + Math.cos(an) * k, cy + Math.sin(an) * k * 0.8, k === r ? "#7AD0B8" : "#3FA08A"); } p(cx, cy, "#2A7A68"); };
  roseta(14, 20, 6); roseta(23, 30, 5); roseta(8, 34, 5);
  // palmera en abanico a la derecha
  for (let a = 0; a < 15; a++) { const an = Math.PI * (1.05 + a / 14 * 0.9); for (let k = 4; k < 30; k++) p(97 + Math.cos(an) * k, 50 + Math.sin(an) * k, k % 4 ? "#4E8A3E" : "#6FAE52"); }
  for (let y = 46; y < 56; y++) p(97, y, "#3A5E26");
  // la selva queda un poco más oscura, para que resalten los que pelean
  g.fillStyle = "rgba(8, 20, 10, .32)"; g.fillRect(0, 0, W, 53);
  // agua quieta detrás de los que pelean
  g.fillStyle = "#1E4448"; g.fillRect(0, 53, W, 4);
  for (let x = 0; x < W; x += 5) p(x + (x % 3), 54, "#3E7478");
  // suelo de musgo
  g.fillStyle = "#3E7A34"; g.fillRect(0, 57, W, 19);
  for (let i = 0; i < 170; i++) p(rnd() * W, 57 + rnd() * 19, rnd() < 0.5 ? "#5FA046" : "#2E5E28");
  for (let x = 0; x < W; x += 2) { const h = 1 + Math.floor(rnd() * 3); for (let y = 0; y < h; y++) p(x, 57 - y, "#6FB04E"); }
  // estanque al frente, con flores rosadas
  g.fillStyle = "#1F3F45"; g.fillRect(0, 70, W, 6);
  for (let x = 2; x < W; x += 7) p(x + (x % 4), 71, "#3E7478");
  for (let i = 0; i < 9; i++) { const x = rnd() * W; p(x, 72, "#F28C8C"); p(x + 1, 72, "#4E8A3E"); }
  // helechos en las esquinas de adelante
  const helecho = (bx, by, s) => { for (let b = 0; b < 5; b++) { const an = -Math.PI / 2 + s * (b * 0.32 - 0.5); for (let k = 0; k < 13 - b; k++) { const x = bx + Math.cos(an) * k, y = by + Math.sin(an) * k; p(x, y, "#5FAE4A"); if (k % 2) p(x + s, y, "#3E8A3A"); } } };
  helecho(3, 76, 1); helecho(109, 76, -1);
  return c;
}
function aves(g) {
  const t = performance.now() / 1000;
  [0, 1].forEach((i) => {
    const x = Math.round(((t * 9 + i * 55) % (W + 24)) - 12), y = Math.round(9 + i * 8 + Math.sin(t * 2 + i) * 2), ala = Math.floor(t * 6 + i * 3) % 2;
    g.fillStyle = "#F06A4A"; g.fillRect(x, y, 4, 1); g.fillRect(x + 4, y - 1, 1, 1);
    g.fillStyle = "#2A1A1A"; g.fillRect(x + 5, y - 1, 2, 1);
    g.fillStyle = "#FF9A7A";
    if (ala) { g.fillRect(x + 1, y - 1, 2, 1); g.fillRect(x, y - 2, 2, 1); } else { g.fillRect(x + 1, y + 1, 2, 1); g.fillRect(x, y + 2, 2, 1); }
    g.fillStyle = "#F06A4A"; g.fillRect(x - 1, y, 1, 1);
  });
}
function fondo(g) {
  if (!FONDO) FONDO = pintarFondo();
  g.drawImage(FONDO, 0, 0);
  aves(g);
}
const sombra = (g, cx, dy = 0) => { g.fillStyle = "rgba(10,25,12,.45)"; g.fillRect(cx - 7, SUELO + dy + 1, 14, 2); g.fillRect(cx - 5, SUELO + dy + 3, 10, 1); };
function chispa(g, x, y, f, col = "#FBBF24") {
  const r = [2, 4, 6, 4][f] ?? 0; if (!r) return;
  g.fillStyle = "#FFFFFF"; g.fillRect(x - r, y, r * 2 + 1, 1); g.fillRect(x, y - r, 1, r * 2 + 1);
  g.fillStyle = col; const d = Math.max(1, r - 2);
  for (let i = 1; i <= d; i++) [[-i, -i], [i, -i], [-i, i], [i, i]].forEach(([a, b]) => g.fillRect(x + a, y + b, 1, 1));
  g.fillStyle = "#FFF7D6"; g.fillRect(x - 1, y - 1, 3, 3);
}

const lerp = (a, b, k) => a + (b - a) * Math.max(0, Math.min(1, k));
const reduce = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Dibuja un personaje (y sus efectos) en su lugar. espejo: mira a la izquierda (el rival). */
function figura(g, c, p, x, dy, espejo) {
  x = Math.round(x);   // en píxeles enteros: a mitad de píxel se ve borroso
  g.save();
  if (espejo) { g.translate(W, 0); g.scale(-1, 1); }
  hdDibujar(g, x, YB + dy, c, p);
  if (c.proyectil) c.proyectil(g, x, YB + dy, p);
  g.restore();
}
const centroX = (x, espejo) => (espejo ? W - (x + HD_OX + 15) : x + HD_OX + 15);

/* Cuánto avanza al atacar para que el golpe llegue al rival (los que disparan casi no avanzan). */
const avance = (c) => Math.max(0, 76 - ((c.choque && c.choque[0]) || 50));
function paso(c, tt) {
  const d = avance(c);
  if (tt < 500 || tt >= 1700) return 0;
  if (tt < 760) return d * 0.6 * ((tt - 500) / 260);
  if (tt < 900) return d * (0.6 + 0.4 * ((tt - 760) / 140));
  if (tt < 1400) return d;
  return d * (1 - (tt - 1400) / 300);
}
const poseAtaque = (c, tt, t) => (tt >= 0 && tt < 1700 && !reduce ? hdPose(c, "ataque", tt) : hdPose(c, "guardia", t));

/* Duelo: primero ataca uno y después el otro; nadie gana todavía. */
function escenaDuelo(g, t, yo, rival, { conFondo = true, dy = 0, dx = 0 } = {}) {
  const Tm = t % 3400, tA = Tm, tB = Tm - 1500;
  const golpe = (tt) => tt >= 900 && tt < 1050;
  const shake = !reduce && (golpe(tA) || golpe(tB));
  g.save(); g.translate(shake ? (Math.floor(Tm / 40) % 2 ? 1 : -1) : 0, 0); if (conFondo) fondo(g);
  const xa = 2 + dx + paso(yo.hd, tA), xb = 2 + dx + paso(rival.hd, tB);
  sombra(g, centroX(xa, false), dy); sombra(g, centroX(xb, true), dy);
  figura(g, rival.hd, poseAtaque(rival.hd, tB, t + 300), xb, dy, true);
  figura(g, yo.hd, poseAtaque(yo.hd, tA, t), xa, dy, false);
  g.restore();
}

/* El rival sin arma, con las manos arriba. */
function rendido(c, conHombrera) {
  const [sx, sy] = c.hombro;
  const r = { ...c, arma: undefined, armaDetras: undefined, proyectil: undefined, forma: undefined, manos: { ...c.manos, guardia: [sx + 3, sy - 8] }, codos: undefined, codoDinamico: undefined, manoDinamica: undefined };
  if (c.brazoCerca) r.brazoCerca = { ...c.brazoCerca, poses: {}, todas: [[-3, -8], [-4, -3]], encima: false };
  if (conHombrera) r.arma = (px) => hombreraOso(px, 5, 15);
  return r;
}
/* El rival hincado, con la mano en el pecho, listo para que Cupe lo nombre caballero. */
function arrodillado(c) {
  const [sx, sy] = c.hombro;
  const r = { ...rendido(c), manos: { ...c.manos, guardia: [sx + 1, sy + 4] } };
  if (c.brazoCerca) r.brazoCerca = { ...r.brazoCerca, todas: [[1, 7], [-2, 4]] };
  return r;
}
/* El rival satisfecho: sin arma y con las dos manos sobre la barriga. */
function pochito(c) {
  const [sx, sy] = c.hombro;
  const r = { ...rendido(c), manos: { ...c.manos, guardia: [sx + 1, sy + 7] } };
  if (c.brazoCerca) r.brazoCerca = { ...r.brazoCerca, todas: [[3, 7], [-1, 4]] };
  return r;
}
/* El rival se tapa los ojos con las dos manos: lo encandilaron los fuegos artificiales de Latte. */
function encandilado(c) {
  const [sx, sy] = c.hombro;
  const r = { ...rendido(c), manos: { ...c.manos, guardia: [sx + 1, sy - 8] } };
  if (c.brazoCerca) { const [nx] = c.brazoCerca.hombro; r.brazoCerca = { ...r.brazoCerca, todas: [[sx - 4 - nx, -8], [-2, -3]] }; }
  return r;
}
/* El arma del rival dibujada suelta, centrada en (x, y) y girada en cuartos de vuelta (así el pixel art sigue nítido). */
const armasSueltas = new Map()
function armaSuelta(g, id, x, y, cuartos = 0) {
  const base = HD_BASE_POR_ID[id]; if (!base) return;
  if (!armasSueltas.has(id)) {
    const c = document.createElement("canvas"); c.width = c.height = 56; const cg = c.getContext("2d");
    const px = (a, b, col) => { cg.fillStyle = col; cg.fillRect(28 + a, 34 + b, 1, 1); };
    const p = { mano: [0, 0], fase: "guardia", t: 0, k: 0 };
    if (base.arma) base.arma(px, p); else if (base.armaDetras) base.armaDetras(px, { ...p, fase: "suelta" });
    armasSueltas.set(id, c);
  }
  g.save(); g.imageSmoothingEnabled = false; g.translate(Math.round(x), Math.round(y)); g.rotate((cuartos % 4) * Math.PI / 2); g.drawImage(armasSueltas.get(id), -28, -28); g.restore();
}
const sudor = (g, cx, cy, conExclamacion) => {
  g.fillStyle = K; g.fillRect(cx - 1, cy, 3, 4); g.fillStyle = "#7DD3FC"; g.fillRect(cx, cy + 1, 1, 2);
  if (conExclamacion) { g.fillStyle = K; g.fillRect(cx + 3, cy - 10, 3, 8); g.fillStyle = "#FBBF24"; g.fillRect(cx + 4, cy - 9, 1, 4); g.fillRect(cx + 4, cy - 4, 1, 1); }
};
/* Los naipes de Latte estallan en la cara del rival como fuegos artificiales: tres estallidos de colores, uno tras otro. */
const fuegosLatte = (g, cx, cy, Tm) => {
  [[0, 0, "#F472B6", 0], [-5, -5, "#FBBF24", 130], [5, -3, "#7DD3FC", 260]].forEach(([dx, dy, col, d]) => {
    const k = (Tm - 900 - d) / 750; if (k < 0 || k >= 1) return;   // cada uno se abre y sus chispas caen
    const ex = cx + dx, ey = cy + dy;
    for (let n = 0; n < 12; n++) {
      const a = (n / 12) * Math.PI * 2, r = 2 + k * 11;
      g.fillStyle = k > 0.7 && n % 2 ? "rgba(255,255,255,.5)" : n % 3 === 0 ? "#FFFFFF" : col;
      g.fillRect(Math.round(ex + Math.cos(a) * r), Math.round(ey + Math.sin(a) * r + k * k * 5), 1, 1);
      if (k < 0.5) { g.fillStyle = col; g.fillRect(Math.round(ex + Math.cos(a) * r * 0.55), Math.round(ey + Math.sin(a) * r * 0.55), 1, 1); }
    }
    if (k < 0.15) { g.fillStyle = "#FFFFFF"; g.fillRect(ex - 1, ey - 1, 3, 3); }
  });
};
/* Encandilado: chispitas que titilan frente a los ojos y humito de colores que sube de la cabeza. */
const encandilamiento = (g, cx, cy, t) => {
  const f = Math.floor(t / 110);
  [[-6, 1], [-1, -1], [4, 1], [-3, 4], [2, 4]].forEach(([dx, dy], i) => {
    if ((i + f) % 3 === 0) return;
    const grande = (i + f) % 2, x = cx + dx, y = cy + dy;
    g.fillStyle = i % 2 ? "#FDE047" : "#F9A8D4"; g.fillRect(x, y, 1, 1);
    if (grande) { g.fillRect(x - 1, y, 3, 1); g.fillRect(x, y - 1, 1, 3); g.fillStyle = "#FFFFFF"; g.fillRect(x, y, 1, 1); }
  });
  for (let i = 0; i < 3; i++) {   // humito que sube y se desvanece
    const k = ((t / 900 + i / 3) % 1), x = Math.round(cx - 4 + i * 4 + Math.sin(t / 300 + i) * 1.5), y = Math.round(cy - 10 - k * 9);
    g.fillStyle = `rgba(${["244,114,182", "200,200,215", "251,191,36"][i]},${0.6 * (1 - k)})`; g.fillRect(x - 1, y - 1, 3, 3); g.fillRect(x, y - 2, 1, 1);
  }
};
/* La cara de cada rival (en su grilla): ojos [x, y, ancho, alto] y color de piel para cerrarlos,
   boca que se llena de mermelada y dos puntos por donde pasa la lengüita al saborearse. */
const CARAS = {
  jelic: { ojos: [[15, 11, 1, 2], [19, 11, 1, 2]], piel: "S", boca: [[15, 14], [16, 14], [17, 14], [18, 14], [19, 14], [16, 15], [17, 15], [18, 15], [19, 15]], lame: [[16, 15], [19, 15]], poca: true },
  agattita: { ojos: [[12, 8, 2, 3], [19, 8, 2, 3]], piel: "F", boca: [[16, 12], [17, 12], [16, 13], [17, 13]], lame: [[15, 13], [18, 13]] },
  latte: { ojos: [[14, 12, 1, 2], [19, 12, 1, 2]], piel: "S", boca: [[14, 16], [15, 16], [16, 16], [17, 16]], lame: [[14, 16], [17, 16]] },
  cupe: { ojos: [[13, 9, 2, 3], [21, 9, 2, 3]], piel: "W", boca: [[16, 12], [19, 12], [17, 13], [18, 13]], lame: [[17, 14], [18, 14]] },
  malala: { ojos: [], parpados: [[10, 15], [11, 15], [13, 15], [14, 15]], piel: "S", boca: [[12, 16], [13, 16], [14, 16]], lame: [[12, 16], [14, 16]] },
  malia: { ojos: [[12, 9, 2, 2], [16, 9, 2, 2]], piel: "S", boca: [[12, 13], [13, 13], [14, 13]], lame: [[12, 13], [15, 13]] },
  kenny: { ojos: [[14, 9, 1, 1], [19, 9, 1, 1]], piel: "S", boca: [[14, 13], [15, 13], [16, 13], [17, 13]], lame: [[14, 13], [17, 13]] },
  tivan: { ojos: [[14, 9, 1, 2], [18, 9, 1, 2]], piel: "S", boca: [[14, 12], [15, 12], [16, 12], [17, 12]], lame: [[14, 12], [17, 12]] },
  patroclus: { ojos: [[12, 10, 1, 2], [16, 10, 1, 2]], piel: "S", boca: [[12, 13], [13, 13], [14, 13], [15, 13]], lame: [[12, 13], [15, 13]] },
  uchis: { ojos: [[13, 8, 1, 2], [17, 8, 1, 2]], piel: "S", boca: [[14, 11], [15, 11], [16, 11], [17, 11]], lame: [[14, 11], [17, 11]] },
  janet: { ojos: [[13, 9, 1, 2], [17, 9, 1, 2]], piel: "S", boca: [[11, 12], [12, 12], [13, 12], [14, 12]], lame: [[11, 12], [14, 12]] },
  july: { ojos: [[11, 7, 1, 2], [15, 7, 1, 2]], piel: "S", boca: [[11, 11], [12, 11], [13, 11], [14, 11]], lame: [[11, 11], [14, 11]] },
  edith: { ojos: [[14, 9, 1, 2], [18, 9, 1, 2]], piel: "S", boca: [[14, 12], [15, 12], [16, 12], [17, 12]], lame: [[14, 12], [17, 12]] },
  uzu: { ojos: [[11, 15, 2, 2], [18, 15, 1, 2]], piel: "G", boca: [[12, 18], [14, 18], [16, 18], [18, 18]], lame: [[12, 18], [18, 18]] },
  xitin: { ojos: [[14, 9, 1, 2], [18, 9, 1, 2]], piel: "S", boca: [[14, 13], [15, 13], [16, 13], [17, 13]], lame: [[14, 13], [17, 13]] },
};
/* La cara del rival con la boca llena de mermelada de frutilla (rosada y con borde, para que se lea en cualquier piel); lame: se pasa la lengüita; dormido: ojos cerrados (una rayita). */
function caraMermelada(c, id, { lame = false, dormido = false, t = 0 } = {}) {
  const cara = CARAS[id]; if (!cara) return c;
  const filas = c.cuerpo.map((f) => [...f]), pon = (x, y, k) => { if (filas[y] && x >= 0) { while (filas[y].length <= x) filas[y].push("."); filas[y][x] = k; } };
  /* Embadurnado: la mancha se sale de la boca por los lados y por abajo, con bordes disparejos y una gota que chorrea;
     solo pinta sobre la cara (nunca sobre el contorno ni fuera de ella). */
  const enCara = (x, y) => filas[y] && filas[y][x] && filas[y][x] !== "K" && filas[y][x] !== ".";
  const unta = (x, y, k = "1") => { if (enCara(x, y)) pon(x, y, k); };
  const xs = cara.boca.map(([x]) => x), ys = cara.boca.map(([, y]) => y), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  cara.boca.forEach(([x, y]) => pon(x, y, "1"));
  if (cara.poca) {   // cara chica (dentro de la visera): la mancha justa, con la sonrisa todavía a la vista
    for (let x = x0 + 1; x <= x1 - 1; x++) pon(x, y0, "W");
    unta(x0 - 1, y0); unta(x1 + 1, y1); unta(x0, y1 + 1); unta(x0, y1 + 2, "4");
  } else {
    for (let y = y0; y <= y1; y++) { unta(x0 - 1, y); unta(x0 - 2, y); unta(x1 + 1, y); }   // se sale por las comisuras
    unta(x0 - 1, y0 - 1); unta(x1 + 1, y0 - 1);
    for (let x = x0 - 1; x <= x1 + 1; x++) if ((x - x0) % 3 !== 2) unta(x, y1 + 1);   // por debajo, disparejo
    unta(x0, y1 + 2); unta(x0, y1 + 3, "4");   // la gota que chorrea
    unta(x1 - 1, y1 + 2);
  }
  {   // borde oscuro alrededor de la mancha: se lee como una forma sobre cualquier piel
    const mancha = new Set(); filas.forEach((f, y) => f.forEach((k, x) => { if (k === "1" || k === "4") mancha.add(x + "," + y); }));
    mancha.forEach((xy) => { const [x, y] = xy.split(",").map(Number); [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([u, v]) => { if (!mancha.has((x + u) + "," + (y + v)) && enCara(x + u, y + v) && !["2", "3", "W"].includes(filas[y + v][x + u])) pon(x + u, y + v, "5"); }); });
  }
  pon(x0, y0, "2"); pon(x1, y0, "2");   // brillos de la mermelada
  if (lame) { const [x, y] = cara.lame[Math.floor(t / 220) % 2]; pon(x, y, "3"); }
  if (dormido) {
    cara.ojos.forEach(([x, y, w, h]) => {
      for (let i = 0; i < w; i++) for (let j = 0; j < h; j++) pon(x + i, y + j, cara.piel);
      for (let i = 0; i < Math.max(2, w); i++) pon(x + i, y + h - 1, "K");
    });
    (cara.parpados || []).forEach(([x, y]) => pon(x, y, "K"));
  }
  return { ...c, pal: { ...c.pal, 1: "#F0407A", 2: "#FFD0DE", 3: "#FF9FC0", 4: "#C81E5A", 5: "#5A0A28" }, cuerpo: filas.map((f) => f.join("")) };
}
const zzz = (g, x, y, t) => {   // Z que suben y se desvanecen
  for (let i = 0; i < 3; i++) {
    const k = ((t / 1400 + i / 3) % 1), zx = Math.round(x + k * 8), zy = Math.round(y - k * 12), r = k < 0.4 ? 1 : 2;
    g.fillStyle = `rgba(255,255,255,${1 - k})`;
    g.fillRect(zx - r, zy - r, 2 * r + 1, 1); g.fillRect(zx - r, zy + r, 2 * r + 1, 1); for (let d = -r; d <= r; d++) g.fillRect(zx - d, zy + d, 1, 1);
  }
};
const pufVerde = (g, cx, cy, k) => {
  const r = 3 + Math.sin(Math.PI * Math.min(1, k)) * 10;
  for (let dy = -12; dy <= 12; dy++) for (let dx = -12; dx <= 12; dx++) { const d = Math.hypot(dx, dy * 1.1); if (d < r) { g.fillStyle = d < r * 0.5 ? "rgba(220,252,231,.9)" : "rgba(74,222,128,.85)"; g.fillRect(cx + dx, cy + dy, 1, 1); } }
};

/* El arma del rival salta, gira en el aire y queda tirada en el suelo, detrás de él. */
function armaVuela(g, rival, xb, dy, Tm) {
  const [hx, hy] = rival.hd.manos.guardia, manoX = W - (xb + HD_OX + hx), manoY = YB + dy + HD_OY + hy;
  const q = Math.min(1, (Tm - 900) / 500), fx = W - 6, fy = SUELO + dy - 3;
  const ax = lerp(manoX, fx, q), ay = lerp(manoY, fy, q) - Math.sin(Math.PI * q) * 20;
  armaSuelta(g, rival.id, ax, ay, q < 1 ? Math.floor(q * 6) : 1);
}
/* Nombramiento de Cupe: en qué momento está (0 levanta el florete, 1 toca un hombro, 2 lo pasa por arriba, 3 toca el otro). */
const toqueCupe = (Tm) => (Tm >= 2200 && Tm < 3800 ? Math.floor((Tm - 2200) / 400) : -1);
const destello = (g, cx, cy, t) => {
  const r = 1 + (Math.floor(t / 80) % 2);
  g.fillStyle = "#FDE68A"; g.fillRect(cx - r - 1, cy, 2 * r + 3, 1); g.fillRect(cx, cy - r - 1, 1, 2 * r + 3);
  g.fillStyle = "#FFFFFF"; g.fillRect(cx - 1, cy, 3, 1); g.fillRect(cx, cy - 1, 1, 3);
};
/* Ganar: un solo ataque y después el ganador celebra. Cada uno vence a su manera. */
function escenaGana(g, t, yo, rival, { conFondo = true, dy = 0, dx = 0 } = {}) {
  const Tm = reduce ? 3000 : t < 6000 ? t : 3400 + (t % 2600);   // tras la primera vez, solo se repite la celebración
  const tA = Math.min(Tm, 1699), golpeado = Tm >= 900;
  const shake = !reduce && Tm >= 900 && Tm < 1050;
  g.save(); g.translate(shake ? (Math.floor(Tm / 40) % 2 ? 1 : -1) : 0, 0); if (conFondo) fondo(g);
  const xb = 2 + dx, xa = 2 + dx + paso(yo.hd, tA);
  const cR = centroX(xb, true), cabezaY = YB + dy + HD_OY;
  const quien = yo.id;

  /* --- el rival --- */
  if (!golpeado) { sombra(g, cR, dy); figura(g, rival.hd, hdPose(rival.hd, "guardia", t), xb, dy, true); }
  else if (quien === "malala") {   // ¡sapo!
    if (Tm < 1150) { figura(g, rival.hd, hdPose(rival.hd, "guardia", t), xb, dy, true); pufVerde(g, cR, cabezaY + 18, (Tm - 900) / 250); }
    else {   // el sapo salta de un lado a otro, con una pausita en cada lado
      const T = Math.max(0, Tm - 1400), salto = Math.floor(T / 650), k = Math.min(1, (T % 650) / 360);   // 650 ms por salto: calza justo con la repetición de 2600
      const lado = (n) => (n % 2 ? 8 : -8), desde = salto === 0 ? 0 : lado(salto);   // el primero parte desde donde apareció
      const sx = Math.round(cR - 5 + (Tm >= 1400 ? lerp(desde, lado(salto + 1), k) : 0)), alto = Tm >= 1400 && k < 1 ? Math.round(Math.sin(Math.PI * k) * 10) : 0;
      sombra(g, sx + 5, dy); sapoMalala(g, sx, SUELO + dy - 8 - alto, t);
      if (Tm < 1400) pufVerde(g, cR, cabezaY + 22, 0.5 + (Tm - 1150) / 500);
    }
  } else if (quien === "xitin") {   // el oso ruge y el rival huye corriendo
    const huye = Math.max(0, (Tm - 1500) / 900);
    if (huye <= 0) { sombra(g, cR, dy); figura(g, rendido(rival.hd, rival.id === "xitin"), hdPose(rival.hd, "guardia", t), xb, dy, true); sudor(g, cR - 6, cabezaY + 2, true); }
    else if (huye < 1) {
      const xr = W - (xb + HD_OX + 30) + huye * 60;   // da media vuelta (mira a la derecha) y corre
      figura(g, rival.hd, hdPose(rival.hd, "ataque", 820), xr, dy, false);
      sudor(g, xr + HD_OX + 22, cabezaY + 2, false);
      g.fillStyle = "rgba(214,207,192,.85)";
      [[-4, 0, 3], [-10, 1, 2]].forEach(([ox, oy, r]) => { for (let a = -r; a <= r; a++) for (let b = -r; b <= r; b++) if (a * a + b * b <= r * r) g.fillRect(Math.round(xr + HD_OX + 8 + ox + a), SUELO + dy - 2 + oy + b, 1, 1); });
    }
  } else if (quien === "jelic") {   // queda viendo estrellas
    const vaiven = Math.round(Math.sin(t / 260) * 2);
    sombra(g, cR + vaiven, dy); figura(g, rival.hd, hdPose(rival.hd, "guardia", 0), xb - vaiven, dy, true);
    pajaritos(g, cR + vaiven, cabezaY - 2, t);
  } else if (quien === "latte") {   // los naipes le estallan en la cara y queda encandilado
    const caraX = cR - 3, ojosY = cabezaY + 11;
    if (Tm < 1300) { sombra(g, cR, dy); figura(g, rival.hd, hdPose(rival.hd, "guardia", 0), xb, dy, true); }
    else {
      const vaiven = Math.round(Math.sin(t / 300) * 1.5);
      const tapado = encandilado(rival.hd);
      sombra(g, cR + vaiven, dy); figura(g, tapado, hdPose(tapado, "guardia", t), xb - vaiven, dy, true);
      encandilamiento(g, caraX + vaiven, ojosY, t);
      if (rival.id !== "xitin") {   // suelta el arma, que cae detrás de él
        const [hx, hy] = rival.hd.manos.guardia, q = Math.min(1, (Tm - 1300) / 400);
        const ax = lerp(W - (xb + HD_OX + hx), W - 8, q), ay = lerp(YB + dy + HD_OY + hy, SUELO + dy - 3, q) - Math.sin(Math.PI * q) * 8;
        armaSuelta(g, rival.id, ax, ay, q < 1 ? Math.floor(q * 4) : 1);
      }
    }
    fuegosLatte(g, caraX, ojosY - 2, Tm);
  } else if (quien === "cupe") {   // lo desarma y después lo nombra caballero
    sombra(g, cR, dy);
    const k = Math.max(0, Math.min(1, (Tm - 1700) / 400));
    if (k <= 0) { const r = rendido(rival.hd, rival.id === "xitin"); figura(g, r, hdPose(r, "guardia", t), xb, dy, true); sudor(g, cR - 6, cabezaY + 2, true); }
    else {
      const r = arrodillado(rival.hd), [pa, pd] = rival.hd.pies;
      figura(g, r, { ...hdPose(r, "guardia", 0), agacha: Math.round(k * 7), pies: [[pa[0] - Math.round(k * 7), pa[1]], [pd[0] + Math.round(k * 2), pd[1]]] }, xb, dy, true);
      if (Tm >= 3800) [[-4, 16], [3, 13], [7, 19]].forEach(([ox, oy], i) => { if ((Math.floor(t / 200) + i) % 3) destello(g, cR + ox, cabezaY + oy, t + i * 90); });   // ya es caballero: brilla
    }
    if (rival.id !== "xitin") armaVuela(g, rival, xb, dy, Tm);
  } else if (quien === "malia") {   // le da a probar la mermelada: queda con la panza llena y le da sueño
    if (Tm < 1500) {   // se la come: la boca llena de mermelada y se saborea
      const rc = Tm >= 1000 ? caraMermelada(rival.hd, rival.id, { lame: true, t }) : rival.hd;
      sombra(g, cR, dy); figura(g, rc, hdPose(rc, "guardia", 0), xb, dy, true);
      if (Tm >= 1050) {   // corazoncitos de "¡qué rico!"
        [[-10, 4], [-3, 1]].forEach(([ox, oy], i) => { if ((Math.floor(Tm / 160) + i) % 2) { g.fillStyle = "#F472B6"; [[0, 0], [2, 0], [-1, 1], [0, 1], [1, 1], [2, 1], [3, 1], [0, 2], [1, 2], [2, 2], [1, 3]].forEach(([a, b]) => g.fillRect(cR + ox + a, cabezaY + oy + b - Math.round((Tm - 1050) / 90), 1, 1)); } });
      }
    } else {
      const k = Math.min(1, (Tm - 1500) / 1000), vaiven = Math.round(Math.sin(t / 700) * 1.2 * k), r = pochito(rival.hd);
      const dormido = Tm > 2300, rc = caraMermelada(r, rival.id, { lame: !dormido, dormido, t }), pr = { ...hdPose(rc, "guardia", 0), agacha: Math.round(k * 3) };
      sombra(g, cR + vaiven, dy); figura(g, rc, pr, xb - vaiven, dy, true);
      if (Tm > 2300) zzz(g, cR + 6 + vaiven, cabezaY + 2 + Math.round(k * 3), t);
      if (rival.id !== "xitin") {   // deja el arma en el suelo
        const [hx, hy] = rival.hd.manos.guardia, q = Math.min(1, (Tm - 1500) / 400);
        armaSuelta(g, rival.id, lerp(W - (xb + HD_OX + hx), W - 8, q), lerp(YB + dy + HD_OY + hy, SUELO + dy - 3, q) - Math.sin(Math.PI * q) * 5, q < 1 ? Math.floor(q * 2) : 1);
      }
    }
  } else if (quien === "agattita") {   // atrapado por enredaderas y con flor
    sombra(g, cR, dy); figura(g, rival.hd, hdPose(rival.hd, "guardia", 0), xb, dy, true);
    enredaRival(g, cR, cabezaY + 14, SUELO + dy - 1, Math.min(1, (Tm - 900) / 600));
    if (Tm > 1500) florCabeza(g, cR, cabezaY - 4);
  } else {   // desarmado: el arma vuela (o la flecha de Janet se la lleva al borde)
    sombra(g, cR, dy);
    const janet = quien === "janet", xitinR = rival.id === "xitin";
    figura(g, rendido(rival.hd, xitinR && !janet), hdPose(rival.hd, "guardia", t), xb, dy, true);
    sudor(g, cR - 6, cabezaY + 2, Tm < 1700);
    const [hx, hy] = rival.hd.manos.guardia, manoX = W - (xb + HD_OX + hx), manoY = YB + dy + HD_OY + hy;
    const q = Math.min(1, (Tm - 900) / 500);
    if (janet) {   // la flecha atraviesa el arma (o la hombrera de oso) y la clava en el borde derecho, arriba del rival
      const ax = lerp(manoX, W - 9, q), ay = lerp(manoY - 6, cabezaY - 6, q);
      if (xitinR) hombreraOso((a, b, col) => { g.fillStyle = col; g.fillRect(Math.round(ax - 3 + a), Math.round(ay - 3 + b), 1, 1); }, 0, 0);
      else armaSuelta(g, rival.id, ax, ay);
      flechaJanet(g, Math.round(ax - 10), Math.round(ay), 18);
      if (q >= 1) { g.fillStyle = "#3E2A1A"; g.fillRect(W - 1, ay - 8, 1, 16); }
    } else if (!xitinR) armaVuela(g, rival, xb, dy, Tm);
  }

  /* --- el ganador: ataca una vez y después celebra --- */
  if (quien === "xitin" && Tm >= 1400 && Tm < 2300) {   // sigue de oso mientras ruge
    sombra(g, centroX(xa, false), dy);
    figura(g, yo.hd, hdPose(yo.hd, "ataque", 1000), xa, dy, false);
    g.fillStyle = "#FFFFFF";
    [4, 7, 10].forEach((r) => { for (let a = -0.7; a <= 0.7; a += 0.12) g.fillRect(Math.round(xa + HD_OX + 30 + Math.cos(a) * r), Math.round(YB + dy + HD_OY + 6 + Math.sin(a) * r), 1, 1); });
  } else if (quien === "malia" && Tm < 1700) {   // en vez de lanzar la mermelada, le acerca el cucharón a la boca
    const p = hdPose(yo.hd, "ataque", tA), alza = ["golpe", "choque", "sigue"].includes(p.fase) ? 5 : 0;
    sombra(g, centroX(xa, false), dy); figura(g, yo.hd, { ...p, alimenta: true, mano: [p.mano[0], p.mano[1] - alza] }, xa, dy, false);
  } else if (quien === "cupe" && Tm >= 1400) {   // se queda cerca, levanta el florete y toca los hombros del rival hincado
    const fase = toqueCupe(Tm), [rsx, rsy] = rival.hd.hombro, bj = yo.hd.bajar || 0;
    const hombroX = W - (xb + HD_OX + rsx), hombroY = rsy + 7 + (rival.hd.bajar || 0);   // hombro del rival ya hincado
    const junto = hombroX - HD_OX - 47 + (fase === 3 ? 3 : 0);   // la punta del florete justo en el hombro (el segundo, un poco más allá)
    const xc = lerp(2 + dx + avance(yo.hd), junto, (Tm - 1400) / 600);   // camina hasta el rival
    const p = Tm >= 3800 ? hdPose(yo.hd, "victoria", Tm - 3800 + 400)
      : fase === 1 || fase === 3 ? { ...hdPose(yo.hd, "guardia", t), fase: "golpe", mano: [28, hombroY - bj - 1], k: 1 }
      : fase >= 0 ? { ...hdPose(yo.hd, "guardia", t), fase: "alto", mano: yo.hd.manos.alto } : hdPose(yo.hd, "guardia", t);
    sombra(g, centroX(xc, false), dy); figura(g, yo.hd, p, xc, dy, false);
    if ((fase === 1 || fase === 3) && (Tm - 2200) % 400 < 220) destello(g, Math.round(xc + HD_OX + 46), YB + dy + HD_OY + hombroY - 1, t);
  } else {
    const pYo = Tm >= 1700 ? hdPose(yo.hd, "victoria", Tm - 1700 + 400) : hdPose(yo.hd, "ataque", tA);
    sombra(g, centroX(xa, false), dy); figura(g, yo.hd, pYo, xa, dy, false);
  }
  g.restore();
}

/* Modo equipos: dos contra dos. La pareja de atrás pelea un poco más arriba y desfasada. */
const ATRAS = -8, ADENTRO = 14
function escenaDuelo2(g, t, [a1, a2], [b1, b2]) {
  fondo(g)
  escenaDuelo(g, t + 220, a2, b2, { conFondo: false, dy: ATRAS, dx: ADENTRO })
  escenaDuelo(g, t, a1, b1, { conFondo: false })
}
function escenaGana2(g, t, [a1, a2], [b1, b2]) {
  fondo(g)
  escenaGana(g, Math.max(0, t - 160), a2, b2, { conFondo: false, dy: ATRAS, dx: ADENTRO })
  escenaGana(g, t, a1, b1, { conFondo: false })
}

/* ======================= PODIO ======================= */
const COLOR_PUESTO = [null, ["#FBBF24", "#FDE68A", "#B7791F"], ["#CBD5E1", "#F1F5F9", "#7C8594"], ["#D08A4E", "#F0B98A", "#8A5530"]];
const DIGITO = { 1: [".#.", "##.", ".#.", ".#.", "###"], 2: ["##.", "..#", ".#.", "#..", "###"], 3: ["##.", "..#", ".#.", "..#", "##."] };
function confeti(g, t) {
  const cols = ["#F472B6", "#FBBF24", "#60A5FA", "#4ADE80", "#F97316", "#FFFFFF"];
  for (let i = 0; i < 26; i++) {
    const vel = 14 + (i * 37) % 13, x = (i * 53 + Math.sin(t / 400 + i) * 4) % W, y = ((t / 1000) * vel + i * 17) % 80 - 4;
    g.fillStyle = cols[i % cols.length]; g.fillRect(Math.round(x), Math.round(y), (i + Math.floor(t / 150)) % 2 ? 2 : 1, 1);
  }
}
/* Quien quedó en el podio: celebra a su manera sobre su escalón y cae confeti. */
function escenaPodio(g, t, c, puesto) {
  const Tm = reduce ? 2000 : t;
  fondo(g);
  const alto = [0, 17, 13, 10][puesto], [col, luz, sombraP] = COLOR_PUESTO[puesto];
  const bx = W / 2 - 16, by = SUELO + 4 - alto;
  g.fillStyle = K; g.fillRect(bx - 1, by - 1, 34, alto + 2);
  g.fillStyle = col; g.fillRect(bx, by, 32, alto); g.fillStyle = luz; g.fillRect(bx, by, 32, 2); g.fillStyle = sombraP; g.fillRect(bx, by + alto - 2, 32, 2);
  DIGITO[puesto].forEach((fila, y) => [...fila].forEach((k, x) => { if (k === "#") { g.fillStyle = K; g.fillRect(bx + 15 + x, by + Math.floor((alto - 5) / 2) + y, 1, 1); } }));
  const x = Math.round(W / 2 - HD_OX - 15), y = by - (HD_OY + 39);
  g.fillStyle = "rgba(10,25,12,.45)"; g.fillRect(W / 2 - 7, by - 1, 14, 1);
  const p = { ...hdPose(c.hd, "victoria", Tm), enPodio: true };
  hdDibujar(g, x, y, c.hd, p);
  if (c.hd.proyectil) c.hd.proyectil(g, x, y, p);
  if (Tm > 400) confeti(g, t);
}
/* Quien no quedó en el podio: aplaude y da saltitos. */
function escenaAplauso(g, t, c) {
  const Tm = reduce ? 0 : t;
  fondo(g);
  const junta = Math.floor(Tm / 180) % 2 === 1, salto = Math.floor(Tm / 360) % 4 === 1 ? 2 : 0;
  const hd = c.hd, [sx, sy] = hd.hombro;
  const aplaude = { ...hd, arma: undefined, armaDetras: undefined, proyectil: undefined, forma: undefined, codos: undefined, codoDinamico: undefined, manoDinamica: undefined,
    manos: { ...hd.manos, guardia: [sx + (junta ? 2 : 4), sy + 2] } };
  if (hd.brazoCerca) { const [nx, ny] = hd.brazoCerca.hombro; aplaude.brazoCerca = { ...hd.brazoCerca, poses: {}, encima: false, todas: [[sx - nx + (junta ? 1 : -2), sy - ny + 3], [2, 6]] }; }
  const x = Math.round(W / 2 - HD_OX - 15);
  sombra(g, W / 2);
  hdDibujar(g, x, YB - salto, aplaude, hdPose(aplaude, "guardia", Tm));
  if (junta) { const hx = x + HD_OX + sx + 3, hy = YB - salto + HD_OY + sy; g.fillStyle = "#FFFFFF"; g.fillRect(hx + 3, hy - 3, 1, 2); g.fillRect(hx + 4, hy, 2, 1); g.fillRect(hx + 3, hy + 3, 1, 2); g.fillRect(hx - 1, hy - 4, 1, 2); }
}

/* Retrato en guardia para el selector: el personaje centrado por su contorno real. */
const recuadros = new Map()
function pintarRetrato(g, c, lado, t = 0) {
  const tmp = document.createElement("canvas"); tmp.width = 80; tmp.height = 58;
  const tg = tmp.getContext("2d"), y = 54 - (HD_OY + 39);
  hdDibujar(tg, 4, y, c.hd, hdPose(c.hd, "guardia", t));
  if (!recuadros.has(c.id)) {
    const d = tg.getImageData(0, 0, 80, 58).data; let x0 = 80, y0 = 58, x1 = 0, y1 = 0;
    for (let yy = 0; yy < 58; yy++) for (let xx = 0; xx < 80; xx++) if (d[(yy * 80 + xx) * 4 + 3]) { x0 = Math.min(x0, xx); x1 = Math.max(x1, xx); y0 = Math.min(y0, yy); y1 = Math.max(y1, yy) }
    recuadros.set(c.id, { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 });
  }
  const r = recuadros.get(c.id), esc = Math.min(1, (lado - 2) / Math.max(r.w, r.h));
  g.imageSmoothingEnabled = false;
  g.drawImage(tmp, r.x, r.y, r.w, r.h, Math.round((lado - r.w * esc) / 2), Math.round((lado - r.h * esc) / 2), Math.round(r.w * esc), Math.round(r.h * esc));
}

export { T as HEROES, escenaDuelo, escenaGana, escenaDuelo2, escenaGana2, escenaPodio, escenaAplauso, pintarRetrato }
export const heroOf = (id) => T.find((c) => c.id === id) || null
/* Para quien todavía no eligió: uno fijo según su id, así no cambia entre pantallas. */
export function heroFor(id, chosen) {
  const h = heroOf(chosen); if (h) return h
  let n = 0; for (const ch of String(id || '')) n = (n * 31 + ch.charCodeAt(0)) >>> 0
  return T[n % T.length]
}
