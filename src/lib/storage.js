// Historial local para el álbum: { [board]: { name, days: { [dayNumber]: { cells: { idx: {at} } } } } }
// board = 'global' | código de sala. Las fotos van en IndexedDB (pesado), solo en este móvil.

const KEY = 'bc:progress:v2'
const OLD_KEY = 'bc:progress:v1'

export function loadProgress() {
  try {
    const v2 = JSON.parse(localStorage.getItem(KEY))
    if (v2) return v2
    const v1 = JSON.parse(localStorage.getItem(OLD_KEY)) // versión sin salas
    return v1 ? { global: { name: 'Cartón del día', days: v1 } } : {}
  } catch { return {} }
}

export function saveProgress(progress) {
  try { localStorage.setItem(KEY, JSON.stringify(progress)) } catch { /* modo privado */ }
}

export function recordCell(progress, board, name, day, idx) {
  const b = progress[board] || { name, days: {} }
  const d = b.days[day] || { cells: {} }
  return { ...progress, [board]: { name, days: { ...b.days, [day]: { cells: { ...d.cells, [idx]: { at: Date.now() } } } } } }
}

// ── IndexedDB mínimo ────────────────────────────────────
let dbPromise
function db() {
  dbPromise ??= new Promise((resolve, reject) => {
    const req = indexedDB.open('bingo-callejero', 1)
    req.onupgradeneeded = () => req.result.createObjectStore('photos')
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
  return dbPromise
}

async function tx(mode, fn) {
  const d = await db()
  return new Promise((resolve, reject) => {
    const t = d.transaction('photos', mode)
    const req = fn(t.objectStore('photos'))
    t.oncomplete = () => resolve(req?.result)
    t.onerror = () => reject(t.error)
  })
}

// El cartón global mantiene las claves antiguas "día:casilla"
export const photoKey = (board, day, idx) => (board === 'global' ? `${day}:${idx}` : `${board}:${day}:${idx}`)
export const savePhoto = (key, dataUrl) => tx('readwrite', s => s.put(dataUrl, key)).catch(() => {})
export const getPhoto = key => tx('readonly', s => s.get(key)).catch(() => null)
