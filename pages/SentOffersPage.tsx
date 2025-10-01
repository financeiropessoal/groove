import React, { useState, useEffect, useMemo } from 'react';
import { useVenueAuth } from '../contexts/VenueAuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { DirectOfferService, EnrichedDirectOffer } from '../services/DirectOfferService';
import EmptyState from '../components/EmptyState';
import { useToast } from '../contexts/ToastContext';

type StatusFilter = 'all' | 'pending' | 'accepted' | 'declined';

const SentOffersPage: React.FC = () => {
    const { currentVenue, logout } = useVenueAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [offers, setOffers] = useState<EnrichedDirectOffer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<StatusFilter>('all');

    const fetchOffers = async () => {
        if (currentVenue) {
            setIsLoading(true);
            const data = await DirectOfferService.getAllOffersForVenue(currentVenue.id);
            setOffers(data);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!currentVenue) {
            navigate('/venue-login');
            return;
        }
        fetchOffers();
    }, [currentVenue, navigate]);

    const filteredOffers = useMemo(() => {
        if (filter === 'all') return offers;
        return offers.filter(o => o.status === filter);
    }, [offers, filter]);

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

    if (isLoading || !currentVenue) {
        return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><i className="fas fa-spinner fa-spin text-4xl text-red-500"></i></div>;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <header className="bg-gray-800 shadow-md">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <Link to="/venue-dashboard" className="text-gray-300 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-700">
                            <i className="fas fa-arrow-left"></i>
                        </Link>
                        <h1 className="text-xl font-bold tracking-wider">Propostas Enviadas</h1>
                    </div>
                    <button onClick={logout} className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors">
                        <i className="fas fa-sign-out-alt"></i>
                        <span>Sair</span>
                    </button>
                </div>
            </header>
            
            <main className="container mx-auto px-4 py-8">
                <div className="bg-gray-800/50 p-4 rounded-lg flex flex-wrap gap-2 mb-6">
                    <FilterButton status="all" label="Todas" count={offers.length} />
                    <FilterButton status="pending" label="Pendentes" count={offers.filter(o => o.status === 'pending').length} />
                    <FilterButton status="accepted" label="Aceitas" count={offers.filter(o => o.status === 'accepted').length} />
                    <FilterButton status="declined" label="Recusadas" count={offers.filter(o => o.status === 'declined').length} />
                </div>

                {filteredOffers.length > 0 ? (
                    <div className="space-y-4">
                        {filteredOffers.map(offer => (
                            <div key={offer.id} className="bg-gray-800 p-5 rounded-lg shadow-lg">
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-xl font-bold text-white">
                                                <Link to={`/artists/${offer.artistId}`} className="hover:text-red-400 transition-colors">{offer.artist?.name}</Link>
                                            </h3>
                                            <StatusBadge status={offer.status} />
                                        </div>
                                        <p className="text-sm text-gray-400">{new Date(offer.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })} • {offer.startTime} - {offer.endTime}</p>
                                    </div>
                                    <div className="w-full sm:w-auto text-left sm:text-right flex-shrink-0">
                                        <p className="text-2xl font-bold text-green-400">R$ {offer.payment.toFixed(2).replace('.', ',')}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon="fa-paper-plane"
                        title="Nenhuma proposta encontrada"
                        message={filter === 'all' ? "Você ainda não enviou nenhuma proposta direta. Encontre artistas para começar!" : "Não há propostas com este status."}
                    >
                         <Link to="/artists" className="mt-4 inline-block bg-red-600 text-white font-bold py-2 px-5 rounded-md hover:bg-red-700 transition-colors">
                            Encontrar Artistas
                        </Link>
                    </EmptyState>
                )}
            </main>
        </div>
    );
};

export default SentOffersPage;