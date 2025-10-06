import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { useToast } from '../contexts/ToastContext';

const ResetPasswordPage: React.FC = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { showToast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        // The Supabase client automatically handles the session from the URL hash fragment.
        // This listener is just to confirm the event fires, but no special action is needed here.
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
                // Session is now set for password update
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            showToast('As senhas não coincidem.', 'error');
            return;
        }
        if (!isSupabaseConfigured) {
            showToast('Função desabilitada no modo de demonstração.', 'info');
            return;
        }
       
        setIsLoading(true);
        // With the session from the recovery link, we can now update the user's password.
        const { error } = await supabase.auth.updateUser({ password });
        setIsLoading(false);

        if (error) {
            showToast(error.message, 'error');
        } else {
            showToast('Sua senha foi atualizada com sucesso!', 'success');
            navigate('/login');
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                 <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold">Redefinir Senha</h2>
                    <p className="text-gray-400">Crie uma nova senha para sua conta.</p>
                </div>
                <div className="bg-gray-800 p-8 rounded-lg shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm mb-2">Nova Senha</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-gray-900 rounded-md py-2 px-3" />
                        </div>
                        <div>
                            <label className="block text-sm mb-2">Confirmar Nova Senha</label>
                            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full bg-gray-900 rounded-md py-2 px-3" />
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full bg-pink-600 font-bold py-3 rounded-lg disabled:opacity-50">
                            {isLoading ? 'Salvando...' : 'Salvar Nova Senha'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
