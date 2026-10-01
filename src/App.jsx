import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import { Camera, Images, HelpCircle, Share2, Flame, Trophy, Users } from 'lucide-react'
import { cardForDay } from './lib/challenges'
import { today, msUntilTomorrow } from './lib/day'
import { loadProgress, saveProgress, recordCell, savePhoto, photoKey } from './lib/storage'
import { compressImage } from './lib/image'
import { stats } from './lib/bingo'
import { boardPoints } from './lib/scoring'
import { api, getPlayer, setPlayer, errorText } from './lib/api'
import { shareResult } from './lib/share'
import Board from './components/Board'
import CaptureSheet from './components/CaptureSheet'
import Album from './components/Album'
import Help from './components/Help'
import Onboarding from './components/Onboarding'
import FlashBanner from './components/FlashBanner'
import Ranking from './components/Ranking'
import Rooms from './components/Rooms'

const COLORS = ['#FFD23F', '#FF4F79', '#3EC1D3', '#ffffff']

export default function App() {
  const [player, setPlayerState] = useState(getPlayer)
  const [me, setMe] = useState(null)
  const [day, setDay] = useState(today)
  const card = useMemo(() => cardForDay(day.number), [day.number])
  const [progress, setProgress] = useState(loadProgress)
  const [tab, setTab] = useState('hoy')
  const [openRoom, setOpenRoom] = useState(null)
  const [inviteCode, setInviteCode] = useState(() => new URLSearchParams(location.search).get('sala')?.toUpperCase() || null)
  const [sheet, setSheet] = useState(null)
  const [toast, setToast] = useState('')
  const [showHelp, setShowHelp] = useState(false)
  const [flashTick, setFlashTick] = useState(0)
  const fileRef = useRef(null)
  const pending = useRef(null)

  const refreshMe = useCallback(async () => {
    if (!getPlayer()) return
    try {
      setMe(await api('/api/me'))
    } catch (err) {
      if (err.status === 401) { setPlayer(null); setPlayerState(null) }
    }
  }, [])

  useEffect(() => { refreshMe() }, [player, day.number, refreshMe])

  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === 'visible') { setDay(today()); refreshMe() } }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [refreshMe])

  useEffect(() => {
    const t = setTimeout(() => setDay(today()), msUntilTomorrow() + 1000)
    return () => clearTimeout(t)
  }, [day.number])

  useEffect(() => { saveProgress(progress) }, [progress])

  // Enlace de invitación ?sala=CODE → pestaña Salas
  useEffect(() => { if (inviteCode && player) setTab('salas') }, [inviteCode, player])

  // Al abrir desde la notificación del Flash
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.has('flash') || params.has('sala')) history.replaceState(null, '', '/')
    if (params.has('flash')) setTab('hoy')
  }, [])

  function flash(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2800)
  }

  // ── Captura: target = { board, idx, challenge, card, name } ──
  const capture = useCallback(target => {
    pending.current = target
    fileRef.current.value = ''
    fileRef.current.click()
  }, [])

  async function onFile(e) {
    const file = e.target.files?.[0]
    const target = pending.current
    if (!file || !target) return
    const image = await compressImage(file)
    setSheet({ target, image, status: 'checking' })

    let res
    try {
      res = await api('/api/validate', { method: 'POST', body: { board: target.board, idx: target.idx, image } })
    } catch (err) {
      setSheet({ target, image, status: 'fail', reason: errorText(err) })
      return
    }
    if (!res.ok) {
      setSheet({ target, image, status: res.closed || res.limit ? 'closed' : 'fail', reason: res.reason })
      return
    }

    const isFlash = target.board === 'flash'
    const pBoard = isFlash ? 'flash' : target.board
    const pIdx = isFlash ? 0 : target.idx
    await savePhoto(photoKey(pBoard, day.number, pIdx), image)
    setProgress(p => recordCell(p, pBoard, target.name, day.number, pIdx))
    setSheet({ target, image, status: 'ok', reason: res.reason, points: res.points })
    if (isFlash) setFlashTick(t => t + 1)
    await refreshMe()

    if (res.full) celebrate(true)
    else if (res.points > 0 && (res.lines ?? 0) > (target.linesBefore ?? 0)) celebrate(false)
    else if (isFlash) celebrate(false)
  }

  function celebrate(full) {
    confetti({ particleCount: full ? 220 : 110, spread: full ? 120 : 75, origin: { y: 0.6 }, colors: COLORS })
    if (full) {
      setTimeout(() => confetti({ particleCount: 160, angle: 60, spread: 70, origin: { x: 0 }, colors: COLORS }), 250)
      setTimeout(() => confetti({ particleCount: 160, angle: 120, spread: 70, origin: { x: 1 }, colors: COLORS }), 400)
    }
  }

  if (!player) {
    return <Onboarding onDone={p => { setPlayer(p); setPlayerState(p); setShowHelp(true) }} />
  }

  const s = stats(progress, day.number)
  const globalCells = me?.day === day.number ? me.global.cells : {}
  const gp = boardPoints(globalCells, card)
  const dayPts = gp.total + (me?.day === day.number ? me.global.flash : 0)
  const found = Object.keys(globalCells).length

  async function onShare() {
    const r = await shareResult({ number: day.number, done: globalCells, lines: gp.lines, pts: dayPts })
    if (r === 'copied') flash('Resultado copiado. ¡Pégalo en tu grupo!')
  }

  return (
    <div className="app">
      <header className="top">
        <div className="brand">
          <span className="logo">📸</span>
          <div>
            <h1>Bingo Callejero</h1>
            <p className="sub">{player.emoji} {player.name} · Cartón #{day.number}</p>
          </div>
        </div>
        <div className="top-actions">
          {s.streak > 0 && <span className="streak" title="Días seguidos con al menos una línea"><Flame size={16} />{s.streak}</span>}
          <button className="icon-btn" onClick={() => setShowHelp(true)} aria-label="Cómo se juega"><HelpCircle size={22} /></button>
        </div>
      </header>

      {tab === 'hoy' && (
        <main className="today">
          <FlashBanner
            key={flashTick}
            vapidKey={me?.vapidKey}
            onCapture={challenge => capture({ board: 'flash', challenge, name: 'Flash' })}
            onToast={flash}
          />

          <div className="status">
            <div><strong>{found}/9</strong> · <strong>{dayPts}</strong> pts hoy</div>
            <Countdown />
          </div>

          <Board
            board="global"
            day={day.number}
            card={card}
            done={globalCells}
            onTap={(idx, isDone) => isDone
              ? setSheet({ target: { board: 'global', idx, challenge: card[idx], name: 'Cartón del día' }, status: 'view', photoKey: photoKey('global', day.number, idx) })
              : capture({ board: 'global', idx, challenge: card[idx], name: 'Cartón del día', linesBefore: gp.lines })}
          />

          {found === 9 && <div className="bingo-banner">¡BINGO! Cartón completo 🎉</div>}

          <div className="cta-row">
            {found > 0 ? (
              <button className="btn primary" onClick={onShare}><Share2 size={18} /> Compartir resultado</button>
            ) : (
              <p className="nudge"><Camera size={16} /> Toca una casilla, sal a la calle y hazle una foto.</p>
            )}
          </div>
        </main>
      )}

      {tab === 'salas' && (
        <Rooms
          me={me}
          day={day}
          openRoom={openRoom}
          setOpenRoom={setOpenRoom}
          inviteCode={inviteCode}
          clearInvite={() => setInviteCode(null)}
          refreshMe={refreshMe}
          capture={capture}
          onView={target => setSheet({ target, status: 'view', photoKey: photoKey(target.board, day.number, target.idx) })}
          onToast={flash}
        />
      )}

      {tab === 'ranking' && (
        <main>
          <h2 className="section-title"><Trophy size={20} /> Ranking mundial</h2>
          <Ranking board="global" refreshKey={dayPts} />
        </main>
      )}

      {tab === 'album' && <Album progress={progress} todayNumber={day.number} stats={s} />}

      <nav className="tabs">
        <TabBtn id="hoy" tab={tab} setTab={setTab} icon={<Camera size={20} />} label="Hoy" />
        <TabBtn id="salas" tab={tab} setTab={t => { setOpenRoom(null); setTab(t) }} icon={<Users size={20} />} label="Salas" />
        <TabBtn id="ranking" tab={tab} setTab={setTab} icon={<Trophy size={20} />} label="Ranking" />
        <TabBtn id="album" tab={tab} setTab={setTab} icon={<Images size={20} />} label="Álbum" />
      </nav>

      <input ref={fileRef} type="file" accept="image/*" capture="environment" hidden onChange={onFile} />

      {sheet && (
        <CaptureSheet
          sheet={sheet}
          onClose={() => setSheet(null)}
          onRetry={() => { const t = sheet.target; setSheet(null); capture(t) }}
        />
      )}
      {showHelp && <Help onClose={() => setShowHelp(false)} />}
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

function TabBtn({ id, tab, setTab, icon, label }) {
  return (
    <button className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>
      {icon}<span>{label}</span>
    </button>
  )
}

function Countdown() {
  const [ms, setMs] = useState(msUntilTomorrow)
  useEffect(() => {
    const t = setInterval(() => setMs(msUntilTomorrow()), 30000)
    return () => clearInterval(t)
  }, [])
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  return <span className="countdown">Nuevo cartón en {h}h {m}m</span>
}
