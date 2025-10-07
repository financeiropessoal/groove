import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

const BRAZILIAN_CITIES = [
    "São Paulo", "Rio de Janeiro", "Belo Horizonte", "Salvador", "Fortaleza",
    "Brasília", "Curitiba", "Manaus", "Recife", "Porto Alegre", "Goiânia",
    "Belém", "São Luís", "Maceió", "Teresina", "Natal", "Campo Grande",
    "João Pessoa", "Aracaju", "Cuiabá", "Florianópolis", "Vitória", "Palmas",
    "Porto Velho", "Rio Branco", "Boa Vista", "Macapá", "Campinas", "Guarulhos",
    "São Bernardo do Campo", "Santo André", "Osasco", "Sorocaba", "Ribeirão Preto",
    "Uberlândia", "Contagem", "Juiz de Fora", "Niterói", "Duque de Caxias",
    "São Gonçalo", "Nova Iguaçu", "Feira de Santana", "Jaboatão dos Guararapes",
    "Londrina", "Caxias do Sul", "Joinville", "Santos", "Anápolis"
];


const SignupPage: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [city, setCity] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [needsConfirmation, setNeedsConfirmation] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
    const [showCitySuggestions, setShowCitySuggestions] = useState(false);

    const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setCity(value);

        if (value.length > 1) {
            const suggestions = BRAZILIAN_CITIES.filter(c =>
                c.toLowerCase().includes(value.toLowerCase())
            );
            setCitySuggestions(suggestions.slice(0, 5)); // Limit to 5 suggestions
            setShowCitySuggestions(true);
        } else {
            setShowCitySuggestions(false);
        }
    };
    
    const handleCitySelect = (selectedCity: string) => {
        setCity(selectedCity);
        setShowCitySuggestions(false);
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        const referrerId = searchParams.get('ref');
        const result = await signup(name, email, password, city, referrerId);
        setIsLoading(false);
        if (result.success) {
            if (result.requiresConfirmation) {
                setNeedsConfirmation(true);
            } else {
                navigate('/dashboard');
            }
        } else {
            setError(result.error || 'Ocorreu um erro no cadastro.');
        }
    };

    if (needsConfirmation) {
        return (
             <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-md text-center">
                    <h2 className="text-2xl font-bold">Verifique seu E-mail</h2>
                    <p className="text-gray-400 mt-4">Enviamos um link de confirmação para {email}. Por favor, clique no link para ativar sua conta.</p>
                    <Link to="/login" className="mt-6 inline-block text-pink-400 hover:underline">Voltar para o Login</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
                 <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold">Crie sua Conta de Artista</h2>
                </div>
                <div className="bg-gray-800 p-8 rounded-lg shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nome Artístico / Banda" required className="w-full bg-gray-900 rounded-md py-2.5 px-4" />
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="w-full bg-gray-900 rounded-md py-2.5 px-4" />
                        
                        <div className="relative">
                            <input 
                                type="text" 
                                value={city} 
                                onChange={handleCityChange} 
                                // Hide on blur with a small delay to allow click on suggestions
                                onBlur={() => setTimeout(() => setShowCitySuggestions(false), 150)}
                                placeholder="Sua Cidade de Atuação" 
                                required 
                                className="w-full bg-gray-900 rounded-md py-2.5 px-4"
                                autoComplete="off" 
                            />
                            {showCitySuggestions && citySuggestions.length > 0 && (
                                <ul className="absolute z-10 w-full bg-gray-700 border border-gray-600 rounded-md mt-1 max-h-48 overflow-y-auto shadow-lg">
                                    {citySuggestions.map(suggestion => (
                                        <li 
                                            key={suggestion}
                                            // onMouseDown fires before onBlur, preventing the list from disappearing before selection
                                            onMouseDown={() => handleCitySelect(suggestion)}
                                            className="px-4 py-2 cursor-pointer hover:bg-pink-600"
                                        >
                                            {suggestion}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Senha" required className="w-full bg-gray-900 rounded-md py-2.5 px-4" />
                        
                        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                        <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-pink-500 to-orange-500 text-white font-bold py-3 rounded-lg disabled:opacity-50">
                            {isLoading ? 'Criando...' : 'Criar Conta'}
                        </button>
                    </form>
                    <div className="text-center mt-4 text-sm text-gray-400">
                      <p>Já tem uma conta? <Link to="/login" className="text-pink-400 hover:underline">Faça login</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;