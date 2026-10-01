import { createHash, randomBytes } from 'node:crypto'
import { read } from './db.mjs'

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  })
}

export const sha256 = s => createHash('sha256').update(s).digest('hex')
export const randomId = (bytes = 9) => randomBytes(bytes).toString('base64url')

// Cabecera "Authorization: Bearer <id>.<token>" → jugador o null
export async function auth(req) {
  const m = /^Bearer ([\w-]+)\.([\w-]+)$/.exec(req.headers.get('authorization') || '')
  if (!m) return null
  const player = await read(`player/${m[1]}`)
  if (!player || player.tokenHash !== sha256(m[2])) return null
  return player
}

export async function body(req) {
  try { return await req.json() } catch { return null }
}

export const cleanName = (s, max) =>
  String(s || '').replace(/[\u0000-\u001f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, max)
