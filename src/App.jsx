import { useEffect, useMemo, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import { Camera, Images, HelpCircle, Share2, Flame } from 'lucide-react'
import { cardForDay } from './lib/challenges'
import { today, msUntilTomorrow, formatDuration } from './lib/day'
import { loadProgress, saveProgress, savePhoto, getPhoto, photoKey } from './lib/storage'
import { compressImage } from './lib/image'
import { completedLines, stats } from './lib/bingo'
import Board from './components/Board'
import CaptureSheet from './components/CaptureSheet'
import Album from './components/Album'
import Help from './components/Help'
import { shareResult } from './lib/share'

export default function App() {
  const [day, setDay] = useState(today)
  const card = useMemo(() => cardForDay(day.number), [day.number])
  const [progress, setProgress] = useState(loadProgress)
  const [tab, setTab] = useState('hoy')
  const [sheet, setSheet] = useState(null) // { idx, image, status: 'checking'|'ok'|'fail'|'view', reason }
  const [photos, setPhotos] = useState({})
  const [toast, setToast] = useState('')
  const [showHelp, setShowHelp] = useState(() => !localStorage.getItem('bc:seen-help'))
  const fileRef = useRef(null)
  const pendingIdx = useRef(null)

  const todayProgress = progress[day.number] || { cells: {} }
  const done = todayProgress.cells
  const lines = completedLines(done)
  const found = Object.keys(done).length
  const s = stats(progress, day.number)

  // Cambio de día si la app se queda abierta pasada la medianoche
  useEffect(() => {
    const t = setTimeout(() => setDay(today()), msUntilTomorrow() + 1000)
    return () => clearTimeout(t)
  }, [day.number])

  useEffect(() => { saveProgress(progress) }, [progress])

  // Miniaturas de las casillas ya conseguidas
  useEffect(() => {
    let alive = true
    Promise.all(Object.keys(done).map(async i => [i, await getPhoto(photoKey(day.number, i))]))
      .then(entries => alive && setPhotos(Object.fromEntries(entries.filter(([, v]) => v))))
    return () => { alive = false }
  }, [day.number, found])

  function flash(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2600)
  }

  function openCamera(idx) {
    pendingIdx.current = idx
    fileRef.current.value = ''
    fileRef.current.click()
  }

  function onCellTap(idx) {
    if (done[idx]) setSheet({ idx, image: photos[idx], status: 'view' })
    else openCamera(idx)
  }

  async function onFile(e) {
    const file = e.target.files?.[0]
    const idx = pendingIdx.current
    if (!file || idx == null) return
    const image = await compressImage(file)
    setSheet({ idx, image, status: 'checking' })

    const challenge = card[idx]
    let verdict
    try {
      const res = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ image, challenge: { text: challenge.text, hint: challenge.hint }, dayOfMonth: day.dayOfMonth }),
      })
      if (res.status === 429) verdict = { ok: false, reason: 'Mucha gente jugando ahora mismo. Prueba en unos segundos.', retry: true }
      else if (res.ok) verdict = await res.json()
      else verdict = { ok: true, unverified: true, reason: '¡Apuntada! (sin árbitro IA disponible ahora)' }
    } catch {
      verdict = { ok: true, unverified: true, reason: '¡Apuntada! (sin conexión con el árbitro IA)' }
    }

    if (!verdict.ok) {
      setSheet({ idx, image, status: 'fail', reason: verdict.reason })
      return
    }

    await savePhoto(photoKey(day.number, idx), image)
    const before = lines.length
    const nextCells = { ...done, [idx]: { at: Date.now(), verified: !verdict.unverified } }
    const nextLines = completedLines(nextCells).length
    setProgress(p => ({ ...p, [day.number]: { cells: nextCells } }))
    setPhotos(ph => ({ ...ph, [idx]: image }))
    setSheet({ idx, image, status: 'ok', reason: verdict.reason })

    if (Object.keys(nextCells).length === 9) celebrate(true)
    else if (nextLines > before) celebrate(false)
  }

  function celebrate(full) {
    const colors = ['#FFD23F', '#FF4F79', '#3EC1D3', '#ffffff']
    confetti({ particleCount: full ? 220 : 110, spread: full ? 120 : 75, origin: { y: 0.6 }, colors })
    if (full) setTimeout(() => confetti({ particleCount: 160, angle: 60, spread: 70, origin: { x: 0 }, colors }), 250)
    if (full) setTimeout(() => confetti({ particleCount: 160, angle: 120, spread: 70, origin: { x: 1 }, colors }), 400)
  }

  async function onShare() {
    const r = await shareResult({ number: day.number, done, lines: lines.length })
    if (r === 'copied') flash('Resultado copiado. ¡Pégalo en tu grupo!')
  }

  function closeHelp() {
    try { localStorage.setItem('bc:seen-help', '1') } catch { /* nada */ }
    setShowHelp(false)
  }

  const times = Object.values(done).map(c => c.at)
  const elapsed = times.length > 1 ? Math.max(...times) - Math.min(...times) : 0

  return (
    <div className="app">
      <header className="top">
        <div className="brand">
          <span className="logo">📸</span>
          <div>
            <h1>Bingo Callejero</h1>
            <p className="sub">Cartón #{day.number}</p>
          </div>
        </div>
        <div className="top-actions">
          {s.streak > 0 && <span className="streak" title="Días seguidos con al menos una línea"><Flame size={16} />{s.streak}</span>}
          <button className="icon-btn" onClick={() => setShowHelp(true)} aria-label="Cómo se juega"><HelpCircle size={22} /></button>
        </div>
      </header>

      {tab === 'hoy' ? (
        <main className="today">
          <div className="status">
            <div>
              <strong>{found}/9</strong> encontradas
              {lines.length > 0 && <> · <strong>{lines.length}</strong> {lines.length === 1 ? 'línea' : 'líneas'}</>}
            </div>
            <Countdown />
          </div>

          <Board card={card} done={done} photos={photos} lines={lines} onTap={onCellTap} />

          {found === 9 && (
            <div className="bingo-banner">¡BINGO! Cartón completo{elapsed ? ` en ${formatDuration(elapsed)}` : ''} 🎉</div>
          )}

          <div className="cta-row">
            {found > 0 ? (
              <button className="btn primary" onClick={onShare}><Share2 size={18} /> Compartir resultado</button>
            ) : (
              <p className="nudge"><Camera size={16} /> Toca una casilla, sal a la calle y hazle una foto.</p>
            )}
          </div>
        </main>
      ) : (
        <Album progress={progress} todayNumber={day.number} stats={s} />
      )}

      <nav className="tabs">
        <button className={tab === 'hoy' ? 'active' : ''} onClick={() => setTab('hoy')}><Camera size={20} /> Hoy</button>
        <button className={tab === 'album' ? 'active' : ''} onClick={() => setTab('album')}><Images size={20} /> Álbum</button>
      </nav>

      <input ref={fileRef} type="file" accept="image/*" capture="environment" hidden onChange={onFile} />

      {sheet && (
        <CaptureSheet
          sheet={sheet}
          challenge={card[sheet.idx]}
          onClose={() => setSheet(null)}
          onRetry={() => { const i = sheet.idx; setSheet(null); openCamera(i) }}
        />
      )}
      {showHelp && <Help onClose={closeHelp} />}
      {toast && <div className="toast">{toast}</div>}
    </div>
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
