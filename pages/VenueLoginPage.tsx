import React, { useState, useEffect } from 'react';
import { useVenueAuth } from '../contexts/VenueAuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const VenueLoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, isAuthenticated } = useVenueAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    const from = location.state?.from || '/venue-dashboard';

    useEffect(() => {
        if (isAuthenticated) {
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, from]);

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
                        <i className="fas fa-store text-pink-500 text-4xl"></i>
                        <h1 className="text-3xl font-bold tracking-wider">Groove Music</h1>
                    </Link>
                    <h2 className="text-2xl font-bold text-gray-200">Área do Contratante</h2>
                    <p className="text-gray-400">Acesse sua conta para contratar artistas.</p>
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
                                className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                                placeholder="contato@seu-local.com"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-300">Senha</label>
                                <Link to="/forgot-password" className="text-sm font-medium text-pink-400 hover:text-pink-300">Esqueceu a senha?</Link>
                            </div>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                                placeholder="********"
                            />
                        </div>

                        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-pink-500 to-orange-500 text-white font-bold py-3 px-4 rounded-lg transition-shadow hover:shadow-[0_0_20px_rgba(236,72,153,0.7)] disabled:from-gray-600 disabled:to-gray-600 disabled:shadow-none disabled:cursor-wait flex items-center justify-center gap-2"
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
                      <p>Não tem conta? <Link to="/venue-signup" state={{ from }} className="text-pink-400 hover:underline">Cadastre-se</Link></p>
                       <p className="mt-2">É um artista? <Link to="/login" className="text-pink-400 hover:underline">Login de Artista</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VenueLoginPage;