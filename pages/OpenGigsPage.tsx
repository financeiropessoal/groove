import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { GigService, EnrichedGig } from '../services/GigService';
import { useToast } from '../contexts/ToastContext';
import EmptyState from '../components/EmptyState';
import { Link } from 'react-router-dom';

const OpenGigsPage: React.FC = () => {
  const [gigs, setGigs] = useState<EnrichedGig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { artist } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    GigService.getAllOpenGigs().then(data => {
      setGigs(data);
      setIsLoading(false);
    });
  }, []);

  const handleBookGig = async (gigId: number) => {
    if (!artist) return;
    const success = await GigService.bookGig(gigId, artist.id);
    if (success) {
      showToast('Show reservado com sucesso!', 'success');
      setGigs(prev => prev.filter(g => g.id !== gigId));
    } else {
      showToast('Não foi possível reservar o show. A vaga pode já ter sido preenchida.', 'error');
    }
  };

  if (isLoading) {
    return <div className="text-center py-12"><i className="fas fa-spinner fa-spin text-4xl text-pink-500"></i></div>;
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
          <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors" aria-label="Voltar ao painel">
              <i className="fas fa-arrow-left text-2xl"></i>
          </Link>
          <h1 className="text-3xl font-bold">Oportunidades Abertas</h1>
      </div>
      {gigs.length > 0 ? (
        <div className="space-y-4">
          {gigs.map(gig => (
            <div key={gig.id} className="bg-gray-800 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="flex items-center gap-4">
                <img src={gig.venue?.imageUrl} alt={gig.venue?.name} className="w-16 h-16 object-cover rounded-md hidden sm:block" />
                <div>
                  <h2 className="font-bold text-lg text-white">{gig.venue?.name}</h2>
                  <p className="text-sm text-gray-300">{new Date(gig.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                  <p className="text-xs text-gray-400">{gig.startTime} - {gig.endTime}</p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xl font-bold text-green-400">R$ {gig.payment.toFixed(2)}</p>
                <button onClick={() => handleBookGig(gig.id)} className="mt-2 bg-pink-600 text-white px-4 py-1 rounded text-sm font-semibold hover:bg-pink-700">
                  Tenho Interesse
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="fa-calendar-times"
          title="Nenhuma vaga aberta no momento"
          message="Fique de olho! Novas oportunidades podem surgir a qualquer momento. Certifique-se de que seu perfil está completo para não perder nenhuma chance."
        >
          <Link to="/edit-profile" className="px-6 py-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white font-bold rounded-lg">
            Atualizar meu Perfil
          </Link>
        </EmptyState>
      )}
    </div>
  );
};

export default OpenGigsPage;