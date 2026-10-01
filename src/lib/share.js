import { formatDuration } from './day'

// Resultado estilo Wordle: sin spoilers de qué había en el cartón.
export function resultText({ number, done, lines, pts }) {
  const rows = [0, 1, 2].map(r => [0, 1, 2].map(c => (done[r * 3 + c] ? '🟨' : '⬛')).join(''))
  const found = Object.keys(done).length
  const times = Object.values(done).map(c => (typeof c === 'number' ? c : c.at))
  const time = times.length > 1 ? ` · ⏱ ${formatDuration(Math.max(...times) - Math.min(...times))}` : ''
  const head = found === 9 ? `Bingo Callejero #${number} 🎉 ¡BINGO!` : `Bingo Callejero #${number} 📸`
  const tail = `${found}/9 · ${pts} pts · ${lines} ${lines === 1 ? 'línea' : 'líneas'}${time}`
  return `${head}\n${rows.join('\n')}\n${tail}\n${location.origin}`
}

export async function shareResult(data) {
  const text = resultText(data)
  if (navigator.share) {
    try { await navigator.share({ text }); return 'shared' } catch { /* cancelado: probamos a copiar */ }
  }
  try { await navigator.clipboard.writeText(text); return 'copied' } catch { return 'failed' }
}
