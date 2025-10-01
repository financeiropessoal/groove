import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        const result = await login(email, password);
        setIsLoading(false);
        if (!result.success) {
            setError(result.message || 'Credenciais inválidas. Tente novamente.');
        }
        // Navegação é tratada pelo useEffect
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link to="/" className="flex items-center justify-center space-x-3 mb-4">
                        <i className="fas fa-wave-square text-red-500 text-4xl"></i>
                        <h1 className="text-3xl font-bold tracking-wider">Groove Music</h1>
                    </Link>
                    <h2 className="text-2xl font-bold text-gray-200">Área do Artista</h2>
                    <p className="text-gray-400">Gerencie seu perfil, agenda e pacotes.</p>
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
                                className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="seuemail@exemplo.com"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-300">Senha</label>
                                <Link to="/forgot-password" className="text-sm font-medium text-red-400 hover:text-red-300">Esqueceu a senha?</Link>
                            </div>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="********"
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
                                        <span>Entrando...</span>
                                    </>
                                ) : (
                                    'Entrar'
                                )}
                            </button>
                        </div>
                    </form>
                    <div className="text-center mt-4 text-sm text-gray-400">
                      <p>Ainda não tem conta? <Link to="/signup" className="text-red-400 hover:underline">Cadastre-se</Link></p>
                      <p className="mt-2">É um contratante? <Link to="/venue-login" className="text-red-400 hover:underline">Login Contratante</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;