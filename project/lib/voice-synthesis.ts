'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { LeadRecord } from './leadtrench-data'

// Fallback only: used when the ElevenLabs Jarvis voice is unavailable.
// Ordered from most to least natural-sounding British male voices.
const PREFERRED_JARVIS_VOICES = [
  'Microsoft Ryan Online (Natural)',
  'Microsoft Thomas Online (Natural)',
  'Microsoft Oliver Online (Natural)',
  'Daniel (Enhanced)',
  'Daniel (Premium)',
  'Google UK English Male',
  'Microsoft Ryan',
  'Microsoft George',
  'Daniel',
  'Arthur',
  'Oliver',
]

const FEMALE_VOICE_INDICATORS = ['female', 'woman', 'zira', 'aria', 'jenny', 'samantha', 'karen', 'tessa', 'fiona', 'moira', 'libby', 'sonia', 'hazel', 'susan', 'kate', 'serena']

function selectFallbackVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  for (const preferred of PREFERRED_JARVIS_VOICES) {
    const match = voices.find((v) => v.name.toLowerCase().includes(preferred.toLowerCase()))
    if (match) return match
  }

  const male = voices.filter((v) => !FEMALE_VOICE_INDICATORS.some((f) => v.name.toLowerCase().includes(f)))
  return male.find((v) => v.lang === 'en-GB') ?? male.find((v) => v.lang.startsWith('en')) ?? voices.find((v) => v.lang.startsWith('en')) ?? null
}

type SpeakOptions = { onStart?: () => void; onEnd?: () => void }

export interface VoiceController {
  speak: (text: string, opts?: SpeakOptions) => void
  stop: () => void
  isSpeaking: boolean
  isReady: boolean
}

export function useVoiceSynthesis(): VoiceController {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const fallbackVoiceRef = useRef<SpeechSynthesisVoice | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioUrlRef = useRef<string | null>(null)
  const requestRef = useRef<AbortController | null>(null)
  const removeUnlockRef = useRef<(() => void) | null>(null)
  // Once ElevenLabs reports it isn't configured, stop asking for every line.
  const jarvisUnavailableRef = useRef(false)

  const releaseAudio = useCallback(() => {
    removeUnlockRef.current?.()
    removeUnlockRef.current = null
    requestRef.current?.abort()
    requestRef.current = null
    if (audioRef.current) {
      audioRef.current.onended = null
      audioRef.current.onerror = null
      audioRef.current.pause()
      audioRef.current = null
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current)
      audioUrlRef.current = null
    }
    if (typeof window !== 'undefined') window.speechSynthesis?.cancel()
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    setIsReady(true)

    const synth = window.speechSynthesis
    if (!synth) return releaseAudio
    const loadVoices = () => {
      const voices = synth.getVoices()
      if (voices.length > 0) fallbackVoiceRef.current = selectFallbackVoice(voices)
    }
    loadVoices()
    synth.addEventListener('voiceschanged', loadVoices)

    return () => {
      synth.removeEventListener('voiceschanged', loadVoices)
      releaseAudio()
    }
  }, [releaseAudio])

  const speakWithBrowser = useCallback((text: string, opts?: SpeakOptions) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      opts?.onEnd?.()
      return
    }
    const utterance = new SpeechSynthesisUtterance(text)
    if (fallbackVoiceRef.current) {
      utterance.voice = fallbackVoiceRef.current
      utterance.lang = fallbackVoiceRef.current.lang
    }
    utterance.rate = 1
    utterance.pitch = 0.95
    utterance.onstart = () => {
      setIsSpeaking(true)
      opts?.onStart?.()
    }
    utterance.onend = utterance.onerror = () => {
      setIsSpeaking(false)
      opts?.onEnd?.()
    }
    window.speechSynthesis.speak(utterance)
  }, [])

  const speak = useCallback((text: string, opts?: SpeakOptions) => {
    if (typeof window === 'undefined') return
    releaseAudio()
    setIsSpeaking(false)

    if (jarvisUnavailableRef.current) {
      speakWithBrowser(text, opts)
      return
    }

    const controller = new AbortController()
    requestRef.current = controller

    void (async () => {
      let blob: Blob
      try {
        const response = await fetch('/api/voice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
          signal: controller.signal,
        })
        if (!response.ok) {
          if (response.status === 503) jarvisUnavailableRef.current = true
          throw new Error(`Voice request failed with ${response.status}`)
        }
        blob = await response.blob()
      } catch (error) {
        if (controller.signal.aborted) return
        console.warn('[voice] Falling back to browser speech:', error instanceof Error ? error.message : error)
        speakWithBrowser(text, opts)
        return
      }
      if (controller.signal.aborted) return
      requestRef.current = null

      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audioRef.current = audio
      audioUrlRef.current = url

      const finish = () => {
        setIsSpeaking(false)
        releaseAudio()
        opts?.onEnd?.()
      }
      audio.onended = finish
      audio.onerror = finish

      const play = () =>
        audio.play().then(() => {
          setIsSpeaking(true)
          opts?.onStart?.()
        })

      play().catch((error: unknown) => {
        if (audioRef.current !== audio) return
        if (error instanceof DOMException && error.name === 'NotAllowedError') {
          // Browsers block audio until the visitor interacts with the page.
          const unlock = () => {
            removeUnlockRef.current?.()
            removeUnlockRef.current = null
            if (audioRef.current === audio) play().catch(finish)
          }
          window.addEventListener('pointerdown', unlock, { once: true })
          window.addEventListener('keydown', unlock, { once: true })
          removeUnlockRef.current = () => {
            window.removeEventListener('pointerdown', unlock)
            window.removeEventListener('keydown', unlock)
          }
          return
        }
        finish()
      })
    })()
  }, [releaseAudio, speakWithBrowser])

  const stop = useCallback(() => {
    releaseAudio()
    setIsSpeaking(false)
  }, [releaseAudio])

  return { speak, stop, isSpeaking, isReady }
}

function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1)
}

function sentence(text: string): string {
  const trimmed = text.trim()
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`
}

function listNames(names: string[]): string {
  if (names.length <= 1) return names.join('')
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`
}

// Lines are written to be spoken, Jarvis-style: calm, conversational and
// lightly dry, rather than read out field by field.
export function buildDossierSummary(lead: LeadRecord): string {
  const take = lead.tier === 'hot'
    ? `Honestly, this one looks promising. I'd put it at ${lead.score} out of a hundred.`
    : lead.tier === 'warm'
      ? `It's a reasonable prospect. I'd score it around ${lead.score}.`
      : `I'd keep an eye on this one rather than chase it just yet. It sits at ${lead.score} for now.`

  const contacts = lead.executives.length > 0
    ? `If you'd like to reach out, the people to talk to are ${listNames(lead.executives.map((e) => `${e.name}, the ${e.title.replace(/&/g, 'and')}`))}.`
    : "I haven't found anyone reliable to contact yet, I'm afraid."

  return [
    `Right, ${lead.company}. They're a ${lead.industry.toLowerCase()} business out of ${lead.location}.`,
    take,
    lead.signalText ? `Here's what caught my eye. ${sentence(lead.signalText)}` : '',
    lead.verified ? "And I've double-checked that, so it's solid." : "Though I haven't been able to confirm that yet, so take it with a pinch of salt.",
    contacts,
    lead.bottleneck ? `As far as I can tell, the sticking point is this: ${lowerFirst(sentence(lead.bottleneck))}` : '',
    lead.opportunity ? `My suggestion? ${sentence(lead.opportunity)}` : '',
  ].filter(Boolean).join(' ')
}

export function buildWelcomeMessage(): string {
  return "Welcome back. Everything's up and running, and your leads are ready whenever you are."
}
