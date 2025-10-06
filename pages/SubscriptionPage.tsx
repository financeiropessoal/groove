
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProBenefitsModal from '../components/ProBenefitsModal';

const SubscriptionPage: React.FC = () => {
    const { artist } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSubscribe = () => {
        // In a real app, this would redirect to a payment gateway like Stripe or Mercado Pago.
        // For this demo, we'll just simulate the upgrade.
        alert('Simulando processo de assinatura... Recarregue a página para ver o acesso PRO.');
    };

    return (
        <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
                <i className="fas fa-rocket text-5xl text-yellow-400"></i>
                <h1 className="text-5xl font-bold">Torne-se PRO!</h1>
            </div>
            <p className="text-lg text-gray-300 mb-8">Desbloqueie ferramentas poderosas para impulsionar sua carreira.</p>

            <div className="bg-gray-800 p-8 rounded-lg shadow-2xl border-2 border-yellow-500/50">
                <h2 className="text-3xl font-bold text-white mb-6">Acesso Imediato a Ferramentas Exclusivas</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                    <Benefit icon="fa-chart-line" title="Análise de Perfil" description="Entenda quem busca seu perfil, quais termos usam e quais contratantes estão mais ativos." />
                    <Benefit icon="fa-wallet" title="Controle Financeiro" description="Gerencie seus cachês, despesas e veja o balanço da sua carreira de forma simples." />
                    <Benefit icon="fa-tags" title="Preços para Clientes Especiais" description="Fidelize parceiros oferecendo preços customizados para pacotes de shows." />
                    <Benefit icon="fa-magic" title="Gerador de Posts com IA" description="Crie posts para suas redes sociais em segundos para divulgar seus shows e engajar seu público." />
                </div>

                <div className="mt-10">
                    <p className="text-4xl font-bold text-white">R$ 19,90<span className="text-lg font-normal text-gray-400">/mês</span></p>
                    <button 
                        onClick={handleSubscribe} 
                        className="mt-6 w-full max-w-sm bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold py-4 px-8 rounded-lg text-xl transition-transform transform hover:scale-105"
                    >
                        Assinar Agora e Crescer
                    </button>
                    <p className="text-xs text-gray-500 mt-2">Cancele quando quiser.</p>
                </div>
            </div>
            
            <button onClick={() => setIsModalOpen(true)} className="mt-8 text-pink-400 hover:underline">
                Ver todos os benefícios em detalhe
            </button>

            <ProBenefitsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

const Benefit: React.FC<{ icon: string; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="flex items-start gap-4 p-4 bg-gray-900/50 rounded-lg">
        <i className={`fas ${icon} text-2xl text-yellow-400 mt-1`}></i>
        <div>
            <h3 className="font-semibold text-white">{title}</h3>
            <p className="text-sm text-gray-400">{description}</p>
        </div>
    </div>
);

export default SubscriptionPage;
