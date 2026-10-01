import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { completedLines } from '../lib/bingo'
import { CELL_POINTS } from '../lib/scoring'
import { getPhoto, photoKey } from '../lib/storage'

const LEVEL = { 1: 'Fácil', 2: 'Media', 3: 'Difícil' }

// done: { idx: timestamp } (lo que dice el servidor)
export default function Board({ board, day, card, done, onTap }) {
  const photos = usePhotos(board, day, done)
  const inLine = new Set(completedLines(done).flat())
  return (
    <div className="board">
      {card.map((c, i) => {
        const got = done[i] != null
        return (
          <button
            key={c.id}
            className={`cell lvl${c.level}${got ? ' got' : ''}${inLine.has(i) ? ' line' : ''}`}
            onClick={() => onTap(i, got)}
            aria-label={`${c.text}${got ? ' (conseguida)' : ''}`}
          >
            {got && photos[i] && <img src={photos[i]} alt="" />}
            <span className="cell-body">
              <span className="cell-emoji">{c.emoji}</span>
              <span className="cell-text">{c.text}</span>
              {!got && <span className="cell-level">{LEVEL[c.level]} · +{CELL_POINTS[c.level]}</span>}
            </span>
            {got && <span className="stamp"><Check size={16} strokeWidth={3} /></span>}
          </button>
        )
      })}
    </div>
  )
}

function usePhotos(board, day, done) {
  const [photos, setPhotos] = useState({})
  const keys = Object.keys(done).sort().join(',')
  useEffect(() => {
    let alive = true
    Promise.all(Object.keys(done).map(async i => [i, await getPhoto(photoKey(board, day, i))]))
      .then(entries => alive && setPhotos(Object.fromEntries(entries.filter(([, v]) => v))))
    return () => { alive = false }
  }, [board, day, keys])
  return photos
}
