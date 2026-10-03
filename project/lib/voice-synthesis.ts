'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { LeadRecord } from './leadtrench-data'

const PREFERRED_FEMALE_VOICES = [
  'Google US English',
  'Microsoft Zira',
  'Microsoft Aria',
  'Microsoft Jenny',
  'Microsoft Michelle',
  'Apple Samantha',
  'Samantha',
  'Google UK English Female',
  'Karen',
  'Tessa',
  'Fiona',
  'Moira',
  'Veena',
  'Zira',
  'Aria',
  'Jenny',
]

const MALE_VOICE_INDICATORS = ['David', 'Mark', 'Daniel', 'Alex', 'Fred', 'George', 'Rishi', 'Guy', 'Thomas', 'James', 'Microsoft David', 'Google UK English Male']

function isLikelyFemale(name: string): boolean {
  const lower = name.toLowerCase()
  if (MALE_VOICE_INDICATORS.some((m) => lower.includes(m.toLowerCase()))) return false
  if (PREFERRED_FEMALE_VOICES.some((f) => lower.includes(f.toLowerCase()))) return true
  if (lower.includes('female') || lower.includes('woman') || lower.includes('zira') || lower.includes('aria') || lower.includes('jenny') || lower.includes('samantha')) return true
  return false
}

function selectFemaleVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  for (const preferred of PREFERRED_FEMALE_VOICES) {
    const match = voices.find((v) => v.name.toLowerCase().includes(preferred.toLowerCase()))
    if (match) return match
  }

  const femaleVoices = voices.filter((v) => isLikelyFemale(v.name))
  if (femaleVoices.length > 0) {
    const enFemale = femaleVoices.find((v) => v.lang.startsWith('en'))
    if (enFemale) return enFemale
    return femaleVoices[0]
  }

  const enVoices = voices.filter((v) => v.lang.startsWith('en'))
  if (enVoices.length > 0) return enVoices[0]
  return voices[0] ?? null
}

export interface VoiceController {
  speak: (text: string, opts?: { rate?: number; pitch?: number; onStart?: () => void; onEnd?: () => void }) => void
  stop: () => void
  isSpeaking: boolean
  isReady: boolean
}

export function useVoiceSynthesis(): VoiceController {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null)
  const supportedRef = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    supportedRef.current = true

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices()
      if (voices.length === 0) return
      voiceRef.current = selectFemaleVoice(voices)
      setIsReady(true)
    }

    loadVoices()
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices)

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices)
      window.speechSynthesis.cancel()
    }
  }, [])

  const speak = useCallback((text: string, opts?: { rate?: number; pitch?: number; onStart?: () => void; onEnd?: () => void }) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    if (voiceRef.current) {
      utterance.voice = voiceRef.current
      utterance.lang = voiceRef.current.lang
    }
    utterance.rate = opts?.rate ?? 0.95
    utterance.pitch = opts?.pitch ?? 1.05
    utterance.volume = 1

    utterance.onstart = () => {
      setIsSpeaking(true)
      opts?.onStart?.()
    }
    utterance.onend = () => {
      setIsSpeaking(false)
      opts?.onEnd?.()
    }
    utterance.onerror = () => {
      setIsSpeaking(false)
      opts?.onEnd?.()
    }

    window.speechSynthesis.speak(utterance)
  }, [])

  const stop = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [])

  return { speak, stop, isSpeaking, isReady }
}

export function buildDossierSummary(lead: LeadRecord): string {
  const tierLabel = lead.tier === 'hot' ? 'high priority' : lead.tier === 'warm' ? 'warm' : 'a watch list lead'
  const execSummary = lead.executives.length > 0
    ? `Key contacts include ${lead.executives.map((e) => `${e.name}, ${e.title}`).join('; ')}.`
    : 'No verified executive contacts yet.'
  const verifiedText = lead.verified ? 'Signals are verified.' : 'Signals are currently unverified.'

  return [
    `Dossier for ${lead.company}, a ${lead.industry.toLowerCase()} company based in ${lead.location}.`,
    `Lead score is ${lead.score} out of 100, classified as ${tierLabel}.`,
    lead.signalText ? `Latest signal: ${lead.signalText}.` : '',
    execSummary,
    verifiedText,
    lead.bottleneck ? `Identified bottleneck: ${lead.bottleneck}` : '',
    lead.opportunity ? `Recommended opportunity: ${lead.opportunity}` : '',
  ].filter(Boolean).join(' ')
}

export function buildWelcomeMessage(): string {
  return 'Welcome to LeadTrench. Systems are nominal.'
}
