// GET /api/flash → estado del Flash de hoy. La hora y el reto solo se revelan cuando empieza.
import { auth, json } from '../lib/http.mjs'
import { read } from '../lib/db.mjs'
import { flashToday } from '../lib/flash.mjs'

export default async (req) => {
  const now = Date.now()
  const f = flashToday(now)
  const player = await auth(req)
  const mine = player ? (await read(`day/${f.day}/global`))?.players?.[player.id]?.flash || 0 : 0

  if (f.state === 'waiting') return json({ state: 'waiting', done: false, now })
  const { id, emoji, text } = f.challenge
  return json({
    state: f.state,
    challenge: { id, emoji, text },
    startsAt: f.startsAt,
    endsAt: f.endsAt,
    now,
    done: mine > 0,
    points: mine,
  })
}

export const config = { path: '/api/flash' }
