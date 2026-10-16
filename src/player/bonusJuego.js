/* ============================================================================
   RONDA BONUS EN EL CELULAR
   ----------------------------------------------------------------------------
   El alumno va en la proa de la barquilla con su personaje (ballesta de
   ventosas). Caen burbujas con palabras: toca las de la categoría para
   dispararles. 5 dardos: un acierto devuelve el dardo; una palabra incorrecta
   o un tiro al aire lo pierde, y la incorrecta traba la ballesta 1,5 s (con la
   explicación del error). Al vaciarse el cargador, el héroe recarga solo.
   De vez en cuando cae una burbuja dorada (vale doble, pero puede ser trampa).
   Nunca se restan puntos.

   El juego corre entero en el celular (sin red); solo avisa sus aciertos con
   onAciertos(n), y el componente de React los manda al proyector. El reloj es
   el del servidor (opts.ahora), así todos empiezan y terminan juntos.

   Es la muestra jugable aprobada (previa-juego-burbujas.html) hecha módulo.
   ========================================================================== */
import { HEROES } from '../game/heroes.js'
import { lienzoPear36 } from '../game/pear36.js'
import { W, H, capasCielo, globoYCuerdas, barquilla, dardo, cuadroHeroe, cubierta, HW, OX, OY } from '../game/bonusCielo.js'
import { ritmoBonus, CATEGORIAS, CARGADOR, TRABA_SEG, RECARGA_SEG, PUNTOS_BURBUJA, DORADA_VALE, DORADA_LENTA, AMBIGUAS, horasDoradas, explicarError, nuevaPalabra } from '../game/bonus.js'

const X_MIN = 46, X_MAX = 100          // las burbujas caen a la derecha de la barquilla
const HEROE_X = 2
const VEL_DARDO = 230, CAIDA = 22

const CSS = `
.bj { position: relative; height: 100%; display: flex; flex-direction: column; overflow: hidden; user-select: none; -webkit-user-select: none; background: #0b1222; color: #fff; font-family: inherit; }
.bj-sup { padding: 8px 10px 6px; display: flex; flex-direction: column; gap: 5px; background: #0b1222; z-index: 2; }
.bj-cat { background: #ffe478; color: #3b2a05; font-weight: 800; border-radius: 10px; padding: 5px 8px; text-align: center; font-size: 16px; }
.bj-datos { display: flex; justify-content: space-between; align-items: center; font-size: 13px; gap: 6px; }
.bj-chip { border-radius: 999px; padding: 1px 8px; font-weight: 800; }
.bj-racha { background: #f2a65e; color: #3b1d05; }
.bj-bonus { background: #4da6ff; color: #fff; }
.bj-dardos { display: flex; gap: 2px; }
.bj-dardos i { width: 9px; height: 18px; border-radius: 4px 4px 2px 2px; background: linear-gradient(#eb564b 0 30%, #ffe478 30%); display: block; }
.bj-dardos i.no { background: #334155; }
.bj-juego { position: relative; flex: 1; touch-action: none; overflow: hidden; background: #253a5e; }
.bj-escena { position: absolute; left: 0; right: 0; bottom: 0; width: 100%; aspect-ratio: 112 / 212; }
.bj-escena canvas { position: absolute; inset: 0; width: 100%; height: 100%; image-rendering: pixelated; }
.bj-capa { position: absolute; inset: 0; }
.bj-burbuja { position: absolute; transform: translate(-50%, -50%); padding: 9px 13px; border-radius: 999px; white-space: nowrap; font-weight: 800; font-size: 17px; color: #102040;
  background: radial-gradient(circle at 30% 28%, rgba(255,255,255,.95) 0 10%, rgba(214,236,255,.7) 30%, rgba(150,200,255,.45) 70%);
  border: 2px solid rgba(255,255,255,.95); box-shadow: inset -5px -7px 10px rgba(77,120,230,.35), 0 3px 8px rgba(0,0,0,.3); }
.bj-burbuja.dorada { color: #4a2a05; border-color: #fff3b0;
  background: radial-gradient(circle at 30% 28%, rgba(255,255,240,.98) 0 10%, rgba(255,228,120,.92) 32%, rgba(242,166,94,.85) 75%);
  animation: bj-brilla .7s ease-in-out infinite alternate; }
@keyframes bj-brilla { from { box-shadow: inset -5px -7px 10px rgba(186,97,86,.4), 0 0 6px 2px rgba(255,228,120,.5) } to { box-shadow: inset -5px -7px 10px rgba(186,97,86,.4), 0 0 16px 6px rgba(255,228,120,.95) } }
.bj-burbuja.dorada::before, .bj-burbuja.dorada::after { content: ''; position: absolute; width: 7px; height: 7px; background: #fff;
  clip-path: polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%); animation: bj-destello 1.1s ease-in-out infinite; }
.bj-burbuja.dorada::before { top: -4px; right: 6px; }
.bj-burbuja.dorada::after { bottom: -3px; left: 8px; animation-delay: .55s; }
@keyframes bj-destello { 0%, 100% { transform: scale(.3); opacity: 0 } 50% { transform: scale(1.2); opacity: 1 } }
.bj-flota.oro .e { color: #fff3b0; text-shadow: 0 0 8px #ffe478, 0 1px 3px #000; }
.bj-burbuja.plop { animation: bj-plop .25s ease-out forwards; }
@keyframes bj-plop { 0% { transform: translate(-50%, -50%) scale(1, 1) } 40% { transform: translate(-50%, -50%) scale(1.15, .85) } 100% { transform: translate(-50%, -50%) scale(.95, 1.08) } }
.bj-burbuja.mal { background: rgba(255,170,160,.85); border-color: #eb564b; color: #5a0f0f; animation: none; }
.bj-burbuja.mal::before, .bj-burbuja.mal::after { display: none; }
.bj-flota { position: absolute; transform: translate(-50%, -50%); font-weight: 800; text-align: center; pointer-events: none; animation: bj-sube .9s ease-out forwards; text-shadow: 0 1px 3px #000; }
.bj-flota .e { font-size: 26px; color: #ffe478; letter-spacing: -1px; }
.bj-flota .p { font-size: 16px; color: #8fde5d; }
.bj-flota.plopTxt { font-size: 15px; color: #fff; animation-duration: .4s; }
@keyframes bj-sube { from { opacity: 1; margin-top: 0 } to { opacity: 0; margin-top: -40px } }
.bj-aviso { position: absolute; left: 12px; right: 12px; top: 32%; background: #fff7e6; border: 2px solid #f2a65e; border-radius: 14px; padding: 8px 10px; font-size: 15px; color: #4a2a05; text-align: center; display: none; pointer-events: none; z-index: 3; }
.bj-aviso b { color: #b4380f; }
.bj-recargar { position: absolute; right: 10px; bottom: 10px; border: 0; border-radius: 14px; padding: 10px 14px; font: inherit; font-weight: 800; font-size: 16px; background: #ffe478; color: #3b2a05; box-shadow: 0 3px 0 #ba6156; display: none; z-index: 3; }
.bj-recargar.sacude { animation: bj-sacude .3s; }
@keyframes bj-sacude { 25% { transform: translateX(-6px) } 75% { transform: translateX(6px) } }
.bj-tarjeta { position: absolute; inset: 0; background: rgba(11,18,34,.92); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px; gap: 10px; z-index: 5; }
.bj-tarjeta .t1 { font-size: 13px; color: #9fb3d1; letter-spacing: 1px; text-transform: uppercase; }
.bj-tarjeta .t2 { font-size: 26px; font-weight: 800; line-height: 1.15; }
.bj-tarjeta .t2 span { color: #ffe478; }
.bj-ej { display: flex; gap: 10px; font-size: 15px; }
.bj-ej div { background: rgba(255,255,255,.1); border-radius: 10px; padding: 4px 10px; }
.bj-reglas { font-size: 13px; color: #c8d4e6; max-width: 330px; line-height: 1.5; }
.bj-cuenta { font-size: 80px; font-weight: 800; color: #ffe478; line-height: 1; }
.bj-resumen { font-size: 16px; } .bj-resumen b { color: #ffe478; }
.bj-total { font-size: 40px; font-weight: 800; color: #8fde5d; }
.bj-oculto { display: none !important; }
`
let cssPuesto = false

/* Sonido del celular SOLO en la ronda bonus (en el resto de Kachai suena solo el proyector):
   los efectos de ElevenLabs (public/audio/bonus-*.ogg), cargados al primer uso. */
let audio
const buffers = {}
const ARCHIVOS = { pop1: 'bonus-pop1', pop2: 'bonus-pop2', oro: 'bonus-gold', tiro: 'bonus-shot', mal: 'bonus-jam', recarga: 'bonus-reload' }
function cargar(nombre) {
  buffers[nombre] ??= fetch(`${import.meta.env.BASE_URL}audio/${ARCHIVOS[nombre]}.ogg`)
    .then((r) => r.arrayBuffer()).then((d) => audio.decodeAudioData(d)).catch(() => null)
  return buffers[nombre]
}
/* El pop sube un poquito de tono con la racha (hasta la 8.ª) y alterna entre sus dos versiones */
let alterna = 0
function sonar(tipo, racha = 0) {
  try {
    audio ??= new (window.AudioContext || window.webkitAudioContext)()
    audio.resume?.()
    const nombre = tipo === 'pop' ? (alterna++ % 2 ? 'pop2' : 'pop1') : tipo
    cargar(nombre).then((buf) => {
      if (!buf) return
      const src = audio.createBufferSource()
      src.buffer = buf
      if (tipo === 'pop') src.playbackRate.value = 1 + Math.min(racha, 8) * 0.03
      src.connect(audio.destination); src.start()
    })
  } catch { /* sin audio, se juega igual */ }
}
/* Precarga todo al empezar la ronda, para que el primer disparo no llegue tarde */
function precargar() {
  try { audio ??= new (window.AudioContext || window.webkitAudioContext)(); Object.keys(ARCHIVOS).forEach(cargar) } catch { /* igual se juega */ }
}

const azar = (a) => a[Math.floor(Math.random() * a.length)]

export class JuegoBonus {
  /* opts: { catId, lang, mult, heroe (o heroId), inicio, fin (ms del servidor), ahora(), t(clave, ...), onAciertos(n) } */
  constructor(contenedor, opts) {
    this.o = opts
    precargar()
    if (!cssPuesto) { const st = document.createElement('style'); st.textContent = CSS; document.head.append(st); cssPuesto = true }
    const t = opts.t, cat = CATEGORIAS[opts.catId]
    this.cat = cat
    this.heroe = opts.heroe || HEROES.find((h) => h.id === opts.heroId) || HEROES[0]   // con sus colores (personaliza)
    const raiz = document.createElement('div'); raiz.className = 'bj'
    raiz.innerHTML = `
      <div class="bj-sup">
        <div class="bj-cat">Pop the ${cat.lema}!</div>
        <div class="bj-datos"><span class="bj-reloj">⏱ 0:40</span><span class="bj-dardos"></span><span class="bj-chip bj-racha bj-oculto"></span>
          <span class="bj-chip bj-bonus ${opts.mult > 1 ? '' : 'bj-oculto'}">Bonus ×${opts.mult}</span><b class="bj-pts">+0</b></div>
      </div>
      <div class="bj-juego"><div class="bj-escena"><canvas></canvas><div class="bj-capa"></div></div>
        <div class="bj-aviso"></div><button class="bj-recargar">⟳ ${t('bonusRecargar')}</button></div>
      <div class="bj-tarjeta bj-intro">
        <div class="t1">${t('rondaBonus')}</div>
        <div class="t2">Pop the <span>${cat.lema}</span>!</div>
        <div class="bj-ej"><div>${azar(cat.si)} ✓</div><div>${azar(cat.no)[0]} ✕</div></div>
        <div class="bj-cuenta">3</div>
        <div class="bj-reglas">${t('bonusReglas')}</div>
      </div>
      <div class="bj-tarjeta bj-final bj-oculto">
        <div class="t1">${t('bonusTerminada')}</div>
        <div class="bj-resumen bj-res1"></div><div class="bj-resumen bj-res2"></div>
        <div class="bj-total"></div>
      </div>`
    contenedor.append(raiz)
    this.raiz = raiz
    const $ = (s) => raiz.querySelector(s)
    this.el = { reloj: $('.bj-reloj'), dardos: $('.bj-dardos'), racha: $('.bj-racha'), pts: $('.bj-pts'), juego: $('.bj-juego'), escena: $('.bj-escena'), capa: $('.bj-capa'), aviso: $('.bj-aviso'), recargar: $('.bj-recargar'), intro: $('.bj-intro'), cuenta: $('.bj-cuenta'), final: $('.bj-final'), res1: $('.bj-res1'), res2: $('.bj-res2'), total: $('.bj-total') }
    const cv = raiz.querySelector('canvas'); cv.width = W; cv.height = H
    this.g = lienzoPear36(cv.getContext('2d'))
    this.px = (x, y, col) => { this.g.fillStyle = col; this.g.fillRect(x, y, 1, 1) }
    /* aciertos = lo que suma (la dorada vale DORADA_VALE); reventadas = burbujas correctas, para el resumen */
    this.J = { t: 0, burbujas: [], dardos: [], proxima: 0.3, municion: CARGADOR, racha: 0, mejorRacha: 0, aciertos: 0, reventadas: 0, doradas: horasDoradas(opts.mult), apunta: 'a0', pose: 'guardia', poseHasta: 0, trabadaHasta: 0, recargaHasta: 0, recargaDesde: 0, terminado: false }
    this.el.juego.addEventListener('pointerdown', (e) => this.tocarCielo(e))
    this.el.recargar.addEventListener('pointerdown', (e) => { e.stopPropagation(); this.recargar() })
    this.antes = performance.now()
    this.raf = requestAnimationFrame((ms) => this.cuadro(ms))
    this.actualizarBarra()
  }
  destruir() { cancelAnimationFrame(this.raf); this.raiz.remove() }

  jugando() { const a = this.o.ahora(); return a >= this.o.inicio && a < this.o.fin && !this.J.terminado }
  get reloj() { return (this.o.ahora() - this.o.inicio) / 1000 }

  actualizarBarra() {
    const J = this.J, quedan = Math.max(0, Math.ceil((this.o.fin - Math.max(this.o.inicio, this.o.ahora())) / 1000))
    this.el.reloj.textContent = `⏱ 0:${String(quedan).padStart(2, '0')}`
    this.el.dardos.innerHTML = Array.from({ length: CARGADOR }, (_, i) => `<i class="${i < J.municion ? '' : 'no'}"></i>`).join('')
    this.el.racha.textContent = `${this.o.t('bonusRacha')} ${J.racha}`; this.el.racha.classList.toggle('bj-oculto', J.racha < 2)
    this.el.pts.textContent = '+' + J.aciertos * PUNTOS_BURBUJA * this.o.mult
    const ocupado = J.t < J.recargaHasta
    this.el.recargar.style.display = this.jugando() && J.municion < CARGADOR && !ocupado ? 'block' : 'none'
  }

  /* ---- burbujas ---- */
  /* Cuánto se aceleró la ronda (por el reloj del servidor: igual en todos los celulares) */
  ritmo() { return ritmoBonus((this.o.ahora() - this.o.inicio) / (this.o.fin - this.o.inicio)) }
  nuevaBurbuja() {
    const J = this.J
    const w = nuevaPalabra(this.o.catId, new Set(J.burbujas.map((b) => b.palabra)))
    const y0 = this.arribaVisible() - 8
    const altas = J.burbujas.filter((b) => b.y < y0 + 40)
    let x, k = 0
    do { x = X_MIN + Math.random() * (X_MAX - X_MIN) } while (altas.some((b) => Math.abs(b.x - x) < 24) && ++k < 12)
    /* ¿Toca dorada? Correcta o trampa, como venga; nunca una palabra dudosa ni dos a la vez */
    const dorada = J.doradas.length > 0 && J.t >= J.doradas[0] && !AMBIGUAS.has(w.palabra.toLowerCase()) && !J.burbujas.some((o) => o.dorada && o.estado !== 'fuera')
    if (dorada) J.doradas.shift()
    const el = document.createElement('div'); el.className = 'bj-burbuja' + (dorada ? ' dorada' : ''); el.textContent = w.palabra
    const b = { ...w, dorada, x, y: y0, vel: CAIDA * this.ritmo().caida * (0.85 + Math.random() * 0.35) * (dorada ? DORADA_LENTA : 1), el, estado: 'cae' }
    el.addEventListener('pointerdown', (e) => { e.stopPropagation(); this.disparar(b) })
    this.el.capa.append(el)
    J.burbujas.push(b)
  }
  arribaVisible() { const e = this.el.escena.getBoundingClientRect(), j = this.el.juego.getBoundingClientRect(); return Math.max(0, (j.top - e.top) / e.height * H) }
  ponerEn(el, x, y) { el.style.left = (x / W * 100) + '%'; el.style.top = (y / H * 100) + '%' }
  flota(x, y, html, cls = '') { const el = document.createElement('div'); el.className = 'bj-flota ' + cls; el.innerHTML = html; this.ponerEn(el, x, y); this.el.capa.append(el); setTimeout(() => el.remove(), 900) }
  quitar(b) { b.estado = 'fuera'; b.el.remove(); this.J.burbujas = this.J.burbujas.filter((x) => x !== b) }

  /* ---- disparo ---- */
  oyNave(ms) { return Math.round(Math.sin(ms / 900) * 2) }
  posHeroe(fr, ms) { return [HEROE_X, cubierta(this.oyNave(ms)) - fr.cadera + 1] }
  puedeDisparar() { const J = this.J; return this.jugando() && J.t >= J.trabadaHasta && J.t >= J.recargaHasta && !J.dardos.some((d) => d.vuela) }
  disparar(b, punto) {
    const J = this.J
    if (!this.puedeDisparar() || (b && b.estado !== 'cae')) return
    if (J.municion <= 0) { const r = this.el.recargar; r.classList.remove('sacude'); void r.offsetWidth; r.classList.add('sacude'); return }
    const tx = b ? b.x : punto[0], ty = b ? b.y : punto[1], ms = performance.now()
    /* La pose más cercana al ángulo: al frente, 45° o arriba; el dardo vuela al ángulo exacto */
    const base = cuadroHeroe(this.heroe, 'a0'), [hx, hy] = this.posHeroe(base, ms)
    const hombroX = hx + OX + this.heroe.hd.hombro[0], hombroY = hy + OY + this.heroe.hd.hombro[1]
    const ang = Math.atan2(hombroY - ty, tx - hombroX) * 180 / Math.PI
    const cual = ang < 22.5 ? '0' : ang < 67.5 ? '45' : '90'
    const fr = cuadroHeroe(this.heroe, 'a' + cual), [fx, fy] = this.posHeroe(fr, ms)
    J.apunta = 'a' + cual; J.pose = 'd' + cual; J.poseHasta = J.t + 0.45
    J.municion--
    if (b) b.estado = 'apuntada'
    J.dardos.push({ x: fx + fr.boca[0], y: fy + fr.boca[1], b, punto: b ? null : [tx, ty], vuela: true })
    sonar('tiro')
    this.actualizarBarra()
  }
  tocarCielo(e) {
    if (!this.puedeDisparar()) return
    const r = this.el.escena.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * W, y = (e.clientY - r.top) / r.height * H
    if (y > cubierta(0) - 6 && x < 50) return   // tocar la nave no dispara
    this.disparar(null, [x, y])
  }
  recargar() {
    const J = this.J
    if (!this.jugando() || J.t < J.trabadaHasta || J.t < J.recargaHasta || J.municion >= CARGADOR) return
    J.recargaDesde = J.t; J.recargaHasta = J.t + RECARGA_SEG; sonar('recarga'); this.actualizarBarra()
  }
  impacto(d) {
    const b = d.b, J = this.J
    b.estado = 'plop'; b.el.classList.add('plop'); this.flota(b.x, b.y - 14, 'PLOP!', 'plopTxt')
    d.pegado = J.t
    setTimeout(() => {
      d.fuera = true
      if (b.correcta) {
        const vale = b.dorada ? DORADA_VALE : 1
        J.racha++; J.mejorRacha = Math.max(J.mejorRacha, J.racha); J.aciertos += vale; J.reventadas++
        J.municion = Math.min(CARGADOR, J.municion + 1)
        this.flota(b.x, b.y, `<div class="e">✦ ${b.dorada ? 'GOLD' : 'POP'} ✦</div><div class="p">+${PUNTOS_BURBUJA * vale * this.o.mult}</div>`, b.dorada ? 'oro' : '')
        sonar(b.dorada ? 'oro' : 'pop', J.racha)   // la dorada tiene su propio pop épico
        this.quitar(b)
        this.o.onAciertos?.(J.aciertos)
      } else {
        J.racha = 0
        b.el.classList.remove('plop'); b.el.classList.add('mal')
        J.trabadaHasta = J.t + TRABA_SEG; J.pose = 'trabada'; J.poseHasta = J.t + TRABA_SEG
        this.el.aviso.innerHTML = explicarError(this.o.catId, b.palabra, b.tipo, this.o.lang) + '<br>' + this.o.t('bonusTraba')
        this.el.aviso.style.display = 'block'
        sonar('mal')
        setTimeout(() => { this.el.aviso.style.display = 'none' }, TRABA_SEG * 1000 + 300)
        setTimeout(() => this.quitar(b), 700)
      }
      this.actualizarBarra()
    }, 250)
  }

  terminar() {
    const J = this.J
    J.terminado = true
    J.burbujas.forEach((b) => b.el.remove()); J.burbujas = []; J.dardos = []
    this.el.aviso.style.display = 'none'; this.el.recargar.style.display = 'none'
    const t = this.o.t
    this.el.res1.innerHTML = t('bonusReventaste', J.reventadas)
    this.el.res2.innerHTML = t('bonusMejorRacha', J.mejorRacha) + (this.o.mult > 1 ? ` · Bonus <b>×${this.o.mult}</b>` : '')
    this.el.total.textContent = `+${J.aciertos * PUNTOS_BURBUJA * this.o.mult}`
    this.el.final.classList.remove('bj-oculto')
    this.o.onAciertos?.(J.aciertos)
  }

  /* ---- bucle ---- */
  cuadro(ms) {
    this.raf = requestAnimationFrame((m) => this.cuadro(m))
    const dt = Math.min(0.05, (ms - this.antes) / 1000); this.antes = ms
    const J = this.J, ahora = this.o.ahora()
    /* cuenta regresiva hasta el inicio (sincronizada con el proyector) */
    if (ahora < this.o.inicio) { const n = Math.max(1, Math.ceil((this.o.inicio - ahora) / 1000)); this.el.cuenta.textContent = n <= 3 ? n : '👀'; this.el.cuenta.style.fontSize = n <= 3 ? '' : '44px' }   // antes: «mira el proyector»
    else if (!this.el.intro.classList.contains('bj-oculto')) this.el.intro.classList.add('bj-oculto')
    if (ahora >= this.o.fin && !J.terminado) this.terminar()
    if (this.jugando()) {
      J.t = this.reloj
      J.proxima -= dt
      if (J.proxima <= 0) { this.nuevaBurbuja(); J.proxima = (0.75 + Math.random() * 0.35) / this.ritmo().frecuencia }
      const fondo = cubierta(0) + 8
      for (const b of [...J.burbujas]) {
        if (b.estado === 'cae' || b.estado === 'apuntada') b.y += b.vel * dt
        if (b.estado === 'cae' && b.y > fondo) { b.el.style.transition = 'opacity .2s'; b.el.style.opacity = 0; b.estado = 'fuera'; setTimeout(() => this.quitar(b), 200) }
        else this.ponerEn(b.el, b.x, b.y)
      }
      for (const d of J.dardos) {
        if (!d.vuela) continue
        const tx = d.b ? d.b.x : d.punto[0], ty = d.b ? d.b.y : d.punto[1]
        const dx = tx - d.x, dy = ty - d.y, dist = Math.hypot(dx, dy)
        d.ang = Math.atan2(-dy, dx) * 180 / Math.PI
        const paso = VEL_DARDO * dt
        if (d.b ? dist <= 9 + paso : dist <= paso) {
          d.vuela = false
          if (d.b) { d.x = tx - dx / dist * 9; d.y = ty - dy / dist * 9; this.impacto(d) } else { d.cae = true; d.vy = 0 }
        } else { d.x += dx / dist * paso; d.y += dy / dist * paso }
      }
      for (const d of J.dardos) if (d.cae) { d.vy += 300 * dt; d.y += d.vy * dt; d.ang -= 400 * dt; if (d.y > H + 10) d.fuera = true }
      for (const d of J.dardos) if (d.pegado && !d.fuera && d.b) { d.x = d.b.x - Math.cos(d.ang * Math.PI / 180) * 9; d.y = d.b.y + Math.sin(d.ang * Math.PI / 180) * 9 }
      J.dardos = J.dardos.filter((d) => !d.fuera)
      if (J.recargaHasta && J.t >= J.recargaHasta && J.municion < CARGADOR) { J.municion = CARGADOR; J.recargaHasta = 0; this.actualizarBarra() }
      /* Sin dardos, recarga solo: espera a que el último dardo pegue (si acierta, vuelve y no hace falta) */
      if (J.municion === 0 && !J.recargaHasta && !J.dardos.some((d) => d.vuela || (d.b && !d.fuera))) this.recargar()
      if (Math.floor(J.t * 4) !== J.ultimoTic) { J.ultimoTic = Math.floor(J.t * 4); this.actualizarBarra() }
    }
    this.dibujar(ms)
  }

  dibujar(ms) {
    const g = this.g, J = this.J, oy = this.oyNave(ms)
    const { CIELO, CAPA_LEJOS, CAPA_MEDIO, CAPA_CERCA } = capasCielo()
    g.drawImage(CIELO, 0, 0)
    const des = (c, v) => { const o = -(Math.floor(ms * v) % 224); g.drawImage(c, o, 0); g.drawImage(c, o + 224, 0) }
    des(CAPA_LEJOS, 0.002); des(CAPA_MEDIO, 0.005)
    globoYCuerdas(g, oy, ms)
    let nombre = 'guardia', estado = J.municion > 0 ? 'cargada' : 'vacia'
    if (J.t < J.recargaHasta) { nombre = J.t - J.recargaDesde < RECARGA_SEG / 2 ? 'r1' : 'r2'; estado = undefined }
    else if (J.t < J.poseHasta) { nombre = J.pose; estado = nombre === 'trabada' ? undefined : 'vacia' }
    else if (J.t < J.poseHasta + 0.6 && J.pose !== 'trabada') { nombre = J.apunta }
    const fr = cuadroHeroe(this.heroe, nombre, estado), [hx, hy] = this.posHeroe(fr, ms)
    g.drawImage(fr.cv, 0, 0, HW, fr.cadera + 2, hx, hy, HW, fr.cadera + 2)   // bajo la cadera va la barquilla
    barquilla(g, oy, ms)
    if (nombre === 'trabada') {
      const cx = hx + fr.cabeza[0], cy = hy + fr.cabeza[1], a = ms / 250
      g.fillStyle = '#FFE478'
      for (let i = 0; i < 3; i++) { const x = Math.round(cx + Math.cos(a + i * 2.1) * 8), y = Math.round(cy + Math.sin(a + i * 2.1) * 2.5); g.fillRect(x - 1, y, 3, 1); g.fillRect(x, y - 1, 1, 3) }
    }
    for (const d of J.dardos) dardo(this.px, Math.round(d.x), Math.round(d.y), d.ang || 45, d.vuela)
    des(CAPA_CERCA, 0.009)
  }
}
