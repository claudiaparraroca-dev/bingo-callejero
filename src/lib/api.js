// Cliente del backend. El jugador (id + token) se guarda solo en este dispositivo.
const PLAYER_KEY = 'bc:player'

export function getPlayer() {
  try { return JSON.parse(localStorage.getItem(PLAYER_KEY)) } catch { return null }
}

export function setPlayer(p) {
  try {
    if (p) localStorage.setItem(PLAYER_KEY, JSON.stringify(p))
    else localStorage.removeItem(PLAYER_KEY)
  } catch { /* modo privado */ }
}

export class ApiError extends Error {
  constructor(status, code) {
    super(code || `HTTP ${status}`)
    this.status = status
    this.code = code
  }
}

export async function api(path, { method = 'GET', body } = {}) {
  const p = getPlayer()
  const headers = { 'content-type': 'application/json' }
  if (p) headers.authorization = `Bearer ${p.id}.${p.token}`
  let res
  try {
    res = await fetch(path, { method, headers, body: body ? JSON.stringify(body) : undefined })
  } catch {
    throw new ApiError(0, 'offline')
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(res.status, data.error)
  return data
}

export const ERRORS = {
  offline: 'Sin conexión. Inténtalo de nuevo en un momento.',
  busy: 'Mucha gente jugando ahora mismo. Prueba en unos segundos.',
  upstream: 'El árbitro está despistado. Prueba otra vez.',
  'not-found': 'No existe ninguna sala con ese código.',
  full: 'Esa sala está llena (máximo 50).',
  'too-many-rooms': 'Puedes estar como mucho en 10 salas.',
  name: 'Ponle un nombre de al menos 2 letras.',
  'flash-not-started': 'El Flash aún no ha empezado.',
}

export const errorText = err => ERRORS[err?.code] || 'Algo ha fallado. Inténtalo de nuevo.'
