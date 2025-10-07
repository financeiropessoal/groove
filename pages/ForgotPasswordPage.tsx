
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { useToast } from '../contexts/ToastContext';

const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { showToast } = useToast();

    // --- AJUDA PARA DESENVOLVIMENTO LOCAL ---
    // Para testar o link de recuperação de senha em um ambiente de desenvolvimento local
    // que precise ser acessado por outros dispositivos ou serviços de e-mail,
    // você pode definir o endereço de IP da sua máquina aqui.
    // Exemplo: const DEV_NETWORK_URL = 'http://192.168.0.10:5173';
    // Deixe em branco para produção.
    // FIX: Explicitly type DEV_NETWORK_URL as a string to prevent it from being inferred as type 'never' inside a truthiness check.
    const DEV_NETWORK_URL: string = '';

    const generateBaseUrl = () => {
        if (DEV_NETWORK_URL && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
            return DEV_NETWORK_URL.endsWith('/') ? DEV_NETWORK_URL : `${DEV_NETWORK_URL}/`;
        }
        
        // window.location.origin provides the canonical base URL (scheme, hostname, port)
        // and correctly resolves the origin even when the page is served via a blob URL.
        // This avoids including the blob's unique path in the base URL.
        const origin = window.location.origin;
        // We append a slash to ensure it's a valid base for constructing the final URL.
        return origin.endsWith('/') ? origin : `${origin}/`;
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isSupabaseConfigured) {
            showToast('Função desabilitada no modo de demonstração.', 'info');
            return;
        }
        setIsLoading(true);
        
        const baseUrl = generateBaseUrl();
        const redirectTo = `${baseUrl}#/reset-password`;

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: redirectTo
        });
        setIsLoading(false);
        if (error) {
            showToast(error.message, 'error');
        } else {
            showToast('Se o e-mail estiver correto, você receberá um link para redefinir sua senha.', 'success');
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                 <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold">Esqueceu sua Senha?</h2>
                    <p className="text-gray-400">Insira seu e-mail para receber o link de redefinição.</p>
                </div>
                <div className="bg-gray-800 p-8 rounded-lg shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4"
                            />
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full bg-pink-600 font-bold py-3 rounded-lg disabled:opacity-50">
                            {isLoading ? 'Enviando...' : 'Enviar Link'}
                        </button>
                    </form>
                    <div className="text-center mt-4 text-sm">
                        <Link to="/login" className="text-pink-400 hover:underline">Voltar para o Login</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
