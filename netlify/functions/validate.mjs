// POST /api/validate  { board: 'global' | 'flash' | <código de sala>, idx, image }
// El servidor decide qué reto es (no se fía del cliente), pregunta al árbitro IA
// y, si vale, suma los puntos de forma atómica.
import { cardForDay } from '../../src/lib/challenges.js'
import { today } from '../../src/lib/day.js'
import { boardPoints, flashPoints } from '../../src/lib/scoring.js'
import { auth, body, json } from '../lib/http.mjs'
import { read, update } from '../lib/db.mjs'
import { flashToday } from '../lib/flash.mjs'
import { judge, parseImage, isRateLimit } from '../lib/referee.mjs'
import { roomCard, entryPoints, propagateGlobal, addTotal, countTry } from '../lib/game.mjs'

const FLASH_GRACE_MS = 90 * 1000 // margen para que la foto suba

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'method' }, 405)
  const player = await auth(req)
  if (!player) return json({ error: 'auth' }, 401)

  const input = await body(req)
  const image = parseImage(input?.image)
  if (!image) return json({ error: 'bad-input' }, 400)

  const day = today()
  const now = Date.now()
  const board = String(input.board || '')
  let challenge, docKey, card, room, flash

  if (board === 'flash') {
    flash = flashToday(now)
    if (now < flash.startsAt) return json({ error: 'flash-not-started' }, 400)
    if (now > flash.endsAt + FLASH_GRACE_MS) return json({ ok: false, reason: '¡Se acabó el tiempo del Flash! Mañana más.', closed: true })
    challenge = flash.challenge
    docKey = `day/${day.number}/global`
    card = cardForDay(day.number)
  } else {
    const idx = Number(input.idx)
    if (!Number.isInteger(idx) || idx < 0 || idx > 8) return json({ error: 'bad-input' }, 400)
    if (board === 'global') {
      card = cardForDay(day.number)
      docKey = `day/${day.number}/global`
    } else {
      room = await read(`room/${board}`)
      if (!room || !room.members[player.id]) return json({ error: 'not-member' }, 403)
      if (room.theme === 'clasico') return json({ error: 'use-global' }, 400)
      card = roomCard(room, day.number)
      docKey = `day/${day.number}/room/${board}`
    }
    challenge = card[idx]
  }

  // ¿Ya la tenía?
  const existing = (await read(docKey))?.players?.[player.id]
  if (board === 'flash' ? existing?.flash : existing?.cells?.[input.idx] != null) {
    return json({ ok: true, already: true, reason: '¡Esta ya la tenías!', points: 0 })
  }

  if (!(await countTry(day.number, player.id))) {
    return json({ ok: false, reason: 'Has llegado al máximo de fotos de hoy. ¡Mañana más!', limit: true })
  }

  let verdict
  try {
    verdict = await judge(image, challenge, day.dayOfMonth)
  } catch (err) {
    if (isRateLimit(err)) return json({ error: 'busy' }, 429)
    console.error('referee failed', err)
    return json({ error: 'upstream' }, 502)
  }
  if (!verdict.ok) return json({ ok: false, reason: verdict.reason })

  // Sumar puntos de forma atómica
  let before = 0, after = 0, gained = null
  await update(docKey, doc => {
    doc ||= { players: {} }
    const entry = doc.players[player.id] || { cells: {} }
    before = entryPoints(entry, card)
    if (board === 'flash') {
      if (entry.flash) return undefined
      entry.flash = flashPoints(now - flash.startsAt)
    } else {
      if (entry.cells[input.idx] != null) return undefined
      entry.cells[input.idx] = now
    }
    after = entryPoints(entry, card)
    entry.pts = after
    entry.n = player.name
    entry.e = player.emoji
    doc.players[player.id] = entry
    gained = entry
    return doc
  })

  const delta = after - before
  if (board === 'global') await propagateGlobal(player, delta)
  else if (board === 'flash') await propagateGlobal(player, delta, { flash: true })
  else await addTotal(`total/room/${board}`, player, delta)

  const summary = gained && board !== 'flash' ? boardPoints(gained.cells, card) : null
  return json({
    ok: true,
    reason: verdict.reason,
    points: delta,
    dayPoints: after,
    lines: summary?.lines ?? null,
    full: summary?.full ?? false,
  })
}

export const config = { path: '/api/validate' }
