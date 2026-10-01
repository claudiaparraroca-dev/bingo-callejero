// Árbitro IA: ¿la foto cumple el reto?
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

export function parseImage(image) {
  const m = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(image || '')
  if (!m || m[2].length > 4_000_000) return null
  return { mediaType: m[1], data: m[2] }
}

// Devuelve { ok, reason } o lanza si el servicio falla
export async function judge({ mediaType, data }, challenge, dayOfMonth) {
  // Solo para pruebas locales (netlify dev con REFEREE_MOCK=1): acepta todo sin llamar a la IA
  if (process.env.REFEREE_MOCK === '1' && process.env.NETLIFY_DEV === 'true') return { ok: true, reason: 'Árbitro de pruebas: ¡vale!' }
  const response = await client.messages.parse({
    model: 'claude-opus-5-5',
    max_tokens: 2000,
    output_config: { effort: 'low', format: zodOutputFormat(Verdict) },
    system: SYSTEM,
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: mediaType, data } },
        {
          type: 'text',
          text: `Challenge (shown to player): "${challenge.text}"\nReferee notes: ${challenge.hint || '-'}\nToday's day of month: ${dayOfMonth}`,
        },
      ],
    }],
  })
  if (response.stop_reason === 'refusal' || !response.parsed_output) {
    return { ok: false, reason: 'No he podido revisar esta foto. Prueba con otra.' }
  }
  return response.parsed_output
}

export const isRateLimit = err => err instanceof Anthropic.RateLimitError
