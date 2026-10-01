// GET /api/ranking?board=global|<código sala>&period=day|total
import { cardForDay } from '../../src/lib/challenges.js'
import { today } from '../../src/lib/day.js'
import { auth, json } from '../lib/http.mjs'
import { read } from '../lib/db.mjs'
import { roomCard, entryPoints, sortRows } from '../lib/game.mjs'

const TOP = 100

export default async (req) => {
  const url = new URL(req.url)
  const board = (url.searchParams.get('board') || 'global').toUpperCase()
  const period = url.searchParams.get('period') === 'total' ? 'total' : 'day'
  const player = await auth(req)
  const myId = player?.id
  const day = today()

  if (board === 'GLOBAL') {
    const doc = await read(period === 'day' ? `day/${day.number}/global` : 'total/global')
    const rows = Object.entries(doc?.players || {}).map(([id, p]) => ({ id, n: p.n, e: p.e, pts: p.pts }))
    return result(sortRows(rows, myId))
  }

  // Sala: solo miembros
  const room = await read(`room/${board}`)
  if (!room) return json({ error: 'not-found' }, 404)
  if (!myId || !room.members[myId]) return json({ error: 'not-member' }, 403)

  if (period === 'total') {
    const doc = await read(`total/room/${board}`)
    const rows = Object.entries(doc?.players || {})
      .filter(([id]) => room.members[id])
      .map(([id, p]) => ({ id, n: p.n, e: p.e, pts: p.pts }))
    return result(sortRows(rows, myId))
  }

  // Hoy en la sala: cartón de la sala (o el global si es "clásico") + Flash de cada miembro
  const globalDoc = await read(`day/${day.number}/global`)
  const roomDoc = room.theme === 'clasico' ? null : await read(`day/${day.number}/room/${board}`)
  const card = room.theme === 'clasico' ? cardForDay(day.number) : roomCard(room, day.number)
  const rows = Object.entries(room.members).map(([id, m]) => {
    const g = globalDoc?.players?.[id] || {}
    const pts = room.theme === 'clasico'
      ? (g.pts || 0)
      : entryPoints(roomDoc?.players?.[id] || {}, card) + (g.flash || 0)
    return { id, n: m.n, e: m.e, pts }
  })
  return result(sortRows(rows, myId))
}

function result(rows) {
  const me = rows.find(r => r.me) || null
  return json({ rows: rows.slice(0, TOP), me })
}

export const config = { path: '/api/ranking' }
