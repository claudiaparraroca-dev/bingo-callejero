// Se importa dentro del service worker generado por vite-plugin-pwa
self.addEventListener('push', event => {
  let data = {}
  try { data = event.data.json() } catch { data = { title: 'Bingo Callejero', body: event.data?.text() } }
  event.waitUntil(self.registration.showNotification(data.title || 'Bingo Callejero', {
    body: data.body,
    icon: '/pwa-192x192.png',
    badge: '/pwa-64x64.png',
    tag: data.tag,
    renotify: true,
    requireInteraction: true,
    vibrate: [200, 100, 200, 100, 400],
    data: { url: data.url || '/' },
  }))
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    const client = all.find(c => new URL(c.url).origin === self.location.origin)
    if (client) { await client.focus(); return client.navigate(url).catch(() => {}) }
    return self.clients.openWindow(url)
  })())
})
