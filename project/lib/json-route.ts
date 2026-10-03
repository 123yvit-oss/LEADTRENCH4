import { NextResponse } from 'next/server'
import { SupabaseConfigError } from '@/lib/supabase/server'

type RouteHandler = (request: Request) => Promise<Response>

/**
 * Wraps an API route so unexpected failures still return a JSON error body
 * instead of an empty 500 response the client cannot parse.
 */
export function jsonRoute(label: string, fallbackMessage: string, handler: RouteHandler): RouteHandler {
  return async (request) => {
    try {
      return await handler(request)
    } catch (error) {
      if (error instanceof SupabaseConfigError) {
        console.error(`[${label}] ${error.message}`)
        return NextResponse.json({ error: 'Supabase is not configured for this deployment.' }, { status: 503 })
      }
      console.error(`[${label}] Unhandled error:`, error instanceof Error ? error.message : error)
      return NextResponse.json({ error: fallbackMessage }, { status: 500 })
    }
  }
}
