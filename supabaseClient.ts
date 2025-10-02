import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// FIX: Definite assignment assertions are used because initialization happens inside a try-catch block.
// This tells TypeScript that the variables will be assigned before use, even if it can't verify it.
let supabase: SupabaseClient;
let isSupabaseConfigured: boolean;

try {
  // FIX: Switched back to process.env and removed VITE_ prefix to fix runtime errors.
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  
  // Verificação de segurança: garantir que as variáveis existam
  if (!supabaseUrl || !supabaseKey) {
    // This error will be caught by the try-catch block
    throw new Error("Variáveis de ambiente do Supabase não encontradas.");
  }
  
  supabase = createClient(supabaseUrl, supabaseKey);
  isSupabaseConfigured = true;

} catch (e: any) {
    const errorMessage = "A aplicação não está conectada a um banco de dados. Verifique a configuração.";
    console.error(
  `************************************************************
  *** ATENÇÃO: VARIÁVEIS DE AMBIENTE DO SUPABASE NÃO ENCONTRADAS! ***
  *** ${errorMessage}                               ***
  *** Verifique seu arquivo .env ou as configurações de deploy. ***
  ************************************************************`
    );
    // Set the flag to false so the rest of the app knows Supabase is not available.
    isSupabaseConfigured = false;
    // NOTE: We don't re-throw the error, allowing the app to load in a degraded state.
    // To satisfy TypeScript's strict initialization, we assign a dummy object to supabase.
    // The isSupabaseConfigured flag will prevent this dummy from ever being used.
    supabase = {} as SupabaseClient;
}

// FIX: Exports are now outside the try-catch, providing a consistent module interface.
export { supabase, isSupabaseConfigured };