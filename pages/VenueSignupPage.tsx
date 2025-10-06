import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useVenueAuth } from '../contexts/VenueAuthContext';

const VenueSignupPage: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [city, setCity] = useState('');
    const [contractorType, setContractorType] = useState<'company' | 'individual'>('company');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { signup } = useVenueAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        const result = await signup({ name, email, password, contractor_type: contractorType, city });
        setIsLoading(false);
        if (result.success) {
            navigate('/venue-dashboard');
        } else {
            setError(result.error || 'Falha no cadastro.');
        }
    };
    
    return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold">Cadastro de Contratante</h2>
                </div>
                <div className="bg-gray-800 p-8 rounded-lg">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nome do Local/Produtora" required className="w-full bg-gray-900 rounded-md py-2.5 px-4" />
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email de Contato" required className="w-full bg-gray-900 rounded-md py-2.5 px-4" />
                        <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="Cidade do Local (Ex: Rio de Janeiro, RJ)" required className="w-full bg-gray-900 rounded-md py-2.5 px-4" />
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Senha" required className="w-full bg-gray-900 rounded-md py-2.5 px-4" />
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de Contratante</label>
                            <div className="flex gap-4 rounded-lg bg-gray-900 p-2">
                                <button
                                    type="button"
                                    onClick={() => setContractorType('company')}
                                    className={`w-1/2 py-2.5 text-sm font-semibold rounded-md transition-colors ${contractorType === 'company' ? 'bg-pink-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                                >
                                    Pessoa Jurídica (Empresa)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setContractorType('individual')}
                                    className={`w-1/2 py-2.5 text-sm font-semibold rounded-md transition-colors ${contractorType === 'individual' ? 'bg-pink-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                                >
                                    Pessoa Física (Particular)
                                </button>
                            </div>
                        </div>

                        {error && <p className="text-red-400 text-sm">{error}</p>}
                        <button type="submit" disabled={isLoading} className="w-full bg-pink-600 font-bold py-3 rounded-lg disabled:opacity-50">
                           {isLoading ? 'Cadastrando...' : 'Cadastrar'}
                        </button>
                    </form>
                    <p className="text-center mt-4 text-sm">
                        Já tem conta? <Link to="/venue-login" className="text-pink-400">Faça login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VenueSignupPage;