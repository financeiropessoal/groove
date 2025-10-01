import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// As credenciais agora serão lidas das variáveis de ambiente
// Isso é mais seguro e a prática correta para produção.
// Você precisará configurar essas variáveis na sua plataforma de hospedagem (Vercel, Netlify, etc.)
// FIX: Reverted to using `process.env` for environment variables to fix a runtime error where `import.meta.env` was undefined. This aligns with the platform's standard, as seen with the Gemini API key.
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
*** Crie um arquivo .env na raiz do projeto com:   ***
*** VITE_SUPABASE_URL=SUA_URL                      ***
*** VITE_SUPABASE_ANON_KEY=SUA_CHAVE               ***
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