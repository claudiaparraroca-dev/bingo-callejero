import { useEffect, useState } from 'react'
import { X, RotateCcw, Loader2 } from 'lucide-react'
import { getPhoto } from '../lib/storage'

export default function CaptureSheet({ sheet, onClose, onRetry }) {
  const { status, reason, points, target } = sheet
  const { challenge } = target
  const [stored, setStored] = useState(null)
  useEffect(() => { if (sheet.photoKey) getPhoto(sheet.photoKey).then(setStored) }, [sheet.photoKey])
  const image = sheet.image || stored
  const busy = status === 'checking'

  return (
    <div className="overlay" onClick={busy ? undefined : onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-head">
          <span className="sheet-title">{target.board === 'flash' && '⚡ '}{challenge.emoji} {challenge.text}</span>
          {!busy && <button className="icon-btn" onClick={onClose} aria-label="Cerrar"><X size={22} /></button>}
        </div>

        {image ? (
          <div className={`photo ${status}`}>
            <img src={image} alt={challenge.text} />
            {busy && <div className="scan" />}
          </div>
        ) : status === 'view' && (
          <p className="small">✅ Conseguida. La foto está guardada en el móvil con el que la hiciste.</p>
        )}

        {busy && <p className="verdict checking"><Loader2 className="spin" size={18} /> El árbitro está mirando tu foto…</p>}
        {status === 'ok' && (
          <div className="verdict ok">
            <span>✅ {reason || '¡Conseguida!'}</span>
            {points > 0 && <span className="points-pop">+{points} pts</span>}
          </div>
        )}
        {status === 'fail' && <p className="verdict fail">❌ {reason || 'Esta no cuela.'}</p>}
        {status === 'closed' && <p className="verdict fail">⏱️ {reason}</p>}

        {status === 'fail' && (
          <button className="btn primary" onClick={onRetry}><RotateCcw size={18} /> Probar otra foto</button>
        )}
        {(status === 'ok' || status === 'closed' || status === 'view') && (
          <button className="btn primary" onClick={onClose}>{status === 'ok' ? '¡A por la siguiente!' : 'Cerrar'}</button>
        )}
      </div>
    </div>
  )
}
