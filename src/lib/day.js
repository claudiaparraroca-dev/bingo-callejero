// El cartón cambia a medianoche hora de Madrid, igual para todos.
const TZ = 'Europe/Madrid'
const EPOCH = Date.UTC(2026, 9, 1) // 1 oct 2026 = cartón #1

function madridParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).formatToParts(date)
  const get = t => Number(parts.find(p => p.type === t).value)
  return { y: get('year'), m: get('month'), d: get('day'), h: get('hour'), min: get('minute'), s: get('second') }
}

export function today() {
  const p = madridParts()
  const number = Math.round((Date.UTC(p.y, p.m - 1, p.d) - EPOCH) / 86400000) + 1
  return { number, dayOfMonth: p.d, key: `${p.y}-${String(p.m).padStart(2, '0')}-${String(p.d).padStart(2, '0')}` }
}

export function msUntilTomorrow() {
  const p = madridParts()
  return ((23 - p.h) * 3600 + (59 - p.min) * 60 + (60 - p.s)) * 1000
}

export function formatDuration(ms) {
  const m = Math.max(1, Math.round(ms / 60000))
  const h = Math.floor(m / 60)
  return h ? `${h}h ${m % 60}m` : `${m}m`
}

export function dayLabel(number) {
  const d = new Date(EPOCH + (number - 1) * 86400000)
  return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })
}
