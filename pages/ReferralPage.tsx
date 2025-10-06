import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { ReferralService, ReferralStats } from '../services/ReferralService';
import { Referral } from '../types';
import { getBaseUrl } from '../utils/url';

const StatCard: React.FC<{ icon: string; title: string; value: string | number; color: string; }> = ({ icon, title, value, color }) => (
    <div className="bg-gray-800 p-6 rounded-lg flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
            <i className={`fas ${icon} text-xl`}></i>
        </div>
        <div>
            <p className="text-gray-400 text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    </div>
);


const ReferralPage: React.FC = () => {
    const { artist } = useAuth();
    const { showToast } = useToast();
    const [stats, setStats] = useState<ReferralStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const referralLink = useMemo(() => {
        if (!artist) return '';
        const baseUrl = getBaseUrl();
        return `${baseUrl}#/signup?ref=${artist.id}`;
    }, [artist]);

    useEffect(() => {
        if (artist) {
            ReferralService.getReferralStats(artist.id).then(data => {
                setStats(data);
                setIsLoading(false);
            });
        }
    }, [artist]);

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        showToast('Link de convite copiado!', 'success');
    };
    
    const proStatus = useMemo(() => {
        if (!artist) return { isActive: false, message: 'Status indisponível' };
        if (artist.pro_subscription_ends_at) {
            const endDate = new Date(artist.pro_subscription_ends_at);
            if (endDate > new Date()) {
                return {
                    isActive: true,
                    message: `Seu acesso PRO (via indicação) é válido até ${endDate.toLocaleDateString('pt-BR')}.`,
                };
            }
        }
        if (artist.is_pro && !artist.pro_subscription_ends_at) {
             return { isActive: true, message: 'Você tem uma assinatura PRO ativa.' };
        }
        return { isActive: false, message: 'Você não tem um plano PRO ativo via indicações.' };
    }, [artist]);


    if (isLoading || !artist || !stats) {
        return <div className="text-center py-12"><i className="fas fa-spinner fa-spin text-4xl text-pink-500"></i></div>;
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors" aria-label="Voltar ao painel">
                    <i className="fas fa-arrow-left text-2xl"></i>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold">Indique e Ganhe</h1>
                    <p className="text-gray-400">Convide outros artistas para a plataforma e ganhe 1 mês de PRO para cada um que se tornar assinante.</p>
                </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg mb-8">
                <h2 className="text-xl font-bold mb-4">Seu Link de Convite</h2>
                <div className="flex flex-col sm:flex-row gap-2">
                    <input
                        type="text"
                        readOnly
                        value={referralLink}
                        className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-4 text-gray-300"
                    />
                    <button onClick={handleCopy} className="bg-pink-600 font-bold py-2 px-6 rounded-lg whitespace-nowrap">
                        Copiar Link
                    </button>
                </div>
                <p className={`text-sm mt-4 p-3 rounded-md ${proStatus.isActive ? 'bg-green-800/50 text-green-300' : 'bg-yellow-800/50 text-yellow-300'}`}>
                    <i className={`fas ${proStatus.isActive ? 'fa-check-circle' : 'fa-info-circle'} mr-2`}></i>
                    {proStatus.message}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <StatCard icon="fa-users" title="Total de Indicados" value={stats.totalReferrals} color="bg-blue-500/30" />
                <StatCard icon="fa-rocket" title="Conversões para PRO" value={stats.proConversions} color="bg-green-500/30" />
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-4">Seus Indicados</h2>
                {stats.referrals.length > 0 ? (
                    <ul className="space-y-3">
                        {stats.referrals.map((ref, index) => (
                            <li key={index} className="flex justify-between items-center bg-gray-900/50 p-3 rounded-md">
                                <div>
                                    <p className="font-semibold">{ref.name}</p>
                                    <p className="text-xs text-gray-500">Cadastrado em: {ref.date}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${ref.status === 'Virou PRO' ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-300'}`}>
                                    {ref.status}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-400 text-center py-8">Você ainda não indicou nenhum artista.</p>
                )}
            </div>
        </div>
    );
};

export default ReferralPage;
