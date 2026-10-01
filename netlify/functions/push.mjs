// POST /api/push { subscription } → guarda la suscripción para avisar del Flash
// DELETE /api/push                → deja de avisar
import { auth, body, json } from '../lib/http.mjs'
import { store } from '../lib/db.mjs'

export default async (req) => {
  const player = await auth(req)
  if (!player) return json({ error: 'auth' }, 401)
  if (req.method === 'DELETE') {
    await store().delete(`subs/${player.id}`)
    return json({ ok: true })
  }
  if (req.method !== 'POST') return json({ error: 'method' }, 405)
  const sub = (await body(req))?.subscription
  if (!sub?.endpoint?.startsWith('https://') || !sub?.keys?.p256dh || !sub?.keys?.auth) {
    return json({ error: 'bad-input' }, 400)
  }
  await store().setJSON(`subs/${player.id}`, { endpoint: sub.endpoint, keys: sub.keys })
  return json({ ok: true })
}

export const config = { path: '/api/push' }
