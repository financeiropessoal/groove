import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Check for local var first, then fallback to VITE_ prefix (for Vercel)
const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL) as string;
const supabaseKey = (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY) as string;


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