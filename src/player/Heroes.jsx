/* Los personajes en el celular (ver game/heroes.js): el selector del lobby, el
   duelo del ranking y el podio. El celular no suena (el sonido es del
   proyector), pero vibra en los golpes y al elegir personaje. */
import { useEffect, useMemo, useRef, useState } from 'react'
import { HEROES, escenaAplauso, escenaDuelo, escenaDuelo2, escenaGana, escenaGana2, escenaPodio, pintarRetrato } from '../game/heroes.js'
import { useT } from '../i18n.jsx'

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
  const clave = [...a, ...b].map((h) => h.id).join('|')
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
  return <Lienzo dibujar={dibujar} ancho={LADO} alto={LADO} label={hero.nombre} className="w-24 shrink-0" />
}

/* En el selector van por orden alfabético (HEROES conserva su orden original). */
const EN_ORDEN = [...HEROES].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))

/* En el lobby: la ficha del personaje arriba (con lo que acaba de pasar) y las caras para tocar.
   Los alumnos no entendían que bastaba con tocar: ya aparecía uno marcado (se reparte al azar) y al tocar solo
   cambiaba un borde. Ahora la instrucción lo dice, la ficha avisa si fue al azar, y al tocar la cara salta,
   lleva un ✓, la ficha dice "¡Listo!" y el celular vibra. alAzar: todavía no eligió (el suyo fue repartido). */
export function HeroPicker({ value, onPick, alAzar }) {
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
          <EnGuardia hero={elegido} />
          <div className="min-w-0">
            <b key={aviso} role="status" className={`block ${recien === value ? 'text-emerald-300' : 'text-amber-300'}`}>{aviso}</b>
            <span className="block text-sm text-indigo-200">{claseDe(elegido, t.idioma)}</span>
            <i className="block text-sm mt-1">“{elegido.frase}”</i>
          </div>
        </div>
      )}
      <div className="grid grid-cols-5 gap-2">
        {EN_ORDEN.map((h) => (
          <button key={h.id} type="button" onClick={() => tocar(h.id)} aria-pressed={h.id === value} aria-label={h.nombre}
            className={`relative aspect-square rounded-xl border-2 p-0.5 bg-indigo-950 transition active:scale-95 ${h.id === value ? 'border-amber-400 ring-2 ring-amber-400' : 'border-indigo-800'}`}>
            <span key={recien === h.id ? 'salta' : 'quieto'} className={`block w-full h-full ${recien === h.id ? 'kachai-saltito' : ''}`}><Cara hero={h} /></span>
            {h.id === value && <span aria-hidden="true" className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 text-indigo-950 text-xs font-black grid place-items-center shadow">✓</span>}
          </button>
        ))}
      </div>
      <p className="text-center text-xs text-slate-500">{t('puedesCambiar')}</p>
    </div>
  )
}
