import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useVenueAuth } from '../contexts/VenueAuthContext';
import { Artist, Plan } from '../data';
import { ArtistService } from '../services/ArtistService';
import { useToast } from '../contexts/ToastContext';
import PlanCard from '../components/PlanCard';
import PaymentModal from '../components/PaymentModal';

const BookingPage: React.FC = () => {
    const { id: artistId } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const { artist: currentArtist, authUser: artistAuthUser } = useAuth();
    const { currentVenue, isAuthenticated: isVenueAuthenticated } = useVenueAuth();

    const [artist, setArtist] = useState<Artist | null>(null);
    const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isBooking, setIsBooking] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    const dates = useMemo(() => searchParams.get('dates')?.split(',') || [], [searchParams]);

    useEffect(() => {
        if (!artistId) {
            navigate('/artists');
            return;
        }
        const fetchArtist = async () => {
            setIsLoading(true);
            const viewerId = currentVenue?.id;
            const fetchedArtist = await ArtistService.getArtistById(artistId, viewerId);
            if (fetchedArtist) {
                setArtist(fetchedArtist);
            } else {
                showToast('Artista não encontrado.', 'error');
                navigate('/artists');
            }
            setIsLoading(false);
        };
        fetchArtist();
    }, [artistId, navigate, showToast, currentVenue]);

    const handleConfirmBooking = async () => {
        if (!artist || !currentVenue || selectedPlanId === null || dates.length === 0) {
            showToast('Informações incompletas para a reserva.', 'error');
            return;
        }

        setIsBooking(true);
        setIsPaymentModalOpen(true);
    };
    
    const handlePaymentSuccess = () => {
        setIsPaymentModalOpen(false);
        showToast('Reserva confirmada e paga com sucesso!', 'success');
        navigate('/venue-dashboard');
    };
    
    if (isLoading || !artist) {
        return <div className="text-center py-12"><i className="fas fa-spinner fa-spin text-4xl text-pink-500"></i></div>;
    }

    const selectedPlan = artist.plans?.find(p => p.id === selectedPlanId);
    const totalCost = selectedPlan ? selectedPlan.price * dates.length : 0;

    return (
        <>
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition-colors" aria-label="Voltar">
                        <i className="fas fa-arrow-left text-2xl"></i>
                    </button>
                    <h1 className="text-3xl font-bold">Confirmar Reserva</h1>
                </div>
                <p className="text-lg text-gray-400 mb-8">Você está contratando <span className="font-bold text-pink-400">{artist.name}</span>.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold mb-4">1. Escolha o Pacote</h2>
                            <div className="space-y-4">
                                {artist.plans?.map(plan => (
                                    <PlanCard
                                        key={plan.id}
                                        plan={plan}
                                        isSelected={selectedPlanId === plan.id}
                                        onSelect={() => setSelectedPlanId(plan.id)}
                                        isVenueAuthenticated={isVenueAuthenticated}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-gray-800 p-6 rounded-lg self-start sticky top-24">
                        <h2 className="text-2xl font-bold mb-4">2. Resumo e Pagamento</h2>
                        <div className="space-y-3 text-gray-300">
                            <div className="flex justify-between"><span>Artista:</span> <span className="font-semibold text-white">{artist.name}</span></div>
                            <div className="flex justify-between"><span>Datas:</span> <span className="font-semibold text-white">{dates.length} data{dates.length > 1 ? 's' : ''}</span></div>
                            <ul className="text-sm text-right">
                            {dates.map(d => <li key={d}>{new Date(`${d}T00:00:00`).toLocaleDateString('pt-BR')}</li>)}
                            </ul>
                            <div className="flex justify-between"><span>Pacote:</span> <span className="font-semibold text-white">{selectedPlan?.name || 'Nenhum selecionado'}</span></div>
                        </div>
                        
                        <div className="mt-6 pt-6 border-t border-gray-700">
                            <div className="flex justify-between items-center text-2xl font-bold">
                                <span>Total:</span>
                                <span className="text-green-400">R$ {totalCost.toFixed(2).replace('.', ',')}</span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <p className="text-xs text-gray-500 text-center mb-4">Ao confirmar, você concorda com nossos Termos de Serviço. O pagamento será processado de forma segura.</p>
                            <button
                                onClick={handleConfirmBooking}
                                disabled={!selectedPlanId || isBooking}
                                className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold py-3 px-6 rounded-lg transition-shadow hover:shadow-[0_0_20px_rgba(16,185,129,0.7)] disabled:from-gray-600 disabled:to-gray-600 disabled:shadow-none disabled:cursor-not-allowed"
                            >
                                {isBooking ? <><i className="fas fa-spinner fa-spin mr-2"></i>Aguarde...</> : 'Confirmar e Pagar'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {isPaymentModalOpen && artist && currentVenue && selectedPlanId !== null && (
                <PaymentModal
                    isOpen={isPaymentModalOpen}
                    onClose={() => {
                        setIsPaymentModalOpen(false);
                        setIsBooking(false);
                    }}
                    totalCost={totalCost}
                    onPaymentSuccess={handlePaymentSuccess}
                    bookingPayload={{
                        artistId: artist.id,
                        venueId: currentVenue.id,
                        planId: selectedPlanId,
                        dates: dates,
                    }}
                />
            )}
        </>
    );
};

export default BookingPage;