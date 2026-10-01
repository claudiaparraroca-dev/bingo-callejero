# Bingo Callejero 📸

Cada día, un cartón con 9 cosas que encontrar y fotografiar por la calle. El mismo para todo el mundo. Haz línea, canta ¡BINGO! y comparte tu resultado sin spoilers (estilo Wordle).

## Cómo funciona

- **Cartón diario**: 9 retos (4 fáciles, 3 medios, 2 difíciles) elegidos con una semilla basada en la fecha (hora de Madrid). Cartón #1 = 1 oct 2026. Banco de retos en [`src/lib/challenges.js`](src/lib/challenges.js).
- **Árbitro IA**: cada foto se reduce a 1024px y se envía a `/api/validate` (función de Netlify en [`netlify/functions/validate.mjs`](netlify/functions/validate.mjs)), que pregunta a Claude si la foto cumple el reto y devuelve `{ ok, reason }`.
- **Sin cuentas ni servidor de fotos**: el progreso va en `localStorage` y las fotos en IndexedDB, solo en el móvil del jugador.
- **Si el árbitro no está disponible** (sin `ANTHROPIC_API_KEY`, sin conexión o en `npm run dev`), la foto se acepta como "sin verificar" para no bloquear el juego.
- **PWA instalable** con `vite-plugin-pwa`.

## Stack

React + Vite + vite-plugin-pwa · lucide-react · canvas-confetti · Netlify Functions + `@anthropic-ai/sdk` (Claude Opus 5.5, salida estructurada con Zod).

## Desarrollo local

```bash
npm install
npm run dev          # solo frontend (las fotos se aceptan sin verificar)
```

Para probar también el árbitro IA en local, con [Netlify CLI](https://docs.netlify.com/cli/get-started/):

```bash
netlify dev          # necesita ANTHROPIC_API_KEY en el entorno o en .env
```

## Despliegue (Netlify)

1. Conecta el repo en Netlify (build y publish ya vienen en `netlify.toml`).
2. En *Site configuration → Environment variables* añade `ANTHROPIC_API_KEY`.
3. Listo: cada push a `main` despliega.

Coste orientativo del árbitro: ~1.000-1.500 tokens de entrada por foto → del orden de medio céntimo por validación.

## Ideas para siguientes versiones

- Ranking diario (quién completa antes el cartón) con un backend ligero.
- Cartones temáticos (Halloween, Navidad, playa) y cartones por ciudad.
- Retos patrocinados por negocios locales ("haz foto de nuestra terraza").
- Modo grupo: un cartón compartido para jugar en equipo.
