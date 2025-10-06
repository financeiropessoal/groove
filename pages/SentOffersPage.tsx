import React, { useState, useEffect } from 'react';
import { useVenueAuth } from '../contexts/VenueAuthContext';
import { DirectOfferService, EnrichedDirectOffer } from '../services/DirectOfferService';
import EmptyState from '../components/EmptyState';
import { Link, useNavigate } from 'react-router-dom';

const SentOffersPage: React.FC = () => {
    const [offers, setOffers] = useState<EnrichedDirectOffer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { currentVenue } = useVenueAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (currentVenue) {
            DirectOfferService.getAllOffersForVenue(currentVenue.id).then(data => {
                setOffers(data);
                setIsLoading(false);
            });
        }
    }, [currentVenue]);

    const getStatusPill = (status: 'pending' | 'accepted' | 'declined' | 'countered') => {
        const styles = {
          pending: 'bg-yellow-500/20 text-yellow-400',
          accepted: 'bg-green-500/20 text-green-400',
          declined: 'bg-red-500/20 text-red-400',
          countered: 'bg-blue-500/20 text-blue-400',
        };
        const text = {
            pending: 'Pendente',
            accepted: 'Aceita',
            declined: 'Recusada',
            countered: 'Em Negociação',
        }
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>{text[status]}</span>;
    };

    if (isLoading) {
        return <div className="text-center py-12"><i className="fas fa-spinner fa-spin text-4xl text-pink-500"></i></div>;
    }

    return (
        <div>
            <div className="flex items-center gap-4 mb-6">
                <Link to="/venue-dashboard" className="text-gray-400 hover:text-white transition-colors" aria-label="Voltar ao painel">
                    <i className="fas fa-arrow-left text-2xl"></i>
                </Link>
                <h1 className="text-3xl font-bold">Propostas Enviadas</h1>
            </div>
            {offers.length > 0 ? (
                <div className="space-y-4">
                    {offers.map(offer => (
                        <div key={offer.id} className="bg-gray-800 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div>
                                <p className="text-sm text-gray-400">Para: <span className="font-bold text-white">{offer.artist?.name}</span></p>
                                <p className="text-lg">{new Date(offer.date + 'T00:00:00').toLocaleDateString('pt-BR')} - R$ {offer.payment.toFixed(2)}</p>
                            </div>
                            <div className="flex flex-col items-start sm:items-end gap-2">
                                {getStatusPill(offer.status)}
                                {(offer.status === 'pending' || offer.status === 'countered') && (
                                     <button onClick={() => navigate(`/negotiation/${offer.id}`)} className="text-sm text-pink-400 hover:underline">
                                        Acompanhar
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <EmptyState
                    icon="fa-paper-plane"
                    title="Nenhuma proposta enviada"
                    message="Encontre artistas e envie propostas diretas para agendar shows."
                >
                    <Link to="/artists" className="px-6 py-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white font-bold rounded-lg">
                        Encontrar Artistas
                    </Link>
                </EmptyState>
            )}
        </div>
    );
};

export default SentOffersPage;