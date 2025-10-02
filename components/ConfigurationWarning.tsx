import React, { useState } from 'react';

const envContent = `
# Credenciais do Supabase (obrigatório)
# Encontre em: Project Settings -> API
VITE_SUPABASE_URL="SUA_URL_DO_SUPABASE_AQUI"
VITE_SUPABASE_ANON_KEY="SUA_CHAVE_ANON_DO_SUPABASE_AQUI"

# Chave de API do Google Gemini (obrigatório para funcionalidades de IA)
# Encontre em: Google AI Studio -> Get API Key
VITE_API_KEY="SUA_CHAVE_DE_API_DO_GEMINI_AQUI"

# Credenciais do painel de Administrador (obrigatório)
VITE_ADMIN_EMAIL="admin@example.com"
VITE_ADMIN_PASSWORD="password123"
`.trim();

const ConfigurationWarning: React.FC = () => {
    const [copySuccess, setCopySuccess] = useState('');

    const handleCopy = () => {
        navigator.clipboard.writeText(envContent).then(() => {
            setCopySuccess('Copiado para a área de transferência!');
            setTimeout(() => setCopySuccess(''), 2000);
        }, () => {
            setCopySuccess('Falha ao copiar.');
        });
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
            <div className="max-w-3xl w-full bg-gray-800 p-8 rounded-lg shadow-2xl border-2 border-red-500/50">
                <div className="text-center">
                    <i className="fas fa-exclamation-triangle text-5xl text-red-500 mb-4"></i>
                    <h1 className="text-3xl font-bold text-white mb-2">Configuração Necessária</h1>
                    <p className="text-gray-300">
                        A aplicação não está conectada a um banco de dados ou aos serviços de IA.
                        Por favor, siga os passos abaixo para configurar suas credenciais.
                    </p>
                </div>

                <div className="mt-8 space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold text-white mb-3">Passo 1: Crie o arquivo de configuração</h2>
                        <p className="text-gray-400">
                            Na pasta principal do seu projeto, crie um novo arquivo chamado exatamente <code className="bg-gray-900 text-red-400 px-2 py-1 rounded-md text-sm">.env</code>.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-white mb-3">Passo 2: Copie e cole o conteúdo abaixo</h2>
                        <div className="relative bg-gray-900 rounded-lg p-4">
                            <button
                                onClick={handleCopy}
                                className="absolute top-3 right-3 px-3 py-1 bg-gray-700 text-white rounded-md text-xs font-semibold hover:bg-red-600 transition-colors"
                            >
                                {copySuccess ? <><i className="fas fa-check mr-2"></i>{copySuccess}</> : <><i className="fas fa-copy mr-2"></i>Copiar</>}
                            </button>
                            <pre className="text-gray-300 text-sm whitespace-pre-wrap overflow-x-auto">
                                <code>
                                    {envContent}
                                </code>
                            </pre>
                        </div>
                    </div>
                    
                    <div>
                        <h2 className="text-xl font-semibold text-white mb-3">Passo 3: Substitua os valores</h2>
                        <p className="text-gray-400">
                            Abra o arquivo <code className="bg-gray-900 text-red-400 px-2 py-1 rounded-md text-sm">.env</code> que você criou e substitua os valores de exemplo (como <code className="text-yellow-400">"SUA_URL_DO_SUPABASE_AQUI"</code>) pelas suas credenciais reais do Supabase e do Google AI Studio.
                        </p>
                    </div>

                    <div className="bg-red-900/50 p-4 rounded-lg text-center">
                        <h2 className="text-xl font-bold text-white mb-2"><i className="fas fa-power-off mr-3"></i>Passo 4: Reinicie a Aplicação</h2>
                        <p className="text-red-200">
                            Após salvar o arquivo <code className="bg-gray-900 text-white px-2 py-1 rounded-md text-sm">.env</code>, você **precisa parar e reiniciar o servidor de desenvolvimento** para que as novas configurações sejam carregadas.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfigurationWarning;
