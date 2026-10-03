import { getStore } from '@netlify/blobs'
import { NextResponse } from 'next/server'
import { jsonRoute } from '@/lib/json-route'

// "Daniel" from the ElevenLabs voice library: a calm, refined British male
// voice that suits a Jarvis-style assistant. Override with ELEVENLABS_VOICE_ID.
const DEFAULT_VOICE_ID = 'onwK4e9ZLuTAKqWW03F9'
const MODEL_ID = 'eleven_multilingual_v2'
const MAX_TEXT_LENGTH = 1200

const VOICE_SETTINGS = {
  // Lower stability lets intonation vary naturally instead of sounding read out.
  stability: 0.4,
  similarity_boost: 0.8,
  style: 0.25,
  use_speaker_boost: true,
}

async function cacheKey(voiceId: string, text: string) {
  const input = new TextEncoder().encode(JSON.stringify([voiceId, MODEL_ID, VOICE_SETTINGS, text]))
  const digest = await crypto.subtle.digest('SHA-256', input)
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('')
}

function audioResponse(audio: ArrayBuffer) {
  return new Response(audio, {
    headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'private, max-age=86400' },
  })
}

export const POST = jsonRoute('voice', 'Voice audio could not be generated.', async (request) => {
  // Only the app itself may spend ElevenLabs credits.
  const fetchSite = request.headers.get('sec-fetch-site')
  const origin = request.headers.get('origin')
  const sameOrigin = fetchSite ? fetchSite === 'same-origin' : !origin || origin === new URL(request.url).origin
  if (!sameOrigin) {
    return NextResponse.json({ error: 'Cross-site voice requests are not allowed.' }, { status: 403 })
  }

  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'The Jarvis voice is not configured for this deployment.' }, { status: 503 })
  }

  let body: { text?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid voice request.' }, { status: 400 })
  }

  const text = typeof body.text === 'string' ? body.text.trim() : ''
  if (!text || text.length > MAX_TEXT_LENGTH) {
    return NextResponse.json({ error: `Send between 1 and ${MAX_TEXT_LENGTH} characters of text.` }, { status: 400 })
  }

  const voiceId = process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE_ID
  const key = await cacheKey(voiceId, text)
  const store = getStore('jarvis-voice')

  const cached = await store.get(key, { type: 'arrayBuffer' })
  if (cached) return audioResponse(cached)

  const upstream = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'audio/mpeg', 'xi-api-key': apiKey },
      body: JSON.stringify({ text, model_id: MODEL_ID, voice_settings: VOICE_SETTINGS }),
    },
  )

  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => '')
    console.error('[voice] ElevenLabs request failed:', { status: upstream.status, detail: detail.slice(0, 300) })
    const status = upstream.status === 401 || upstream.status === 429 ? upstream.status : 502
    return NextResponse.json({ error: 'Voice audio could not be generated.' }, { status })
  }

  const audio = await upstream.arrayBuffer()
  await store.set(key, audio).catch((error: unknown) => {
    console.error('[voice] Could not cache audio:', error instanceof Error ? error.message : error)
  })
  return audioResponse(audio)
})
