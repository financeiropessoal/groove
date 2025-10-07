import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient;
let isSupabaseConfigured: boolean;

const placeholderUrl = "https://placeholder.supabase.co";

try {
  // FIX: Cast `import.meta` to `any` to bypass TypeScript error for `env`.
  const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || placeholderUrl;
  // FIX: Cast `import.meta` to `any` to bypass TypeScript error for `env`.
  const supabaseKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || "ey-placeholder-key";
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Variáveis de ambiente do Supabase não encontradas.");
  }
  
  supabase = createClient(supabaseUrl, supabaseKey);
  
  // If we are using placeholder credentials, the app is not truly configured.
  // This prevents network errors in preview environments.
  if (supabaseUrl === placeholderUrl) {
      isSupabaseConfigured = false;
      console.warn(
`************************************************************
*** ATENÇÃO: USANDO CREDENCIAIS DE EXEMPLO DO SUPABASE! ***
*** A aplicação está rodando em modo de simulação.       ***
*** Todas as operações de banco de dados serão puladas.  ***
************************************************************`
      );
  } else {
      isSupabaseConfigured = true;
  }

} catch (e: any) {
    const errorMessage = "A aplicação não está conectada a um banco de dados. Verifique a configuração.";
    console.error(
  `************************************************************
  *** ERRO: FALHA AO INICIALIZAR O SUPABASE!             ***
  *** ${errorMessage}                               ***
  *** Verifique seu arquivo .env ou as configurações de deploy. ***
  ************************************************************`
    );
    isSupabaseConfigured = false;
    // NOTE: We don't re-throw the error, allowing the app to load in a degraded state.
    // To satisfy TypeScript's strict initialization, we assign a dummy object to supabase.
    // The isSupabaseConfigured flag will prevent this dummy from ever being used.
    supabase = {} as SupabaseClient;
}

export { supabase, isSupabaseConfigured };
