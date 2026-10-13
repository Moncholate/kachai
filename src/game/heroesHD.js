/* Motor de los personajes en tres cuartos (HD) y sus diseños. Viene de la página de comparación
   «Personajes mejorados»; cada personaje es HD_<NOMBRE>34 (Xitin: HD_XITIN_NUEVA2). */
/* ============================================================================
   PERSONAJES MEJORADOS (opción C)
   ----------------------------------------------------------------------------
   Sistema común: grilla de 32 × 40 (cabeza y torso dibujados; brazo y piernas
   en código), tres tonos por material, brazo con codo, piernas con rodilla,
   capa o pelo que se mueven, y un ataque en fases: guardia → impulso → golpe →
   choque → sigue → vuelve. Cada personaje trae su dibujo, sus colores, sus
   piernas, su brazo y su arma.
   ========================================================================== */
const HDK = "#1A1020";
const HD_OX = 8, HD_OY = 6;

function hdLinea(x0, y0, x1, y1, fn) {
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
  let dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1, e = dx + dy;
  for (;;) { fn(x0, y0); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
}
/* Rellena píxeles [x, y, color] y les pone un contorno de 1 px. */
function hdContorno(px, pts, color) {
  const set = new Map(pts.map(([x, y, c]) => [x + "," + y, [x, y, c]]));
  set.forEach(([x, y]) => [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([a, b]) => { if (!set.has((x + a) + "," + (y + b))) px(x + a, y + b, HDK); }));
  set.forEach(([x, y, c]) => px(x, y, c || color));
}
const hdFilas = (px, filas, pal) => Object.entries(filas).forEach(([f, txt]) => [...txt].forEach((k, c) => { if (k === "K") px(c, +f, HDK); else if (pal[k]) px(c, +f, typeof pal[k] === "function" ? pal[k](c, +f) : pal[k]); }));   // un color puede ser una función (cuadrillé)

/* Brazo en dos tramos (hombro → codo → mano). col: { luz, base, sombra, mano, codo } */
function hdBrazo(px, hombro, mano, col, grueso = 3, codoFijo, codoAfuera) {
  const [sx, sy] = hombro, [hx, hy] = mano;
  const mx = (sx + hx) / 2, my = (sy + hy) / 2, L = Math.hypot(hx - sx, hy - sy) || 1;
  let nx = -(hy - sy) / L, ny = (hx - sx) / L; if (ny < 0) { nx = -nx; ny = -ny; }
  if (codoAfuera && hy - sy > 0.8 * Math.abs(hx - sx) && nx < 0) { nx = -nx; ny = -ny; }   // brazo colgando: el codo hacia afuera, no hacia la espalda
  const flex = Math.max(0, 3.2 - L * 0.18);
  const [ex, ey] = codoFijo || [Math.round(mx + nx * flex), Math.round(my + ny * flex)];
  const pts = [];
  const tramo = (x0, y0, x1, y1) => hdLinea(x0, y0, x1, y1, (x, y) => { for (let i = 0; i < grueso; i++) for (let j = 0; j < grueso; j++) pts.push([x - 1 + i, y - 1 + j, j === 0 ? col.luz : j === grueso - 1 ? col.sombra : col.base]); });
  tramo(sx, sy, ex, ey); tramo(ex, ey, hx, hy);
  if (col.hombrera) { const r2 = grueso >= 3 ? 4 : 2; for (let i = -2; i <= 2; i++) for (let j = -2; j <= 1; j++) if (i * i + j * j <= r2) pts.push([sx + i, sy + j, j < 0 ? col.luz : col.base]); }   // hombrera proporcional al brazo
  const m = grueso >= 3 ? 2 : 1;   // la mano crece con el brazo
  for (let i = -1; i <= m; i++) for (let j = -1; j <= m; j++) pts.push([hx + i, hy + j, i === -1 || j === -1 ? col.manoLuz || col.mano : col.mano]);
  hdContorno(px, pts);
  if (col.codo) px(ex, ey, col.codo);
}
/* Pierna en dos tramos (cadera → rodilla → pie), la rodilla hacia adelante. */
function hdPierna(pf, cadera, pie, col, adelante, largo = 11) {
  const [cx, cy] = cadera, [fx, fy] = pie, d = Math.hypot(fx - cx, fy - cy) || 1;
  const doblez = Math.sqrt(Math.max(0, (largo / 2) ** 2 - (d / 2) ** 2));
  let nx = -(fy - cy) / d, ny = (fx - cx) / d; if (nx < 0) { nx = -nx; ny = -ny; }
  const kx = Math.round((cx + fx) / 2 + nx * doblez), ky = Math.round((cy + fy) / 2 + ny * doblez);
  const pts = [];
  const tramo = (x0, y0, x1, y1, arriba) => hdLinea(x0, y0, x1, y1, (x, y) => { const w = (adelante && col.anchoAdelante) || col.ancho || 4; for (let i = 0; i < w; i++) for (let j = 0; j < 2; j++) pts.push([x - 1 + i, y + j, i === 0 ? (arriba ? col.luz : col.luz2 || col.luz) : i === w - 1 ? (arriba ? col.sombra : col.sombra2 || col.sombra) : (arriba ? col.base : col.base2 || col.base)]); });
  tramo(cx, cy, kx, ky, true); tramo(kx, ky, fx, fy - 1, false);
  for (let i = 0; i < ((adelante && col.anchoAdelante) || col.ancho || 4) + 2; i++) for (let j = 0; j < 2; j++) pts.push([fx - 1 + i, fy - 1 + j, j === 0 ? col.bota : col.botaSombra]);
  hdContorno(pf, pts);
  if (col.rodilla) { pf(kx, ky, adelante ? col.rodilla : col.luz); pf(kx + 1, ky, col.luz); }
}

/* Vuelo del vestido: cuando las piernas se abren, la falda se ensancha hacia cada pie, más abajo que arriba,
   para que la pierna de adelante no se escape por el costado. */
function hdFaldaVuelo(falda, adelante, atras) {
  const filas = Object.keys(falda).map(Number).sort((a, b) => a - b), n = filas.length;
  if (adelante <= 0 && atras <= 0) return falda;
  const out = {};
  filas.forEach((f, i) => {
    let t = falda[f]; const der = Math.round(Math.max(0, adelante + 1) * (i + 1) / n), izq = Math.round(Math.max(0, atras) * (i + 1) / n);
    const fin = t.lastIndexOf("K"), ini = t.indexOf("K");
    if (fin > ini + 1 && der > 0) { const rel = t[fin - 1] === "K" ? "K" : t[fin - 1]; t = t.slice(0, fin) + rel.repeat(der) + "K" + t.slice(fin + 1); }
    if (ini >= 0 && izq > 0) { const rel = t[ini + 1] === "K" ? "K" : t[ini + 1]; const pad = Math.max(0, izq - ini); t = ".".repeat(pad) + t; const i2 = ini + pad; t = t.slice(0, i2 - izq) + "K" + rel.repeat(izq) + t.slice(i2 + 1); }
    out[f] = t;
  });
  return out;
}

/* Dibuja un personaje mejorado. p: { mano, inclina, bob, agacha, pies, capa, pelo, fase, t } */
/* Color con que se pinta cada píxel de un personaje: su contorno propio (c.contorno) en vez del de siempre,
   y su tabla de traducción a Pear36 (c.mapa: "#ORIGINAL" -> "#PEAR36"), que cubre también los colores
   escritos dentro de brazos, armas y mascotas. Sin contorno ni mapa, el color queda igual. */
const hdTraducciones = new WeakMap();   // por cada mapa: color ya traducido (se calcula una vez)
function hdColor(c) {
  const K = c.contorno || HDK, mapa = c.mapa;
  if (!mapa) return (col) => (col === HDK ? K : col);
  let hechos = hdTraducciones.get(mapa); if (!hechos) { hechos = new Map(); hdTraducciones.set(mapa, hechos); }
  return (col) => {
    if (col === HDK) return K;
    let v = hechos.get(col);
    if (v === undefined) { v = (typeof col === "string" && mapa[col.toUpperCase()]) || col; hechos.set(col, v); }
    return v;
  };
}
function hdDibujar(g, x, y, c, p) {
  if (c.retoque) { const r = c.retoque(p, c); if (r) { c = { ...r.c, contorno: r.c.contorno || c.contorno, mapa: r.c.mapa || c.mapa }; p = r.p; } }
  if (p.corrX) x += p.corrX;   // corrimiento horizontal que pide un retoque (Jelic surfeando, centrado en el escalón)   // retoque que ve la escena (Jelic surfea en el podio)
  if (p.voltea) {   // mirando al otro lado (el giro de July): se dibuja en espejo sobre su propio centro
    g.save(); g.translate(2 * (x + HD_OX) + 31, 0); g.scale(-1, 1); hdDibujar(g, x, y, c, { ...p, voltea: false }); g.restore(); return;
  }
  if (c.forma) { const f = c.forma(p); if (f) { p = { ...p, mano: f.manos[p.fase] || f.manos.guardia }; c = { ...f, contorno: f.contorno || c.contorno, mapa: f.mapa || c.mapa }; } }   // transformación (Xitin → oso), con la paleta del personaje
  if (c.manoDinamica) p = { ...p, mano: c.manoDinamica(p) };   // la mano sigue un arco cuadro a cuadro (martillazo de July)
  const bj = c.bajar || 0, baja = (p.bob || 0) + (p.agacha || 0) + bj, inc = p.inclina || 0;   // bajar: personajes más bajitos, de piernas cortas
  const color = hdColor(c);   // paleta Pear36: contorno propio y colores traducidos antes de pintar
  const px = (a, b, col) => { g.fillStyle = color(col); g.fillRect(x + HD_OX + a + inc, y + HD_OY + b + baja, 1, 1); };
  const pf = (a, b, col) => { g.fillStyle = color(col); g.fillRect(x + HD_OX + a, y + HD_OY + b, 1, 1); };
  const [pa, pd] = p.pies || c.pies, alto = Math.min(0, p.bob || 0);
  if (c.capa) hdFilas(px, c.capa[(p.capa || 0) % c.capa.length], c.pal);
  if (c.atras) c.atras(px, p);
  if (!c.sinPiernas) hdPierna(pf, [c.caderas[0][0] + inc, c.caderas[0][1] + baja], [pa[0], pa[1] + alto], c.pierna, false, 11 - bj);
  const brazoAtras = c.brazoAtras && c.brazoAtras(p);   // la mano en alto pasa detrás de la cabeza
  if (brazoAtras) { hdBrazo(px, c.hombro, p.mano, c.brazo, c.brazoGrueso); if (c.arma) c.arma(px, p); }
  hdFilas(px, Object.fromEntries(c.cuerpo.map((f, i) => [i + (c.top || 0), f])), c.pal);
  if (c.cierraCintura) { const y = c.cuerpo.length + (c.top || 0); [...c.cuerpo[c.cuerpo.length - 1]].forEach((k, x) => { if (k !== ".") px(x, y, HDK); }); }   // línea bajo la ropa: separa la cintura de la pierna de atrás
  if (c.pelo) hdFilas(px, c.pelo[(p.pelo || 0) % c.pelo.length], c.pal);
  if (!c.sinPiernas) hdPierna(pf, [c.caderas[1][0] + inc, c.caderas[1][1] + baja], [pd[0], pd[1] + alto], c.pierna, true, 11 - bj);
  if (c.falda) hdFilas(px, c.faldaVuelo ? hdFaldaVuelo(c.falda, (p.pies || c.pies)[1][0] - c.pies[1][0] + (p.fase === "sube" || p.fase === "alto" ? Math.round((p.agacha || 0) * 1.5) : 0), c.pies[0][0] - (p.pies || c.pies)[0][0]) : c.falda, c.pal);   // vestido largo: va encima de las piernas
  /* Con los brazos en alto, los brazos pasan por delante de los adornos de los hombros (hombreras de Edith). */
  const brazosArriba = !!(p.mano && c.hombro && p.mano[1] < c.hombro[1] - 2);
  if (c.adorno && brazosArriba) c.adorno(px, p);
  const brazoCerca = () => {   // tres cuartos: el brazo de cerca, tranquilo junto al cuerpo con el codo hacia afuera
    const [sx, sy] = c.brazoCerca.hombro;
    const [mano, codo] = { sube: [[-5, -2], [-4, 2]], alto: [[-6, -9], [-5, -3]], ...(c.brazoCerca.poses || {}) }[p.fase] || c.brazoCerca.todas || [[-1, 7], [-3, 4]];   // al celebrar levanta los dos brazos
    hdBrazo(px, [sx, sy], [sx + mano[0], sy + mano[1]], c.brazoCerca.col || c.brazo, c.brazoGrueso, [sx + codo[0], sy + codo[1]]);
  };
  if (c.brazoCerca && !c.brazoCerca.encima) brazoCerca();
  if (c.armaDetras) c.armaDetras(px, p);
  if (c.brazoCerca && c.brazoCerca.encima) brazoCerca();   // el brazo de cerca va sobre el instrumento (Kenny)
  const codo = (c.codoDinamico && c.codoDinamico(p)) || (c.codos && (c.codos[p.fase] || (p.fase === "vuelve" ? c.codos.guardia : undefined)));   // codo a mano: el brazo sube y baja con naturalidad
  if (!brazoAtras) hdBrazo(px, c.hombro, p.mano, c.brazo, c.brazoGrueso, codo, !!c.brazoCerca);
  if (c.arma && !brazoAtras) c.arma(px, p);
  if (c.adorno && !brazosArriba) c.adorno(px, p);   // ropa y adornos que no son el arma (siguen puestos aunque lo desarmen)
  if (c.manoEncima && !brazoAtras) {   // la mano se dibuja sobre el mango: se ve agarrando el arma
    const [hx, hy] = p.mano, m = (c.brazoGrueso || 3) >= 3 ? 2 : 1, pts = [];
    for (let i = -1; i <= m; i++) for (let j = -1; j <= m; j++) pts.push([hx + i, hy + j, i === -1 || j === -1 ? c.brazo.manoLuz || c.brazo.mano : c.brazo.mano]);
    hdContorno(px, pts);
  }
}

/* Las fases comunes. Cada personaje da las manos de cada fase en c.manos. */
function hdPose(c, anim, t) {
  t = t || 0;   // el rival parte con el reloj en negativo: los cuadros se cuentan igual sin salirse de la lista
  const ciclo = (ms, n) => ((Math.floor(t / ms) % n) + n) % n;
  const capa = c.capaLenta ? ciclo(c.capaLenta, c.capa.length) : ciclo(180, 3), pelo = ciclo(260, 2), bob = ciclo(520, 2);
  const m = c.manos, pies = c.pies;
  if (anim === "guardia") return { mano: m.guardia, capa, pelo, agacha: bob, pies, fase: "guardia", t };
  if (anim === "victoria") {
    const T = t % 2600;
    if (T < 400) return { mano: m.guardia, capa, pelo, agacha: bob, pies, fase: "guardia", t };
    if (T < 650) return { mano: m.sube, capa, pelo, agacha: 2, pies, fase: "sube", t };
    const sal = Math.floor(t / 260) % 2;
    return { mano: m.alto, capa, pelo, bob: sal ? -3 : 0, agacha: sal ? 0 : 2, pies, fase: "alto", t };
  }
  const T = t % 2400;
  if (T < 500) return { mano: m.guardia, capa, pelo, agacha: bob, pies, fase: "guardia", t };
  if (T < 760) return { mano: m.impulso, capa: 2, pelo: 1, inclina: -2, agacha: 3, pies: [[pies[0][0] - 2, 39], [pies[1][0] - 1, 39]], fase: "impulso", t, k: (T - 500) / 260 };
  if (T < 900) return { mano: m.golpe, capa: 0, pelo: 0, inclina: 2, agacha: 1, pies: [[pies[0][0] - 3, 39], [pies[1][0] + 5, 39]], fase: "golpe", t, k: (T - 760) / 140 };
  if (T < 1150) return { mano: m.choque || m.golpe, capa: 1, pelo: 0, inclina: 3, agacha: 3, pies: [[pies[0][0] - 3, 39], [pies[1][0] + 6, 39]], fase: "choque", t, k: (T - 900) / 250 };
  if (T < 1400) return { mano: m.sigue || m.golpe, capa: 2, pelo: 1, inclina: 2, agacha: 2, pies: [[pies[0][0] - 2, 39], [pies[1][0] + 5, 39]], fase: "sigue", t, k: (T - 1150) / 250 };
  return { mano: m.guardia, capa, pelo, agacha: bob, pies, fase: "vuelve", t };
}

/* ======================= JELIC ======================= */
const HD_JELIC = (() => {
  const pal = {
    L: "#E6EBF3", M: "#AEB7C6", m: "#7E8798", d: "#555D6E", Q: "#4F74E0", A: "#2747B8", a: "#18308A",
    P: "#F26B7A", R: "#D7263D", r: "#9B1428", z: "#CC9670", S: "#B07B55", s: "#86583A", W: "#F2F3F6", w: "#BFC4CE", Y: "#F0C04A", y: "#A87C20", B: "#2A2440",
  };
  const escudo = (px, cx, top) => {
    const Hh = 17, media = (i) => (i < 9 ? 5 : Math.max(0, Math.round(5 * (Hh - 1 - i) / 8))), pts = [];
    for (let i = 0; i < Hh; i++) { const w = media(i); for (let x = cx - w; x <= cx + w; x++) {
      const borde = Math.abs(x - cx) === w || i === 0 || i >= Hh - 2;
      pts.push([x, top + i, borde ? (x < cx ? pal.L : pal.M) : (i < 4 ? pal.Q : i < 11 ? pal.A : pal.a)]); } }
    hdContorno(px, pts);
    /* El emblema: un búho posado, con penachos, ojos dorados, pecho blanco rayado, alas plegadas y patitas. */
    const COL = { P: "#8C3F5D", p: "#BA6156", O: "#FFE478", o: "#F2A65E", K: "#272736", W: "#FFFFEB", b: "#C2C2D1" };
    [".P.....P.", ".PpppppP.", ".pOOpOOp.", ".pOKpKOp.", ".ppPoPpp.", "PpWbWbWpP", "PpbWbWbpP", "PppWbWppP", ".PpbWbpP.", "..PPPPP..", "...o.o..."]
      .forEach((f, i) => [...f].forEach((k, j) => { if (COL[k]) px(cx - 4 + j, top + 1 + i, COL[k]); }));
  };
  return {
    id: "jelic", nombre: "Jelic", pal,
    cuerpo: [
      "...............................", "...............................", "............KKKKKK.............", "...........KLLLMMMKK...........",
      "..........KLLMMMMMMMK..........", ".........KLMMMMMMMMMMK.........", ".........KLMMMMMMMMMMMK........", "........KLMMMMMMMMMMMMK........",
      "........KLMMMmmmmmmmMMK........", "........KMMMmKKKKKKKKmK........", "........KMMmKzSSSSSSSKK........", "........KMMmKSSSSSSKSSK........",
      "........KMMmKSSSSSSKSSK........", "........KMmmKsSSSSSSSSK........", "........KMmmKsSWWWWWSSK........", "........KmmmKssSwWWwSK.........",
      ".........KmmKKssSSSSK..........", "..........KKdddKKKKK...........", ".........KKdMMMMMMMMK..........", "........KdMLLMMMMMMMMK.........",
      "........KMLLQAAAAAMMMMK........", "........KMLQAARRAAAMMMK........", "........KMLQARRRRAAAMMK........", "........KMLQAARRAAAAMMK........",
      "........KMMQAAAAAAAAAMK........", "........KBBBBBYBBBBBBBK........", "........KRaRaRaRaRaRaK.........", "........KaRaRaRaRaRaRK.........",
    ],
    capa: [
      { 15: ".......KK", 16: "......KQAK", 17: ".....KQAAK", 18: "....KQAAAK", 19: "...KQAAAK", 20: "..KQAAAK", 21: "..KQAAAK", 22: ".KQAAAaK", 23: ".KQAAaAK", 24: ".KQAaAAK", 25: "KQAAaAAK", 26: "KQAaAAAK", 27: "KQaAAAaK", 28: "KAaAAaAK", 29: "KaAAaAK.", 30: "KaAaAK..", 31: ".KaaK...", 32: "..KK...." },
      { 15: ".......KK", 16: "......KQAK", 17: ".....KQAAK", 18: "....KQAAAK", 19: "...KQAAAK", 20: "..KQAAAK", 21: ".KQAAAAK", 22: ".KQAAAaK", 23: "KQAAAaAK", 24: "KQAAaAAK", 25: "KQAaAAAK", 26: "KQaAAAaK", 27: "KAaAAaAK", 28: "KaAAaAK.", 29: ".KaAaK..", 30: ".KaaK...", 31: "..KK....", 32: "........" },
      { 15: ".......KK", 16: "......KQAK", 17: ".....KQAAK", 18: "....KQAAAK", 19: "....KQAAK", 20: "...KQAAK", 21: "..KQAAAK", 22: "..KQAAaK", 23: ".KQAAaAK", 24: ".KQAaAAK", 25: ".KQaAAAK", 26: "KQAaAAaK", 27: "KQaAAaAK", 28: "KAaAaAAK", 29: "KaAaAAK.", 30: "KaaAAK..", 31: "KaaK....", 32: ".KK....." },
    ],
    pelo: [
      { 0: "..........RRRR", 1: "........PRRRRRr", 2: "......PRRrr.", 3: ".....PRr....", 4: "....Rr......", 5: "...r........" },
      { 0: "...........RRRR", 1: ".........PRRRRr", 2: ".......PRRrr", 3: "......PRr...", 4: ".....Rr.....", 5: "....r......." },
    ],
    hombro: [13, 19], caderas: [[11, 28], [16, 28]], pies: [[11, 39], [18, 39]],
    brazo: { luz: pal.L, base: pal.M, sombra: pal.m, mano: pal.d, manoLuz: pal.M, codo: pal.Y, hombrera: true },
    pierna: { luz: pal.L, base: pal.M, sombra: pal.m, bota: pal.M, botaSombra: pal.d, rodilla: pal.Y },
    manos: { guardia: [19, 26], impulso: [15, 25], golpe: [24, 23], choque: [26, 23], sigue: [25, 24], sube: [22, 16], alto: [25, 11] },
    arma: (px, p) => { const [hx, hy] = p.mano; escudo(px, hx + 3, hy - 9); },
    choque: [36, 20],
  };
})();

/* Arma de Cupe: espada de caballero (la misma para el ataque, el saludo del podio, el nombramiento y cuando se le cae).
   Hoja de 2 px que brilla, guarda recta dorada y pomo en forma de corona, como la suya. Se dibuja a lo largo de la
   dirección del golpe (u) y su perpendicular, así queda bien en cualquier ángulo. */
const armaCupe = (px, hx, hy, d, conMango = false) => {
  const L = Math.hypot(d[0], d[1]), ux = d[0] / L, uy = d[1] / L, pts = [];
  const P = (i, j) => [Math.round(hx + 1 + ux * i - uy * j), Math.round(hy + ux * j + uy * i)];
  const ORO = "#FFE478", ORO2 = "#F2A65E";
  for (let i = 3; i <= 17; i++) { pts.push([...P(i, 0), i >= 16 ? "#FFFFFF" : "#FFFFEB"]); if (i < 16) pts.push([...P(i, 1), "#C2C2D1"]); }   // hoja
  for (let j = -2; j <= 3; j++) pts.push([...P(2, j), j < 1 ? ORO : ORO2]);   // guarda
  pts.push([...P(-2, -1), ORO], [...P(-2, 0), "#EB564B"], [...P(-2, 1), ORO], [...P(-3, -1), ORO], [...P(-3, 1), ORO]);   // pomo de corona
  if (conMango) for (let i = -1; i <= 1; i++) pts.push([...P(i, 0), i === 0 ? "#5E315B" : "#8C3F5D"], [...P(i, 1), "#5E315B"]);   // mango de cuero (en la mano lo tapa la pata)
  hdContorno(px, pts);
};

/* ======================= LATTE ======================= */
const HD_LATTE = (() => {
  const pal = {
    T: "#2A2733", t: "#45405A", u: "#17151D", Y: "#C0263A", y: "#8A1A2A", W: "#F4F1E8",
    H: "#C8622E", h: "#8E3E18", i: "#E58A4E", S: "#D9A27A", s: "#A8714C", z: "#EDBE96", X: "#45393F", x: "#2E262B", E: "#1A1020",
    C: "#2F4A3A", c: "#1C2E24", V: "#4A6E55", J: "#B9804A", j: "#85562E", k: "#D9A46C", L: "#EAD7B7", l: "#C9B48F", B: "#4A2E22", G: "#D4AF4F",
  };
  /* Abanico de tres naipes, cada uno con su borde, delante de la mano. */
  const naipes = (px, hx, hy, abiertos = 1) => {
    [[-4, -7], [0, -9], [4, -7]].forEach(([dx, dy], i) => {
      const x0 = hx + Math.round(dx * abiertos), y0 = hy + dy, pts = [];
      for (let a = 0; a < 4; a++) for (let b = 0; b < 6; b++) pts.push([x0 + a, y0 + b, a === 3 || b === 5 ? "#D9D2C2" : "#F8F5EE"]);
      hdContorno(px, pts);
      const tinta = i === 1 ? "#1A1020" : "#D7263D";
      px(x0, y0, tinta); px(x0 + 1, y0 + 2, tinta); px(x0 + 2, y0 + 2, tinta); px(x0 + 1, y0 + 3, tinta); px(x0 + 3, y0 + 5, tinta);
    });
  };
  return {
    id: "latte", nombre: "Latte", pal,
    cuerpo: [
      "............KKKKKKK", "............KtTTTTK", "............KtTTTuK", "............KtTTTuK",
      "............KtTTWWK", "............KYYYWYK", "............KyyyyyK", ".........KKKKTTTTTKKKK",
      "........KtTTTTTTTTTTTuK", ".........KKHHHHHHHHHKK", "........KHiHHHHKzSSSSSK", "........KHiHHHKSSSSSEsK",
      "........KhHHHKSSSSSSESK", "........KhHHHKXSSSSSSSK", ".........KhHKXXSSSSXXXK", ".........KhHKXXXSSXXXK",
      "..........KKKXXXXXXXK", "..........KKLLKKKKK", "........KLLLLLJJJJK", "........KJLLLJJJJJJK",
      "........KjJLJJkJJJJJK", "........KjJJJJkJJJJJK", "........KjJBJJkJJJJJK", "........KjJJBJJJJJJJK",
      "........KjBBBGBBBBBBK", "........KjJJJJJBJJJJK", "........KjjJJJJjJJJJK", "........KKjjjjjjjjjjK",
    ],
    capa: [
      { 15: ".......KK", 16: "......KVCK", 17: ".....KVCCK", 18: "....KVCCCK", 19: "...KVCCcK", 20: "...KVCcCK", 21: "..KVCCcCK", 22: "..KVCcCCK", 23: "..KVCcCCK", 24: ".KVCCcCCK", 25: ".KVCcCCCK", 26: ".KVcCCCcK", 27: "KVCcCCcCK", 28: "KVcCCcCK.", 29: "KCcCcCK..", 30: "KccCK....", 31: ".KKK....." },
      { 15: ".......KK", 16: "......KVCK", 17: ".....KVCCK", 18: "....KVCCCK", 19: "...KVCCcK", 20: "..KVCCcCK", 21: "..KVCcCCK", 22: ".KVCCcCCK", 23: ".KVCcCCCK", 24: ".KVcCCCcK", 25: "KVCcCCcCK", 26: "KVcCCcCK.", 27: "KCcCcCK..", 28: "KccCcK...", 29: ".KccK....", 30: "..KK.....", 31: "........." },
      { 15: ".......KK", 16: "......KVCK", 17: ".....KVCCK", 18: "....KVCCCK", 19: "....KVCcK", 20: "...KVCcCK", 21: "...KVCcCK", 22: "..KVCcCCK", 23: "..KVcCCCK", 24: "..KVCCcCK", 25: ".KVCcCCcK", 26: ".KVcCCcCK", 27: "KVCcCcCK.", 28: "KVcCcCCK.", 29: "KCcCCcK..", 30: "KcCcK....", 31: "KccK.....", 32: ".KK......" },
    ],
    hombro: [13, 19], caderas: [[11, 28], [16, 28]], pies: [[11, 39], [18, 39]],
    brazo: { luz: pal.k, base: pal.J, sombra: pal.j, mano: "#3E6E78", manoLuz: "#5E8E98" },
    pierna: { luz: "#56637E", base: "#3B4660", sombra: "#283147", luz2: "#56637E", base2: "#3B4660", sombra2: "#283147", bota: "#2A2230", botaSombra: "#1A1520" },
    manos: { guardia: [19, 25], impulso: [8, 25], golpe: [26, 20], choque: [27, 21], sigue: [25, 22], sube: [22, 16], alto: [25, 11] },
    arma: (px, p) => {
      const [hx, hy] = p.mano;
      if (p.fase === "golpe" || p.fase === "choque" || p.fase === "sigue") return;   // ya los lanzó
      naipes(px, hx, hy, p.fase === "impulso" ? 0.6 : 1);
    },
    /* Los dos naipes vuelan girando desde la mano. */
    proyectil: (g, x, y, p) => {
      if (p.fase !== "golpe" && p.fase !== "choque") return;
      const avance = p.fase === "golpe" ? p.k : 1;
      [[0, -1], [-6, 3]].forEach(([atras, dy], i) => {
        const cx = Math.round(x + HD_OX + 30 + atras + avance * 18), cy = y + HD_OY + 18 + dy, gira = Math.floor((p.t + i * 60) / 60) % 2;
        const [w, h] = gira ? [6, 3] : [3, 5];
        g.fillStyle = HDK; g.fillRect(cx - 1, cy - 1, w + 2, h + 2); g.fillStyle = "#F8F5EE"; g.fillRect(cx, cy, w, h); g.fillStyle = "#D7263D"; g.fillRect(cx + (w >> 1), cy + (h >> 1), 1, 1);
      });
    },
    choque: [56, 22],
  };
})();

const HEROES_HD = { jelic: HD_JELIC, latte: HD_LATTE };

/* ======================= AGATTITA ======================= */
const HD_AGATTITA = (() => {
  const pal = {
    F: "#8C7B6A", f: "#4F4236", Z: "#B5A592", W: "#F6F0E6", w: "#D9CDBB", I: "#E7A9A0", N: "#E39A86", O: "#D8DEE8", M: "#34D399",
    G: "#2F6B45", g: "#1E4A2F", H: "#4C8E62", A: "#8FA6AE", a: "#62777F", Q: "#B7CAD0", B: "#7A4A2A", b: "#55331C", T: "#2F6B45", t: "#1E4A2F",
  };
  /* Enredaderas: salen del suelo y avanzan ondulando hasta el rival. */
  const enredadera = (g, x0, x1, prog, suelo, alto, t) => {
    const punto = (u, fase, amp) => [x0 + (x1 - x0) * u, suelo + (alto - suelo) * Math.sin(u * Math.PI / 2) + Math.sin(u * Math.PI * 3 + fase) * amp * Math.sin(u * Math.PI) - Math.sin(u * Math.PI) * 9];
    const tallo = (fase, amp, gr, hasta) => {
      const pts = []; for (let i = 0; i <= 70 * hasta; i++) pts.push(punto(i / 70, fase, amp).map(Math.round));
      pts.forEach(([x, y]) => { g.fillStyle = HDK; g.fillRect(x - 1, y - 1, gr + 2, gr + 2); });
      pts.forEach(([x, y], i) => { g.fillStyle = i % 6 === 0 ? "#8A9A4E" : "#6B7A3A"; g.fillRect(x, y, gr, gr); g.fillStyle = "#4C5728"; if (gr > 2) g.fillRect(x, y + gr - 1, gr, 1); });
      pts.forEach(([x, y], i) => { if (i % 7 === 3) { g.fillStyle = "#3F4A22"; g.fillRect(x + (i % 14 ? -1 : gr), y - 1, 1, 1); } });
      return pts;
    };
    if (prog <= 0) return;
    tallo(2.2, 3, 2, Math.min(1, prog * 0.85));
    const pts = tallo(0, 5, 3, prog);
    const [tx, ty] = pts[pts.length - 1];
    for (let k = 0; k <= 18; k++) { const an = k / 18 * Math.PI * 1.6, rr = 3.5 * (1 - k / 26); g.fillStyle = HDK; g.fillRect(Math.round(tx + 2 + Math.cos(an) * rr) - 1, Math.round(ty - 2 + Math.sin(an) * rr) - 1, 3, 3); }
    for (let k = 0; k <= 18; k++) { const an = k / 18 * Math.PI * 1.6, rr = 3.5 * (1 - k / 26); g.fillStyle = "#6B7A3A"; g.fillRect(Math.round(tx + 2 + Math.cos(an) * rr), Math.round(ty - 2 + Math.sin(an) * rr), 1, 1); }
    [[0.35, -4], [0.62, 4]].forEach(([u, d]) => { if (prog > u) { const [lx, ly] = pts[Math.round(pts.length * u / prog) - 1] || pts[0]; g.fillStyle = HDK; g.fillRect(lx - 1, ly + d - 1, 5, 4); g.fillStyle = "#4ADE80"; g.fillRect(lx, ly + d, 3, 2); g.fillStyle = "#86EFAC"; g.fillRect(lx, ly + d, 1, 1); } });
  };
  /* Bastón en espiral, vertical, sostenido por la mano. */
  const baston = (px, hx, hy) => {
    const top = hy - 15, pts = [];
    for (let y = top; y <= hy + 9; y++) for (let i = 0; i < 2; i++) pts.push([hx + 1 + i, y, i === 0 ? "#9A6A3A" : "#6E4824"]);
    [[0, -1], [1, -2], [2, -3], [3, -2], [3, -1], [3, 0], [2, 1], [1, 1], [0, 0], [4, -4], [5, -3], [5, -1], [4, 1]].forEach(([dx, dy]) => pts.push([hx + 2 + dx, top + dy, "#9A6A3A"]));
    hdContorno(px, pts);
    px(hx + 4, top - 1, "#4ADE80"); px(hx + 5, top - 2, "#86EFAC"); px(hx + 2, top + 3, "#4ADE80");
  };
  return {
    id: "agattita", nombre: "Agattita", pal,
    cuerpo: [
      "..........KK.........KK", ".........KIFK.......KFIK", "........KIIFFK.....KFFIK", "........KIFFFFKKKKKFFFFK",
      ".......KFFfFFOOOOOOFFFFK", ".......KFFFfFFOMOFFfFFFFK", "......KZFFFFfFFFFFFfFFFFK", "......KZFFFFFFFFFFFFFFFFFK",
      "......KZFFFKKFFFFFKKFFFFK", "......KZFFFKWFFFFFKWFFFFFK", "......KZFFFKKFFFFFKKFFFWWK", "......KZFFFFFFFFFFFFFWWNNK",
      ".......KZFFFFFWWWWWWWWWKK", "........KZFFFWWWWKWWWWK", ".........KKFFWWWWWWWKK", "...........KKKKKKKKK",
      "..........KGGGGGGGGGK", ".........KHGGGGMGGGGGK", ".........KHgGGGGGGGgGK", "..........KKKWWWWWKKK",
      ".........KAAKWWWWWWKK", ".........KaAKWWwWWWK", ".........KaAKFWWWWFK", ".........KWWKBBBBBBK",
      "..........KKKBbBBbBK", "...........KTTTTTTTK", "...........KTTWWWTTK", "...........KKTTTTTKK",
    ],
    /* La cola atigrada se mueve detrás, como una capa. */
    capa: [
      { 16: "..KK", 17: ".KFfK", 18: ".KFFK", 19: "..KfFK", 20: "..KFFK", 21: "...KfFK", 22: "...KFFK", 23: "....KfFK", 24: "....KFFKK", 25: ".....KFfFK", 26: "......KKK" },
      { 15: "...KK", 16: "..KFfK", 17: "..KFFK", 18: "..KfFK", 19: "...KFFK", 20: "...KfFK", 21: "...KFFK", 22: "....KfFK", 23: "....KFFK", 24: ".....KFfK", 25: ".....KFFKK", 26: "......KKK" },
      { 17: "KK", 18: "KFfK", 19: ".KFFK", 20: ".KfFK", 21: "..KFFK", 22: "..KfFK", 23: "...KFFK", 24: "...KfFFK", 25: "....KFfFK", 26: ".....KKK" },
    ],
    hombro: [21, 19], caderas: [[13, 28], [17, 28]], pies: [[13, 39], [18, 39]],
    brazo: { luz: pal.Q, base: pal.A, sombra: pal.a, mano: pal.W, manoLuz: pal.W },
    pierna: { luz: pal.Z, base: pal.F, sombra: pal.f, bota: pal.W, botaSombra: pal.w },
    manos: { guardia: [27, 24], impulso: [27, 18], golpe: [26, 9], choque: [26, 8], sigue: [26, 10], sube: [26, 14], alto: [26, 6] },
    arma: (px, p) => baston(px, p.mano[0], p.mano[1]),
    proyectil: (g, x, y, p) => {
      if (p.fase !== "golpe" && p.fase !== "choque" && p.fase !== "sigue") return;
      const prog = p.fase === "golpe" ? p.k : 1;
      enredadera(g, x + HD_OX + 24, x + 74, prog, y + HD_OY + 39, y + HD_OY + 22, p.t);
    },
    choque: [74, 22],
  };
})();
HEROES_HD.agattita = HD_AGATTITA;

/* ======================= MALALA ======================= */
const HD_MALALA = (() => {
  const pal = {
    H: "#1F4D3A", h: "#12301F", j: "#2E6B52", Y: "#D9A13B", y: "#A87420", L: "#3A2A30", l: "#5E4A56", S: "#F4D3BE", s: "#D4A58C", p: "#C9707A",
    D: "#1F4D3A", C: "#E9E2CF", c: "#C4B999", E: "#14B8A6",
    Q: (x, y) => { const i = (x >> 1) & 1, j = (y >> 1) & 1; return i && j ? "#2E8B57" : i || j ? "#86CFA0" : "#F4F8F2"; },
  };
  const LUNA = [".OO.", "O...", "O...", ".oo."];   // remate de la escoba: luna creciente dorada
  const escoba = (px, hx, hy, horizontal) => {
    const pts = [], PAJA = "#E0B04A", PAJA2 = "#A8762A", ATADO = "#9A3B2A";
    if (horizontal) {
      for (let x = hx - 9; x <= hx + 11; x++) pts.push([x, hy, "#9A6A3A"], [x, hy + 1, "#6E4824"]);
      for (let x = hx - 14; x <= hx - 10; x++) for (let y = hy - 1 - Math.round((hx - 10 - x) / 3); y <= hy + 2 + Math.round((hx - 10 - x) / 3); y++) pts.push([x, y, (y - hy) % 2 ? PAJA2 : PAJA]);   // pajas un poco más cortas y angostas
      pts.push([hx - 10, hy - 1, ATADO], [hx - 10, hy + 2, ATADO]);
      LUNA.forEach((f, j) => [...f].forEach((k, i) => { if (k !== ".") pts.push([hx + 12 + (3 - j), hy - 1 + i, k === "O" ? "#FFE478" : "#F2A65E"]); }));   // la luna, acostada con la escoba
      hdContorno(px, pts);
    } else {
      for (let y = hy - 13; y <= hy + 5; y++) pts.push([hx + 1, y, "#9A6A3A"], [hx + 2, y, "#6E4824"]);
      for (let y = hy + 6; y <= hy + 11; y++) for (let x = hx - Math.round((y - hy - 6) / 3); x <= hx + 3 + Math.round((y - hy - 6) / 3); x++) pts.push([x, y, (x - hx) % 2 ? PAJA2 : PAJA]);   // pajas un poco más cortas y angostas
      pts.push([hx, hy + 6, ATADO], [hx + 3, hy + 6, ATADO]);
      LUNA.forEach((f, j) => [...f].forEach((k, i) => { if (k !== ".") pts.push([hx + i, hy - 17 + j, k === "O" ? "#FFE478" : "#F2A65E"]); }));   // la luna en la punta del mango
      hdContorno(px, pts);
    }
  };
  return {
    id: "malala", nombre: "Malala", pal,
    cuerpo: [
      "...................KK", "..............KKKKHHK", ".............KHHHHKK", "............KHHhK",
      "...........KHHhK", "..........KHHHhK", ".........KHjHHhK", "........KHHYYYYK",
      "...KKKKKHHHHHHHHKKKKK", "..KhhhhhhhhhhhhhhhhhhK", "...KYKKYKKYKKYKKYKKYK", "....KLLLLLLLLLLLLK",
      "....KLLLlLLLLLLLLK", "....KLLlLLLLLLLLLK", "....KLlLLLlLLlLLLK", "....KLlLKSSSSSSSK",
      "....KLlLKSSSpSSK", "....KLLKKDDDDDKK", "...KCKYYYYYYYYYK", "..KCCKYYYYEYYYYK",
      "..KCCCKYYYYYYYK", "...KCKQQQQQQQK", "....KQQQQQQQQK", "....KYDYDYDYDK",
      "....KQQQQQQQQQK", "....KQQQQQQQQQK", "...KQQQQQQQQQQK", "...KQQQQQQQQQQQK",
    ],
    falda: { 28: "...KQQQQQQQQQQQK", 29: "..KQQQQQQQQQQQQK", 30: "..KQQQQQQQQQQQQQK", 31: "..KQQQQQQQQQQQQQK", 32: ".KQQQQQQQQQQQQQQK", 33: ".KYYYYYYYYYYYYYYK", 34: "..KKKKKKKKKKKKKK" },
    /* Las borlas del ala se balancean. */
    pelo: [
      { 11: "...Y..............Y..Y", 12: "...Y" },
      { 11: "..Y..............Y....Y", 12: "....Y" },
    ],
    capa: [
      { 18: "..KK", 19: ".KCK", 20: ".KCCK", 21: "KCcCK", 22: "KCCcK", 23: "KCcCK", 24: "KCCcK", 25: "KcCcK", 26: "KCcCK", 27: ".KCcK", 28: ".KccK", 29: "..KK" },
      { 18: "..KK", 19: ".KCK", 20: "KCCK", 21: "KCcK", 22: "KCCcK", 23: "KcCCK", 24: "KCcCK", 25: "KCCcK", 26: ".KcCK", 27: ".KCcK", 28: "..KK" },
      { 18: "..KK", 19: ".KCK", 20: ".KCCK", 21: ".KCcK", 22: "KCCcK", 23: "KCcCK", 24: "KcCcK", 25: "KCCcK", 26: "KCcCK", 27: "KcCcK", 28: ".KccK", 29: ".KK" },
    ],
    hombro: [12, 20], caderas: [[9, 28], [13, 28]], pies: [[9, 39], [14, 39]],
    brazo: { luz: "#86CFA0", base: "#5FB383", sombra: "#3F8A5E", mano: pal.S, manoLuz: pal.S },
    pierna: { luz: "#3A3A48", base: "#24212B", sombra: "#15121A", bota: "#1A1020", botaSombra: "#0E0A12" },
    manos: { guardia: [19, 24], impulso: [10, 27], golpe: [21, 21], choque: [22, 21], sigue: [21, 22], sube: [20, 16], alto: [23, 11] },
    arma: (px, p) => { if (!["golpe", "choque", "sigue"].includes(p.fase)) escoba(px, p.mano[0], p.mano[1], p.fase === "impulso"); },
    /* Al embestir, la escoba va pegada al costado, por detrás del cuerpo: las pajas no tapan el pecho. */
    atras: (px, p) => { if (["golpe", "choque", "sigue"].includes(p.fase)) escoba(px, p.mano[0] - 5, p.mano[1], true); },
    proyectil: (g, x, y, p) => {
      if (p.fase !== "golpe" && p.fase !== "choque") return;
      const k = p.fase === "golpe" ? p.k : 1, cx = Math.round(x + HD_OX + 36 + k * 30), cy = y + HD_OY + 21;
      for (let i = 1; i <= 4; i++) { g.fillStyle = i % 2 ? "#A7F3D0" : "#5EEAD4"; g.fillRect(cx - i * 4, cy + (i % 2 ? -1 : 1), 2, 1); }
      g.fillStyle = HDK; g.fillRect(cx - 3, cy - 3, 7, 7); g.fillStyle = "#5EEAD4"; g.fillRect(cx - 2, cy - 2, 5, 5); g.fillStyle = "#A7F3D0"; g.fillRect(cx - 1, cy - 1, 3, 3); g.fillStyle = "#FFFFFF"; g.fillRect(cx, cy, 1, 1);
    },
    choque: [74, 21],
  };
})();
HEROES_HD.malala = HD_MALALA;

/* ======================= MALÍA ======================= */
const HD_MALIA = (() => {
  const pal = {
    H: "#ECEEF4", h: "#B4BACA", W: "#F4F2EC", w: "#CFCBC0", S: "#EBB2A6", s: "#C7867A", z: "#F5CABF", E: "#2F8F5A", p: "#C9707A",
    B: "#CDB898", b: "#A8946F", D: "#8A5A2A", d: "#64401C", N: "#24212B", n: "#3A3644", Y: "#C9A24B",
  };
  const cucharon = (px, hx, hy, ux, uy) => {
    const L = 15, n = Math.hypot(ux, uy); ux /= n; uy /= n;
    const pts = [], tx = hx + ux * L, ty = hy + uy * L;
    hdLinea(hx - ux * 3, hy - uy * 3, tx, ty, (x, y) => { pts.push([x, y, "#C68A4E"], [x + Math.round(-uy), y + Math.round(ux), "#8A5A2A"]); });
    const cx = Math.round(hx + ux * (L + 3)), cy = Math.round(hy + uy * (L + 3));
    for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) { const d = (dx / 4.2) ** 2 + (dy / 3.6) ** 2; if (d <= 1) pts.push([cx + dx, cy + dy, d > 0.55 ? (dx + dy < 0 ? "#E2B07A" : "#C68A4E") : dx + dy < -1 ? "#FF7FA6" : "#F0407A"]); }   // lleno de mermelada de frutilla
    hdContorno(px, pts);
    px(cx - 2, cy - 2, "#F2C893"); px(cx - 1, cy - 1, "#FFD0DE");   // brillo de la mermelada
  };
  return {
    id: "malia", nombre: "Malía", pal,
    cuerpo: [
      "..........KKKK", ".........KHHHHK", ".........KHhHHK", "........KKWKWKWKK",
      ".......KWWWWWWWWWK", "......KHHHHHHHHHHHK", ".....KHHhHHHHHHHHHK", ".....KHhHHHHHHHHHHK",
      "...KKKHhHHHKzSSSSHK", "..KSSKhHHHKSSSSSSSK", "...KSSKhHKSSSSSKESK", "....KKHhHKSSSSSKKSK",
      ".....KHhKsSSSSSSSK", ".....KHhKsSSSSppK", "......KKKKssSSSK", ".........KKBBKK",
      "........KBBWWWWK", ".......KBBBWWWWWK", "......KBbBBWWwWWK", "......KBbBBWWWWWK",
      "......KBbBBWWWWWK", "......KDDDDDDDDDDK", "......KDdDDDDDDDK", "......KNNWWWWWWWWK",
      "......KNNWWWwWWWWK", ".....KNNNWWWWWWWWWK", ".....KNNNWWWWWwWWWK", ".....KNNNNWWWWWWWWWK",
    ],
    falda: { 28: "....KNNNNWWWWWWWWWK", 29: "....KNNNNNWWWWWWWWWK", 30: "...KNNNNNNWWWWWWWWNK", 31: "...KNNNNNNNNNNNNNNNK", 32: "..KNNNNNNNNNNNNNNNNK", 33: "..KYNNNYNNNNYNNNNYNK", 34: "...KKKKKKKKKKKKKKKKK" },
    /* Las tiras del delantal flamean atrás. */
    capa: [
      { 21: "....KWK", 22: "..KWWK", 23: ".KWwK", 24: "KWK" },
      { 21: "....KWK", 22: "...KWWK", 23: "..KWwK", 24: "..KWK" },
      { 21: "....KWK", 22: "..KWWWK", 23: "KWwK", 24: ".KK" },
    ],
    hombro: [11, 18], caderas: [[10, 28], [14, 28]], pies: [[10, 39], [15, 39]],
    brazo: { luz: "#E2D2B4", base: pal.B, sombra: pal.b, mano: pal.S, manoLuz: pal.z },
    pierna: { luz: "#3A3A48", base: "#24212B", sombra: "#15121A", bota: "#1A1020", botaSombra: "#0E0A12" },
    manos: { guardia: [16, 24], impulso: [8, 24], golpe: [22, 20], choque: [23, 20], sigue: [22, 21], sube: [20, 16], alto: [23, 11] },
    arma: (px, p) => {
      const dir = { guardia: [0.45, -0.9], vuelve: [0.45, -0.9], impulso: [-0.75, -0.65], golpe: [1, -0.05], choque: [1, 0.05], sigue: [1, 0.2], sube: [0.2, -1], alto: [0.05, -1] }[p.fase] || [0.45, -0.9];
      cucharon(px, p.mano[0], p.mano[1], dir[0], dir[1]);
    },
    choque: [50, 19],
  };
})();
HEROES_HD.malia = HD_MALIA;

/* ======================= KENNY ======================= */
const HD_KENNY = (() => {
  const pal = {
    H: "#3B2618", h: "#22150C", i: "#5A3C26", S: "#D6A27C", s: "#AE7655", D: "#6B4426", F: "#22222E", Q: "#7DD3FC", W: "#FFFFFF", Y: "#D9A13B",
    T: "#1C8C85", t: "#12645F", C: "#C0622B", c: "#8A421B", R: "#E07F48", J: "#7A4E2C", j: "#5A3618", G: "#5E8F4E", B: "#4A2E22",
  };
  /* Laúd frente al pecho: caja de pera, boca, mástil y clavijero. */
  const laud = (px, cx, cy) => {
    const pts = [];
    for (let dy = -5; dy <= 5; dy++) for (let dx = -6; dx <= 6; dx++) { const d = (dx / 6.3) ** 2 + (dy / 5.2) ** 2; if (d <= 1) pts.push([cx + dx, cy + dy, dx + dy < -5 ? "#E8B27A" : d > 0.7 ? "#8A5228" : "#C98A4A"]); }
    hdLinea(cx + 4, cy - 4, cx + 11, cy - 11, (x, y) => pts.push([x, y, "#7A4A22"], [x + 1, y, "#5A3416"]));
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) pts.push([cx + 11 + i, cy - 13 + j, "#3A2418"]);
    hdContorno(px, pts);
    px(cx - 1, cy, "#2A1608"); px(cx, cy, "#2A1608"); px(cx - 1, cy + 1, "#2A1608"); px(cx, cy + 1, "#2A1608");
    hdLinea(cx - 4, cy + 2, cx + 11, cy - 11, (x, y) => { if ((x + y) % 2 === 0) px(x, y, "#F4E7C8"); });
    px(cx + 12, cy - 14, "#E5E7EB"); px(cx + 14, cy - 12, "#E5E7EB");
  };
  const centro = {};
  return {
    id: "kenny", nombre: "Kenny", pal,
    cuerpo: [
      ".........................", "...........KKKKKK", ".........KKHHHHHHKK", "........KHHhHHHHHHHK",
      ".......KHHhHHHHHHHHHK", ".......KHhHHHHHHHHHHHK", "......KHHhHHHHKKSSSHHK", "......KHhHHHHKSSSSSSSK",
      "......KHhHHHKSSSSSSSSK", "......KHhHHKSFFFFFQFFK", "......KHHhHKSSSSFFFFFK", "......KHhHHKsSSSSSSSSK",
      "......KHhHKDDSSSSSSDDK", ".......KhHKDDDDDKKDDK", ".......KKKDDDDDDDDK", "..........KKDDDDDK",
      "........KKTTTTTTTK", ".......KTTTTtTTTTTK", ".......KTTKTTTTTTTK", "........KJJJJGGJJJJK",
      "........KJJJGGGJJJJK", "........KJjJGGGJJJJK", "........KJjJGGGJjJJK", "........KBBBBBYBBBBK",
      "........KJjGGGGGJJJK", "........KJjGGGGGJJJK", "........KjjGGGGGjjJK", "........KKjjjjjjjjjK",
    ],
    /* La cola con su amarra dorada se balancea. */
    pelo: [
      { 7: ".....KYK", 8: "....KYYK", 9: "...KHhK", 10: "...KHhK", 11: "..KHhK", 12: "..KhHK", 13: "..KHhK", 14: "...KhK", 15: "...KK" },
      { 7: ".....KYK", 8: "....KYYK", 9: "....KHhK", 10: "...KHhK", 11: "...KHhK", 12: "..KhHK", 13: "..KhHK", 14: "..KHK", 15: "..KK" },
    ],
    capa: [
      { 16: "......KK", 17: ".....KRCK", 18: "....KRCCK", 19: "....KRCcK", 20: "...KRCcCK", 21: "...KRCCcK", 22: "..KRCcCCK", 23: "..KRCCcCK", 24: ".KRCcCCcK", 25: ".KRCCcCCK", 26: "KRCcCCcCK", 27: "KCcCCcCK.", 28: "KccCcCK..", 29: ".KKcK....", 30: "..KK....." },
      { 16: "......KK", 17: ".....KRCK", 18: "....KRCCK", 19: "...KRCCcK", 20: "...KRCcCK", 21: "..KRCCcCK", 22: "..KRCcCCK", 23: ".KRCCcCCK", 24: ".KRCcCCcK", 25: "KRCCcCCK.", 26: "KCcCCcCK.", 27: "KccCcK...", 28: ".KKK....." },
      { 16: "......KK", 17: ".....KRCK", 18: ".....KRCK", 19: "....KRCcK", 20: "....KRCcK", 21: "...KRCCcK", 22: "...KRCcCK", 23: "..KRCCcCK", 24: "..KRCcCCK", 25: ".KRCCcCcK", 26: ".KRCcCCcK", 27: "KRCcCcCK.", 28: "KCcCCcK..", 29: "KccK.....", 30: ".KK......" },
    ],
    hombro: [13, 19], caderas: [[11, 28], [16, 28]], pies: [[11, 39], [18, 39]],
    brazo: { luz: "#9A6A40", base: pal.J, sombra: pal.j, mano: pal.S, manoLuz: "#E8B892" },
    pierna: { luz: "#8A6446", base: "#6B4A30", sombra: "#4A3020", bota: "#3A2418", botaSombra: "#24160E" },
    manos: { guardia: [15, 25], impulso: [14, 23], golpe: [17, 23], choque: [16, 25], sigue: [15, 24], sube: [16, 23], alto: [15, 25] },
    armaDetras: (px, p) => { const [cx, cy] = centro[p.fase] || [17, 24]; laud(px, cx, cy); },
    proyectil: (g, x, y, p) => {
      if (p.fase !== "golpe" && p.fase !== "choque") return;
      const k = p.fase === "golpe" ? p.k : 1;
      const nota = (nx, ny, col) => { g.fillStyle = HDK; g.fillRect(nx - 1, ny - 7, 6, 10); g.fillStyle = col; g.fillRect(nx, ny, 3, 2); g.fillRect(nx + 2, ny - 6, 1, 7); g.fillRect(nx + 3, ny - 6, 1, 2); };
      nota(Math.round(x + HD_OX + 34 + k * 28), y + HD_OY + 20, "#FBBF24");
      nota(Math.round(x + HD_OX + 26 + k * 28), y + HD_OY + 15, "#F472B6");
    },
    choque: [72, 18],
  };
})();
HEROES_HD.kenny = HD_KENNY;

/* ======================= TIVÁN ======================= */
const HD_TIVAN = (() => {
  const pal = {
    H: "#C4C8D2", h: "#868C9C", I: "#E6E9F0", E: "#5A3A22", G: "#C9A24B", Q: "#9BD8F0", S: "#C99470", s: "#9E6B4B",
    O: "#6E6A3A", o: "#4C4826", P: "#8E8A52", W: "#EEF0F2", B: "#5A3A22", V: "#4ADE80", D: "#4A2E22", U: "#7A5232",
  };
  const frasco = (px, cx, cy) => {
    const pts = [];
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) if (dx * dx + dy * dy <= 5) pts.push([cx + dx, cy + dy, dx + dy < -1 ? "#BBF7D0" : dy > 0 ? "#16A34A" : "#4ADE80"]);
    pts.push([cx, cy - 3, "#D9E8E0"], [cx, cy - 4, "#D9E8E0"], [cx, cy - 5, "#8A5A2A"]);
    hdContorno(px, pts);
  };
  const humo = (g, x, y, f) => {
    const r = [4, 7, 9, 10][f] ?? 0; if (!r) return;
    const cols = ["#4ADE80", "#86EFAC", "#9CA3AF", "#6B7280"];
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const d = (dx * dx) / (r * r) + (dy * dy) / ((r * 0.8) ** 2); if (d > 1 || (f === 3 && (dx + dy) % 2)) continue; g.fillStyle = cols[(Math.abs(dx * 7 + dy * 3) + (d > 0.6 ? 2 : 0)) % 4]; g.fillRect(x + dx, y + dy - f, 1, 1); }
  };
  return {
    id: "tivan", nombre: "Tiván", pal,
    cuerpo: [
      "........K...K...K", ".......KHK.KHK.KHK", "......KHhHKHhHKHhHK", ".....KHhHIHHHIHHHHHK",
      "......KHhHHHHHHHHHHHK", ".....KHhHHHHKKKKKKKKK", "......KhHEEEKGQGKGQGKK", ".......KhHHHKKKKKKKKKK",
      ".......KHhHHKSSSSSSSK", "......KKHhHKSSSSSSKSK", ".....KSSKhHKSSSSSSKSK", "......KKKhKsSSSSSSSSK",
      ".........KKsSSSSSSKK", "..........KKssSSSK", "........KOOKKKKKOK", ".......KOOOOKWWKOOK",
      "......KOOoOOKWWKOOOK", "......KOOoOBVBVBVBOOK", "......KOoOOOBBBBBBOOOK", "......KOoOOOOOOOOOOOK",
      "......KOoOKDDDDGDDDDK", "......KOoOKUUOOOUUOOK", "......KOoOKOOOOOOOOOK", "......KOoOKOOOOOOOOOK",
      "......KOoOOKOOOOOOOOK", "......KOoOOKOOOOOOOOOK", "......KOoOOOKOOOOOOOOK", "......KOoOOOKOOOOOOOOK",
    ],
    falda: { 28: "......KOoOOOK....KOOOK", 29: ".....KOoOOOK......KOOK", 30: ".....KOoOOK........KK", 31: "....KOoOOK", 32: "....KooOK", 33: "....KKK" },
    /* Los mechones canosos se agitan. */
    pelo: [ { 0: "........K...K...K", 1: ".......KHK.KHK.KHK" }, { 0: ".......K...K...K", 1: "......KHK.KHK.KHK.." } ],
    capa: [
      { 26: "....KOK", 27: "...KOoK", 28: "..KOoK", 29: ".KOoK", 30: ".KoK" },
      { 26: "....KOK", 27: "...KOoK", 28: "...KOoK", 29: "..KOoK", 30: "..KoK" },
      { 26: "....KOK", 27: "..KOOoK", 28: ".KOoK", 29: "KOoK", 30: "KK" },
    ],
    hombro: [13, 19], caderas: [[11, 28], [16, 28]], pies: [[11, 39], [18, 39]],
    brazo: { luz: "#FFFFFF", base: pal.W, sombra: "#C2C6CE", mano: pal.U, manoLuz: "#9A7252" },
    pierna: { luz: "#7A5A44", base: "#5A3A28", sombra: "#3E2618", bota: "#221A20", botaSombra: "#120E12" },
    manos: { guardia: [17, 24], impulso: [7, 26], golpe: [24, 16], choque: [24, 19], sigue: [22, 22], sube: [22, 16], alto: [25, 11] },
    arma: (px, p) => {
      if (p.fase === "golpe" || p.fase === "choque" || p.fase === "sigue") return;   // ya la lanzó
      frasco(px, p.mano[0] + 1, p.mano[1] - 4);
      if (Math.floor(p.t / 250) % 2) { px(p.mano[0] + 2, p.mano[1] - 11, "#86EFAC"); px(p.mano[0] + 1, p.mano[1] - 12, "#86EFAC"); } else px(p.mano[0] + 3, p.mano[1] - 12, "#86EFAC");
    },
    proyectil: (g, x, y, p) => {
      if (p.fase === "golpe") {
        const cx = Math.round(x + HD_OX + 30 + p.k * 34), cy = Math.round(y + HD_OY + 14 - Math.sin(Math.PI * p.k) * 12);
        g.fillStyle = HDK; g.fillRect(cx - 3, cy - 3, 7, 8); g.fillStyle = "#4ADE80"; g.fillRect(cx - 2, cy, 5, 4); g.fillStyle = "#D9E8E0"; g.fillRect(cx, cy - 2, 1, 2); g.fillStyle = "#8A5A2A"; g.fillRect(cx, cy - 3, 1, 1);
      }
      if (p.fase === "choque") humo(g, x + 72, y + HD_OY + 22, Math.floor(p.k * 4));
    },
    choque: [72, 22],
  };
})();
HEROES_HD.tivan = HD_TIVAN;

/* ======================= PATROCLUS ======================= */
const HD_PATROCLUS = (() => {
  const pal = {
    H: "#1A1518", h: "#3A3036", S: "#9A6440", s: "#74472B", z: "#B27A52", G: "#3F6B3A", g: "#2A4A27", V: "#5A8A50", F: "#E9E4DA", f: "#BDB5A6",
    N: "#F4E9C8", Z: "#2DD4BF", L: "#6E5134", l: "#4E3824", B: "#3A2418", Y: "#C9A24B", T: "#4F4A33",
  };
  const LOBO = [".K...K....", "KgK.KgK...", "KGgKGGK...", "KGGGGGGKK.", "KGGGGKGGGK", "KgGGGGGGGK", "KgGGWWWWKK", ".KKKKKKK.."];
  const plo = { K: HDK, G: "#8E96A3", g: "#5E6673", W: "#E5E7EB" };
  const lobo = (px, cx, cy) => LOBO.forEach((f, y) => [...f].forEach((k, x) => { if (plo[k]) px(cx - 4 + x, cy - 4 + y, plo[k]); }));
  const banderin = (px, bx, by, t) => {
    const ola = Math.floor(t / 200) % 2;
    for (let i = 0; i < 5; i++) { const largo = 8 - i - (ola && i > 1 ? 1 : 0); px(bx - 1, by + i, HDK); for (let x = 0; x < largo; x++) px(bx + x, by + i, i === 2 ? "#3F6B3A" : "#FBBF24"); px(bx + largo, by + i, HDK); }
    for (let x = -1; x <= 8; x++) { px(bx + x, by - 1, HDK); }
  };
  /* Remate de tótem: cabeza de águila tallada en madera, de perfil hacia el rival, con un ojo grande almendrado,
     un pico amarillo largo que se curva en la punta, tocado de plumas con banda de metal y el ala plegada debajo. */
  const TOTEM = [
    "...KKKKKKKKK.....", "...KTRRTTRTK.....", "...KSSSSSSSK.....", "...KMMKKKKMK.....", "...KMKEEPEKK.....",
    "...KmKEPPEKKKK...", "...KmMKKKKMKYYYK.", "...KmMMMMMMKYYYYK", "...KmmMMMMMKyYYyK", "...KmmMMMMMKyyyK.",
    "...KMMMMMMMMKKK..", "...KMnMMMnMK.....", "...KmMMnMMMK.....", "....KKKKKKK......",
  ];
  const ptt = { K: HDK, M: "#7A4A34", m: "#5A3424", n: "#A87A5E", Y: "#E8D44A", y: "#B8A030", E: "#CFE3EA", P: "#5A5F66", T: "#3E8A8A", R: "#C0283A", S: "#B8BCC4" };
  /* vertical: el remate arriba del palo; horizontal (al embestir): un cuarto de vuelta con el palo, la coronilla
     por delante y el pico mirando al suelo. */
  const totem = (px, cx, abajo, horizontal) => TOTEM.forEach((f, sy) => [...f].forEach((k, sx) => {
    if (!ptt[k]) return;
    if (horizontal) px(abajo + (TOTEM.length - 1 - sy), cx - 7 + sx, ptt[k]); else px(cx - 7 + sx, abajo - (TOTEM.length - 1 - sy), ptt[k]);
  }));
  const borde = (px, hx, hy, horizontal, t) => {
    const pts = [];
    if (horizontal) {
      for (let x = hx - 10; x <= hx + 11; x++) pts.push([x, hy, (x % 5 === 0) ? "#6E4824" : "#9A6A3A"], [x, hy + 1, "#6E4824"]);
      hdContorno(px, pts); totem(px, hy, hx + 12, true);
    } else {
      for (let y = hy - 11; y <= hy + 8; y++) pts.push([hx + 1, y, (y % 5 === 0) ? "#6E4824" : "#9A6A3A"], [hx + 2, y, "#6E4824"]);
      hdContorno(px, pts); totem(px, hx + 2, hy - 12, false);
    }
  };
  return {
    id: "patroclus", nombre: "Patroclus", pal,
    cuerpo: [
      "", "", "", ".........KKKKKKK", ".......KKHHHHHHHKK", "......KHHHHHHHHHHHK", "......KHhHHHHHHHHHK", ".....KHhHHHHHHHHHHK",
      ".....KHhHHHHSSSSSSK", ".....KHhHHKSSSSSSSK", ".....KHHHKSSSSSSKSK", ".....KKSKSSSSSSSSSK", "......KSSKsSSSSSSSK", "......KKsKsSSSSSSK",
      "...KGGGGGKKssSSSK", "..KGGgGFFFNSSSNK", "..KFfFFFKLKNZNKLK", "..KGFfFKLLLKZKLLLK", "..KGgFKLLLLlLLLLLK", "...KKKKLLLLLLLlLLK",
      "......KBBBBYBBBBBK", "......KLLLLLLLLLLK", "......KTTTTTKTTTTK", "......KTTTTTTTTTTK", "......KTTTTTTTTTK", "......KTTTTTTTTK",
      "......KTTTTTTTK", "......KKTTTTTTK",
    ],
    capa: [
      { 17: "..KK", 18: ".KVGK", 19: ".KVGK", 20: "KVGgK", 21: "KVgGK", 22: "KVGgK", 23: "KGgGK", 24: "KgGgK", 25: "KGgK.", 26: "KgK..", 27: ".K..." },
      { 17: "..KK", 18: ".KVGK", 19: "KVGgK", 20: "KVgGK", 21: "KVGgK", 22: "KGgGK", 23: "KgGK.", 24: "KGgK.", 25: ".KK.." },
      { 17: "..KK", 18: ".KVGK", 19: ".KVGK", 20: ".KVgK", 21: "KVGgK", 22: "KVgGK", 23: "KGgGK", 24: "KgGgK", 25: "KGgGK", 26: "KgGK.", 27: ".KK.." },
    ],
    hombro: [12, 19], caderas: [[10, 28], [15, 28]], pies: [[10, 39], [17, 39]],
    brazo: { luz: "#FFFFFF", base: "#E7E2D6", sombra: "#BDB5A6", mano: pal.S, manoLuz: pal.z },
    pierna: { luz: "#6A6448", base: "#4F4A33", sombra: "#36321F", bota: "#3A2A1E", botaSombra: "#241A12" },
    manos: { guardia: [21, 24], impulso: [13, 23], golpe: [21, 22], choque: [23, 22], sigue: [22, 23], sube: [22, 16], alto: [24, 12] },
    arma: (px, p) => borde(px, p.mano[0], p.mano[1], p.fase === "golpe" || p.fase === "choque" || p.fase === "sigue", p.t),
    choque: [57, 22],
  };
})();
HEROES_HD.patroclus = HD_PATROCLUS;

/* ======================= UCHIS ======================= */
const HD_UCHIS = (() => {
  const pal = {
    H: "#7A4A2C", h: "#4E2E1A", S: "#F6DCCB", s: "#D7B09C", L: "#D9667A", G: "#E0B040", E: "#3B82F6",
    R: "#D8402E", r: "#9E2A1E", V: "#F06A52", C: "#F2E8D0", c: "#CFC3A6", T: "#2F8F8A", Y: "#E0B040", B: "#8A5A30",
  };
  /* Dos cuchillas en abanico: hoja plateada y mango café. */
  const cuchilla = (px, x, y, dx) => {
    const pts = [[x, y, "#6E4424"], [x + dx, y - 1, "#6E4424"], [x + dx * 2, y - 2, "#C9A24B"]];
    for (let i = 3; i <= 6; i++) pts.push([x + dx * i, y - i, i === 6 ? "#FFFFFF" : "#D9DEE6"], [x + dx * i + 1, y - i, "#9AA3B0"]);
    hdContorno(px, pts);
  };
  /* La capa es la misma silueta que la de Latte, en rojo. */
  const roja = (f) => Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v.replace(/C/g, "R").replace(/c/g, "r")]));
  return {
    id: "uchis", nombre: "Uchis", pal,
    cuerpo: [
      "..........KKKKKKK", "........KKHHHHHHHKK", ".......KHHhHHHHHHHHK", "......KHhHHHHHHHHHHHK",
      "......KHhHHHHHHHHHHHK", ".....KHhHHHHGGGGGEGGK", ".....KHhHHHKSSSSSSSHK", ".....KHhHHKSSSSSSSSSK",
      ".....KHhHHKSSSSSSKSSK", ".....KHhHHKSSSSSSKSK", "....KHhHHKsSSSSSSSSK", "....KHhHHKsSSSSSLSK",
      "....KHhHHHKsSSSSSK", "....KHhHHHHKKssSK", "....KHhHHHKRCCKK", "....KHhHHKRRCCCCK",
      "....KHhHKRRCCCTCCK", "....KHhHKRCCCTYTCCK", "....KHhHKRCCTYTYTCK", "....KHhKRrCCCTYTCCK",
      ".....KhKRrCCCCTCCCK", ".....KKKRrKBBBBGBBK", "........KrCCTYTYTCK", "........KrCTYTTTYTCK",
      "........KrCCTTYTTCCK", "........KrCCCTTTCCCK", "........KrCCCCTCCCCK", "........KKCCCCCCCCK",
    ],
    falda: { 28: "........KCTYTCCTYTCK", 29: ".........KKKKKKKKKK" },
    pelo: [ { 21: "....KhK", 22: "....KK" }, { 21: "...KhK.", 22: "...KK.." } ],
    capa: HD_LATTE.capa.map(roja),
    hombro: [13, 19], caderas: [[11, 28], [16, 28]], pies: [[11, 39], [18, 39]],
    brazo: { luz: "#FFFDF4", base: pal.C, sombra: pal.c, mano: "#9A6A3A", manoLuz: "#B88A5A" },
    pierna: { luz: "#7A4A36", base: "#5A3426", sombra: "#3E2218", bota: "#A0503A", botaSombra: "#6E3424" },
    manos: { guardia: [18, 24], impulso: [8, 24], golpe: [26, 20], choque: [27, 21], sigue: [25, 22], sube: [22, 16], alto: [25, 11] },
    arma: (px, p) => {
      if (p.fase === "golpe" || p.fase === "choque" || p.fase === "sigue") return;   // ya las lanzó
      const [hx, hy] = p.mano;
      cuchilla(px, hx, hy - 1, 1); cuchilla(px, hx - 1, hy - 1, 0);
    },
    /* Las dos cuchillas vuelan girando, una detrás de la otra. */
    proyectil: (g, x, y, p) => {
      if (p.fase !== "golpe" && p.fase !== "choque") return;
      const avance = p.fase === "golpe" ? p.k : 1;
      [[0, -1], [-7, 3]].forEach(([atras, dy], i) => {
        const cx = Math.round(x + HD_OX + 30 + atras + avance * 18), cy = y + HD_OY + 18 + dy, gira = Math.floor((p.t + i * 60) / 60) % 2;
        g.fillStyle = HDK;
        if (gira) { g.fillRect(cx - 1, cy - 1, 8, 3); g.fillStyle = "#D9DEE6"; g.fillRect(cx + 2, cy, 4, 1); g.fillStyle = "#6E4424"; g.fillRect(cx, cy, 2, 1); }
        else { g.fillRect(cx + 1, cy - 3, 3, 8); g.fillStyle = "#D9DEE6"; g.fillRect(cx + 2, cy - 2, 1, 4); g.fillStyle = "#6E4424"; g.fillRect(cx + 2, cy + 2, 1, 2); }
      });
    },
    choque: [56, 22],
  };
})();
HEROES_HD.uchis = HD_UCHIS;

/* ======================= JANET ======================= */
const HD_JANET = (() => {
  const pal = {
    H: "#C9A577", h: "#9A7A50", S: "#F0D2BC", s: "#CFA88F", D: "#8A6640", W: "#EDEAE0", Q: "#6B4430",
    G: "#6B7A3A", g: "#4C5728", L: "#3F5A3A", l: "#2C4029", B: "#3A2418", Y: "#C9A24B",
  };
  /* Arco vertical que se curva hacia adelante; con flecha montada si todavía no dispara. */
  const arco = (px, hx, hy, flecha, tenso) => {
    const pts = [];
    for (let dy = -10; dy <= 10; dy++) {
      const bx = hx + 1 + Math.round(3 * Math.cos((dy / 10) * Math.PI / 2));
      pts.push([bx, hy + dy, Math.abs(dy) < 2 ? "#3A2418" : dy < 0 ? "#B07A44" : "#8A5A30"]);
    }
    hdContorno(px, pts);
    const cuerdaX = (dy) => hx + 1 - (tenso ? Math.round(4 * (1 - Math.abs(dy) / 10)) : 0);
    for (let dy = -9; dy <= 9; dy++) px(cuerdaX(dy), hy + dy, "#EDEAE0");
    if (flecha) {
      const x0 = cuerdaX(0);
      for (let x = x0; x <= hx + 8; x++) px(x, hy, "#B07A44");
      px(hx + 9, hy, "#D9DEE6"); px(hx + 8, hy - 1, "#D9DEE6"); px(hx + 8, hy + 1, "#D9DEE6"); px(hx + 10, hy, HDK);
      px(x0, hy - 1, "#4ADE80"); px(x0 + 1, hy - 1, "#4ADE80"); px(x0, hy + 1, "#4ADE80"); px(x0 + 1, hy + 1, "#4ADE80");
    }
  };
  return {
    id: "janet", nombre: "Janet", pal,
    cuerpo: [
      "..........KKKKKK", "........KKHHHHHHKK", ".......KHHhHHHHHHHK", "......KHhHHHHHHHHHHK",
      "......KHhHHHHHHHHHHHK", ".....KHhHHHHHHHHHHHHK", ".....KHhHKKHHHHHHHHHK", ".....KHhKSSKHHSSSSSHK",
      ".....KHhHKSSKSSSSSSSK", ".....KHhHHKKSSSSSKSSK", "..KK.KHhHHKSSSSSSKSK", ".KWWKKHhHKDSSSSSSSSK",
      ".KWQKKHhHKDDSSSSDDDK", "..KQKKHhHHKDDDDDDDK", "..KQKKHhHHHKKDDDKK", "..KQKKhHHKGGLKKK",
      "..KQKKhHKGGLlLGGK", "..KQKKhKGGLlLlLGGK", "..KQKKKGGlLlLlLGGK", "..KQKKGGGLlLlLlGGK",
      "...KQKGGGlLlLlLGGK", "...KQKGGKBBBBYBBBK", "...KQKGgGLlLlLGGGK", "....KKGgGGLlLGGGgK",
      "......KgGGGGGGGGgK", "......KggGGGKGGGgK", "......KggggK.KgggK", "......KKKKK...KKK",
    ],
    /* Las puntas del pelo largo se mecen sobre la espalda. */
    pelo: [ { 15: "......KhHK", 16: "......KhK" }, { 15: ".....KhHK.", 16: ".....KhK.." } ],
    hombro: [13, 19], caderas: [[11, 28], [16, 28]], pies: [[11, 39], [18, 39]],
    brazo: { luz: "#5E7A55", base: pal.L, sombra: pal.l, mano: pal.S, manoLuz: "#FFE6D4" },
    pierna: { luz: "#66664F", base: "#4A4A3A", sombra: "#323226", bota: "#7C8594", botaSombra: "#565E6B" },
    manos: { guardia: [18, 23], impulso: [21, 20], golpe: [24, 20], choque: [24, 20], sigue: [23, 21], sube: [22, 16], alto: [25, 12] },
    arma: (px, p) => {
      const [hx, hy] = p.mano, disparo = p.fase === "golpe" || p.fase === "choque" || p.fase === "sigue";
      arco(px, hx, hy, !disparo, p.fase === "impulso");
    },
    /* La flecha cruza la pantalla en línea recta. */
    proyectil: (g, x, y, p) => {
      if (p.fase !== "golpe") return;
      const cx = Math.round(x + HD_OX + 34 + p.k * 34), cy = y + HD_OY + 20;
      g.fillStyle = HDK; g.fillRect(cx - 1, cy - 1, 12, 3);
      g.fillStyle = "#B07A44"; g.fillRect(cx + 2, cy, 7, 1); g.fillStyle = "#4ADE80"; g.fillRect(cx, cy - 1, 2, 3); g.fillStyle = "#D9DEE6"; g.fillRect(cx + 9, cy - 1, 1, 3); g.fillRect(cx + 10, cy, 1, 1);
    },
    choque: [72, 20],
  };
})();
HEROES_HD.janet = HD_JANET;

/* Línea gruesa de un punto a otro según una dirección (para hojas, mangos). */
const hdRumbo = (fase, tabla) => tabla[fase] || tabla.guardia;

/* ======================= CUPE ======================= */
const HD_CUPE = (() => {
  const pal = {
    W: "#F6F4EE", v: "#E9E3D6", w: "#D6CFC0", O: "#F2C230", R: "#D7263D", Z: "#FFFFFF", L: "#E8E4F0",
    G: "#8E939C", g: "#5F646E", Y: "#C9A24B", B: "#7A5230", D: "#24212B", N: "#2A1E22",
  };
  const DIR = { guardia: [0.5, -0.87], impulso: [1, -0.15], golpe: [1, 0], choque: [1, 0], sigue: [1, 0.05], sube: [0.3, -1], alto: [0.3, -1] };
  /* Florete: cazoleta dorada en la mano y hoja finita. */
  const florete = (px, hx, hy, d) => armaCupe(px, hx, hy, d);   // ver armaCupe
  return {
    id: "cupe", nombre: "Cupe", pal,
    cuerpo: [
      "...........O...O...O", "...........OO.OOO.OO", "...........OROOROORO", "........KKKOOOOOOOOOKKK",
      "......KKWWKKKKKKKKKKKWWKK", ".....KWWWWWWWWWWWWWWWWWWK", "....KWWvWWWWWWWWWWWWWWvWWK", "....KWWWWWWWWWWWWWWWWWWWWK",
      "...KwKWWWWWWWWWWWWWWWWWWKwK", "..KwwKWWWWWWWKKWWWWKKWWWWKwwK", "..KwwKWWWWWWWKKWWWWKKWWWWKwwK", "..KwwKWWWWWWWWWWWKKWWWWWWKwwK",
      "..KwwKWWWWWWWWWWKWWKWWWWWKwwK", "..KwwKWWWWWWWWWWWWWWWWWWWKwwK", "..KwwKKWWWWWWWWWWWWWWWWWKKwwK", "...KwwKKKWWWWWWWWWWWWWKKKwwK",
      "....KKK..KGGKZZZZZKGGK..KKK", "........KGGYKZLZLZKYGGK", "........KGgYKBZZZBKYGGK", "........KGgYKBYBYBKYgGK",
      "........KGgYKBBYBBKYgGK", "........KGgYKBYBYBKYgGK", "........KGgYKDDDDDKYgGK", "........KGgYKDDDDDKYgGK",
      "........KGgYKDDKDDKYgGK", "........KGgYYKDKDKYYgGK", "........KKKKKDDKDDKKKKK", ".............KDDKDDK",
    ],
    /* Los faldones de la levita se asoman y se mecen a los lados. */
    capa: [
      { 22: ".......KGK", 23: "......KGgK", 24: "......KGgK", 25: ".....KGgYK", 26: ".....KGgYK", 27: ".....KKKKK" },
      { 22: ".......KGK", 23: ".......KGgK", 24: "......KGgK", 25: "......KGgYK", 26: "......KGgYK", 27: "......KKKKK" },
      { 22: ".......KGK", 23: "......KGgK", 24: ".....KGgK", 25: "....KGgYK", 26: "....KGgYK", 27: "....KKKKK" },
    ],
    hombro: [21, 19], caderas: [[13, 28], [17, 28]], pies: [[13, 39], [18, 39]],
    brazo: { luz: "#B4B9C2", base: pal.G, sombra: pal.g, mano: pal.W, manoLuz: pal.Z, codo: pal.Y },
    pierna: { luz: "#FFFFFF", base: pal.W, sombra: pal.w, bota: pal.D, botaSombra: "#141218" },
    manos: { guardia: [24, 24], impulso: [23, 25], golpe: [27, 21], choque: [28, 21], sigue: [27, 22], sube: [25, 16], alto: [28, 13] },
    arma: (px, p) => florete(px, p.mano[0], p.mano[1], hdRumbo(p.fase, DIR)),
    choque: [56, 24],
  };
})();
HEROES_HD.cupe = HD_CUPE;

/* ======================= JULY ======================= */
const HD_JULY = (() => {
  const pal = {
    S: "#D9A27A", s: "#A8714C", Z: "#F2CDA8", W: "#F2F2F2", w: "#C8C8D0", A: "#7A4A2A", a: "#5A341C", Y: "#E8B830", B: "#8E2A20", G: "#C9A24B",
  };
  const DIR = { guardia: [0.45, 0.9], impulso: [-0.7, -0.7], golpe: [1, 0.15], choque: [1, 0.45], sigue: [0.9, 0.55], sube: [0.1, -1], alto: [0.05, -1] };
  /* Martillo de forja: mango de madera y una cabeza de hierro grande. */
  const martillo = (px, hx, hy, d) => { const L = Math.hypot(d[0], d[1]); martilloJuly(px, hx, hy, d[0] / L, d[1] / L); };   // el mismo martillo de guerra (ver martilloJuly)
  return {
    id: "july", nombre: "July", pal,
    cuerpo: [
      ".........KKKKKKK", ".......KKSZZSSSSKK", "......KSZZSSSSSSSSK", "......KSZSSSSSSSSSSK",
      "......KSSSSSSSSSSSSK", "......KSSSSSSSSSSSSSK", "......KSSSSSSSWWWWSK", ".....KSKSSSSSSSKSSSK",
      ".....KsKSSSSSSSKSSSSK", "......KSSSSSSSSSSSSSSK", "......KSSWWWSSSSSSSSK", "......KSWWWWWWWWWWWWK",
      "......KWWwWWWWWKKWWWK", "......KWWWWWWWWWWWWWK", "......KWWwWWWWWWwWWK", ".....KSKWWWWWWWWWWK",
      "....KSSSKWWwWWWWWK", "....KSsSSKWWWWWWKAK", "....KSsSSAKWWWWKAAAK", "....KSsSSAAKKKKAAAAK",
      "....KSsSSAAAAAAAAAAK", "....KSsSYYYYYYYYYYYK", "....KSsSKBBBBGBBBBBK", "....KSSSKAAAAAAAAAAK",
      "....KKSSKAaAAAAAAAAK", "....KSSSKAaAAAAAAAK", ".....KKKKAaAAAAAAAK", ".........KAaAAAAAAK",
    ],
    /* El delantal de cuero tapa los muslos y se balancea un poco. */
    falda: { 28: ".........KAaAAAAAK", 29: ".........KAaAAAAK", 30: "..........KKKKKK" },
    pelo: [ { 14: "......KWWwWWWWWWwWWK", 15: ".....KSKWWWWWWWWWWK" }, { 14: "......KWWwWWWWWWwWWWK", 15: ".....KSKWWWWWWWWWWWK" } ],
    hombro: [13, 19], caderas: [[11, 28], [16, 28]], pies: [[11, 39], [18, 39]], brazoGrueso: 4,
    brazo: { luz: pal.Z, base: pal.S, sombra: pal.s, mano: "#3A2A20", manoLuz: "#5A4A40" },
    pierna: { luz: "#7A7E8A", base: "#5A5E6A", sombra: "#3E414A", bota: "#A9B2BF", botaSombra: "#7C8594" },
    manos: { guardia: [19, 23], impulso: [7, 20], golpe: [24, 21], choque: [25, 23], sigue: [23, 24], sube: [22, 16], alto: [25, 11] },
    arma: (px, p) => martillo(px, p.mano[0], p.mano[1], hdRumbo(p.fase, DIR)),
    choque: [48, 30],
  };
})();
HEROES_HD.july = HD_JULY;

/* Personajes que saltan al atacar (Uzu): suben durante el impulso y caen en el golpe. */
const hdPoseBase = hdPose;
hdPose = function (c, anim, t) {
  const p = hdPoseBase(c, anim, t);
  if (c.salta && p.fase === "impulso") p.bob = -Math.round(Math.sin(p.k * Math.PI / 2) * 9);
  if (c.salta && p.fase === "golpe") p.bob = -Math.round(Math.cos(p.k * Math.PI / 2) * 9);
  return c.ajustePose ? c.ajustePose(p) : p;   // cada personaje puede retocar su pose (Edith flota al celebrar)
};

/* ======================= EDITH ======================= */
const HD_EDITH = (() => {
  const pal = {
    H: "#1E1A22", h: "#4A4256", S: "#F0D6C8", s: "#C9A898", L: "#9B2D5A", P: "#4E2A6E", p: "#341A4C", C: "#E8DFC4",
    B: "#2A1C30", Y: "#B8902A",
  };
  /* Grimorio abierto que flota delante de ella, de frente. */
  const grimorio = (px, cx, cy, brillo) => {
    const pts = [];
    for (let x = -5; x <= 5; x++) for (let y = -4; y <= 3; y++) {
      const tapa = Math.abs(x) === 5 || y === 3, lomo = x === 0;
      pts.push([cx + x, cy + y + (Math.abs(x) > 2 && y === -4 ? 1 : 0), lomo ? "#341A4C" : tapa ? "#6E3C96" : (y + x) % 3 === 0 && y > -3 && y < 2 ? "#B9AE92" : "#F4EEDC"]);
    }
    hdContorno(px, pts);
    px(cx - 3, cy - 1, "#9B2D5A"); px(cx + 3, cy - 1, "#9B2D5A");
    if (brillo) { px(cx, cy - 7, "#E9D5FF"); px(cx - 2, cy - 6, "#C4A7FF"); px(cx + 2, cy - 6, "#C4A7FF"); }
  };
  /* Hombrera de cráneo sobre el hombro de adelante. */
  const craneo = (px, sx, sy) => {
    const pts = [];
    for (let x = -2; x <= 2; x++) for (let y = -3; y <= 1; y++) if (!(Math.abs(x) === 2 && y === -3)) pts.push([sx + x, sy + y, y === -3 ? "#FFFBEA" : "#E9E1C8"]);
    hdContorno(px, pts); px(sx - 1, sy - 1, HDK); px(sx + 1, sy - 1, HDK); px(sx, sy + 1, "#B9AE92");
  };
  const rayo = (g, x0, y0, x1, y1, t) => {
    const n = 8, pts = [];
    for (let i = 0; i <= n; i++) pts.push([Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n + (i % n ? ((i * 7 + Math.floor(t / 60)) % 5) - 2 : 0))]);
    [[3, HDK], [2, "#7C3AED"], [1, "#F5F3FF"]].forEach(([gr, col]) => {
      g.fillStyle = col;
      for (let i = 0; i < n; i++) hdLinea(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], (x, y) => g.fillRect(x - (gr >> 1), y - (gr >> 1), gr, gr));
    });
  };
  return {
    id: "edith", nombre: "Edith", pal,
    cuerpo: [
      "..........KKKKKK", "........KKHhHHhHKK", ".......KHhHHhHHhHHK", "......KHHhHHHhHHHhHK",
      "......KhHHHhHHHHHHHK", ".....KHHhHHHHHHHHHHHK", ".....KhHHHhHHKSSSSHHK", "....KHHhHHHHKSSSSSSHK",
      "....KhHHhHHKSSSSSSSSK", "....KHHhHHHKSSSSSSKSK", "...KhHHhHHKSSSSSSSKSK", "...KHHhHHHKsSSSSSSSSK",
      "...KhHHhHHKsSSSSSLSK", "...KHHhHHHHKssSSSSK", "...KhHHhHHHHKKsSKK", "...KHHhHHHKPPKKK",
      "...KhHHhHKPPPPPPK", "...KHHhHKPPCPPPPCK", "...KhHHKPPPCPPPPCPK", "...KHhHKPPPPCPPPCPK",
      "...KhHHKPpPPCPPPCPK", "...KHhKPPpPPCBBBCBK", "....KKKPPpPPPCPCPPK", ".......KPPpPPPPCPPPK",
      ".......KPpPPPPPCPPPK", "......KPPpPPPPPCPPPPK", "......KPpPPPPPPCPPPPK", ".....KPPpPPPPPPCPPPPPK",
    ],
    falda: {
      28: ".....KPpPPPPPPPCPPPPPK", 29: "....KPPpPPPPPPPCPPPPPPK", 30: "....KPpPPPPPPPPCPPPPPPK", 31: "....KPpPPPPPPPPPCPPPPPK",
      32: "...KPPpPPPPPPPPPCPPPPPK", 33: "...KPpPPPPPPPPPPPCPPPPPK", 34: "...KYYYYYYYYYYYYYYYYYYYK", 35: "....KKKKKKKKKKKKKKKKKKKK",
    },
    /* Los rulos de la punta del pelo se mecen. */
    pelo: [ { 22: "...KhK", 23: "..KHhK", 24: "..KhK", 25: "...K" }, { 22: "...KhK", 23: "...KHhK", 24: "...KhK", 25: "....K" } ],
    hombro: [13, 19], caderas: [[11, 28], [16, 28]], pies: [[11, 39], [18, 39]],
    brazo: { luz: "#6E4A8E", base: pal.P, sombra: pal.p, mano: "#3A3A48", manoLuz: "#5A5A6A" },
    pierna: { luz: "#4A3A50", base: pal.B, sombra: "#1A1020", bota: "#1A1020", botaSombra: "#0E0812" },
    manos: { guardia: [18, 23], impulso: [15, 19], golpe: [21, 18], choque: [21, 18], sigue: [20, 20], sube: [22, 16], alto: [24, 13] },
    arma: (px, p) => {
      craneo(px, 13, 18);
      const lanza = p.fase === "impulso" || p.fase === "golpe" || p.fase === "choque";
      const flota = Math.round(Math.sin(p.t / 300) * 1.5);
      grimorio(px, 28, (p.fase === "alto" ? 4 : lanza ? 10 : 13) + flota, lanza || Math.floor(p.t / 400) % 2);
    },
    /* El rayo sale del grimorio y llega hasta el rival. */
    proyectil: (g, x, y, p) => {
      if (p.fase !== "golpe" && p.fase !== "choque") return;
      const x0 = x + HD_OX + 30, y0 = y + HD_OY + 12, x1 = x0 + (p.fase === "golpe" ? p.k : 1) * 36;
      rayo(g, x0, y0, x1, y + HD_OY + 22, p.t);
    },
    choque: [74, 22],
  };
})();
HEROES_HD.edith = HD_EDITH;

/* ======================= UZU ======================= */
const HD_UZU = (() => {
  const pal = {
    G: "#6FA544", g: "#4A7A2C", Z: "#8FC064", B: "#6B4A2A", b: "#8A6438", M: "#B8C0CC", R: "#E04848", W: "#E8E4D8",
    V: "#D6CFBC", v: "#8E8570", T: "#7A5232", t: "#5A3A22", Y: "#C9A24B",
  };
  const DIR = { guardia: [0.6, -0.8], impulso: [-0.3, -1], golpe: [1, 0.2], choque: [1, 0.5], sigue: [0.8, 0.6], sube: [0.1, -1], alto: [0.05, -1] };
  /* Hacha de hueso: mango con nudos y una hoja de piedra oscura con el filo hacia adelante. */
  const hacha = (px, hx, hy, d) => {
    const L = Math.hypot(d[0], d[1]), ux = d[0] / L, uy = d[1] / L, nx = -uy, ny = ux, pts = [];
    const at = (i, k, col) => pts.push([Math.round(hx + 1 + ux * i + nx * k), Math.round(hy + uy * i + ny * k), col]);
    for (let i = -3; i <= 12; i++) for (let k = 0; k < 2; k++) at(i, k, k ? "#B8B2A2" : "#E8E4D8");
    [-3, 12].forEach((i) => { at(i, -1, "#E8E4D8"); at(i, 2, "#B8B2A2"); });
    for (let i = 6; i <= 13; i++) { const ancho = 6 - Math.round(Math.abs(i - 9.5) * 1.1); for (let k = 2; k <= 2 + ancho; k++) at(i, k, k === 2 + ancho ? "#9AA3B0" : (i + k) % 3 ? "#3E4048" : "#2A2C33"); }
    hdContorno(px, pts);
  };
  return {
    id: "uzu", nombre: "Uzu", pal,
    cuerpo: [
      "", "", "", "", "", "", "", "",
      "............K...K...K", "...........KMK.KMK.KMK", "..........KBBBBBBBBBBBK", ".........KBBbBBBBBBBBBBK",
      "..KK....KBBbBBBBBBBBBBBK....KK", ".KGgKK..KBBBBBBBBBBBBBBK..KKgGK", ".KGGgGKKGGGGGGGGGGGGGGGKKGgGGK", "..KGGgGKGGRRKGGGGKRRGGGKGgGGK",
      "...KKGgKGGRRKGGGGKRRGGGKgGKK", ".....KKKGGGGGGGgGGGGGGGKKK", "........KGKWKWKWKWKWKGK", ".........KGGKKKKKKKKGGK",
      "..........KKGGGGGGGKK", "........KGKTTTTTTTTTK", ".......KGGKTtTTTTTtTK", ".......KGgKTTTtTTTTTK",
      ".......KVvKBBBBYBBBBK", ".......KvVKTTtTTTtTTK", ".......KGGKtTKTTKTtTK", "........KK.KTK.KTK.K",
    ],
    /* Las orejas enormes se agitan un poco. */
    pelo: [ { 12: "..KK.........................KK" }, { 12: ".KK...........................KK" } ],
    hombro: [21, 22], caderas: [[13, 28], [17, 28]], pies: [[13, 39], [18, 39]], salta: true, brazoAtras: (p) => p.fase === "impulso",
    brazo: { luz: pal.Z, base: pal.G, sombra: pal.g, mano: pal.g, manoLuz: pal.G, codo: pal.V },
    pierna: { luz: pal.V, base: pal.G, sombra: pal.g, bota: pal.g, botaSombra: "#2E5418", rodilla: pal.V },
    manos: { guardia: [23, 25], impulso: [16, 12], golpe: [26, 22], choque: [27, 24], sigue: [25, 25], sube: [22, 18], alto: [21, 12] },
    arma: (px, p) => hacha(px, p.mano[0], p.mano[1], hdRumbo(p.fase, DIR)),
    choque: [48, 30],
  };
})();
HEROES_HD.uzu = HD_UZU;

/* ======================= XITIN ======================= */
const HD_XITIN = (() => {
  const pal = {
    H: "#F4E7B8", h: "#C9B47A", Z: "#FFFBEA", p: "#C9707A", S: "#F2D6C4", s: "#CFA88F", R: "#4A3A5A", L: "#6B3F22", l: "#4E2C16",
    F: "#E6E1D6", f: "#B0A898", B: "#3A2418", O: "#D8DEE8", T: "#5A3A28", t: "#40281A",
  };
  /* El oso: la grilla de hoy, estirada en el torso para que quede más alto que ella. */
  const BASE = [
    "...............KK...........", "..............KBbK.KK.......", ".............KBBBBKbBK......", "............KBBBBBBBBKK.....",
    "...........KBBBBBBBKBBBKK...", "..........KBBBBBBBBBBBMMMMK.", ".........KBBBBBBBBBBBMMMMKK.", "........KBBBBBBBBBBBKWKWKK..",
    ".......KBBBBBBBBBBBBKRRRK...", "......KBBBBBBBBBBBBBKWKWK...", ".....KBBbBBBBBBBBBBBMMMK....", "....KBBbBBBBBBBBBBBBMMK.....",
    "....KBbBBBBBBBBBBBBBKK......", "...KBbBBBBBBBBBBBBBBMK......", "...KBbBBBBBBBBBBBBBMMK......", "...KBbBBBBBBbBBBBBBMMK......",
    "..KBbBBBBBBBBBBBBBBMMK......", "..KBbBBBBBBBBBBBBBMMMK......", "..KBbBBBBbBBBBBBBBMMMK......", "..KBbBBBBBBBBBBBBBMMMK......",
    "..KBbBBBBBBBBBBBBBMMK.......", "..KBBbBBBBBBBBbBBBMMK.......", "..KBBbBBBBBBBBBBBBBK........", "..KBBBbBBBBBBBBBBBBK........",
    "...KBBBBBBBBBBBBBBK.........", "...KBBBBBBBBBBBBBBK.........", "...KBBBBBKKKKKKBBBBK........", "...KBBBBK....KBBBBK.........",
    "...KBBBBK....KBBBBK.........", "...KBBBBK....KBBBBK.........", "...KBBBBK....KBBBBK.........", "...KBBBBK....KBBBBK.........",
    "...KBBBBBK...KBBBBBK........", "...KBBBBBBK..KBBBBBBK.......", "...KbWbWbWK..KbWbWbWK.......", "...KKKKKKKK..KKKKKKKK.......",
  ];
  const filas = BASE.flatMap((f, i) => (i >= 14 && i <= 28 && i % 2 === 0 ? [f, f] : [f]));
  const OSO = {
    id: "oso", pal: { B: "#6B4426", b: "#4A2E18", M: "#A57A4E", W: "#F2EEE0", R: "#7A2A3A" },
    cuerpo: filas, top: 40 - filas.length, sinPiernas: true, brazoGrueso: 5,
    hombro: [15, 3], caderas: [[0, 0], [0, 0]], pies: [[0, 0], [0, 0]],
    brazo: { luz: "#8A5E38", base: "#6B4426", sombra: "#4A2E18", mano: "#4A2E18", manoLuz: "#6B4426" },
    brazoAtras: (p) => p.fase === "impulso",
    manos: { impulso: [5, -7], golpe: [22, 8], choque: [25, 20], sigue: [24, 24], guardia: [22, 14] },
    /* Garras blancas en la zarpa. */
    arma: (px, p) => { const [hx, hy] = p.mano; [-1, 1, 3].forEach((d) => { px(hx + 3, hy + d, "#F2EEE0"); px(hx + 4, hy + d + 1, "#F2EEE0"); }); },
  };
  /* Nube esponjosa: varias bolas que crecen, con borde gris y brillo arriba. */
  const puf = (g, cx, cy, f) => {
    const e = [0.5, 0.85, 1][f]; if (!e) return;
    const bolas = [[0, 0, 7], [-7, 3, 5], [7, 3, 5], [-4, -6, 5], [5, -5, 5], [0, 7, 5], [-9, -2, 4], [9, -2, 4]].map(([a, b, r]) => [cx + a * e, cy + b * e, r * e]);
    const dentro = (x, y, m) => bolas.some(([a, b, r]) => (x - a) ** 2 + (y - b) ** 2 <= (r + m) ** 2);
    for (let y = cy - 16; y <= cy + 16; y++) for (let x = cx - 18; x <= cx + 18; x++) {
      if (dentro(x, y, 0)) { g.fillStyle = dentro(x, y + 2, 0) ? (dentro(x - 2, y - 2, 0) ? "#F4F1EA" : "#FFFFFF") : "#C9C2B4"; g.fillRect(x, y, 1, 1); }
      else if (dentro(x, y, 1)) { g.fillStyle = "#8E8676"; g.fillRect(x, y, 1, 1); }
    }
  };
  const OSO_FASES = ["impulso", "golpe", "choque", "sigue"];
  return {
    id: "xitin", nombre: "Xitin", pal,
    cuerpo: [
      "..........KKKKKK", "........KKHHZHHHKK", ".......KHHhHHZHHHHK", "......KHHhHHHHHHHHHK",
      "......KHhHHHHHHHHHHHK", ".....KHhHHHHHHHHHHHHK", ".....KHhHHHHHHKKKKSHK", ".....KHhHHHHHKSSSSSSK",
      "....KHhHHKKHKSSSSSSSK", "...KKHhHKSSKSSSSSRKSK", "..KSSKhHHKSKSSSSSRKSK", "...KSSKhHKSSSSSSSSSSK",
      "....KKHhHKsSSSSSSSSK", "....KHhHHKsSSSSSpSK", "....KHhHHHKssSSSSK", "...KFFFFHhHKKKKK",
      "..KFfFFFFFFFFFFFK", ".KFfFFfFFFFfFFFFFK", "..KFFFFKLLLLLLLFK", "...KHhKLLlLLLLLLK",
      "...KHhKLLLLlLLLLK", "...KhHKFfFfFfFfFK", "...KHhKSSSSsSSSSK", "...KhHKSSSSSSsSSK",
      "....KKKOBOBOBOBOK", "......KTTTTTTTTTK", "......KTTTTKTTTTK", "......KTtTTKTTtTK",
    ],
    /* La punta de la trenza se mece. */
    pelo: [ { 24: "...KHK", 25: "...KhK", 26: "...KZK", 27: "....K" }, { 24: "..KHK.", 25: "..KhK.", 26: "..KZK.", 27: "...K.." } ],
    hombro: [13, 19], caderas: [[11, 28], [16, 28]], pies: [[11, 39], [18, 39]],
    brazo: { luz: "#FFF0E4", base: pal.S, sombra: pal.s, mano: pal.S, manoLuz: "#FFF0E4" },
    pierna: { luz: "#7A5238", base: pal.T, sombra: pal.t, bota: pal.F, botaSombra: pal.f },
    manos: { guardia: [18, 23], impulso: [15, 20], golpe: [22, 20], choque: [22, 20], sigue: [21, 22], sube: [22, 16], alto: [25, 11] },
    forma: (p) => (OSO_FASES.includes(p.fase) ? OSO : null),
    /* Maná verde que late en la mano. */
    arma: (px, p) => {
      const [hx, hy] = p.mano, late = 2.5 + Math.sin(p.t / 220) * 1;
      for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) { const d = Math.hypot(dx, dy); if (d <= late) px(hx + 1 + dx, hy - 3 + dy, d < 1.2 ? "#DCFCE7" : d < late - 1 ? "rgba(74,222,128,.75)" : "rgba(74,222,128,.35)"); }
      const sube = Math.floor(p.t / 120) % 6;
      px(hx + 2, hy - 7 - sube, "#86EFAC"); if (sube > 2) px(hx - 1, hy - 5 - sube, "#4ADE80");
    },
    /* ¡Puf!: nube al transformarse y al volver; zarpazo al dar. */
    proyectil: (g, x, y, p) => {
      const cx = x + HD_OX + 14, cy = y + HD_OY + 22, T = p.t % 2400;
      if (p.fase === "impulso" && p.k < 0.6) puf(g, cx, cy, Math.floor(p.k * 5));
      if (p.fase === "vuelve" && T < 1580) puf(g, cx, cy, 2 - Math.floor((T - 1400) / 60));
      if (p.fase === "choque" || p.fase === "sigue") {
        const n = p.fase === "choque" ? Math.min(3, Math.floor(p.k * 6)) : 3;
        for (let i = 0; i < n; i++) for (let j = 0; j < 9; j++) { g.fillStyle = j > 6 ? "#FFFFFF" : "#F2EEE0"; g.fillRect(x + 52 + i * 3 + j, y + HD_OY + 14 + j, 1, 1); }
      }
    },
    choque: [46, 26],
  };
})();
HEROES_HD.xitin = HD_XITIN;

/* ================= PRUEBA DE ÁNGULO: TRES CUARTOS =================
   El cuerpo gira unos 45° hacia el rival: se ven los dos ojos (el de atrás más cerca del borde),
   el pecho casi completo y el brazo de atrás colgando a un lado. El brazo que ataca nace en el
   hombro del lado del rival, así sale hacia adelante sin cruzar la cara ni el pecho. */
const HD_LATTE34 = {
  ...HD_LATTE, nombre: "Latte",
  pal: { ...HD_LATTE.pal, g: "#3E6E78", q: "#5E8E98" },
  cuerpo: [
    "............KKKKKKK", "............KtTTTTK", "............KtTTTuK", "............KtTTTuK",
    "............KtTTWWK", "............KYYYWYK", "............KyyyyyK", ".........KKKKTTTTTKKKK",
    "........KtTTTTTTTTTTTuK", "........KHiHHHiHHHHhK", ".......KHiHhHHSHSSSSSK", "........KHiHhSSSSSSSSK",
    ".......KHhHhSSESSSSESK", "........KhHhSSESSsSESK", ".........KhHSSSSSssSSK", ".........KhXXSXXXXXXSK",
    "..........KXXXXSSXXXK", "...........KXXXXXXXK", "..........KJJJJKLLLKJJK", "..........KJJJJKLLLKJJK",
    "..........KjJJJKLLLKJJK", "..........KjJJJJKLKJJJK", "..........KjJJJJKLKJJJK", "..........KjJJJJJKJJJJK",
    "..........KjBBBBBBGBBBK", "..........KjJJJJJJJJJJK", "..........KjjJJJJJJJJJK", "..........KKjjjjjjjjjjK",
  ],
  hombro: [20, 19], caderas: [[13, 28], [18, 28]], pies: [[13, 39], [19, 39]],
  manos: { guardia: [25, 27], impulso: [4, 22], golpe: [28, 20], choque: [29, 21], sigue: [27, 22], sube: [24, 16], alto: [27, 11] },
  brazoAtras: (p) => p.fase === "impulso",   // toma impulso por detrás de la espalda
  brazoCerca: { hombro: [11, 19] }, brazoGrueso: 2,
};

const HD_CUPE34 = {
  ...HD_CUPE, nombre: "Cupe", bajar: 4,
  pierna: { ...HD_CUPE.pierna, anchoAdelante: 3 },   // la pierna derecha (la de adelante) más delgada
  cuerpo: [
    "............O...O...O", "............OO.OOO.OO", "............OROOROORO", ".........KKKOOOOOOOOOKKK",
    ".......KKWWKKKKKKKKKKKWWKK", "......KWWWWWWWWWWWWWWWWWWK", ".....KWWvWWWWWWWWWWWWWWWWWK", ".....KWWWWWWWWWWWWWWWWWWWWK",
    "...KKwKWWWWWWWWWWWWWWWWWWWK", "..KwwwKWWWWWWWWKKWWWWKKWWWKK", "..KwwwKWWWWWWWWKKWWWWKKWWWKwK", "..KwwwKWWWWWWWWWWWWWKKWWWWWK",
    "..KwwwKWWWWWWWWWWWWKWWKWWWWWK", "..KwwwKWWWWWWWWWWWWWWWWWWWKwK", "..KwwwKKWWWWWWWWWWWWWWWWWKKwwK", "...KwwwKKKWWWWWWWWWWWWWKKKwwK",
    ".....KKK.KGGGGKZZZKGGK...KKK", "........KGGGGYKZLZKYGK", "........KGgGGYKBZBKYGK", "........KGgGGYKBYBKYGK",
    "........KGgGGYKBBBKYGK", "........KGgGGYKBYBKYGK", "........KGgGGYKDDDKYGK", "........KGgGGYKDDDKYGK",
    "........KGgGYYKDKDKYGK", "........KKKKKKKDKDKKKK", ".............KDDKDDK", ".........KK..KDDKDDK",
  ],
  hombro: [21, 19], caderas: [[15, 28], [18, 28]], pies: [[14, 39], [19, 39]], brazoCerca: { hombro: [10, 19] }, brazoGrueso: 2,
  manos: { guardia: [24, 24], impulso: [23, 25], golpe: [28, 21], choque: [29, 21], sigue: [28, 22], sube: [25, 16], alto: [28, 13] },
};

/* Cara de Cupe simétrica como el diseño publicado: la de frente, 1 px hacia el rival. */
HD_CUPE34.cuerpo = HD_CUPE34.cuerpo.map((f, i) => (i <= 15 ? "." + HD_CUPE.cuerpo[i] : f));
/* Cupe noble: capa real roja con borde de armiño que cae del hombro a las rodillas (en vez de los faldones). */
Object.assign(HD_CUPE34.pal = { ...HD_CUPE.pal }, { V: "#C0263A", u: "#8A1A2A", E: "#FFFFFF", e: "#1A1020" });
HD_CUPE34.cuerpo = HD_CUPE34.cuerpo.map((f, i) => (i === 27 ? f.replace(".........KK..", ".............") : f));
/* Cara tierna: ojos grandes verticales más separados, naricita con boquita de perrito (ᴥ) y mejillas rosadas. */
HD_CUPE34.pal.P = "#F7A8B8";
{
  const cara = { 9: { 13: "K", 14: "K", 21: "K", 22: "K" }, 10: { 13: "K", 14: "K", 21: "K", 22: "K" }, 11: { 13: "K", 14: "K", 17: "K", 18: "K", 21: "K", 22: "K" },
    12: { 10: "P", 11: "P", 15: "K", 17: "K", 18: "K", 20: "K", 23: "P", 24: "P" }, 13: { 16: "K", 19: "K" } };
  HD_CUPE34.cuerpo = HD_CUPE34.cuerpo.map((f, i) => [...f].map((k, x) => (i >= 9 && i <= 14 && x >= 8 && x <= 24 ? (cara[i] && cara[i][x]) || (k === "K" ? "W" : k) : k)).join(""));
}
{
  const capa = { 16: "......KEeEK", 17: ".....KVVVVK", 18: ".....KVVVVK", 19: "....KVVVuVK", 20: "....KVVVuVK", 21: "....KVVuVVK", 22: "...KVVVuVVK", 23: "...KVVuVVVK",
    24: "...KVVuVVVK", 25: "..KVVVuVVVK", 26: "..KVVuVVVVK", 27: "..KVVuVVVVK", 28: ".KVVVuVVVK", 29: ".KVVuVVVVK", 30: ".KEeEEEeEK", 31: "..KKKKKKKK" };
  const mece = (dx) => Object.fromEntries(Object.entries(capa).map(([k, v]) => [k, +k < 22 ? v : dx > 0 ? "." + v : v.slice(1)]));   // de la cintura para abajo
  HD_CUPE34.capa = [capa, mece(-1), mece(1)];
}

/* Cupe en el podio: saludo de esgrima (el florete frente a la cara y luego hacia abajo, al público),
   después una reverencia inclinando la cabeza (cierra los ojos mientras está abajo), y desde arriba le llueven rosas. */
{
  const CICLO = 3800, mod = (a, n) => ((a % n) + n) % n;
  const florete = (px, hx, hy, d) => armaCupe(px, hx, hy, d);   // ver armaCupe
  const POSES = {
    guardia: { mano: HD_CUPE34.manos.guardia, dir: [0.5, -0.87] },
    saluda: { mano: [23, 14], dir: [0.12, -1] },   // la hoja vertical frente a la cara
    baja: { mano: [27, 22], dir: [1, 0.6] },   // la baja en diagonal hacia el público
    reverencia: { mano: [26, 24], dir: [1, 0.4] },
  };
  const momento = (T) => (T < 500 ? "guardia" : T < 1300 ? "saluda" : T < 1700 ? "baja" : T < 3100 ? "reverencia" : "guardia");
  /* En la reverencia la cabeza baja y se adelanta; el cuerpo y las piernas se quedan donde están. */
  const inclinado = (cuerpo, n) => cuerpo.map((f, i) => (i >= 16 + n || i < n ? (i < n ? "" : f) : ".".repeat(n) + cuerpo[i - n]));
  const CUERPOS = [0, 1, 2, 3].map((n) => inclinado(HD_CUPE34.cuerpo, n));
  const ojosCerrados = HD_CUPE34.cuerpo.map((f, i) => (i === 9 || i === 10 ? [...f].map((k, x) => ((x >= 13 && x <= 14) || (x >= 21 && x <= 22) ? "W" : k)).join("") : f));   // solo queda la rayita de abajo
  const INCLINADO_OJOS_CERRADOS = inclinado(ojosCerrados, 3);
  HD_CUPE34.retoque = (p, c) => {
    if (!p.enPodio) return null;
    const T = mod(p.t || 0, CICLO), m = momento(T), pose = POSES[m];
    const inclina = m === "reverencia" ? Math.min(1, (T - 1700) / 250, (3100 - T) / 250) : 0;   // se inclina despacio y vuelve
    const cc = { ...c, cuerpo: inclina >= 1 ? INCLINADO_OJOS_CERRADOS : CUERPOS[Math.round(inclina * 3)], retoque: undefined, arma: (px, q) => florete(px, q.mano[0], q.mano[1], pose.dir) };   // el brazo de cerca queda como siempre, con su mano a la vista
    return { c: cc, p: { ...p, fase: "guardia", mano: pose.mano, bob: 0, agacha: Math.round(inclina), inclina: 0 } };
  };
  /* Rosa roja de tallo largo, siempre de lado: cae dando vueltas (se da vuelta a cada rato) y en el escalón queda acostada. */
  const rosa = (g, cx, cy, vuelta) => {
    const R = "#D7263D", L = "#F26B7A", O = "#9B1428", V = "#2F7D32", v = "#4CAF50";
    const pts = [[0, -1, O], [1, -1, R], [-1, 0, R], [0, 0, L], [1, 0, R], [0, 1, O], [1, 1, O], [2, -1, V], [2, 1, V], [2, 0, V], [3, 0, V], [4, 0, V], [5, 0, V], [6, 0, V], [4, -1, v]];
    const s = vuelta ? -1 : 1, set = new Set(pts.map(([a, b]) => a + "," + b));
    g.fillStyle = HDK; pts.forEach(([a, b]) => [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([u, w]) => { if (!set.has((a + u) + "," + (b + w))) g.fillRect(cx + s * (a + u), cy + b + w, 1, 1); }));
    pts.forEach(([a, b, col]) => { g.fillStyle = col; g.fillRect(cx + s * a, cy + b, 1, 1); });
  };
  HD_CUPE34.proyectil = (g, x, y, p) => {
    if (!p.enPodio) return;
    const T = Math.max(0, p.t || 0);   // no se repite: una vez abrazadas, siguen así
    g.save(); if (T > 3400) g.globalAlpha = Math.max(0, (CICLO - T) / 400);   // se desvanecen antes de que empiece otra vez
    [[0, 1700], [27, 1850], [5, 2050], [23, 2250], [8, 2450]].forEach(([rx, sale]) => {
      if (T < sale) return;
      const k = Math.min(1, (T - sale) / 1000), suelo = y + HD_OY + 39;
      const cx = Math.round(x + HD_OX + rx + Math.sin((T - sale) / 140) * 2 * (1 - k)), cy = Math.round(y - 6 + (suelo - y + 6) * k);
      rosa(g, cx, cy, k < 1 ? Math.floor((T - sale) / 220) % 2 === 1 : rx > 15);
    });
    g.restore();
  };
}
const HEROES_34 = [[HD_LATTE, HD_LATTE34], [HD_CUPE, HD_CUPE34]];

/* Jelic en tres cuartos: visera con los dos ojos, hombrera y brazo de atrás a la izquierda, la U del pecho corrida hacia el rival. */
const HD_JELIC34 = {
  ...HD_JELIC,
  cuerpo: [
    "...............................", "...............................", "............KKKKKK.............", "...........KLLLMMMKK...........",
    "..........KLLMMMMMMMK..........", ".........KLMMMMMMMMMMK.........", ".........KLMMMMMMMMMMMK........", "........KLMMMMMMMMMMMMMK.......",
    "........KLMMMmmmmmmmmMMK.......", "........KMMMmKKKKKKKKKmK.......", "........KMMmKzSSSSSSSKmK.......", "........KMMmKSSKSSSKSKmK.......",
    "........KMMmKSSKSSSKSKmK.......", "........KMmmKsSSSSsSSKmK.......", "........KMmmKsSWWWWWSKmK.......", "........KmmmKssSwWWwSKK........",
    ".........KmmKKssSSSSKK.........", "..........KKKdddddKKK..........", "..........KdMMMMMMMMMMK", "..........KLMMMMMMMMMMK",
    "..........KMLQAAAAAAQMK", "..........KMLQRAAARAQMK", "..........KMLQRAAARAQMK", "..........KMLQRRRRRAQMK",
    "..........KMMQAAAAAAAMK", "..........KBBBBBBYBBBBK", "...........KRaRaRaRaRaK", "...........KaRaRaRaRaRK",
  ],
  hombro: [21, 19], caderas: [[13, 28], [18, 28]], pies: [[13, 39], [19, 39]],
  manos: { guardia: [25, 27], impulso: [18, 25], golpe: [26, 23], choque: [28, 23], sigue: [27, 24], sube: [24, 16], alto: [27, 11] },
  choque: [38, 20],
  brazoCerca: { hombro: [11, 19] }, brazoGrueso: 2,
};
/* Agattita en tres cuartos: el ojo de atrás más angosto y la nariz dentro del hocico, no en el borde. */
const HD_AGATTITA34 = { ...HD_AGATTITA, bajar: 4,
  brazoCerca: { hombro: [12, 19] }, brazoGrueso: 2,
  pierna: { ...HD_AGATTITA.pierna, anchoAdelante: 3 },   // la pierna derecha (la de adelante) más delgada
  /* Cara simétrica como el diseño publicado: ojos grandes con brillo, hocico al centro con la nariz,
     boquita en ω y mechones iguales en las dos mejillas. Corrida 1 px hacia el rival. */
  cuerpo: HD_AGATTITA.cuerpo.map((f, i) => ({
    8: "......KZFFFFKKFFFFFKKFFFFK", 9: "......KZFFFFKWFFFFFKWFFFFK", 10: ".....KFZFFFFKKFFFFFKKFFFFFK",
    11: "...KFfFZFFfFWWWWNNWWWWFfFFfFK", 12: "....KFfFZFFFWWWKWWKWWWFFfFFK", 13: "......KFZFFFWWWWWWWWWWFFFK",
    14: "........KKFFFWWWWWWWWFFKK", 15: "..........KKKKKKKKKKKKK",
    20: "............KWWWWWWKK", 21: "............KWWwWWWK", 22: "............KFWWWWFK", 23: "............KBBBBBBK", 24: "............KBbBBbBK",
  }[i] || f)),
  /* Cola atigrada, gruesa y esponjosa: sube desde la cadera pegada al costado y la punta se mece. */
  capa: [
    { 13: ".....KK", 14: "....KFFK", 15: "...KFfFFK", 16: "...KFFfFK", 17: "...KfFFK", 18: "...KFfFK", 19: "...KFFfK", 20: "....KfFFK", 21: "....KFfFK", 22: ".....KFFfK", 23: ".....KfFFFK", 24: "......KFfFFK", 25: ".......KKFFK" },
    { 13: "....KK", 14: "...KFFK", 15: "..KFfFFK", 16: "..KFFfFK", 17: "...KfFFK", 18: "...KFfFK", 19: "...KFFfK", 20: "....KfFFK", 21: "....KFfFK", 22: ".....KFFfK", 23: ".....KfFFFK", 24: "......KFfFFK", 25: ".......KKFFK" },
    { 13: "......KK", 14: ".....KFFK", 15: "....KFfFFK", 16: "....KFFfFK", 17: "...KfFFFK", 18: "...KFfFK", 19: "...KFFfK", 20: "....KfFFK", 21: "....KFfFK", 22: ".....KFFfK", 23: ".....KfFFFK", 24: "......KFfFFK", 25: ".......KKFFK" },
  ],
};
HEROES_34.unshift([HD_JELIC, HD_JELIC34], [HD_AGATTITA, HD_AGATTITA34]);

/* Malala en tres cuartos: el flequillo le tapa los ojos (nadie se los ha visto), la cara corrida hacia el rival
   con pelo a los dos lados, y el broche de la blusa hacia el lado del rival. */
/* La gata calico de Malala, sentada a sus pies: cara blanca con una oreja naranja y otra oscura,
   manchas naranja y café en el cuerpo, la cola que se mece y un parpadeo de vez en cuando. */
const gataCalico = (px, x0, y0, t, celebra) => {
  if (celebra) { y0 -= Math.floor(t / 210) % 2 ? 3 : 0; }   // salta de alegría con Malala
  const pal = { K: HDK, W: "#F4F1EA", w: "#D9D2C4", O: "#E08A3C", D: "#4A3628", P: "#E39A86", E: "#3A5A2A" };
  const parpadea = Math.floor(t / 150) % 20 === 0;
  const filas = [
    ".K...K.", "KOK.KDK", "KOOWWDK", parpadea ? "KWKKKWK" : "KWEWEWK", "KWWPWWK", ".KWWWK.",
    "KDWWWOK", "KDDWWOK", "KDWWWwK", ".KKKKK.",
  ];
  filas.forEach((f, y) => [...f].forEach((k, x) => { if (pal[k]) px(x0 + x, y0 + y, pal[k]); }));
  if (celebra) {   // cola bien arriba y un corazoncito
    [[-1, 8, "K"], [-1, 7, "D"], [-2, 6, "K"], [-1, 6, "D"], [-1, 5, "O"], [-2, 5, "K"], [-1, 4, "O"], [-2, 4, "K"], [-1, 3, "K"]].forEach(([x, y, k]) => px(x0 + x, y0 + y, pal[k]));
    if (Math.floor(t / 420) % 2) [[1, -3], [3, -3], [0, -2], [1, -2], [2, -2], [3, -2], [4, -2], [1, -1], [2, -1], [3, -1], [2, 0]].forEach(([x, y]) => px(x0 + x, y0 + y - 1, "#F472B6"));
    return;
  }
  const mece = Math.floor(t / 300) % 2;   // la cola sube por el costado y la punta se mece
  [[-1, 8, "K"], [-1, 7, "D"], [-2, 7, "K"], [-1, 6, "D"], [-2, 6, "K"], [mece ? -1 : 0, 5, "O"], [mece ? -2 : -1, 5, "K"], [mece ? -1 : 0, 4, "K"]].forEach(([x, y, k]) => px(x0 + x, y0 + y, pal[k]));
};
/* La otra gata de Malala: también calico, apenas más grande y gordita que la otra (2 px más alta y ancha),
   con una mancha negra junto a la nariz. Se sienta detrás de la gata chica. */
const gataGordita = (px, x0, y0, t, celebra) => {
  const pal = { K: HDK, W: "#F4F1EA", w: "#D9D2C4", O: "#E08A3C", o: "#B8692C", D: "#7A6656", E: "#2A1E14", P: "#E39A86", N: "#1A1020" };
  const parpadea = celebra || Math.floor((t + 1700) / 150) % 23 === 0;   // al celebrar entrecierra los ojos de gusto
  const filas = [
    ".K.....K.", "KOK...KDK", "KOOKKKKDK", "KOOWWWDDK", parpadea ? "KWWWWWWWK" : "KWEWWWEWK", "KWEWPWEWK", ".KWNWWWK.",
    "KoOWWWWDK", "KOOWWWWDK", "KOWWWWWwK", "KWWWWWWwK", ".KKKKKKK.",
  ];
  filas.forEach((f, y) => [...f].forEach((k, x) => { if (pal[k]) px(x0 + x, y0 + y, pal[k]); }));
  if (celebra && Math.floor(t / 420) % 2 === 0) [[1, -3], [3, -3], [0, -2], [1, -2], [2, -2], [3, -2], [4, -2], [1, -1], [2, -1], [3, -1], [2, 0]].forEach(([x, y]) => px(x0 + 2 + x, y0 + y - 2, "#F472B6"));
};
const HD_MALALA34 = { ...HD_MALALA,
  /* Sin la capita crema: el pelo negro largo le cae por la espalda y las puntas se mecen. */
  capa: [
    { 21: "...KLK", 22: "...KLlK", 23: "...KLLK", 24: "....KlK", 25: "....KK" },
    { 21: "...KLK", 22: "..KLlK", 23: "..KLLK", 24: "...KlK", 25: "...KK" },
    { 21: "...KLK", 22: "...KLlK", 23: "....KLLK", 24: ".....KlK", 25: ".....KK" },
  ], brazoCerca: { hombro: [7, 20] }, brazoGrueso: 2,
  cuerpo: HD_MALALA.cuerpo.map((f, i) => ({
    11: "....KLLLLLLLLLLLLK", 12: "....KLLLlLLLLlLLLK", 13: "....KLLlLLLlLLLlLK", 14: "....KLlLLSLSSLSLLK",
    15: "....KLlLKSSSSSSSLK", 16: "....KLlLKKsSSpSKLK", 17: "....KLLKKDDDDDKKLK", 18: "...KLKYYYYYYYYYK", 19: "..KLLKYYYYYYEYYK", 20: "..KLlLKYYYYYYYK", 21: "...KLKQQQQQQQK",
  }[i] || f)),
  hombro: [14, 20],
  manos: { guardia: [21, 24], impulso: [10, 27], golpe: [23, 21], choque: [24, 21], sigue: [23, 22], sube: [22, 16], alto: [25, 11] },
  arma: (px, p) => { if (!["impulso", "golpe", "choque", "sigue"].includes(p.fase)) HD_MALALA.arma(px, p); },
  /* Las gatas van detrás de Malala (se dibujan antes que su cuerpo), quietas en el suelo aunque ella se agache. */
  atras: (px, p) => {
    if (["impulso", "golpe", "choque", "sigue"].includes(p.fase)) HD_MALALA.atras(px, { ...p, fase: "golpe" });
    if (HD_MALALA34.huyenMascotas) return;   // perdió el versus: las gatas salieron arrancando (las dibuja la escena)
    const baja = (p.bob || 0) + (p.agacha || 0), inc = p.inclina || 0;
    gataGordita((x, y, c) => px(x - inc, y - baja, c), p.enPodio ? 5 : -2, 27, p.t, (p.fase === "sube" || p.fase === "alto") && !p.duelo);   // detrás de la chica
    gataCalico((x, y, c) => px(x - inc, y - baja, c), p.enPodio ? -1 : -8, 30, p.t, (p.fase === "sube" || p.fase === "alto") && !p.duelo);
  },
};

/* Malala en el podio: suelta la escoba, sus dos gatas le saltan a los brazos y se queda celebrando abrazada
   con ellas, dando saltitos, hasta que termina la escena. */
{
  const mod = (a, n) => ((a % n) + n) % n;
  const SUELO_CHICA = [-1, 30], SUELO_GORDA = [5, 27], BRAZO_CHICA = [12, 16], BRAZO_GORDA = [4, 15];
  const arco = (a, b, k) => [Math.round(a[0] + (b[0] - a[0]) * k), Math.round(a[1] + (b[1] - a[1]) * k - Math.sin(Math.PI * k) * 8)];
  /* La escoba tirada en el escalón: plana, el palo a lo largo y las pajas apenas abiertas. */
  const escobaTirada = (px, x0, y) => {
    const pts = [];
    for (let x = x0; x <= x0 + 15; x++) pts.push([x, y, "#9A6A3A"]);   // el palo, y las pajas al final (a la vista, junto a sus pies)
    for (let x = x0 + 16; x <= x0 + 21; x++) { const a = Math.round((x - x0 - 15) / 3); for (let yy = y - a; yy <= y + Math.min(1, a); yy++) pts.push([x, yy, (x - x0) % 2 ? "#A8762A" : "#E0B04A"]); }
    pts.push([x0 + 15, y, "#9A3B2A"]);
    hdContorno(px, pts);
  };
  /* Una mano dibujada encima de las gatas: así se ve que las sostiene. */
  const mano = (px, c, [hx, hy]) => { const pts = []; for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) pts.push([hx + i, hy + j, i === -1 || j === -1 ? c.brazo.manoLuz || c.brazo.mano : c.brazo.mano]); hdContorno(px, pts); };
  const corazon = (px, x, y) => [[0, 0], [2, 0], [-1, 1], [0, 1], [1, 1], [2, 1], [3, 1], [0, 2], [1, 2], [2, 2], [1, 3]].forEach(([a, b]) => px(x + a, y + b, "#F472B6"));
  HD_MALALA34.retoque = (p, c) => {
    if (!p.enPodio) return null;
    const T = Math.max(0, p.t || 0);   // no se repite: una vez abrazadas, siguen así
    if (T < 500) return null;   // empieza como siempre: escoba en la mano y gatas en el suelo
    const conEscoba = T < 700, abrazo = T >= 1400, salto = abrazo ? Math.floor(T / 300) % 2 : 0;
    const k = T < 900 ? 0 : T < 1400 ? (T - 900) / 500 : 1;   // 0 en el suelo, 1 en sus brazos
    const [chica, gorda] = k <= 0 ? [SUELO_CHICA, SUELO_GORDA] : k >= 1 ? [BRAZO_CHICA, BRAZO_GORDA] : [arco(SUELO_CHICA, BRAZO_CHICA, k), arco(SUELO_GORDA, BRAZO_GORDA, k)];
    const pose = abrazo ? { mano: [16, 26], cerca: [[4, 6], [-1, 3]] } : T >= 900 ? { mano: [19, 22], cerca: [[6, 2], [1, 3]] } : { mano: c.manos.guardia, cerca: null };
    const cc = { ...c, retoque: undefined, arma: undefined,
      atras: (px, q) => {   // la escoba queda tirada en el escalón, a su lado
        if (conEscoba) return;
        const baja = (q.bob || 0) + (q.agacha || 0);
        escobaTirada((x, y, col) => px(x, y - baja, col), 8, 38);
      },
      arma: (px, q) => {   // las gatas van delante de los brazos y las manos encima de ellas
        const baja = (q.bob || 0) + (q.agacha || 0), suelo = (x, y, col) => px(x, y - baja, col), enBrazos = k >= 1 ? px : suelo;
        if (conEscoba) HD_MALALA.arma(px, q);
        gataGordita(enBrazos, gorda[0], gorda[1], p.t, false);
        gataCalico(enBrazos, chica[0], chica[1], p.t, false);
        if (k >= 1) { mano(px, c, q.mano); mano(px, c, [c.brazoCerca.hombro[0] + pose.cerca[0][0], c.brazoCerca.hombro[1] + pose.cerca[0][1]]); }
        if (abrazo) [[6, 2, 0], [17, 4, 500], [12, 0, 1000]].forEach(([hx, hy, d]) => {   // corazones que suben
          const f = mod(T - 1400 + d, 1500) / 1500; if (f < 0.8) corazon(px, hx, hy - Math.round(f * 10));
        });
      },
      brazoCerca: pose.cerca ? { ...c.brazoCerca, poses: {}, todas: pose.cerca } : c.brazoCerca };
    return { c: cc, p: { ...p, fase: "guardia", mano: pose.mano, bob: -salto * 2, agacha: 0, inclina: 0 } };
  };
}
/* Malía en tres cuartos: los dos ojos verdes con mejillas rosadas, la nariz entre los ojos, la oreja de elfo
   del lado de cerca y la cara redondeada; el delantal ya mira hacia el rival. */
const HD_MALIA34 = { ...HD_MALIA, brazoCerca: { hombro: [9, 18] }, brazoGrueso: 2,
  cuerpo: HD_MALIA.cuerpo.map((f, i) => ({
    5: "......KHHHHHHHHHHHK", 6: ".....KHHhHHHHHHHHHK", 7: ".....KHhHHHHHHHHHHHK", 8: "....KKHhHHKzSSSSSSHK",
    9: "...KSKhHHKSSSSSSSSHK", 10: "....KSKhHKSSESSSESK", 11: "....KKHhHKSpSSSSpSK", 12: ".....KHhKsSSSSsSSK",
    13: ".....KHhKsSSSppSK", 14: "......KKKKssSSKK",
    /* Peto del delantal al centro y hombro de blusa a cada lado, para que el brazo derecho nazca de un hombro. */
    16: "........KBBBWWWBK", 17: ".......KBBBBWWWWBK", 18: "......KBbBBBWWwWBBK", 19: "......KBbBBBWWWWBBK",
    20: "......KBbBBBWWWWBBK", 21: "......KDDDDDDDDDDDK", 22: "......KDdDDDDDDDDDK",
  }[i] || f)),
  hombro: [17, 18],
  manos: { guardia: [20, 23], impulso: [8, 24], golpe: [24, 20], choque: [25, 20], sigue: [24, 21], sube: [22, 16], alto: [25, 11] },
  choque: [52, 19], manoEncima: true, brazoAtras: (p) => p.fase === "impulso",
  arma: (px, p) => HD_MALIA.arma(px, p.fase === "guardia" || p.fase === "vuelve" ? { ...p, fase: "sube" } : p),
};
HEROES_34.push([HD_MALALA, HD_MALALA34], [HD_MALIA, HD_MALIA34]);
/* Malía ataca con mermelada de frutilla: al golpear, un poco de mermelada sale volando del cucharón y salpica al rival.
   Si está dándosela a probar (p.alimenta, al ganar), no la lanza. */
HD_MALIA34.proyectil = (g, x, y, p) => {
  if (p.alimenta || (p.fase !== "golpe" && p.fase !== "choque")) return;
  const x0 = x + HD_OX + p.mano[0] + 19, y0 = y + HD_OY + p.mano[1] + (p.agacha || 0) - 1;
  const gota = (cx, cy, r) => {
    g.fillStyle = HDK; g.fillRect(cx - r - 1, cy - r, 2 * r + 3, 2 * r + 1); g.fillRect(cx - r, cy - r - 1, 2 * r + 1, 2 * r + 3);
    g.fillStyle = "#F0407A"; g.fillRect(cx - r, cy - r, 2 * r + 1, 2 * r + 1);
    g.fillStyle = "#FFD0DE"; g.fillRect(cx - r, cy - r, 1, 1);
  };
  if (p.fase === "golpe") { const k = p.k; gota(Math.round(x0 + 1 + k * 3), Math.round(y0 - Math.sin(Math.PI * k) * 2), 1); return; }
  const cx = Math.round(x0 + 2), r = 2 + p.k * 6;   // salpicón donde el cucharón toca al rival: gotas que se abren y caen
  for (let n = 0; n < 8; n++) {
    const a = n * 0.785 + 0.2, sx = Math.round(cx + Math.cos(a) * r), sy = Math.round(y0 + Math.sin(a) * r * 0.8 + p.k * p.k * 5);
    g.fillStyle = HDK; g.fillRect(sx - 1, sy - 1, 3, 3); g.fillStyle = n % 3 ? "#F0407A" : "#FF9FC0"; g.fillRect(sx, sy, 1, 1);
  }
  if (p.k < 0.4) gota(cx, y0, 2);
};


/* Kenny en tres cuartos: lentes oscuros con los dos cristales, nariz entre ellos, barba pareja y cara redondeada.
   Al celebrar, la mano de cerca rasguea el laúd en vez de levantarse. */
/* Laúd tomado como se toca mirando al rival: la caja junto a la cadera de cerca, la mano izquierda rasguea,
   y el mango apunta al rival, pisado por la mano derecha. */
const laudKenny = (px, cx, cy) => {
  const pts = [];
  for (let dy = -5; dy <= 5; dy++) for (let dx = -6; dx <= 6; dx++) { const d = (dx / 6.3) ** 2 + (dy / 5.2) ** 2; if (d <= 1) pts.push([cx + dx, cy + dy, dx + dy < -5 ? "#E8B27A" : d > 0.7 ? "#8A5228" : "#C98A4A"]); }
  hdLinea(cx + 5, cy - 3, cx + 15, cy - 9, (x, y) => pts.push([x, y, "#E0A868"], [x, y + 1, "#A86A34"]));
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) pts.push([cx + 16 + i, cy - 11 + j, "#3A2418"]);
  hdContorno(px, pts);
  px(cx, cy, "#2A1608"); px(cx + 1, cy, "#2A1608"); px(cx, cy + 1, "#2A1608"); px(cx + 1, cy + 1, "#2A1608");
  hdLinea(cx - 4, cy + 1, cx + 15, cy - 9, (x, y) => { if ((x + y) % 2 === 0) px(x, y, "#FFF4DC"); });
  px(cx + 19, cy - 11, "#E5E7EB"); px(cx + 18, cy - 12, "#E5E7EB");
};
/* Al celebrar, el laúd cuelga vertical de la mano izquierda: clavijero arriba, caja abajo. */
const laudColgado = (px, hx, hy) => {
  const pts = [];
  for (let y = hy - 1; y <= hy + 2; y++) pts.push([hx, y, "#E0A868"], [hx + 1, y, "#A86A34"]);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) pts.push([hx - 1 + i, hy - 4 + j, "#3A2418"]);
  const cy = hy + 7;
  for (let dy = -5; dy <= 5; dy++) for (let dx = -5; dx <= 5; dx++) { const d = (dx / 4.6) ** 2 + (dy / 5.2) ** 2; if (d <= 1) pts.push([hx + dx, cy + dy, dx + dy < -5 ? "#E8B27A" : d > 0.7 ? "#8A5228" : "#C98A4A"]); }
  hdContorno(px, pts);
  px(hx, cy, "#2A1608"); px(hx + 1, cy, "#2A1608"); px(hx, cy + 1, "#2A1608"); px(hx + 1, cy + 1, "#2A1608");
};
const celebraKenny = (p) => (p.fase === "sube" || p.fase === "alto") && !p.duelo;
const RASGUEO_KENNY = { guardia: [[3, 6], [-2, 5]], vuelve: [[3, 6], [-2, 5]], impulso: [[2, 4], [-2, 4]], golpe: [[4, 8], [-2, 6]], choque: [[3, 7], [-2, 5]], sigue: [[3, 6], [-2, 5]], sube: [[-1, 4], [-3, 2]], alto: [[-1, 4], [-3, 2]] };
const HD_KENNY34 = { ...HD_KENNY, brazoGrueso: 2,
  brazoCerca: { hombro: [9, 19], poses: RASGUEO_KENNY, encima: true },   // la mano de cerca rasguea la caja; al celebrar sostiene el laúd colgado   // la mano de cerca pisa las cuerdas en el mango
  armaDetras: (px, p) => (celebraKenny(p) ? laudColgado(px, 8, 23) : laudKenny(px, 11, 26)),
  arma: undefined,
  manos: { guardia: [24, 19], impulso: [23, 19], golpe: [24, 19], choque: [24, 19], sigue: [24, 19], sube: [22, 16], alto: [25, 11] },   // la derecha pisa el mango
  cuerpo: HD_KENNY.cuerpo.map((f, i) => ({
    6: "......KHHhHHHHHHHHHHHK", 7: "......KHhHHHKSSSSSSSSK", 8: "......KHhHHKSSSSSSSSSK",
    9: "......KHhHHKSFQFFFFQFK", 10: "......KHHhHKSFFFSSFFFK", 11: "......KHhHHKsSSSSsSSSK",
    12: "......KHhHKDDSDDDDSDDK", 13: ".......KhHKDDDDSSDDDK", 14: ".......KKKKDDDDDDDDK", 15: "...........KKDDDDKK",
  }[i] || f)),
  hombro: [18, 19],
};

/* Tiván en tres cuartos: los dos ojos bajo las antiparras, la nariz entre ellos, la oreja del lado de cerca
   y el mentón redondeado; toma impulso por detrás del cuerpo. */
const HD_TIVAN34 = { ...HD_TIVAN, brazoGrueso: 2, brazoCerca: { hombro: [9, 19] },
  cuerpo: HD_TIVAN.cuerpo.map((f, i) => ({
    9: "......KKHhHKSSKSSSKSK", 10: "......KSKhHKSSKSSSKSK", 11: "......KKKhKsSSSSsSSSK",
    12: ".........KKsSSSssSSK", 13: "..........KKssSSSK",
  }[i] || f)),
  hombro: [19, 19], brazoAtras: (p) => p.fase === "impulso",
  manos: { guardia: [21, 24], impulso: [5, 24], golpe: [26, 16], choque: [26, 19], sigue: [24, 22], sube: [22, 16], alto: [25, 11] },
};
HEROES_34.push([HD_KENNY, HD_KENNY34], [HD_TIVAN, HD_TIVAN34]);

/* Patroclus en tres cuartos: los dos ojos, una sombra muy suave de nariz, boca pequeña y mentón redondeado;
   el collar con la piedra turquesa corrido hacia el rival. Toma impulso con el bordón por detrás. */
const HD_PATROCLUS34 = { ...HD_PATROCLUS,
  /* Sin capa: una pañoleta verde de scout amarrada al cuello, con la punta colgando hacia atrás. */
  capa: [   // la punta de la pañoleta flamea al viento como las capas: sube, se estira y cae
    { 15: "....KGGK", 16: "..KGGgGK", 17: ".KGgGK", 18: "KGgK", 19: ".KK" },
    { 15: "....KGGK", 16: "...KGGgK", 17: "..KGgGgK", 18: ".KgGK", 19: "KgK", 20: "KK" },
    { 15: "....KGGK", 16: "...KGGgK", 17: "...KGgGK", 18: "..KGgK", 19: "..KgGK", 20: "...KK" },
  ], brazoGrueso: 2, brazoCerca: { hombro: [9, 19] }, manoEncima: true,
  cuerpo: HD_PATROCLUS.cuerpo.map((f, i) => ({
    10: ".....KHHHKSSKSSSKSK", 11: ".....KKSKSSSKSSSKSK", 12: "......KSSKsSSSSsSSK", 13: "......KKsKsSSssSSK",
    14: ".........KKsSSSK", 15: "......KGGgGGGGGGGK", 16: "......KGgLLKNZNKLK", 17: "......KgKLLLLKZKLLK",
    18: "......KLLLLlLLLLLK",
    19: "......KLLLLLLLlLLK",
    /* La parte baja de la túnica llega hasta la cadera derecha: la pierna nace del cuerpo sin corte. */
    24: "......KTTTTTTTTTTK", 25: "......KTTTTTTTTTTK", 26: "......KTTTTTTTTTTK", 27: "......KKKKKKKKKKKK",   // borde de la cintura de lado a lado
  }[i] || f)),
  hombro: [16, 19], brazoAtras: (p) => p.fase === "impulso",
  manos: { guardia: [23, 24], impulso: [12, 23], golpe: [23, 22], choque: [25, 22], sigue: [24, 23], sube: [22, 16], alto: [24, 12] },
  /* Al tomar impulso, el bordón va horizontal hacia atrás, listo para embestir (no vertical tras la cabeza). */
  arma: (px, p) => {
    HD_PATROCLUS.arma(px, p.fase === "impulso" ? { ...p, fase: "golpe" } : p);
    /* Arito de plata, pequeño y sutil, en el lóbulo de la oreja de cerca. */
    [[7, 12, "#E5E7EB"], [7, 13, "#9AA3B0"]].forEach(([x, y, c]) => px(x, y, c));
  },
};

/* Patroclus: un águila de cabeza blanca posada en el hombro de cerca; parpadea y de vez en cuando abre un poco las alas. */
HD_PATROCLUS34.armaDetras = (px, p) => {
  if (HD_PATROCLUS34.huyenMascotas) return;   // perdió el versus: el águila salió volando (la dibuja la escena)
  const x0 = 3, y0 = 7, alas = Math.floor((p.t || 0) / 230) % 9 === 0, parpadea = Math.floor(((p.t || 0) + 900) / 140) % 17 === 0;
  const pal = { K: HDK, W: "#F4F4F0", w: "#CFCFC8", Y: "#F2C230", y: "#B8901C", B: "#6B4423", b: "#4A2E17" };
  const filas = [
    "..KKK...", ".KWWWK..", "KWW" + (parpadea ? "W" : "K") + "WYYK", "KwWWWKyK", ".KWWwK..",
    alas ? "KBKBBKBK" : ".KBbBK..", alas ? "BbBbBbBb" : "KBbBBbK.", "KBBbBBbK", "KbBBbBK.", ".KYKYK..",
  ];
  filas.forEach((f, y) => [...f].forEach((k, x) => { if (pal[k]) px(x0 + x, y0 + y, pal[k]); }));
};
/* Uchis en tres cuartos: cara con la curva suave (pómulo apenas marcado y mandíbula que se cierra de a poco),
   una daga en cada mano; lanza primero la de la derecha y enseguida la de la izquierda. */
const dagaUchis = (px, x, y) => {
  const pts = [[x, y, "#6E4424"], [x, y - 1, "#6E4424"], [x - 1, y - 2, "#C9A24B"], [x, y - 2, "#C9A24B"], [x + 1, y - 2, "#C9A24B"]];
  for (let i = 3; i <= 6; i++) pts.push([x, y - i, "#D9DEE6"], [x + 1, y - i, "#9AA3B0"]);
  pts.push([x, y - 7, "#D9DEE6"], [x, y - 8, "#FFFFFF"]);   // la hoja se angosta y termina en punta
  hdContorno(px, pts);
};
/* Daga en vuelo, con contorno y punta: horizontal o vertical según el giro. */
const dagaVuelo = (g, cx, cy, horizontal) => {
  const pts = [[0, 0, "#6E4424"], [1, 0, "#6E4424"], [2, -1, "#C9A24B"], [2, 0, "#C9A24B"], [2, 1, "#C9A24B"], [3, 0, "#D9DEE6"], [4, 0, "#D9DEE6"], [5, 0, "#D9DEE6"], [6, 0, "#FFFFFF"]];
  const pos = pts.map(([a, b, c]) => (horizontal ? [cx + a, cy + b, c] : [cx + b, cy - a, c]));
  const llenos = new Set(pos.map(([x, y]) => x + "," + y));
  g.fillStyle = HDK;
  pos.forEach(([x, y]) => [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { if (!llenos.has(x + dx + "," + (y + dy))) g.fillRect(x + dx, y + dy, 1, 1); }));
  pos.forEach(([x, y, c]) => { g.fillStyle = c; g.fillRect(x, y, 1, 1); });
};
const MANO_IZQ_UCHIS = {   // la mano izquierda: tranquila, se prepara al golpe de la derecha y lanza cruzando hacia adelante
  guardia: [[-1, 7], [-3, 4]], vuelve: [[-1, 7], [-3, 4]], impulso: [[-1, 7], [-3, 4]], golpe: [[-4, 3], [-5, 7]],
  choque: [[13, 2], [5, 5]], sigue: [[11, 4], [4, 6]], sube: [[-5, -2], [-4, 2]], alto: [[-6, -9], [-5, -3]],
};
const HD_UCHIS34 = { ...HD_UCHIS, brazoGrueso: 2, brazoCerca: { hombro: [9, 18], poses: MANO_IZQ_UCHIS },
  cuerpo: HD_UCHIS.cuerpo.map((f, i) => ({
    6: ".....KHhHHHKSSSSSSSSK", 7: ".....KHhHHKSSSSSSSSSK", 8: ".....KHhHHKSSKSSSKSSK", 9: ".....KHhHHKSSKSSSKSSK", 10: "....KHhHHKsSSSSSsSSSK", 11: "....KHhHHKsSSSSLLSSSK", 12: "....KHhHHHKsSSSSSSSK", 13: "....KHhHHHHKKssSSSK", 14: "....KHhHHHKRCCKKKK",
  }[i] || f)),
  hombro: [18, 18], brazoAtras: (p) => p.fase === "impulso",
  /* Codo a mano: la mano derecha a la misma altura que la izquierda; al lanzar, el brazo se estira casi recto. */
  codos: { guardia: [20, 22], golpe: [22, 19], choque: [22, 20], sigue: [21, 21], sube: [21, 18], alto: [23, 15] },
  manos: { guardia: [21, 25], impulso: [6, 24], golpe: [26, 20], choque: [25, 22], sigue: [23, 23], sube: [22, 16], alto: [25, 11] },
  arma: (px, p) => {
    const lanzo1 = ["golpe", "choque", "sigue"].includes(p.fase), lanzo2 = ["choque", "sigue"].includes(p.fase);
    if (!lanzo1) dagaUchis(px, p.mano[0] + 1, p.mano[1] - 1);
    if (!lanzo2) { const [o] = MANO_IZQ_UCHIS[p.fase] || MANO_IZQ_UCHIS.guardia; dagaUchis(px, 9 + o[0], 18 + o[1] - 1); }
  },
  /* Primero vuela la daga de la derecha; la de la izquierda sale un instante después. */
  proyectil: (g, x, y, p) => {
    const daga = (cx, cy, i) => dagaVuelo(g, cx, cy, Math.floor((p.t + i * 60) / 60) % 2 === 1);
    if (p.fase === "golpe") daga(Math.round(x + HD_OX + 32 + p.k * 16), y + HD_OY + 17, 0);
    if (p.fase === "choque") { daga(x + HD_OX + 48, y + HD_OY + 17, 0); daga(Math.round(x + HD_OX + 30 + p.k * 16), y + HD_OY + 21, 1); }
  },
};
HEROES_34.push([HD_PATROCLUS, HD_PATROCLUS34], [HD_UCHIS, HD_UCHIS34]);

/* Janet en tres cuartos: los dos ojos, la nariz entre ellos, barba pareja (patillas, bigote y mentón), sin pómulo.
   Sostiene el arco con la derecha y la mano de cerca tensa la cuerda al tomar impulso. */
const HD_JANET34 = { ...HD_JANET, brazoGrueso: 2,
  brazoCerca: { hombro: [9, 19], poses: { impulso: [[9, 1], [3, 4]], golpe: [[5, 2], [1, 5]] } },
  cuerpo: HD_JANET.cuerpo.map((f, i) => ({
    6: ".....KHhHHHHHHHHHHHHK", 7: ".....KHSKHHHHHSSSSSSK", 8: ".....KHSSKHHKSSSSSSSK", 9: ".....KHsSKKSSKSSSKSSK", 10: "..KK.KHhHHKSSKSSSKSSK", 11: ".KWWKKHhHKDSSSSSsSSSK",
    12: ".KWQKKHhHKDDSSDDDDDDK", 13: "..KQKKHhHHKDDDDSSDDK", 14: "..KQKKHhHHHKDDDDDDK", 15: "..KQKKhHHKGGLKKKKK",
  }[i] || f)),
  hombro: [17, 19],
  /* Codo abajo al sostener el arco en guardia (no levantado). */
  codos: { guardia: [18, 23] },
  /* Faldón cerrado al medio y borde de la cintura: sin hueco entre las piernas. */
  /* Piernas más delgadas y 1 px más a la izquierda. */
  pierna: { ...HD_JANET.pierna, ancho: 3 },
  caderas: [[10, 28], [15, 28]],
  pies: [[10, 39], [17, 39]],
  manos: { guardia: [21, 23], impulso: [23, 20], golpe: [26, 20], choque: [26, 20], sigue: [25, 21], sube: [22, 16], alto: [25, 12] },
};

/* July en tres cuartos: cejas blancas sobre los dos ojos, la nariz entre ellos, bigote y barba parejos,
   la oreja pegada a la cabeza. El brazo de atrás sale del cuerpo y se dibuja como el otro. */
/* Martillazo de July: el martillo da una vuelta completa y continua. Desde la guardia va hacia atrás,
   sube por detrás del hombro, pasa por encima de la cabeza, cae con fuerza hacia adelante y sigue un poco. */
const anguloJuly = (p) => {
  if (!["impulso", "golpe", "choque", "sigue"].includes(p.fase)) return null;
  const T = p.t % 2400, K = [[500, 70], [760, 225], [830, 270], [900, 380], [1000, 400], [1150, 410], [1400, 430]];
  for (let n = 1; n < K.length; n++) if (T <= K[n][0]) { const [t0, a0] = K[n - 1], [t1, a1] = K[n]; return ((a0 + (a1 - a0) * Math.max(0, (T - t0) / (t1 - t0))) * Math.PI) / 180; }
  return (430 * Math.PI) / 180;
};
/* Mazo de July (como el de la foto que eligió la profesora): cabeza de hierro con óxido y una X grabada,
   mango claro con amarras de cuero junto a la cabeza y en la empuñadura, y un pomo al final. Gira entero con el mango. */
const martilloJuly = (px, hx, hy, ux, uy) => {
  const nx = -uy, ny = ux, pts = [];
  const P = (i, k, col) => pts.push([Math.round(hx + 1 + ux * i + nx * k), Math.round(hy + uy * i + ny * k), col]);
  for (let k = -1; k <= 2; k++) P(-5, k, k < 1 ? "#F2A65E" : "#BA6156");   // el pomo
  for (let i = -4; i <= 8; i++) for (let k = 0; k < 2; k++) {
    const cuero = i <= 0 || i >= 6;   // amarras de cuero en la empuñadura y junto a la cabeza
    P(i, k, cuero ? (i % 2 ? "#5E315B" : "#3E2347") : k ? "#F2A65E" : "#FFB570");
  }
  for (let i = 9; i <= 14; i++) for (let k = -5; k <= 5; k++) {   // la cabeza de hierro
    const x1 = -5 + (i - 9) * 2, x2 = 5 - (i - 9) * 2;   // las dos diagonales de la X grabada
    const marca = (k === x1 || k === x1 + 1 || k === x2 || k === x2 - 1) && Math.abs(k) < 5 && i > 9 && i < 14;
    const oxido = (i * 7 + k * 3) % 11 === 0;
    P(i, k, marca ? "#43434F" : i === 9 ? "#606070" : k === -5 ? "#C2C2D1" : k === 5 ? "#43434F" : oxido ? "#964253" : "#7E7E8F");
  }
  hdContorno(px, pts);
};
const HD_JULY34 = { ...HD_JULY, pal: { ...HD_JULY.pal, P: "#5A5E6A", M: "#A9B2BF", m: "#7C8594", h: "#9A6A3A", l: "#94603A" }, brazoGrueso: 2, brazoCerca: { hombro: [8, 18] }, manoEncima: true,
  pelo: null,   // la barba ya no es larga: sin las filas que se mecían
  /* Cabeza calva redondeada con barba corta; torso ancho de herrero: hombros y costados del pecho desnudos,
     peto de cuero con tiras que suben al cuello, faja amarilla, cinturón rojo y falda del delantal. */
  cuerpo: HD_JULY.cuerpo.map((f, i) => ({
      0: ".........KKKKKK", 1: ".......KKSZZSSSKK", 2: "......KSZZSSSSSSSK", 3: ".....KSZSSSSSSSSSSK", 4: ".....KSSSSSSSSSSSSK", 5: ".....KSSSSSSSSSSSSSK", 6: ".....KSSSSWWWSWWWSSK", 7: "....KSKSSSSKSSSKSSSK", 8: "....KsKSSSSKSSSKSSSK", 9: ".....KSSSSSSSSsSSSSK", 10: ".....KSSSSSWWWWWSSSK", 11: ".....KSSSWWWKKWWWSSK", 12: "......KSSWWWWWWWSSK", 13: ".......KKSWWWWWSKK", 14: "..........KASSAK",
      14: "..........KSSSSK", 15: "........KKAASSAAKK", 16: "......KSSSSaGAAAAGaK", 17: "......KSSSSaAAAAAAaK", 18: "......KsSSSalAAAAAaK", 19: "......KsSSalAAAAAAaK", 20: "......KsSaAlAAAaaAaK", 21: "......KsaAAlAAAaAaaK", 22: "......KBBBBBBBGBBBBK", 23: "......KPMMMlAAAAmmaK", 24: "......KPahAlAAAAmAmK", 25: "......KPahAlAaaAmAmK", 26: "......KPahAlAAAAAAaK", 27: "......KPaAAlAAAAAAaK",
  }[i] || f)),
  /* Delantal de herrero: peto angosto en el pecho que se abre en la cintura y cubre todo el estómago (se amarra atrás), hasta las rodillas.
     En tres cuartos: el frente corrido hacia el rival, el costado de cerca más oscuro donde da la vuelta.
     Cinturón rojo con hebilla y herramientas colgando: un martillo pequeño a la izquierda y tenazas a la derecha. */
  falda: { 28: "......KPaAAlAAAAAAaK", 29: "......KPaAAlAAAAAAaK", 30: "......KPaAAlAAaAAAaK", 31: "........KalAAAAAAAaK", 32: "........KalAAAAAAAaK", 33: "........KaaaaaaaaaaK", 34: "........KKKKKKKKKKKK" },
  hombro: [18, 18],
  /* El codo acompaña el giro del martillo, siempre del mismo lado y con el brazo casi estirado. */
  codoDinamico: (p) => { const a = anguloJuly(p); return a === null ? null : [18 + Math.round(Math.cos(a - 0.3) * 3.8), 18 + Math.round(Math.sin(a - 0.3) * 3.8)]; },
  manoDinamica: (p) => { const a = anguloJuly(p); return a === null ? p.mano : [18 + Math.round(Math.cos(a) * 7), 18 + Math.round(Math.sin(a) * 7)]; },
  brazoAtras: (p) => { const a = anguloJuly(p); if (a === null) return false; const d = ((a * 180) / Math.PI) % 360; return d > 140 && d < 305; },   // por detrás de la cabeza hasta que empieza a caer
  arma: (px, p) => { const a = anguloJuly(p); if (a === null) HD_JULY.arma(px, p); else martilloJuly(px, p.mano[0], p.mano[1], Math.cos(a), Math.sin(a)); },
  choque: [47, 26],
  manos: { guardia: [21, 24], impulso: [7, 20], golpe: [26, 21], choque: [27, 23], sigue: [25, 24], sube: [22, 15], alto: [25, 10] },
};
HD_JANET34.cuerpo = HD_JANET34.cuerpo.map((f, i) => (i === 26 ? "......KggggggggggK" : i === 27 ? "......KKKKKKKKKKKK" : f));
HEROES_34.push([HD_JANET, HD_JANET34], [HD_JULY, HD_JULY34]);

/* Edith en tres cuartos: los dos ojos, la nariz entre ellos, los labios debajo, sin mechones junto a la mejilla.
   La hombrera de cráneo pasa al hombro del lado del rival. */
const HD_EDITH34 = { ...HD_EDITH, brazoGrueso: 2, brazoCerca: { hombro: [9, 19] },
  cuerpo: HD_EDITH.cuerpo.map((f, i) => ({
    6: ".....KhHHHhHHKSSSSSSK", 7: "....KHHhHHHHKSSSSSSSK", 9: "....KHHhHHHKSSKSSSKSK", 10: "...KhHHhHHKSSSKSSSKSK",
    11: "...KHHhHHHKsSSSSsSSSK", 12: "...KhHHhHHKsSSSLLSSK",
  }[i] || f)),
  hombro: [17, 19],
  manos: { guardia: [21, 23], impulso: [19, 19], golpe: [23, 18], choque: [23, 18], sigue: [22, 20], sube: [22, 16], alto: [24, 13] },
  /* Hombreras de hueso: dos puntas blancas curvas en cada hombro (reemplazan al cráneo). El grimorio no cambia. */
  arma: (px, p) => HD_EDITH.arma((a, b, c) => { if (!(a >= 10 && a <= 16 && b >= 14 && b <= 20)) px(a, b, c); }, p),   // el grimorio, sin el cráneo
  /* Las hombreras son ropa, no arma: van en adorno, que se dibuja siempre (no las pierde cuando la desarman). */
  adorno: (px) => {
    [[9, 18, -1], [17, 18, 1]].forEach(([sx, sy, d]) => {
      const pts = [];
      for (let i = -1; i <= 1; i++) pts.push([sx + i, sy, "#3A3A48"]);   // base oscura de la hombrera
      [[0, -1], [0, -2], [d, -3]].forEach(([x, y]) => pts.push([sx - d + x, sy + y, y === -1 ? "#C9BFA6" : "#F4EEDC"]));
      [[0, -1], [d, -2], [2 * d, -3]].forEach(([x, y]) => pts.push([sx + d + x, sy + y, y === -1 ? "#C9BFA6" : "#F4EEDC"]));
      hdContorno(px, pts);
    });
  },
};

/* Uzu en tres cuartos: cara de goblin simétrica corrida 1 px hacia el rival (como Agattita y Cupe),
   sin el brazo de atrás en la grilla: ahora se dibuja como el otro. */
/* Hachazo de Uzu: de arriba hacia abajo, sin vuelta completa. Sube el hacha por delante al saltar,
   la lleva detrás de la cabeza y la baja con fuerza hacia adelante; el codo acompaña el movimiento. */
const hachaUzu = (px, hx, hy, d) => {
    const L = Math.hypot(d[0], d[1]), ux = d[0] / L, uy = d[1] / L, nx = -uy, ny = ux, pts = [];
    const at = (i, k, col) => pts.push([Math.round(hx + 1 + ux * i + nx * k), Math.round(hy + uy * i + ny * k), col]);
    for (let i = -3; i <= 12; i++) for (let k = 0; k < 2; k++) at(i, k, k ? "#B8B2A2" : "#E8E4D8");
    [-3, 12].forEach((i) => { at(i, -1, "#E8E4D8"); at(i, 2, "#B8B2A2"); });
    for (let i = 6; i <= 13; i++) { const ancho = 6 - Math.round(Math.abs(i - 9.5) * 1.1); for (let k = 2; k <= 2 + ancho; k++) at(i, k, k === 2 + ancho ? "#9AA3B0" : (i + k) % 3 ? "#3E4048" : "#2A2C33"); }
    hdContorno(px, pts);
  };
const anguloUzu = (p) => {
  if (!["impulso", "golpe", "choque", "sigue"].includes(p.fase)) return null;
  const T = p.t % 2400, K = [[500, 80], [640, -20], [760, -110], [830, -60], [900, 30], [1000, 50], [1150, 55], [1400, 80]];
  for (let n = 1; n < K.length; n++) if (T <= K[n][0]) { const [t0, a0] = K[n - 1], [t1, a1] = K[n]; return ((a0 + (a1 - a0) * Math.max(0, (T - t0) / (t1 - t0))) * Math.PI) / 180; }
  return (80 * Math.PI) / 180;
};
const HD_UZU34 = { ...HD_UZU, brazoGrueso: 2, brazoCerca: { hombro: [11, 22] },
  manos: { ...HD_UZU.manos, guardia: [22, 28] },   // la mano justo bajo el hombro: el hacha pesa
  /* Codo en cada fase: apenas flectado en guardia; sube alto al tomar impulso y baja con el hachazo. */
  codos: { guardia: [23, 25], impulso: [23, 16], golpe: [25, 18], choque: [25, 20], sigue: [24, 22], sube: [24, 20], alto: [23, 17] },
  pierna: { ...HD_UZU.pierna, ancho: 3 },   // piernas más delgadas
  /* Asoman solo unos dedos sobre el mango: se ve que lo agarra sin tapar el hacha. */
  arma: (px, p) => {
    const a = anguloUzu(p);
    if (a === null) HD_UZU.arma(px, p); else hachaUzu(px, p.mano[0], p.mano[1], [Math.cos(a), Math.sin(a)]);
    const [hx, hy] = p.mano;   // asoman solo unos dedos sobre el mango
    hdContorno(px, [[hx - 1, hy, HD_UZU.pal.G], [hx - 1, hy + 1, HD_UZU.pal.g], [hx, hy + 1, HD_UZU.pal.g]]);
  },
  manoDinamica: (p) => { const a = anguloUzu(p); return a === null ? p.mano : [21 + Math.round(Math.cos(a) * 6), 22 + Math.round(Math.sin(a) * 6)]; },
  codoDinamico: (p) => { const a = anguloUzu(p); if (a === null) return null; const d = p.fase === "impulso" ? 0.35 : -0.35; return [21 + Math.round(Math.cos(a + d) * 3.4), 22 + Math.round(Math.sin(a + d) * 3.4)]; },
  brazoAtras: (p) => { const a = anguloUzu(p); return a !== null && (a * 180) / Math.PI < -70; },   // detrás de la cabeza en lo alto
  cuerpo: HD_UZU.cuerpo.map((f, i) => (i >= 8 && i <= 20 ? "." + f : i >= 21 && i <= 26 ? "..........K" + f.slice(11) : i === 27 ? "..........." + f.slice(11) : f)),
  pelo: [ { 12: "..KK" + ".".repeat(26) + "KK" }, { 12: ".KK" + ".".repeat(28) + "KK" } ],   // puntas de las orejas a la misma distancia
};

/* Xitin en tres cuartos: los dos ojos, la pintura de guerra bajo el ojo de cerca, la nariz entre los ojos,
   la oreja de elfo atrás en el pelo y sin pómulo. El oso no cambia. */
const HD_XITIN34 = { ...HD_XITIN, brazoGrueso: 2, brazoCerca: { hombro: [8, 18] },
  cuerpo: HD_XITIN.cuerpo.map((f, i) => ({
    6: ".....KHhHHHHHHHKSSSSK", 7: ".....KHhHHHHHKSSSSSSK", 8: "....KHhHHHHHKSSSSSSSK", 9: "....KHhHHHHKSSKSSSKSK", 10: "...KSKhHHHHKSSKSSSKSK", 11: "....KHhHHHHKRSSSSsSSK", 12: "....KKHhHHKsRSSSSSSK", 13: "....KHhHHKsSSSSppSK", 14: "....KHhHHHKssSSSSK",
  }[i] || f)),
  hombro: [16, 18], caderas: [[9, 28], [14, 28]], pies: [[9, 39], [15, 39]],   // piernas centradas bajo el torso
  codos: { guardia: [17, 22] },   // codo abajo en guardia, como el brazo de cerca
  manos: { ...HD_XITIN.manos, guardia: [20, 24], sube: [22, 16], alto: [25, 11] },
};
HD_XITIN34.forma = (p) => (["impulso", "golpe", "choque", "sigue"].includes(p.fase) ? OSO34 : null);
HD_XITIN34.arma = (px, p) => {
  const [sx, sy] = HD_XITIN34.brazoCerca.hombro, [[ox, oy]] = { sube: [[-5, -2]], alto: [[-6, -9]] }[p.fase] || [[-1, 7]];
  manaXitin(px, HD_XITIN34.hombro[0], HD_XITIN34.hombro[1], p.mano[0], p.mano[1], p.t);   // mano derecha
  manaXitin(px, sx, sy, sx + ox, sy + oy, p.t + 300);                                       // mano izquierda
};

/* Oso de Xitin en tres cuartos: de pie, los dos ojos, el hocico hacia el rival y el pecho claro.
   Ataca con las dos garras: las levanta a los lados de la cabeza y las baja juntas hacia adelante. */
const OSO34 = {
  id: "oso", pal: { B: "#6B4426", b: "#4A2E18", M: "#A57A4E", W: "#F2EEE0", R: "#5A1E2A", P: "#C9707A" },
  cuerpo: [
    "..........KK.......KK",
    ".........KBbK.....KbBK",
    ".........KbBKKKKKKKBbK",
    "........KBBBBBBBBBBBBBK",
    ".......KBBBBBBBBBBBBBBBK",
    ".......KBBBBKBBBBBKBBBBK",
    "......KBBBBBKBBBBBKBBBBK",
    "......KBBBBBBBMMMMMMBBBK",
    "......KBBBBBBMMMKKMMMBBK",
    "......KBBBBBBMMKWRWKMMBK",
    ".......KBBBBBMKRRPRRKMBK",
    ".......KBBBBBBMKKKKKMBK",
    "........KBBBBBBMMMMMBK",
    "......KKBBBBBBBBBBBBBBKK",
    ".....KBBBBBBBBBBBBBBBBBBK",
    "....KBBBBBBBBBBBBBBBBBBBBK",
    "....KBbBBBBBBBMMMMMBBBBBBK",
    "....KBbBBBBBBMMMMMMMBBBBBK",
    "....KBbBBBBBBMMMMMMMBBBBBK",
    "....KBbBBBBBBMMMMMMMBBBBBK",
    "....KBbBBBBBMMMMMMMMMBBBBK",
    "....KBbBBBBBMMMMMMMMMBBBBK",
    "....KBbBBBBBMMMMMMMMMBBBBK",
    "....KBbBBBBBMMMMMMMMMBBBBK",
    "....KBbBBBBBMMMMMMMMMBBBBK",
    "....KBbBBBBBBMMMMMMMBBBBBK",
    "....KBbBBBBBBMMMMMMMBBBBBK",
    "....KBbBBBBBBMMMMMMMBBBBBK",
    "....KBbBBBBBBBMMMMMBBBBBBK",
    "....KBBbBBBBBBBBBBBBBBBBBK",
    ".....KBbBBBBBBBBBBBBBBBBK",
    ".....KBBbBBBBBBBBBBBBBBBK",
    "......KBBBBBBBBBBBBBBBBK",
    "......KBBBBBBBKKBBBBBBBK",
    "......KBBBBBBK..KBBBBBBK",
    "......KBBBBBBK..KBBBBBBK",
    "......KBBBBBMBK.KBBBBBMBK",
    "......KBBBBBMBK.KBBBBBMBK",
    ".......KBBBBBK...KBBBBBK",
    ".......KBbBBBK...KBbBBBK",
    ".......KBBBBBK...KBBBBBK",
    "......KBBBBBBBK.KBBBBBBBK",
    "......KbWbWbWbK.KbWbWbWbK",
    "......KKKKKKKKK.KKKKKKKKK",
  ],
  sinPiernas: true, brazoGrueso: 5, caderas: [[0, 0], [0, 0]], pies: [[0, 0], [0, 0]],
  brazo: { luz: "#8A5E38", base: "#6B4426", sombra: "#4A2E18", mano: "#4A2E18", manoLuz: "#6B4426" },
  hombro: [22, 11],
  manos: { impulso: [26, -3], golpe: [29, 14], choque: [31, 20], sigue: [28, 24], guardia: [26, 14] },
  brazoCerca: { hombro: [7, 11], poses: { impulso: [[-4, -13], [-5, -6]], golpe: [[13, 1], [5, 5]], choque: [[17, 7], [7, 8]], sigue: [[15, 11], [6, 9]] } },
  /* Garras blancas en las dos zarpas. */
  arma: (px, p) => {
    const cerca = OSO34.brazoCerca.poses[p.fase] || [[0, 0]], manos = [p.mano, [7 + cerca[0][0], 11 + cerca[0][1]]];
    manos.forEach(([hx, hy]) => [-1, 1, 3].forEach((d) => { px(hx + 3, hy + d, "#F2EEE0"); px(hx + 4, hy + d + 1, "#F2EEE0"); }));
  },
};
OSO34.top = 40 - OSO34.cuerpo.length;

/* Maná que nace de la palma de cada mano, siguiendo la dirección de la mano. */
const manaXitin = (px, sx, sy, hx, hy, t) => {
  const L = Math.hypot(hx - sx, hy - sy) || 1, cx = hx + ((hx - sx) / L) * 2.5, cy = hy + ((hy - sy) / L) * 2.5, late = 2.3 + Math.sin(t / 220) * 0.8;
  for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) { const d = Math.hypot(dx, dy); if (d <= late) px(Math.round(cx + dx), Math.round(cy + dy), d < 1.2 ? "#DCFCE7" : d < late - 1 ? "rgba(74,222,128,.75)" : "rgba(74,222,128,.35)"); }
  const sube = Math.floor(t / 120) % 6;
  px(Math.round(cx), Math.round(cy) - 4 - sube, "#86EFAC"); if (sube > 2) px(Math.round(cx) - 2, Math.round(cy) - 2 - sube, "#4ADE80");
};
HEROES_34.push([HD_EDITH, HD_EDITH34], [HD_UZU, HD_UZU34], [HD_XITIN, HD_XITIN34]);

/* Tonos de piel intercambiados entre Jelic y Patroclus (pedido de la profe). */
{
  const piel = (pal) => ({ z: pal.z, S: pal.S, s: pal.s });
  const deJelic = piel(HD_JELIC.pal), dePatroclus = piel(HD_PATROCLUS.pal);
  Object.assign(HD_JELIC.pal, dePatroclus);
  Object.assign(HD_PATROCLUS.pal, deJelic);
  HD_PATROCLUS.brazo.mano = deJelic.S; HD_PATROCLUS.brazo.manoLuz = deJelic.z;
}

/* ===== Propuestas de paleta (solo para comparar, imagen fija) ===== */
const conPaleta = (c, pal, extra = {}) => ({ ...c, pal: { ...c.pal, ...pal }, ...extra });
const HEROES_PALETA = [
  ["Patroclus", HD_PATROCLUS34, conPaleta(HD_PATROCLUS34, { L: "#8A5A36", l: "#6A4026", T: "#4A5A78", G: "#3F8F4A", g: "#2A6A34" },
    { pierna: { ...HD_PATROCLUS34.pierna, luz: "#6A7A98", base: "#4A5A78", sombra: "#33405A" } }),
   "Chaleco de cuero más cálido, pantalón azul grisáceo y pañoleta verde scout."],
  ["Janet", HD_JANET34, conPaleta(HD_JANET34, { G: "#5FA83E", g: "#3E7A2A", L: "#C2622E", l: "#8E3E1C" },
    { brazo: { ...HD_JANET34.brazo, luz: "#7FC25A", base: "#5FA83E", sombra: "#3E7A2A" },
      pierna: { ...HD_JANET34.pierna, luz: "#8A6446", base: "#6B4A30", sombra: "#4A3020", bota: "#3A2418", botaSombra: "#24160E" } }),
   "Armadura verde hoja con hojas de otoño en el pecho y pantalón café."],
  ["Uzu", HD_UZU34, conPaleta(HD_UZU34, { B: "#5E636E", b: "#8A909C" },
    { pierna: { ...HD_UZU34.pierna, luz: "#8A6438", base: "#6B4A2A", sombra: "#4A321C" } }),
   "Pantalón de cuero café y casco de fierro; la piel verde y los ojos rojos quedan igual."],
  ["Xitin", HD_XITIN34, conPaleta(HD_XITIN34, { F: "#8E8A86", f: "#5E5A58", L: "#4A2C1A", l: "#2E1A0E", R: "#14B8A6", O: "#2DD4BF" }),
   "Piel de lobo gris, cuero oscuro y acentos turquesa que conectan con su maná."],
  ["Kenny (opcional)", HD_KENNY34, conPaleta(HD_KENNY34, { J: "#7A2E3A", j: "#561E28" },
    { brazo: { ...HD_KENNY34.brazo, luz: "#9A4A56", base: "#7A2E3A", sombra: "#561E28" } }),
   "Chaqueta burdeos para que resalte la capa naranja."],
  ["Tiván (opcional)", HD_TIVAN34, conPaleta(HD_TIVAN34, { O: "#B08A2E", o: "#80621C", P: "#D0AA4A" }),
   "Abrigo de alquimista (en Pear36 pasa a verde azulado)."],
];

/* Paletas aprobadas por la profe (2026-10-11): Patroclus, Janet, Uzu, Kenny y Tiván. Xitin se rediseña aparte. */
HEROES_PALETA.filter(([nombre]) => !nombre.startsWith("Xitin")).forEach(([, actual, nueva]) => {
  actual.pal = nueva.pal;
  if (nueva.brazo !== actual.brazo) actual.brazo = nueva.brazo;
  if (nueva.pierna !== actual.pierna) actual.pierna = nueva.pierna;
});
HEROES_PALETA.length = 0;   // ya no hay nada que comparar

/* Xitin rediseñada (propuesta, imagen fija): capucha de piel de oso con orejitas, manto corto de piel en los hombros,
   vestido largo azul petróleo con borde en puntas, faja oscura con ribetes dorados y medallón, guantes largos oscuros. */
const HD_XITIN_NUEVA = { ...HD_XITIN34,
  pal: { ...HD_XITIN34.pal, U: "#7A4E2C", u: "#553418", D: "#2F5F6E", d: "#1E4250", X: "#2A2236", G: "#C9A24B", Y: "#F2CF6B" },
  cuerpo: HD_XITIN34.cuerpo.map((f, i) => ({
    0: ".......KKK....KKK",
    1: "......KUuUK..KUuUK",
    2: "......KUUUKKKKUUUK",
    3: "......KUUUUUUUUUUUK",
    4: ".....KUUuUUUUUUUUUUK",
    5: ".....KUuUUUUUUUUUUUK",
    6: ".....KUuUUUUUHHHHHUK",
    7: ".....KUuUUUUHKSSSSSSK",
    8: "....KUuUUUUHKSSSSSSSK",
    9: "....KUuUUUHKSSKSSSKSK",
    10: "....KUuUUUHKSSKSSSKSK",
    11: "....KUuUUUHKRSSSSsSSK",
    12: "....KUuUUHKsRSSSSSSK",
    13: "....KUuUHKsSSSSppSK",
    14: "....KUuUHHKssSSSSK",
    15: "........KKSSSSSSKK",
    16: "......KKUUUUUUUUUUKK",
    17: "......KUuUUUDDDUUUUK",
    18: "......KuKUKDDDDKUKuK",
    19: "......KDDdDDDDDDDDK",
    20: "......KDdDDDDDDDDDK",
    21: "......KXGXXXXXGXXXK",
    22: "......KXXXXXXXXXXXK",
    23: "......KDdDDDYDDDDDK",
    24: "......KDdDDDGDDDDDK",
    25: ".....KDdDDDDDDDDDDK",
    26: ".....KDdDDDDDDDDDDK",
    27: ".....KDdDDDDDDDDDDK",
  }[i] || f)),
  falda: { 28: "....KDdDDDDDDDDDDDK", 29: "....KDdDDDDDDDDDDDK", 30: "....KDdDDDDDDDDDDDK", 31: "...KDdDDDDDDDDDDDDK", 32: "...KDdDDDDDDDDDDDDK", 33: "...KGGGGKGGGGKGGGGK", 34: "...KDKKDKKDDKKDKKDK", 35: "...KK..KK..KK..KK" },
  /* La trenza platinada sale de la capucha y cae por delante del hombro; la punta se mece. */
  pelo: [ { 15: "........KHK", 16: "........KhK", 17: "........KHK", 18: "........KhK", 19: "........KHK", 20: "........KZK", 21: ".........K" },
          { 15: "........KHK", 16: "........KhK", 17: "........KHK", 18: ".......KhK", 19: ".......KHK", 20: ".......KZK", 21: "........K" } ],
  brazo: { luz: "#5A4E66", base: "#3A3046", sombra: "#2A2236", mano: "#3A3046", manoLuz: "#5A4E66" },
  pierna: { ...HD_XITIN34.pierna, luz: "#3A3046", base: "#2A2236", sombra: "#1A1420", bota: "#2A2230", botaSombra: "#14101A" },
};
HEROES_PALETA.push(["Xitin · capucha de oso", HD_XITIN34, HD_XITIN_NUEVA, "Capucha de piel de oso con orejitas, vestido largo azul petróleo, faja con ribetes dorados y medallón, guantes largos."]);

/* Xitin rediseñada, segunda propuesta (inspirada en la foto de la profe): cola de caballo alta platinada bien visible,
   top negro corto con borde de piel, cinturón café, calzas negras, botas de armadura plateadas, garras plateadas en las manos
   y un collar con un medallón de cara de oso. */
const COLLAR_OSO = ["c.....c", ".cU.Uc.", ".UUUUU.", ".UKUKU.", ".uMMMu.", "..uNu.."];
const collarOso = (px, x0, y0, filas = COLLAR_OSO) => {
  const pal = { c: "#6B3F22", U: "#9A6B40", u: "#6B4426", K: "#1A1420", M: "#E2C79C", N: "#24212B" };
  filas.forEach((f, y) => [...f].forEach((k, x) => { if (pal[k]) px(x0 + x, y0 + y, pal[k]); }));
};
/* La cola de caballo: arriba fija y la punta se mece de un lado a otro (al medio, atrás, al medio, adelante). */
const colaXitin = [0, -1, 0, 1].map((d) => {
  const corre = (f) => (d < 0 ? f.slice(1) : ".".repeat(d) + f);
  return { 2: "....KK", 3: "...KHHK", 4: "..KHZHK", 5: "..KHhHK", 6: ".KHhHK", 7: ".KHhHK", 8: "KHhHK", 9: "KHhHK", 10: "KHhK", 11: "KHhK", 12: "KhHK", 13: "KHhK", 14: "KhHK", 15: "KHhK",
    16: corre(".KhHK"), 17: corre(".KHhK"), 18: corre(".KhK"), 19: corre("..K") };
});
const HD_XITIN_NUEVA2 = { ...HD_XITIN34,
  pal: { ...HD_XITIN34.pal, N: "#24212B", n: "#3A3646", F: "#E6E1D6", B: "#6B4426", G: "#C9A24B", P: "#24212B", q: "#3A3646", U: "#7A4E2C", u: "#553418" },
  cuerpo: HD_XITIN34.cuerpo.map((f, i) => ({ 15: ".........KKSSSKK", 16: ".......KSSSSSSSSSK", 17: ".......KSNNNNNNNSK", 18: ".......KNNNNNNNNNK", 19: ".......KNnNNNNNNNK", 20: ".......KFFFFFFFFFK", 21: ".......KSSSSsSSSSK", 22: ".......KSSSSSSsSSK", 23: ".......KBBBBGBBBBK", 24: ".......KPPPPPPPPPK", 25: ".......KPPPPPPPPPK", 26: ".......KPPPPKPPPPK", 27: ".......KPqPPKPPqPK" })[i] || f),
  pelo: null,
  capa: colaXitin,   // cola de caballo larga, que se mece despacio
  capaLenta: 350,
  brazo: { luz: "#FFF0E4", base: "#F2D6C4", sombra: "#CFA88F", mano: "#B8C0CC", manoLuz: "#E5E7EB" },
  pierna: { ...HD_XITIN34.pierna, luz: "#3A3646", base: "#24212B", sombra: "#14121A", bota: "#A9B2BF", botaSombra: "#7C8594" },
  arma: (px, p) => { HD_XITIN34.arma(px, p); collarOso(px, 9, 16); },
};
HEROES_PALETA.length = 0;
HEROES_PALETA.push(["Xitin · segunda propuesta", HD_XITIN34, HD_XITIN_NUEVA2, "Cola de caballo alta, top negro corto, calzas negras, botas de armadura, garras plateadas y collar con cara de oso."]);

/* Xitin aprobada (2026-10-11): la segunda propuesta, con piernas más delgadas, reemplaza a la anterior. */
HD_XITIN_NUEVA2.pierna = { ...HD_XITIN_NUEVA2.pierna, ancho: 3 };
HEROES_34.forEach((par) => { if (par[1] === HD_XITIN34) par[1] = HD_XITIN_NUEVA2; });
HEROES_PALETA.length = 0;

/* Vestidos con vuelo al moverse (Malala, Malía, Edith). */
[HD_MALALA34, HD_MALIA34, HD_EDITH34].forEach((c) => { c.faldaVuelo = true; });

/* Vestidos en campana: en la cintura no cambian; hacia abajo se van ensanchando hasta 2 px más a la derecha
   y 1 px menos a la izquierda en el borde de abajo (pedido de la profe). */
{
  const ajustar = (t, der, izq) => {
    const ini = t.indexOf("K"), fin = t.lastIndexOf("K");
    if (ini < 0 || fin - ini < 4) return t;
    if (der > 0) t = t.slice(0, fin) + t[fin - 1].repeat(der) + t.slice(fin);
    if (izq > 0) t = t.slice(0, ini) + ".".repeat(izq) + "K" + t.slice(ini + izq + 1);
    return t;
  };
  [[HD_MALALA34, [24, 25, 26, 27]], [HD_MALIA34, [23, 24, 25, 26, 27]], [HD_EDITH34, [23, 24, 25, 26, 27]]].forEach(([c, filas]) => {
    const faldaFilas = Object.keys(c.falda).map(Number).sort((a, b) => a - b), todas = [...filas, ...faldaFilas], n = todas.length;
    const paso = (f) => { const k = todas.indexOf(f) + 1; return [Math.round((2 * k) / n), Math.round((1 * k) / n)]; };
    c.cuerpo = c.cuerpo.map((f, i) => (filas.includes(i) ? ajustar(f, ...paso(i)) : f));
    c.falda = Object.fromEntries(faldaFilas.map((k) => [k, ajustar(c.falda[k], ...paso(k))]));
  });
}

/* Edith: el rayo principal se ramifica en rayos más finos que parpadean. */
HD_EDITH34.proyectil = (g, x, y, p) => {
  HD_EDITH.proyectil(g, x, y, p);
  if (p.fase !== "golpe" && p.fase !== "choque") return;
  const prog = p.fase === "golpe" ? p.k : 1, x0 = x + HD_OX + 30, y0 = y + HD_OY + 12, x1 = x0 + 36, y1 = y + HD_OY + 22;
  const parpadeo = Math.floor(p.t / 60);
  const rama = (u, dir, largo, semilla) => {
    if (u > prog) return;
    let bx = Math.round(x0 + (x1 - x0) * u), by = Math.round(y0 + (y1 - y0) * u);
    const pts = [[bx, by]];
    for (let i = 1; i <= 3; i++) { bx += Math.round(largo / 3); by += dir * (2 + ((i + semilla + parpadeo) % 2)); pts.push([bx, by]); }
    [[2, HDK], [1, "#A78BFA"]].forEach(([gr, col]) => { g.fillStyle = col; for (let i = 0; i < pts.length - 1; i++) hdLinea(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], (a, b) => g.fillRect(a - (gr >> 1), b - (gr >> 1), gr, gr)); });
  };
  if (parpadeo % 3 !== 2) { rama(0.3, -1, 7, 0); rama(0.55, 1, 8, 1); rama(0.78, -1, 6, 2); }
  else { rama(0.4, 1, 7, 1); rama(0.68, -1, 8, 0); }
};

/* Agattita: brotes mágicos (inspirados en la imagen de la profe). Una fila de brotes nace del suelo uno tras otro,
   desde ella hasta el rival: tallo verde que brilla, hoja de helecho enrollada arriba y resplandor en la base.
   Junto al rival crece uno grande que se enrosca, y suben chispitas verdes. */
HD_AGATTITA34.proyectil = (g, x, y, p) => {
  if (!["golpe", "choque", "sigue"].includes(p.fase)) return;
  const prog = p.fase === "golpe" ? p.k * 0.85 : p.fase === "choque" ? 0.85 + p.k * 0.15 : 1;
  const suelo = y + HD_OY + 39, N = 5;
  const px = (a, b, c) => { g.fillStyle = c; g.fillRect(Math.round(a), Math.round(b), 1, 1); };
  const brote = (bx, alto, lado, grande) => {
    // resplandor en la base
    for (let dx = -3; dx <= 3; dx++) { g.fillStyle = Math.abs(dx) < 2 ? "rgba(134,239,172,.55)" : "rgba(134,239,172,.25)"; g.fillRect(bx + dx, suelo - 1, 1, 2); }
    // tallo con contorno, un poco curvo
    const pts = [];
    for (let i = 0; i < alto; i++) pts.push([bx + Math.round(Math.sin(i / 4) * lado), suelo - 1 - i]);
    pts.forEach(([a, b]) => { g.fillStyle = HDK; g.fillRect(a - 1, b, 3, 1); });
    pts.forEach(([a, b], i) => { px(a, b, i % 3 ? "#4ADE80" : "#22C55E"); if (grande) px(a + 1, b, "#16A34A"); });
    const [tx, ty] = pts[pts.length - 1] || [bx, suelo];
    // hoja de helecho enrollada en la punta
    const curl = grande ? [[1, -1], [2, -1], [3, 0], [3, 1], [2, 2], [1, 1], [2, 0]] : [[1, -1], [2, 0], [1, 1]];
    curl.forEach(([a, b]) => { g.fillStyle = HDK; g.fillRect(tx + a * lado - 1, ty + b - 1, 3, 3); });
    curl.forEach(([a, b]) => px(tx + a * lado, ty + b, "#86EFAC"));
    // hojitas a los lados
    if (alto > 4) [[-2, Math.floor(alto / 2)], [2, Math.floor(alto / 3)]].forEach(([a, h]) => { const [sx, sy] = pts[h]; px(sx + a, sy, "#22C55E"); px(sx + a / 2, sy, "#4ADE80"); });
    px(tx, ty, "#DCFCE7");
  };
  for (let i = 0; i < N; i++) {
    const inicio = i / N; if (prog <= inicio) break;
    const crece = Math.min(1, (prog - inicio) * N * 1.4), grande = i === N - 1;
    const bx = Math.round(x + HD_OX + 30 + i * 8), alto = Math.round((grande ? 19 : 8 + (i % 2) * 4) * crece);
    if (alto > 0) brote(bx, alto, i % 2 ? 1 : -1, grande);
  }
  // chispitas que suben
  for (let i = 0; i < 7; i++) { const sx = x + HD_OX + 30 + ((i * 13) % 40), sy = suelo - 3 - ((p.t / 40 + i * 7) % 18); if (sx < x + HD_OX + 30 + prog * 40) px(sx, sy, i % 2 ? "#86EFAC" : "#DCFCE7"); }
};
HD_AGATTITA34.choque = [70, 22];

/* Carga antes de atacar: un resplandor que crece y chispas que se juntan hacia el punto de poder. */
const hdCarga = (px, cx, cy, k, luz, base, t) => {
  const r = 1.5 + k * 4;
  for (let dy = -6; dy <= 6; dy++) for (let dx = -6; dx <= 6; dx++) {
    const d = Math.hypot(dx, dy);
    if (d <= r) px(cx + dx, cy + dy, d < r * 0.4 ? "#FFFFFF" : d < r * 0.75 ? luz : base);
  }
  for (let i = 0; i < 5; i++) {
    const ang = i * 1.256 + t / 180, dist = 3 + (1 - k) * 9;
    px(Math.round(cx + Math.cos(ang) * dist), Math.round(cy + Math.sin(ang) * dist), luz);
  }
};

/* Edith: el grimorio se carga de energía morada antes del rayo. */
{
  const armaEdith = HD_EDITH34.arma;
  HD_EDITH34.arma = (px, p) => {
    armaEdith(px, p);
    if (p.fase === "impulso") hdCarga(px, 28, 10 + Math.round(Math.sin(p.t / 300) * 1.5), p.k, "#C4B5FD", "rgba(124,58,237,.45)", p.t);
  };
}

/* Agattita: en la punta del bastón crece una esfera verde antes de que broten las plantas. */
{
  const armaAgattita = HD_AGATTITA34.arma;
  HD_AGATTITA34.arma = (px, p) => {
    armaAgattita(px, p);
    if (p.fase === "impulso") hdCarga(px, p.mano[0] + 4, p.mano[1] - 16, p.k, "#86EFAC", "rgba(34,197,94,.45)", p.t);
  };
}

/* Xitin: primero carga el maná en las dos manos (todavía humana) y recién después hace ¡puf! y se vuelve oso. */
{
  const armaXitin = HD_XITIN_NUEVA2.arma, proyXitin = HD_XITIN_NUEVA2.proyectil;
  HD_XITIN_NUEVA2.forma = (p) => (["golpe", "choque", "sigue"].includes(p.fase) ? OSO34 : null);
  HD_XITIN_NUEVA2.arma = (px, p) => {
    armaXitin(px, p);
    if (p.fase === "impulso") {
      const [sx, sy] = HD_XITIN_NUEVA2.brazoCerca.hombro;
      hdCarga(px, p.mano[0] + 2, p.mano[1] + 1, p.k, "#86EFAC", "rgba(74,222,128,.45)", p.t);
      hdCarga(px, sx - 1, sy + 9, p.k, "#86EFAC", "rgba(74,222,128,.45)", p.t + 200);
    }
  };
  HD_XITIN_NUEVA2.proyectil = (g, x, y, p) => {
    // ¡puf! al final de la carga y al empezar el ataque; el resto (zarpazo, volver) igual que antes
    if (p.fase === "impulso") { if (p.k > 0.55) proyXitin(g, x, y, { ...p, k: ((p.k - 0.55) / 0.45) * 0.4 }); return; }
    if (p.fase === "golpe" && p.k < 0.4) proyXitin(g, x, y, { ...p, fase: "impulso", k: 0.4 + p.k * 0.5 });
    proyXitin(g, x, y, p);
  };
}

/* July: al pegar, el martillo gigante levanta una lluvia de chispas que saltan y caen. */
HD_JULY34.proyectil = (g, x, y, p) => {
  if (p.fase !== "choque" && !(p.fase === "golpe" && p.k > 0.85)) return;
  const a = anguloJuly(p); if (a === null) return;
  const baja = (p.bob || 0) + (p.agacha || 0), inc = p.inclina || 0;
  const hx = 18 + Math.round(Math.cos(a) * 7), hy = 18 + Math.round(Math.sin(a) * 7);
  const cx = x + HD_OX + inc + hx + 1 + Math.cos(a) * 12, cy = y + HD_OY + baja + hy + Math.sin(a) * 12;
  const k = p.fase === "choque" ? p.k : 0;
  if (k < 0.25) {   // destello al contacto
    const r = 5 - k * 12; g.fillStyle = "#FFFFFF"; g.fillRect(Math.round(cx - r), Math.round(cy), Math.round(2 * r + 1), 1); g.fillRect(Math.round(cx), Math.round(cy - r), 1, Math.round(2 * r + 1));
    g.fillStyle = "#FDE68A"; g.fillRect(Math.round(cx - 1), Math.round(cy - 1), 3, 3);
  }
  const cols = ["#FFFFFF", "#FDE68A", "#FBBF24", "#F97316"];
  for (let i = 0; i < 28; i++) {
    const ang = -Math.PI * 1.05 + (i / 27) * Math.PI * 1.1 + ((i * 37) % 10 - 5) / 25, vel = 12 + ((i * 53) % 13);
    const sx = cx + Math.cos(ang) * vel * (0.35 + k * 1.1), sy = cy + Math.sin(ang) * vel * (0.35 + k * 1.1) + k * k * 14;
    if (k > 0.75 && i % 3 === 0) continue;   // algunas se apagan antes
    g.fillStyle = cols[(i + Math.floor(k * 4)) % 4];
    g.fillRect(Math.round(sx), Math.round(sy), i % 4 === 0 ? 2 : 1, i % 4 === 0 ? 2 : 1);
  }
};

/* Latte: naipes cargados de energía magenta, como Gambito. Brillan y chisporrotean al tomar impulso,
   vuelan encendidos con estela y estallan en chispas rosadas al llegar. */
{
  const armaLatte = HD_LATTE34.arma, proyLatte = HD_LATTE34.proyectil;
  const brillo = (px, cx, cy, r, t, fuerza) => {
    for (let dy = -r; dy <= r; dy++) for (let dx = -r - 2; dx <= r + 2; dx++) {
      const d = Math.hypot(dx / 1.3, dy); if (d > r) continue;
      px(cx + dx, cy + dy, d < r * 0.5 ? `rgba(253,224,240,${0.35 + fuerza * 0.3})` : `rgba(244,114,182,${0.2 + fuerza * 0.25})`);
    }
    for (let i = 0; i < 6; i++) { const ang = i * 1.05 + t / 70, dd = r + 1 + ((i + Math.floor(t / 60)) % 2); px(Math.round(cx + Math.cos(ang) * dd * 1.3), Math.round(cy + Math.sin(ang) * dd), i % 2 ? "#F9A8D4" : "#FFFFFF"); }
  };
  HD_LATTE34.arma = (px, p) => {
    if (p.fase === "impulso") brillo(px, p.mano[0] + 1, p.mano[1] - 6, 4 + Math.round(p.k * 2), p.t, p.k);   // detrás de los naipes
    armaLatte(px, p);
    if (p.fase === "impulso" || p.fase === "guardia") {
      const k = p.fase === "impulso" ? p.k : 0.15 + 0.1 * Math.sin(p.t / 200);   // en guardia, un brillo suave constante
      for (let y = -9; y <= -3; y++) for (let x = -4; x <= 7; x++) if ((x + y + Math.floor(p.t / 90)) % 7 === 0) px(p.mano[0] + x, p.mano[1] + y, `rgba(249,168,212,${0.4 + k * 0.5})`);
    }
  };
  HD_LATTE34.proyectil = (g, x, y, p) => {
    if (p.fase !== "golpe" && p.fase !== "choque") return;
    const avance = p.fase === "golpe" ? p.k : 1;
    [[0, -1], [-6, 3]].forEach(([atras, dy], i) => {
      const cx = Math.round(x + HD_OX + 30 + atras + avance * 18), cy = y + HD_OY + 18 + dy;
      for (let s = 1; s <= 4; s++) { g.fillStyle = `rgba(244,114,182,${0.5 - s * 0.1})`; g.fillRect(cx - s * 3, cy + 1, 3, 2); }   // estela
      g.fillStyle = "rgba(244,114,182,.5)"; g.fillRect(cx - 2, cy - 2, 10, 8); g.fillStyle = "rgba(253,224,240,.45)"; g.fillRect(cx - 1, cy - 1, 8, 6);   // halo
      if (p.fase === "choque" && i === 0) {   // estallido rosado
        const r = 2 + p.k * 7;
        for (let n = 0; n < 12; n++) { const a = n * 0.524; g.fillStyle = n % 2 ? "#F9A8D4" : "#FFFFFF"; g.fillRect(Math.round(cx + 3 + Math.cos(a) * r), Math.round(cy + 2 + Math.sin(a) * r), 1, 1); }
        if (p.k < 0.4) { g.fillStyle = "#FDF4FF"; g.fillRect(cx + 1, cy, 5, 4); }
      }
    });
    proyLatte(g, x, y, p);
  };
}

/* Malala: el hechizo de la escoba es una estela de estrellitas verde agua que avanza ondulando
   y estalla en estrellas y humo verde al llegar. */
const estrellita = (g, cx, cy, r, c) => { g.fillStyle = c; g.fillRect(cx - r, cy, 2 * r + 1, 1); g.fillRect(cx, cy - r, 1, 2 * r + 1); g.fillStyle = "#FFFFFF"; g.fillRect(cx, cy, 1, 1); };
HD_MALALA34.proyectil = (g, x, y, p) => {
  if (p.fase !== "golpe" && p.fase !== "choque") return;
  const x0 = x + HD_OX + 32, y0 = y + HD_OY + 20, pos = (k) => [Math.round(x0 + k * 38), Math.round(y0 + Math.sin(k * Math.PI * 3) * 3)];
  if (p.fase === "golpe") {
    for (let j = 5; j >= 1; j--) { const k = p.k - j * 0.07; if (k < 0) continue; const [cx, cy] = pos(k); estrellita(g, cx, cy, j > 3 ? 0 : 1, j % 2 ? "#5EEAD4" : "#A7F3D0"); }
    const [cx, cy] = pos(p.k);
    g.fillStyle = "rgba(94,234,212,.4)"; g.fillRect(cx - 3, cy - 3, 7, 7);
    estrellita(g, cx, cy, 3, "#99F6E4");
  } else {
    const [cx, cy] = pos(1), r = 2 + p.k * 9;
    g.fillStyle = `rgba(74,222,128,${0.45 - p.k * 0.35})`;
    for (let dy = -6; dy <= 6; dy++) for (let dx = -6; dx <= 6; dx++) if (Math.hypot(dx, dy) < 3 + p.k * 4) g.fillRect(cx + dx, cy + dy - Math.round(p.k * 3), 1, 1);
    for (let n = 0; n < 8; n++) { const a = n * 0.785 + 0.3; estrellita(g, Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r), n % 2 ? 1 : 0, n % 2 ? "#5EEAD4" : "#FDE68A"); }
  }
};
HD_MALALA34.choque = [72, 20];

/* Al ganar Malala, el rival no se desarma: se convierte en sapo (vista previa; se integra en la escena de Kachai). */
const sapoMalala = (g, x0, y0, t) => {
  const pal = { K: HDK, G: "#4ADE80", g: "#16A34A", Y: "#FDE68A", W: "#FFFFFF", P: "#F472B6" };
  const parpadea = Math.floor(t / 150) % 18 === 0;
  [".KK...KK.", "KWWK.KWWK", parpadea ? "KKKKGKKKK" : "KWKGGGKWK", "KGGGGGGGGK", "KGGPPPPGGK", "KgGGGGGGgK", "KgGYYYYGgK", ".KgKKKKgK.", "KgK....KgK"].forEach((f, y) => [...f].forEach((k, x) => { if (pal[k]) { g.fillStyle = pal[k]; g.fillRect(x0 + x, y0 + y, 1, 1); } }));
};

/* Latte al ganar (podio): lanza seis naipes hacia arriba, tres con cada mano, y estallan como fuegos artificiales. */
{
  const armaL = HD_LATTE34.arma, proyL = HD_LATTE34.proyectil;
  HD_LATTE34.arma = (px, p) => { if ((p.fase === "sube" || p.fase === "alto") && !p.duelo) return; armaL(px, p); };   // los naipes ya van por el aire
  HD_LATTE34.proyectil = (g, x, y, p) => {
    if ((p.fase !== "sube" && p.fase !== "alto") || p.duelo) return proyL(g, x, y, p);
    const T = p.t % 2600;
    /* Seis naipes: tres desde la mano derecha (hacia ese lado) y tres desde la izquierda, intercalados. */
    const derecha = [x + HD_OX + 25, y + HD_OY + 11], izquierda = [x + HD_OX + 5, y + HD_OY + 10];
    const naipes = [[derecha, 0, 2, "#F472B6"], [izquierda, 0, 1, "#60A5FA"], [derecha, 9, -1, "#FBBF24"], [izquierda, -8, -2, "#4ADE80"], [derecha, 17, 1, "#FFFFFF"], [izquierda, -15, 2, "#F97316"]];
    naipes.forEach(([[hx, hy], dx, dy, col], i) => {
      const sale = 450 + i * 70, estalla = sale + 380;
      if (T < sale) return;
      const ex = hx + dx, ey = y + 9 + dy;   // a una altura donde el estallido entero cabe en la pantalla
      if (T < estalla) {   // el naipe sube girando
        const k = (T - sale) / (estalla - sale), cx = Math.round(hx + dx * k), cy = Math.round(hy + (ey - hy) * k), gira = Math.floor(T / 70) % 2;
        g.fillStyle = HDK; g.fillRect(cx - 2, cy - 2, gira ? 6 : 4, gira ? 4 : 6);
        g.fillStyle = "#F8F5EE"; g.fillRect(cx - 1, cy - 1, gira ? 4 : 2, gira ? 2 : 4);
        g.fillStyle = "rgba(244,114,182,.6)"; g.fillRect(cx - 1, cy + 3, 2, 3);   // estela rosada
        return;
      }
      const k = Math.min(1, (T - estalla) / 900);   // el estallido se abre y las chispas caen
      if (k >= 1) return;
      for (let n = 0; n < 14; n++) {
        const a = (n / 14) * Math.PI * 2, r = 2 + k * 11;
        const sx = Math.round(ex + Math.cos(a) * r), sy = Math.round(ey + Math.sin(a) * r + k * k * 6);
        g.fillStyle = k > 0.7 && n % 2 ? "rgba(255,255,255,.5)" : n % 3 === 0 ? "#FFFFFF" : col;
        g.fillRect(sx, sy, 1, 1);
        if (k < 0.5) { g.fillStyle = col; g.fillRect(Math.round(ex + Math.cos(a) * r * 0.6), Math.round(ey + Math.sin(a) * r * 0.6), 1, 1); }
      }
      if (k < 0.15) { g.fillStyle = "#FFFFFF"; g.fillRect(ex - 1, ey - 1, 3, 3); }
    });
  };
}

/* Al ganar Janet: su flecha atraviesa el arma del rival y la deja clavada en el borde derecho de la pantalla
   (vista previa; se integra en la escena de victoria de Kachai). */
const flechaJanet = (g, x0, y0, largo) => {
  g.fillStyle = HDK; g.fillRect(x0 - 1, y0 - 1, largo + 3, 3);
  g.fillStyle = "#B07A44"; g.fillRect(x0 + 2, y0, largo - 4, 1);
  g.fillStyle = "#4ADE80"; g.fillRect(x0, y0 - 1, 2, 3);
  g.fillStyle = "#D9DEE6"; g.fillRect(x0 + largo - 2, y0 - 1, 1, 3); g.fillRect(x0 + largo - 1, y0, 1, 1);
};

/* Al ganar Jelic: el rival queda mareado con pajaritos y estrellitas girando sobre la cabeza (para la escena de Kachai). */
const pajaritos = (g, cx, cy, t) => {   // modo groggy: estrellas amarillas girando sobre la cabeza
  const forma = [[0, -2], [-2, -1], [-1, -1], [0, -1], [1, -1], [2, -1], [-1, 0], [0, 0], [1, 0], [-1, 1], [1, 1], [-2, 2], [2, 2]];   // estrella de cinco puntas
  for (let i = 0; i < 4; i++) {
    const a = t / 260 + (i * Math.PI) / 2, x = Math.round(cx + Math.cos(a) * 8), y = Math.round(cy + Math.sin(a) * 2.5);
    const chica = Math.sin(a) < 0;   // las de atrás se ven un poco más chicas
    const pts = chica ? [[0, -1], [-1, 0], [0, 0], [1, 0], [0, 1]] : forma;
    pts.forEach(([dx, dy]) => { g.fillStyle = HDK; g.fillRect(x + dx - 1, y + dy - 1, 3, 3); });
    pts.forEach(([dx, dy]) => { g.fillStyle = dx === 0 && dy === 0 ? "#FFFFFF" : "#FDE047"; g.fillRect(x + dx, y + dy, 1, 1); });
  }
};

/* Al ganar Agattita: el rival queda atrapado por enredaderas y le brota una flor de la cabeza (para la escena de Kachai).
   cx: centro del rival; arriba/abajo: alto del cuerpo envuelto; prog 0..1 cuánto subieron las enredaderas. */
const enredaRival = (g, cx, arriba, abajo, prog) => {
  const alto = Math.round((abajo - arriba) * prog);
  for (let v = 0; v < 2; v++) {
    const pts = [];
    for (let i = 0; i <= alto; i++) pts.push([Math.round(cx + Math.sin(i / 3.2 + v * Math.PI) * 9), abajo - i]);
    pts.forEach(([xx, yy]) => { g.fillStyle = "#14532D"; g.fillRect(xx - 1, yy - 1, 4, 3); });
    pts.forEach(([xx, yy], i) => { g.fillStyle = i % 4 ? "#22C55E" : "#4ADE80"; g.fillRect(xx, yy, 2, 1); });
    pts.forEach(([xx, yy], i) => { if (i % 6 === 3) { const lx = xx + (v ? -3 : 3); g.fillStyle = "#14532D"; g.fillRect(lx - 1, yy - 2, 4, 3); g.fillStyle = "#86EFAC"; g.fillRect(lx, yy - 1, 2, 1); } });   // hojitas
  }
};
/* Flor rosada con centro amarillo que brota de la cabeza, con su tallito. */
const florCabeza = (g, x, y) => {
  g.fillStyle = "#14532D"; g.fillRect(x - 1, y + 3, 3, 5); g.fillStyle = "#22C55E"; g.fillRect(x, y + 3, 1, 5); g.fillRect(x + 1, y + 5, 2, 1);
  const petalos = [[0, -3], [-3, 0], [3, 0], [0, 3], [-2, -2], [2, -2], [-2, 2], [2, 2]];
  petalos.forEach(([a, b]) => { g.fillStyle = HDK; g.fillRect(x + a - 1, y + b - 1, 3, 3); });
  petalos.forEach(([a, b], n) => { g.fillStyle = n < 4 ? "#F472B6" : "#F9A8D4"; g.fillRect(x + a, y + b, 1, 1); g.fillRect(x + Math.round(a / 2), y + Math.round(b / 2), 1, 1); });
  g.fillStyle = "#FDE047"; g.fillRect(x - 1, y - 1, 3, 3); g.fillStyle = "#FEF9C3"; g.fillRect(x, y - 1, 1, 1);
};

/* Agattita al ganar: brotan flores de colores a su alrededor, una tras otra, y se mecen. */
{
  const proyA = HD_AGATTITA34.proyectil;
  const COLORES = [["#F472B6", "#FBCFE8"], ["#FDE047", "#FEF9C3"], ["#A78BFA", "#DDD6FE"], ["#FB923C", "#FED7AA"], ["#60A5FA", "#BFDBFE"], ["#F87171", "#FECACA"], ["#FFFFFF", "#E5E7EB"]];
  const SITIOS = [[-3, 7], [3, 5], [9, 3], [27, 4], [33, 6], [39, 8], [45, 5]];   // x respecto del cuerpo, alto del tallo
  HD_AGATTITA34.proyectil = (g, x, y, p) => {
    if ((p.fase !== "sube" && p.fase !== "alto") || p.duelo) return proyA(g, x, y, p);
    const T = p.t % 2600, suelo = y + HD_OY + 39;
    (p.enPodio ? [[1, 6], [6, 4], [24, 4], [29, 6]] : SITIOS).forEach(([sx, alto], i) => {
      const k = Math.min(1, Math.max(0, (T - 400 - i * 90) / 320)); if (k <= 0) return;
      const mece = Math.round(Math.sin(p.t / 300 + i) * (k >= 1 ? 1 : 0));
      const bx = x + HD_OX + sx, h = Math.max(1, Math.round(alto * k)), tx = bx + mece, ty = suelo - 1 - h;
      for (let n = 0; n < h; n++) { g.fillStyle = "#14532D"; g.fillRect(bx - 1 + (n === h - 1 ? mece : 0), suelo - 1 - n, 3, 1); }
      for (let n = 0; n < h; n++) { g.fillStyle = "#22C55E"; g.fillRect(bx + (n === h - 1 ? mece : 0), suelo - 1 - n, 1, 1); }
      if (h > 3) { g.fillStyle = "#4ADE80"; g.fillRect(bx + (i % 2 ? 1 : -2), suelo - 3, 2, 1); }   // hojita
      if (k < 0.5) return;   // primero el tallo, después se abre la flor
      const [c1, c2] = COLORES[i % COLORES.length], abre = k < 0.8 ? 1 : 2;
      const pet = abre === 1 ? [[0, -1], [-1, 0], [1, 0], [0, 1]] : [[0, -2], [-2, 0], [2, 0], [0, 2], [-1, -1], [1, -1], [-1, 1], [1, 1]];
      pet.forEach(([a, b]) => { g.fillStyle = HDK; g.fillRect(tx + a - 1, ty + b - 1, 3, 3); });
      pet.forEach(([a, b], n) => { g.fillStyle = n < 4 ? c1 : c2; g.fillRect(tx + a, ty + b, 1, 1); if (abre === 2 && n < 4) g.fillRect(tx + a / 2, ty + b / 2, 1, 1); });
      g.fillStyle = i % 2 ? "#FDE047" : "#FFFFFF"; g.fillRect(tx, ty, 1, 1);
    });
  };
}

/* Uchis al ganar: lanza las dos dagas al aire, giran y caen clavadas de punta en el suelo, una a cada lado. */
{
  const armaU = HD_UCHIS34.arma, proyU = HD_UCHIS34.proyectil;
  const clavada = (g, x, suelo) => {   // daga vertical con la punta enterrada
    const pts = [[0, -9, "#6E4424"], [0, -8, "#6E4424"], [-1, -7, "#C9A24B"], [0, -7, "#C9A24B"], [1, -7, "#C9A24B"], [0, -6, "#FFFFFF"], [0, -5, "#D9DEE6"], [0, -4, "#D9DEE6"], [0, -3, "#D9DEE6"], [0, -2, "#9AA3B0"], [1, -6, "#9AA3B0"], [1, -5, "#9AA3B0"], [1, -4, "#9AA3B0"]];
    const llenos = new Set(pts.map(([a, b]) => a + "," + b));
    g.fillStyle = HDK; pts.forEach(([a, b]) => [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { if (!llenos.has(a + dx + "," + (b + dy)) && b + dy < 0) g.fillRect(x + a + dx, suelo + b + dy, 1, 1); }));
    pts.forEach(([a, b, c]) => { g.fillStyle = c; g.fillRect(x + a, suelo + b, 1, 1); });
    g.fillStyle = "rgba(60,40,20,.5)"; g.fillRect(x - 1, suelo - 1, 3, 1);   // tierra removida
  };
  HD_UCHIS34.arma = (px, p) => { if ((p.fase === "sube" || p.fase === "alto") && p.t % 2600 >= 450 && !p.duelo) return; armaU(px, p); };
  /* Desarmada: sus dos dagas de ahora (puntiagudas), una al lado de la otra, no la versión antigua de perfil. */
  HD_UCHIS34.armaSuelta = (px) => { dagaUchis(px, -1, -1); dagaUchis(px, 4, -1); };
  HD_UCHIS34.proyectil = (g, x, y, p) => {
    if ((p.fase !== "sube" && p.fase !== "alto") || p.duelo) return proyU(g, x, y, p);
    const T = p.t % 2600, suelo = y + HD_OY + 39 + 1;
    [[x + HD_OX + 3, y + HD_OY + 9, x + HD_OX + (p.enPodio ? 1 : -5)], [x + HD_OX + 25, y + HD_OY + 11, x + HD_OX + (p.enPodio ? 29 : 35)]].forEach(([sx, sy, ex], i) => {
      const sale = 450 + i * 60, cae = sale + 750;
      if (T < sale) return;
      if (T >= cae) { clavada(g, ex, suelo); return; }
      const k = (T - sale) / (cae - sale), cx = Math.round(sx + (ex - sx) * k), cy = Math.round(sy + (suelo - 6 - sy) * k - Math.sin(Math.PI * k) * 22);
      if (k > 0.85) { clavada(g, cx, Math.round(cy + 6)); return; }   // al final cae ya de punta
      dagaVuelo(g, cx - 3, cy, Math.floor(T / 70) % 2 === 1);
    });
  };
}

/* Agattita al celebrar: la punta del bastón brilla y suelta chispitas que caen hacia las flores (de ahí brotan). */
{
  const armaA = HD_AGATTITA34.arma;
  HD_AGATTITA34.arma = (px, p) => {
    armaA(px, p);
    if ((p.fase !== "sube" && p.fase !== "alto") || p.duelo) return;
    const cx = p.mano[0] + 4, cy = p.mano[1] - 16, pulso = 0.6 + 0.4 * Math.sin(p.t / 150);
    hdCarga(px, cx, cy, pulso, "#86EFAC", "rgba(74,222,128,.45)", p.t);
    for (let i = 0; i < 6; i++) {   // chispitas que bajan del bastón hacia el suelo, a los dos lados
      const k = ((p.t / 900 + i / 6) % 1), lado = i % 2 ? 1 : -1;
      px(Math.round(cx + lado * (4 + k * 18) * (0.5 + (i % 3) * 0.25)), Math.round(cy + k * 34), i % 3 ? "#86EFAC" : "#FFFFFF");
    }
  };
}

/* Edith al celebrar: flota en el aire y el grimorio lanza rayitos y chispas por todas partes. */
HD_EDITH34.ajustePose = (p) => {
  if (p.fase !== "sube" && p.fase !== "alto") return p;
  const sube = p.fase === "sube" ? 3 : 6;
  return { ...p, agacha: 0, bob: -sube - Math.round(Math.sin(p.t / 300) * 1.5) };
};
{
  const proyE = HD_EDITH34.proyectil;
  HD_EDITH34.proyectil = (g, x, y, p) => {
    if ((p.fase !== "sube" && p.fase !== "alto") || p.duelo) return proyE(g, x, y, p);
    const bx = x + HD_OX + 28, by = y + HD_OY + (p.fase === "alto" ? 4 : 13) + (p.bob || 0) + (p.agacha || 0), f = Math.floor(p.t / 90);   // desde donde está el libro
    for (let i = 0; i < 6; i++) {   // rayitos en zigzag hacia todos lados, cambian cada pocos cuadros
      if ((i + f) % 3 === 0) continue;
      const ang = -2.8 + i * 0.55 + ((f % 5) - 2) * 0.08, largo = 9 + ((i * 7 + f) % 6);   // solo hacia arriba y a los lados, lejos de su cara
      let px0 = bx, py0 = by;
      for (let s = 1; s <= 3; s++) {
        const px1 = Math.round(bx + Math.cos(ang) * largo * s / 3 + ((s + i + f) % 2 ? 2 : -2) * Math.sin(ang)), py1 = Math.round(by + Math.sin(ang) * largo * s / 3 - ((s + i + f) % 2 ? 2 : -2) * Math.cos(ang));
        [[2, "#7C3AED"], [1, "#F5F3FF"]].forEach(([gr, col]) => { g.fillStyle = col; hdLinea(px0, py0, px1, py1, (a, b) => g.fillRect(a - (gr >> 1), b - (gr >> 1), gr, gr)); });
        px0 = px1; py0 = py1;
      }
    }
    for (let i = 0; i < 10; i++) {   // chispas de celebración por doquier
      const sx = x + 4 + ((i * 23 + f * 3) % 70), sy = y + 2 + ((i * 17 + f * 2) % 40);
      g.fillStyle = i % 3 === 0 ? "#FFFFFF" : i % 3 === 1 ? "#C4B5FD" : "#F0ABFC";
      g.fillRect(sx, sy, 1, 1); if (i % 4 === 0) { g.fillRect(sx - 1, sy, 3, 1); g.fillRect(sx, sy - 1, 1, 3); }
    }
  };
}

/* Jelic: la capa pegada a la espalda (el torso en tres cuartos empieza más a la derecha que el de perfil). */
HD_JELIC34.capa = HD_JELIC.capa.map((fr) => Object.fromEntries(Object.entries(fr).map(([k, v]) => [k, ".." + v])));

/* Jelic: brazos de armadura un poco más gruesos, con hombreras proporcionadas. */
HD_JELIC34.brazoGrueso = 3;

/* Jelic en el podio: se sube a su escudo como tabla de surf y se mece sobre ella como si corriera una ola (en los duelos celebra como siempre). */
{
  const pal = HD_JELIC.pal, X0 = 7;   // la tabla centrada bajo el cuerpo de Jelic
  const mod = (a, n) => ((a % n) + n) % n;
  /* El escudo acostado: la base atrás, la punta adelante y la franja roja a lo largo. Se mece entero como una mecedora:
     con inclina > 0 sube la punta y baja la base (y al revés), sin doblarse. */
  const meceTabla = (inclina, x) => -Math.round(inclina * (x - X0 - 8) / 8);   // cuánto sube cada columna respecto del centro
  const BUHO_TABLA = [["#8C3F5D", "#BA6156", "#BA6156", "#BA6156", "#8C3F5D"], ["#BA6156", "#FFE478", "#BA6156", "#FFE478", "#BA6156"], ["#BA6156", "#BA6156", "#F2A65E", "#BA6156", "#BA6156"]];
  const tablaSurf = (px, cy, inclina) => {
    const pts = [];
    for (let i = 0; i < 17; i++) {
      const w = i < 9 ? 5 : Math.max(0, Math.round(5 * (16 - i) / 8)), v = Math.round(w * 0.4), dy = meceTabla(inclina, X0 + i);
      for (let y = cy - v; y <= cy + v + 1; y++) {
        const canto = y === cy + v + 1, borde = y === cy - v || i === 0;
        const buho = i >= 4 && i <= 8 && y >= cy - 1 && y <= cy + 1 ? BUHO_TABLA[y - cy + 1][i - 4] : null;   // el búho del escudo, visto en la tabla
        pts.push([X0 + i, y + dy, canto ? pal.m : borde ? pal.L : buho || (y < cy ? pal.Q : pal.A)]);
      }
    }
    hdContorno(px, pts);
  };
  HD_JELIC34.retoque = (p) => {
    if (!p.enPodio) return null;
    const t = p.t || 0, s = Math.sin(t / 1400 * 2 * Math.PI), mece = Math.round(s * 2);   // la punta sube y la base baja, y al revés
    const bob = -9, cy = 42 + bob, flexa = 3 + Math.round(Math.cos(t / 700 * 2 * Math.PI)), cerca = [[-7, 2 + Math.round(s * 2)], [-4, 1]];
    const c = { ...HD_JELIC34, retoque: undefined, arma: undefined,
      brazoCerca: { ...HD_JELIC34.brazoCerca, poses: { guardia: cerca, sube: cerca, alto: cerca } },
      atras: (px, q) => {
        const baja = (q.bob || 0) + (q.agacha || 0);
        tablaSurf((a, b, col) => px(a - (q.inclina || 0), b - baja, col), cy, mece);   // la tabla se mece sobre el escalón, el extremo que baja lo toca
      } };
    return { c, p: { ...p, corrX: -2, mano: [28, 22 - Math.round(s * 2)], bob, agacha: flexa, inclina: Math.round(s), pies: [[9, 39 + meceTabla(mece, 9)], [18, 39 + meceTabla(mece, 18)]], capa: mod(Math.floor(t / 110), 3), pelo: mod(Math.floor(t / 140), 2) } };
  };
}

/* Agattita: agarra el bastón con la mano encima del palo y más cerca del cuerpo (como Malala con la escoba). */
HD_AGATTITA34.manoEncima = true;
HD_AGATTITA34.manos = { guardia: [24, 25], impulso: [24, 18], golpe: [24, 9], choque: [24, 8], sigue: [24, 10], sube: [24, 14], alto: [24, 6] };

/* Uzu en tres cuartos de verdad: oreja de cerca grande y la de atrás más chica, ojo de atrás angosto,
   nariz de goblin asomando hacia el rival y la sonrisa de dientes corrida hacia ese lado. */
HD_UZU34.cuerpo = HD_UZU34.cuerpo.map((f, i) => ({ 10: "...........KBBBBBBBBBK", 11: "..........KBBbBBBBBBBBK", 12: "..KK....KBBbBBBBBBBBBBBK...KK", 13: ".KGgKK..KBBBBBBBBBBBBBBK..KGgK", 14: ".KGGgGKKGGGGGGGGGGGGGGGKKGGgK", 15: "..KGGgGKGGGRRKGGGGRKGGGKKGgK", 16: "...KKGgKGGGRRKGGGGRKGGGGK", 17: ".....KKKGGGGGGGGGGgGGGGGK", 18: "........KGGKWKWKWKWKWKGK", 19: ".........KGGGKKKKKKKKGGK", 20: "..........KKGGGGGGGGKK" }[i] || f));
HD_UZU34.pelo = [ { 12: "..KK" + ".".repeat(23) + "KK" }, { 12: ".KK" + ".".repeat(25) + "KK" } ];   // las dos orejas se mecen; la de atrás más delgada   // la oreja de atrás también se mece, más corta

/* Uzu: púas centradas sobre la cúpula redondeada del casco. */
HD_UZU34.cuerpo = HD_UZU34.cuerpo.map((f, i) => (i === 8 ? ".............K..K..K" : i === 9 ? "............KMKKMKKMK" : f));

/* Personaje en tres cuartos por id. */
/* Malía en el podio: pasa el dedo por el cucharón, se lo lleva a la boca con mermelada, cierra los ojos de gusto y le salen
   estrellitas (como en los programas de cocina);
   después levanta el cucharón como Excalibur y baja un rayo de luz dorada. Se queda así hasta que termina la escena. */
{
  const momento = (T) => (T < 400 ? "guardia" : T < 2100 ? "prueba" : T < 2500 ? "alza" : "excalibur");
  const HOMBRO = HD_MALIA34.brazoCerca.hombro, mezcla = (a, b, k) => [Math.round(a[0] + (b[0] - a[0]) * k), Math.round(a[1] + (b[1] - a[1]) * k)];
  /* Dónde va la mano libre: del costado al cucharón, lo recorre con el dedo y sube a la boca. */
  const manoLibre = (T) => {
    const reposo = [HOMBRO[0] - 1, HOMBRO[1] + 7], borde = [18, 18], otroBorde = [21, 17], boca = [14, 13];   // el cucharón a la altura del pecho, cerca del cuerpo
    if (T < 800) return mezcla(reposo, borde, (T - 400) / 400);
    if (T < 1100) return mezcla(borde, otroBorde, (T - 800) / 300);
    if (T < 1500) return mezcla(otroBorde, boca, (T - 1100) / 400);
    return boca;
  };
  HD_MALIA34.retoque = (p, c) => {
    if (!p.enPodio) return null;
    const T = Math.max(0, p.t || 0), m = momento(T);
    if (m === "guardia") return null;
    if (m === "prueba") {   // sostiene el cucharón a su lado; la otra mano prueba la mermelada
      const cierra = (i, x) => (x === 12 || x === 13 || x === 16 || x === 17) && (i === 9 || i === 10);   // ojos cerrados: queda la rayita de abajo
      const cuerpo = T >= 1500 ? c.cuerpo.map((f, i) => [...f].map((k, x) => (cierra(i, x) ? (i === 10 ? "K" : "S") : k)).join("")) : c.cuerpo;
      const [hx, hy] = manoLibre(T), mano = [hx - HOMBRO[0], hy - HOMBRO[1]], codo = [Math.round(mano[0] / 2) - 3, Math.max(2, Math.round(mano[1] / 2) + 3)];
      const arma = (px, q) => c.arma(px, { ...q, mano: [q.mano[0] - 1, q.mano[1] + 8] });   // lo toma de la mitad del mango, a la altura de la cadera
      return { c: { ...c, retoque: undefined, cuerpo, arma, brazoCerca: { ...c.brazoCerca, poses: { sube: [mano, codo] } } }, p: { ...p, fase: "sube", mano: [19, 27], bob: 0, agacha: 0 } };
    }
    const brilla = m === "excalibur" ? Math.floor(T / 400) % 2 : 0;   // en alto, con un leve vaivén de orgullo
    return { c: { ...c, retoque: undefined, brazoCerca: { ...c.brazoCerca, poses: {}, todas: [[12, -3], [5, 2]] } }, p: { ...p, fase: "alto", mano: [24, m === "alza" ? 20 : 16], bob: -brilla, agacha: 0 } };
  };
  const estrellita4 = (g, cx, cy, r, col) => { g.fillStyle = col; g.fillRect(cx - r, cy, 2 * r + 1, 1); g.fillRect(cx, cy - r, 1, 2 * r + 1); g.fillStyle = "#FFFFFF"; g.fillRect(cx, cy, 1, 1); };
  const proyMalia = HD_MALIA34.proyectil;
  HD_MALIA34.proyectil = (g, x, y, p) => {
    if (!p.enPodio) return proyMalia(g, x, y, p);
    const T = Math.max(0, p.t || 0), f = Math.floor(T / 120), ox = x + HD_OX, oy = y + HD_OY;
    if (T >= 700 && T < 2100) {   // la mano libre por delante del cucharón; desde que lo recorre, el dedo queda con mermelada
      const [hx, hy] = manoLibre(T), pts = [];
      for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) pts.push([hx + i, hy + j, i === -1 || j === -1 ? "#F5CABF" : "#EBB2A6"]);
      hdContorno((a, b, col) => { g.fillStyle = col; g.fillRect(ox + a, oy + b, 1, 1); }, pts);
      if (T >= 900) {   // un buen pegote de mermelada en los dedos, con borde y una gota colgando: se ve hasta en la boca
        const pegote = [[-1, -2], [0, -2], [1, -2], [2, -2], [0, -1], [1, -1], [2, -1], [2, 0], [2, 1]];
        pegote.forEach(([a, b]) => { g.fillStyle = HDK; g.fillRect(ox + hx + a, oy + hy + b - 1, 1, 1); g.fillRect(ox + hx + a + 1, oy + hy + b, 1, 1); });
        pegote.forEach(([a, b]) => { g.fillStyle = "#F0407A"; g.fillRect(ox + hx + a, oy + hy + b, 1, 1); });
        g.fillStyle = "#FFD0DE"; g.fillRect(ox + hx, oy + hy - 2, 1, 1); g.fillStyle = "#C81E5A"; g.fillRect(ox + hx + 2, oy + hy + 1, 1, 1);
      }
    }
    if (T >= 1500 && T < 2100) [[5, 3], [23, 5], [3, 12], [24, 15], [14, 0]].forEach(([a, b], i) => { if ((f + i) % 3) estrellita4(g, ox + a, oy + b, (f + i) % 2 ? 2 : 1, i % 2 ? "#FDE047" : "#FBBF24"); });
    if (T < 2500) return;
    const bx = ox + 25, by = oy + (p.bob || 0) - 2;   // el cucharón en alto: la luz baja del cielo hasta él
    for (let i = 0; i < 8; i++) {   // rayos de luz alrededor del cucharón, como una espada legendaria
      const a = i * Math.PI / 4 + (f % 2) * 0.2, r0 = 7, r1 = 10 + ((i + f) % 2) * 2;
      for (let r = r0; r <= r1; r++) { g.fillStyle = r === r1 ? "rgba(255,251,220,.8)" : "rgba(253,224,71,.6)"; g.fillRect(Math.round(bx + Math.cos(a) * r), Math.round(by + 4 + Math.sin(a) * r), 1, 1); }
    }
    for (let yy = 0; yy < by - 4; yy++) {
      const w = 2 + Math.round((yy / Math.max(1, by)) * 2) + (f % 2);
      g.fillStyle = "rgba(253,224,71,.28)"; g.fillRect(bx - w, yy, 2 * w + 1, 1);
      g.fillStyle = "rgba(255,251,220,.45)"; g.fillRect(bx - 1, yy, 3, 1);
    }
    for (let i = 0; i < 6; i++) {   // destellos que bajan por el rayo y giran alrededor del cucharón
      const k = ((T / 900 + i / 6) % 1), sx = bx + Math.round(Math.sin(i * 2.1 + T / 300) * 3), sy = Math.round(k * (by - 6));
      g.fillStyle = i % 2 ? "#FFFFFF" : "#FDE68A"; g.fillRect(sx, sy, 1, 1);
    }
    [[-7, 1], [7, -1], [-5, -6], [6, 6]].forEach(([a, b], i) => { if ((f + i) % 2) estrellita4(g, bx + a, by + 4 + b, 1, "#FDE047"); });
  };
}
/* Malía: cara con más definición — ojos negros con párpado y un brillito blanco (miran hacia el rival), mejillas más suaves
   hacia afuera, la nariz como sombra entre los ojos y la boquita más marcada. */
{
  Object.assign(HD_MALIA34.pal = { ...HD_MALIA34.pal }, { P: "#F4A3AE", m: "#A9445A", Z: "#FFFFFF" });
  const marcas = [[11, 11, "S"], [11, 16, "S"], [11, 10, "P"], [11, 17, "P"], [11, 14, "s"], [13, 13, "m"], [13, 14, "m"],
    [9, 12, "K"], [9, 13, "K"], [9, 16, "K"], [9, 17, "K"], [10, 12, "K"], [10, 13, "Z"], [10, 16, "K"], [10, 17, "Z"]];
  const filas = HD_MALIA34.cuerpo.map((f) => [...f]);
  marcas.forEach(([y, x, k]) => { filas[y][x] = k; });
  HD_MALIA34.cuerpo = filas.map((f) => f.join(""));
}
/* Malía: una frutilla en el delantal, para que se entienda que su mermelada es de frutilla. */
{
  Object.assign(HD_MALIA34.pal = { ...HD_MALIA34.pal }, { R: "#E8304A", r: "#B01E36", T: "#FBE38A", G: "#3E9A42", g: "#2F7D32" });
  const frutilla = { 24: [13, "GgG"], 25: [12, "RRgRR"], 26: [12, "RTRRr"], 27: [12, "RRRTr"], 28: [13, "RTr"], 29: [14, "r"] };   // al centro del delantal
  const pinta = (f, [x0, txt]) => [...f].map((k, x) => (x >= x0 && x < x0 + txt.length ? txt[x - x0] : k)).join("");
  HD_MALIA34.cuerpo = HD_MALIA34.cuerpo.map((f, i) => (frutilla[i] ? pinta(f, frutilla[i]) : f));
  HD_MALIA34.falda = Object.fromEntries(Object.entries(HD_MALIA34.falda).map(([k, f]) => [k, frutilla[k] ? pinta(f, frutilla[k]) : f]));
  /* La pierna de adelante marcaba una raya negra en la última fila del delantal: esa fila se vuelve a pintar encima, con la falda. */
  HD_MALIA34.falda = { 27: HD_MALIA34.cuerpo[27], ...HD_MALIA34.falda };
}
/* Kenny en el podio: un solo de rockstar. Piernas abiertas, cabeza al ritmo, rasgueo rápido, notas disparadas,
   dos focos de colores y, cada tanto, un salto con chispas. */
{
  const BEAT = 260, mod = (a, n) => ((a % n) + n) % n;
  const salto = (T) => { const k = mod(T, 1800); return k >= 1400 && k < 1700 ? Math.round(Math.sin(Math.PI * (k - 1400) / 300) * 4) : 0; };
  HD_KENNY34.retoque = (p, c) => {
    if (!p.enPodio) return null;
    const T = Math.max(0, p.t || 0), golpe = Math.floor(T / BEAT) % 2, rasgueo = Math.floor(T / 110) % 2, cabeza = golpe;
    const cuerpo = c.cuerpo.map((f, i) => (i < cabeza ? "" : i <= 15 ? c.cuerpo[i - cabeza] : f));   // headbanging: la cabeza baja 1 px al ritmo
    const mano = rasgueo ? [[3, 6], [-2, 5]] : [[3, 8], [-2, 6]];
    const atras = (px, q) => {   // focos de colores que bajan cruzados desde arriba, por detrás de él
      const baja = (q.bob || 0) + (q.agacha || 0);
      [[-14, "rgba(244,114,182,.22)"], [44, "rgba(125,211,252,.22)"]].forEach(([fx, col], i) => {
        const mece = Math.sin(T / 700 + i * 2) * 4;
        for (let yy = -HD_OY - 8; yy < 40; yy++) { const k = (yy + HD_OY + 8) / (48 + HD_OY), cx = fx + (15 + mece - fx) * k, w = 1 + k * 7; for (let xx = Math.round(cx - w); xx <= Math.round(cx + w); xx++) px(xx, yy - baja, col); }
      });
    };
    return { c: { ...c, retoque: undefined, cuerpo, atras, brazoCerca: { ...c.brazoCerca, poses: { guardia: mano } } },
      p: { ...p, fase: "guardia", mano: c.manos.guardia, pies: [[8, 39], [20, 39]], agacha: salto(T) ? 0 : 1 + golpe, bob: -salto(T), inclina: 0 } };
  };
  const proyKenny = HD_KENNY34.proyectil;
  HD_KENNY34.proyectil = (g, x, y, p) => {
    if (!p.enPodio) return proyKenny(g, x, y, p);
    const T = Math.max(0, p.t || 0), ox = x + HD_OX, oy = y + HD_OY, f = Math.floor(T / 130);
    const nota = (nx, ny, col) => { g.fillStyle = HDK; g.fillRect(nx - 1, ny - 5, 5, 8); g.fillStyle = col; g.fillRect(nx, ny, 2, 2); g.fillRect(nx + 1, ny - 4, 1, 5); g.fillRect(nx + 2, ny - 4, 1, 1); };
    for (let i = 0; i < 3; i++) {   // notas disparadas desde el laúd hacia los costados, lejos de su cara
      const k = mod(T / 1100 + i / 3, 1), dir = [-1, 1, -1][i], nx = Math.round(ox + (dir < 0 ? 6 : 26) + dir * k * 14), ny = Math.round(oy + 28 - k * 18 + (p.bob || 0) - i * 3);
      if (k < 0.85) nota(nx, ny, ["#FBBF24", "#F472B6", "#7DD3FC", "#A3E635"][i]);
    }
    if (salto(T)) for (let i = 0; i < 8; i++) {   // chispas del salto rockero
      const a = i * Math.PI / 4 + f * 0.3, r = 10 + (f % 3) * 2, sx = Math.round(ox + 15 + Math.cos(a) * r), sy = Math.round(oy + 22 + Math.sin(a) * r + (p.bob || 0));
      g.fillStyle = i % 2 ? "#FFFFFF" : "#FDE047"; g.fillRect(sx, sy, 1, 1); g.fillRect(sx - 1, sy, 3, 1); g.fillRect(sx, sy - 1, 1, 3);
    }
  };
}
/* Tiván en el podio: rompe una poción en el suelo, el humo lo cubre y, al disiparse, aparece de esmoquin
   (con colas, guantes blancos y humita roja) y celebra con elegancia, la mano abierta y destellos. */
{
  /* Esmoquin de verdad: chaqueta corta y entallada con solapas de satín, camisa blanca con botón, humita roja,
     faja negra, pañuelo blanco en el bolsillo y pantalón con franja de satín; sin el abrigo largo ni sus colas. */
  const smoking = (() => {
    const c = HD_TIVAN34, torso = {   // corte slim: espalda angosta y el hombro baja en diagonal desde el cuello
      14: ".........KJKKKKKJK",
      15: "........KJLLKWWKLJK",
      16: ".......KJjJLRrrRLJJK",
      17: ".......KjJJLlWWWlLJJK",
      18: ".......KjJJLlWNWlLJWJK",
      19: ".......KjJJJLWWWLJWWJK",
      20: ".......KjJJLNNNNNLJJK",
      21: ".......KjJJJLNNNLJJJK",
      22: ".......KjJJJJJNJJJJJK",
      23: ".......KjJJJJJJJJJJJK",
      24: ".......KjJJJJKJJJJJJK",
      25: ".......KKJJJKTTKJJJJK",
      26: "........KKKKTTTTKKKKK",
      27: ".........KTtTTTTTTK",
    };
    const satin = { luz: "#5A5568", base: "#24212B", sombra: "#15131A" };
    return { ...c, cuerpo: c.cuerpo.map((f, i) => torso[i] || f), falda: undefined, capa: undefined, brazoCerca: { ...c.brazoCerca, hombro: [10, 19], poses: { guardia: [[0, 7], [-1, 3]] } }, faldaVuelo: false, arma: undefined,
      pal: { ...c.pal, J: "#2B2833", j: "#1B1920", L: "#5A5568", l: "#3E3A4A", W: "#F4F4F6", N: "#141218", R: "#E0304A", r: "#9B1428", T: "#24212B", t: "#15131A" },
      brazo: { ...c.brazo, luz: "#4A4558", base: "#2B2833", sombra: "#1B1920", mano: "#F4F4F6", manoLuz: "#FFFFFF" },
      pierna: { ...c.pierna, ...satin, bota: "#0E0C12", botaSombra: "#050406" } };
  })();
  const momento = (T) => (T < 400 ? "guardia" : T < 640 ? "carga" : T < 760 ? "lanza" : T < 1300 ? "humo" : T < 2500 ? "aparece" : "elegante");
  HD_TIVAN34.retoque = (p, c) => {
    if (!p.enPodio) return null;
    const T = Math.max(0, p.t || 0), m = momento(T);
    if (m === "guardia") return null;
    if (m === "carga") return { c: { ...c, retoque: undefined }, p: { ...p, fase: "alto", mano: [18, 9], bob: -1, agacha: 0, inclina: -1 } };   // toma impulso: la poción bien arriba, echado atrás
    if (m === "lanza") return { c: { ...c, retoque: undefined, arma: undefined }, p: { ...p, fase: "golpe", mano: [27, 27], bob: 0, agacha: 3, inclina: 2 } };   // la azota contra el suelo
    if (m === "humo") return { c: { ...c, retoque: undefined, arma: undefined }, p: { ...p, fase: "guardia", mano: [26, 27], bob: 0, agacha: 2, inclina: 1 } };
    const brillo = Math.floor(T / 500) % 2;   // la mano abierta sube y baja apenas, con elegancia
    return { c: { ...smoking, retoque: undefined },
      p: { ...p, fase: "guardia", mano: [27, 16 + brillo], bob: 0, agacha: 0, inclina: 0 } };
  };
  const humo = (g, cx, cy, r, t, alfa) => {
    if (r <= 0 || alfa <= 0) return;
    [[0, 0, 1], [-0.6, -0.3, 0.7], [0.6, -0.4, 0.72], [-0.5, 0.5, 0.65], [0.5, 0.55, 0.68], [0, -0.75, 0.6], [0, 0.8, 0.55]].forEach(([ox, oy, rr], i) => {
      const bx = cx + ox * r + Math.sin(t / 260 + i) * 1.5, by = cy + oy * r + Math.cos(t / 300 + i) * 1.5, R = rr * r * 0.62;
      g.fillStyle = ["#3F7A4A", "#5FBF7A", "#8FA39A", "#6B7F74"][i % 4]; g.globalAlpha = alfa * 0.95;
      for (let yy = -R; yy <= R; yy++) { const w = Math.sqrt(Math.max(0, R * R - yy * yy)); g.fillRect(Math.round(bx - w), Math.round(by + yy), Math.round(2 * w) + 1, 1); }
    });
    g.globalAlpha = 1;
  };
  const estrellita4 = (g, cx, cy, r, col) => { g.fillStyle = col; g.fillRect(cx - r, cy, 2 * r + 1, 1); g.fillRect(cx, cy - r, 1, 2 * r + 1); g.fillStyle = "#FFFFFF"; g.fillRect(cx, cy, 1, 1); };
  const proyTivan = HD_TIVAN34.proyectil;
  HD_TIVAN34.proyectil = (g, x, y, p) => {
    if (!p.enPodio) return proyTivan(g, x, y, p);
    const T = Math.max(0, p.t || 0), ox = x + HD_OX, oy = y + HD_OY;
    if (T >= 640 && T < 760) {   // la poción baja disparada a sus pies, con estela
      const k = (T - 640) / 120, cx = Math.round(ox + 28 + k * 2), cy = Math.round(oy + 28 + k * 9);
      g.fillStyle = "rgba(134,239,172,.55)"; g.fillRect(cx - 1, cy - 9, 3, 7);
      g.fillStyle = HDK; g.fillRect(cx - 3, cy - 3, 7, 8); g.fillStyle = "#4ADE80"; g.fillRect(cx - 2, cy, 5, 4); g.fillStyle = "#D9E8E0"; g.fillRect(cx, cy - 2, 1, 2); g.fillStyle = "#8A5A2A"; g.fillRect(cx, cy - 3, 1, 1);
    }
    if (T >= 760 && T < 1050) {   // ¡crash! vidrios y gotas verdes que saltan
      const k = (T - 760) / 290;
      for (let i = 0; i < 8; i++) { const a = Math.PI + (i / 7) * Math.PI, r = 2 + k * 10, sx = Math.round(ox + 30 + Math.cos(a) * r), sy = Math.round(oy + 38 + Math.sin(a) * r * 0.8 + k * k * 6); g.fillStyle = i % 2 ? "#E6F7EE" : "#4ADE80"; g.fillRect(sx, sy, 1, 1); }
    }
    if (T >= 760 && T < 2500) {   // se rompe: el humo crece y lo cubre, y después se va
      const crece = Math.min(1, (T - 760) / 220), alfa = T < 1900 ? 1 : 1 - (T - 1900) / 600;
      humo(g, ox + 30 - crece * 14, oy + 36 - crece * 20, 4 + crece * 19, T, alfa);   // nace donde se rompió la poción y sube a cubrirlo
    }
    if (T >= 2100) {   // destellos de elegancia sobre el esmoquin y alrededor
      const f = Math.floor(T / 140);
      [[14, 15], [6, 8], [27, 9], [21, 25], [3, 22]].forEach(([a, b], i) => { if ((f + i) % 3 === 0) estrellita4(g, ox + a, oy + b, i ? 1 : 2, i % 2 ? "#FFFFFF" : "#FDE68A"); });
    }
  };
}
/* El águila de Patroclus volando, mirando a la derecha (izq: a la izquierda); (cx, cy) es donde van las garras. */
const AGUILA_ARRIBA = ["...KK....KK....", "..KBBK..KBBK...", "...KBbK.KBbK...", "....KBbKbBK.KKK", "KK..KBBBBBKKWWK", "KbKKBBBBBBWWWYK", ".KbbBBBBBBKWKK.", "..KKKYKKYKKK..."];
const AGUILA_ABAJO = ["...............", "...............", "...............", "...........KKK.", "KK..KKKKKKKKWWK", "KbKKBBBBBBWWWYK", ".KbbBBBBBBKWKK.", "..KKBbKKBbKK...", "...KBBK.KBBK...", "....KK...KK...."];
const aguilaVuela = (g, cx, cy, t, izq = false) => {
  const pal = { K: HDK, B: "#6B4423", b: "#4A2E17", W: "#F4F4F0", Y: "#F2C230" }, filas = Math.floor(t / 110) % 2 ? AGUILA_ARRIBA : AGUILA_ABAJO;
  filas.forEach((f, y) => [...f].forEach((k, x) => { if (pal[k]) { g.fillStyle = pal[k]; g.fillRect(Math.round(cx) + (izq ? 7 - x : x - 7), Math.round(cy) - 7 + y, 1, 1); } }));
};

/* Patroclus en el podio: clava su bordón con el tótem a su lado y celebra saltando, mientras su águila
   da vueltas a su alrededor, pasando por delante y por detrás. */
{
  const ALZA = 0;
  const vuelta = (t) => t / 650;   // ángulo del águila
  HD_PATROCLUS34.retoque = (p, c) => {
    if (!p.enPodio) return null;
    const T = Math.max(0, p.t || 0), v = hdPose(c, "victoria", T), alto = v.fase === "alto" || v.fase === "sube";
    const salto = alto ? (Math.floor(T / 260) % 2 ? -5 : 0) : 0;   // saltos más altos que lo normal, de pura alegría
    const atras = (px, q) => {   // el bordón clavado en el escalón, a su lado: no se mueve aunque él salte
      const baja = (q.bob || 0) + (q.agacha || 0);
      HD_PATROCLUS.arma((x, y, col) => px(x, y - baja, col), { mano: [26, 31], fase: "guardia", t: T });
    };
    return { c: { ...c, retoque: undefined, armaDetras: undefined, atras, arma: (px) => [[7, 12, "#E5E7EB"], [7, 13, "#9AA3B0"]].forEach(([x, y, col]) => px(x, y, col)) },
      p: { ...v, enPodio: true, mano: alto ? c.manos.alto : v.mano, bob: alto ? salto : v.bob, agacha: alto && !salto ? 2 : v.agacha || 0 } };
  };
  /* El águila: por delante se dibuja después del cuerpo; por detrás, en una pasada previa desde la escena (proyectilAtras). */
  const posAguila = (x, y, t) => { const a = vuelta(t); return { cx: x + HD_OX + 16 + Math.cos(a) * 20, cy: y + HD_OY + 20 - ALZA + Math.sin(a) * 6, delante: Math.sin(a) > 0, izq: Math.sin(a) > 0 }; };
  const proyP = HD_PATROCLUS34.proyectil;
  HD_PATROCLUS34.proyectil = (g, x, y, p) => {
    if (!p.enPodio) return proyP && proyP(g, x, y, p);
    const a = posAguila(x, y, p.t || 0); if (a.delante) aguilaVuela(g, a.cx, a.cy, p.t || 0, a.izq);
  };
  HD_PATROCLUS34.proyectilAtras = (g, x, y, p) => { if (!p.enPodio) return; const a = posAguila(x, y, p.t || 0); if (!a.delante) aguilaVuela(g, a.cx, a.cy, p.t || 0, a.izq); };
}
/* Uchis en el podio: malabares con 3 dagas; luego las lanza alto y caen girando, una por una, y se clavan de punta
   a su izquierda, al frente y a su derecha. Después celebra saltando entre ellas. */
{
  const FIN_MALABAR = 2400, CLAVA = [[1, 0], [15, 250], [30, 500]];   // x donde se clava cada daga y su retraso
  const cerca = HD_UCHIS34.brazoCerca.hombro;
  /* Daga de 7 px; giro 0 = punta abajo, 1 = punta a la derecha, 2 = punta arriba, 3 = punta a la izquierda (cuartos de vuelta). */
  const daga = (g, cx, cy, giro, hundida = 0) => {
    const partes = [[-3, "#6E4424"], [-2, "#6E4424"], [-1, "#C9A24B"], [0, "#D9DEE6"], [1, "#D9DEE6"], [2, "#E8ECF2"], [3, "#FFFFFF"]];   // del mango a la punta
    const dir = [[0, 1], [1, 0], [0, -1], [-1, 0]][((giro % 4) + 4) % 4];
    const pts = partes.slice(0, partes.length - hundida).map(([k, col]) => [Math.round(cx + dir[0] * k), Math.round(cy + dir[1] * k), col]);
    const guarda = [[Math.round(cx - dir[1] * 1 - dir[0]), Math.round(cy - dir[0] * 1 - dir[1])], [Math.round(cx + dir[1] * 1 - dir[0]), Math.round(cy + dir[0] * 1 - dir[1])]];
    g.fillStyle = HDK; [...pts, ...guarda].forEach(([x, y]) => g.fillRect(x - 1, y - 1, 3, 3));
    pts.forEach(([x, y, col]) => { g.fillStyle = col; g.fillRect(x, y, 1, 1); });
    g.fillStyle = "#C9A24B"; guarda.forEach(([x, y]) => g.fillRect(x, y, 1, 1));
  };
  const manos = (T) => {   // las dos manos suben y bajan alternadas, al ritmo del malabar
    const fase = Math.floor(T / 300) % 2;
    return { der: [28, 17 + (fase ? 1 : -1)], izq: [3, 17 + (fase ? -1 : 1)] };   // brazos bien abiertos: las dagas pasan por fuera de su cara
  };
  HD_UCHIS34.retoque = (p, c) => {
    if (!p.enPodio) return null;
    const T = Math.max(0, p.t || 0);
    if (T < FIN_MALABAR + 300) {
      const { der, izq } = manos(T), lanzando = T >= FIN_MALABAR;
      const mi = lanzando ? [izq[0] - cerca[0], 6 - cerca[1]] : [izq[0] - cerca[0], izq[1] - cerca[1]];
      return { c: { ...c, retoque: undefined, arma: undefined, brazoCerca: { ...c.brazoCerca, poses: { guardia: [mi, [-1, 2]] } } },
        p: { ...p, fase: "guardia", mano: lanzando ? [24, 8] : der, bob: 0, agacha: 0 } };
    }
    return { c: { ...c, retoque: undefined, arma: undefined }, p: { ...hdPose(c, "victoria", T - FIN_MALABAR), enPodio: true } };   // celebra entre sus dagas
  };
  const proyU = HD_UCHIS34.proyectil;
  HD_UCHIS34.proyectil = (g, x, y, p) => {
    if (!p.enPodio) return proyU(g, x, y, p);
    const T = Math.max(0, p.t || 0), ox = x + HD_OX, oy = y + HD_OY, giro = Math.floor(T / 90);
    if (T < FIN_MALABAR) {   // cascada: cada daga va de una mano a la otra por arriba, girando
      const { der, izq } = manos(T);
      for (let i = 0; i < 3; i++) {
        const u = ((T / 1200 + i / 3) % 1), ida = u < 0.5, k = ida ? u * 2 : (u - 0.5) * 2;
        const [a, b] = ida ? [izq, der] : [der, izq], alto = ida ? 21 : 18;
        daga(g, ox + a[0] + (b[0] - a[0]) * k, oy + a[1] - 3 - Math.sin(Math.PI * k) * alto, giro + i);
      }
      return;
    }
    const suelo = y + HD_OY + 39;
    CLAVA.forEach(([cx, retraso]) => {   // suben juntas y caen ordenadas, girando, hasta clavarse de punta
      const k = (T - FIN_MALABAR - retraso) / 700;
      if (k < 0) { daga(g, ox + 24, oy + 2 - Math.min(1, (T - FIN_MALABAR) / 300) * 10, giro); return; }
      if (k < 1) { daga(g, ox + 24 + (cx - 24) * k, oy - 8 + (suelo - 1 - (oy - 8)) * k * k, k > 0.85 ? 0 : giro); return; }
      daga(g, ox + cx, suelo - 1, 0, 2);   // clavada en la franja clara del escalón, a la altura de sus pies
      if (k < 1.3) { g.fillStyle = "#FFFFFF"; g.fillRect(ox + cx - 3, suelo + 1, 2, 1); g.fillRect(ox + cx + 2, suelo + 1, 2, 1); }   // chispitas al clavarse
    });
  };
}
/* Janet en el podio: se pone una manzana en la cabeza, dispara hacia el lado y la flecha, desafiando toda la física,
   da una vuelta, vuelve, le saca la manzana de la cabeza y la deja ensartada, clavada en el borde de la pantalla. */
{
  const SUELTA = 1060, CLAVA = 2300;   // cuándo suelta la flecha y cuándo se clava en el borde
  const cerca = HD_JANET34.brazoCerca.hombro;
  const manzana = (g, cx, cy) => {
    const pts = [[-1, -1], [0, -1], [1, -1], [-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0], [-2, 1], [-1, 1], [0, 1], [1, 1], [2, 1], [-1, 2], [0, 2], [1, 2]];
    g.fillStyle = HDK; pts.forEach(([a, b]) => g.fillRect(cx + a - 1, cy + b - 1, 3, 3));
    pts.forEach(([a, b]) => { g.fillStyle = a < 0 && b < 1 ? "#F05A5A" : "#D7263D"; g.fillRect(cx + a, cy + b, 1, 1); });
    g.fillStyle = "#FFFFFF"; g.fillRect(cx - 1, cy - 1, 1, 1);
    g.fillStyle = "#6E4424"; g.fillRect(cx, cy - 2, 1, 1); g.fillStyle = "#4ADE80"; g.fillRect(cx + 1, cy - 3, 2, 1);   // palito y hojita
  };
  /* Flecha en cualquier dirección: la punta en (x, y) y el cuerpo hacia atrás según (dx, dy). */
  const flecha = (g, x, y, dx, dy) => {
    const L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, pts = [];
    for (let i = 0; i <= 11; i++) pts.push([Math.round(x - ux * i), Math.round(y - uy * i), i < 2 ? "#D9DEE6" : i > 8 ? "#4ADE80" : "#B07A44"]);
    g.fillStyle = HDK; pts.forEach(([a, b]) => g.fillRect(a - 1, b - 1, 3, 3));
    pts.forEach(([a, b, col]) => { g.fillStyle = col; g.fillRect(a, b, 1, 1); });
  };
  /* El vuelo: sale derecho hacia el lado, da una vuelta hacia arriba y vuelve a la altura de la manzana, hacia la izquierda. */
  const vuelo = (k, sx, sy, ay) => {
    const R = (sy - ay) / 2, cx = sx + 22, cy = sy - R;
    if (k < 0.3) { const f = k / 0.3; return [sx + f * 22, sy, 1, 0]; }
    if (k < 0.7) { const a = Math.PI / 2 - ((k - 0.3) / 0.4) * Math.PI; return [cx + Math.cos(a) * R, cy + Math.sin(a) * R, Math.sin(a), -Math.cos(a)]; }   // la vuelta
    const f = (k - 0.7) / 0.3; return [cx - f * (cx - 1), ay, -1, 0];   // de vuelta, derecho hacia el borde izquierdo
  };
  HD_JANET34.retoque = (p, c) => {
    if (!p.enPodio) return null;
    const T = Math.max(0, p.t || 0);
    if (T < 300) return null;
    if (T < 800) {   // se pone la manzana en la cabeza con la mano de cerca
      const arriba = [[3, -18], [-3, -9]];
      return { c: { ...c, retoque: undefined, brazoCerca: { ...c.brazoCerca, poses: { guardia: arriba } } }, p: { ...p, fase: "guardia", mano: c.manos.guardia } };
    }
    if (T < 2400) { const tt = T < 1300 ? 500 + (T - 800) : 1300; return { c: { ...c, retoque: undefined }, p: { ...hdPose(c, "ataque", tt), enPodio: true } }; }   // apunta y dispara hacia el lado
    return { c: { ...c, retoque: undefined }, p: { ...hdPose(c, "victoria", T - 2400), enPodio: true } };
  };
  const proyJ = HD_JANET34.proyectil;
  HD_JANET34.proyectil = (g, x, y, p) => {
    if (p.sinFlecha) return;   // la escena dibuja su propia flecha (la que rebota en el overtake)
    if (!p.enPodio) return proyJ(g, x, y, p);
    const T = Math.max(0, p.t || 0), ox = x + HD_OX, oy = y + HD_OY;
    const r = HD_JANET34.retoque(p, HD_JANET34), q = r ? r.p : p;   // la pose que de verdad se dibujó (para que la manzana quede sobre la cabeza)
    const enCabeza = [ox + 13 + (q.inclina || 0), oy - 3 + (q.bob || 0) + (q.agacha || 0)], sx = ox + 28, sy = oy + 19;
    if (T >= 300 && T < 650) manzana(g, ox + cerca[0] + 3, oy + cerca[1] - 20);   // en la mano, subiendo
    const k = (T - SUELTA) / (CLAVA - SUELTA);
    if (k < 0) { if (T >= 650) manzana(g, enCabeza[0], enCabeza[1]); return; }
    if (k < 1) {
      const [fx, fy, dx, dy] = vuelo(k, sx, sy, enCabeza[1]);
      const llevaManzana = k >= 0.7 && fx <= enCabeza[0] + 2;
      if (!llevaManzana) manzana(g, enCabeza[0], enCabeza[1]);
      flecha(g, Math.round(fx), Math.round(fy), dx, dy);
      if (llevaManzana) manzana(g, Math.round(fx) + 4, Math.round(fy));
      return;
    }
    /* Clavada en el borde izquierdo, con la manzana ensartada. */
    const bx = 1, by = oy - 3;
    flecha(g, bx, by, -1, 0); manzana(g, bx + 4, by);
    if (k < 1.15) { g.fillStyle = "#FFFFFF"; g.fillRect(bx + 1, by - 3, 1, 2); g.fillRect(bx + 1, by + 2, 1, 2); }
    g.fillStyle = "#3E2A1A"; g.fillRect(0, by - 4, 1, 9);
  };
}
/* July en el podio: gira varias veces con el martillo extendido (se voltea de un lado a otro muy rápido, con rayas
   de velocidad), se detiene mareado con estrellitas sobre la cabeza y termina riéndose a carcajadas. */
{
  const GIRA = 1900, MAREO = 3100;
  const risa = (() => {   // ojos cerrados de risa, boca bien abierta
    const filas = HD_JULY34.cuerpo.map((f) => [...f]), pon = (y, x, k) => { filas[y][x] = k; };
    pon(7, 11, "S"); pon(7, 15, "S"); pon(8, 10, "K"); pon(8, 14, "K");
    pon(11, 11, "K"); pon(11, 12, "9"); pon(11, 13, "9"); pon(11, 14, "K"); pon(12, 12, "K"); pon(12, 13, "K");
    return filas.map((f) => f.join(""));
  })();
  HD_JULY34.retoque = (p, c) => {
    if (!p.enPodio) return null;
    const T = Math.max(0, p.t || 0), base = { ...c, retoque: undefined, manoDinamica: undefined, codoDinamico: undefined, brazoAtras: undefined };
    if (T < GIRA) {   // girando: brazos afuera y el martillo estirado
      const vuelta = Math.floor(T / (T < 1300 ? 90 : 140)) % 2;   // al final gira más lento
      return { c: { ...base, arma: (px, q) => martilloJuly(px, q.mano[0], q.mano[1], 1, -0.15), brazoCerca: { ...c.brazoCerca, poses: { guardia: [[-6, 1], [-3, 0]] } } },
        p: { ...p, fase: "guardia", mano: [28, 19], voltea: vuelta === 1, bob: 0, agacha: 1, inclina: 0 } };
    }
    if (T < MAREO) {   // mareado: se tambalea con el martillo apoyado
      const tambalea = Math.round(Math.sin(T / 260) * 1.6);
      return { c: base, p: { ...p, fase: "guardia", mano: c.manos.guardia, voltea: false, bob: 0, agacha: 1, inclina: tambalea } };
    }
    const sacude = Math.floor(T / 90) % 2;   // carcajadas: se sacude entero, con las manos en la panza
    return { c: { ...base, cuerpo: risa, pal: { ...c.pal, 9: "#9B1428" }, brazoCerca: { ...c.brazoCerca, poses: { guardia: [[5, 7], [0, 5]] } } },
      p: { ...p, fase: "guardia", mano: [21, 26], voltea: false, bob: -sacude, agacha: 0, inclina: 0 } };
  };
  const proyJuly = HD_JULY34.proyectil;
  HD_JULY34.proyectil = (g, x, y, p) => {
    if (!p.enPodio) return proyJuly(g, x, y, p);
    const T = Math.max(0, p.t || 0), ox = x + HD_OX, oy = y + HD_OY, f = Math.floor(T / 80);
    if (T < GIRA) {   // rayas de velocidad que giran a su alrededor y polvo a los pies
      for (let i = 0; i < 6; i++) { const a = (T / 120 + i * 1.05), rx = Math.round(ox + 15 + Math.cos(a) * 17), ry = Math.round(oy + 18 + Math.sin(a) * 4); g.fillStyle = Math.sin(a) > 0 ? "rgba(255,255,255,.85)" : "rgba(255,255,255,.4)"; g.fillRect(rx - 2, ry, 4, 1); }
      g.fillStyle = "rgba(214,207,192,.7)"; [[-4, 0], [4, 1], [0, -1]].forEach(([dx, dy], i) => g.fillRect(ox + 15 + dx + ((f + i) % 3) - 1, oy + 38 + dy, 3, 1));
      return;
    }
    if (T < MAREO) { const tamb = Math.round(Math.sin(T / 260) * 1.6); pajaritos(g, ox + 15 + tamb, oy - 1, T); return; }
    [[-3, 9], [19, 9]].forEach(([a, b], i) => { if ((f + i) % 2) { g.fillStyle = "#7DD3FC"; g.fillRect(ox + a + 1, oy + b - (p.bob || 0) + ((f >> 1) % 2), 1, 2); } });   // lagrimitas de risa
    [[-6, 4], [-7, 8], [24, 4], [25, 8]].forEach(([a, b], i) => { if ((f + i) % 2) { g.fillStyle = "#FFFFFF"; g.fillRect(ox + a, oy + b, 2, 1); } });   // rayitas de carcajada
  };
}
/* Edith en el podio: llama a una nube blanca, se acomoda en ella (las piernas hundidas en la nube) y de la nube
   sale un arcoíris que se dibuja hasta una nubecita al otro lado. Reemplaza la levitación con rayos. */
{
  const SUBE = 7;
  const flota = (T) => (T < 500 ? 0 : T < 1300 ? Math.round(SUBE * (T - 500) / 800) : SUBE + Math.round(Math.sin(T / 500)));
  HD_EDITH34.retoque = (p, c) => {
    if (!p.enPodio) return null;
    const T = Math.max(0, p.t || 0);
    const fase = T >= 500 && T < 1800 ? (Math.floor(T / 220) % 2 ? "alto" : "sube") : "guardia";   // mientras la nube la eleva, sube las manos emocionada
    const cuerpo = T >= 500 ? c.cuerpo.map((f, i) => (i === 12 || i === 13 ? [...f].map((k, x) => (i === 12 ? { 14: "K", 15: "8", 16: "8", 17: "K" }[x] : { 15: "K", 16: "K" }[x]) || k).join("") : f)) : c.cuerpo;   // sonríe feliz desde que la nube la eleva
    return { c: { ...c, retoque: undefined, ajustePose: undefined, cuerpo, pal: { ...c.pal, 8: "#FFFFFF" } }, p: { ...p, fase, mano: c.manos[fase], bob: -flota(T), agacha: 0, inclina: 0 } };
  };
  const nube = (g, cx, cy, escala, chica) => {
    const bolas = chica ? [[0, 0, 3], [-3, 1, 2], [3, 1, 2]] : [[0, -1, 6], [-8, 1, 5], [8, 1, 5], [-13, 3, 3], [13, 3, 3], [-4, 2, 5], [4, 2, 5]];
    [["#1A1020", 1], ["#C7D2FE", 0], ["#FFFFFF", -1]].forEach(([col, crece], capa) => {
      g.fillStyle = col;
      bolas.forEach(([ox, oy, r]) => { const R = Math.max(0, (r + crece) * escala); for (let yy = -R; yy <= R; yy++) { if (capa === 2 && yy > R * 0.3) continue; const w = Math.sqrt(Math.max(0, R * R - yy * yy)); g.fillRect(Math.round(cx + ox * escala - w), Math.round(cy + oy * escala + yy), Math.round(2 * w) + 1, 1); } });
    });
  };
  const COLORES = ["#EF4444", "#F97316", "#FACC15", "#4ADE80", "#60A5FA", "#A78BFA"];
  const proyE = HD_EDITH34.proyectil;
  HD_EDITH34.proyectil = (g, x, y, p) => {
    if (!p.enPodio) return proyE(g, x, y, p);
    const T = Math.max(0, p.t || 0), ox = x + HD_OX, oy = y + HD_OY, alto = flota(T);
    if (T < 500) return;
    const k = Math.min(1, (T - 1300) / 1000);
    if (k > 0) {   // el arcoíris sale de su nube y se dibuja en arco hasta la nubecita del otro lado
      const cx = ox + 30, cy = oy + 36 - alto;
      COLORES.forEach((col, i) => {
        const r = 11 - i; g.fillStyle = col;
        for (let a = 0; a <= Math.PI * k; a += 0.04) g.fillRect(Math.round(cx - Math.cos(a) * r), Math.round(cy - Math.sin(a) * r), 1, 1);
      });
      if (k >= 1) nube(g, cx + 8, cy + 1, 1, true);
      const f = Math.floor(T / 150);
      [[-6, -14], [4, -13], [10, -6]].forEach(([dx, dy], i) => { if ((f + i) % 3 === 0 && k >= 1) { g.fillStyle = "#FFFFFF"; g.fillRect(cx + dx, cy + dy, 1, 1); g.fillRect(cx + dx - 1, cy + dy, 3, 1); g.fillRect(cx + dx, cy + dy - 1, 1, 3); } });
    }
    nube(g, ox + 15, oy + 35 - alto, Math.min(1, (T - 500) / 600), false);   // la nube donde se acomoda (le tapa las piernas)
  };
}
/* Uzu en el podio: le llueven monedas de oro, se vuelve loco, se saca el casco para juntarlas como en un tazón
   y se lo vuelve a poner: le queda chueco y medio levantado, con monedas asomándose. */
{
  const LLUVIA = 400, SACA = 1500, JUNTA = 1800, PONE = 2900, LISTO = 3200;
  const CASCO = [8, 9, 10, 11, 12, 13], X0 = 8, X1 = 23;
  const cuerpo = HD_UZU34.cuerpo;
  const sinCasco = cuerpo.map((f, i) => {
    if (!CASCO.includes(i)) return f;
    const fila = [...f]; for (let x = X0; x <= X1; x++) if (fila[x] !== undefined) fila[x] = ".";
    const pon = (x0, txt) => [...txt].forEach((k, j) => { while (fila.length <= x0 + j) fila.push("."); fila[x0 + j] = k; });
    if (i === 10) { pon(14, "K"); pon(16, "K"); }   // pelitos en la coronilla
    if (i === 11) pon(11, "KKKKKKKKKK");
    if (i === 12) pon(9, "KGGgGGGGGGGGGK");
    if (i === 13) pon(8, "KGGGGGGGGGGGGGGK");
    return fila.join("");
  });
  /* El casco inclinado unos grados (apoyado en el lado de atrás y levantado hacia adelante), girado píxel a píxel
     para que conserve su forma y sus bordes nítidos; en el hueco que queda se asoma el oro. */
  const INCLINA = 0.25, PIVOTE = [9, 13.5];
  const cascoChueco = (c) => (px) => {
    const color = (k) => (k === "K" ? HDK : c.pal[k]), fondo = {};
    for (let y = 2; y <= 16; y++) for (let x = 4; x <= 30; x++) {
      const dx = x - PIVOTE[0], dy = y - PIVOTE[1];
      const sx = Math.round(PIVOTE[0] + dx * Math.cos(INCLINA) - dy * Math.sin(INCLINA)), sy = Math.round(PIVOTE[1] + dx * Math.sin(INCLINA) + dy * Math.cos(INCLINA));
      if (!CASCO.includes(sy) || sx < X0 || sx > X1) continue;
      const k = (cuerpo[sy] || "")[sx]; if (!k || k === "." || !color(k)) continue;
      px(x, y, color(k)); fondo[x] = Math.max(fondo[x] ?? -1, y);
    }
    Object.entries(fondo).forEach(([x, y]) => { x = +x; if (x >= 13 && x <= 22 && y < 13) for (let yy = y + 1; yy <= 12; yy++) px(x, yy, (x + yy) % 3 ? "#F2C230" : "#FFF3B0"); });   // el oro que no le deja entrar el casco
  };
  HD_UZU34.retoque = (p, c) => {
    if (!p.enPodio) return null;
    const T = Math.max(0, p.t || 0), base = { ...c, retoque: undefined, arma: undefined, armaDetras: undefined, manoDinamica: undefined, codoDinamico: undefined, brazoAtras: undefined };
    if (T < LLUVIA) return null;
    if (T < SACA) {   // se vuelve loco: salta y tiembla con los brazos arriba
      const salta = Math.floor(T / 160) % 2;
      return { c: base, p: { ...p, fase: salta ? "alto" : "sube", mano: c.manos[salta ? "alto" : "sube"], bob: -salta * 3, agacha: 0, inclina: Math.floor(T / 60) % 2 ? 1 : -1 } };
    }
    if (T < PONE) {   // sin casco, con el casco dado vuelta en las manos como tazón
      const k = T < JUNTA ? (T - SACA) / (JUNTA - SACA) : 1;
      return { c: { ...base, cuerpo: sinCasco, codos: { guardia: [22, 25] }, brazoCerca: { ...c.brazoCerca, poses: { guardia: [[6, 5], [2, 4]] } } },
        p: { ...p, fase: "guardia", mano: [21 + Math.round((1 - k) * 2), 26 - Math.round((1 - k) * 12)], bob: 0, agacha: T >= JUNTA ? Math.floor(T / 200) % 2 : 0, inclina: 0 } };
    }
    if (T < LISTO) return { c: { ...base, cuerpo: sinCasco }, p: { ...p, fase: "alto", mano: [18, 10], bob: 0, agacha: 0, inclina: 0 } };   // se lo pone de vuelta
    const v = hdPose(c, "victoria", T - LISTO);
    return { c: { ...base, cuerpo: sinCasco, arma: cascoChueco(c) }, p: { ...v, enPodio: true } };   // feliz, con el casco chueco
  };
  const moneda = (g, cx, cy, t, i) => {
    const canto = Math.floor(t / 90 + i) % 3 === 1;
    g.fillStyle = HDK; g.fillRect(cx - (canto ? 1 : 2), cy - 2, canto ? 3 : 5, 5);
    g.fillStyle = "#F2C230"; g.fillRect(cx - (canto ? 0 : 1), cy - 1, canto ? 1 : 3, 3);
    if (!canto) { g.fillStyle = "#FFF3B0"; g.fillRect(cx - 1, cy - 1, 1, 1); }
  };
  /* El casco dado vuelta (de tazón): la cúpula abajo; lleno = con monedas asomándose. */
  const tazon = (g, cx, cy, lleno) => {
    g.fillStyle = HDK; g.fillRect(cx - 7, cy - 1, 15, 2); g.fillRect(cx - 6, cy + 1, 13, 2); g.fillRect(cx - 4, cy + 3, 9, 2);
    g.fillStyle = "#5E636E"; g.fillRect(cx - 6, cy, 13, 1); g.fillRect(cx - 5, cy + 1, 11, 2); g.fillRect(cx - 3, cy + 3, 7, 1);
    g.fillStyle = "#8A909C"; g.fillRect(cx - 5, cy + 1, 3, 1);
    for (let i = 0; i < lleno; i++) { g.fillStyle = i % 2 ? "#F2C230" : "#FFF3B0"; g.fillRect(cx - 5 + ((i * 3) % 11), cy - 1 - Math.floor(i / 4), 2, 1); }
  };
  const proyU = HD_UZU34.proyectil;
  HD_UZU34.proyectil = (g, x, y, p) => {
    if (!p.enPodio) return proyU && proyU(g, x, y, p);
    const T = Math.max(0, p.t || 0), ox = x + HD_OX, oy = y + HD_OY, suelo = oy + 38;
    if (T < LLUVIA) return;
    for (let i = 0; i < 18; i++) {   // la lluvia de oro: al principio por todos lados, después sobre él
      const sale = LLUVIA + i * 130, k = (T - sale) / 700; if (k < 0) continue;
      const alCasco = sale >= JUNTA - 200 && sale < PONE - 600;
      if (!alCasco && i % 3 === 1) continue;   // menos monedas al escalón: solo un montoncito
      const cx = alCasco ? ox + 16 + ((i * 5) % 7) - 3 : ox - 1 + ((i * 37) % 26), destino = alCasco ? oy + 23 : suelo;
      if (k < 1) moneda(g, cx, Math.round(oy - 12 + (destino - oy + 12) * k * k), T, i);
      else if (!alCasco) {   // quedan acostadas en el escalón, a alturas un poco distintas, brillando de a ratos
        const yy = suelo + (i % 2); g.fillStyle = HDK; g.fillRect(cx - 2, yy - 1, 5, 3); g.fillStyle = "#F2C230"; g.fillRect(cx - 1, yy, 3, 1);
        if (Math.floor(T / 200 + i) % 6 === 0) { g.fillStyle = "#FFFFFF"; g.fillRect(cx, yy - 2, 1, 1); }
      }
    }
    if (T >= SACA && T < PONE) {   // el casco de tazón entre sus manos, cada vez más lleno
      const k = T < JUNTA ? (T - SACA) / (JUNTA - SACA) : 1, lleno = Math.max(0, Math.min(12, Math.floor((T - JUNTA) / 80)));
      tazon(g, ox + 16, Math.round(oy + 24 - (1 - k) * 12 + (p.agacha || 0)), lleno);
    }
    if (T >= PONE && T < LISTO) { const k = (T - PONE) / (LISTO - PONE); tazon(g, ox + 15, Math.round(oy + 24 - k * 14), 12); }   // lo sube a la cabeza
    if (T >= LISTO && Math.floor(T / 900) % 3 === 0) { const k = (T % 900) / 900; moneda(g, ox + 22 + Math.round(k * 4), Math.round(oy + 12 + k * k * 26), T, 0); }   // se le cae una moneda de vez en cuando
  };
}
/* Uzu: el borde de abajo de la túnica cierra parejo de lado a lado (antes quedaban flecos sueltos a la izquierda)
   y un collar de huesos con un colmillo al centro, sobre el pecho. */
const COLLAR_UZU = { 21: [11, "WtVWtWVtW"], 22: [15, "WV"], 23: [15, "V"] };
const conCollarUzu = (cuerpo) => cuerpo.map((f, i) => (COLLAR_UZU[i] ? [...f].map((k, x) => { const [x0, txt] = COLLAR_UZU[i]; return x >= x0 && x < x0 + txt.length ? txt[x - x0] : k; }).join("") : f));
HD_UZU34.cuerpo = conCollarUzu(HD_UZU34.cuerpo.map((f, i) => (i === 26 ? "..........KtTTTTTTtTK" : i === 27 ? "..........KKKKKKKKKKK" : f)));
/* Xitin en el podio: se transforma (con destellos y corazones) en un osito kawaii de cabeza grande, orejitas rosadas,
   ojos con brillo y un mechón platinado, y celebra dando saltitos y saludando con las patitas. */
{
  const OSITO = { ...HD_XITIN_NUEVA2, cuerpo: [
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "......KKK.............KKK",
    ".....KUUUK.....KK....KUUUK",
    "....KUUUUUK...KHHK..KUUUUUK",
    "...KUUPPPUUKKKHHHHKKUUPPPUUK",
    "...KUUPPPUUKUUUUUUUKUUPPPUUK",
    "...KUUPPPUUUUUUUUUUUUUPPPUUK",
    "....KuuUUUUUUUUUUUUUUUUUUUK",
    ".....KuUUUUUUUUUUUUUUUUUUK",
    ".....KuUUUUUUUUUUUUUUUUUUK",
    ".....KuUUUUUUUUUUUUUUUUUUK",
    "....KuuUUUZKUUUUUUUZKUUUUUK",
    "....KuuUUUKKUUUUUUUKKUUUUUK",
    "....KuuUUUKKUUUUUUUKKUUUUUK",
    "....KuuUUUUUUUUUUUUUUUUUUUK",
    "....KuuPPUUUUMMKKMUUUUPPUUK",
    ".....KuUUUUUMMMKKMMUUUUUUK",
    ".....KuUUUUUMMKMMKMUUUUUUK",
    "......KUUUUUUMMKKMUUUUUUK",
    ".......KUUUUUUUUUUUUUUUK",
    "........KUUUUUUUUUUUUUK",
    ".......KUUUUUUUUUUUUUUUK",
    "......KUUUUUUUUMUUUUUUUUK",
    "......KUUUUUMMMMMMMUUUUUK",
    "......KUUUUMMMMMMMMMUUUUK",
    "......KUUUUMMMMMMMMMUUUUK",
    "......KUUUUMMMMMMMMMUUUUK",
    ".......KUUUMMMMMMMMMUUUK",
    "........KUUUMMMMMMMUUUK",
    ".......KUUUUUUUMUUUUUUUK",
    "......KUUUUUUUUUUUUUUUUUK",
    "......KUMMMMUKKKKKUMMMMUK",
    ".......KUUUUK.....KUUUUK",
  ],
    pal: { ...HD_XITIN_NUEVA2.pal, U: "#9A6A3E", u: "#6E4626", P: "#F4A6B8", M: "#EBD2AE", Z: "#FFFFFF", H: "#F2E8C4" },
    sinPiernas: true, capa: undefined, pelo: undefined, falda: undefined, forma: undefined, arma: undefined, armaDetras: undefined, proyectil: undefined, retoque: undefined, top: 0, bajar: 0,
    brazo: { luz: "#B8865A", base: "#9A6A3E", sombra: "#6E4626", mano: "#EBD2AE", manoLuz: "#F6E4C8" }, brazoGrueso: 3,
    hombro: [22, 30], brazoCerca: { hombro: [8, 30] }, manos: { guardia: [25, 34], sube: [26, 27], alto: [27, 24] }, codos: undefined, codoDinamico: undefined, manoDinamica: undefined };
  const CAMBIA = 700;
  HD_XITIN_NUEVA2.retoque = (p, c) => {
    if (!p.enPodio) return null;
    const T = Math.max(0, p.t || 0);
    if (T < CAMBIA) return null;
    const saluda = Math.floor(T / 260) % 2, fase = saluda ? "alto" : "sube";
    return { c: { ...OSITO, brazoCerca: { hombro: [8, 30], poses: { sube: [[-4, -3], [-3, 0]], alto: [[-5, -6], [-4, -2]] } } }, p: { ...p, fase, mano: OSITO.manos[fase], bob: saluda ? -2 : 0, agacha: 0, inclina: 0 } };
  };
  const corazon = (g, x, y, col) => [[0, 0], [2, 0], [-1, 1], [0, 1], [1, 1], [2, 1], [3, 1], [0, 2], [1, 2], [2, 2], [1, 3]].forEach(([a, b]) => { g.fillStyle = col; g.fillRect(x + a, y + b, 1, 1); });
  const proyX = HD_XITIN_NUEVA2.proyectil;
  HD_XITIN_NUEVA2.proyectil = (g, x, y, p) => {
    if (!p.enPodio) return proyX && proyX(g, x, y, p);
    const T = Math.max(0, p.t || 0), ox = x + HD_OX, oy = y + HD_OY;
    if (T < 450) return proyX && proyX(g, x, y, p);
    if (T < 1050) {   // la transformación: una nube de destellos y corazones rosados
      const k = (T - 450) / 600, r = 4 + Math.sin(Math.PI * k) * 14;
      g.globalAlpha = Math.sin(Math.PI * k) * 0.85; g.fillStyle = "#FBCFE8";
      for (let yy = -r; yy <= r; yy++) { const w = Math.sqrt(Math.max(0, r * r - yy * yy)); g.fillRect(Math.round(ox + 15 - w), Math.round(oy + 22 + yy), Math.round(2 * w) + 1, 1); }
      g.globalAlpha = 1;
      for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + k * 2, rr = r + 2; if (i % 2) corazon(g, Math.round(ox + 15 + Math.cos(a) * rr), Math.round(oy + 22 + Math.sin(a) * rr), "#F472B6"); else { g.fillStyle = "#FFFFFF"; g.fillRect(Math.round(ox + 15 + Math.cos(a) * rr), Math.round(oy + 22 + Math.sin(a) * rr), 2, 2); } }
      return;
    }
    for (let i = 0; i < 3; i++) {   // corazoncitos que suben del osito
      const k = ((T / 1400 + i / 3) % 1), hx = Math.round(ox + 6 + i * 9 + Math.sin(T / 300 + i) * 2), hy = Math.round(oy + 8 - k * 14);
      if (k < 0.8) corazon(g, hx, hy, i % 2 ? "#F9A8D4" : "#F472B6");
    }
  };
}
/* Patroclus: pañoleta de scout roja (la verde se perdía con el fondo de selva). Va al final, después de los ajustes de paleta. */
HEROES_34.forEach((par) => { if (par[0] === HD_PATROCLUS) par[1].pal = { ...par[1].pal, G: "#C8372B", g: "#8E2418", V: "#E8604E" }; });
/* Uchis: como en su diseño original, una banda azul verde con borde dorado y rombos amarillos que cae por el frente
   desde el pecho, pasa bajo el cinturón y termina en punta bajo la túnica; la túnica queda crema pareja. */
{
  const BANDA = [12, 16], ROMBOS = { 17: "TYT", 18: "YYY", 19: "TYT", 23: "TYT", 24: "YYY", 25: "TYT" };
  const pinta = (f, i) => [...f].map((k, x) => {
    if (i === 21) return k;   // el cinturón va por encima de la banda
    if (x === BANDA[0] || x === BANDA[1]) return k === "K" ? k : "Y";
    if (x > BANDA[0] && x < BANDA[1]) return k === "K" ? k : ROMBOS[i] ? ROMBOS[i][x - BANDA[0] - 1] : "T";
    return k === "T" || k === "Y" ? "C" : k;   // fuera de la banda, túnica lisa
  }).join("");
  HD_UCHIS34.cuerpo = HD_UCHIS34.cuerpo.map((f, i) => (i >= 16 && i <= 27 ? pinta(f, i) : f));
  HD_UCHIS34.falda = { 27: HD_UCHIS34.cuerpo[27], ...HD_UCHIS34.falda, 28: pinta(HD_UCHIS34.falda[28], 28), 29: ".........KKKKYTYKKK", 30: "............KKYKK", 31: ".............KK" };   // la fila 27 se repinta encima: la pierna de adelante no deja una raya
}
/* ======================= PALETA PEAR36 (piloto: Jelic) =======================
   Paleta común Pear36 (lospec.com/palette-list/pear36), colores elegidos a mano por material.
   Reglas: contorno exterior oscuro (#272736) y líneas interiores de un tono oscuro del color vecino;
   luz desde arriba (al voltearse en los duelos no cambia); brillo en los ojos; los detalles que se
   mueven (texturas de la capa, brillos chicos) con tonos vecinos para que no parpadeen. */
{
  Object.assign(HD_JELIC.pal, {
    L: "#FFFFEB", M: "#C2C2D1", m: "#7E7E8F", d: "#606070", Q: "#4DA6FF", A: "#4B5BAB", a: "#473B78",
    P: "#FF6B97", R: "#EB564B", r: "#B0305C", z: "#BA6156", S: "#BA6156", s: "#8C3F5D", W: "#FFFFEB", w: "#C2C2D1",
    Y: "#FFE478", y: "#F2A65E", B: "#322947", v: "#5E315B", n: "#43434F",   // v, n: líneas interiores (los dígitos los usan las escenas)
  });
  const pal = HD_JELIC.pal;
  Object.assign(HD_JELIC.brazo, { luz: pal.L, base: pal.M, sombra: pal.m, mano: pal.d, manoLuz: pal.M, codo: pal.Y });
  Object.assign(HD_JELIC.pierna, { luz: pal.L, base: pal.M, sombra: pal.m, bota: pal.M, botaSombra: pal.d, rodilla: pal.Y });
  HD_JELIC.contorno = HD_JELIC34.contorno = "#272736";
  /* Capa tranquila: sin los puntos de sombra que se movían por dentro; una sola sombra fija junto al cuerpo. */
  HD_JELIC.capa = HD_JELIC.capa.map((fr) => Object.fromEntries(Object.entries(fr).map(([f, txt]) => {
    const ult = Math.max(...[...txt].map((k, i) => (k !== "K" && k !== "." ? i : -1)));
    return [f, [...txt].map((k, i) => (i === ult && k !== "Q" ? "a" : k === "a" ? "A" : k)).join("")];
  })));
  HD_JELIC34.capa = HD_JELIC.capa.map((fr) => Object.fromEntries(Object.entries(fr).map(([k, v]) => [k, ".." + v])));
  /* Casco y pecho con luz desde arriba, brillo en la cúpula y en los ojos, contorno interior de color. */
  HD_JELIC34.cuerpo = [
    "...............................", "...............................", "............KKKKKK.............", "...........KMLLLLMKK...........",
    "..........KmLWLLLLLmK..........", ".........KmMLLLLLLMMmK.........", ".........KMMMMMMMMMMMmK........", "........KmMMMMMMMMMMMMmK.......",
    "........KMMMMmmmmmmmmMMK.......", "........KMMMmssssssssKmK.......", "........KMMmszBBBSBBBsmK.......", "........KMMmsSSWSSSWSsmK.......",
    "........KMMmsSSKSSSKSsmK.......", "........KMmmvsSSSSsSSsmK.......", "........KMmmvsSWWWWWSsmK.......", "........KmmmvssSwWWwSKK........",
    ".........KmmKvssSSSSKK.........", "..........KKKdddddnsK..........", "..........KdMMMMMMMMMMK", "..........KMLLLLLLLLLMK",
    "..........KMMQQQQQQQQMK", "..........KMMQRAAARAQMK", "..........KMMQRAAARAQMK", "..........KMMQRRRRRAQMK",
    "..........KMMQAAAAAAAMK", "..........KBBBBBBYBBBBK", "...........KRaRaRaRaRaK", "...........KaRaRaRaRaRK",
  ];
}
/* ======================= PALETA PEAR36 (tanda 1: Malala, Agattita, Cupe, Malía) =======================
   Mismas reglas que Jelic. Los colores se traducen con c.mapa (ver hdColor), así que los escritos dentro
   de brazos, armas y mascotas también cambian; la grilla trae el contorno interior y el antialiasing. */
{
  /* Malala: pelo negro, rubor y brillo en el pelo. */
  HD_MALALA34.contorno = "#272736";
  HD_MALALA34.mapa = {
    "#86CFA0": "#8FDE5D", "#5FB383": "#8FDE5D", "#2E8B57": "#3CA370", "#3F8A5E": "#3CA370", "#1F4D3A": "#3D6E70", "#12301F": "#323E4F",
    "#2E6B52": "#3D6E70", "#3A5A2A": "#3D6E70", "#D9A13B": "#F2A65E", "#E0B04A": "#FFE478", "#A8762A": "#F2A65E", "#9A6A3A": "#BA6156",
    "#6E4824": "#8C3F5D", "#4A3628": "#5E315B", "#2A1E14": "#3E2347", "#B8692C": "#BA6156", "#E08A3C": "#F2A65E", "#9A3B2A": "#964253",
    "#3A2A30": "#43434F", "#5E4A56": "#606070", "#24212B": "#43434F", "#15121A": "#322947", "#0E0A12": "#322947", "#3A3A48": "#43434F",
    "#F4F1EA": "#FFFFEB", "#F4F8F2": "#FFFFEB", "#D9D2C4": "#C2C2D1", "#7A6656": "#7E7E8F", "#F4D3BE": "#FFB5B5", "#D4A58C": "#FFB5B5",
    "#C9707A": "#FF6B97", "#E39A86": "#FF9166", "#F472B6": "#FF6B97", "#A7F3D0": "#66FFE3", "#14B8A6": "#66FFE3",
  };
  Object.assign(HD_MALALA34.pal = { ...HD_MALALA34.pal }, {Á: "#7E7E8F", É: "#322947", Í: "#272736"});
  HD_MALALA34.cuerpo = [
    "...................KK", "..............KKKKHHK", ".............KhHHHKK", "............KhHhK",
    "...........KhHhK", "..........KhHHhK", ".........KhjHHhK", "........KhHYYYYK",
    "...KKKKKhHHHHHHhKKKKK", "..KhhhhhhhhhhhhhhhhhhK", "...KYÉÉYÉÉYÉÉYÉÉYÉKYK", "....KLLLLLLLLLLLLK",
    "....KLLLÁLLLLÁLLLK", "....KLLlLLLlLLLlLK", "....KLlLLSLSSLSLLK", "....KLlLÍSpSSSSpLK",
    "....KLlLKhsSSpSÍLK", "....KLLÍhDDDDDhKLK", "...KLÍYYYYYYYYYK", "..KÍLÍYYYYYYEYYK",
    "..KLlLÍYYYYYYYK", "...KLKQQQQQQQK", "....KQQQQQQQQK", "....KYDYDYDYDK",
    "....KQQQQQQQQQK", "....KQQQQQQQQQK", "...KQQQQQQQQQQQK", "...KQQQQQQQQQQQQK",
  ];
  /* Agattita: pelaje gris, rubor, luz arriba en las orejas (sin la franja clara del costado). */
  HD_AGATTITA34.contorno = "#272736";
  HD_AGATTITA34.mapa = {
    "#8C7B6A": "#7E7E8F", "#4F4236": "#43434F", "#B5A592": "#C2C2D1", "#F6F0E6": "#FFFFEB", "#D9CDBB": "#C2C2D1", "#2F6B45": "#3CA370",
    "#1E4A2F": "#3D6E70", "#4C8E62": "#8FDE5D", "#9A6A3A": "#BA6156", "#6E4824": "#8C3F5D", "#7A4A2A": "#8C3F5D", "#55331C": "#5E315B",
    "#B7CAD0": "#C2C2D1", "#62777F": "#7E7E8F", "#D8DEE8": "#C2C2D1", "#86EFAC": "#8FDE5D", "#4ADE80": "#8FDE5D", "#34D399": "#8FDE5D",
    "#E7A9A0": "#C2C2D1", "#E39A86": "#FF9166", "#FFFFFF": "#FFFFEB", "#8FA6AE": "#C2C2D1",
  };
  Object.assign(HD_AGATTITA34.pal = { ...HD_AGATTITA34.pal }, {É: "#606070", Í: "#FFB5B5"});   // Í: rubor (las orejas van en gris)
  HD_AGATTITA34.cuerpo = [
    "..........KK.........KK", ".........KIZK.......KZIK", "........KIIFFK.....KFFIK", "........KIFFFFKKKKKFFFFK",
    ".......KFFfFFFOOOOOOFFFK", ".......KFFFfFFFOMMOfFFFFK", "......KFFFFFfFFFFFFfFFFFK", "......KFFFFFFFFFFFFFFFFFFK",
    "......KFFFFFKKFFFFFKKFFFFK", "......KFFFFFKWFFFFFKWFFFFK", ".....KFFFFFFKKFFFFFKKFFFFFK", "...KFfFFFFfFWWWWNNWWWWFfFFfFK",
    "....KFfFFFFFWWWKWWKWWWFFfFFK", "......KFFFFFÍWWWWWWWWÍFFFK", "........KKFFFWWWWWWWWFFKK", "..........KÉÉgggggggKKK",
    "..........KGGGGGGGGGK", ".........KGGGGGGMGGGgK", ".........KHgGGGGGGGgGK", "..........KKgWWWWWgKK",
    "............KWWWWWWKK", "............KWWwWWWK", "............KFWWWWFK", "............KBBBBBBK",
    "............KBbBBbBK", "...........KgTTTTTTK", "...........KTTTtTTTK", "...........KKKKKKKKK",
  ];
  /* Cupe: brillo en los ojos. */
  HD_CUPE34.contorno = "#272736";
  HD_CUPE34.mapa = {
    "#141218": "#272736", "#F6F4EE": "#FFFFEB", "#E9E3D6": "#C2C2D1", "#D6CFC0": "#C2C2D1", "#F2C230": "#FFE478", "#D7263D": "#EB564B",
    "#FFFFFF": "#FFFFEB", "#E8E4F0": "#FFFFEB", "#8E939C": "#7E7E8F", "#5F646E": "#606070", "#C9A24B": "#F2A65E", "#7A5230": "#8C3F5D",
    "#24212B": "#43434F", "#C0263A": "#EB564B", "#8A1A2A": "#B0305C", "#F7A8B8": "#FFB5B5", "#B4B9C2": "#C2C2D1", "#D9DEE6": "#FFFFEB",
    "#F2D27A": "#FFE478", "#2A1E22": "#3E2347",
  };
  Object.assign(HD_CUPE34.pal = { ...HD_CUPE34.pal }, {Á: "#BA6156", É: "#272736"});
  HD_CUPE34.cuerpo = [
    "............O...O...O", "............OO.OOO.OO", "............OROOROORO", ".........KKKOOOOOOOOOKKK",
    ".......KKvWKYYYYYYYYYKWvKK", "......KvWWWWWWWWWWWWWWWWvK", ".....KvWvWWWWWWWWWWWWWWvWvK", ".....KWWWWWWWWWWWWWWWWWWWWK",
    "....KwKWWWWWWWWWWWWWWWWWWKwK", "...KGwKWWWWWWWKWWWWWWWKWWWKwwK", "...KwwKWWWWWWKKWWWWWWKKWWWKwwK", "...KwwKWWWWWWKKWWKKWWKKWWWKwwK",
    "...KwwKWWWPPWWWKWKKWKWWPPWKwwK", "...KwwKWWWWWWWWWKWWKWWWWWWKwwK", "...KwwKKWWWWWWWWWWWWWWWWWKKwwK", "....KwwKKKWWWWWWWWWWWWWKKKwwK",
    ".....KKK.KGGGGKZZZKGGK...KKK", "........KgGGGYÁZLZÁYGK", "........KGgGGYKBZBKYGK", "........KGgGGYKBYBKYGK",
    "........KGgGGYKBBBKYGK", "........KGgGGYKBYBKYGK", "........KGgGGYÉDDDÉYGK", "........KGgGGYÉDDDÉYGK",
    "........KGgGYYÉDKDÉYGK", "........KKKKKKKDKDKKKK", ".............KDDKDDK", ".............KDDKDDK",
  ];
  /* Malia: blusa durazno. */
  HD_MALIA34.contorno = "#272736";
  HD_MALIA34.mapa = {
    "#ECEEF4": "#FFFFEB", "#B4BACA": "#C2C2D1", "#F4F2EC": "#FFFFEB", "#CFCBC0": "#C2C2D1", "#EBB2A6": "#FFB5B5", "#C7867A": "#FF9166",
    "#F5CABF": "#FFB5B5", "#F4A3AE": "#FF6B97", "#C9707A": "#FF6B97", "#A9445A": "#B0305C", "#CDB898": "#FFB570", "#A8946F": "#FF9166",
    "#8A5A2A": "#BA6156", "#64401C": "#8C3F5D", "#24212B": "#43434F", "#3A3644": "#606070", "#C9A24B": "#F2A65E", "#E8304A": "#EB564B",
    "#B01E36": "#B0305C", "#FBE38A": "#FFE478", "#3E9A42": "#3CA370", "#2F7D32": "#3D6E70", "#FFFFFF": "#FFFFEB", "#C68A4E": "#BA6156",
    "#E2D2B4": "#C2C2D1", "#3A3A48": "#43434F", "#15121A": "#322947", "#0E0A12": "#322947", "#F0407A": "#FF6B97", "#E2B07A": "#FFB570",
    "#FF7FA6": "#FF6B97", "#F2C893": "#FFB570", "#FFD0DE": "#FFB5B5", "#2F8F5A": "#3CA370",
  };
  Object.assign(HD_MALIA34.pal = { ...HD_MALIA34.pal }, {Á: "#7E7E8F", É: "#BD4882", Í: "#E36956", Ó: "#73275C", Ú: "#272736"});
  HD_MALIA34.cuerpo = [
    "..........KKKK", ".........KhHHhK", ".........KHhHHK", "........KKWKWKWKK",
    ".......KhWWWWWWWhK", "......KhHHHHHHHHHhK", ".....KhHhHHHHHHHHHK", ".....KHhHHHHHHHHHHhK",
    "....KKHhHHpzSSSSSSHK", "...KSÁhHHpSSKKSSKKHK", "....KSÁhHpSSKZSSKZK", "....KpHhHÉPSSSsSSPK",
    ".....KHhÍsSSSSsSSSK", ".....KHhÍsSSSmmSSK", "......KKKKssSSSÓK", ".........KKBBsK",
    "........KsBBWWWBK", ".......KsBBBWWWWBK", "......KsbBBBWWwWBsK", "......KBbBBBWWWWBBK",
    "......KBbBBBWWWWBBK", "......KDDDDDDDDDDDK", "......KDdDDDDDDDDDK", "......KNNWWWWWWWWK",
    "......KNNWWWwGgGWK", ".....KÚNNWWWRRgRRWWK", ".....KNNNWWWRTRRrWWK", ".....KNNNNWWRRRTrWWWK",
  ];
}
/* ======================= PALETA PEAR36 (tanda 3: Uchis, Janet, July) =======================
   Mismas reglas que Jelic; colores traducidos con c.mapa (ver hdColor). */
{
  /* Uchis: piel rosada clara, pelo café rojizo, pañuelo rojo, banda turquesa, brillo en los ojos. */
  HD_UCHIS34.contorno = "#272736";
  HD_UCHIS34.mapa = {
    "#F06A52": "#FF9166", "#D8402E": "#EB564B", "#9E2A1E": "#B0305C", "#7A4A36": "#964253", "#5A3426": "#5E315B", "#3E2218": "#3E2347",
    "#A0503A": "#964253", "#6E3424": "#57294B", "#7A4A2C": "#BA6156", "#4E2E1A": "#8C3F5D", "#E0B040": "#FFE478", "#3B82F6": "#4DA6FF",
    "#F6DCCB": "#FFB5B5", "#D7B09C": "#FF9166", "#D9667A": "#FF6B97", "#F2E8D0": "#FFFFEB", "#2F8F8A": "#3D6E70", "#8A5A30": "#BA6156",
    "#FFFDF4": "#FFFFEB", "#CFC3A6": "#C2C2D1", "#B88A5A": "#E36956", "#9A6A3A": "#BA6156", "#6E4424": "#8C3F5D", "#C9A24B": "#F2A65E",
    "#D9DEE6": "#C2C2D1", "#9AA3B0": "#C2C2D1", "#FFFFFF": "#FFFFEB",
  };
  HD_UCHIS34.pal = { ...HD_UCHIS34.pal, "Á": "#E36956", "É": "#5E315B", "Í": "#73275C" };
  HD_UCHIS34.cuerpo = [
    "..........KKKKKKK", "........KKhHHHHHhKK", ".......KhHhHHHHHHHhK", "......KhhHHHHHHHHHHhK",
    "......KHhHHHHHHHHHHHK", ".....KhhHHHHGGGGGEGGK", ".....KHhHHHhSSSSSSSSK", ".....KHhHHhShhhShhhSK",
    ".....KHhHHhSSCSSSCSSK", ".....KHhHHhSSKSSSKSSK", "....KhhHHhsSSSSSsSSSK", "....KHhHHhsSSSSLLSSSK",
    "....KHhHHHhsSSSSSSSK", "....KHhHHHHhÁssSSSK", "....KHhHHHhRCCÁLKK", "....KHhHHhRRCCCCK",
    "....KHhHhRRCYTTTYK", "....KHhHhRCCYTYTYCK", "....KHhHhRCCYYYYYCK", "....KHhÉRrCCYTYTYCK",
    ".....KhÉRrCCYTTTYCK", ".....KKKRrÍBBBBGBBK", "........KrCCYTTTYCK", "........KrCCYTYTYCcK",
    "........KrCCYYYYYCCK", "........KrCCYTYTYCCK", "........KrCCYTTTYCCK", "........KKCCYTTTYCK",
  ];
  /* Janet: piel rosada clara, pelo dorado, túnica verde, brillo en los ojos. */
  HD_JANET34.contorno = "#272736";
  HD_JANET34.mapa = {
    "#8A6446": "#BA6156", "#6B4A30": "#8C3F5D", "#4A3020": "#5E315B", "#3A2418": "#5E315B", "#24160E": "#3E2347", "#C9A577": "#F2A65E",
    "#9A7A50": "#BA6156", "#F0D2BC": "#FFB5B5", "#CFA88F": "#FF9166", "#EDEAE0": "#FFFFEB", "#8A6640": "#8C3F5D", "#6B4430": "#8C3F5D",
    "#5FA83E": "#3CA370", "#C2622E": "#E36956", "#8E3E1C": "#964253", "#C9A24B": "#F2A65E", "#3E7A2A": "#3D6E70", "#7FC25A": "#8FDE5D",
    "#FFE6D4": "#FFFFEB", "#B07A44": "#BA6156", "#8A5A30": "#964253", "#D9DEE6": "#C2C2D1", "#4ADE80": "#8FDE5D",
  };
  HD_JANET34.pal = { ...HD_JANET34.pal, "Á": "#C2C2D1", "É": "#3E2347" };
  HD_JANET34.cuerpo = [
    "..........KKKKKK", "........KKhHHHHhKK", ".......KhHhHHHHHHhK", "......KhhHHHHHHHHHhK",
    "......KHhHHHHHHHHHHhK", ".....KhhHHHHHHHHHHHHK", ".....KHhHHHHHHHHHHHHK", ".....KHShHHHHHSSSSSSK",
    ".....KHSShHHhhhShhhSK", ".....KHsShhSSWSSSWSSK", "..KK.KHhHHBSSKSSSKSSK", ".KÁWKKHhHKDSSSSSsSSSK",
    ".KWQKKHhHKDDSSDDDDDDK", "..KQKKHhHHKDDDDSSDDK", "..KQKKHhHHHBDDDDDDK", "..KQKKhHHgGGLBBBKK",
    "..KQKKhHgGGLlLGGK", "..KQKKhDGGLlLlLGgK", "..KQKKDGGlLlLlLGGK", "..KQKKGGGLlLlLlGGK",
    "...KQBGGGlLlLlLGGK", "...KQBGGÉBBBBYBBBK", "...KQBGgGLlLlLGGGK", "....KKGgGGLlLGGGgK",
    "......KgGGGGGGGGgK", "......KggGGGKGGGgK", "......KggggggggggK", "......KKKKKKKKKKKK",
  ];
  /* July: piel durazno, barba blanca, delantal café, brillo en los ojos. */
  HD_JULY34.contorno = "#272736";
  HD_JULY34.mapa = {
    "#7A7E8A": "#7E7E8F", "#5A5E6A": "#606070", "#3E414A": "#43434F", "#A9B2BF": "#C2C2D1", "#7C8594": "#7E7E8F", "#D9A27A": "#FFB5B5",
    "#F2CDA8": "#FFB5B5", "#F2F2F2": "#FFFFEB", "#A8714C": "#FF9166", "#7A4A2A": "#8C3F5D", "#5A341C": "#5E315B", "#C9A24B": "#F2A65E",
    "#94603A": "#BA6156", "#8E2A20": "#B0305C", "#9A6A3A": "#BA6156", "#5A4A40": "#5E315B", "#3A2A20": "#3E2347", "#6E4824": "#8C3F5D",
    "#5E6673": "#606070", "#9AA3B0": "#C2C2D1", "#D9DEE6": "#C2C2D1", "#9B1428": "#964253", "#C8C8D0": "#C2C2D1", "#E8B830": "#FFE478",
  };
  HD_JULY34.cuerpo = [
    ".........KKKKKK", ".......KKSZZSSsKK", "......KSZZSSSSSSsK", ".....KSZSSSSSSSSSsK",
    ".....KSSSSSSSSSSSSK", ".....KSSSSSSSSSSSSsK", ".....KSSSSWWWSWWWSSK", "....KSKSSSSWSSSWSSSK",
    "....KsKSSSSKSSSKSSSK", ".....KSSSSSSSSsSSSSK", ".....KSSSSSWWWWWSSSK", ".....KSSSWWWKKWWWSSK",
    "......KSSWWWWWWWSSK", ".......KKSWWWWWSKK", "..........KSSSSK", "........KKAASSAaKK",
    "......KSSSSaGAAAAGaK", "......KSSSSaAAAAAAaK", "......KsSSSalAAAAAaK", "......KsSSalAAAAAAaK",
    "......KsSaAlAAAaaAaK", "......KsaAAlAAAaAaaK", "......KBBBBBBBGBBBBK", "......KPMMMlAAAAmmaK",
    "......KPahAlAAAAmAmK", "......KPahAlAaaAmAmK", "......KPahAlAAAAAAaK", "......KPaAAlAAAAAAaK",
  ];
}
/* ======================= PALETA PEAR36 (tanda 4: Edith, Uzu, Xitin) =======================
   Mismas reglas que Jelic; colores traducidos con c.mapa (ver hdColor). */
{
  /* Edith: piel tostada, pelo negro, túnica ciruela, brillo en los ojos. */
  HD_EDITH34.contorno = "#272736";
  HD_EDITH34.mapa = {
    "#4A3A50": "#43434F", "#2A1C30": "#3E2347", "#0E0812": "#272736", "#1E1A22": "#43434F", "#4A4256": "#606070", "#F0D6C8": "#F2A65E",
    "#C9A898": "#BA6156", "#9B2D5A": "#B0305C", "#4E2A6E": "#5A265E", "#E8DFC4": "#FFFFEB", "#341A4C": "#422445", "#B8902A": "#F2A65E",
    "#6E4A8E": "#80366B", "#5A5A6A": "#606070", "#3A3A48": "#323E4F", "#6E3C96": "#80366B", "#F4EEDC": "#FFFFEB", "#B9AE92": "#C2C2D1",
    "#C9BFA6": "#C2C2D1", "#E9D5FF": "#FFFFEB", "#C4A7FF": "#BD4882", "#FFFFFF": "#FFFFEB", "#C4B5FD": "#BD4882",
  };
  HD_EDITH34.pal = { ...HD_EDITH34.pal, "Á": "#272736" };
  HD_EDITH34.cuerpo = [
    "..........KKKKKK", "........KKÁhHHhÁKK", ".......KÁhHHhHHhHÁK", "......KÁHhHHHhHHHhÁK",
    "......KhHHHhHHHHHHHK", ".....KÁHhHHHHHHHHHHHK", ".....KhHHHhHHÁSSSSSSK", "....KÁHhHHHHÁSSSSSSSK",
    "....KhHHhHHÁSHHHSHHHK", "....KHHhHHHÁSSCSSSCSK", "...KHHHhHHÁSSSKSSSKSK", "...KHHhHHHÁsSSSSsSSSK",
    "...KhHHhHHÁsSSSLLSSK", "...KHHhHHHHÁssSSSSK", "...KhHHhHHHHpKsSKK", "...KHHhHHHpPPKpK",
    "...KhHHhHpPPPPPpK", "...KHHhHpPPCPPPPCK", "...KhHHpPPPCPPPPCPK", "...KHhHpPPPPCPPPCPK",
    "...KhHHpPpPPCPPPCPK", "...KHhpPPpPPCBBBCBK", "....KKKPPpPPPCPCPPK", ".......KPPpPPPPCPPpK",
    ".......KPpPPPPPCPPPK", "......KpPpPPPPPCPPPpK", "......KPpPPPPPPCPPPPpK", ".....KPPpPPPPPPCPPPPPPK",
  ];
  /* Uzu: piel verde lima, casco gris, ojos rojos con brillo; modo berserk en rojo Pear36. */
  HD_UZU34.contorno = "#272736";
  HD_UZU34.mapa = {
    "#8A6438": "#BA6156", "#6B4A2A": "#8C3F5D", "#4A321C": "#5E315B", "#4A7A2C": "#3CA370", "#2E5418": "#323E4F", "#B8C0CC": "#C2C2D1",
    "#5E636E": "#606070", "#8A909C": "#7E7E8F", "#6FA544": "#8FDE5D", "#E04848": "#EB564B", "#E8E4D8": "#FFFFEB", "#5A3A22": "#5E315B",
    "#D6CFBC": "#C2C2D1", "#7A5232": "#8C3F5D", "#C9A24B": "#F2A65E", "#8FC064": "#CFFF70", "#B8B2A2": "#C2C2D1", "#3E4048": "#43434F",
    "#2A2C33": "#272736", "#9AA3B0": "#C2C2D1", "#FFF3B0": "#FFE478", "#F2C230": "#FFE478", "#8E8570": "#7E7E8F",
  };
  HD_UZU34.pal = { ...HD_UZU34.pal, "Á": "#43434F", "É": "#3D6E70", "Í": "#B0305C" };
  HD_UZU34.cuerpo = [
    "", "", "", "",
    "", "", "", "",
    ".............K..K..K", "............KMKKMKKMK", "...........KÁBBBBBBBÁK", "..........KÁBbBBBBBBBÁK",
    "..KK....KBBbBBBBBBBBBBÁK...KK", ".KgÉKK..KBBBBBBBBBBBBBBK..KggK", ".KGGggKKgGGGGGGGGGGGGGGKKGGgK", "..KGGgGKGGGWRÍGGGGWgGGGKKGgK",
    "...KKGgKGGGRRÍGGGGRÍGGGGK", ".....KKKGGGGGGGGGGgGGGGGK", "........KGGgWgWgWgWgWgGK", ".........KGGGKgKgKgKgGGK",
    "..........KgGGGGGGGGKK", "..........KWtVWtWVtWK", "..........KTtTTWVTtTK", "..........KTTTtVTTTTK",
    "..........KBBBBYBBBBK", "..........KTTtTTTtTTK", "..........KtTTTTTTtTK", "..........KKKKKKKKKKK",
  ];
  /* Xitin: piel rosada clara, cola de caballo rubia, oso café rojizo, brillo en los ojos. */
  HD_XITIN_NUEVA2.contorno = "#272736";
  HD_XITIN_NUEVA2.mapa = {
    "#553418": "#8C3F5D", "#F4E7B8": "#FFE478", "#FFFBEA": "#FFFFEB", "#C9B47A": "#F2A65E", "#3A3646": "#43434F", "#24212B": "#322947",
    "#14121A": "#272736", "#A9B2BF": "#C2C2D1", "#7C8594": "#7E7E8F", "#F2D6C4": "#FFB5B5", "#4A3A5A": "#5A265E", "#CFA88F": "#FF9166",
    "#C9707A": "#FF6B97", "#E6E1D6": "#FFFFEB", "#6B4426": "#8C3F5D", "#C9A24B": "#F2A65E", "#FFF0E4": "#FFFFEB", "#E5E7EB": "#FFFFEB",
    "#B8C0CC": "#C2C2D1", "#DCFCE7": "#FFFFEB", "#86EFAC": "#66FFE3", "#6B3F22": "#8C3F5D", "#9A6B40": "#BA6156", "#1A1420": "#272736",
    "#E2C79C": "#FFB570", "#4ADE80": "#8FDE5D", "#9A6A3E": "#BA6156", "#F2E8C4": "#FFFFEB", "#F4A6B8": "#FFB5B5", "#6E4626": "#8C3F5D",
    "#FFFFFF": "#FFFFEB", "#EBD2AE": "#FFB5B5", "#B8865A": "#BA6156", "#F6E4C8": "#FFFFEB", "#A57A4E": "#BA6156", "#F2EEE0": "#FFFFEB",
    "#5A1E2A": "#57294B", "#4A2E18": "#5E315B", "#8A5E38": "#964253", "#4E2C16": "#5E315B", "#B0A898": "#C2C2D1", "#D8DEE8": "#C2C2D1",
    "#5A3A28": "#8C3F5D", "#40281A": "#5E315B", "#7A4E2C": "#BA6156",
  };
  HD_XITIN_NUEVA2.pal = { ...HD_XITIN_NUEVA2.pal, "Á": "#422445", "É": "#E36956" };
  HD_XITIN_NUEVA2.cuerpo = [
    "..........KKKKKK", "........KKhHZHHhKK", ".......KhHhHHZHHHhK", "......KhHhHHHHHHHHhK",
    "......KHhHHHHHHHHHHhK", ".....KhhHHHHHHHHHHHHK", ".....KHhHHHHHHHpSSSSK", ".....KHhHHHHHpSSSSSSK",
    "....KhhHHHHHphhhShhhK", "....KHhHHHHpSSZSSSZSK", "...KSUhHHHHpSSKSSSKSK", "....KHhHHHHÁRSSSSsSSK",
    "....KKHhHHÉsRSSSSSSK", "....KHhHHÉsSSSSppSK", "....KHhHHHÉssSSSSK", ".........KKSSSKK",
    ".......KSSSSSSSSSK", ".......KSNNNNNNNSK", ".......KNNNNNNNNNK", ".......KNnNNNNNNNK",
    ".......KFFFFFFFFFK", ".......KSSSSsSSSSK", ".......KSSSSSSsSSK", ".......KBBBBGBBBBK",
    ".......KPPPPPPPPPK", ".......KPPPPPPPPPK", ".......KPPPPKPPPPK", ".......KPqPPKPPqPK",
  ];
}
/* Pantalones, calzas y zapatos con más variedad (Pear36), a juego con la paleta de cada personaje.
   Se cambia el objeto en su lugar para que también lo vean las versiones de podio armadas antes. */
Object.assign(HD_LATTE34.pierna, { luz: "#3D6E70", base: "#323E4F", sombra: "#322947", base2: "#323E4F", bota: "#BA6156", botaSombra: "#8C3F5D" });   // pantalón azul petróleo, botas café como el abrigo
Object.assign(HD_CUPE34.pierna, { bota: "#EB564B", botaSombra: "#B0305C" });   // zapatos rojos de rey, como la capa
Object.assign(HD_MALALA34.pierna, { luz: "#3D6E70", base: "#323E4F", sombra: "#322947", bota: "#8C3F5D", botaSombra: "#5E315B" });   // medias verde oscuro como el sombrero, zapatos café
Object.assign(HD_MALIA34.pierna, { luz: "#FFFFEB", base: "#C2C2D1", sombra: "#7E7E8F", bota: "#EB564B", botaSombra: "#B0305C" });   // medias blancas de cocinera, zapatos rojo frutilla
Object.assign(HD_KENNY34.pierna, { luz: "#4B5BAB", base: "#473B78", sombra: "#322947", bota: "#BA6156", botaSombra: "#8C3F5D" });   // pantalón índigo, botas café como el laúd
Object.assign(HD_TIVAN34.pierna, { luz: "#C2C2D1", base: "#7E7E8F", sombra: "#606070", bota: "#8C3F5D", botaSombra: "#5E315B" });   // pantalón gris como su pelo, botas café
Object.assign(HD_PATROCLUS34.pierna, { bota: "#BA6156", botaSombra: "#8C3F5D" });   // botas de cuero café de explorador
Object.assign(HD_UCHIS34.pierna, { luz: "#3D6E70", base: "#323E4F", sombra: "#322947", bota: "#8C3F5D", botaSombra: "#5E315B" });   // calzas turquesa oscuro como su banda
Object.assign(HD_JANET34.pierna, { luz: "#F2A65E", base: "#BA6156", sombra: "#8C3F5D", bota: "#3D6E70", botaSombra: "#323E4F" });   // pantalón café claro, botas verde bosque
Object.assign(HD_EDITH34.pierna, { bota: "#80366B", botaSombra: "#5A265E" });   // zapatos ciruela como su túnica
/* ======================= PALETA PEAR36 (tanda 2: Latte, Kenny, Tiván, Patroclus) =======================
   Mismas reglas que Jelic; colores traducidos con c.mapa (ver hdColor). */
{
  /* Latte: piel durazno, sombrero ciruela, abrigo café rojizo, brillo en los ojos. */
  HD_LATTE34.contorno = "#272736";
  HD_LATTE34.mapa = {
    "#283147": "#322947", "#4A6E55": "#3CA370", "#2F4A3A": "#3D6E70", "#1C2E24": "#323E4F", "#56637E": "#606070", "#3B4660": "#43434F",
    "#2A2230": "#272736", "#1A1520": "#272736", "#45405A": "#473B78", "#2A2733": "#322947", "#17151D": "#272736", "#F4F1E8": "#FFFFEB",
    "#C0263A": "#EB564B", "#8A1A2A": "#B0305C", "#C8622E": "#E36956", "#E58A4E": "#FF9166", "#8E3E18": "#964253", "#D9A27A": "#FFB570",
    "#A8714C": "#FF9166", "#45393F": "#43434F", "#B9804A": "#BA6156", "#EAD7B7": "#FFFFEB", "#85562E": "#8C3F5D", "#4A2E22": "#5E315B",
    "#D4AF4F": "#FFE478", "#D9A46C": "#F2A65E", "#5E8E98": "#7E7E8F", "#3E6E78": "#3D6E70", "#F8F5EE": "#FFFFEB", "#D9D2C2": "#C2C2D1",
    "#D7263D": "#EB564B", "#FFFFFF": "#FFFFEB", "#F9A8D4": "#FFB5B5", "#EDBE96": "#FFB570", "#2E262B": "#272736", "#C9B48F": "#C2C2D1",
  };
  HD_LATTE34.pal = { ...HD_LATTE34.pal, "Á": "#3E2347" };
  HD_LATTE34.cuerpo = [
    "............KKKKKKK", "............KtTTTTK", "............KtTTTuK", "............KtTTTuK",
    "............KtTTWWK", "............KYYYWYK", "............KyyyyyK", ".........KKKKTTTTTKKKK",
    "........KtTTTTTTTTTTTuK", "........KHiHHHiHHHHhK", ".......KHiHhHHSHSSSSiK", "........KHiHhhhhSShhhK",
    ".......KHhHhSSWSSSSWSK", "........KhHhSSESSsSESK", ".........KhHSSSSSssSSK", ".........KhXXSXXXXXXSK",
    "..........KXXXXSSXXXK", "...........KXXXXXXXK", "..........KjJJJuLLLjJJK", "..........KJJJJjLLLjJJK",
    "..........KjJJJjLLLjJJK", "..........KjJJJJjLjJJJK", "..........KjJJJJjLjJJJK", "..........KjJJJJJÁJJJJK",
    "..........KjBBBBBBGBBBK", "..........KjJJJJJJJJJJK", "..........KjjJJJJJJJJJK", "..........KKjjjjjjjjjjK",
  ];
  /* Kenny: piel durazno, chaqueta burdeo, chaleco verde. */
  HD_KENNY34.contorno = "#272736";
  HD_KENNY34.mapa = {
    "#E07F48": "#F2A65E", "#C0622B": "#BA6156", "#8A421B": "#8C3F5D", "#8A6446": "#BA6156", "#6B4A30": "#8C3F5D", "#4A3020": "#5E315B",
    "#3A2418": "#3E2347", "#24160E": "#3E2347", "#3B2618": "#5E315B", "#22150C": "#3E2347", "#D6A27C": "#FFB570", "#22222E": "#272736",
    "#7DD3FC": "#4DA6FF", "#AE7655": "#FF9166", "#6B4426": "#8C3F5D", "#1C8C85": "#3CA370", "#12645F": "#3D6E70", "#7A2E3A": "#73275C",
    "#5E8F4E": "#3CA370", "#561E28": "#422445", "#4A2E22": "#5E315B", "#D9A13B": "#F2A65E", "#E8B27A": "#F2A65E", "#8A5228": "#964253",
    "#C98A4A": "#E36956", "#E0A868": "#F2A65E", "#A86A34": "#BA6156", "#2A1608": "#3E2347", "#FFF4DC": "#FFFFEB", "#E5E7EB": "#FFFFEB",
    "#9A4A56": "#964253", "#E8B892": "#FFB570", "#5A3C26": "#8C3F5D", "#FFFFFF": "#FFFFEB",
  };
  HD_KENNY34.cuerpo = [
    ".........................", "...........KKKKKK", ".........KKhHHHHhKK", "........KhHhHHHHHHhK",
    ".......KhHhHHHHHHHHhK", ".......KHhHHHHHHHHHHhK", "......KhHhHHHHHHHHHHHK", "......KHhHHHhhhhShhhhK",
    "......KHhHHhSSSSSSSSSK", "......KHhHHhSFQFFFFQFK", "......KHHhHhSFFFSSFFFK", "......KHhHHhsSSSSsSSSK",
    "......KHhHKDDSDDDDSDDK", ".......KhHKDDDDSSDDDK", ".......KKKKDDDDDDDDK", "...........KHDDDDKK",
    "........KKTTTTTTTK", ".......KtTTTtTTTTtK", ".......KTTjTTTTTTTK", "........KJJJJGGJJJjK",
    "........KJJJGGGJJJJK", "........KJjJGGGJJJJK", "........KJjJGGGJjJJK", "........KBBBBBYBBBBK",
    "........KJjGGGGGJJJK", "........KJjGGGGGJJJK", "........KjjGGGGGjjJK", "........KKjjjjjjjjjK",
  ];
  /* Tivan: piel durazno, abrigo verde azulado, pelo gris, brillo en los ojos. */
  HD_TIVAN34.contorno = "#272736";
  HD_TIVAN34.mapa = {
    "#141218": "#272736", "#B08A2E": "#3D6E70", "#80621C": "#323E4F", "#7A5A44": "#8C3F5D", "#5A3A28": "#5E315B", "#3E2618": "#3E2347",
    "#221A20": "#272736", "#120E12": "#272736", "#C4C8D2": "#C2C2D1", "#868C9C": "#7E7E8F", "#E6E9F0": "#FFFFEB", "#5A3A22": "#8C3F5D",
    "#C9A24B": "#F2A65E", "#9BD8F0": "#4DA6FF", "#C99470": "#FFB570", "#9E6B4B": "#FF9166", "#EEF0F2": "#FFFFEB", "#4ADE80": "#8FDE5D",
    "#4A2E22": "#5E315B", "#7A5232": "#BA6156", "#FFFFFF": "#FFFFEB", "#C2C6CE": "#C2C2D1", "#9A7252": "#BA6156", "#BBF7D0": "#66FFE3",
    "#16A34A": "#3CA370", "#D9E8E0": "#FFFFEB", "#8A5A2A": "#964253", "#86EFAC": "#66FFE3", "#5A5568": "#606070", "#24212B": "#272736",
    "#15131A": "#272736", "#0E0C12": "#272736", "#050406": "#272736", "#2B2833": "#322947", "#F4F4F6": "#FFFFEB", "#1B1920": "#272736",
    "#E0304A": "#EB564B", "#9B1428": "#964253", "#3E3A4A": "#43434F", "#4A4558": "#43434F", "#D0AA4A": "#3CA370",
  };
  HD_TIVAN34.pal = { ...HD_TIVAN34.pal, "Á": "#4B5BAB", "É": "#606070", "Í": "#E36956" };
  HD_TIVAN34.cuerpo = [
    "........K...K...K", ".......KHK.KHK.KHK", "......KhhhKhhhKhhhK", ".....KHhHIHHHIHHHHhK",
    "......KHhHHHHHHHHHHHK", ".....KHhHHHHKoÁoKoÁoK", "......KhHEEEKGQGKGQGKK", ".......KhHHHKoÁoKoÁoKK",
    ".......KHhHHhHHHSHHHK", "......KhHhHhSSISSSISK", "......KSÉhHÍSSKSSSKSK", "......KKKhÉsSSSSsSSSK",
    ".........KKsSSSssSSK", "..........KKssSSSK", "........KOOKKÍsoOK", ".......KoOOOoWWoOoK",
    "......KoOoOOoWWDOOoK", "......KOOoOBVBVBVBOoK", "......KOoOOOBBBBBBOOOK", "......KOoOOOOOOOOOOOK",
    "......KOoOKDDDDGDDDDK", "......KOoOKUUOOOUUOOK", "......KOoOKOOOOOOOOOK", "......KOoOKOOOOOOOOOK",
    "......KOoOOKOOOOOOOOK", "......KOoOOKOOOOOOOOoK", "......KOoOOOKOOOOOOOOK", "......KOoOOOKOOOOOOOOK",
  ];
  /* Patroclus: piel tostada, pelo negro, pañuelo rojo, pantalón azul, brillo en los ojos. */
  HD_PATROCLUS34.contorno = "#272736";
  HD_PATROCLUS34.mapa = {
    "#C8372B": "#EB564B", "#8E2418": "#B0305C", "#6A7A98": "#7E7E8F", "#4A5A78": "#4B5BAB", "#33405A": "#323E4F", "#3A2A1E": "#3E2347",
    "#241A12": "#3E2347", "#1A1518": "#43434F", "#3A3036": "#606070", "#B07B55": "#F2A65E", "#86583A": "#BA6156", "#8A5A36": "#BA6156",
    "#F4E9C8": "#FFFFEB", "#2DD4BF": "#66FFE3", "#6A4026": "#8C3F5D", "#3A2418": "#5E315B", "#C9A24B": "#F2A65E", "#FFFFFF": "#FFFFEB",
    "#BDB5A6": "#C2C2D1", "#CC9670": "#FFB570", "#F4F4F0": "#FFFFEB", "#F2C230": "#FFE478", "#CFCFC8": "#C2C2D1", "#B8901C": "#F2A65E",
    "#6B4423": "#8C3F5D", "#4A2E17": "#5E315B", "#9A6A3A": "#BA6156", "#6E4824": "#8C3F5D", "#3E8A8A": "#3D6E70", "#C0283A": "#B0305C",
    "#B8BCC4": "#C2C2D1", "#7A4A34": "#964253", "#CFE3EA": "#C2C2D1", "#5A5F66": "#606070", "#5A3424": "#5E315B", "#E8D44A": "#FFE478",
    "#B8A030": "#F2A65E", "#A87A5E": "#BA6156", "#E5E7EB": "#FFFFEB", "#9AA3B0": "#C2C2D1", "#E8604E": "#FF9166", "#E9E4DA": "#FFFFEB",
  };
  HD_PATROCLUS34.pal = { ...HD_PATROCLUS34.pal, "Á": "#272736", "É": "#73275C", "Í": "#473B78" };
  HD_PATROCLUS34.cuerpo = [
    "", "", "", ".........KKKKKKK",
    ".......KKÁHHHHHÁKK", "......KÁHHHHHHHHHÁK", "......KHhHHHHHHHHHK", ".....KÁhHHHHHHHHHHK",
    ".....KHhHHHHSSSSSSK", ".....KHhHHÁHHHSHHHK", ".....KHHHÁSSFSSSFSK", ".....KÁSÁSSSKSSSKSK",
    "......KSSKsSSSSsSSK", "......KKsKsSSssSSK", ".........KlsSSSK", "......KGGgGGGGGGGK",
    "......KGgLLlNZNlLK", "......KgÉLLLLlZlLLK", "......KLLLLlLLLLLK", "......KLLLLLLLlLLK",
    "......KBBBBYBBBBBK", "......KLLLLLLLLLLK", "......KTTTTTÍTTTTK", "......KTTTTTTTTTTK",
    "......KTTTTTTTTTTK", "......KTTTTTTTTTTK", "......KTTTTTTTTTTK", "......KKKKKKKKKKKK",
  ];
}
/* Agattita: los pelitos que le salen de lado desde dentro del oído (como a la gata que la inspira).
   Pasan por dentro de la oreja, dejan su contorno intacto y asoman por fuera; al mecerse, la punta cae un poco. */
HD_AGATTITA34.pelo = [
  { 3: ".....Www.w............w.wwW" },
  { 3: "......ww.w............w.ww", 4: ".....W....................W" },
];
/* Cupe desarmado: la espada en el suelo con su mango a la vista. */
HD_CUPE34.armaSuelta = (px) => armaCupe(px, 0, 0, [0.5, -0.87], true);

/* Cintura cerrada: la pierna de atrás se dibuja antes que la ropa y la ropa le tapaba su borde de arriba (quedaban
   pegadas sin línea). cierraCintura dibuja una fila de contorno bajo la ropa, también en las versiones del podio. */
for (const c of [HD_JELIC34, HD_LATTE34, HD_CUPE34, HD_TIVAN34]) c.cierraCintura = true;

/* Uzu berserk: la sombra roja de las botas (heroes.js, uzuSinPolera) también en Pear36. */
HD_UZU34.mapa["#6A1A14"] = "#73275C";

/* Edith desarmada: solo cae el grimorio (la calaverita es un adorno de su ropa, no se suelta con el libro). */
HD_EDITH34.armaSuelta = (px) => HD_EDITH.arma((x, y, col) => { if (x >= 21) px(x, y, col); }, { mano: [0, 0], fase: "guardia", t: 0, k: 0 });

/* ======================= PATROCLUS: BOOMERANG =======================
   En vez del bordón con tótem: un boomerang de madera con franjas en sus colores (rojo de la pañoleta y turquesa).
   Lo lanza, viaja girando hasta el rival y vuelve a su mano; en el podio lo lanza alto y su águila lo atrapa.
   Gira en cuartos de vuelta (4 posiciones del mismo dibujo): el pixel art no se rota. */
{
  const B = HD_PATROCLUS34, AGUILA_POSADA = B.armaDetras;
  const FORMA = [".LLL.........", "LRTLLLLLL....", ".RTMMMMMMLL..", "..SSSSSSMMML.", "........SMMM.", ".........MMS.", ".........MMS.", ".........TTS.", ".........RRS.", ".........RS.."];
  const COL = { L: "#F2A65E", M: "#BA6156", S: "#8C3F5D", R: "#EB564B", T: "#3D6E70" };
  const PUNTA = [4, 4];   // la punta que se toma con la mano, respecto del centro del dibujo
  const gira = ([dx, dy], q) => { for (let r = 0; r < q; r++) [dx, dy] = [-dy, dx]; return [dx, dy]; };
  const boomerang = (px, cx, cy, q) => {
    const pts = [];
    FORMA.forEach((f, y) => [...f].forEach((k, x) => { if (COL[k]) { const [dx, dy] = gira([x - 6, y - 5], q); pts.push([cx + dx, cy + dy, COL[k]]); } }));
    hdContorno(px, pts);
  };
  const enMano = (px, [hx, hy], q) => { const [ox, oy] = gira(PUNTA, q); boomerang(px, hx - ox, hy - oy, q); };   // tomado de la punta
  const pantalla = (g, x, y) => (a, b, col) => { g.fillStyle = col === HDK ? "#272736" : col; g.fillRect(x + HD_OX + a, y + HD_OY + b, 1, 1); };
  const lerp = (a, b, k) => a + (b - a) * k;
  const VUELA = ["golpe", "choque", "sigue"];
  B.choque = [72, 20];   // ataca a distancia: casi no avanza
  B.armaDetras = AGUILA_POSADA;
  B.arma = (px, p) => {
    if (!VUELA.includes(p.fase) && !p.sinBoomerang) enMano(px, p.mano, p.fase === "sube" || p.fase === "alto" ? 0 : 1);
  };
  B.adorno = (px) => [[7, 12, "#E5E7EB"], [7, 13, "#9AA3B0"]].forEach(([x, y, c]) => px(x, y, c));   // el arito de plata: no lo pierde al ser desarmado
  B.armaSuelta = (px) => boomerang(px, 0, -2, 0);
  /* El vuelo: sale de la mano, llega girando al pecho del rival, sube en un arco y vuelve a la mano. */
  const vuelo = (p) => {
    const k = Math.max(0, Math.min(1, p.k || 0)), MANO = [24, 21], RIVAL = [58, 20], ARRIBA = [44, 4];
    if (p.fase === "golpe") return [lerp(MANO[0], RIVAL[0], k), lerp(MANO[1], RIVAL[1], k) - Math.sin(Math.PI * k) * 5];
    if (p.fase === "choque") return [lerp(RIVAL[0], ARRIBA[0], k), lerp(RIVAL[1], ARRIBA[1], k)];
    return [lerp(ARRIBA[0], MANO[0], k), lerp(ARRIBA[1], MANO[1], k) + Math.sin(Math.PI * k) * 3];
  };
  /* Podio: lo lanza lejos; el boomerang queda girando en el aire, el águila deja su vuelta, va a buscarlo, lo atrapa
     y vuelve a dar vueltas alrededor de Patroclus llevándolo en las garras. */
  const LANZA = 300, LLEGA = 1100, ALCANZA = 1600, VUELVE = 2500, LEJOS = [54, 6];
  const circulo = (x, y, t) => { const a = t / 650; return { cx: x + HD_OX + 16 + Math.cos(a) * 20, cy: y + HD_OY + 20 + Math.sin(a) * 6, delante: Math.sin(a) > 0, izq: Math.sin(a) > 0 }; };
  const aguila = (x, y, T) => {
    const lejos = { cx: x + HD_OX + LEJOS[0], cy: y + HD_OY + LEJOS[1] - 6 };
    if (T < LANZA || T >= VUELVE) return circulo(x, y, T);
    if (T < ALCANZA) { const de = circulo(x, y, LANZA), k = (T - LANZA) / (ALCANZA - LANZA); return { cx: lerp(de.cx, lejos.cx, k), cy: lerp(de.cy, lejos.cy, k) - Math.sin(Math.PI * k) * 8, delante: true, izq: false }; }   // va a buscarlo
    const a = circulo(x, y, VUELVE), k = (T - ALCANZA) / (VUELVE - ALCANZA);
    return { cx: lerp(lejos.cx, a.cx, k), cy: lerp(lejos.cy, a.cy, k) - Math.sin(Math.PI * k) * 6, delante: true, izq: true };   // vuelve con él
  };
  const podio = (g, x, y, p, delante) => {
    const T = Math.max(0, p.t || 0), a = aguila(x, y, T), px = pantalla(g, x, y);
    if (a.delante !== delante) return;
    aguilaVuela(g, a.cx, a.cy, T, a.izq);
    if (T >= ALCANZA) boomerang(px, Math.round(a.cx - x - HD_OX), Math.round(a.cy - y - HD_OY + 6), 1);   // en las garras
  };
  B.proyectil = (g, x, y, p) => {
    if (p.enPodio) {
      const T = Math.max(0, p.t || 0), q = Math.floor(T / 70) % 4, px = pantalla(g, x, y);
      if (T > LANZA && T < LLEGA) {   // sale lejos girando
        const k = (T - LANZA) / (LLEGA - LANZA), [hx, hy] = B.manos.alto;
        boomerang(px, Math.round(lerp(hx, LEJOS[0], k)), Math.round(lerp(hy, LEJOS[1], k) - Math.sin(Math.PI * k) * 10), q);
      } else if (T >= LLEGA && T < ALCANZA) boomerang(px, LEJOS[0], LEJOS[1] + Math.round(Math.sin(T / 120)), q);   // girando en el aire, esperando al águila
      return podio(g, x, y, p, true);
    }
    if (!VUELA.includes(p.fase)) return;
    const [bx, by] = vuelo(p);
    boomerang(pantalla(g, x, y), Math.round(bx), Math.round(by), Math.floor((p.t || 0) / 60) % 4);
  };
  B.proyectilAtras = (g, x, y, p) => { if (p.enPodio) podio(g, x, y, p, false); };
  B.retoque = (p, c) => {   // en el podio: celebra saltando, con las manos libres (el boomerang ya va volando)
    if (!p.enPodio) return null;
    const T = Math.max(0, p.t || 0), v = hdPose(c, "victoria", T), alto = v.fase === "alto" || v.fase === "sube";
    const salto = alto ? (Math.floor(T / 260) % 2 ? -5 : 0) : 0;
    return { c: { ...c, retoque: undefined, armaDetras: undefined },
      p: { ...v, enPodio: true, sinBoomerang: T > LANZA, mano: alto ? c.manos.alto : v.mano, bob: alto ? salto : v.bob, agacha: alto && !salto ? 2 : v.agacha || 0 } };
  };
}

/* El oso de Xitin: hocico rugiendo más claro (nariz negra, boca abierta con dos colmillos y la lengua). */
{
  const HOCICO = { 9: [13, "MMKKKKMMB"], 10: [13, "MKWRRWKMB"], 11: [14, "MKPPKMB"], 12: [15, "MKKMM"] };
  OSO34.cuerpo = OSO34.cuerpo.map((f, i) => (HOCICO[i] ? f.slice(0, HOCICO[i][0]) + HOCICO[i][1] + f.slice(HOCICO[i][0] + HOCICO[i][1].length) : f));
}

/* ======================= XITIN: TÚNICA DE INVOCADORA Y BÁCULO =======================
   Túnica azul con ribete dorado al centro, faja roja, mangas claras y un broche con huella de oso.
   En vez del collar lleva un báculo plateado con una garra de oso dorada que abraza una gema verde.
   Al atacar carga maná en la mano libre, le lanza un rayo a la gema y la gema la transforma en oso. */
/* El báculo va inclinado hacia adelante (así la gema no le tapa la cara). Devuelve dónde quedó la gema. */
const BACULO_DIR = [0.42, -0.91];
const baculoXitin = (px, hx, hy, brilla = false) => {
  const pts = [], [dx, dy] = BACULO_DIR, en = (i) => [Math.round(hx + dx * i), Math.round(hy + dy * i)];
  for (let i = -7; i <= 10; i++) { const [x, y] = en(i); pts.push([x, y, "#C2C2D1"], [x + 1, y, "#7E7E8F"]); }   // vara
  { const [x, y] = en(-8); pts.push([x - 1, y, "#F2A65E"], [x, y, "#FFE478"], [x + 1, y, "#F2A65E"]); }   // regatón
  const [bx, by] = en(11);   // la garra dorada abraza la gema
  pts.push([bx - 1, by, "#F2A65E"], [bx, by, "#FFE478"], [bx + 1, by, "#FFE478"], [bx + 2, by, "#F2A65E"]);
  pts.push([bx - 2, by - 1, "#FFE478"], [bx - 2, by - 2, "#F2A65E"], [bx - 1, by - 4, "#FFE478"]);
  pts.push([bx + 3, by - 1, "#F2A65E"], [bx + 3, by - 2, "#BA6156"], [bx + 2, by - 4, "#F2A65E"]);
  pts.push([bx - 1, by - 1, "#8FDE5D"], [bx, by - 1, "#3CA370"], [bx + 1, by - 1, "#3CA370"], [bx + 2, by - 1, "#3CA370"]);
  pts.push([bx - 1, by - 2, "#CFFF70"], [bx, by - 2, "#8FDE5D"], [bx + 1, by - 2, "#8FDE5D"], [bx + 2, by - 2, "#3CA370"]);
  pts.push([bx, by - 3, "#8FDE5D"], [bx + 1, by - 3, "#3CA370"]);
  hdContorno(px, pts);
  px(bx - 1, by - 2, brilla ? "#FFFFEB" : "#CFFF70");   // destello de la gema
  return [bx, by - 2];
};
{
  const X = HD_XITIN_NUEVA2;
  X.pal = { ...X.pal, Ó: "#4B5BAB", Ú: "#473B78", á: "#4DA6FF", é: "#FFE478", í: "#EB564B", ó: "#B0305C", ú: "#FFFFEB" };
  const TORSO = {   // filas 16 a 27 (la túnica), con la huella dorada en las filas 19 a 22
    16: "KúúúúúúúúúK", 17: "KáÓÓÓGÓÓÓÚK", 18: "KáÓÓÓGÓÓÓÚK", 19: "KáÓÓéÓéÓÓÚK", 20: "KáÓéÓÓÓéÓÚK",
    21: "KáÓÓéééÓÓÚK", 22: "KáÓÓéééÓÓÚK", 23: "KíííííGíóíK", 24: "KáÓÓÓGÓÓÓÚK", 25: "KáÓÓÓGÓÓÓÚK", 26: "KáÓÓÓGÓÓÓÚK", 27: "KáÓÓÓGÓÓÓÚK",
  };
  X.cuerpo = X.cuerpo.map((f, i) => (TORSO[i] ? "......." + TORSO[i] : f));
  X.falda = { 28: "......KáÓÓÓÓGÓÓÓÚK", 29: "......KáÓÓÓÓÓGÓÓÓÚK", 30: "......KGGGGGGGGGGGGK", 31: ".......KKKKKKKKKKKKK" };
  X.faldaVuelo = true;
  Object.assign(X.brazo, { luz: "#FFFFEB", base: "#FFFFEB", sombra: "#C2C2D1", mano: "#FFB5B5", manoLuz: "#FFB5B5" });
  Object.assign(X.pierna, { luz: "#C2C2D1", base: "#7E7E8F", sombra: "#606070", bota: "#8C3F5D", botaSombra: "#5E315B", ancho: 3 });
  X.collar = false;
  X.cargaPrevia = 400;   // empieza a cargar antes: la secuencia completa dura más de un segundo y se entiende   // ya no lleva el collar de oso: la desarman como a todos (se le cae el báculo)
  X.manoEncima = true;
  X.manos = { ...X.manos, impulso: X.manos.guardia };   // mientras carga, la mano del báculo se queda a su lado (carga con la otra)
  X.arma = (px, p) => {
    const t = p.t || 0, [sx, sy] = X.brazoCerca.hombro, libre = [sx - 1, sy + 8];
    const [gx, gy] = baculoXitin(px, p.mano[0], p.mano[1], Math.floor(t / 400) % 2 === 1 || p.fase === "impulso");
    if (p.fase !== "impulso") return;
    const k = p.k || 0;
    if (k < 0.5) hdCarga(px, libre[0], libre[1], k / 0.5, "#8FDE5D", "#3CA370", t);   // carga maná en la mano libre
    else if (k < 0.78) {   // le lanza un rayo de maná a la gema del báculo
      const avance = (k - 0.5) / 0.28, fx = Math.round(libre[0] + (gx - libre[0]) * avance), fy = Math.round(libre[1] + (gy - libre[1]) * avance);
      let n = 0;
      hdLinea(libre[0], libre[1], fx, fy, (x, y) => {   // rayo grueso y brillante, con chispitas que titilan a lo largo
        px(x - 1, y, "#8FDE5D"); px(x + 1, y, "#8FDE5D"); px(x, y - 1, "#CFFF70"); px(x, y + 1, "#CFFF70"); px(x, y, "#FFFFEB");
        if ((n++ + Math.floor(t / 60)) % 4 === 0) px(x + 2, y - 2, "#CFFF70");
      });
      hdCarga(px, libre[0], libre[1], 0.4, "#8FDE5D", "#3CA370", t);   // la mano sigue brillando mientras dispara
      px(fx, fy, "#FFFFEB"); px(fx - 1, fy, "#FFFFEB"); px(fx, fy - 1, "#FFFFEB");
    } else hdCarga(px, gx, gy, (k - 0.78) / 0.22, "#CFFF70", "#8FDE5D", t);   // la gema estalla de luz
  };
  X.armaSuelta = (px) => baculoXitin(px, -1, 2);
  const puf = HD_XITIN_NUEVA2.proyectil;   // ¡puf! recién cuando la gema ya recibió el rayo
  X.proyectil = (g, x, y, p) => {
    if (p.fase === "impulso") { if (p.k > 0.9) puf(g, x, y, { ...p, k: 0.56 + (p.k - 0.9) / 0.1 * 0.44 }); return; }
    puf(g, x, y, p);
  };
}
const HD_POR_ID = Object.fromEntries(HEROES_34.map(([base, tc]) => [base.id, tc]));
const HD_BASE_POR_ID = Object.fromEntries(HEROES_34.map(([base]) => [base.id, base]));
export { HDK, hdColor, armaCupe, HD_OX, HD_OY, aguilaVuela, conCollarUzu, gataCalico, gataGordita, hdDibujar, hdPose, hdLinea, hdContorno, HD_POR_ID, HD_BASE_POR_ID, collarOso, COLLAR_OSO, sapoMalala, flechaJanet, pajaritos, enredaRival, florCabeza, estrellita }
