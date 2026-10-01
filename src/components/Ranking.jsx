import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { api } from '../lib/api'

const MEDAL = { 1: '🥇', 2: '🥈', 3: '🥉' }

export default function Ranking({ board, refreshKey }) {
  const [period, setPeriod] = useState('day')
  const [data, setData] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let alive = true
    setError(false)
    api(`/api/ranking?board=${encodeURIComponent(board)}&period=${period}`)
      .then(d => alive && setData(d))
      .catch(() => alive && setError(true))
    return () => { alive = false }
  }, [board, period, refreshKey])

  return (
    <div className="ranking">
      <div className="seg">
        <button className={period === 'day' ? 'on' : ''} onClick={() => setPeriod('day')}>Hoy</button>
        <button className={period === 'total' ? 'on' : ''} onClick={() => setPeriod('total')}>Siempre</button>
      </div>

      {error && <p className="empty">No se ha podido cargar el ranking.</p>}
      {!error && !data && <p className="empty"><Loader2 className="spin" size={18} /></p>}
      {data && data.rows.length === 0 && <p className="empty">Aún nadie ha puntuado. ¡Sé la primera persona!</p>}

      {data && data.rows.length > 0 && (
        <ol className="rank-list">
          {data.rows.map(r => <Row key={`${r.rank}-${r.name}`} r={r} />)}
          {data.me && !data.rows.some(r => r.me) && (<><li className="gap">···</li><Row r={data.me} /></>)}
        </ol>
      )}
    </div>
  )
}

function Row({ r }) {
  return (
    <li className={r.me ? 'me' : ''}>
      <span className="pos">{MEDAL[r.rank] || r.rank}</span>
      <span className="who">{r.emoji} {r.name}{r.me && <em> (tú)</em>}</span>
      <span className="pts">{r.pts}</span>
    </li>
  )
}
