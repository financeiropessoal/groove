import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// As credenciais são lidas das variáveis de ambiente.
// O ambiente de execução fornece segredos em `process.env`.
// Supõe-se que prefixos como 'VITE_' sejam removidos pelo processo de build.
const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_ANON_KEY as string;

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