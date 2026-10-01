// Función programada (cada 5 min): cuando empieza el Flash, manda una notificación a todos los suscritos.
import webpush from 'web-push'
import { store } from '../lib/db.mjs'
import { flashToday } from '../lib/flash.mjs'

export default async () => {
  const f = flashToday()
  if (f.state !== 'active') return
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) return

  // Solo una vez por día
  const s = store()
  const first = await s.setJSON(`flash-sent/${f.day}`, { at: Date.now() }, { onlyIfNew: true })
  if (!first.modified) return

  webpush.setVapidDetails('mailto:bingo-callejero@users.noreply.github.com', process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY)
  const payload = JSON.stringify({
    title: `⚡ ¡FLASH! ${f.challenge.emoji} ${f.challenge.text}`,
    body: 'Tienes 5 minutos. Cuanto antes, más puntos.',
    url: '/?flash=1',
    tag: `flash-${f.day}`,
  })

  const { blobs } = await s.list({ prefix: 'subs/' })
  let sent = 0, gone = 0
  await Promise.all(blobs.map(async ({ key }) => {
    const sub = await s.get(key, { type: 'json' })
    if (!sub) return
    try {
      await webpush.sendNotification(sub, payload, { TTL: 300, urgency: 'high' })
      sent++
    } catch (err) {
      if (err.statusCode === 404 || err.statusCode === 410) { await s.delete(key); gone++ }
      else console.error('push failed', err.statusCode, err.body)
    }
  }))
  console.log(`flash push day ${f.day}: sent ${sent}, removed ${gone}`)
}

export const config = { schedule: '*/5 * * * *' }
