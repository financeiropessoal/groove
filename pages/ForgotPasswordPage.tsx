import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isSupabaseConfigured) {
            setError('Funcionalidade indisponível. A configuração do banco de dados está incompleta.');
            return;
        }
        setIsLoading(true);
        setError('');
        setMessage('');

        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin, // Supabase appends the fragment needed for HashRouter
        });

        setIsLoading(false);
        if (resetError) {
            // Don't reveal if the email exists or not, but log for debugging
            console.error("Password reset error:", resetError.message);
            setError('Ocorreu um erro. Verifique o e-mail digitado e tente novamente.');
        } else {
            setMessage('Se uma conta com este e-mail existir, um link para redefinir a senha foi enviado. Verifique sua caixa de entrada e também a pasta de spam.');
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
                    <h2 className="text-2xl font-bold text-gray-200">Redefinir Senha</h2>
                    <p className="text-gray-400">Insira seu e-mail para receber o link de redefinição.</p>
                </div>

                <div className="bg-gray-800 p-8 rounded-lg shadow-2xl">
                    {message ? (
                        <div className="text-center">
                            <i className="fas fa-paper-plane text-4xl text-green-400 mb-4"></i>
                            <p className="text-gray-300">{message}</p>
                            <Link to="/login" className="mt-6 inline-block bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700">Voltar para Login</Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email de Cadastro</label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                    placeholder="seuemail@exemplo.com"
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
                                            <span>Enviando...</span>
                                        </>
                                    ) : (
                                        'Enviar Link de Redefinição'
                                    )}
                                </button>
                            </div>
                            <div className="text-center mt-4 text-sm text-gray-400">
                                <Link to="/login" className="text-red-400 hover:underline">Lembrou a senha? Voltar para o login</Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
