import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
// FIX: Using EnrichedGig from GigService which has an optional venue property, matching the service's return type.
import { GigService, EnrichedGig } from '../services/GigService';
import { GigOffer, Venue } from '../data';
import EmptyState from '../components/EmptyState';
import { useToast } from '../contexts/ToastContext';

// FIX: This interface was causing a type conflict with EnrichedGig. Removed in favor of the imported type.
// interface EnrichedGigOffer extends GigOffer {
//     venue: Venue | undefined;
// }

const OpenGigsPage: React.FC = () => {
    const { artist, logout } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();

    // FIX: Changed state to use EnrichedGig[] to match the service response type.
    const [gigs, setGigs] = useState<EnrichedGig[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [bookingGigId, setBookingGigId] = useState<number | null>(null);

    useEffect(() => {
        const fetchGigs = async () => {
            setIsLoading(true);
            const openGigs = await GigService.getAllOpenGigs();
            // FIX: This line had the type error. Now types match. Also, filter out gigs without a venue for safety.
            setGigs(openGigs.filter(g => g.venue));
            setIsLoading(false);
        };
        fetchGigs();
    }, []);

    // FIX: Changed parameter type to EnrichedGig to match the state.
    const handleBookGig = async (gig: EnrichedGig) => {
        if (!artist) return;
        
        if (window.confirm(`Você confirma que deseja reservar o show no ${gig.venue?.name} para ${new Date(gig.date + 'T00:00:00').toLocaleDateString('pt-BR')}?`)) {
            setBookingGigId(gig.id);
            const success = await GigService.bookGig(gig.id, artist.id);
            if (success) {
                showToast("Show reservado com sucesso! O contratante será notificado.", 'success');
                setGigs(prevGigs => prevGigs.filter(g => g.id !== gig.id));
            } else {
                showToast("Erro ao reservar o show. A vaga pode já ter sido preenchida.", 'error');
            }
            setBookingGigId(null);
        }
    };
    
    if (!artist) {
        return null; // Protected route handles redirect
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <header className="bg-gray-800 shadow-md">
                 <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                         <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-700">
                             <i className="fas fa-arrow-left"></i>
                         </Link>
                        <h1 className="text-xl font-bold tracking-wider">Oportunidades de Shows</h1>
                    </div>
                     <button onClick={logout} className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors">
                        <i className="fas fa-sign-out-alt"></i>
                        <span>Sair</span>
                     </button>
                </div>
            </header>
            
            <main className="container mx-auto px-4 py-8">
                {isLoading ? (
                    <div className="text-center py-10"><i className="fas fa-spinner fa-spin text-3xl text-red-500"></i><p className="mt-3 text-gray-400">Buscando vagas...</p></div>
                ) : gigs.length > 0 ? (
                    <div className="space-y-6">
                        {gigs.map(gig => (
                            <div key={gig.id} className="bg-gray-800 p-5 rounded-lg shadow-lg flex flex-col md:flex-row items-start gap-4">
                                <div className="flex-grow">
                                    <h3 className="text-xl font-bold text-white">{gig.venue?.name}</h3>
                                    <p className="text-sm text-gray-400"><i className="fas fa-map-marker-alt mr-2"></i>{gig.venue?.address}</p>
                                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                                        <span className="font-semibold text-gray-300"><i className="fas fa-calendar-alt mr-2 text-red-400"></i>{new Date(gig.date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</span>
                                        <span className="font-semibold text-gray-300"><i className="fas fa-clock mr-2 text-red-400"></i>{gig.startTime} - {gig.endTime}</span>
                                        <span className="font-semibold text-gray-300"><i className="fas fa-music mr-2 text-red-400"></i>{gig.genre}</span>
                                    </div>
                                    {gig.notes && <p className="text-xs text-gray-300 mt-3 bg-gray-900/50 p-2 rounded-md italic">"{gig.notes}"</p>}
                                </div>
                                <div className="w-full md:w-auto flex-shrink-0 text-center md:text-right mt-4 md:mt-0">
                                    <p className="text-gray-300 text-sm">Cachê Oferecido</p>
                                    <p className="text-3xl font-bold text-green-400">R$ {gig.payment.toFixed(2).replace('.', ',')}</p>
                                    <button
                                        onClick={() => handleBookGig(gig)}
                                        disabled={bookingGigId === gig.id}
                                        className="w-full md:w-auto mt-3 bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition-colors hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-wait flex items-center justify-center gap-2"
                                    >
                                        {bookingGigId === gig.id ? (
                                            <><i className="fas fa-spinner fa-spin"></i>Reservando...</>
                                        ) : (
                                            'Tenho Interesse'
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon="fa-store-slash"
                        title="Nenhuma vaga aberta no momento"
                        message="Volte mais tarde para conferir novas oportunidades publicadas pelos contratantes."
                    />
                )}
            </main>
        </div>
    );
};

export default OpenGigsPage;
