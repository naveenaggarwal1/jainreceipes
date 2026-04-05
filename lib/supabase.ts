import { createBrowserClient } from "@supabase/ssr";

// These are public anon credentials — safe to include in client code.
// Supabase RLS policies protect the data, not the key.
const SUPABASE_URL = "https://zlrhdwdusitunmblgdjz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable__tGuzdAoJBlh_l1AIjH0Hg_GQ91tWlp";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY
  );
}
