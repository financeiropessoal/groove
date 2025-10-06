import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMusicianAuth } from '../contexts/MusicianAuthContext';

const MusicianSignupPage: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [instrument, setInstrument] = useState('');
    const [city, setCity] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { musicianSignup } = useMusicianAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        const result = await musicianSignup(name, email, password, instrument, city);
        setIsLoading(false);
        if (!result.success) {
            setError(result.error || 'Falha no cadastro.');
        } else {
            navigate('/musician-dashboard');
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold">Cadastro de Músico</h2>
                    <p className="text-gray-400">Crie seu perfil para ser encontrado.</p>
                </div>
                <div className="bg-gray-800 p-8 rounded-lg">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nome Completo" required className="w-full bg-gray-900 rounded-md py-2.5 px-4" />
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="w-full bg-gray-900 rounded-md py-2.5 px-4" />
                        <input type="text" value={instrument} onChange={e => setInstrument(e.target.value)} placeholder="Instrumento Principal" required className="w-full bg-gray-900 rounded-md py-2.5 px-4" />
                        <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="Sua Cidade" required className="w-full bg-gray-900 rounded-md py-2.5 px-4" />
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Senha" required className="w-full bg-gray-900 rounded-md py-2.5 px-4" />
                        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                        <button type="submit" disabled={isLoading} className="w-full bg-pink-600 font-bold py-3 rounded-lg disabled:opacity-50">
                            {isLoading ? 'Cadastrando...' : 'Cadastrar'}
                        </button>
                    </form>
                    <p className="text-center mt-4 text-sm">
                        Já tem conta? <Link to="/musician-login" className="text-pink-400">Faça login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MusicianSignupPage;