export const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // filas
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columnas
  [0, 4, 8], [2, 4, 6],            // diagonales
]

export function completedLines(done) {
  return LINES.filter(line => line.every(i => done[i]))
}

// Racha: días seguidos (hasta hoy o ayer) con al menos una línea
export function stats(progress, todayNumber) {
  const days = Object.entries(progress).map(([n, d]) => ({ n: Number(n), ...summary(d) }))
  const played = days.filter(d => d.found > 0)
  let streak = 0
  for (let n = todayNumber; ; n--) {
    const d = days.find(x => x.n === n)
    if (d && d.lines > 0) streak++
    else if (n === todayNumber) continue // hoy aún no cuenta en contra
    else break
  }
  return {
    played: played.length,
    photos: played.reduce((s, d) => s + d.found, 0),
    bingos: played.filter(d => d.found === 9).length,
    streak,
  }
}

export function summary(day) {
  const done = day?.cells || {}
  return { found: Object.keys(done).length, lines: completedLines(done).length }
}
