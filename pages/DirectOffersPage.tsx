import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DirectOfferService, EnrichedDirectOffer } from '../services/DirectOfferService';
import { useToast } from '../contexts/ToastContext';
import EmptyState from '../components/EmptyState';

const DirectOffersPage: React.FC = () => {
  const [offers, setOffers] = useState<EnrichedDirectOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'new' | 'negotiating' | 'history'>('new');
  const { artist } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (artist) {
      DirectOfferService.getAllOffersForArtist(artist.id).then(data => {
        setOffers(data);
        setIsLoading(false);
      });
    }
  }, [artist]);
  
  const filteredOffers = useMemo(() => {
    switch (activeTab) {
      case 'new':
        return offers.filter(o => o.status === 'pending');
      case 'negotiating':
        return offers.filter(o => o.status === 'countered');
      case 'history':
        return offers.filter(o => o.status === 'accepted' || o.status === 'declined');
      default:
        return [];
    }
  }, [offers, activeTab]);

  const getStatusPill = (status: 'pending' | 'accepted' | 'declined' | 'countered') => {
    const styles = {
      pending: 'bg-yellow-500/20 text-yellow-400',
      accepted: 'bg-green-500/20 text-green-400',
      declined: 'bg-red-500/20 text-red-400',
      countered: 'bg-blue-500/20 text-blue-400',
    };
    const text = {
        pending: 'Nova Proposta',
        accepted: 'Aceita',
        declined: 'Recusada',
        countered: 'Em Negociação'
    }
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>{text[status]}</span>;
  };
  
  const TabButton: React.FC<{tab: 'new' | 'negotiating' | 'history', label: string}> = ({tab, label}) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${activeTab === tab ? 'bg-gray-800 text-white' : 'bg-gray-900 text-gray-400 hover:bg-gray-800/50'}`}
    >
        {label}
    </button>
  );

  if (isLoading) {
    return <div className="text-center py-12"><i className="fas fa-spinner fa-spin text-4xl text-pink-500"></i></div>;
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
          <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors" aria-label="Voltar ao painel">
              <i className="fas fa-arrow-left text-2xl"></i>
          </Link>
          <h1 className="text-3xl font-bold">Propostas Diretas Recebidas</h1>
      </div>

      <div className="border-b border-gray-700 mb-6">
        <nav className="flex gap-2">
            <TabButton tab="new" label="Novas" />
            <TabButton tab="negotiating" label="Em Negociação" />
            <TabButton tab="history" label="Histórico" />
        </nav>
      </div>

      {filteredOffers.length > 0 ? (
        <div className="space-y-4">
          {filteredOffers.map(offer => (
            <div key={offer.id} className="bg-gray-800 p-4 rounded-lg">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                        <h2 className="font-bold text-lg text-white">{offer.venue.name}</h2>
                        <p className="text-sm text-gray-300">{new Date(offer.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}</p>
                        <p className="text-xl font-bold text-green-400 mt-1">R$ {offer.payment.toFixed(2)}</p>
                    </div>
                     <div className="flex flex-col items-start sm:items-end gap-2">
                        {getStatusPill(offer.status)}
                        {(offer.status === 'pending' || offer.status === 'countered') && (
                          <button onClick={() => navigate(`/negotiation/${offer.id}`)} className="mt-2 bg-pink-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-pink-700">
                            Ver e Negociar
                          </button>
                        )}
                     </div>
                </div>
                 {offer.message && <p className="text-sm text-gray-400 mt-2 italic border-l-2 border-gray-600 pl-3">"{offer.message}"</p>}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
            icon="fa-envelope-open-text"
            title="Nenhuma proposta nesta seção"
            message="Quando você receber novas propostas ou iniciar negociações, elas aparecerão aqui."
        />
      )}
    </div>
  );
};

export default DirectOffersPage;