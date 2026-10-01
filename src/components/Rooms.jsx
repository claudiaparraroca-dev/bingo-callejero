import { useEffect, useMemo, useState } from 'react'
import { Plus, LogIn, ChevronLeft, Share2, LogOut, Loader2, X } from 'lucide-react'
import { THEMES } from '../lib/themes'
import { cardFromPool, cardForDay } from '../lib/challenges'
import { boardPoints } from '../lib/scoring'
import { api, errorText } from '../lib/api'
import Board from './Board'
import Ranking from './Ranking'

export default function Rooms({ me, day, openRoom, setOpenRoom, inviteCode, clearInvite, refreshMe, capture, onView, onToast }) {
  const [dialog, setDialog] = useState(null) // 'create' | 'join'
  const rooms = me?.rooms || []
  const room = rooms.find(r => r.code === openRoom)

  if (room) {
    return <RoomView room={room} me={me} day={day} onBack={() => setOpenRoom(null)} refreshMe={refreshMe} capture={capture} onView={onView} onToast={onToast} />
  }

  return (
    <main className="rooms">
      <h2 className="section-title">Salas privadas</h2>
      <p className="small">Crea una sala, elige temática y pásale el enlace a tus amigos. Cada sala tiene su propio ranking.</p>

      {inviteCode && !rooms.some(r => r.code === inviteCode) && (
        <Invite code={inviteCode} onJoined={async code => { clearInvite(); await refreshMe(); setOpenRoom(code) }} onDismiss={clearInvite} />
      )}

      <div className="room-actions">
        <button className="btn primary" onClick={() => setDialog('create')}><Plus size={18} /> Crear sala</button>
        <button className="btn ghost" onClick={() => setDialog('join')}><LogIn size={18} /> Tengo un código</button>
      </div>

      {!me && <p className="empty"><Loader2 className="spin" size={18} /></p>}
      {me && rooms.length === 0 && <p className="empty">Aún no estás en ninguna sala.</p>}

      <div className="room-list">
        {rooms.map(r => {
          const t = THEMES[r.theme] || THEMES.clasico
          return (
            <button key={r.code} className="room-card" onClick={() => setOpenRoom(r.code)}>
              <span className="room-emoji">{t.emoji}</span>
              <span className="room-info">
                <strong>{r.name}</strong>
                <span>{t.name} · {r.members.length} {r.members.length === 1 ? 'jugador' : 'jugadores'}</span>
              </span>
              <span className="room-avatars">{r.members.slice(0, 5).map((m, i) => <span key={i}>{m.emoji}</span>)}</span>
            </button>
          )
        })}
      </div>

      {dialog === 'create' && (
        <CreateRoom onClose={() => setDialog(null)} onCreated={async room => {
          setDialog(null); await refreshMe(); setOpenRoom(room.code); shareInvite(room, onToast)
        }} />
      )}
      {dialog === 'join' && (
        <JoinRoom onClose={() => setDialog(null)} onJoined={async code => { setDialog(null); await refreshMe(); setOpenRoom(code) }} />
      )}
    </main>
  )
}

function RoomView({ room, me, day, onBack, refreshMe, capture, onView, onToast }) {
  const theme = THEMES[room.theme] || THEMES.clasico
  const classic = room.theme === 'clasico'
  const card = useMemo(
    () => (classic ? cardForDay(day.number) : cardFromPool(`room:${room.code}:${day.number}`, theme.pool)),
    [classic, room.code, day.number, theme],
  )
  const cells = classic ? (me?.global.cells || {}) : (room.today?.cells || {})
  const pts = boardPoints(cells, card)

  async function leave() {
    if (!confirm(`¿Salir de la sala «${room.name}»?`)) return
    try {
      await api(`/api/rooms/${room.code}/leave`, { method: 'POST' })
      await refreshMe()
      onBack()
    } catch (err) { onToast(errorText(err)) }
  }

  return (
    <main className="room-view">
      <div className="room-head">
        <button className="icon-btn" onClick={onBack} aria-label="Volver"><ChevronLeft size={24} /></button>
        <div className="room-title">
          <h2>{theme.emoji} {room.name}</h2>
          <span className="small">{theme.name} · código <strong className="code">{room.code}</strong></span>
        </div>
        <button className="chip-btn" onClick={() => shareInvite(room, onToast)}><Share2 size={16} /> Invitar</button>
      </div>

      <div className="room-members">{room.members.map((m, i) => <span key={i} title={m.name}>{m.emoji}</span>)}</div>

      {classic ? (
        <p className="note">Esta sala juega el <strong>cartón del día</strong>: tus fotos de la pestaña Hoy (y el Flash) cuentan aquí.</p>
      ) : (
        <>
          <div className="status">
            <div><strong>{Object.keys(cells).length}/9</strong> · <strong>{pts.total}</strong> pts en esta sala</div>
          </div>
          <Board
            board={room.code}
            day={day.number}
            card={card}
            done={cells}
            onTap={(idx, isDone) => {
              const target = { board: room.code, idx, challenge: card[idx], name: room.name, linesBefore: pts.lines }
              isDone ? onView(target) : capture(target)
            }}
          />
          <p className="small center">El Flash del día también suma en todas tus salas ⚡</p>
        </>
      )}

      <h3 className="section-title small-title">Ranking de la sala</h3>
      <Ranking board={room.code} refreshKey={JSON.stringify(cells) + (me?.global.flash || 0)} />

      <button className="btn ghost danger" onClick={leave}><LogOut size={16} /> Salir de la sala</button>
    </main>
  )
}

function CreateRoom({ onClose, onCreated }) {
  const [name, setName] = useState('')
  const [theme, setTheme] = useState('clasico')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    setBusy(true); setError('')
    try { onCreated(await api('/api/rooms', { method: 'POST', body: { name, theme } })) }
    catch (err) { setError(errorText(err)); setBusy(false) }
  }

  return (
    <Sheet title="Nueva sala" onClose={onClose}>
      <form className="card-form" onSubmit={submit}>
        <label htmlFor="room-name">Nombre de la sala</label>
        <input id="room-name" value={name} maxLength={30} placeholder="Los del insti, Familia, Curro…" onChange={e => setName(e.target.value)} />
        <span className="label">Temática</span>
        <div className="theme-grid">
          {Object.entries(THEMES).map(([key, t]) => (
            <button type="button" key={key} className={`theme-opt${theme === key ? ' sel' : ''}`} onClick={() => setTheme(key)}>
              <span className="theme-emoji">{t.emoji}</span>
              <strong>{t.name}</strong>
              <span>{t.desc}</span>
            </button>
          ))}
        </div>
        {error && <p className="error">{error}</p>}
        <button className="btn primary" disabled={busy || name.trim().length < 2}>
          {busy ? <Loader2 className="spin" size={18} /> : 'Crear e invitar'}
        </button>
      </form>
    </Sheet>
  )
}

function JoinRoom({ onClose, onJoined }) {
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    const c = code.trim().toUpperCase()
    setBusy(true); setError('')
    try { await api(`/api/rooms/${c}/join`, { method: 'POST' }); onJoined(c) }
    catch (err) { setError(errorText(err)); setBusy(false) }
  }

  return (
    <Sheet title="Unirme a una sala" onClose={onClose}>
      <form className="card-form" onSubmit={submit}>
        <label htmlFor="code">Código de 5 letras</label>
        <input id="code" className="code-input" value={code} maxLength={5} autoCapitalize="characters" placeholder="ABC23" onChange={e => setCode(e.target.value)} />
        {error && <p className="error">{error}</p>}
        <button className="btn primary" disabled={busy || code.trim().length !== 5}>
          {busy ? <Loader2 className="spin" size={18} /> : 'Entrar'}
        </button>
      </form>
    </Sheet>
  )
}

function Invite({ code, onJoined, onDismiss }) {
  const [room, setRoom] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api(`/api/rooms/${code}`).then(setRoom).catch(err => setError(errorText(err)))
  }, [code])

  async function join() {
    setBusy(true)
    try { await api(`/api/rooms/${code}/join`, { method: 'POST' }); onJoined(code) }
    catch (err) { setError(errorText(err)); setBusy(false) }
  }

  const t = room && (THEMES[room.theme] || THEMES.clasico)
  return (
    <div className="invite">
      <button className="icon-btn invite-x" onClick={onDismiss} aria-label="Descartar"><X size={18} /></button>
      {error && <p className="error">{error}</p>}
      {!room && !error && <Loader2 className="spin" size={18} />}
      {room && (
        <>
          <span className="small">Te han invitado a</span>
          <strong className="invite-name">{t.emoji} {room.name}</strong>
          <span className="small">{t.name} · {room.members.map(m => m.emoji).join(' ')}</span>
          <button className="btn primary" disabled={busy} onClick={join}>{busy ? <Loader2 className="spin" size={18} /> : 'Unirme'}</button>
        </>
      )}
    </div>
  )
}

function Sheet({ title, onClose, children }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-head">
          <span className="sheet-title">{title}</span>
          <button className="icon-btn" onClick={onClose} aria-label="Cerrar"><X size={22} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

async function shareInvite(room, onToast) {
  const url = `${location.origin}/?sala=${room.code}`
  const t = THEMES[room.theme] || THEMES.clasico
  const text = `¡Únete a mi sala «${room.name}» en Bingo Callejero! ${t.emoji} Código: ${room.code}`
  if (navigator.share) {
    try { await navigator.share({ text, url }); return } catch { /* cancelado */ }
  }
  try { await navigator.clipboard.writeText(`${text}\n${url}`); onToast('Invitación copiada. ¡Pásala por WhatsApp!') }
  catch { onToast(`Código de la sala: ${room.code}`) }
}
