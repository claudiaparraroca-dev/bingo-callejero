export const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // filas
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columnas
  [0, 4, 8], [2, 4, 6],            // diagonales
]

export function completedLines(done) {
  return LINES.filter(line => line.every(i => done[i] != null))
}

export function summary(day) {
  const done = day?.cells || {}
  return { found: Object.keys(done).length, lines: completedLines(done).length }
}

// Estadísticas del historial local. Racha: días seguidos con al menos una línea en el cartón del día.
export function stats(progress, todayNumber) {
  const all = Object.values(progress).flatMap(b => Object.entries(b.days || {}).map(([n, d]) => ({ n: Number(n), ...summary(d) })))
  const globalDays = progress.global?.days || {}
  let streak = 0
  for (let n = todayNumber; ; n--) {
    if (summary(globalDays[n]).lines > 0) streak++
    else if (n === todayNumber) continue // hoy aún no cuenta en contra
    else break
  }
  return {
    played: new Set(all.filter(d => d.found).map(d => d.n)).size,
    photos: all.reduce((s, d) => s + d.found, 0),
    bingos: all.filter(d => d.found === 9).length,
    streak,
  }
}
