import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const AdminLoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { adminLogin, isAdminAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAdminAuthenticated) {
            navigate('/admin/dashboard');
        }
    }, [isAdminAuthenticated, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await adminLogin(email, password);
        if (!success) {
            setError('Credenciais de admin inválidas.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-block mb-6">
                        <div className="flex items-center justify-center space-x-3">
                            <i className="fas fa-wave-square text-pink-500 text-4xl"></i>
                            <span className="text-3xl font-bold tracking-wider">Groove Music</span>
                        </div>
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-200">Admin Login</h1>
                </div>

                <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@example.com"
                            required
                            className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="********"
                            required
                            className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <button type="submit" className="w-full bg-pink-600 font-bold py-3 rounded-lg hover:bg-pink-700 transition-colors">
                        Entrar
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLoginPage;
