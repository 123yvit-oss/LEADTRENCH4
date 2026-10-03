export interface CareerSignal {
  id: string
  source: 'linkedin' | 'indeed' | 'company-site' | 'press-release' | 'crunchbase'
  title: string
  description: string
  url: string | null
  detectedAt: string
  confidence: 'high' | 'medium' | 'low'
}

export function analyzeCareerSignals(companyName: string, industry: string): CareerSignal[] {
  const signals: CareerSignal[] = []

  if (companyName.toLowerCase().includes('dental') || industry === 'Healthcare') {
    signals.push({
      id: 'sig-001',
      source: 'indeed',
      title: 'Multiple front office positions posted',
      description: '3 new job listings for dental hygienists and front office coordinators in the past 14 days.',
      url: null,
      detectedAt: '2026-09-28',
      confidence: 'high',
    })
  }

  if (industry === 'Construction') {
    signals.push({
      id: 'sig-002',
      source: 'press-release',
      title: 'Municipal contract award announced',
      description: 'Company awarded a $2.1M public infrastructure contract, indicating revenue growth.',
      url: null,
      detectedAt: '2026-09-30',
      confidence: 'high',
    })
  }

  if (industry === 'Marketing & Advertising') {
    signals.push({
      id: 'sig-003',
      source: 'linkedin',
      title: 'Aggressive hiring for content roles',
      description: '4 content strategist positions posted on LinkedIn, signaling team expansion.',
      url: null,
      detectedAt: '2026-10-01',
      confidence: 'medium',
    })
  }

  if (industry === 'Legal Services') {
    signals.push({
      id: 'sig-004',
      source: 'press-release',
      title: 'Merger announcement with IP boutique',
      description: 'Firm merged with a boutique intellectual property practice, expanding service offerings.',
      url: null,
      detectedAt: '2026-09-29',
      confidence: 'high',
    })
  }

  return signals
}

export function getSignalConfidenceLabel(confidence: CareerSignal['confidence']): string {
  if (confidence === 'high') return 'High Confidence'
  if (confidence === 'medium') return 'Medium Confidence'
  return 'Low Confidence'
}

type GooglePlaceResult = {
  id?: string
  displayName?: { text?: string }
  formattedAddress?: string
  websiteUri?: string
  nationalPhoneNumber?: string
  internationalPhoneNumber?: string
  businessStatus?: string
  currentOpeningHours?: { openNow?: boolean }
}

export async function enrichWithOfficialCareerSignals(places: GooglePlaceResult[]): Promise<GooglePlaceResult[]> {
  return places
}
