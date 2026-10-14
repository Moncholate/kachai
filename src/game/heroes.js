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
       flecha que rebota en el suelo, el oso de Xitin lo hace huir, Jelic lo desarma y lo deja viendo estrellas, Latte lo encandila, Cupe lo
       desarma y lo nombra caballero, Malía le da mermelada y le da sueño, Kenny lo enamora con
       su serenata, la poción de Tiván lo deja tiznado entre el humo, el águila de
       Patroclus se lo lleva volando, Uchis se esfuma y lo asusta por la espalda, el martillazo de
       July lo hace saltar con una onda por el suelo, la nube de Edith
       lo hace correr entre rayos, Uzu se pone berserk y vuelve con su arma de trofeo, y Agattita lo atrapa con enredaderas y le brota una flor.
     · en el podio, quien gana celebra y el resto aplaude.
   ========================================================================== */
import { HEROES as CLASICOS } from './heroesClasicos.js'
import { CRUDO, lienzoPear36 } from './pear36.js'
import { pintarEscenario } from './fondos.js'
import { HD_POR_ID, HD_BASE_POR_ID, hdColor, hdDibujar, hdPose, HD_OX, HD_OY, HDK, aguilaVuela, conCollarUzu, gataCalico, gataGordita, sapoMalala, flechaJanet, pajaritos, enredaRival, florCabeza, collarOso, COLLAR_OSO } from './heroesHD.js'

const K = HDK

/* Cada personaje: los datos de siempre (nombre, clase, frase) + su diseño en tres cuartos. */
const T = CLASICOS.map(({ id, nombre, clase, desc, frase }) => ({ id, nombre, clase, desc, frase, hd: HD_POR_ID[id] }))

/* ======================= ESCENARIO ======================= */
const W = 112, SUELO = 62, YB = SUELO - (HD_OY + 39);
/* El escenario (ver fondos.js): uno por tema musical, pintado en Apollo. No pasa a Pear36. */
function fondo(g, t, escenario) {
  const antes = g[CRUDO]; g[CRUDO] = true;   // el escenario conserva sus colores (no pasa a Pear36)
  pintarEscenario(g, escenario, reduce ? 0 : t);
  g[CRUDO] = antes;
}
const sombra = (g, cx, dy = 0) => { g.fillStyle = "rgba(10,25,12,.45)"; g.fillRect(cx - 7, SUELO + dy + 1, 14, 2); g.fillRect(cx - 5, SUELO + dy + 3, 10, 1); };
/* Impacto de un golpe (k de 0 a 1, unos 180 ms): destello blanco, estrella amarilla que crece y chispas que se abren y se apagan. */
function impacto(g, x, y, k) {
  const f = Math.min(3, Math.floor(k * 4)), ocho = [[1, 0], [-1, 0], [0, 1], [0, -1], [0.7, 0.7], [-0.7, 0.7], [0.7, -0.7], [-0.7, -0.7]];
  if (f === 0) { g.fillStyle = "#FFFFFF"; g.fillRect(x - 1, y - 1, 3, 3); g.fillRect(x - 3, y, 7, 1); g.fillRect(x, y - 3, 1, 7); }
  else if (f === 1) chispa(g, x, y, 1, "#FFE478");
  else {
    const r = f === 2 ? 5 : 7, lado = f === 2 ? 2 : 1;
    g.fillStyle = f === 2 ? "#FFE478" : "#F2A65E";
    ocho.forEach(([a, b]) => g.fillRect(Math.round(x + a * r), Math.round(y + b * r), lado, lado));
    if (f === 2) { g.fillStyle = "#FFFFFF"; g.fillRect(x, y, 1, 1); ocho.slice(0, 4).forEach(([a, b]) => g.fillRect(x + a * 3, y + b * 3, 1, 1)); }
  }
}
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
  x = Math.round(x); dy = Math.round(dy);   // en píxeles enteros: a mitad de píxel se ve borroso
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
/* cargaPrevia (ms): el personaje empieza a tomar impulso antes (Xitin carga maná y se lo lanza al báculo); toda esa
   preparación, más el impulso de siempre, avanza como una sola fase "impulso" con k de 0 a 1. */
const poseAtaque = (c, tt, t) => {
  const pre = c.cargaPrevia || 0;
  if (pre && !reduce && tt >= -pre && tt < 760) return { ...hdPose(c, "ataque", 600), k: (tt + pre) / (pre + 760), t };
  return tt >= 0 && tt < 1700 && !reduce ? hdPose(c, "ataque", tt) : hdPose(c, "guardia", t);
};

/* Duelo: primero ataca uno y después el otro; nadie gana todavía. */
function escenaDuelo(g, t, yo, rival, { conFondo = true, dy = 0, dx = 0, escenario } = {}) {
  const Tm = t % 3400, tA = Tm, tB = Tm - 1500;
  const golpe = (tt) => tt >= 900 && tt < 1050;
  const shake = !reduce && (golpe(tA) || golpe(tB));
  g.save(); g.translate(shake ? (Math.floor(Tm / 40) % 2 ? 1 : -1) : 0, 0); if (conFondo) fondo(g, t, escenario);
  const xa = 2 + dx + paso(yo.hd, tA), xb = 2 + dx + paso(rival.hd, tB);
  sombra(g, centroX(xa, false), dy); sombra(g, centroX(xb, true), dy);
  figura(g, rival.hd, poseAtaque(rival.hd, tB, t + 300), xb, dy, true);
  const preA = yo.hd.cargaPrevia || 0, tAp = preA && tA >= 3400 - preA ? tA - 3400 : tA;   // la carga previa empieza al final de la vuelta anterior
  figura(g, yo.hd, poseAtaque(yo.hd, tAp, t), xa, dy, false);
  if (!reduce) {   // el golpe conecta: chispa de impacto en el pecho del que lo recibe
    const pecho = (c) => YB + dy + HD_OY + (c.bajar || 0) + c.hombro[1] + 2;
    if (tA >= 900 && tA < 1080) impacto(g, centroX(xb, true) - 8, pecho(rival.hd), (tA - 900) / 180);
    if (tB >= 900 && tB < 1080) impacto(g, centroX(xa, false) + 8, pecho(yo.hd), (tB - 900) / 180);
  }
  g.restore();
}

/* ¿El rival lleva el collar de oso? (Xitin lo cambió por un báculo: si collar === false, la desarman como a todos.) */
const llevaCollar = (r) => r.id === "xitin" && r.hd.collar !== false;
/* El rival sin arma, con las manos arriba. Xitin conserva su collar de oso salvo que se lo quiten (conCollar === false). */
function rendido(c, conCollar) {
  const [sx, sy] = c.hombro;
  const r = { ...c, arma: undefined, armaDetras: undefined, proyectil: undefined, forma: undefined, manos: { ...c.manos, guardia: [sx + 3, sy - 8] }, codos: undefined, codoDinamico: undefined, manoDinamica: undefined };
  if (c.brazoCerca) r.brazoCerca = { ...c.brazoCerca, poses: {}, todas: [[-3, -8], [-4, -3]], encima: false };
  if (c.id === "xitin" && c.collar !== false && conCollar !== false) r.arma = (px) => collarOso(px, 9, 16);
  return r;
}
/* El rival hincado, con la mano en el pecho, listo para que Cupe lo nombre caballero. */
function arrodillado(c) {
  const [sx, sy] = c.hombro;
  const r = { ...rendido(c), manos: { ...c.manos, guardia: [sx + 1, sy + 4] } };
  if (c.brazoCerca) r.brazoCerca = { ...r.brazoCerca, todas: [[1, 7], [-2, 4]] };
  return r;
}
/* El rival enamorado: sin arma y con las manos juntas en el pecho. */
function enamorado(c) {
  const [sx, sy] = c.hombro;
  const r = { ...rendido(c), manos: { ...c.manos, guardia: [sx + 1, sy + 3] } };
  if (c.brazoCerca) { const [nx, ny] = c.brazoCerca.hombro; r.brazoCerca = { ...r.brazoCerca, todas: [[sx - 1 - nx, sy + 3 - ny], [0, 4]] }; }
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
    const color = hdColor(HD_POR_ID[id] || base);   // con la paleta del personaje (Pear36)
    const puntos = [], anota = (a, b, col) => puntos.push([28 + a, 34 + b, col]);
    const p = { mano: [0, 0], fase: "guardia", t: 0, k: 0 };
    const actual = HD_POR_ID[id];
    if (actual && actual.armaSuelta) actual.armaSuelta(anota);   // el diseño actual trae su propia arma suelta
    else if (base.arma) base.arma(anota, p); else if (base.armaDetras) base.armaDetras(anota, { ...p, fase: "suelta" });
    /* Si el arma no cabe en el lienzo (el laúd de Kenny, el libro de Edith), se recentra: si no, se cortaba o desaparecía. */
    const xs = puntos.map(([a]) => a), ys = puntos.map(([, b]) => b);
    const sale = puntos.length && (Math.min(...xs) < 0 || Math.min(...ys) < 0 || Math.max(...xs) > 55 || Math.max(...ys) > 55);
    const dx = sale ? 28 - Math.round((Math.min(...xs) + Math.max(...xs)) / 2) : 0, dy = sale ? 28 - Math.round((Math.min(...ys) + Math.max(...ys)) / 2) : 0;
    puntos.forEach(([a, b, col]) => { cg.fillStyle = color(col); cg.fillRect(a + dx, b + dy, 1, 1); });
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
/* Ojos de corazón sobre los ojos del rival (que mira a la izquierda) y mejillas rosadas. */
const corazon3 = (g, x, y, col) => {
  const pts = [[-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1], [0, 2]];
  g.fillStyle = K; pts.forEach(([a, b]) => g.fillRect(x + a - 1, y + b, 3, 1)); pts.forEach(([a, b]) => g.fillRect(x + a, y + b - 1, 1, 3));
  g.fillStyle = col; pts.forEach(([a, b]) => g.fillRect(x + a, y + b, 1, 1));
  g.fillStyle = "#FFE4EC"; g.fillRect(x - 1, y, 1, 1);
};
const ojosCorazon = (g, id, c, xb, dy, late) => {
  const cara = CARAS[id]; if (!cara) return;
  const baja = (c.bajar || 0), aPantalla = (x, y) => [W - (Math.round(xb) + HD_OX + x) - 1, YB + dy + HD_OY + y + baja];
  let centros = cara.ojos.map(([x, y, w, h]) => [x + (w - 1) / 2, y + (h - 1) / 2]);
  if (!centros.length && cara.parpados) centros = [[cara.parpados[0][0] + 0.5, cara.parpados[0][1] - 1], [cara.parpados[2][0] + 0.5, cara.parpados[2][1] - 1]];
  /* Corazones grandes que laten (aunque queden desproporcionados, se entiende al tiro que está enamorado). */
  const forma = late ? ["XX.XX", "XXXXX", "XXXXX", ".XXX.", "..X.."] : [".XX.XX.", "XXXXXXX", "XXXXXXX", ".XXXXX.", "..XXX..", "...X..."];
  const pts = []; forma.forEach((f, j) => [...f].forEach((k, i) => { if (k === "X") pts.push([i - (f.length >> 1), j - 2]); }));
  const pant = centros.map(([x, y]) => aPantalla(Math.round(x), Math.round(y))), medio = pant.reduce((a, [x]) => a + x, 0) / pant.length;
  pant.forEach(([sx, sy]) => {
    const cx = sx + (sx < medio ? -1 : sx > medio ? 1 : 0), set = new Set(pts.map(([a, b]) => a + "," + b));
    g.fillStyle = K; pts.forEach(([a, b]) => [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([u, v]) => { if (!set.has((a + u) + "," + (b + v))) g.fillRect(cx + a + u, sy + b + v, 1, 1); }));
    pts.forEach(([a, b]) => { g.fillStyle = "#F43F5E"; g.fillRect(cx + a, sy + b, 1, 1); });
    g.fillStyle = "#FFE4EC"; g.fillRect(cx - (late ? 2 : 2), sy - 2, 1, 1); if (!late) g.fillRect(cx - 2, sy - 1, 1, 1);
  });
};
/* Nube de humo alquímico (verde y gris) de radio r centrada en (cx, cy); alfa para que se disipe. */
const humoTivan = (g, cx, cy, r, t, alfa = 1) => {
  if (r <= 0 || alfa <= 0) return;
  const bolas = [[0, 0, 1], [-0.6, -0.3, 0.7], [0.6, -0.4, 0.72], [-0.5, 0.5, 0.65], [0.5, 0.55, 0.68], [0, -0.75, 0.6], [0, 0.8, 0.55], [-0.85, 0.1, 0.5], [0.85, 0.1, 0.52]];
  const cols = ["#3F7A4A", "#5FBF7A", "#8FA39A", "#6B7F74"];
  bolas.forEach(([ox, oy, rr], i) => {
    const bx = cx + ox * r + Math.sin(t / 260 + i) * 1.5, by = cy + oy * r + Math.cos(t / 300 + i) * 1.5, R = rr * r * 0.62;
    g.fillStyle = cols[i % 4]; g.globalAlpha = alfa * 0.92;
    for (let yy = -R; yy <= R; yy++) { const w = Math.sqrt(Math.max(0, R * R - yy * yy)); g.fillRect(Math.round(bx - w), Math.round(by + yy), Math.round(2 * w) + 1, 1); }
  });
  g.fillStyle = "#C8E6D0"; g.globalAlpha = alfa * 0.8;   // brillitos claros arriba de las bolas
  bolas.slice(0, 5).forEach(([ox, oy, rr], i) => g.fillRect(Math.round(cx + ox * r - rr * r * 0.25), Math.round(cy + oy * r - rr * r * 0.4), 2, 1));
  g.globalAlpha = 1;
};
/* Centros de los ojos y de la boca del rival en la pantalla (el rival mira a la izquierda). */
const caraEnPantalla = (id, c, xb, dy, agacha = 0) => {
  const cara = CARAS[id]; if (!cara) return null;
  const aP = (x, y) => [W - (Math.round(xb) + HD_OX + x) - 1, YB + dy + HD_OY + y + (c.bajar || 0) + agacha];
  const ojos = cara.ojos.length ? cara.ojos.map(([x, y, w, h]) => aP(Math.round(x + (w - 1) / 2), Math.round(y + (h - 1) / 2))) : [aP(cara.parpados[0][0], cara.parpados[0][1] - 1), aP(cara.parpados[2][0], cara.parpados[2][1] - 1)];
  const xs = cara.boca.map(([x]) => x), ys = cara.boca.map(([, y]) => y);
  return { ojos, boca: aP(Math.round((Math.min(...xs) + Math.max(...xs)) / 2), Math.round((Math.min(...ys) + Math.max(...ys)) / 2)) };
};
/* Las dos dagas de Uchis envainadas en el cinto, una a cada lado de la cadera, con la empuñadura dorada asomando. */
const dagasCinto = (px) => [10, 19].forEach((x) => {
  const pts = [[x, 19, "#E0B040"], [x, 20, "#6E4424"], [x - 1, 21, "#E0B040"], [x, 21, "#E0B040"], [x + 1, 21, "#E0B040"], [x, 22, "#4A2E17"], [x, 23, "#5A3A22"], [x, 24, "#4A2E17"], [x, 25, "#5A3A22"], [x, 26, "#C9A24B"]];
  const set = new Set(pts.map(([a, b]) => a + "," + b));
  pts.forEach(([a, b]) => [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([u, v]) => { if (!set.has((a + u) + "," + (b + v))) px(a + u, b + v, K); }));
  pts.forEach(([a, b, c]) => px(a, b, c));
});
/* Nube de humo ninja: bolitas grises y blancas que se abren y se desvanecen (k de 0 a 1), con rayitas de velocidad. */
const pufNinja = (g, cx, cy, k, sombra = false) => {   // sombra: humo oscuro, de donde emerge
  if (k < 0 || k >= 1) return;
  const r = 4 + k * 9, a = 1 - k;
  [[0, 0, 1], [-0.7, -0.2, 0.7], [0.7, -0.3, 0.7], [-0.4, 0.6, 0.6], [0.45, 0.6, 0.6], [0, -0.8, 0.55]].forEach(([ox, oy, rr], i) => {
    const R = rr * r * 0.6, bx = cx + ox * r, by = cy + oy * r;
    g.globalAlpha = a; g.fillStyle = sombra ? (i % 2 ? "#3B3052" : "#1F1A2E") : i % 2 ? "#E5E7EB" : "#9CA3AF";
    for (let yy = -R; yy <= R; yy++) { const w = Math.sqrt(Math.max(0, R * R - yy * yy)); g.fillRect(Math.round(bx - w), Math.round(by + yy), Math.round(2 * w) + 1, 1); }
  });
  g.globalAlpha = a; g.fillStyle = sombra ? "#7C6BA8" : "#FFFFFF";
  for (let i = 0; i < 6; i++) { const an = i * 1.05, r0 = r + 2; g.fillRect(Math.round(cx + Math.cos(an) * r0), Math.round(cy + Math.sin(an) * r0), 2, 1); }
  g.globalAlpha = 1;
};
/* Onda expansiva de July: un bulto de tierra y pasto que corre por el suelo hasta x, con piedritas que saltan,
   y deja grietas detrás desde x0. */
const ondaSuelo = (g, x0, x, suelo, t, alfa = 1) => {
  g.globalAlpha = alfa;
  for (let gx = Math.round(x0); gx < x - 3; gx += 1) {   // grieta en zigzag
    const yy = suelo + 1 + ((gx * 7) % 3 === 0 ? 1 : 0);
    g.fillStyle = "#2A1A10"; g.fillRect(gx, yy, 1, 1);
    if (gx % 5 === 0) g.fillRect(gx, yy + 1, 1, 1);
  }
  const alto = 9;
  for (let i = 0; i < 4; i++) {   // estela de polvo detrás del bulto
    const px = x - 10 - i * 5, r = 3 - i * 0.5; g.globalAlpha = alfa * (0.6 - i * 0.12); g.fillStyle = "#D6CFC0";
    for (let yy = -r; yy <= r; yy++) { const w = Math.sqrt(Math.max(0, r * r - yy * yy)); g.fillRect(Math.round(px - w), Math.round(suelo - 3 + yy - Math.sin(t / 150 + i)), Math.round(2 * w) + 1, 1); }
  }
  g.globalAlpha = alfa;
  for (let dx = -9; dx <= 4; dx++) {   // el bulto de tierra que avanza, con el pasto encima
    const h = Math.round(alto * Math.max(0, 1 - Math.abs(dx + 2) / 7)); if (h <= 0) continue;
    g.fillStyle = "#1A1020"; g.fillRect(Math.round(x + dx), suelo - h, 1, 1);
    g.fillStyle = dx % 3 ? "#7A5232" : "#5A3A22"; g.fillRect(Math.round(x + dx), suelo - h + 1, 1, h);
    g.fillStyle = "#5FA046"; g.fillRect(Math.round(x + dx), suelo - h + 1, 1, 1);
  }
  for (let i = 0; i < 6; i++) {   // rocas que saltan del bulto
    const k = ((t / 350 + i / 6) % 1), px = Math.round(x - 6 + i * 2 - k * 6 * (i % 2 ? 1 : -0.4)), py = Math.round(suelo - 8 - Math.sin(Math.PI * k) * 10);
    g.fillStyle = "#1A1020"; g.fillRect(px - 1, py - 1, 4, 4);
    g.fillStyle = i % 2 ? "#8A6446" : "#A8A29E"; g.fillRect(px, py, 2, 2);
  }
  g.globalAlpha = 1;
};
/* Nube de tormenta de Edith (centro cx, base cy) y su rayo morado en zigzag hasta el suelo en x. */
const nubeTormenta = (g, cx, cy, escala, t) => {
  const bolas = [[0, -3, 5], [-6, -1, 4], [6, -1, 4], [-10, 1, 3], [10, 1, 3], [-3, 1, 4], [3, 1, 4]];
  [["#1A1020", 1], ["#4B4458", 0], ["#6E6880", -1]].forEach(([col, crece], capa) => {
    g.fillStyle = col;
    bolas.forEach(([ox, oy, r]) => { const R = (r + crece) * escala; for (let yy = -R; yy <= R; yy++) { if (capa === 2 && yy > -R * 0.2) continue; const w = Math.sqrt(Math.max(0, R * R - yy * yy)); g.fillRect(Math.round(cx + ox * escala - w), Math.round(cy + oy * escala + yy), Math.round(2 * w) + 1, 1); } });
  });
  if (Math.floor(t / 160) % 5 === 0) { g.fillStyle = "#C4B5FD"; g.fillRect(Math.round(cx - 4 * escala), Math.round(cy), 3, 1); }   // relampaguea por dentro
};
const rayoEdith = (g, x0, y0, x1, y1, k) => {
  const pasos = 6, pts = [[x0, y0]];
  for (let i = 1; i < pasos; i++) pts.push([x0 + (x1 - x0) * i / pasos + (i % 2 ? 3 : -3), y0 + (y1 - y0) * i / pasos]);
  pts.push([x1, y1]);
  [[3, "rgba(124,58,237,.8)"], [1, "#F5F3FF"]].forEach(([gr, col]) => { g.fillStyle = col; for (let i = 1; i < pts.length; i++) { const [ax, ay] = pts[i - 1], [bx, by] = pts[i]; const n = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay))); for (let j = 0; j <= n; j++) g.fillRect(Math.round(ax + (bx - ax) * j / n) - (gr >> 1), Math.round(ay + (by - ay) * j / n) - (gr >> 1), gr, gr); } });
  for (let i = 0; i < 6; i++) { const a = Math.PI + i * Math.PI / 5, r = 2 + k * 6; g.fillStyle = i % 2 ? "#FFFFFF" : "#C4B5FD"; g.fillRect(Math.round(x1 + Math.cos(a) * r), Math.round(y1 + Math.sin(a) * r * 0.6), 1, 1); }   // chispas en el suelo
};
/* Dónde está el rival que corre entre los rayos (centro en pantalla) y hacia dónde corre (-1 izquierda, 1 derecha). */
const TRAMO_EDITH = 650, INICIO_EDITH = 1400;   // el primer rayo cae con calma, cuando la nube ya creció
const corridaEdith = (Tm, cR) => {
  if (Tm < INICIO_EDITH) return { x: cR, dir: 0, n: -1, u: 0 };
  const n = Math.floor((Tm - INICIO_EDITH) / TRAMO_EDITH), u = ((Tm - INICIO_EDITH) % TRAMO_EDITH) / TRAMO_EDITH, izq = n % 2 === 0;
  const a = izq ? cR : cR - 16, b = izq ? cR - 16 : cR, k = Math.max(0, Math.min(1, (u - 0.15) / 0.7));
  return { x: a + (b - a) * k, dir: k > 0 && k < 1 ? (izq ? -1 : 1) : 0, n, u, rayoX: rayoEdithX(n, cR) };
};
/* Dónde cae cada rayo: siempre a varios píxeles del rival, nunca encima de él. */
const rayoEdithX = (n, cR) => (n % 2 === 0 ? cR + 16 : cR - 35);
/* La nube se apura hasta quedar justo encima de donde caerá el próximo rayo. */
const nubeEdithX = (Tm, cR) => {
  if (Tm < INICIO_EDITH) return rayoEdithX(0, cR);   // aparece ya detrás del rival, donde caerá el primer rayo
  const n = Math.floor((Tm - INICIO_EDITH) / TRAMO_EDITH), u = ((Tm - INICIO_EDITH) % TRAMO_EDITH) / TRAMO_EDITH;
  return u < 0.3 ? rayoEdithX(n, cR) : lerp(rayoEdithX(n, cR), rayoEdithX(n + 1, cR), (u - 0.3) / 0.7);
};
const LENTO_UZU = 1.45;
/* El collar de oso de Xitin suelto: el cordón cerrado y una cara de oso de frente, más grande que la que lleva
   puesta y con contorno, para que se reconozca en el suelo. (x, y) es el centro; acostado: un cuarto de vuelta
   (solo mientras vuela girando). */
const COLLAR_SUELTO = ["..ccc..", ".c...c.", "c.....c", ".c...c.", "KK...KK", "KUKKKUK", "KUUUUUK", "KUNUNUK", "KuMMMuK", ".KMNMK.", "..KKK.."];
const collarEntero = (g, x, y, acostado = false) => {
  const pts = [];
  collarOso((a, b, c) => pts.push([a, b, c]), 0, 0, COLLAR_SUELTO);
  pts.forEach(([a, b, c]) => { const [u, v] = acostado ? [b - 5, 3 - a] : [a - 3, b - 5]; g.fillStyle = c; g.fillRect(Math.round(x + u), Math.round(y + v), 1, 1); });
};
/* Cuando el ganador desarma a Xitin, en vez de un arma se le cae el collar de oso: sale volando del cuello,
   gira en el aire y queda en el suelo, detrás de ella. desde: cuándo empieza a caer. */
const collarCae = (g, xb, dy, Tm, desde) => {
  const q = Math.min(1, (Tm - desde) / 550); if (q < 0) return;
  const x0 = W - (xb + HD_OX + 12), y0 = YB + dy + HD_OY + 18, suelo = SUELO + dy + 2;
  collarEntero(g, lerp(x0, W - 10, q), lerp(y0, suelo - 3, q) - Math.sin(Math.PI * q) * 16, q < 1 && Math.floor(q * 6) % 2 === 1);
};
/* Xitin sin su collar (para las poses de derrota que parten del rival rendido). */
const sinCollar = (r, rival) => (llevaCollar(rival) ? { ...r, arma: undefined } : r);
/* Lo que Uzu se lleva de trofeo: el arma del rival, o el collar de oso si es Xitin (centrado en x, y). */
const botinUzu = (g, rival, x, y, cuartos) => {
  if (!llevaCollar(rival)) return armaSuelta(g, rival.id, x, y, cuartos);
  collarEntero(g, x, y - 4);   // derecho, para que se vea la cara de oso
};
/* Ciclo de carrera de Uzu: zancadas alternadas, el cuerpo inclinado y los brazos que se balancean poco, con el codo en su lugar. */
const correUzu = (c, t) => {
  const paso = Math.floor(t / 130) % 2, [sx, sy] = c.hombro, [pa, pd] = c.pies;
  const mano = paso ? [sx + 4, sy + 2] : [sx + 1, sy + 5], codo = [Math.round((sx + mano[0]) / 2) - 1, Math.round((sy + mano[1]) / 2) + 2];
  const cerca = paso ? [[-2, 5], [-2, 3]] : [[2, 4], [0, 3]];
  return [{ ...c, codos: { guardia: codo }, brazoCerca: c.brazoCerca && { ...c.brazoCerca, poses: { guardia: cerca } } },
    { ...hdPose(c, "guardia", t), mano, pies: paso ? [[pa[0] - 3, pa[1]], [pd[0] + 3, pd[1]]] : [[pa[0] + 1, pa[1]], [pd[0] - 1, pd[1]]], agacha: paso ? 2 : 1, bob: 0, inclina: 1 }];
};
/* ¿Uzu ya pasó (de vuelta, caminando a la izquierda) por donde quedó el arma? */
const uzuRecogio = (Tu, xArma, xu) => { const k = Math.min(1, (Tu - 2600) / 700), centro = (W + 25) - k * (W + 25 - (xu + HD_OX + 15)); return Tu >= 2600 && centro <= xArma; };
/* Uzu sin polera (se la arrancó): pecho verde al aire, o rojo si está en modo berserk. */
const uzuSinPolera = (c, berserk) => {
  const torso = { 21: "..........KGGgGGgGGGK", 22: "..........KGgGGGGgGGK", 23: "..........KGGGgGGGGGK" };
  const pal = berserk ? { ...c.pal, G: "#D9443A", g: "#9E2A22", Z: "#F07060", R: "#FDE047" } : c.pal;
  const rojo = berserk ? { luz: "#F07060", base: "#D9443A", sombra: "#9E2A22", mano: "#9E2A22", manoLuz: "#D9443A" } : {};
  return { ...c, cuerpo: conCollarUzu(c.cuerpo.map((f, i) => torso[i] || f)), pal,   // el collar de huesos se queda puesto
    brazo: { ...c.brazo, ...rojo }, pierna: berserk ? { ...c.pierna, bota: "#9E2A22", botaSombra: "#6A1A14" } : c.pierna,
    arma: undefined, armaDetras: undefined, proyectil: undefined, manoDinamica: undefined, codoDinamico: undefined, brazoAtras: undefined };
};
/* Flecha en cualquier dirección: punta en (x, y), cuerpo hacia atrás según (ux, uy). Se dibuja por tramos (de i0 a i1,
   contados desde la punta) para poder poner un arma entre la cola y la punta: así se ve ensartada. */
const LARGO_FLECHA = 13;
/* Janet apuntando hacia abajo: dónde queda la mano del arco y desde dónde sale la flecha. */
const ARCO_ABAJO = [27, 27];
const arcoJanet = (xj, dy) => [xj + HD_OX + 1 + ARCO_ABAJO[0] + 4, YB + dy + HD_OY + 2 + ARCO_ABAJO[1] + 3];
const flechaTramo = (g, x, y, ux, uy, i0, i1) => {
  const L = Math.hypot(ux, uy) || 1, dx = ux / L, dy = uy / L, pts = [];
  for (let i = i0; i <= i1; i++) pts.push([Math.round(x - dx * i), Math.round(y - dy * i), i < 2 ? "#D9DEE6" : i > LARGO_FLECHA - 3 ? "#4ADE80" : "#B07A44"]);
  g.fillStyle = K; pts.forEach(([a, b]) => g.fillRect(a - 1, b - 1, 3, 3));
  pts.forEach(([a, b, c]) => { g.fillStyle = c; g.fillRect(a, b, 1, 1); });
};
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
/* Victoria de Patroclus: cuánto rato apunta al rival con la mano antes de mandar a su águila (ms). */
const APUNTA_PATROCLUS = 500;
/* Nombramiento de Cupe: en qué momento está (0 levanta el florete, 1 toca un hombro, 2 lo pasa por arriba, 3 toca el otro). */
const toqueCupe = (Tm) => (Tm >= 2200 && Tm < 3800 ? Math.floor((Tm - 2200) / 400) : -1);
const destello = (g, cx, cy, t) => {
  const r = 1 + (Math.floor(t / 80) % 2);
  g.fillStyle = "#FDE68A"; g.fillRect(cx - r - 1, cy, 2 * r + 3, 1); g.fillRect(cx, cy - r - 1, 1, 2 * r + 3);
  g.fillStyle = "#FFFFFF"; g.fillRect(cx - 1, cy, 3, 1); g.fillRect(cx, cy - 1, 1, 3);
};
/* Celebración de duelo: brazos arriba, sin la celebración especial de cada uno (esa es solo para el podio). */
const celebraDuelo = (c, t) => ({ ...hdPose({ ...c, ajustePose: undefined }, "victoria", t), duelo: true });
/* Cuando Malala o Patroclus pierden, sus mascotas salen arrancando de la pantalla, alejándose del ganador:
   las gatas corren a saltitos y el águila sale volando desde el hombro. */
function mascotasHuyen(g, rival, xb, dy, Tm, t) {
  const k = (Tm - 900) / 1200; if (k < 0 || k >= 1) return;
  const aP = (x, y) => [W - (xb + HD_OX + x) - 1, YB + dy + HD_OY + y];
  if (rival.id === "malala") {
    [[gataGordita, -2, 27, 9, 0], [gataCalico, -8, 30, 7, 0.08]].forEach(([gata, x0, y0, ancho, atraso]) => {
      const q = Math.max(0, (k - atraso) / (1 - atraso)), [sx, sy] = aP(x0 + ancho - 1, y0), salto = Math.round(Math.abs(Math.sin(q * Math.PI * 6)) * 3);
      gata((a, b, c) => { g.fillStyle = c; g.fillRect(Math.round(sx + q * 70) + a, sy - salto + b, 1, 1); }, 0, 0, t, false);
    });
  } else {
    const [sx, sy] = aP(7, 15);
    aguilaVuela(g, sx + k * 50, sy - k * 45, t, false);
  }
}
/* Ganar: un solo ataque y después el ganador celebra. Cada uno vence a su manera. */
function escenaGana(g, t, yo, rival, { conFondo = true, dy = 0, dx = 0, escenario } = {}) {
  const largo = yo.id === "uzu" ? 2200 : 0;   // escenas más largas: la repetición empieza más tarde
  const Tm = reduce ? 3000 + largo : t % (6000 + largo);   // se repite completa: quien no estaba mirando ve en la vuelta siguiente qué pasó
  const tA = Math.min(Tm, 1699), golpeado = Tm >= 900;
  const shake = !reduce && Tm >= 900 && Tm < 1050;
  g.save(); g.translate(shake ? (Math.floor(Tm / 40) % 2 ? 1 : -1) : 0, 0); if (conFondo) fondo(g, t, escenario);
  const xb = 2 + dx, xa = 2 + dx + paso(yo.hd, tA);
  const cR = centroX(xb, true), cabezaY = YB + dy + HD_OY;
  const quien = yo.id;

  /* --- el rival --- */
  const huyen = golpeado && (rival.id === "malala" || rival.id === "patroclus");   // sus mascotas salen arrancando
  if (huyen) rival.hd.huyenMascotas = true;
  try {
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
    if (huye <= 0) { sombra(g, cR, dy); figura(g, rendido(rival.hd, llevaCollar(rival)), hdPose(rival.hd, "guardia", t), xb, dy, true); sudor(g, cR - 6, cabezaY + 2, true); }
    else if (huye < 1) {
      const xr = W - (xb + HD_OX + 30) + huye * 60;   // da media vuelta (mira a la derecha) y corre
      figura(g, rival.hd, hdPose(rival.hd, "ataque", 820), xr, dy, false);
      sudor(g, xr + HD_OX + 22, cabezaY + 2, false);
      g.fillStyle = "rgba(214,207,192,.85)";
      [[-4, 0, 3], [-10, 1, 2]].forEach(([ox, oy, r]) => { for (let a = -r; a <= r; a++) for (let b = -r; b <= r; b++) if (a * a + b * b <= r * r) g.fillRect(Math.round(xr + HD_OX + 8 + ox + a), SUELO + dy - 2 + oy + b, 1, 1); });
    }
  } else if (quien === "jelic") {   // el escudazo lo desarma y lo deja viendo estrellas
    const xitinR = llevaCollar(rival), vaiven = Math.round(Math.sin(t / 260) * 2), r = rendido(rival.hd, xitinR ? false : undefined);
    sombra(g, cR + vaiven, dy); figura(g, r, hdPose(r, "guardia", 0), xb - vaiven, dy, true);
    pajaritos(g, cR + vaiven, cabezaY - 2, t);
    if (!xitinR) armaVuela(g, rival, xb, dy, Tm);
    else collarCae(g, xb, dy, Tm, 900);   // a Xitin el escudazo le bota el collar de oso
  } else if (quien === "latte") {   // los naipes le estallan en la cara y queda encandilado
    const caraX = cR - 3, ojosY = cabezaY + 11;
    if (Tm < 1300) { sombra(g, cR, dy); figura(g, rival.hd, hdPose(rival.hd, "guardia", 0), xb, dy, true); }
    else {
      const vaiven = Math.round(Math.sin(t / 300) * 1.5);
      const tapado = sinCollar(encandilado(rival.hd), rival);
      sombra(g, cR + vaiven, dy); figura(g, tapado, hdPose(tapado, "guardia", t), xb - vaiven, dy, true);
      encandilamiento(g, caraX + vaiven, ojosY, t);
      if (!llevaCollar(rival)) {   // suelta el arma, que cae detrás de él
        const [hx, hy] = rival.hd.manos.guardia, q = Math.min(1, (Tm - 1300) / 400);
        const ax = lerp(W - (xb + HD_OX + hx), W - 8, q), ay = lerp(YB + dy + HD_OY + hy, SUELO + dy - 3, q) - Math.sin(Math.PI * q) * 8;
        armaSuelta(g, rival.id, ax, ay, q < 1 ? Math.floor(q * 4) : 1);
      } else collarCae(g, xb, dy, Tm, 1300);
    }
    fuegosLatte(g, caraX, ojosY - 2, Tm);
  } else if (quien === "cupe") {   // lo desarma y después lo nombra caballero
    sombra(g, cR, dy);
    const k = Math.max(0, Math.min(1, (Tm - 1700) / 400));
    if (k <= 0) { const r = rendido(rival.hd, llevaCollar(rival) ? false : undefined); figura(g, r, hdPose(r, "guardia", t), xb, dy, true); sudor(g, cR - 6, cabezaY + 2, true); }
    else {
      const r = sinCollar(arrodillado(rival.hd), rival), [pa, pd] = rival.hd.pies;
      figura(g, r, { ...hdPose(r, "guardia", 0), agacha: Math.round(k * 7), pies: [[pa[0] - Math.round(k * 7), pa[1]], [pd[0] + Math.round(k * 2), pd[1]]] }, xb, dy, true);
      if (Tm >= 3800) [[-4, 16], [3, 13], [7, 19]].forEach(([ox, oy], i) => { if ((Math.floor(t / 200) + i) % 3) destello(g, cR + ox, cabezaY + oy, t + i * 90); });   // ya es caballero: brilla
    }
    if (!llevaCollar(rival)) armaVuela(g, rival, xb, dy, Tm); else collarCae(g, xb, dy, Tm, 900);
  } else if (quien === "malia") {   // le da a probar la mermelada: queda con la panza llena y le da sueño
    if (Tm < 1500) {   // se la come: la boca llena de mermelada y se saborea
      const rc = Tm >= 1000 ? caraMermelada(rival.hd, rival.id, { lame: true, t }) : rival.hd;
      sombra(g, cR, dy); figura(g, rc, hdPose(rc, "guardia", 0), xb, dy, true);
      if (Tm >= 1050) {   // corazoncitos de "¡qué rico!"
        [[-10, 4], [-3, 1]].forEach(([ox, oy], i) => { if ((Math.floor(Tm / 160) + i) % 2) { g.fillStyle = "#F472B6"; [[0, 0], [2, 0], [-1, 1], [0, 1], [1, 1], [2, 1], [3, 1], [0, 2], [1, 2], [2, 2], [1, 3]].forEach(([a, b]) => g.fillRect(cR + ox + a, cabezaY + oy + b - Math.round((Tm - 1050) / 90), 1, 1)); } });
      }
    } else {
      const k = Math.min(1, (Tm - 1500) / 1000), vaiven = Math.round(Math.sin(t / 700) * 1.2 * k), r = sinCollar(pochito(rival.hd), rival);
      const dormido = Tm > 2300, rc = caraMermelada(r, rival.id, { lame: !dormido, dormido, t }), pr = { ...hdPose(rc, "guardia", 0), agacha: Math.round(k * 3) };
      sombra(g, cR + vaiven, dy); figura(g, rc, pr, xb - vaiven, dy, true);
      if (Tm > 2300) zzz(g, cR + 6 + vaiven, cabezaY + 2 + Math.round(k * 3), t);
      if (!llevaCollar(rival)) {   // deja el arma en el suelo
        const [hx, hy] = rival.hd.manos.guardia, q = Math.min(1, (Tm - 1500) / 400);
        armaSuelta(g, rival.id, lerp(W - (xb + HD_OX + hx), W - 8, q), lerp(YB + dy + HD_OY + hy, SUELO + dy - 3, q) - Math.sin(Math.PI * q) * 5, q < 1 ? Math.floor(q * 2) : 1);
      } else collarCae(g, xb, dy, Tm, 1500);
    }
  } else if (quien === "kenny") {   // la serenata lo enamora: bota el arma, junta las manos y queda con ojos de corazón
    if (Tm < 1300) { sombra(g, cR, dy); figura(g, rival.hd, hdPose(rival.hd, "guardia", 0), xb, dy, true); }
    else {
      const vaiven = Math.round(Math.sin(t / 450) * 2), r = sinCollar(enamorado(rival.hd), rival), xr = xb - vaiven;
      sombra(g, cR + vaiven, dy); figura(g, r, hdPose(r, "guardia", 0), xr, dy, true);
      ojosCorazon(g, rival.id, rival.hd, xr, dy, Math.floor(t / 250) % 2);
      for (let i = 0; i < 3; i++) {   // corazones que suben desde su cabeza
        const k = ((t / 1500 + i / 3) % 1), hx = Math.round(cR + vaiven - 4 + i * 4 + Math.sin(t / 300 + i) * 2), hy = Math.round(cabezaY - 2 - k * 14);
        if (k < 0.85) corazon3(g, hx, hy, i % 2 ? "#F472B6" : "#FB7185");
      }
      if (!llevaCollar(rival)) {   // bota el arma: se le cae de la mano y queda en el suelo
        const [hx, hy] = rival.hd.manos.guardia, q = Math.min(1, (Tm - 1300) / 350);
        armaSuelta(g, rival.id, lerp(W - (xb + HD_OX + hx), W - 9, q), lerp(YB + dy + HD_OY + hy, SUELO + dy - 3, q * q), q < 1 ? Math.floor(q * 3) : 1);
      } else collarCae(g, xb, dy, Tm, 1300);
    }
    if (Tm >= 950 && Tm < 1400) [[-6, 6], [2, 2], [-2, 12]].forEach(([ox, oy], i) => { if ((Math.floor(Tm / 120) + i) % 2) corazon3(g, cR + ox, cabezaY + oy, "#F472B6"); });   // las notas llegan y brotan corazones
  } else if (quien === "tivan") {   // la poción estalla en humo, el arma sale volando y el rival queda tiznado y tosiendo
    const r = rendido(rival.hd, llevaCollar(rival) ? false : undefined), cy = cabezaY + 20;
    sombra(g, cR, dy);
    if (Tm < 900) figura(g, rival.hd, hdPose(rival.hd, "guardia", 0), xb, dy, true);
    else {
      figura(g, r, hdPose(r, "guardia", t), xb, dy, true);
      if (Tm >= 2200) {   // ya se ve: la cara tiznada y tose bocanadas de humo
        const cara = caraEnPantalla(rival.id, rival.hd, xb, dy);
        if (cara) {
          g.fillStyle = "rgba(55,60,66,.75)";
          cara.ojos.forEach(([ex, ey]) => { g.fillRect(ex - 1, ey + 2, 2, 1); g.fillRect(ex, ey + 3, 1, 1); });
          const [bx, by] = cara.boca, k = ((t % 900) / 900);
          if (k < 0.6) humoTivan(g, bx - 3 - k * 8, by - k * 6, 2 + k * 3, t, 1 - k / 0.6);
        }
        humoTivan(g, cR - 8, SUELO + dy - 2, 4, t, 0.55); humoTivan(g, cR + 9, SUELO + dy - 3, 3.5, t + 400, 0.5);   // restos de humo a sus pies
      }
      const crece = Math.min(1, (Tm - 900) / 300), sevA = Tm < 1900 ? 1 : Math.max(0, 1 - (Tm - 1900) / 700);
      humoTivan(g, cR, cy - crece * 4, 4 + crece * 14 + (sevA < 1 ? (1 - sevA) * 6 : 0), t, sevA);
      if (!llevaCollar(rival)) armaVuela(g, rival, xb, dy, Tm); else collarCae(g, xb, dy, Tm, 900);   // el arma (o el collar) sale volando del humo
    }
  } else if (quien === "patroclus") {   // su águila agarra al rival de los hombros y se lo lleva volando fuera de la pantalla
    const hombroY = YB + dy + HD_OY + (rival.hd.bajar || 0) + 3;   // las garras lo toman desde arriba de la cabeza
    const D = APUNTA_PATROCLUS;   // primero Patroclus lo apunta con la mano; después va el águila
    if (Tm < 1350 + D) {
      sombra(g, cR, dy); figura(g, rival.hd, hdPose(rival.hd, "guardia", t), xb, dy, true);
      if (Tm >= 1100 + D) sudor(g, cR - 6, cabezaY + 2, true);
    } else if (Tm < 2700 + D) {
      const k = Math.min(1, (Tm - 1350 - D) / 1250), sube = k * k * 75, corre = k * 30, r = rendido(rival.hd, llevaCollar(rival) ? false : undefined);
      const cuelga = Math.round(Math.sin(t / 120) * 1);   // las piernas se balancean colgando
      sombra(g, cR + corre, dy);
      figura(g, r, { ...hdPose(r, "guardia", t), pies: [[r.pies[0][0] - 1 + cuelga, r.pies[0][1] - 2], [r.pies[1][0] + 1 - cuelga, r.pies[1][1] - 2]] }, xb - corre, dy - sube, true);
      sudor(g, cR - 6 + corre, cabezaY + 2 - sube, false);
      aguilaVuela(g, cR + corre, hombroY - sube, t);
      if (!llevaCollar(rival)) {   // suelta el arma, que cae al suelo
        const [hx, hy] = rival.hd.manos.guardia, q = Math.min(1, (Tm - 1350 - D) / 400);
        armaSuelta(g, rival.id, lerp(W - (xb + HD_OX + hx), cR + 6, q), lerp(YB + dy + HD_OY + hy, SUELO + dy - 3, q * q), q < 1 ? Math.floor(q * 3) : 1);
      } else collarCae(g, xb, dy, Tm, 1350);
    } else if (!llevaCollar(rival)) armaSuelta(g, rival.id, cR + 6, SUELO + dy - 3, 1);
    else collarCae(g, xb, dy, Tm, 1350);
  } else if (quien === "uchis") {   // ataca al aire (Uchis se esfumó), ella aparece detrás y lo asusta: salta y suelta el arma
    if (Tm < 1900) {
      const tt = Tm - 200, xr = xb + (tt >= 0 && tt < 1700 ? paso(rival.hd, tt) : 0);
      sombra(g, W - (xr + HD_OX + 15), dy); figura(g, rival.hd, tt >= 0 && tt < 1700 ? hdPose(rival.hd, "ataque", tt) : hdPose(rival.hd, "guardia", t), xr, dy, true);
    } else {
      const k = Math.min(1, (Tm - 1900) / 350), brinco = Math.round(Math.sin(Math.PI * k) * 8), adelante = Math.round(k * 12), r = rendido(rival.hd, llevaCollar(rival) ? false : undefined);
      sombra(g, cR - adelante, dy); figura(g, r, hdPose(r, "guardia", t), xb + adelante, dy - brinco, true);
      sudor(g, cR - 6 - adelante, cabezaY + 2 - brinco, true);
      if (Tm < 2300) [[-9, -2], [-11, 4], [-9, 10]].forEach(([ox, oy], i) => { if ((Math.floor(Tm / 90) + i) % 2) { g.fillStyle = "#FFFFFF"; g.fillRect(cR + 10 + ox * -1, cabezaY + oy - brinco, 3, 1); } });   // rayitas del susto
      if (!llevaCollar(rival)) armaVuela(g, rival, xb, dy, Tm - 1000); else collarCae(g, xb, dy, Tm, 1900);
    }
  } else if (quien === "july") {   // la onda del martillazo llega por el suelo, lo hace saltar y lo deja tambaleando sin arma
    const xIni = 2 + dx + HD_OX + 32, llega = 1350, xOnda = lerp(xIni, cR - 6, (Tm - 950) / (llega - 950));
    if (Tm >= 950 && Tm < 2000) ondaSuelo(g, xIni, Tm < llega ? xOnda : cR - 6, SUELO + dy, t, Tm < 1600 ? 1 : 1 - (Tm - 1600) / 400);
    if (Tm < llega) { sombra(g, cR, dy); figura(g, rival.hd, hdPose(rival.hd, "guardia", t), xb, dy, true); }
    else {
      const k = Math.min(1, (Tm - llega) / 450), vuelo = Math.round(Math.sin(Math.PI * k) * 9), r = rendido(rival.hd, llevaCollar(rival) ? false : undefined);
      const tambalea = k >= 1 ? (Math.floor(t / 220) % 2 ? 1 : -1) : 0;   // cae desequilibrado
      sombra(g, cR, dy);
      figura(g, r, { ...hdPose(r, "guardia", t), inclina: tambalea, pies: [[r.pies[0][0] - 2, r.pies[0][1]], [r.pies[1][0] + 2, r.pies[1][1]]] }, xb, dy - vuelo, true);
      sudor(g, cR - 6, cabezaY + 2 - vuelo, Tm < 2200);
      if (k >= 1 && Tm < 2300) [[-7, 0], [6, 1]].forEach(([ox, oy], i) => { const q = Math.min(1, (Tm - llega - 450) / 500); g.globalAlpha = 1 - q; g.fillStyle = "#D6CFC0"; g.fillRect(cR + ox - 2 - Math.round(q * 3 * (i ? -1 : 1)), SUELO + dy - 2 + oy, 4, 2); g.globalAlpha = 1; });   // polvo al caer
      if (!llevaCollar(rival)) armaVuela(g, rival, xb, dy, Tm - (llega - 900)); else collarCae(g, xb, dy, Tm, llega);
    }
  } else if (quien === "edith") {   // la nube de tormenta le tira rayos a los lados y lo hace correr de un lado a otro
    const c = corridaEdith(Tm, cR), r = rendido(rival.hd, llevaCollar(rival) ? false : undefined);
    const antes = Tm < INICIO_EDITH;
    if (c.dir === 0) { sombra(g, c.x, dy); figura(g, antes ? rival.hd : r, hdPose(antes ? rival.hd : r, "guardia", t), W - c.x - HD_OX - 15, dy, true); }
    else {   // corre: piernas que se alternan, mirando hacia donde va
      const pc = hdPose(r, "ataque", Math.floor(t / 110) % 2 ? 820 : 600);
      sombra(g, c.x, dy);
      if (c.dir < 0) figura(g, r, pc, W - c.x - HD_OX - 15, dy, true); else figura(g, r, pc, c.x - HD_OX - 15, dy, false);
    }
    if (!antes) sudor(g, c.x - 6 * (c.dir || -1), cabezaY + 2, c.dir === 0);
    if (!antes) { if (!llevaCollar(rival)) armaVuela(g, rival, xb, dy, Tm - (INICIO_EDITH - 900)); else collarCae(g, xb, dy, Tm, INICIO_EDITH); }
    if (Tm >= 600) {   // la nube aparece y sigue al rival con un poco de atraso, apurándose
      const escala = Math.min(1, (Tm - 600) / 700), nubeY = YB + dy + HD_OY - 10, nx = nubeEdithX(Tm, cR);
      nubeTormenta(g, nx, nubeY, escala, t);
      if (c.n >= 0 && c.u < 0.3) rayoEdith(g, nx, nubeY + 4, c.rayoX, SUELO + dy, c.u / 0.3);   // cae derecho, a un lado del rival, y le corta el paso
    }
  } else if (quien === "uzu") {   // Uzu se pone berserk: el rival huye corriendo fuera de la pantalla y suelta el arma
    const Tu = Tm / LENTO_UZU;   // toda la escena de Uzu va más lenta, para que se aprecie
    if (Tu < 1150) { sombra(g, cR, dy); figura(g, rival.hd, hdPose(rival.hd, "guardia", t), xb, dy, true); if (Tu > 850) sudor(g, cR - 6, cabezaY + 2, true); }
    else if (Tu < 2000) {
      const k = (Tu - 1150) / 850, xr = cR - 15 + k * k * 60, r = rendido(rival.hd, false);   // da media vuelta y corre hacia la derecha (a Xitin se le cae el collar)
      figura(g, r, hdPose(r, "ataque", Math.floor(t / 110) % 2 ? 820 : 600), xr - HD_OX, dy, false);
      sudor(g, xr + 22, cabezaY + 2, false);
    }
    if (Tu >= 1150 && !(Tu >= 2600 && uzuRecogio(Tu, W - (xb + HD_OX + 15) + 4, 2 + dx))) {   // el arma (o el collar de Xitin) en el suelo, hasta que Uzu lo recoge
      const [hx, hy] = rival.hd.manos.guardia, q = Math.min(1, (Tu - 1150) / 350);
      const [x0, y0] = llevaCollar(rival) ? [cR - 9, YB + dy + HD_OY + 18] : [W - (xb + HD_OX + hx), YB + dy + HD_OY + hy];   // el collar cae del cuello de Xitin, que ya dio media vuelta
      botinUzu(g, rival, lerp(x0, W - (xb + HD_OX + 15) + 4, q), lerp(y0, SUELO + dy - 3, q * q), q < 1 ? Math.floor(q * 3) : 1);
    }
  } else if (quien === "janet") {   // la flecha rebota en el suelo, sube, atraviesa el arma y la deja clavada arriba en el borde
    const xitinR = llevaCollar(rival), xj = 2 + dx;
    const arco = arcoJanet(xj, dy), [hx, hy] = rival.hd.manos.guardia, mano = [W - (xb + HD_OX + hx), YB + dy + HD_OY + hy - 6];
    const suelo = [Math.round((arco[0] + mano[0]) / 2) - 4, SUELO + dy - 1], clavo = [W - 4, cabezaY - 4];
    const enMano = Tm < 1050;
    if (enMano) { sombra(g, cR, dy); figura(g, rival.hd, hdPose(rival.hd, "guardia", t), xb, dy, true); }
    else { const r = rendido(rival.hd, xitinR ? false : undefined); sombra(g, cR, dy); figura(g, r, hdPose(r, "guardia", t), xb, dy, true); sudor(g, cR - 6, cabezaY + 2, Tm < 1700); }
    const tramo = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, b[0] - a[0], b[1] - a[1]];
    if (Tm >= 900 && Tm < 1050) {   // rebota: polvito en el suelo y sube hacia el arma
      const [x, y, ux, uy] = tramo(suelo, mano, (Tm - 900) / 150); flechaTramo(g, x, y, ux, uy, 0, LARGO_FLECHA);
      const k = (Tm - 900) / 150; g.fillStyle = `rgba(214,207,192,${1 - k})`; g.fillRect(suelo[0] - 3 - Math.round(k * 3), suelo[1] - 1, 3, 1); g.fillRect(suelo[0] + 2 + Math.round(k * 3), suelo[1] - 1, 3, 1);
    }
    if (Tm >= 1050) {   // con el arma ensartada al medio: la cola detrás, el arma, la punta delante
      const k = Math.min(1, (Tm - 1050) / 350), [x, y, ux, uy] = tramo(mano, clavo, k), L = Math.hypot(ux, uy) || 1, mx = x - ux / L * 6, my = y - uy / L * 6;
      flechaTramo(g, x, y, ux, uy, 7, LARGO_FLECHA);
      if (xitinR) collarEntero(g, mx, my); else armaSuelta(g, rival.id, mx, my);
      flechaTramo(g, x, y, ux, uy, 0, 6);
      if (k >= 1) { g.fillStyle = "#3E2A1A"; g.fillRect(W - 1, clavo[1] - 6, 1, 12); }
    } else if (!enMano) {}
  } else if (quien === "agattita") {   // atrapado por enredaderas y con flor; las enredaderas le arrancan el arma (o el collar de Xitin)
    const xitinR = llevaCollar(rival), suelta = Tm >= 900;
    const c = suelta ? { ...rival.hd, arma: undefined, armaDetras: undefined, proyectil: undefined } : rival.hd;
    sombra(g, cR, dy); figura(g, c, hdPose(c, "guardia", 0), xb, dy, true);
    enredaRival(g, cR, cabezaY + 14, SUELO + dy - 1, Math.min(1, (Tm - 900) / 600));
    if (Tm > 1500) florCabeza(g, cR, cabezaY - 4);
    if (suelta) { if (!xitinR) armaVuela(g, rival, xb, dy, Tm); else collarCae(g, xb, dy, Tm, 900); }
  } else {   // desarmado: el arma vuela (o la flecha de Janet se la lleva al borde)
    sombra(g, cR, dy);
    const janet = quien === "janet", xitinR = llevaCollar(rival);
    figura(g, rendido(rival.hd, xitinR ? false : undefined), hdPose(rival.hd, "guardia", t), xb, dy, true);
    sudor(g, cR - 6, cabezaY + 2, Tm < 1700);
    const [hx, hy] = rival.hd.manos.guardia, manoX = W - (xb + HD_OX + hx), manoY = YB + dy + HD_OY + hy;
    const q = Math.min(1, (Tm - 900) / 500);
    if (janet) {   // la flecha atraviesa el arma (o el collar de oso) y lo clava en el borde derecho, arriba del rival
      const ax = lerp(manoX, W - 9, q), ay = lerp(manoY - 6, cabezaY - 6, q);
      if (xitinR) collarEntero(g, ax, ay);   // se lleva el collar colgando de la flecha
      else armaSuelta(g, rival.id, ax, ay);
      flechaJanet(g, Math.round(ax - 10), Math.round(ay), 18);
      if (q >= 1) { g.fillStyle = "#3E2A1A"; g.fillRect(W - 1, ay - 8, 1, 16); }
    } else if (!xitinR) armaVuela(g, rival, xb, dy, Tm);
    else collarCae(g, xb, dy, Tm, 900);
  }

  } finally { if (huyen) rival.hd.huyenMascotas = false; }
  if (huyen) mascotasHuyen(g, rival, xb, dy, Tm, t);

  /* --- el ganador: ataca una vez y después celebra --- */
  if (quien === "xitin" && Tm >= 1400 && Tm < 2600) {   // ruge de oso en su lugar; se transforma de vuelta y regresa caminando
    const lejos = 2 + dx + avance(yo.hd);
    if (Tm >= 2050 && Tm < 2300) {   // la transformación de vuelta: parpadea entre oso y Xitin dentro de destellos verdes
      const oso = Math.floor(Tm / 60) % 2 === 0 && Tm < 2230, k = (Tm - 2050) / 250, cx = centroX(lejos, false), cy = YB + dy + HD_OY + 20;
      sombra(g, cx, dy);
      if (oso) figura(g, { ...yo.hd, proyectil: undefined }, hdPose(yo.hd, "ataque", 1000), lejos, dy, false);
      else figura(g, yo.hd, hdPose(yo.hd, "guardia", t), lejos, dy, false);
      const r = 6 + Math.sin(Math.PI * k) * 12; g.globalAlpha = Math.sin(Math.PI * k) * 0.55; g.fillStyle = "#86EFAC";
      for (let yy = -r; yy <= r; yy++) { const w = Math.sqrt(Math.max(0, r * r - yy * yy)); g.fillRect(Math.round(cx - w), Math.round(cy + yy), Math.round(2 * w) + 1, 1); }
      g.globalAlpha = 1;
      for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + k * 3, rr = r + 2; g.fillStyle = i % 2 ? "#FFFFFF" : "#4ADE80"; g.fillRect(Math.round(cx + Math.cos(a) * rr), Math.round(cy + Math.sin(a) * rr), 2, 2); }
    } else if (Tm < 2050) {
      sombra(g, centroX(lejos, false), dy);
      figura(g, { ...yo.hd, proyectil: undefined }, hdPose(yo.hd, "ataque", 1000), lejos, dy, false);   // el oso quieto, sin el efecto del zarpazo
      if (Tm < 1950) {   // las ondas del rugido, que se van apagando antes de transformarse
        g.globalAlpha = Math.min(1, (1950 - Tm) / 250); g.fillStyle = "#FFFFFF";
        [4, 7, 10].forEach((r, i) => { if ((Math.floor(Tm / 120) + i) % 3 === 2) return; for (let a = -0.7; a <= 0.7; a += 0.12) g.fillRect(Math.round(lejos + HD_OX + 30 + Math.cos(a) * r), Math.round(YB + dy + HD_OY + 6 + Math.sin(a) * r), 1, 1); });
        g.globalAlpha = 1;
      }
    } else {
      const xs = lerp(lejos, 2 + dx, (Tm - 2300) / 300), paso2 = Math.floor(t / 150) % 2, [pa, pd] = yo.hd.pies;
      sombra(g, centroX(xs, false), dy);
      figura(g, yo.hd, { ...hdPose(yo.hd, "guardia", t), pies: paso2 ? [[pa[0] - 2, pa[1]], [pd[0] + 2, pd[1]]] : yo.hd.pies }, xs, dy, false);
    }
  } else if (quien === "kenny" && Tm >= 1700) {   // sigue con la serenata: rasguea el laúd y las notas vuelan hacia el rival
    sombra(g, centroX(xa, false), dy); figura(g, yo.hd, hdPose(yo.hd, "guardia", t), xa, dy, false);
    const nota = (nx, ny, col) => { g.fillStyle = K; g.fillRect(nx - 1, ny - 5, 5, 8); g.fillStyle = col; g.fillRect(nx, ny, 2, 2); g.fillRect(nx + 1, ny - 4, 1, 5); g.fillRect(nx + 2, ny - 4, 1, 1); };
    for (let i = 0; i < 3; i++) {
      const k = ((t / 1600 + i / 3) % 1), nx = Math.round(xa + HD_OX + 26 + k * 40), ny = Math.round(YB + dy + HD_OY + 20 - Math.sin(k * Math.PI) * 8 - i * 2);
      if (k < 0.9) nota(nx, ny, ["#FBBF24", "#F472B6", "#7DD3FC"][i]);
    }
  } else if (quien === "patroclus") {   // manda a su águila: ella vuela, agarra al rival y después vuelve a su hombro
    const D = APUNTA_PATROCLUS, xp = 2 + dx, sinAguila = Tm >= 500 + D && Tm < 3300 + D, c = sinAguila ? { ...yo.hd, armaDetras: undefined } : yo.hd;
    /* Primero apunta al rival con el brazo estirado (la orden al águila); después el águila sale volando. */
    const apunta = Tm >= 250 && Tm < 500 + D + 300;
    const p = Tm < 250 ? hdPose(c, "guardia", t) : apunta ? { ...hdPose(c, "guardia", t), mano: [c.hombro[0] + 12, c.hombro[1] - 2] }
      : Tm < 1700 + D ? { ...hdPose(c, "guardia", t), mano: [c.manos.guardia[0] + 2, c.manos.guardia[1] - 3] } : celebraDuelo(c, Tm - 1700 - D + 400);
    sombra(g, centroX(xp, false), dy); figura(g, apunta ? { ...c, codos: undefined, arma: (px, q) => c.arma(px, { ...q, fase: "guardia", sinBoomerang: false }) } : c, p, xp, dy, false);
    const hombro = [xp + HD_OX + 7, YB + dy + HD_OY + 15], arriba = [cR, YB + dy + HD_OY - 14], agarre = [cR, YB + dy + HD_OY + (rival.hd.bajar || 0) + 3];
    if (Tm >= 500 + D && Tm < 1100 + D) { const k = (Tm - 500 - D) / 600; aguilaVuela(g, lerp(hombro[0], arriba[0], k), lerp(hombro[1], arriba[1], k) - Math.sin(Math.PI * k) * 12, t); }
    else if (Tm >= 1100 + D && Tm < 1350 + D) { const k = (Tm - 1100 - D) / 250; aguilaVuela(g, arriba[0], lerp(arriba[1], agarre[1], k * k), t); }   // en picada
    else if (Tm >= 2700 + D && Tm < 3300 + D) { const k = (Tm - 2700 - D) / 600; aguilaVuela(g, lerp(W + 10, hombro[0], k), lerp(-10, hombro[1], k) - Math.sin(Math.PI * k) * 6, t); }   // vuelve a su hombro
  } else if (quien === "uchis") {   // se esfuma como ninja y reaparece detrás del rival
    const detras = W - (xb + HD_OX + 30) + 14;   // Uchis mirando a la izquierda, a la espalda del rival
    const xDetras = W - (detras + HD_OX + 30);
    if (Tm < 950) { sombra(g, centroX(xa, false), dy); figura(g, yo.hd, hdPose(yo.hd, "guardia", t), xa, dy, false); }
    pufNinja(g, centroX(xa, false), YB + dy + HD_OY + 22, (Tm - 950) / 450);
    if (Tm >= 1500) {   // emerge de las sombras con las manos libres: las dagas van envainadas en el cinto
      const cu = { ...yo.hd, arma: undefined, proyectil: undefined, armaDetras: dagasCinto, brazoCerca: yo.hd.brazoCerca && { ...yo.hd.brazoCerca, poses: {} } };
      const pose = Tm < 1900 ? { ...hdPose(cu, "guardia", t), agacha: 4 } : Tm < 2400 ? celebraDuelo(cu, 500) : celebraDuelo(cu, Tm - 2400 + 400);
      g.globalAlpha = Math.min(1, (Tm - 1500) / 300);
      sombra(g, W - (xDetras + HD_OX + 15), dy); figura(g, cu, pose, xDetras, dy, true);
      g.globalAlpha = 1;
    }
    pufNinja(g, W - (xDetras + HD_OX + 15), YB + dy + HD_OY + 22, (Tm - 1450) / 450, true);
  } else if (quien === "july") {   // martillazo al suelo sin avanzar: la fuerza viaja por el terreno
    const xj = 2 + dx, pj = Tm >= 1700 ? celebraDuelo(yo.hd, Tm - 1700 + 400) : hdPose(yo.hd, "ataque", tA);
    sombra(g, centroX(xj, false), dy); figura(g, yo.hd, pj, xj, dy, false);
  } else if (quien === "edith") {   // sostiene el grimorio en alto, controlando la nube
    const pe = Tm < 600 ? hdPose(yo.hd, "guardia", t) : celebraDuelo(yo.hd, 1200 + (t % 2600 > 1300 ? 0 : 260));
    sombra(g, centroX(2 + dx, false), dy); figura(g, yo.hd, pe, 2 + dx, dy, false);
  } else if (quien === "uzu") {   // la furia: tiembla, se pone rojo, se arranca la polera, persigue al rival y vuelve con el arma de trofeo
    const Tu = Tm / LENTO_UZU, xu = 2 + dx, base = centroX(xu, false);
    const berserk = (rojo) => uzuSinPolera(yo.hd, rojo);
    if (Tu < 1000) {
      const parpadea = Tu >= 600 && Math.floor(Tu / 90) % 2, tiembla = Tu >= 300 ? (Math.floor(Tm / 50) % 2 ? 1 : -1) : 0;
      const c = parpadea ? { ...yo.hd, pal: { ...yo.hd.pal, G: "#D9443A", g: "#9E2A22", Z: "#F07060" } } : yo.hd;
      sombra(g, base, dy); figura(g, c, { ...hdPose(c, "guardia", t), inclina: tiembla, agacha: 2 }, xu, dy, false);
    } else if (Tu < 1350) {   // se arranca la polera: los pedazos salen volando
      const c = berserk(true), k = (Tu - 1000) / 350;
      sombra(g, base, dy); figura(g, c, { ...hdPose(c, "victoria", 900), duelo: true }, xu, dy, false);
      [[-1, -1], [1, -1.3], [-1.4, -0.4], [1.3, -0.5]].forEach(([vx, vy], i) => { const px = base + vx * k * 22, py = YB + dy + HD_OY + 22 + vy * k * 20 + k * k * 18; g.fillStyle = "#1A1020"; g.fillRect(Math.round(px) - 1, Math.round(py) - 1, 5, 4); g.fillStyle = i % 2 ? "#7A5232" : "#5A3A22"; g.fillRect(Math.round(px), Math.round(py), 3, 2); });
    } else if (Tu < 2300) {   // berserk: lo persigue corriendo, con vapor saliéndole de la cabeza
      const c = berserk(true), k = (Tu - 1350) / 950, xc = xu + k * k * (W + 10 - xu);
      sombra(g, centroX(xc, false), dy); figura(g, ...correUzu(c, t), xc, dy, false);
      for (let i = 0; i < 2; i++) { const v = ((t / 400 + i / 2) % 1); g.fillStyle = `rgba(255,255,255,${0.8 * (1 - v)})`; g.fillRect(Math.round(xc + HD_OX + 10 + i * 10 - v * 2), Math.round(YB + dy + HD_OY + 6 - v * 8), 3, 2); }
    } else if (Tu >= 2600) {   // vuelve: verde otra vez (sin polera); recoge el arma y la trae con el brazo estirado
      const c = berserk(false), k = Math.min(1, (Tu - 2600) / 700), centro = (W + 25) - k * (W + 25 - base), llego = k >= 1;
      const tieneArma = uzuRecogio(Tu, W - (xb + HD_OX + 15) + 4, xu);
      if (!llego) {   // camina hacia la izquierda con el brazo adelante
        const paso = Math.floor(t / 180) % 2, mano = [27, 20], pies = paso ? [[c.pies[0][0] - 2, 39], [c.pies[1][0] + 2, 39]] : c.pies;
        const xm = W - centro - HD_OX - 15;
        sombra(g, centro, dy); figura(g, { ...c, codos: { guardia: [24, 21] } }, { ...hdPose(c, "guardia", t), mano, pies, bob: 0, agacha: paso }, xm, dy, true);   // brazo casi recto
        if (tieneArma) botinUzu(g, rival, centro + 15 - mano[0] - 1, YB + dy + HD_OY + mano[1] + paso - 6, 0);   // va en su mano, se mueve con ella
      } else {   // el trofeo en alto con el brazo estirado, jadeando
        const jadea = Math.floor(t / 260) % 2, mano = [28, 14];
        sombra(g, base, dy); figura(g, { ...c, codos: { alto: [25, 18] } }, { ...celebraDuelo(c, 900), mano, bob: -jadea, agacha: 0 }, xu, dy, false);   // brazo estirado, sin quebrarse
        if (tieneArma) botinUzu(g, rival, xu + HD_OX + mano[0] + 1, YB + dy + HD_OY + mano[1] - 6 - jadea, 0);
      }
    }
  } else if (quien === "janet" && Tm < 1700) {   // apunta hacia abajo y dispara al suelo; la flecha la dibuja la escena
    const xj = 2 + dx, apunta = Tm >= 450 && Tm < 1150, tensa = Tm < 760;
    const p = apunta ? { ...hdPose(yo.hd, "guardia", t), fase: "golpe", mano: ARCO_ABAJO, agacha: 2, inclina: 1, sinFlecha: true } : { ...hdPose(yo.hd, "guardia", t), sinFlecha: true };
    const c = apunta ? { ...yo.hd, brazoCerca: { ...yo.hd.brazoCerca, poses: { golpe: tensa ? [[9, 3], [3, 5]] : [[6, 4], [2, 5]] } } } : yo.hd;
    sombra(g, centroX(xj, false), dy); figura(g, c, p, xj, dy, false);
    if (apunta && tensa) {   // la flecha tensada, apuntando en diagonal hacia el suelo
      const ox = xj + HD_OX + 1, oy = YB + dy + HD_OY + 2, cuerda = [ox + 18, oy + 22], punta = [ox + ARCO_ABAJO[0] + 4, oy + ARCO_ABAJO[1] + 3];
      flechaTramo(g, punta[0], punta[1], punta[0] - cuerda[0], punta[1] - cuerda[1], 0, Math.round(Math.hypot(punta[0] - cuerda[0], punta[1] - cuerda[1])));
    }
    if (Tm >= 760 && Tm < 900) {   // la flecha baja hacia el suelo, frente al rival (después rebota)
      const [hx, hy] = rival.hd.manos.guardia, manoX = W - (xb + HD_OX + hx), arco = arcoJanet(xj, dy);
      const suelo = [Math.round((arco[0] + manoX) / 2) - 4, SUELO + dy - 1], k = (Tm - 760) / 140;
      flechaTramo(g, arco[0] + (suelo[0] - arco[0]) * k, arco[1] + (suelo[1] - arco[1]) * k, suelo[0] - arco[0], suelo[1] - arco[1], 0, LARGO_FLECHA);
    }
  } else if (quien === "malia" && Tm < 1700) {   // en vez de lanzar la mermelada, le acerca el cucharón a la boca
    const p = hdPose(yo.hd, "ataque", tA), alza = ["golpe", "choque", "sigue"].includes(p.fase) ? 5 : 0;
    sombra(g, centroX(xa, false), dy); figura(g, yo.hd, { ...p, alimenta: true, mano: [p.mano[0], p.mano[1] - alza] }, xa, dy, false);
  } else if (quien === "cupe" && Tm >= 1400) {   // se queda cerca, levanta el florete y toca los hombros del rival hincado
    const fase = toqueCupe(Tm), [rsx, rsy] = rival.hd.hombro, bj = yo.hd.bajar || 0;
    const hombroX = W - (xb + HD_OX + rsx), hombroY = rsy + 7 + (rival.hd.bajar || 0);   // hombro del rival ya hincado
    const junto = hombroX - HD_OX - 47 + (fase === 3 ? 3 : 0);   // la punta del florete justo en el hombro (el segundo, un poco más allá)
    const xc = lerp(2 + dx + avance(yo.hd), junto, (Tm - 1400) / 600);   // camina hasta el rival
    const p = Tm >= 3800 ? celebraDuelo(yo.hd, Tm - 3800 + 400)
      : fase === 1 || fase === 3 ? { ...hdPose(yo.hd, "guardia", t), fase: "golpe", mano: [28, hombroY - bj - 1], k: 1 }
      : fase >= 0 ? { ...hdPose(yo.hd, "guardia", t), fase: "alto", mano: yo.hd.manos.alto } : hdPose(yo.hd, "guardia", t);
    sombra(g, centroX(xc, false), dy); figura(g, yo.hd, p, xc, dy, false);
    if ((fase === 1 || fase === 3) && (Tm - 2200) % 400 < 220) destello(g, Math.round(xc + HD_OX + 46), YB + dy + HD_OY + hombroY - 1, t);
  } else {
    const pYo = Tm >= 1700 ? celebraDuelo(yo.hd, Tm - 1700 + 400) : hdPose(yo.hd, "ataque", tA);
    sombra(g, centroX(xa, false), dy); figura(g, yo.hd, pYo, xa, dy, false);
  }
  g.restore();
}

/* Modo equipos: dos contra dos. La pareja de atrás pelea un poco más arriba y desfasada. Las dos parejas bajan
   ABAJO px: así la de atrás pisa el suelo de todos los escenarios (empieza en y = 57) y no queda flotando sobre
   el agua, el muro o los arbustos del fondo. */
const ATRAS = -8, ADENTRO = 14, ABAJO = 4
function escenaDuelo2(g, t, [a1, a2], [b1, b2], { escenario } = {}) {
  fondo(g, t, escenario)
  escenaDuelo(g, t + 220, a2, b2, { conFondo: false, dy: ATRAS + ABAJO, dx: ADENTRO })
  escenaDuelo(g, t, a1, b1, { conFondo: false, dy: ABAJO })
}
function escenaGana2(g, t, [a1, a2], [b1, b2], { escenario } = {}) {
  fondo(g, t, escenario)
  escenaGana(g, Math.max(0, t - 160), a2, b2, { conFondo: false, dy: ATRAS + ABAJO, dx: ADENTRO })
  escenaGana(g, t, a1, b1, { conFondo: false, dy: ABAJO })
}

/* ======================= PODIO ======================= */
/* Pedestal con corona de laureles: metal del puesto (oro, plata, bronce en Pear36), placa oscura al frente y,
   dentro, la corona y el número grande. Llega hasta el borde de abajo, así la placa tiene espacio sin subir al personaje. */
const METAL_PUESTO = [null, ["#FFE478", "#F2A65E", "#BA6156", "#8C3F5D"], ["#FFFFEB", "#C2C2D1", "#7E7E8F", "#606070"], ["#FFB570", "#E36956", "#964253", "#57294B"]];
const NUMERO_PUESTO = {   // dígitos gruesos (trazo de 2 px), 6 × 8 y simétricos (el 1 queda al centro)
  1: ["..##..", ".###..", "..##..", "..##..", "..##..", "..##..", "..##..", ".####."],
  2: [".####.", "##..##", "....##", "...##.", "..##..", ".##...", "##....", "######"],
  3: [".####.", "##..##", "....##", "..###.", "....##", "....##", "##..##", ".####."],
};
const INCOGNITA = [".####.", "##..##", "....##", "...##.", "..##..", "......", "..##..", "..##.."];   // "?" mientras no se revela el puesto
const pixel = (g, x, y, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), 1, 1); };
/* Corona de laureles: dos ramas en óvalo (más ancho que alto, para dejarle aire al número), abiertas arriba y
   cruzadas abajo, con hojas de a pares que se achican hacia la punta. Se dibuja la rama izquierda y la derecha es
   su espejo exacto respecto de eje2 / 2 (así queda centrada aunque el centro caiga entre dos píxeles). */
function laureles(g, eje2, cy, rx, ry, [luz, base, sombra]) {
  const cx = eje2 / 2, par = (x, y, c) => { const xi = Math.round(x), yi = Math.round(y); pixel(g, xi, yi, c); pixel(g, eje2 - xi, yi, c); };
  for (let k = 0; k <= 26; k++) { const a = (90 + 12 + k * 5.6) * Math.PI / 180; par(cx + Math.cos(a) * rx, cy + Math.sin(a) * ry, sombra); }   // la rama
  for (let k = 1; k <= 8; k++) {
    const a = (90 + 18 + k * 17) * Math.PI / 180, x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry;
    const tx = Math.sin(a), ty = -Math.cos(a), largo = k < 6 ? 3 : 2;   // hacia la punta de la rama
    for (const [o, col] of [[1, luz], [-1, base]]) {   // hoja de afuera (clara) y de adentro
      const nx = Math.cos(a) * o, ny = Math.sin(a) * o;
      const l = o > 0 ? largo : largo - 1;   // las hojas de adentro, más cortas: le dejan aire al número
      for (let i = 1; i <= l; i++) {
        const hx = x + (nx * 0.8 + tx * 0.7) * i, hy = y + (ny * 0.8 + ty * 0.7) * i;
        par(hx, hy, i === l ? luz : col);
        if (i < l) par(hx + tx * 0.9, hy + ty * 0.9, col);   // hoja de 2 px de grosor
      }
    }
  }
  par(cx - 2, cy + ry + 1, sombra); par(cx - 3, cy + ry + 2, sombra);   // los tallos que se cruzan abajo
}
/* Dibuja el pedestal del puesto y devuelve la altura donde se para el personaje. */
function pedestal(g, puesto, oculto = false) {
  const tope = [0, 52, 55, 58][puesto], alto = 76 - tope, [luz, base, sombra, prof] = METAL_PUESTO[puesto], ancho = 38, bx = W / 2 - 19, by = tope;
  g.fillStyle = K; g.fillRect(bx - 1, by - 3, ancho + 2, alto + 3);
  g.fillStyle = luz; g.fillRect(bx + 1, by - 2, ancho - 2, 2);   // cara de arriba
  g.fillStyle = base; g.fillRect(bx, by, ancho, alto); g.fillStyle = luz; g.fillRect(bx, by, 2, alto);
  g.fillStyle = sombra; g.fillRect(bx + ancho - 2, by, 2, alto); g.fillStyle = prof; g.fillRect(bx, by + alto - 2, ancho, 2);
  const px0 = bx + 4, py0 = by + 2, pw = ancho - 8, ph = alto - 4;   // la placa oscura
  g.fillStyle = prof; g.fillRect(px0 - 1, py0 - 1, pw + 2, ph + 2); g.fillStyle = "#322947"; g.fillRect(px0, py0, pw, ph); g.fillStyle = "#473B78"; g.fillRect(px0, py0, pw, 1);
  const eje2 = 2 * bx + ancho - 1, cy = py0 + Math.floor(ph / 2), ry = Math.min(9, Math.floor(ph / 2) - 1), rx = 11;   // eje2: el doble del centro de la placa
  laureles(g, eje2, cy, rx, ry, [luz, base, sombra]);
  const f = oculto ? INCOGNITA : NUMERO_PUESTO[puesto], on = (i, j) => f[j] && f[j][i] === "#", nx = (eje2 - 5) / 2, ny = cy - 4;   // el número (6 de ancho) centrado, con contorno
  for (let j = -1; j <= 8; j++) for (let i = -1; i <= 6; i++) if (!on(i, j) && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => on(i + a, j + b))) pixel(g, nx + i, ny + j, K);
  for (let j = 0; j < 8; j++) for (let i = 0; i < 6; i++) if (on(i, j)) pixel(g, nx + i, ny + j, j < 2 ? "#FFFFEB" : luz);
  return by - 2;
}
function confeti(g, t) {
  const cols = ["#F472B6", "#FBBF24", "#60A5FA", "#4ADE80", "#F97316", "#FFFFFF"];
  for (let i = 0; i < 26; i++) {
    const vel = 14 + (i * 37) % 13, x = (i * 53 + Math.sin(t / 400 + i) * 4) % W, y = ((t / 1000) * vel + i * 17) % 80 - 4;
    g.fillStyle = cols[i % cols.length]; g.fillRect(Math.round(x), Math.round(y), (i + Math.floor(t / 150)) % 2 ? 2 : 1, 1);
  }
}
/* Quien quedó en el podio: celebra a su manera sobre su escalón y cae confeti. */
function escenaPodio(g, t, c, puesto, { escenario } = {}) {
  const vuelta = reduce ? t : t % 8000;   // la celebración se repite completa (algunas son una secuencia que termina)
  fondo(g, t, escenario);
  podioSinFondo(g, vuelta, c, puesto);
  if ((reduce ? 2000 : vuelta) > 400) confeti(g, t);
}
/* El pedestal y el personaje celebrando, sin escenario: el proyector lo pinta sobre su escenario oscuro.
   Sin personaje (c = null), solo el pedestal; oculto: el puesto todavía no se revela (lleva "?"). */
function podioSinFondo(g, t, c, puesto, oculto = false) {
  const Tm = reduce ? 2000 : t;
  const by = pedestal(g, puesto, oculto);
  if (!c) return;
  const x = Math.round(W / 2 - HD_OX - 15), y = by - (HD_OY + 39);
  g.fillStyle = "rgba(10,25,12,.45)"; g.fillRect(W / 2 - 7, by - 1, 14, 1);
  const p = { ...hdPose(c.hd, "victoria", Tm), enPodio: true };
  if (c.hd.proyectilAtras) c.hd.proyectilAtras(g, x, y, p);   // lo que pasa por detrás del personaje (el águila de Patroclus)
  hdDibujar(g, x, y, c.hd, p);
  if (c.hd.proyectil) c.hd.proyectil(g, x, y, p);
}
/* Quien no quedó en el podio: aplaude y da saltitos. */
function escenaAplauso(g, t, c, { escenario } = {}) {
  const Tm = reduce ? 0 : t;
  fondo(g, t, escenario);
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

/* Las escenas se pintan con los efectos en Pear36 (los personajes ya traen su paleta; el fondo queda igual). */
const enPear36 = (escena) => (g, ...resto) => escena(lienzoPear36(g), ...resto)
const [escenaDueloP, escenaGanaP, escenaDuelo2P, escenaGana2P, escenaPodioP, escenaAplausoP, pintarRetratoP, podioSinFondoP] = [escenaDuelo, escenaGana, escenaDuelo2, escenaGana2, escenaPodio, escenaAplauso, pintarRetrato, podioSinFondo].map(enPear36)
export { T as HEROES, pedestal as pedestalPodio, podioSinFondoP as podioProyector, escenaDueloP as escenaDuelo, escenaGanaP as escenaGana, escenaDuelo2P as escenaDuelo2, escenaGana2P as escenaGana2, escenaPodioP as escenaPodio, escenaAplausoP as escenaAplauso, pintarRetratoP as pintarRetrato }
export const heroOf = (id) => T.find((c) => c.id === id) || null
/* Para quien todavía no eligió: uno fijo según su id, así no cambia entre pantallas. */
export function heroFor(id, chosen) {
  const h = heroOf(chosen); if (h) return h
  let n = 0; for (const ch of String(id || '')) n = (n * 31 + ch.charCodeAt(0)) >>> 0
  return T[n % T.length]
}
