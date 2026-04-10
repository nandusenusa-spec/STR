/**
 * Moderación de imágenes en el servidor (opcional).
 * 1) OPENAI_API_KEY → modelo omni-moderation-latest (imagen en base64).
 * 2) SIGHTENGINE_API_USER + SIGHTENGINE_API_SECRET → API Sightengine.
 * Sin claves: se omite el chequeo (skipped) — configurá al menos una en producción.
 */

const MAX_BYTES_OPENAI = 4 * 1024 * 1024

export type ImageModerationResult =
  | { ok: true; skipped?: false }
  | { ok: true; skipped: true }
  | { ok: false; reason: string }

async function moderateWithOpenAI(
  buffer: ArrayBuffer,
  mimeType: string,
): Promise<ImageModerationResult | null> {
  const key = process.env.OPENAI_API_KEY?.trim()
  if (!key) return null

  if (buffer.byteLength > MAX_BYTES_OPENAI) {
    return { ok: false, reason: 'La imagen es demasiado grande para revisarla (máx. 4 MB).' }
  }

  const b64 = Buffer.from(buffer).toString('base64')
  const dataUrl = `data:${mimeType || 'image/jpeg'};base64,${b64}`

  const res = await fetch('https://api.openai.com/v1/moderations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'omni-moderation-latest',
      input: [
        {
          type: 'image_url',
          image_url: { url: dataUrl },
        },
      ],
    }),
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    if (process.env.NODE_ENV === 'development') {
      console.warn('[moderation] OpenAI moderations:', res.status, errText.slice(0, 200))
    }
    return { ok: false, reason: 'No se pudo verificar la imagen. Probá con otra o más tarde.' }
  }

  const json = (await res.json()) as {
    results?: Array<{
      flagged?: boolean
      categories?: Record<string, boolean>
      category_scores?: Record<string, number>
    }>
  }
  const row = json.results?.[0]
  if (!row) {
    return { ok: false, reason: 'Respuesta de moderación inválida.' }
  }

  if (row.flagged) {
    return {
      ok: false,
      reason:
        'La imagen no cumple las reglas de la comunidad (contenido sensible o no permitido).',
    }
  }

  const scores = row.category_scores || {}
  const sexual = scores.sexual ?? scores['sexual/minors'] ?? 0
  const violence = scores.violence ?? scores['violence/graphic'] ?? 0
  if (sexual > 0.35 || violence > 0.55) {
    return {
      ok: false,
      reason:
        'La imagen no cumple las reglas de la comunidad (contenido sensible o no permitido).',
    }
  }

  return { ok: true }
}

async function moderateWithSightengine(buffer: ArrayBuffer, mimeType: string): Promise<ImageModerationResult | null> {
  const user = process.env.SIGHTENGINE_API_USER?.trim()
  const secret = process.env.SIGHTENGINE_API_SECRET?.trim()
  if (!user || !secret) return null

  const blob = new Blob([buffer], { type: mimeType || 'image/jpeg' })
  const form = new FormData()
  form.append('media', blob, 'upload.jpg')
  form.append('models', 'nudity-2.0,gore-2.0,offensive-2.0')
  form.append('api_user', user)
  form.append('api_secret', secret)

  const res = await fetch('https://api.sightengine.com/1.0/check.json', {
    method: 'POST',
    body: form,
  })

  if (!res.ok) {
    return { ok: false, reason: 'No se pudo verificar la imagen. Probá más tarde.' }
  }

  const data = (await res.json()) as {
    status?: string
    nudity?: { raw?: number; partial?: number }
    gore?: { prob?: number }
    offensive?: { prob?: number }
    error?: { message?: string }
  }

  if (data.status === 'failure' || data.error) {
    return { ok: false, reason: data.error?.message || 'Error del servicio de moderación.' }
  }

  const raw = data.nudity?.raw ?? 0
  const partial = data.nudity?.partial ?? 0
  const gore = data.gore?.prob ?? 0
  const offensive = data.offensive?.prob ?? 0

  if (raw > 0.82 || partial > 0.75 || gore > 0.45 || offensive > 0.75) {
    return {
      ok: false,
      reason:
        'La imagen no cumple las reglas de la comunidad (contenido sensible o no permitido).',
    }
  }

  return { ok: true }
}

export async function moderateImageBuffer(
  buffer: ArrayBuffer,
  mimeType: string,
): Promise<ImageModerationResult> {
  const openai = await moderateWithOpenAI(buffer, mimeType)
  if (openai !== null) return openai

  const sight = await moderateWithSightengine(buffer, mimeType)
  if (sight !== null) return sight

  if (process.env.NODE_ENV === 'development') {
    console.warn(
      '[moderation] Sin OPENAI_API_KEY ni Sightengine: imágenes no se escanean. Configurá claves en producción.',
    )
  }

  return { ok: true, skipped: true }
}

export const IMAGE_REJECT_MESSAGE =
  'La imagen no cumple las reglas de la comunidad (contenido sensible o no permitido).'
