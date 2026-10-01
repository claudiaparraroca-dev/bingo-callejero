// POST /api/rooms               { name, theme } → crea sala (y te une)
// GET  /api/rooms/:code         → info pública de la sala (para la pantalla de invitación)
// POST /api/rooms/:code/join    → unirse
// POST /api/rooms/:code/leave   → salir
import { THEMES } from '../../src/lib/themes.js'
import { auth, body, json, cleanName } from '../lib/http.mjs'
import { read, update } from '../lib/db.mjs'
import { publicRoom, MAX_ROOM_MEMBERS, MAX_ROOMS_PER_PLAYER } from '../lib/game.mjs'
import { randomInt } from 'node:crypto'

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789' // sin 0/O ni 1/I/L
const newCode = () => Array.from({ length: 5 }, () => ALPHABET[randomInt(ALPHABET.length)]).join('')

export default async (req, context) => {
  const code = String(context.params?.code || '').toUpperCase()
  const action = context.params?.action

  if (!code && req.method === 'POST') return create(req)
  if (code && !action && req.method === 'GET') {
    const room = await read(`room/${code}`)
    return room ? json(publicRoom(room)) : json({ error: 'not-found' }, 404)
  }
  if (code && action === 'join' && req.method === 'POST') return join(req, code)
  if (code && action === 'leave' && req.method === 'POST') return leave(req, code)
  return json({ error: 'not-found' }, 404)
}

async function create(req) {
  const player = await auth(req)
  if (!player) return json({ error: 'auth' }, 401)
  if (player.rooms.length >= MAX_ROOMS_PER_PLAYER) return json({ error: 'too-many-rooms' }, 400)
  const input = await body(req)
  const name = cleanName(input?.name, 30)
  const theme = THEMES[input?.theme] ? input.theme : 'clasico'
  if (name.length < 2) return json({ error: 'name' }, 400)

  for (let i = 0; i < 5; i++) {
    const code = newCode()
    const room = { code, name, theme, owner: player.id, createdAt: Date.now(), members: { [player.id]: { n: player.name, e: player.emoji } } }
    let created = false
    await update(`room/${code}`, existing => {
      if (existing) return undefined
      created = true
      return room
    })
    if (!created) continue
    await update(`player/${player.id}`, p => ({ ...p, rooms: [...new Set([...p.rooms, code])] }))
    return json(publicRoom(room))
  }
  return json({ error: 'try-again' }, 503)
}

async function join(req, code) {
  const player = await auth(req)
  if (!player) return json({ error: 'auth' }, 401)
  if (player.rooms.length >= MAX_ROOMS_PER_PLAYER && !player.rooms.includes(code)) return json({ error: 'too-many-rooms' }, 400)
  let error = null
  const room = await update(`room/${code}`, r => {
    if (!r) { error = 'not-found'; return undefined }
    if (r.members[player.id]) return undefined
    if (Object.keys(r.members).length >= MAX_ROOM_MEMBERS) { error = 'full'; return undefined }
    r.members[player.id] = { n: player.name, e: player.emoji }
    return r
  })
  if (error) return json({ error }, error === 'not-found' ? 404 : 400)
  await update(`player/${player.id}`, p => (p.rooms.includes(code) ? undefined : { ...p, rooms: [...p.rooms, code] }))
  return json(publicRoom(room))
}

async function leave(req, code) {
  const player = await auth(req)
  if (!player) return json({ error: 'auth' }, 401)
  await update(`room/${code}`, r => {
    if (!r?.members[player.id]) return undefined
    delete r.members[player.id]
    return r
  })
  await update(`player/${player.id}`, p => ({ ...p, rooms: p.rooms.filter(c => c !== code) }))
  return json({ ok: true })
}

export const config = { path: ['/api/rooms', '/api/rooms/:code', '/api/rooms/:code/:action'] }
