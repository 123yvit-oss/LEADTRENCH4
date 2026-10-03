export type SupabaseClient = Record<string, unknown>

const emptyClient: SupabaseClient = {
  from: () => ({
    select: () => ({ data: [], error: null, eq: () => ({ data: [], error: null, single: () => ({ data: null, error: null }) }), limit: () => ({ data: [], error: null }) }),
    insert: () => ({ data: null, error: null }),
    update: () => ({ data: null, error: null, eq: () => ({ data: null, error: null }) }),
    delete: () => ({ data: null, error: null, eq: () => ({ data: null, error: null }) }),
    upsert: () => ({ data: null, error: null }),
  }),
  auth: {
    getSession: () => ({ data: { session: null }, error: null }),
    getUser: () => ({ data: { user: null }, error: null }),
    signInWithPassword: () => ({ data: null, error: null }),
    signUp: () => ({ data: null, error: null }),
    signOut: () => ({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
  channel: () => ({ on: () => ({ subscribe: () => {} }), unsubscribe: () => {} }),
  storage: {
    from: () => ({
      upload: () => ({ data: null, error: null }),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
      remove: () => ({ data: null, error: null }),
    }),
  },
}

export function createClient(): SupabaseClient {
  return emptyClient
}
