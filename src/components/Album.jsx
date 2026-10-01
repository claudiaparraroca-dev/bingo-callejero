import { useEffect, useState } from 'react'
import { cardForDay } from '../lib/challenges'
import { dayLabel } from '../lib/day'
import { getPhoto, photoKey } from '../lib/storage'
import { summary } from '../lib/bingo'

export default function Album({ progress, todayNumber, stats }) {
  const days = Object.keys(progress)
    .map(Number)
    .filter(n => Object.keys(progress[n].cells || {}).length)
    .sort((a, b) => b - a)

  return (
    <main className="album">
      <div className="stats">
        <Stat n={stats.played} label="días jugados" />
        <Stat n={stats.photos} label="fotos" />
        <Stat n={stats.bingos} label="bingos" />
        <Stat n={stats.streak} label="racha 🔥" />
      </div>

      {days.length === 0 && <p className="empty">Aquí irán tus cartones. ¡Haz tu primera foto en la pestaña Hoy!</p>}

      {days.map(n => <AlbumDay key={n} number={n} day={progress[n]} isToday={n === todayNumber} />)}
    </main>
  )
}

function Stat({ n, label }) {
  return <div className="stat"><strong>{n}</strong><span>{label}</span></div>
}

function AlbumDay({ number, day, isToday }) {
  const card = cardForDay(number)
  const [photos, setPhotos] = useState({})
  const { found, lines } = summary(day)

  useEffect(() => {
    let alive = true
    Promise.all(Object.keys(day.cells).map(async i => [i, await getPhoto(photoKey(number, i))]))
      .then(e => alive && setPhotos(Object.fromEntries(e.filter(([, v]) => v))))
    return () => { alive = false }
  }, [number, found])

  return (
    <section className="album-day">
      <header>
        <strong>#{number}</strong> <span>{isToday ? 'Hoy' : dayLabel(number)}</span>
        <span className="pill">{found}/9{lines ? ` · ${lines} ${lines === 1 ? 'línea' : 'líneas'}` : ''}</span>
      </header>
      <div className="mini-board">
        {card.map((c, i) => (
          <div key={c.id} className={`mini ${photos[i] ? 'has' : ''}`} title={c.text}>
            {photos[i] ? <img src={photos[i]} alt={c.text} loading="lazy" /> : <span>{c.emoji}</span>}
          </div>
        ))}
      </div>
    </section>
  )
}
