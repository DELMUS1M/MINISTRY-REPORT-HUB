'use client';

import { createBrowserClient } from '@supabase/ssr';

/**
 * Browser-side Supabase client. Safe to call from client components —
 * it only ever holds the public anon key.
 *
 * Deliberately untyped (no `Database` generic): `@supabase/postgrest-js`'s
 * generic resolution requires the schema type to match its internal
 * `GenericSchema` shape exactly, and small deviations silently collapse
 * query results to `never` instead of failing loudly. Query results here
 * are typed explicitly with `as` casts at each call site instead — see
 * lib/types.ts for the shapes and supabase/migrations for the source of
 * truth. Swap in `createBrowserClient<Database>(...)` once you've run
 * `supabase gen types typescript` against your live project and verified
 * `npm run build` passes with it.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
