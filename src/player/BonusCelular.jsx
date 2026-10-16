import { useEffect, useRef } from 'react'
import { useT } from '../i18n.jsx'
import { BONUS_SEG, BONUS_INTRO_SEG, CATEGORIAS } from '../game/bonus.js'
import { JuegoBonus } from './bonusJuego.js'

/* La ronda bonus en el celular (ver bonusJuego.js). Ocupa toda la pantalla.
   Etapas (state.etapa): 'elegir' → el profe elige la categoría · 'reglas' → el
   proyector explica cómo se juega · 'juego' → se
   juega (con cuenta regresiva) · 'final' → queda el resumen hasta volver al ranking.
   Los aciertos van a rooms/{pin}/bonus/hits/{pid}, como mucho cada 300 ms. */
export default function BonusCelular({ store, base, pid, state, heroe }) {
  const t = useT()
  const caja = useRef(null)
  const juego = useRef(null)
  const jugando = state.etapa === 'juego' || state.etapa === 'final'

  useEffect(() => {
    if (!jugando || !caja.current || typeof state.startedAt !== 'number') return
    let cancelado = false, pendiente = null, ultimo = 0, enviado = -1, previo = 0, espera
    const camino = `${base}/bonus/hits/${pid}`
    /* Si el celular se recargó a mitad de ronda, sigue sumando sobre lo que ya tenía */
    store.get(camino).then((v) => { previo = Number(v) || 0 })
    const enviar = () => {
      espera = null
      if (cancelado || pendiente == null || pendiente === enviado) return
      enviado = pendiente; ultimo = Date.now()
      store.set(camino, previo + pendiente)
    }
    const inicio = state.startedAt + BONUS_INTRO_SEG * 1000
    juego.current = new JuegoBonus(caja.current, {
      catId: state.categoria, lang: t.idioma, mult: state.mult?.[pid] || 1, heroe,
      inicio, fin: inicio + BONUS_SEG * 1000, ahora: () => store.now(), t,
      onAciertos: (n) => {
        pendiente = n
        if (espera) return
        espera = setTimeout(enviar, Math.max(0, 300 - (Date.now() - ultimo)))
      },
    })
    return () => { cancelado = true; clearTimeout(espera); if (pendiente !== enviado && pendiente != null) store.set(camino, previo + pendiente); juego.current?.destruir(); juego.current = null }
  }, [jugando, state.startedAt, state.categoria])

  if (!jugando) {
    const cat = state.etapa === 'reglas' && CATEGORIAS[state.categoria]
    return (
      <div className="h-dvh flex flex-col items-center justify-center gap-3 bg-[#0b1222] text-white text-center p-6">
        <p className="text-sm font-black uppercase tracking-[.3em] text-[#9fb3d1]">{t('rondaBonus')}</p>
        {cat ? <p className="text-2xl font-black">Pop the <span className="text-[#ffe478]">{cat.lema}</span>!</p>
          : <p className="text-2xl font-black">{t('bonusEligiendo')}</p>}
        <p className="text-[#c8d4e6]">{cat ? t('bonusMiraReglas') : t('bonusMira')}</p>
      </div>
    )
  }
  return <div ref={caja} className="h-dvh w-full max-w-md mx-auto" />
}
