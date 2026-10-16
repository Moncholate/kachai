import { useEffect, useRef, useState } from 'react'
import { useT } from '../i18n.jsx'
import { Button } from '../ui.jsx'
import { Icon } from '../icons.jsx'
import { BONUS_SEG, BONUS_INTRO_SEG, CATEGORIAS, metasLogradas } from '../game/bonus.js'
import { BONUS_DUCK, getSound } from './sound.js'
import { EscenaBonus, LLEGADA } from '../game/bonusProyector.js'

/* La ronda bonus en el proyector (ver game/bonus.js y game/bonusProyector.js).
   'elegir': el profe toca una categoría · 'juego': cuenta regresiva + 40 s ·
   'final': Lexicón se rinde (o se cuentan las metas logradas) y se celebra.
   Nada de nombres ni errores: solo lo que logra el curso entre todos. */
export default function BonusProyector({ state, hits, heroes, now, sugeridas, onElegir, onSaltar, onRindio }) {
  const t = useT()
  const [verMas, setVerMas] = useState(false)
  const lienzo = useRef(null)
  const escena = useRef(null)
  const etapa = state.etapa
  const inicio = typeof state.startedAt === 'number' ? state.startedAt + BONUS_INTRO_SEG * 1000 : null
  const fase = etapa === 'final' ? 'final' : inicio != null && now >= inicio ? 'juego' : 'intro'
  const aciertos = hits || {}
  const total = Object.values(aciertos).reduce((a, n) => a + (Number(n) || 0), 0)
  const meta = state.meta || 12
  const metas = metasLogradas(total, meta)

  useEffect(() => {
    if (etapa === 'elegir' || !lienzo.current) return
    escena.current = new EscenaBonus(lienzo.current, (n) => { if (n === 'lexiconSurrender') onRindio?.(); getSound().effect(n) })
    return () => { escena.current?.destruir(); escena.current = null }
  }, [etapa === 'elegir'])
  const introMs = typeof state.startedAt === 'number' && fase === 'intro' ? Math.max(0, now - state.startedAt) : null
  useEffect(() => { escena.current?.actualizar({ fase, aciertos, heroes, meta, ...(introMs != null ? { introMs } : {}) }) })
  /* Al congelarse Lexicón, la música se aparta 1,6 s para que se oiga el golpe épico (sin bajarla tanto: BONUS_DUCK) */
  const golpe = introMs != null && introMs >= LLEGADA.cruza && introMs < LLEGADA.cruza + 1600
  useEffect(() => { getSound().duck(golpe, BONUS_DUCK); return () => getSound().duck(false) }, [golpe])

  if (etapa === 'elegir') {
    /* Lo de esta unidad primero; lo de antes, aparte y plegado (o directo si esta unidad no trae nada) */
    const nuevas = sugeridas?.nuevas?.length ? sugeridas.nuevas : Object.keys(CATEGORIAS)
    const antes = sugeridas?.nuevas?.length ? sugeridas.antes || [] : []
    const tarjeta = (id) => {
      const c = CATEGORIAS[id]
      return (
        <button key={id} onClick={() => onElegir(id)}
          className="rounded-2xl border-[3px] border-slate-900 bg-[#ffe478] px-4 py-4 text-left shadow-[0_5px_0_#0f172a] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none transition">
          <span className="block text-xl font-black text-[#3b2a05] leading-tight">{c.titulo[t.idioma] || c.titulo.en}</span>
          <span className="block text-sm font-bold text-[#6b4a0a] mt-1">{c.si.slice(0, 4).join(' · ')}…</span>
        </button>
      )
    }
    return (
      <section className="max-w-5xl mx-auto flex flex-col items-center gap-5 py-4">
        <p className="text-sm font-black uppercase tracking-[.3em] text-violet-700">{t('rondaBonus')}</p>
        <h2 className="text-4xl font-black text-center">{t('bonusElegir')}</h2>
        {antes.length > 0 && <p className="text-sm font-black uppercase tracking-widest text-slate-500 -mb-2">{t('bonusNuevas')}</p>}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">{nuevas.map(tarjeta)}</div>
        {antes.length > 0 && (verMas ? (
          <>
            <p className="text-sm font-black uppercase tracking-widest text-slate-500 -mb-2">{t('bonusAntes')}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">{antes.map(tarjeta)}</div>
          </>
        ) : <Button variant="ghost" onClick={() => setVerMas(true)}><span className="inline-flex items-center gap-1.5">{t('bonusMas')}<Icon name="chevron" className="w-4 h-4" /></span></Button>)}
        <Button variant="ghost" onClick={onSaltar}>{t('bonusSaltar')}</Button>
      </section>
    )
  }

  const quedan = inicio == null ? BONUS_SEG : Math.max(0, Math.ceil((inicio + BONUS_SEG * 1000 - Math.max(inicio, etapa === 'final' ? state.finalAt ?? now : now)) / 1000))
  const pct = Math.min(100, Math.round((total / meta) * 100))
  const cat = CATEGORIAS[state.categoria]
  return (
    <section className="relative w-full max-w-[min(100%,calc((100dvh-7rem)*16/9))] mx-auto aspect-video rounded-2xl overflow-hidden bg-black shadow-xl text-[clamp(10px,1.5vw,18px)]">
      <canvas ref={lienzo} className="absolute inset-0 w-full h-full [image-rendering:pixelated]" />
      <div className="absolute left-[2%] right-[2%] top-[3%] flex gap-[2%] items-start">
        <div className="bg-[#ffe478] text-[#3b2a05] font-black rounded-[.6em] px-[.8em] py-[.25em] text-[1.5em] whitespace-nowrap">Pop the {cat?.lema}!</div>
        <div className="flex-1">
          <div className="relative h-[1.3em] bg-[rgba(11,18,34,.6)] border-[3px] border-white rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#8fde5d] to-[#3ca370] transition-[width] duration-300" style={{ width: `${pct}%` }} />
            <div className="absolute top-0 bottom-0 w-[3px] bg-white" style={{ left: '33%' }} />
            <div className="absolute top-0 bottom-0 w-[3px] bg-white" style={{ left: '66%' }} />
          </div>
          <div className="relative h-[2.4em] text-white font-black text-[.85em] [text-shadow:0_2px_3px_#000]">
            {[33, 66, 92].map((x, i) => (
              <span key={i} className={`absolute -translate-x-1/2 top-[.3em] whitespace-nowrap ${metas > i ? 'text-[#8fde5d]' : ''}`} style={{ left: `${x}%` }}>
                {metas > i && <Icon name="check" className="w-[1em] h-[1em] -mt-[.15em] mr-[.2em]" strokeWidth={3.5} />}{t('bonusMeta', i + 1)}
              </span>
            ))}
          </div>
        </div>
        <div className="bg-[rgba(11,18,34,.7)] text-white font-black rounded-[.6em] px-[.6em] py-[.2em] text-[1.5em] tabular-nums">0:{String(quedan).padStart(2, '0')}</div>
      </div>
      {fase === 'intro' && introMs != null && introMs >= LLEGADA.cruza && introMs < LLEGADA.vuelve && (
        <div key="llego" className="absolute left-1/2 bottom-[6%] -translate-x-1/2 whitespace-nowrap text-[3.4em] font-black text-[#ffe478] [text-shadow:0_4px_0_#272736,0_0_12px_#000] animate-[llego_.45s_cubic-bezier(.2,1.6,.4,1)_both]">
          {t('bonusLlego')}
        </div>
      )}
      {fase === 'intro' && introMs != null && introMs >= LLEGADA.vuelve && (
        <div className="absolute left-1/2 top-[30%] -translate-x-1/2 text-center text-white [text-shadow:0_3px_4px_#000]">
          <div className="text-[1.6em] font-black">{t('bonusListos')}</div>
          <div key={Math.ceil((inicio - now) / 1000)} className="text-[5em] font-black text-[#ffe478] leading-none animate-[cuentaPop_.35s_ease-out_both]">{Math.max(1, Math.ceil((inicio - now) / 1000))}</div>
        </div>
      )}
      {fase === 'final' && (
        <div className="absolute left-1/2 top-[22%] -translate-x-1/2 text-center text-white [text-shadow:0_3px_4px_#000] bg-[rgba(11,18,34,.72)] rounded-[.8em] px-[1.6em] py-[.5em] whitespace-nowrap">
          <div className="text-[3em] font-black text-[#ffe478] leading-tight">{metas >= 3 ? t('bonusRindio') : t('bonusParcial', metas)}</div>
          <div className="text-[1.5em] font-black">{'★ '.repeat(Math.max(1, metas)).trim()} · {t('bonusBurbujas', total)}</div>
        </div>
      )}
      <style>{'@keyframes llego { from { transform: translateX(-50%) scale(.3); opacity: 0 } to { transform: translateX(-50%) scale(1); opacity: 1 } } @keyframes cuentaPop { from { transform: scale(1.8); opacity: 0 } to { transform: scale(1); opacity: 1 } }'}</style>
    </section>
  )
}
