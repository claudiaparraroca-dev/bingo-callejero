import { useEffect, useState } from 'react'
import { cardForDay } from '../lib/challenges'
import { dayLabel } from '../lib/day'
import { getPhoto, photoKey } from '../lib/storage'
import { summary } from '../lib/bingo'

export default function Album({ progress, todayNumber, stats }) {
  // Una entrada por (cartón, día), de más reciente a más antiguo. El Flash va aparte.
  const entries = Object.entries(progress)
    .filter(([board]) => board !== 'flash')
    .flatMap(([board, b]) => Object.entries(b.days || {}).map(([n, d]) => ({ board, name: b.name, n: Number(n), day: d })))
    .filter(e => Object.keys(e.day.cells || {}).length)
    .sort((a, b) => b.n - a.n || (a.board === 'global' ? -1 : 1))
  const flashDays = Object.keys(progress.flash?.days || {}).map(Number).sort((a, b) => b - a)

  return (
    <main className="album">
      <div className="stats">
        <Stat n={stats.played} label="días jugados" />
        <Stat n={stats.photos} label="fotos" />
        <Stat n={stats.bingos} label="bingos" />
        <Stat n={stats.streak} label="racha 🔥" />
      </div>

      {flashDays.length > 0 && (
        <section className="album-day">
          <header><strong>⚡ Mis Flash</strong><span className="pill">{flashDays.length}</span></header>
          <div className="flash-strip">{flashDays.map(n => <FlashThumb key={n} n={n} />)}</div>
        </section>
      )}

      {entries.length === 0 && <p className="empty">Aquí irán tus cartones. ¡Haz tu primera foto en la pestaña Hoy!</p>}
      {entries.map(e => <AlbumDay key={`${e.board}-${e.n}`} {...e} isToday={e.n === todayNumber} />)}
    </main>
  )
}

function Stat({ n, label }) {
  return <div className="stat"><strong>{n}</strong><span>{label}</span></div>
}

function FlashThumb({ n }) {
  const [src, setSrc] = useState(null)
  useEffect(() => { getPhoto(photoKey('flash', n, 0)).then(setSrc) }, [n])
  return <div className="mini has flash-mini" title={`Cartón #${n}`}>{src ? <img src={src} alt="" /> : '⚡'}</div>
}

function AlbumDay({ board, name, n, day, isToday }) {
  // En salas solo mostramos las fotos (el cartón depende de la temática de la sala)
  const card = board === 'global' ? cardForDay(n) : null
  const [photos, setPhotos] = useState({})
  const { found, lines } = summary(day)

  useEffect(() => {
    let alive = true
    Promise.all(Object.keys(day.cells).map(async i => [i, await getPhoto(photoKey(board, n, i))]))
      .then(e => alive && setPhotos(Object.fromEntries(e.filter(([, v]) => v))))
    return () => { alive = false }
  }, [board, n, found])

  return (
    <section className="album-day">
      <header>
        <strong>{board === 'global' ? `#${n}` : name}</strong> <span>{isToday ? 'Hoy' : dayLabel(n)}</span>
        <span className="pill">{found}/9{lines ? ` · ${lines} ${lines === 1 ? 'línea' : 'líneas'}` : ''}</span>
      </header>
      <div className="mini-board">
        {Array.from({ length: 9 }, (_, i) => (
          <div key={i} className={`mini ${photos[i] ? 'has' : ''}`} title={card?.[i]?.text}>
            {photos[i] ? <img src={photos[i]} alt={card?.[i]?.text || ''} loading="lazy" /> : <span>{card?.[i]?.emoji || '·'}</span>}
          </div>
        ))}
      </div>
    </section>
  )
}
