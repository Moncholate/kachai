/* ============================================================================
   RONDA BONUS: LEXICÓN
   ----------------------------------------------------------------------------
   A mitad del juego (tras la pregunta ⌈total/2⌉) aparece Lexicón, un búho
   bibliotecario que arranca hojas de su diccionario y las lanza; cada hoja se
   deshace en burbujas con palabras. En el celular, cada alumno revienta con su
   ballesta de ventosas las burbujas de la categoría pedida (irregular verbs,
   colors…). En el proyector, la nave del curso dispara y Lexicón se va rindiendo
   en 3 metas. Sirve para que la mitad de abajo del ranking se acerque: el bonus
   oculto (×2 o ×3) lo ve cada uno solo en su celular. Nunca se restan puntos.

   Aquí va solo la lógica (sin dibujos ni red), para poder probarla.
   ========================================================================== */

export const BONUS_SEG = 40          // lo que dura la ronda (sin contar la cuenta regresiva)
export const BONUS_INTRO_SEG = 7     // llega Lexicón (calza con la intro de Bubble Chase); igual en proyector y celulares
export const BONUS_FINAL_SEG = 6     // celebración en el proyector antes de volver al ranking
export const CARGADOR = 5            // dardos de la ballesta
export const TRABA_SEG = 1.5         // palabra incorrecta: la ballesta se traba
export const RECARGA_SEG = 1.5      // también al vaciarse el cargador: el héroe recarga solo
export const DORADA_VALE = 2         // la burbuja dorada cuenta por 2 aciertos (puntos y barra del curso)
export const DORADA_LENTA = 0.6      // y cae más lento, para que alcance a leerla

/* Burbujas doradas: un evento raro. Pueden traer una palabra correcta o una trampa
   (en la misma proporción que las normales): obligan a leer, no premian el reflejo.
   Salen más para el bonus oculto ×2 y ×3 (1, 2 o 3 en la ronda), repartidas
   entre los 5 s y los 35 s. → segundos de la ronda, de menor a mayor. */
export function horasDoradas(mult = 1, rand = Math.random) {
  const n = Math.min(3, Math.max(1, mult || 1)), desde = 5, tramo = (BONUS_SEG - 10) / n
  return Array.from({ length: n }, (_, i) => desde + tramo * (i + 0.15 + rand() * 0.7))
}

/* ¿Después de qué pregunta aparece? A la mitad, o mitad + 1 si es impar
   (10 preguntas → tras la 5.ª; 9 → tras la 5.ª). Con menos de 4 no hay ronda. */
export function preguntaDelBonus(total) {
  if (!(total >= 4)) return null
  return Math.ceil(total / 2) - 1        // índice (0 = primera pregunta)
}

/* Bonus oculto según el puesto: mitad de arriba ×1, tercer cuarto ×2,
   último cuarto ×3. ranking: ids de mejor a peor. → { id: 1 | 2 | 3 } */
export function multiplicadores(ranking) {
  const n = ranking.length
  return Object.fromEntries(ranking.map((id, i) => [id, i < n / 2 ? 1 : i < (3 * n) / 4 ? 2 : 3]))
}

/* Meta del curso: ~10 aciertos por alumno conectado (sumados entre todos; uno solo puede
   reventar unas 24 correctas en la ronda).
   Las 3 marcas están en 1/3, 2/3 y el total. Un curso chico también llega. */
export function metaDelCurso(jugadores) {
  return Math.max(12, Math.round(jugadores * 10))
}

/* La ronda se acelera de a poco, por tiempo (igual para todos, cumplan o no las metas):
   k = 0 al empezar, 1 al terminar. Al final salen burbujas ~45 % más seguido y caen ~30 % más rápido. */
export function ritmoBonus(k) {
  const p = Math.min(1, Math.max(0, k || 0))
  return { frecuencia: 1 + 0.45 * p, caida: 1 + 0.3 * p }
}
export function metasLogradas(aciertos, meta) {
  const p = meta > 0 ? aciertos / meta : 0
  return p >= 1 ? 3 : p >= 2 / 3 ? 2 : p >= 1 / 3 ? 1 : 0
}

/* ── Puntos de la ronda (propuesta F, simulación de tools/simular-puntaje.py, 17-oct-2026) ──
   Con 30 fijos por burbuja el bonus casi no ayudaba en actividades largas (cerraba 41 % de la brecha del último
   cuarto con 6 preguntas, 17 % con 15), decidía el podio (el 1.º cambiaba 4 de cada 10 veces con 6 preguntas) y
   premiaba tocar al azar. Ahora:
   · cada burbuja vale 11 × las preguntas jugadas antes del bonus: pesa lo mismo en 6, 10 o 15 preguntas;
   · × el bonus oculto (×1, ×2, ×3);
   · × puntería² (aciertos ÷ intentos, al cuadrado): tocarlo todo rinde poco, y nunca se resta;
   · la mitad de arriba (×1) suma como mucho 12 burbujas: el bonus no decide el podio.
   Resultado simulado: cierra ~40 % de la brecha en cualquier largo y el 1.º cambia ~1 de cada 10. */
export const PUNTOS_POR_PREGUNTA = 11
export const TOPE_ARRIBA = 12
export const valorBurbuja = (preguntas) => PUNTOS_POR_PREGUNTA * Math.max(1, Math.floor(preguntas || 1))
export const punteria = (aciertos, fallos = 0) => (aciertos > 0 ? aciertos / (aciertos + Math.max(0, fallos || 0)) : 0)
/* aciertos: burbujas correctas (la dorada cuenta 2) · fallos: palabras incorrectas disparadas · preguntas: jugadas antes */
export function puntosBonus(aciertos, mult = 1, { fallos = 0, preguntas = 1 } = {}) {
  const a = Math.max(0, Math.floor(aciertos || 0))
  if (!a) return 0
  const m = mult || 1
  const suman = m === 1 ? Math.min(a, TOPE_ARRIBA) : a
  return Math.round(suman * punteria(a, fallos) ** 2 * valorBurbuja(preguntas) * m)
}

/* ── Categorías ─────────────────────────────────────────────────────────────
   si: palabras que se revientan. no: trampas, con el tipo de palabra para
   explicar el error. Las palabras van en inglés (son contenido); lo que rodea
   se traduce con la sala. Nada ambiguo: "light", "fast" o "work" pueden ser de
   dos categorías y darían reclamos justos. */
const TIPO = {
  noun: { es: 'un sustantivo', en: 'a noun' },
  verb: { es: 'un verbo', en: 'a verb' },
  adjective: { es: 'un adjetivo', en: 'an adjective' },
  adverb: { es: 'un adverbio', en: 'an adverb' },
  regular: { es: 'regular (termina en -ed)', en: 'regular (it ends in -ed)' },
  place: { es: 'un lugar', en: 'a place' },
}

import { LEXICO } from './bonusLexico.js'

export const CATEGORIAS = {
  irregulares: {
    titulo: { es: 'Verbos irregulares (pasado)', en: 'Irregular verbs (past)' },
    lema: 'IRREGULAR verbs',
    objetivo: { es: 'un verbo irregular', en: 'an irregular verb' },
    si: ['went', 'saw', 'bought', 'took', 'made', 'ran', 'ate', 'came', 'got', 'gave', 'wrote', 'found', 'told', 'thought', 'drank', 'swam', 'sang', 'began', 'broke', 'drove', 'flew', 'knew', 'left', 'met', 'paid', 'sat', 'slept', 'spoke', 'won', 'wore'],
    no: ['played', 'walked', 'cooked', 'jumped', 'watched', 'visited', 'cleaned', 'danced', 'listened', 'opened', 'stayed', 'studied', 'talked', 'wanted', 'worked', 'called', 'helped', 'lived', 'liked', 'needed'].map((w) => [w, 'regular']),
  },
  colores: {
    titulo: { es: 'Colores', en: 'Colors' },
    lema: 'COLORS',
    objetivo: { es: 'un color', en: 'a color' },
    si: ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'black', 'white', 'grey'],
    no: [['table', 'noun'], ['happy', 'adjective'], ['run', 'verb'], ['chair', 'noun'], ['big', 'adjective'], ['sing', 'verb'], ['dog', 'noun'], ['window', 'noun'], ['cold', 'adjective'], ['tall', 'adjective'], ['quickly', 'adverb'], ['apple', 'noun']],
  },
  adjetivos: {
    titulo: { es: 'Adjetivos', en: 'Adjectives' },
    lema: 'ADJECTIVES',
    objetivo: { es: 'un adjetivo', en: 'an adjective' },
    si: ['big', 'small', 'happy', 'sad', 'tall', 'short', 'beautiful', 'cheap', 'expensive', 'old', 'young', 'hot', 'cold', 'easy', 'difficult', 'tired', 'angry', 'funny', 'noisy', 'friendly'],
    no: [['run', 'verb'], ['eat', 'verb'], ['swim', 'verb'], ['quickly', 'adverb'], ['slowly', 'adverb'], ['always', 'adverb'], ['table', 'noun'], ['house', 'noun'], ['teacher', 'noun'], ['book', 'noun']],
  },
  verbos: {
    titulo: { es: 'Verbos', en: 'Verbs' },
    lema: 'VERBS',
    objetivo: { es: 'un verbo', en: 'a verb' },
    si: ['run', 'eat', 'swim', 'read', 'write', 'sing', 'dance', 'sleep', 'cook', 'play', 'listen', 'speak', 'buy', 'drink', 'study', 'jump', 'climb', 'watch'],
    no: [['happy', 'adjective'], ['window', 'noun'], ['beautiful', 'adjective'], ['teacher', 'noun'], ['always', 'adverb'], ['kitchen', 'noun'], ['tired', 'adjective'], ['slowly', 'adverb'], ['pencil', 'noun'], ['green', 'adjective']],
  },
  sustantivos: {
    titulo: { es: 'Sustantivos', en: 'Nouns' },
    lema: 'NOUNS',
    objetivo: { es: 'un sustantivo', en: 'a noun' },
    si: ['table', 'house', 'teacher', 'book', 'apple', 'kitchen', 'window', 'pencil', 'doctor', 'garden', 'city', 'friend', 'river', 'bread', 'chair', 'school'],
    no: [['run', 'verb'], ['happy', 'adjective'], ['quickly', 'adverb'], ['sing', 'verb'], ['beautiful', 'adjective'], ['never', 'adverb'], ['eat', 'verb'], ['tired', 'adjective'], ['often', 'adverb'], ['write', 'verb']],
  },
  frecuencia: {
    titulo: { es: 'Adverbios de frecuencia', en: 'Adverbs of frequency' },
    lema: 'ADVERBS of frequency',
    objetivo: { es: 'un adverbio de frecuencia', en: 'an adverb of frequency' },
    si: ['always', 'usually', 'often', 'sometimes', 'rarely', 'never', 'seldom', 'normally', 'frequently', 'occasionally'],
    no: [['quickly', 'adverb'], ['slowly', 'adverb'], ['happy', 'adjective'], ['today', 'adverb'], ['teacher', 'noun'], ['run', 'verb'], ['tired', 'adjective'], ['window', 'noun'], ['carefully', 'adverb'], ['yesterday', 'adverb']],
  },
}

/* ── Categorías por nivel ───────────────────────────────────────────────────
   Las de gramática de arriba ya existían: se ubican en el curso donde se enseñan.
   Las léxicas (bonusLexico.js) traen sus trampas de otros grupos. */
const LEGADO = {
  sustantivos: ['basico', 3], colores: ['basico', 4], adjetivos: ['basico', 4], verbos: ['basico', 5], frecuencia: ['basico', 6], irregulares: ['basico', 11],
}
for (const [id, [nivel, file]] of Object.entries(LEGADO)) Object.assign(CATEGORIAS[id], { id, nivel, file })
Object.assign(CATEGORIAS.irregulares, { como: { es: 'un verbo irregular', en: 'an irregular verb' } })
Object.assign(CATEGORIAS.adjetivos, { como: { es: 'un adjetivo', en: 'an adjective' } })
Object.assign(CATEGORIAS.colores, { familia: 'colores', como: { es: 'un color', en: 'a color' } })

export const NIVELES = ['basico', 'elemental', 'intermedio']
const rango = (c) => NIVELES.indexOf(c.nivel) * 12 + c.file
const rangos = (c) => [rango(c), ...(c.tambien || []).map(([n, fl]) => NIVELES.indexOf(n) * 12 + fl)]

/* Palabras que valen en dos mundos ("orange" es color y fruta, "fly" verbo e insecto…):
   jamás se usan de trampa, para que no haya reclamos justos. */
export const AMBIGUAS = new Set(['orange', 'cold', 'hot', 'warm', 'cool', 'freezing', 'fly', 'watch', 'dark', 'fair', 'hotel', 'airport', 'restaurant', 'farm', 'pilot', 'passport', 'ticket', 'chicken', 'fish', 'turkey', 'duck', 'lamb', 'kind', 'light', 'bank', 'park', 'order', 'sale', 'review', 'cricket', 'hat', 'bag', 'trip', 'guide', 'record', 'cross', 'turn', 'block', 'follow', 'left', 'right', 'seat', 'camera', 'bar', 'degree', 'study', 'hall'])

function trampas(c, todas) {
  const propias = new Set(c.si.map((w) => w.toLowerCase()))
  const vistas = new Set()
  const salida = []
  const poner = (w, tipo) => {
    const k = w.toLowerCase()
    if (propias.has(k) || vistas.has(k) || AMBIGUAS.has(k)) return
    vistas.add(k); salida.push([w, tipo])
  }
  for (const [w, [es, en]] of Object.entries(c.extra || {})) poner(w, { es, en })
  const fuentes = c.contra
    ? c.contra.map((id) => todas[id])
    : Object.values(todas).filter((o) => o.id !== c.id && (o.como && o.familia) && !o.aislada && rango(o) <= rango(c) &&
        o.familia !== c.familia && (!c.solo || c.solo.includes(o.familia)) && !(c.sin || []).includes(o.familia) && o.id !== 'irregulares')
  for (const o of fuentes) for (const w of o.si) poner(w, 'lex:' + o.id)
  return salida
}
for (const c of LEXICO) CATEGORIAS[c.id] = c
for (const c of LEXICO) c.no = trampas(c, CATEGORIAS)

/* Rangos de Files de cada EA (ver course-roadmaps): los regulares parten en 3+3 y los intensivos en 6+6 */
const FILES = { basico1: [[1, 3], [4, 6]], basico2: [[7, 9], [10, 12]], elemental1: [[1, 3], [4, 6]], elemental2: [[7, 9], [10, 12]], intermedio1: [[1, 3], [4, 6]], intermedio2: [[7, 9], [10, 12]] }
const filesDe = (cursoId, ea) => (/Int$/.test(cursoId) ? [[1, 6], [7, 12]] : FILES[cursoId])?.[ea]

/* Qué ofrecer en el selector del profe para el curso y EA que está jugando:
   nuevas = el vocabulario de esos Files · antes = lo anterior, para repasar.
   Sin curso conocido (actividad propia): todo, como "antes". */
export function categoriasPara(cursoId, ea = 0) {
  const todas = Object.values(CATEGORIAS).filter((c) => c.nivel)
  const orden = (a, b) => rango(a) - rango(b)
  const files = filesDe(cursoId, ea)
  if (!files) return { nuevas: [], antes: todas.sort(orden).map((c) => c.id) }
  const nivel = NIVELES.indexOf(cursoId.replace(/\d$|Int$/, ''))
  const tope = nivel * 12 + files[1]
  const desde = nivel * 12 + files[0]
  const nuevas = todas.filter((c) => rangos(c).some((r) => r >= desde && r <= tope)).sort(orden)
  const antes = todas.filter((c) => rango(c) <= tope && !nuevas.includes(c)).sort((a, b) => orden(b, a))
  return { nuevas: nuevas.map((c) => c.id), antes: antes.map((c) => c.id) }
}

/* Explicación del error, en el idioma de la sala. Las de frecuencia aclaran el
   caso más confuso: "quickly" sí es adverbio, pero de modo, no de frecuencia. */
export function explicarError(catId, palabra, tipo, lang = 'en') {
  const c = CATEGORIAS[catId], l = lang === 'es' ? 'es' : 'en'
  if (catId === 'irregulares') return l === 'es' ? `<b>${palabra}</b> es regular: termina en <b>-ed</b>.` : `<b>${palabra}</b> is regular: it ends in <b>-ed</b>.`
  if (catId === 'frecuencia' && tipo === 'adverb') return l === 'es' ? `<b>${palabra}</b> es un adverbio, pero no dice <i>con qué frecuencia</i>.` : `<b>${palabra}</b> is an adverb, but it doesn’t say <i>how often</i>.`
  if (tipo && typeof tipo === 'object') return l === 'es' ? `<b>${palabra}</b> es ${tipo.es}, no ${c.objetivo.es}.` : `<b>${palabra}</b> is ${tipo.en}, not ${c.objetivo.en}.`
  if (typeof tipo === 'string' && tipo.startsWith('lex:')) {
    const o = CATEGORIAS[tipo.slice(4)].como
    return l === 'es' ? `<b>${palabra}</b> es ${o.es}, no ${c.objetivo.es}.` : `<b>${palabra}</b> is ${o.en}, not ${c.objetivo.en}.`
  }
  const t = TIPO[tipo]?.[l] || ''
  return l === 'es' ? `<b>${palabra}</b> es ${t}, no ${c.objetivo.es}.` : `<b>${palabra}</b> is ${t}, not ${c.objetivo.en}.`
}

/* Siguiente burbuja: ~55 % correctas, sin repetir las que ya están en pantalla. */
export function nuevaPalabra(catId, enPantalla = new Set(), rand = Math.random) {
  const c = CATEGORIAS[catId]
  const correcta = rand() < 0.55
  const lista = correcta ? c.si : c.no
  for (let i = 0; i < 12; i++) {
    const w = lista[Math.floor(rand() * lista.length)]
    const [palabra, tipo] = Array.isArray(w) ? w : [w, null]
    if (!enPantalla.has(palabra) || i === 11) return { palabra, tipo, correcta }
  }
}
