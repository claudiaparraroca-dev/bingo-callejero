// Estado del juego en Blobs:
//   player/{id}                {id, name, emoji, tokenHash, rooms:[code], createdAt}
//   room/{code}                {code, name, theme, owner, members:{pid:{n,e}}, createdAt}
//   day/{n}/global             {players:{pid:{n,e,cells:{idx:ts},flash,pts}}}   (pts incluye el Flash)
//   day/{n}/room/{code}        {players:{pid:{n,e,cells,pts}}}                  (salas con temática propia)
//   total/global, total/room/{code}   {players:{pid:{n,e,pts}}}
//   tries/{n}/{pid}            nº de fotos enviadas hoy (límite anti-abuso)
import { cardForDay, cardFromPool } from '../../src/lib/challenges.js'
import { THEMES } from '../../src/lib/themes.js'
import { boardPoints } from '../../src/lib/scoring.js'
import { read, update } from './db.mjs'

export const MAX_TRIES_PER_DAY = 60
export const MAX_ROOM_MEMBERS = 50
export const MAX_ROOMS_PER_PLAYER = 10

export function roomCard(room, dayNumber) {
  if (room.theme === 'clasico') return cardForDay(dayNumber)
  return cardFromPool(`room:${room.code}:${dayNumber}`, THEMES[room.theme].pool)
}

// Puntos de un jugador en un documento de día
export function entryPoints(entry, card) {
  return boardPoints(entry.cells || {}, card).total + (entry.flash || 0)
}

// Suma `delta` puntos al total histórico de un ranking
export async function addTotal(key, player, delta) {
  if (!delta) return
  await update(key, doc => {
    doc ||= { players: {} }
    const p = doc.players[player.id] || { pts: 0 }
    doc.players[player.id] = { n: player.name, e: player.emoji, pts: p.pts + delta }
    return doc
  })
}

// Puntos del cartón global (y Flash) también cuentan en las salas "clásico";
// el Flash cuenta en todas las salas del jugador.
export async function propagateGlobal(player, delta, { flash = false } = {}) {
  await addTotal('total/global', player, delta)
  for (const code of player.rooms || []) {
    const room = await read(`room/${code}`)
    if (room && (flash || room.theme === 'clasico')) await addTotal(`total/room/${code}`, player, delta)
  }
}

export async function countTry(dayNumber, pid) {
  let over = false
  await update(`tries/${dayNumber}/${pid}`, n => {
    n = n || 0
    if (n >= MAX_TRIES_PER_DAY) { over = true; return undefined }
    return n + 1
  })
  return !over
}

export function sortRows(rows, myId) {
  return rows
    .filter(r => r.pts > 0)
    .sort((a, b) => b.pts - a.pts)
    .map((r, i) => ({ rank: i + 1, name: r.n, emoji: r.e, pts: r.pts, me: r.id === myId }))
}

export const publicRoom = room => ({
  code: room.code,
  name: room.name,
  theme: room.theme,
  owner: room.owner,
  members: Object.values(room.members).map(m => ({ name: m.n, emoji: m.e })),
})
