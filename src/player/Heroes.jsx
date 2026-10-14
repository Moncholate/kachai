/* Los personajes en el celular (ver game/heroes.js): el selector del lobby, el
   duelo del ranking y el podio. El celular no suena (el sonido es del
   proyector), pero vibra en los golpes y al elegir personaje. */
import { useEffect, useMemo, useRef, useState } from 'react'
import { HEROES, escenaAplauso, escenaDuelo, escenaDuelo2, escenaGana, escenaGana2, escenaPodio, pintarRetrato, pintarRetratoRacha } from '../game/heroes.js'
import { useT } from '../i18n.jsx'
import { alAzar as coloresAlAzar, colorMuestra, materialesDe } from '../game/personaliza.js'

const CLASE_EN = {
  latte: 'Trickster', agattita: 'Druid', malala: 'Witch', malia: 'Chef', kenny: 'Bard',
  tivan: 'Alchemist', patroclus: 'Scout', uchis: 'Rogue', janet: 'Elf', jelic: 'Paladin', cupe: 'Noble', july: 'Blacksmith', edith: 'Warlock', uzu: 'Goblin', xitin: 'Summoner',
}
export const claseDe = (hero, idioma) => (idioma === 'en' ? CLASE_EN[hero.id] : hero.clase)

const PIXEL = { imageRendering: 'pixelated' }

/* Vibración corta (Android; Safari en iPhone no lo permite y no pasa nada). Nunca con movimiento reducido. */
const quieto = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
const vibrar = (ms) => { try { if (!quieto) navigator.vibrate?.(ms) } catch { /* sin vibración */ } }

/* Lienzo animado: llama a dibujar(g, ms desde que apareció) en cada cuadro. Si el alumno vuelve a encender la
   pantalla (o vuelve a la pestaña), la escena parte de nuevo desde el principio, para que entienda qué pasó.
   golpes: { periodo, tiempos, vueltas, ms }: vibra en cada golpe de las primeras `vueltas` (después, quieto). */
function Lienzo({ dibujar, ancho = 112, alto = 76, label, className, golpes }) {
  const ref = useRef(null)
  useEffect(() => {
    const g = ref.current.getContext('2d')
    const marcas = golpes ? Array.from({ length: golpes.vueltas }, (_, k) => golpes.tiempos.map((x) => k * golpes.periodo + x)).flat() : []
    let inicio = performance.now(), antes = 0, id
    const cuadro = (now) => {
      const t = now - inicio
      dibujar(g, t)
      if (marcas.some((m) => antes < m && m <= t)) vibrar(golpes.ms)
      antes = t
      id = requestAnimationFrame(cuadro)
    }
    id = requestAnimationFrame(cuadro)
    const alVolver = () => { if (document.visibilityState === 'visible') { inicio = performance.now(); antes = 0 } }
    document.addEventListener('visibilitychange', alVolver)
    return () => { cancelAnimationFrame(id); document.removeEventListener('visibilitychange', alVolver) }
  }, [dibujar, golpes])
  return <canvas ref={ref} width={ancho} height={alto} aria-label={label} style={PIXEL} className={className} />
}

const ESCENA = 'w-full rounded-2xl border-4 border-slate-900'

/* Duelo del ranking: chocan; si ganaste (adelantaste a tu rival), lo desarmas.
   lost: te adelantaron, se ve la victoria del rival en espejo (tú sigues a la izquierda).
   me y rival son un personaje, o dos (modo equipos: dos contra dos).
   escenario: el de la canción de esta pregunta (ver game/fondos.js). */
const espejo = (dibujar) => (g, t) => { g.save(); g.translate(g.canvas.width, 0); g.scale(-1, 1); dibujar(g, t); g.restore() }
export function HeroDuel({ me, rival, won, lost, escenario }) {
  const a = [].concat(me), b = [].concat(rival)
  const dos = a.length > 1 && b.length > 1
  const clave = [...a, ...b].map((h) => (h.variante || h.id) + (h.hd.racha || '')).join('|')   // con sus colores y su nivel de racha
  const o = { escenario }
  /* Los golpes (ver heroes.js): en el duelo cada uno ataca a los 900 ms de su turno (3,4 s por vuelta);
     al ganar, un solo golpe a los 900 ms (la escena dura 6 s; la de Uzu, 8,2). */
  const ganador = won ? a[0] : lost ? b[0] : null
  const golpes = useMemo(() => (ganador
    ? { periodo: ganador.id === 'uzu' ? 8200 : 6000, tiempos: [900], vueltas: 1, ms: 70 }
    : { periodo: 3400, tiempos: [900, 2400], vueltas: 2, ms: 40 }), [ganador?.id])
  const dibujar = useMemo(() => (dos
    ? (won ? (g, t) => escenaGana2(g, t, a, b, o) : lost ? espejo((g, t) => escenaGana2(g, t, b, a, o)) : (g, t) => escenaDuelo2(g, t, a, b, o))
    : (won ? (g, t) => escenaGana(g, t, a[0], b[0], o) : lost ? espejo((g, t) => escenaGana(g, t, b[0], a[0], o)) : (g, t) => escenaDuelo(g, t, a[0], b[0], o))), [clave, dos, won, lost, escenario])
  return <Lienzo dibujar={dibujar} golpes={golpes} label={`${a.map((h) => h.nombre).join(' + ')} vs ${b.map((h) => h.nombre).join(' + ')}`} className={ESCENA} />
}

/* Podio: salta al salir su nombre, levanta el arma y cae confeti. */
export function HeroPodium({ me, place, escenario }) {
  const dibujar = useMemo(() => (g, t) => escenaPodio(g, t, me, place, { escenario }), [me, place, escenario])
  return <Lienzo dibujar={dibujar} label={me.nombre} className={ESCENA} />
}

/* Quien no quedó en el podio: aplaude. */
export function HeroApplause({ me, escenario }) {
  const dibujar = useMemo(() => (g, t) => escenaAplauso(g, t, me, { escenario }), [me, escenario])
  return <Lienzo dibujar={dibujar} label={me.nombre} className={ESCENA} />
}

/* El personaje entero en guardia (con su arma), centrado por su contorno real. */
const LADO = 48
const centrado = (g, hero, t = 0) => pintarRetrato(g, hero, LADO, t)

function Cara({ hero }) {
  const ref = useRef(null)
  useEffect(() => {
    const g = ref.current.getContext('2d')
    g.clearRect(0, 0, LADO, LADO)
    centrado(g, hero)
  }, [hero])
  return <canvas ref={ref} width={LADO} height={LADO} style={PIXEL} className="w-full h-full" />
}

function EnGuardia({ hero }) {
  const dibujar = useMemo(() => (g, t) => {
    g.clearRect(0, 0, LADO, LADO)
    centrado(g, hero, t)
  }, [hero])
  return <Lienzo dibujar={dibujar} ancho={LADO} alto={LADO} label={hero.nombre} className="w-24 shrink-0 rounded-xl fondo-retrato" />
}

/* Retrato en el encabezado, junto al nombre y el puntaje: de la cabeza a la cintura, con su distintivo de racha
   (game/racha.js). Sin racha, quieto (no gasta nada); con racha, el aura y el brillo se animan a ~12 cuadros por
   segundo, que alcanza para el pixel art y cuida los celulares antiguos. */
const RETRATO = 40
export function HeroBadge({ hero }) {
  const ref = useRef(null)
  useEffect(() => {
    const g = ref.current.getContext('2d')
    const dibuja = (t) => { g.clearRect(0, 0, RETRATO, RETRATO); pintarRetratoRacha(g, hero, RETRATO, t) }
    if (!hero.hd.racha || quieto) { dibuja(0); return }
    const inicio = performance.now()
    let antes = -Infinity, id
    const cuadro = (now) => {
      if (now - antes >= 80) { antes = now; dibuja(now - inicio) }
      id = requestAnimationFrame(cuadro)
    }
    id = requestAnimationFrame(cuadro)
    return () => cancelAnimationFrame(id)
  }, [hero])
  return <canvas ref={ref} width={RETRATO} height={RETRATO} style={PIXEL} aria-hidden="true" className="w-10 h-10 shrink-0 rounded-xl fondo-retrato" />
}

/* "Personaliza": círculos de color para la piel (o pelaje), el pelo (o barba), la ropa y un acento, con "Al azar" y
   "Original". El primer círculo de cada fila es el color de siempre. La ficha de arriba muestra el resultado. */
const NOMBRE_COLOR = {
  rosada: ['Rosada clara', 'Light pink'], durazno: ['Durazno', 'Peach'], tostada: ['Tostada', 'Tan'], rojiza: ['Café rojiza', 'Reddish brown'], oscura: ['Oscura', 'Dark'],
  negro: ['Negro', 'Black'], cafeOscuro: ['Café oscuro', 'Dark brown'], cafeClaro: ['Café claro', 'Light brown'], rubio: ['Rubio', 'Blond'], pelirrojo: ['Pelirrojo', 'Red'],
  blanco: ['Blanco', 'White'], rosado: ['Rosado', 'Pink'], turquesa: ['Turquesa', 'Turquoise'], naranjo: ['Naranjo', 'Orange'], crema: ['Crema', 'Cream'],
  manchada: ['Manchada', 'Spotted'], cafe: ['Café', 'Brown'], gris: ['Gris', 'Gray'], amarillo: ['Amarillo', 'Yellow'], rojo: ['Rojo', 'Red'], vino: ['Vino', 'Burgundy'],
  mostaza: ['Mostaza', 'Mustard'], verde: ['Verde', 'Green'], verdeBosque: ['Verde bosque', 'Forest green'], azul: ['Azul', 'Blue'], celeste: ['Celeste', 'Sky blue'], morado: ['Morado', 'Purple'],
}
const ACENTO = {
  jelic: ['Detalles', 'Details'], latte: ['Capa', 'Cape'], malala: ['Blusa', 'Blouse'], malia: ['Blusa', 'Blouse'], kenny: ['Bufanda', 'Scarf'], tivan: ['Pantalón', 'Pants'],
  patroclus: ['Pañoleta', 'Neckerchief'], uchis: ['Capa', 'Cape'], janet: ['Escamas', 'Scales'], july: ['Pantalón', 'Pants'], edith: ['Bordados', 'Trim'], xitin: ['Faja', 'Sash'],
  agattita: ['Short', 'Shorts'], cupe: ['Capa', 'Cape'], uzu: ['Pantalón', 'Pants'],
}
const MANCHADA = 'conic-gradient(#FFFFEB 0 40%, #F2A65E 0 70%, #43434F 0 100%)'
function HeroColors({ hero, colores, onChange }) {
  const t = useT(), en = t.idioma === 'en' ? 1 : 0
  const titulo = (m) => m === 'piel' ? (['cupe', 'agattita'].includes(hero.id) ? t('pelaje') : t('piel'))
    : m === 'pelo' ? (hero.id === 'july' ? t('barba') : t('pelo')) : m === 'ropa' ? t('ropa') : ACENTO[hero.id][en]
  const elige = (m, op) => { const c = { ...colores }; if (op) c[m] = op; else delete c[m]; onChange(c); vibrar(15) }
  const circulo = (m, op) => {
    const col = colorMuestra(hero, m, op), activo = (colores[m] || null) === op
    const nombre = op ? NOMBRE_COLOR[op]?.[en] || op : t('original')
    return (
      <button key={op || 'original'} type="button" onClick={() => elige(m, op)} aria-pressed={activo} aria-label={`${titulo(m)}: ${nombre}`} title={nombre}
        className={`relative w-8 h-8 shrink-0 rounded-full border-2 transition active:scale-90 ${activo ? 'border-amber-400 ring-2 ring-amber-400' : 'border-slate-300'}`}
        style={{ background: col === 'manchada' ? MANCHADA : col }}>
        {!op && <span aria-hidden="true" className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white border border-slate-300 text-[9px] font-black grid place-items-center text-slate-600">↺</span>}
      </button>
    )
  }
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 flex flex-col gap-2 text-left">
      <div className="flex items-center gap-2">
        <h4 className="flex-1 font-black text-slate-900">{t('personaliza')}</h4>
        <button type="button" onClick={() => { onChange(coloresAlAzar(hero.id)); vibrar(30) }} className="rounded-full border-2 border-violet-300 text-violet-700 font-bold text-sm px-3 py-1">🎲 {t('alAzar')}</button>
        <button type="button" onClick={() => { onChange({}); vibrar(15) }} className="rounded-full border-2 border-slate-300 text-slate-600 font-bold text-sm px-3 py-1">↺ {t('original')}</button>
      </div>
      {materialesDe(hero.id).map(([m, ops]) => (
        <div key={m} className="flex items-center gap-2">
          <span className="w-20 shrink-0 text-sm font-bold text-slate-600">{titulo(m)}</span>
          <div className="flex flex-wrap gap-1.5">{[null, ...ops.filter((op) => colorMuestra(hero, m, op) !== colorMuestra(hero, m, null))].map((op) => circulo(m, op))}</div>   {/* sin repetir el color original */}
        </div>
      ))}
    </div>
  )
}

/* En el selector van por orden alfabético (HEROES conserva su orden original). */
const EN_ORDEN = [...HEROES].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))

/* En el lobby: la ficha del personaje arriba (con lo que acaba de pasar) y las caras para tocar.
   Los alumnos no entendían que bastaba con tocar: ya aparecía uno marcado (se reparte al azar) y al tocar solo
   cambiaba un borde. Ahora la instrucción lo dice, la ficha avisa si fue al azar, y al tocar la cara salta,
   lleva un ✓, la ficha dice "¡Listo!" y el celular vibra. alAzar: todavía no eligió (el suyo fue repartido). */
export function HeroPicker({ value, heroe, onPick, alAzar, colores = {}, onColores }) {
  const t = useT()
  const [recien, setRecien] = useState(null)   // la cara que tocó en esta pantalla (para el saltito y el "¡Listo!")
  const elegido = HEROES.find((h) => h.id === value)
  const tocar = (id) => { onPick(id); setRecien(id); vibrar(30) }
  const aviso = !elegido ? null : recien === value ? t('listoEres', elegido.nombre) : alAzar ? t('teToco', elegido.nombre) : t('tuPersonaje', elegido.nombre)
  return (
    <div className="mt-6 w-full flex flex-col gap-3">
      <div className="text-center">
        <h3 className="font-black text-lg text-slate-900">{t('eligePersonaje')}</h3>
        <p className="text-sm font-bold text-violet-700">{t('tocaParaElegir')}</p>
      </div>
      {elegido && (
        <div className="flex items-center gap-3 rounded-2xl bg-indigo-950 text-white p-3 text-left">
          <EnGuardia hero={heroe && heroe.id === value ? heroe : elegido} />
          <div className="min-w-0">
            <b key={aviso} role="status" className={`block ${recien === value ? 'text-emerald-300' : 'text-amber-300'}`}>{aviso}</b>
            <span className="block text-sm text-indigo-200">{claseDe(elegido, t.idioma)}</span>
            <i className="block text-sm mt-1">“{elegido.frase}”</i>
          </div>
        </div>
      )}
      {elegido && onColores && <HeroColors hero={elegido} colores={colores} onChange={onColores} />}
      <div className="grid grid-cols-5 gap-2">
        {EN_ORDEN.map((h) => (
          <button key={h.id} type="button" onClick={() => tocar(h.id)} aria-pressed={h.id === value} aria-label={h.nombre}
            className={`relative aspect-square rounded-xl border-2 p-0.5 fondo-retrato transition active:scale-95 ${h.id === value ? 'border-amber-400 ring-2 ring-amber-400' : 'border-sky-300'}`}>
            <span key={recien === h.id ? 'salta' : 'quieto'} className={`block w-full h-full ${recien === h.id ? 'kachai-saltito' : ''}`}><Cara hero={h} /></span>
            {h.id === value && <span aria-hidden="true" className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 text-indigo-950 text-xs font-black grid place-items-center shadow">✓</span>}
          </button>
        ))}
      </div>
      <p className="text-center text-xs text-slate-500">{t('puedesCambiar')}</p>
    </div>
  )
}
