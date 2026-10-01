// El Flash del día: una hora sorpresa entre las 10:00 y las 21:55 (Madrid) y un reto rápido.
// Depende de FLASH_SECRET, así que nadie puede calcularlo leyendo el código público.
import { FLASH_POOL } from '../../src/lib/themes.js'
import { hash } from '../../src/lib/challenges.js'
import { madridTodayAt, today } from '../../src/lib/day.js'
import { FLASH_WINDOW_MS } from '../../src/lib/scoring.js'

const FIRST_SLOT_MIN = 10 * 60
const SLOTS = (12 * 60) / 5 // franjas de 5 minutos entre 10:00 y 22:00

export function flashToday(now = Date.now()) {
  const day = today()
  const secret = process.env.FLASH_SECRET || 'dev-secret'
  const h = hash(`${secret}:flash:${day.number}`)
  const minute = FIRST_SLOT_MIN + (h % SLOTS) * 5
  const startsAt = madridTodayAt(Math.floor(minute / 60), minute % 60)
  const endsAt = startsAt + FLASH_WINDOW_MS
  const challenge = FLASH_POOL[hash(`${secret}:flash-challenge:${day.number}`) % FLASH_POOL.length]
  const state = now < startsAt ? 'waiting' : now < endsAt ? 'active' : 'over'
  return { day: day.number, startsAt, endsAt, challenge, state }
}
