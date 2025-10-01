import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// As credenciais são lidas das variáveis de ambiente. A API do Gemini exige o uso de
// `process.env`, então usaremos o mesmo para consistência. As variáveis devem
// ter o prefixo VITE_ no ambiente de hospedagem.
const supabaseUrl = process.env.VITE_SUPABASE_URL as string;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY as string;

// A verificação agora checa se as variáveis de ambiente foram carregadas.
export const isSupabaseConfigured = supabaseUrl && supabaseKey;

let supabaseClientInstance: SupabaseClient;

if (isSupabaseConfigured) {
  // Se as credenciais estiverem presentes, criamos o cliente real.
  supabaseClientInstance = createClient(supabaseUrl, supabaseKey);
} else {
  // Se não, a aplicação roda em modo de simulação.
  const warningMessage =
`************************************************************
*** ATENÇÃO: VARIÁVEIS DE AMBIENTE NÃO ENCONTRADAS! ***
*** Verifique suas variáveis de ambiente na Vercel ou  ***
*** no seu arquivo .env local (ex: VITE_SUPABASE_URL). ***
*** A aplicação funcionará em modo de simulação.     ***
************************************************************`;
  console.warn(warningMessage);

  // Criamos um objeto dummy para evitar erros de runtime em `import` statements.
  // O código de serviço deve SEMPRE checar `isSupabaseConfigured` antes de usar o cliente.
  supabaseClientInstance = {
    from: () => {
      throw new Error("Falha de lógica: Tentativa de usar o Supabase quando não está configurado.");
    }
  } as any;
}

// Exportamos a instância (real ou dummy) como uma constante `supabase`.
export const supabase = supabaseClientInstance;