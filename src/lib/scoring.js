// Reglas de puntuación (las usan el servidor para dar puntos y la app para mostrarlos)
import { LINES } from './bingo.js'

export const CELL_POINTS = { 1: 10, 2: 20, 3: 35 }
export const LINE_BONUS = 25
export const FULL_BONUS = 100
export const FLASH_BASE = 50
export const FLASH_SPEED_MAX = 50
export const FLASH_WINDOW_MS = 5 * 60 * 1000

// Puntos de un cartón: casillas + líneas + bingo completo
export function boardPoints(cells, card) {
  const done = i => cells[i] != null
  const cellPts = Object.keys(cells).reduce((s, i) => s + (CELL_POINTS[card[i]?.level] || 0), 0)
  const lines = LINES.filter(l => l.every(done)).length
  const full = Object.keys(cells).length === 9
  return { cellPts, lines, full, total: cellPts + lines * LINE_BONUS + (full ? FULL_BONUS : 0) }
}

// Cuanto antes, más puntos: 100 al instante, 50 en el último segundo
export function flashPoints(elapsedMs) {
  const left = Math.max(0, 1 - elapsedMs / FLASH_WINDOW_MS)
  return FLASH_BASE + Math.round(FLASH_SPEED_MAX * left)
}
