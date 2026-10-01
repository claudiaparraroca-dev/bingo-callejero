import { X, RotateCcw, Loader2 } from 'lucide-react'

export default function CaptureSheet({ sheet, challenge, onClose, onRetry }) {
  const { status, image, reason } = sheet
  return (
    <div className="overlay" onClick={status === 'checking' ? undefined : onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-head">
          <span className="sheet-title">{challenge.emoji} {challenge.text}</span>
          {status !== 'checking' && (
            <button className="icon-btn" onClick={onClose} aria-label="Cerrar"><X size={22} /></button>
          )}
        </div>

        {image && (
          <div className={`photo ${status}`}>
            <img src={image} alt={challenge.text} />
            {status === 'checking' && <div className="scan" />}
          </div>
        )}

        {status === 'checking' && (
          <p className="verdict checking"><Loader2 className="spin" size={18} /> El árbitro está mirando tu foto…</p>
        )}
        {status === 'ok' && <p className="verdict ok">✅ {reason || '¡Conseguida!'}</p>}
        {status === 'fail' && <p className="verdict fail">❌ {reason || 'Esta no cuela.'}</p>}

        {(status === 'fail' || status === 'view') && (
          <button className="btn primary" onClick={onRetry}>
            <RotateCcw size={18} /> {status === 'fail' ? 'Probar otra foto' : 'Repetir foto'}
          </button>
        )}
        {status === 'ok' && <button className="btn primary" onClick={onClose}>¡A por la siguiente!</button>}
      </div>
    </div>
  )
}
