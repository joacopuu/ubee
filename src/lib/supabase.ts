import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/*
 * Supabase connection.
 *
 * Without these two environment variables the site runs in DEMO MODE:
 * content comes from src/lib/data.ts and bookings live in the browser.
 * With them, everything reads and writes the shared database.
 *
 *   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...            (or the new "publishable" key)
 *
 * The anon/publishable key is safe in the browser: Row Level Security
 * (supabase/schema.sql) decides what each visitor can read or write.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const hasDb = Boolean(url && key);

let client: SupabaseClient | null = null;

/** Shared client, or null in demo mode. */
export function db(): SupabaseClient | null {
  if (!hasDb) return null;
  client ??= createClient(url!, key!, {
    auth: { persistSession: typeof window !== "undefined", autoRefreshToken: true },
  });
  return client;
}

export const MEDIA_BUCKET = "media";
