import { Suspense, lazy, useEffect, useState } from 'react'
import { Button, Center, Logo } from './ui.jsx'
import { IDIOMA_KEY, ProveedorIdioma, SelectorIdioma, idiomaDelNavegador, idiomaGuardado, useT } from './i18n.jsx'

/* El proyector (biblioteca de actividades, editor, reporte, podio…) se baja
   solo al abrir #/host: el celular de cada alumno no lo necesita y entra más
   rápido con el wifi del colegio. El juego del celular también va aparte: la
   portada aparece al tiro y lo baja mientras el alumno escribe el PIN. */
const Host = lazy(() => import('./host/Host.jsx'))
const cargarPlayer = () => import('./player/Player.jsx')
const Player = lazy(cargarPlayer)
import { useTema } from './tema.jsx'

/* Ruteo por hash: GitHub Pages solo sirve index.html, así que #/host y
   #/play?pin=123456 nunca dan 404. */
function useHash() {
  const [hash, setHash] = useState(location.hash)
  useEffect(() => {
    const onChange = () => setHash(location.hash)
    addEventListener('hashchange', onChange)
    return () => removeEventListener('hashchange', onChange)
  }, [])
  return hash
}

export default function App() {
  const hash = useHash()
  if (hash.startsWith('#/host')) return <Suspense fallback={<Center>…</Center>}><Host /></Suspense>
  if (hash.startsWith('#/play')) {
    const pin = new URLSearchParams(hash.split('?')[1] || '').get('pin') || ''
    return <Suspense fallback={<Center>…</Center>}><Player key={pin} initialPin={pin} /></Suspense>
  }
  return <HomeConIdioma />
}

/* La portada la ven estudiantes y docentes: el último idioma que eligió el
   docente en este computador, o el del navegador. */
function HomeConIdioma() {
  useTema()
  const [idioma, setIdioma] = useState(() => {
    try { return localStorage.getItem(IDIOMA_KEY) ? idiomaGuardado() : idiomaDelNavegador() } catch { return idiomaDelNavegador() }
  })
  return (
    <ProveedorIdioma value={idioma}>
      <Home onIdioma={(l) => { setIdioma(l); try { localStorage.setItem(IDIOMA_KEY, l) } catch { /* modo privado */ } }} />
    </ProveedorIdioma>
  )
}

function Home({ onIdioma }) {
  const t = useT()
  const [pin, setPin] = useState('')
  useEffect(() => { cargarPlayer() }, [])
  return (
    <div className="min-h-screen grid place-items-center p-4">
      <div className="w-full max-w-sm flex flex-col gap-6 text-center">
        <div>
          <Logo className="text-6xl" />
          <p className="text-slate-500 mt-2">{t('lema')}</p>
        </div>
        <form className="rounded-3xl bg-white border border-slate-200 p-6 flex flex-col gap-3"
          onSubmit={(e) => { e.preventDefault(); location.hash = `#/play?pin=${pin}` }}>
          <input inputMode="numeric" maxLength={6} placeholder={t('pinJuego')} value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            className="w-full min-w-0 rounded-xl border-2 border-slate-200 px-4 py-3 text-center text-2xl font-black tracking-widest focus:border-[#0F6FD6] outline-none" />
          <Button disabled={pin.length !== 6} className="text-lg">{t('entrar')}</Button>
        </form>
        <a href="#/host" className="text-slate-500 underline underline-offset-4 hover:text-slate-800">
          {t('soyProfe')}
        </a>
        <SelectorIdioma idioma={t.idioma} onCambiar={onIdioma} className="self-center" />
      </div>
    </div>
  )
}
