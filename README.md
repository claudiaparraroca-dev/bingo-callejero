# Bingo Callejero 📸

Cada día, un cartón con 9 cosas que encontrar y fotografiar por la calle, el mismo para todo el mundo. Suma puntos, gana el Flash sorpresa, sube en el ranking mundial y pica a tus amigos en salas privadas con temática.

## Cómo funciona

- **Cartón diario**: 9 retos (4 fáciles +10, 3 medios +20, 2 difíciles +35) elegidos con una semilla basada en la fecha (hora de Madrid). Cada línea +25, cartón completo +100. Banco de retos en [`src/lib/challenges.js`](src/lib/challenges.js), reglas en [`src/lib/scoring.js`](src/lib/scoring.js).
- **⚡ Flash**: una vez al día, a una hora secreta entre 10:00 y 22:00, salta un reto rápido. 5 minutos para hacerlo; de 100 a 50 puntos según la rapidez. Una función programada manda una notificación push al empezar ([`netlify/functions/flash-push.mjs`](netlify/functions/flash-push.mjs)).
- **Árbitro IA**: cada foto se envía a `/api/validate`, que decide en el servidor qué reto es, pregunta a Claude si la foto vale y suma los puntos de forma atómica (no se fía del cliente).
- **Jugadores anónimos**: apodo + avatar, sin email. El token vive en el móvil.
- **Ranking mundial** (hoy / siempre) y **salas privadas** con código de 5 letras, enlace de invitación y temática: Clásico (cartón global), Naturaleza, Arte urbano, Bares y comida, Bichos y mascotas, Detective ([`src/lib/themes.js`](src/lib/themes.js)). El Flash suma en todas las salas.
- **Datos** en Netlify Blobs ([`netlify/lib/game.mjs`](netlify/lib/game.mjs) describe las claves). Las fotos **no** se suben a ningún sitio: se guardan solo en el móvil (IndexedDB).
- **PWA instalable** con `vite-plugin-pwa`.


## Stack

React + Vite + vite-plugin-pwa · lucide-react · canvas-confetti · Netlify Functions + Netlify Blobs (base de datos) · `@anthropic-ai/sdk` (Claude Opus 5.5, salida estructurada con Zod) · `web-push` (avisos del Flash).

## Desarrollo local

```bash
npm install
npm run dev          # solo frontend (sin backend: no se puede puntuar)
```

Para probar también el árbitro IA en local, con [Netlify CLI](https://docs.netlify.com/cli/get-started/):

```bash
netlify dev --offline                          # backend + Blobs locales, necesita ANTHROPIC_API_KEY
REFEREE_MOCK=1 netlify dev --offline           # árbitro de pruebas que acepta todo (no gasta IA)
```

## Despliegue (Netlify)

En producción: **https://bingo-callejero.netlify.app**

- Variables de entorno: `FLASH_SECRET` (decide la hora y el reto del Flash), `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` (notificaciones push).
- Netlify inyecta automáticamente la clave de Claude a través de su **AI Gateway** (se consume de los créditos de Netlify), así que no hace falta configurar `ANTHROPIC_API_KEY`. Si prefieres usar tu propia clave de Anthropic, añádela en *Project configuration → Environment variables* y tendrá prioridad.
- Para que cada push a `main` despliegue solo: *Project configuration → Build & deploy → Link repository* → `claudiaparraroca-dev/bingo-callejero`.

Coste orientativo del árbitro: ~1.000-1.500 tokens de entrada por foto → del orden de medio céntimo por validación.

## Ideas para siguientes versiones

- Ranking diario (quién completa antes el cartón) con un backend ligero.
- Cartones temáticos (Halloween, Navidad, playa) y cartones por ciudad.
- Retos patrocinados por negocios locales ("haz foto de nuestra terraza").
- Modo grupo: un cartón compartido para jugar en equipo.
