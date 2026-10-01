// POST /api/validate  { image: dataURL, challenge: {text, hint}, dayOfMonth }
// → { ok, reason }   (o 503 si no hay ANTHROPIC_API_KEY: la app lo acepta sin verificar)
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod/v4'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'

const Verdict = z.object({
  ok: z.boolean(),
  reason: z.string(),
})

const SYSTEM = `You are the referee of "Bingo Callejero", a street photo-hunt game played in Spain.
The player must photograph something in the real world that matches a challenge.

Rules:
- Judge ONLY whether the photo plausibly shows what the challenge asks. Be fair and a bit generous: phone photos can be blurry, far away or badly framed.
- Reject photos that are clearly of a screen (phone, monitor, TV) showing an image, or obviously downloaded/stock images.
- Reject if the subject is simply not there.
- "reason": one short, warm, playful sentence in Spanish (max 15 words) addressed to the player (tú). If rejected, say what was missing so they can try again.`

const client = new Anthropic()

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'method' }, 405)
  if (!process.env.ANTHROPIC_API_KEY) return json({ error: 'no-key' }, 503)

  let body
  try { body = await req.json() } catch { return json({ error: 'bad-json' }, 400) }
  const { image, challenge, dayOfMonth } = body || {}
  const match = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(image || '')
  if (!match || !challenge?.text || match[2].length > 4_000_000) return json({ error: 'bad-input' }, 400)

  try {
    const response = await client.messages.parse({
      model: 'claude-opus-5-5',
      max_tokens: 2000,
      output_config: { effort: 'low', format: zodOutputFormat(Verdict) },
      system: SYSTEM,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: match[1], data: match[2] } },
          {
            type: 'text',
            text: `Challenge (shown to player): "${challenge.text}"\nReferee notes: ${challenge.hint || '-'}\nToday's day of month: ${dayOfMonth ?? '?'}`,
          },
        ],
      }],
    })

    if (response.stop_reason === 'refusal' || !response.parsed_output) {
      return json({ ok: false, reason: 'No he podido revisar esta foto. Prueba con otra.' })
    }
    return json(response.parsed_output)
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) return json({ error: 'busy' }, 429)
    console.error('validate failed', err)
    return json({ error: 'upstream' }, 502)
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } })
}

export const config = { path: '/api/validate' }
