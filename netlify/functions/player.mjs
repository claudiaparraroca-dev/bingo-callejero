// POST /api/player { name, emoji }  → crea jugador anónimo { id, token, name, emoji }
// GET  /api/me                      → jugador, salas y progreso de hoy en el servidor
import { today } from '../../src/lib/day.js'
import { auth, body, json, sha256, randomId, cleanName } from '../lib/http.mjs'
import { read, write } from '../lib/db.mjs'
import { publicRoom } from '../lib/game.mjs'

export const AVATARS = ['🦊', '🐼', '🐸', '🦉', '🐙', '🦄', '🐯', '🐨', '🦖', '🐧', '🦝', '🐝']

export default async (req) => {
  const url = new URL(req.url)
  if (url.pathname === '/api/player' && req.method === 'POST') return create(req)
  if (url.pathname === '/api/me' && req.method === 'GET') return me(req)
  return json({ error: 'not-found' }, 404)
}

async function create(req) {
  const input = await body(req)
  const name = cleanName(input?.name, 20)
  if (name.length < 2) return json({ error: 'name' }, 400)
  const emoji = AVATARS.includes(input?.emoji) ? input.emoji : AVATARS[0]
  const id = randomId(9)
  const token = randomId(24)
  await write(`player/${id}`, { id, name, emoji, tokenHash: sha256(token), rooms: [], createdAt: Date.now() })
  return json({ id, token, name, emoji })
}

async function me(req) {
  const player = await auth(req)
  if (!player) return json({ error: 'auth' }, 401)
  const day = today()
  const globalDoc = await read(`day/${day.number}/global`)
  const mine = globalDoc?.players?.[player.id] || {}

  const rooms = []
  for (const code of player.rooms) {
    const room = await read(`room/${code}`)
    if (!room) continue
    const roomDoc = room.theme === 'clasico' ? null : await read(`day/${day.number}/room/${code}`)
    rooms.push({ ...publicRoom(room), today: { cells: roomDoc?.players?.[player.id]?.cells || {} } })
  }

  return json({
    player: { id: player.id, name: player.name, emoji: player.emoji },
    vapidKey: process.env.VAPID_PUBLIC_KEY || null,
    day: day.number,
    global: { cells: mine.cells || {}, flash: mine.flash || 0, pts: mine.pts || 0 },
    rooms,
  })
}

export const config = { path: ['/api/player', '/api/me'] }
