import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { api, errorText } from '../lib/api'

const AVATARS = ['🦊', '🐼', '🐸', '🦉', '🐙', '🦄', '🐯', '🐨', '🦖', '🐧', '🦝', '🐝']

export default function Onboarding({ onDone }) {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState(AVATARS[Math.floor(Math.random() * AVATARS.length)])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      onDone(await api('/api/player', { method: 'POST', body: { name, emoji } }))
    } catch (err) {
      setError(errorText(err))
      setBusy(false)
    }
  }

  return (
    <div className="app onboarding">
      <div className="hero">
        <span className="logo big">📸</span>
        <h1>Bingo Callejero</h1>
        <p>Cada día, 9 cosas que cazar con la cámara por la calle. Suma puntos, gana el Flash sorpresa y pica a tus amigos en salas privadas.</p>
      </div>

      <form className="card-form" onSubmit={submit}>
        <label htmlFor="name">¿Cómo te llamamos en el ranking?</label>
        <input
          id="name" value={name} maxLength={20} autoComplete="nickname"
          placeholder="Tu apodo" onChange={e => setName(e.target.value)}
        />
        <span className="label">Elige tu avatar</span>
        <div className="avatar-grid">
          {AVATARS.map(a => (
            <button type="button" key={a} className={a === emoji ? 'sel' : ''} onClick={() => setEmoji(a)} aria-label={`Avatar ${a}`}>{a}</button>
          ))}
        </div>
        {error && <p className="error">{error}</p>}
        <button className="btn primary" disabled={busy || name.trim().length < 2}>
          {busy ? <Loader2 className="spin" size={18} /> : `${emoji} ¡A jugar!`}
        </button>
        <p className="small">Sin email ni contraseña. Tu jugador se guarda en este móvil.</p>
      </form>
    </div>
  )
}
