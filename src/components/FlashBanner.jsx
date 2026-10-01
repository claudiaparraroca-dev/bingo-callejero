import { useEffect, useState } from 'react'
import { Zap, Bell, BellRing } from 'lucide-react'
import { api } from '../lib/api'
import { flashPoints } from '../lib/scoring'
import { enablePush, pushEnabled, pushSupported, isIOS, isStandalone } from '../lib/push'

export default function FlashBanner({ vapidKey, onCapture, onToast }) {
  const [flash, setFlash] = useState(null)
  const [skew, setSkew] = useState(0) // diferencia reloj servidor - móvil
  const [now, setNow] = useState(Date.now())
  const [pushOn, setPushOn] = useState(false)

  async function load() {
    try {
      const f = await api('/api/flash')
      setSkew(f.now - Date.now())
      setFlash(f)
    } catch { /* sin conexión: lo intentamos en el siguiente ciclo */ }
  }

  useEffect(() => {
    load()
    pushEnabled().then(setPushOn)
    const onVisible = () => document.visibilityState === 'visible' && load()
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [])

  // En espera: preguntamos cada 30 s. Activo: cuenta atrás cada segundo.
  useEffect(() => {
    if (!flash) return
    if (flash.state === 'waiting') {
      const t = setInterval(load, 30000)
      return () => clearInterval(t)
    }
    if (flash.state === 'active') {
      const t = setInterval(() => {
        const n = Date.now() + skew
        setNow(n)
        if (n > flash.endsAt) load()
      }, 1000)
      return () => clearInterval(t)
    }
  }, [flash, skew])

  async function turnOnPush() {
    if (isIOS() && !isStandalone()) {
      onToast('En iPhone: primero añade la app a la pantalla de inicio.')
      return
    }
    try {
      await enablePush(vapidKey)
      setPushOn(true)
      onToast('¡Hecho! Te avisaremos cuando salte el Flash ⚡')
    } catch (err) {
      onToast(err.message === 'denied' ? 'Has bloqueado los avisos en el navegador.' : 'Tu navegador no permite avisos.')
    }
  }

  if (!flash) return null

  if (flash.state === 'waiting') {
    return (
      <div className="flash waiting">
        <Zap size={22} className="flash-icon" />
        <div className="flash-body">
          <strong>Flash sorpresa</strong>
          <span>Hoy saltará a una hora secreta entre las 10:00 y las 22:00. Tendrás 5 minutos.</span>
        </div>
        {vapidKey && pushSupported() && !pushOn && (
          <button className="chip-btn" onClick={turnOnPush}><Bell size={16} /> Avisarme</button>
        )}
        {pushOn && <BellRing size={18} className="muted" aria-label="Avisos activados" />}
      </div>
    )
  }

  const { challenge } = flash
  if (flash.done) {
    return (
      <div className="flash done">
        <Zap size={22} className="flash-icon" />
        <div className="flash-body">
          <strong>Flash conseguido · +{flash.points} pts</strong>
          <span>{challenge.emoji} {challenge.text}</span>
        </div>
      </div>
    )
  }

  if (flash.state === 'over') {
    return (
      <div className="flash over">
        <Zap size={22} className="flash-icon" />
        <div className="flash-body">
          <strong>El Flash de hoy se te escapó</strong>
          <span>Era: {challenge.emoji} {challenge.text}. ¡Mañana más!</span>
        </div>
      </div>
    )
  }

  const left = Math.max(0, flash.endsAt - now)
  const mm = Math.floor(left / 60000)
  const ss = String(Math.floor((left % 60000) / 1000)).padStart(2, '0')
  return (
    <button className="flash active" onClick={() => onCapture(challenge)}>
      <Zap size={26} className="flash-icon" />
      <div className="flash-body">
        <strong>¡FLASH! {challenge.emoji} {challenge.text}</strong>
        <span>Ahora vale {flashPoints(now - flash.startsAt)} pts · toca para hacer la foto</span>
      </div>
      <span className="flash-timer">{mm}:{ss}</span>
    </button>
  )
}
