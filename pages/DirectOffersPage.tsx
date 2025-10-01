import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { DirectOfferService, EnrichedDirectOffer } from '../services/DirectOfferService';
import EmptyState from '../components/EmptyState';
import { useToast } from '../contexts/ToastContext';

type StatusFilter = 'all' | 'pending' | 'accepted' | 'declined';

const DirectOffersPage: React.FC = () => {
    const { artist, logout } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [offers, setOffers] = useState<EnrichedDirectOffer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<StatusFilter>('pending');
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    const fetchOffers = async () => {
        if (artist) {
            setIsLoading(true);
            const data = await DirectOfferService.getAllOffersForArtist(artist.id);
            setOffers(data);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!artist) {
            navigate('/login');
            return;
        }
        fetchOffers();
    }, [artist, navigate]);

    const filteredOffers = useMemo(() => {
        if (filter === 'all') return offers;
        return offers.filter(o => o.status === filter);
    }, [offers, filter]);

    const handleAcceptOffer = async (offer: EnrichedDirectOffer) => {
        if (window.confirm(`Confirmar show no ${offer.venue.name} em ${new Date(offer.date + 'T00:00:00').toLocaleDateString('pt-BR')}?`)) {
            setActionLoading(offer.id);
            const success = await DirectOfferService.acceptOffer(offer);
            if (success) {
                showToast("Show confirmado com sucesso!", 'success');
                fetchOffers(); // Refresh the list
            } else {
                showToast("Erro ao confirmar o show. A data pode ter entrado em conflito.", 'error');
            }
            setActionLoading(null);
        }
    };
    
    const handleDeclineOffer = async (offerId: number) => {
        if (window.confirm("Tem certeza que deseja recusar esta proposta?")) {
            setActionLoading(offerId);
            const success = await DirectOfferService.updateOfferStatus(offerId, 'declined');
            if (success) {
                showToast("Proposta recusada.", 'success');
                fetchOffers(); // Refresh the list
            } else {
                showToast("Erro ao recusar proposta.", 'error');
            }
            setActionLoading(null);
        }
    };

    const StatusBadge: React.FC<{ status: 'pending' | 'accepted' | 'declined' }> = ({ status }) => {
        const config = {
            pending: { text: 'Pendente', class: 'bg-yellow-800 text-yellow-200' },
            accepted: { text: 'Aceita', class: 'bg-green-800 text-green-200' },
            declined: { text: 'Recusada', class: 'bg-red-800 text-red-200' },
        };
        const { text, class: className } = config[status];
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${className}`}>{text}</span>;
    };

    const FilterButton: React.FC<{ status: StatusFilter, label: string, count: number }> = ({ status, label, count }) => (
        <button
            onClick={() => setFilter(status)}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${filter === status ? 'bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
        >
            {label} <span className="text-xs opacity-70">({count})</span>
        </button>
    );

    if (isLoading || !artist) {
        return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><i className="fas fa-spinner fa-spin text-4xl text-red-500"></i></div>;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <header className="bg-gray-800 shadow-md">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-700">
                            <i className="fas fa-arrow-left"></i>
                        </Link>
                        <h1 className="text-xl font-bold tracking-wider">Minhas Propostas</h1>
                    </div>
                    <button onClick={logout} className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors">
                        <i className="fas fa-sign-out-alt"></i>
                        <span>Sair</span>
                    </button>
                </div>
            </header>
            
            <main className="container mx-auto px-4 py-8">
                <div className="bg-gray-800/50 p-4 rounded-lg flex flex-wrap gap-2 mb-6">
                    <FilterButton status="pending" label="Pendentes" count={offers.filter(o => o.status === 'pending').length} />
                    <FilterButton status="accepted" label="Aceitas" count={offers.filter(o => o.status === 'accepted').length} />
                    <FilterButton status="declined" label="Recusadas" count={offers.filter(o => o.status === 'declined').length} />
                    <FilterButton status="all" label="Todas" count={offers.length} />
                </div>

                {filteredOffers.length > 0 ? (
                    <div className="space-y-4">
                        {filteredOffers.map(offer => (
                            <div key={offer.id} className="bg-gray-800 p-5 rounded-lg shadow-lg">
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-xl font-bold text-white">{offer.venue.name}</h3>
                                            <StatusBadge status={offer.status} />
                                        </div>
                                        <p className="text-sm text-gray-400">{new Date(offer.date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })} • {offer.startTime} - {offer.endTime}</p>
                                        {offer.message && <p className="text-xs italic text-gray-300 mt-2 bg-gray-900/50 p-2 rounded">"{offer.message}"</p>}
                                    </div>
                                    <div className="w-full sm:w-auto text-left sm:text-right flex-shrink-0">
                                        <p className="text-2xl font-bold text-green-400">R$ {offer.payment.toFixed(2).replace('.', ',')}</p>
                                    </div>
                                </div>
                                {offer.status === 'pending' && (
                                    <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-gray-700">
                                        <button 
                                            onClick={() => handleDeclineOffer(offer.id)}
                                            disabled={actionLoading === offer.id}
                                            className="px-4 py-2 text-sm font-semibold bg-gray-600 hover:bg-gray-500 rounded-md transition-colors disabled:opacity-50"
                                        >
                                            {actionLoading === offer.id ? <i className="fas fa-spinner fa-spin"></i> : 'Recusar'}
                                        </button>
                                        <button 
                                            onClick={() => handleAcceptOffer(offer)}
                                            disabled={actionLoading === offer.id}
                                            className="px-4 py-2 text-sm font-semibold bg-green-600 hover:bg-green-700 rounded-md transition-colors disabled:opacity-50"
                                        >
                                           {actionLoading === offer.id ? <i className="fas fa-spinner fa-spin"></i> : 'Aceitar'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon="fa-inbox"
                        title="Nenhuma proposta encontrada"
                        message={filter === 'pending' ? "Você não tem nenhuma proposta pendente no momento." : "Não há propostas com este status."}
                    />
                )}
            </main>
        </div>
    );
};

export default DirectOffersPage;