import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useVenueAuth } from '../contexts/VenueAuthContext';

const VenueSignupPage: React.FC = () => {
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isFormValid, setIsFormValid] = useState(false);
    
    const [isLoading, setIsLoading] = useState(false);
    const [signupSuccessMessage, setSignupSuccessMessage] = useState('');
    
    const navigate = useNavigate();
    const location = useLocation();
    const { signup, isAuthenticated } = useVenueAuth();
    const from = location.state?.from || '/venue-dashboard';

    useEffect(() => {
        if (isAuthenticated) {
            sessionStorage.setItem('isNewUser', 'true');
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, from]);
    
    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        
        if (!name) newErrors.name = 'O nome do local é obrigatório.';
        if (!address) newErrors.address = 'O endereço é obrigatório.';
        if (!email) {
            newErrors.email = 'O email é obrigatório.';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Formato de email inválido.';
        }
        if (!phone) newErrors.phone = 'O telefone de contato é obrigatório.';

        if (!password) {
            newErrors.password = 'A senha é obrigatória.';
        } else if (password.length < 8) {
            newErrors.password = 'A senha deve ter no mínimo 8 caracteres.';
        }
        
        if (!confirmPassword) {
            newErrors.confirmPassword = 'A confirmação de senha é obrigatória.';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'As senhas não coincidem.';
        }

        setErrors(newErrors);
        setIsFormValid(Object.keys(newErrors).length === 0);
    };

    useEffect(() => {
        validateForm();
    }, [name, address, email, phone, password, confirmPassword]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        validateForm();
        
        if (!isFormValid || !agreedToTerms) return;

        setIsLoading(true);
        setSignupSuccessMessage('');
        setErrors({});
        
        const result = await signup({ name, address, email, password, contact: { name: '', phone } });
        
        setIsLoading(false);
        if (result.success) {
            if (result.requiresConfirmation) {
                setSignupSuccessMessage("Cadastro realizado! Verifique sua caixa de entrada para confirmar seu e-mail e poder fazer o login.");
            } else {
                setIsLoading(true);
            }
        } else {
            let userFriendlyError = result.error || "Não foi possível realizar o cadastro. Tente novamente.";
            if (userFriendlyError.includes("User already registered")) {
                userFriendlyError = "Este e-mail já está em uso. Tente fazer login ou use um e-mail diferente.";
            } else if (userFriendlyError.toLowerCase().includes("failed to fetch")) {
                userFriendlyError = "Falha na comunicação com o servidor. Verifique sua conexão com a internet e se a configuração do banco de dados está correta.";
            }
            setErrors({ form: userFriendlyError });
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link to="/" className="flex items-center justify-center space-x-3 mb-4">
                        <i className="fas fa-store text-red-500 text-4xl"></i>
                        <h1 className="text-3xl font-bold tracking-wider">Groove Music</h1>
                    </Link>
                    <h2 className="text-2xl font-bold text-gray-200">Cadastre seu Estabelecimento</h2>
                    <p className="text-gray-400">Encontre os melhores artistas para seus eventos.</p>
                </div>

                <div className="bg-gray-800 p-8 rounded-lg shadow-2xl">
                    {signupSuccessMessage ? (
                         <div className="text-center">
                            <i className="fas fa-paper-plane text-4xl text-green-400 mb-4"></i>
                            <h3 className="text-2xl font-bold text-white mb-2">Sucesso!</h3>
                            <p className="text-gray-300">{signupSuccessMessage}</p>
                            <Link to="/venue-login" className="mt-6 inline-block bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700">Ir para Login</Link>
                        </div>
                    ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Nome do Local</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className={`w-full bg-gray-900 border ${errors.name ? 'border-red-500' : 'border-gray-700'} rounded-md py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500`} placeholder="Ex: Bar do Zé" />
                            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Endereço</label>
                            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required className={`w-full bg-gray-900 border ${errors.address ? 'border-red-500' : 'border-gray-700'} rounded-md py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500`} placeholder="Ex: Rua das Flores, 123" />
                            {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Email de Contato</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={`w-full bg-gray-900 border ${errors.email ? 'border-red-500' : 'border-gray-700'} rounded-md py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500`} placeholder="contato@seudominio.com" />
                            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Telefone de Contato</label>
                            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="(XX) XXXXX-XXXX" className={`w-full bg-gray-900 border ${errors.phone ? 'border-red-500' : 'border-gray-700'} rounded-md py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500`} />
                            {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Senha</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className={`w-full bg-gray-900 border ${errors.password ? 'border-red-500' : 'border-gray-700'} rounded-md py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500`} placeholder="Mínimo 8 caracteres" />
                             {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Confirmar Senha</label>
                            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className={`w-full bg-gray-900 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-700'} rounded-md py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500`} placeholder="Repita sua senha" />
                            {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
                        </div>

                        <div className="pt-2">
                            <label className="flex items-start space-x-3">
                                <input
                                    type="checkbox"
                                    checked={agreedToTerms}
                                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                                    className="mt-1 h-4 w-4 rounded border-gray-600 bg-gray-700 text-red-600 focus:ring-red-500"
                                />
                                <span className="text-sm text-gray-300">
                                    Eu li e concordo com os <Link to="/terms" target="_blank" className="text-red-400 hover:underline">Termos de Serviço e Código de Conduta</Link> da plataforma.
                                </span>
                            </label>
                        </div>

                        {errors.form && <p className="text-red-400 text-sm text-center bg-red-900/50 p-3 rounded-md">{errors.form}</p>}

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading || !isFormValid || !agreedToTerms}
                                className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition-colors hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <><i className="fas fa-spinner fa-spin"></i><span>Cadastrando...</span></>
                                ) : ('Cadastrar Local')}
                            </button>
                        </div>
                        <div className="text-center mt-4 text-sm text-gray-400">
                            <p>Já é um contratante? <Link to="/venue-login" className="text-red-400 hover:underline">Entre aqui</Link>.</p>
                            <p className="mt-2">É um artista? <Link to="/signup" className="text-red-400 hover:underline">Cadastre-se aqui</Link></p>
                        </div>
                    </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VenueSignupPage;