export interface PlaceResult {
  id: string
  name: string
  address: string
  phone: string | null
  website: string | null
  industry: string
  rating: number | null
  reviewCount: number | null
  status: 'open' | 'closed' | 'unknown'
  latitude: number
  longitude: number
}

export interface PlacesSearchResponse {
  results: PlaceResult[]
  total: number
  tokenCost: number
}

export async function searchPlaces(
  query: string,
  location: string,
): Promise<PlacesSearchResponse> {
  return {
    results: [],
    total: 0,
    tokenCost: 0,
  }
}

export function classifyIndustry(name: string, types: string[] = []): string {
  const combined = (name + ' ' + types.join(' ')).toLowerCase()
  if (combined.includes('restaurant') || combined.includes('food')) return 'Food & Beverage'
  if (combined.includes('dentist') || combined.includes('medical') || combined.includes('health')) return 'Healthcare'
  if (combined.includes('law') || combined.includes('attorney')) return 'Legal Services'
  if (combined.includes('real estate') || combined.includes('property')) return 'Real Estate'
  if (combined.includes('auto') || combined.includes('car')) return 'Automotive'
  if (combined.includes('beauty') || combined.includes('salon') || combined.includes('spa')) return 'Beauty & Wellness'
  if (combined.includes('fitness') || combined.includes('gym')) return 'Fitness'
  if (combined.includes('tech') || combined.includes('software')) return 'Technology'
  if (combined.includes('construct') || combined.includes('contractor')) return 'Construction'
  if (combined.includes('finance') || combined.includes('account') || combined.includes('bank')) return 'Finance'
  if (combined.includes('education') || combined.includes('school') || combined.includes('tutor')) return 'Education'
  if (combined.includes('retail') || combined.includes('store') || combined.includes('shop')) return 'Retail'
  if (combined.includes('hotel') || combined.includes('lodging')) return 'Hospitality'
  if (combined.includes('marketing') || combined.includes('agency')) return 'Marketing & Advertising'
  return 'General Business'
}
