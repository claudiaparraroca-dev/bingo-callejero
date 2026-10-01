import { Check } from 'lucide-react'

const LEVEL = { 1: 'Fácil', 2: 'Media', 3: 'Difícil' }

export default function Board({ card, done, photos, lines, onTap }) {
  const inLine = new Set(lines.flat())
  return (
    <div className="board">
      {card.map((c, i) => {
        const got = !!done[i]
        return (
          <button
            key={c.id}
            className={`cell lvl${c.level}${got ? ' got' : ''}${inLine.has(i) ? ' line' : ''}`}
            onClick={() => onTap(i)}
            aria-label={`${c.text}${got ? ' (conseguida)' : ''}`}
          >
            {got && photos[i] && <img src={photos[i]} alt="" />}
            <span className="cell-body">
              <span className="cell-emoji">{c.emoji}</span>
              <span className="cell-text">{c.text}</span>
              {!got && <span className="cell-level">{LEVEL[c.level]}</span>}
            </span>
            {got && <span className="stamp"><Check size={16} strokeWidth={3} /></span>}
          </button>
        )
      })}
    </div>
  )
}
