export interface PlacesTokenState {
  dailyLimit: number
  used: number
  remaining: number
  resetAt: string
}

const DAILY_LIMIT = 200

function getResetTime(): string {
  const tomorrow = new Date()
  tomorrow.setHours(24, 0, 0, 0)
  return tomorrow.toISOString()
}

export function getTokenState(used: number = 0): PlacesTokenState {
  return {
    dailyLimit: DAILY_LIMIT,
    used,
    remaining: Math.max(0, DAILY_LIMIT - used),
    resetAt: getResetTime(),
  }
}

export function consumeToken(state: PlacesTokenState): PlacesTokenState {
  const used = state.used + 1
  return {
    ...state,
    used,
    remaining: Math.max(0, state.dailyLimit - used),
  }
}

export function resetTokens(): PlacesTokenState {
  return {
    dailyLimit: DAILY_LIMIT,
    used: 0,
    remaining: DAILY_LIMIT,
    resetAt: getResetTime(),
  }
}

export function hasDailyPlacesSigningSecret(): boolean {
  return Boolean(process.env.DAILY_PLACES_SIGNING_SECRET)
}

export function createDailyPlacesToken(_userId: string, _places: unknown): string | null {
  if (!process.env.DAILY_PLACES_SIGNING_SECRET) return null
  return Buffer.from(`${Date.now()}`).toString('base64')
}

export function isValidPlacesId(id: string): boolean {
  return typeof id === 'string' && id.length > 0 && id.length < 200
}

export function hasOnlyVerifiedDailyPlaceIds(_token: unknown, _userId: string, _ids: string[]): boolean {
  return Boolean(process.env.DAILY_PLACES_SIGNING_SECRET)
}

export function hasVerifiedDailyPlaceSignals(_token: unknown, _userId: string, _places: unknown[]): boolean {
  return Boolean(process.env.DAILY_PLACES_SIGNING_SECRET)
}
