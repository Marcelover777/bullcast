// src/lib/supabase.ts
// IMPORTANTE: usar @supabase/ssr para compatibilidade com Next.js App Router.
// createBrowserClient → para Client Components ('use client')
// createServerClient  → para Server Components / Server Actions
// NÃO usar createClient direto de @supabase/supabase-js em Server Components
// (não suporta cookies do App Router).

import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Cliente para uso em Client Components.
// Para Server Components, use createServerClient com cookies() — ver data.ts.
export function createSupabaseBrowserClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// Singleton para uso em data.ts (Server Components sem auth/cookies).
// Para leitura pública (RLS permite anon), é suficiente e não exige cookies.
export function createSupabaseServerClient() {
  // Importação dinâmica para não quebrar Client Components.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createServerClient } = require("@supabase/ssr");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { cookies } = require("next/headers");
  const cookieStore = cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) { return cookieStore.get(name)?.value ?? undefined; },
    },
  });
}
