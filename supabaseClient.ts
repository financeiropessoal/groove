import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Check for VITE_ prefix first (for Vercel), then fallback to non-prefixed (for local dev)
const supabaseUrl = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL) as string;
const supabaseKey = (process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY) as string;


export const isSupabaseConfigured = supabaseUrl && supabaseKey;

let supabaseClientInstance: SupabaseClient;

if (isSupabaseConfigured) {
  supabaseClientInstance = createClient(supabaseUrl, supabaseKey);
} else {
  const warningMessage =
`************************************************************
*** ATENÇÃO: VARIÁVEIS DE AMBIENTE NÃO ENCONTRADAS! ***
*** Verifique suas variáveis na Vercel (VITE_SUPABASE_URL ***
*** e VITE_SUPABASE_ANON_KEY). A aplicação funcionará em  ***
*** modo de simulação.                               ***
************************************************************`;
  console.warn(warningMessage);

  supabaseClientInstance = {
    from: () => {
      throw new Error("Falha de lógica: Tentativa de usar o Supabase quando não está configurado.");
    }
  } as any;
}

export const supabase = supabaseClientInstance;