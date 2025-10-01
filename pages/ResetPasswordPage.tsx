import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { useToast } from '../contexts/ToastContext';

const ResetPasswordPage: React.FC = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { showToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }
        if (password.length < 8) {
            setError('A nova senha deve ter no mínimo 8 caracteres.');
            return;
        }
        if (!isSupabaseConfigured) {
             setError('Funcionalidade indisponível. A configuração do banco de dados está incompleta.');
            return;
        }
        
        setIsLoading(true);

        // The user is already authenticated at this point by Supabase client
        // after parsing the token from the URL fragment.
        const { error: updateError } = await supabase.auth.updateUser({ password });

        setIsLoading(false);
        if (updateError) {
            setError('Ocorreu um erro ao atualizar a senha. O link pode ter expirado. Por favor, solicite um novo link.');
            console.error("Update user password error:", updateError.message);
        } else {
            showToast('Senha atualizada com sucesso! Você já pode fazer o login.', 'success');
            // Log the user out of the temporary session before navigating
            await supabase.auth.signOut();
            navigate('/login');
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link to="/" className="flex items-center justify-center space-x-3 mb-4">
                        <i className="fas fa-wave-square text-red-500 text-4xl"></i>
                        <h1 className="text-3xl font-bold tracking-wider">Groove Music</h1>
                    </Link>
                    <h2 className="text-2xl font-bold text-gray-200">Crie sua Nova Senha</h2>
                    <p className="text-gray-400">Escolha uma senha forte para proteger sua conta.</p>
                </div>

                <div className="bg-gray-800 p-8 rounded-lg shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">Nova Senha</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="Mínimo de 8 caracteres"
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">Confirme a Nova Senha</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="Repita a senha"
                            />
                        </div>

                        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition-colors hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-wait flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin"></i>
                                        <span>Salvando...</span>
                                    </>
                                ) : (
                                    'Salvar Nova Senha'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
