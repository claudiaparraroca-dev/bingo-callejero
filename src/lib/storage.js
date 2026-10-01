// Progreso en localStorage (pequeño) y fotos en IndexedDB (pesado).
// Todo se queda en el móvil del jugador: no hay cuentas ni servidor de fotos.

const KEY = 'bc:progress:v1'

export function loadProgress() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {} } catch { return {} }
}

export function saveProgress(progress) {
  try { localStorage.setItem(KEY, JSON.stringify(progress)) } catch { /* modo privado */ }
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

export const photoKey = (day, idx) => `${day}:${idx}`
export const savePhoto = (key, dataUrl) => tx('readwrite', s => s.put(dataUrl, key)).catch(() => {})
export const getPhoto = key => tx('readonly', s => s.get(key)).catch(() => null)
