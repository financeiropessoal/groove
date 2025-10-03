import React, { useState, useEffect, useMemo } from 'react';
import { useVenueAuth } from '../contexts/VenueAuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { GigService, EnrichedGig } from '../services/GigService';
import { Artist } from '../data';
import { Rating } from '../types';
import EmptyState from '../components/EmptyState';
import RatingModal from '../components/RatingModal';
import { RatingService } from '../services/RatingService';
import { useToast } from '../contexts/ToastContext';
import OnboardingModal from '../components/OnboardingModal';
import ReportProblemModal from '../components/ReportProblemModal';
import { EnrichedBooking } from '../services/BookingService';
import { FavoriteService } from '../services/FavoriteService';
import ArtistCard from '../components/ArtistCard';

const StatCard: React.FC<{ title: string; value: string | number; icon: string; link?: string; linkText?: string; }> = ({ title, value, icon, link, linkText }) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="flex items-center">
            <div className="bg-red-600/20 p-3 rounded-full mr-4">
                <i className={`fas ${icon} text-red-400 text-xl`}></i>
            </div>
            <div>
                <p className="text-sm text-gray-400">{title}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
            </div>
        </div>
        {link && linkText && (
             <div className="mt-4 text-right">
                <Link to={link} className="text-sm font-semibold text-red-400 hover:text-red-300 transition-colors">
                    {linkText} <i className="fas fa-arrow-right ml-1"></i>
                </Link>
            </div>
        )}
    </div>
);

const VenueDashboardPage: React.FC = () => {
    const { currentVenue, authUser, logout } = useVenueAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [gigs, setGigs] = useState<EnrichedGig[]>([]);
    const [ratings, setRatings] = useState<Rating[]>([]);
    const [gigsToRate, setGigsToRate] = useState<EnrichedGig[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [itemToRate, setItemToRate] = useState<{ gig: EnrichedGig, artist: Artist } | null>(null);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [favoriteArtists, setFavoriteArtists] = useState<Artist[]>([]);
    
    const [showReportModal, setShowReportModal] = useState(false);
    // FIX: Use a state that holds an object compatible with the modal's expected props.
    const [bookingToReport, setBookingToReport] = useState<EnrichedBooking | null>(null);


    const fetchData = async () => {
        if (currentVenue && authUser) {
            setIsLoading(true);
            const [venueGigs, venueRatings, venueGigsToRate, fetchedFavorites] = await Promise.all([
                GigService.getGigsForVenue(currentVenue.id),
                RatingService.getRatingsForUser(currentVenue.id, 'venue'),
                RatingService.getGigsToRate(currentVenue.id, 'venue'),
                FavoriteService.getEnrichedFavoritesForVenue(authUser.id),
            ]);
            setGigs(venueGigs.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            setRatings(venueRatings);
            setGigsToRate(venueGigsToRate as EnrichedGig[]);
            setFavoriteArtists(fetchedFavorites);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!currentVenue || !authUser) {
            navigate('/venue-login');
            return;
        }

        const isNewUser = sessionStorage.getItem('isNewUser');
        if (isNewUser) {
            const onboardingKey = `onboarding-complete-venue-${currentVenue.id}`;
            if (!localStorage.getItem(onboardingKey)) {
                setShowOnboarding(true);
            }
            sessionStorage.removeItem('isNewUser');
        }

        fetchData();
    }, [currentVenue, authUser, navigate]);
    
     const handleOnboardingComplete = () => {
        if (currentVenue) {
            localStorage.setItem(`onboarding-complete-venue-${currentVenue.id}`, 'true');
        }
        setShowOnboarding(false);
    };
    
    const { upcomingGigs, pastGigs, openGigs, stats } = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcoming: EnrichedGig[] = [];
        const past: EnrichedGig[] = [];
        const open: EnrichedGig[] = [];
        let totalSpent = 0;

        gigs.forEach(gig => {
            const gigDate = new Date(`${gig.date}T00:00:00`);
            if (gig.status === 'open' && gigDate >= today) {
                open.push(gig);
            } else if (gig.status === 'booked') {
                if (gigDate >= today) {
                    upcoming.push(gig);
                } else {
                    past.push(gig);
                    totalSpent += gig.payment;
                }
            }
        });
        
        const avgCost = past.length > 0 ? totalSpent / past.length : 0;
        
        return { upcomingGigs: upcoming, pastGigs: past, openGigs: open, stats: { totalSpent, avgCost, totalShows: past.length } };
    }, [gigs]);

    const averageRating = useMemo(() => {
        if (ratings.length === 0) return "N/A";
        const total = ratings.reduce((sum, r) => sum + r.rating, 0);
        return (total / ratings.length).toFixed(1);
    }, [ratings]);

    const openRatingModal = (gig: EnrichedGig) => {
        if(gig.artist) {
            setItemToRate({ gig, artist: gig.artist });
            setShowRatingModal(true);
        }
    };

    const handleArtistClick = (artist: Artist) => {
        navigate(`/artists/${artist.id}`);
    };

    const handleRatingSubmit = async (rating: number, comment: string) => {
        if (itemToRate && currentVenue) {
            const success = await RatingService.createRating({
                gig_id: itemToRate.gig.id,
                rating,
                comment,
                rater_id: currentVenue.id,
                rater_type: 'venue',
                ratee_id: itemToRate.artist.id,
                ratee_type: 'artist'
            });
            if(success) {
                showToast("Qualificação enviada com sucesso!", 'success');
                fetchData();
            } else {
                showToast("Erro ao enviar qualificação.", 'error');
            }
        }
        setShowRatingModal(false);
        setItemToRate(null);
    };

    const handleOpenReportModal = (gig: EnrichedGig) => {
        // FIX: Map the EnrichedGig to an EnrichedBooking structure to match modal props.
        if (!gig.artist || !currentVenue) {
            showToast('Dados do show incompletos para gerar um relatório.', 'error');
            return;
        }
        setBookingToReport({
            id: gig.id,
            artistId: gig.artist.id,
            artistName: gig.artist.name,
            venueId: currentVenue.id,
            venueName: currentVenue.name,
            date: gig.date,
            planId: 0, // Not applicable for gig offers
            planName: 'Vaga Aberta',
            planPrice: gig.payment,
            status: 'paid', // Past gigs are implicitly paid/done
            payoutStatus: 'paid'
        });
        setShowReportModal(true);
    };


    if (isLoading || !currentVenue || !authUser) {
        return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><i className="fas fa-spinner fa-spin text-4xl text-red-500"></i></div>;
    }

    return (
        <>
        {showOnboarding && <OnboardingModal userType="venue" onClose={handleOnboardingComplete} />}
        <div className="min-h-screen bg-gray-900 text-white">
             <header className="bg-gray-800 shadow-md">
                 <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold tracking-wider">Painel do Contratante</h1>
                     <button onClick={logout} className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors">
                        <i className="fas fa-sign-out-alt"></i>
                        <span>Sair</span>
                     </button>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 space-y-8">
                <section>
                    <h2 className="text-3xl font-bold text-white mb-4">Bem-vindo, {currentVenue.name}!</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Link to="/artists" className="bg-red-600 hover:bg-red-700 p-6 rounded-lg text-center transition-transform transform hover:scale-105">
                            <i className="fas fa-search text-4xl mb-3"></i>
                            <p className="text-xl font-bold">Encontrar Artistas</p>
                        </Link>
                        <Link to="/offer-gig" className="bg-gray-800 hover:bg-gray-700 p-6 rounded-lg text-center transition-colors">
                            <i className="fas fa-bullhorn text-4xl mb-3 text-red-500"></i>
                            <p className="text-xl font-bold">Publicar uma Vaga</p>
                        </Link>
                        <Link to="/edit-venue-profile" className="bg-gray-800 hover:bg-gray-700 p-6 rounded-lg text-center transition-colors">
                            <i className="fas fa-store-alt text-4xl mb-3 text-red-500"></i>
                            <p className="text-xl font-bold">Editar Perfil do Local</p>
                        </Link>
                    </div>
                </section>
                
                <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard title="Total Investido" value={`R$ ${stats.totalSpent.toFixed(2).replace('.',',')}`} icon="fa-dollar-sign" />
                    <StatCard title="Shows Realizados" value={stats.totalShows} icon="fa-calendar-check" />
                    <StatCard title="Vagas em Aberto" value={openGigs.length} icon="fa-bullhorn" link="/offer-gig" linkText="Publicar Nova" />
                    <StatCard title="Sua Avaliação Média" value={averageRating} icon="fa-star" />
                </section>

                <section>
                    <h3 className="text-2xl font-bold text-white mb-4">Seus Artistas Favoritos</h3>
                    {favoriteArtists.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {favoriteArtists.map(artist => (
                                <ArtistCard key={artist.id} artist={artist} onSelect={handleArtistClick} />
                            ))}
                        </div>
                    ) : (
                        <EmptyState 
                            icon="fa-star" 
                            title="Nenhum artista favorito"
                            message="Quando você favoritar um artista, ele aparecerá aqui para acesso rápido."
                        />
                    )}
                </section>

                <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                         <h3 className="text-2xl font-bold text-white mb-4">Próximos Shows Agendados</h3>
                         {upcomingGigs.length > 0 ? (
                            <div className="space-y-3">
                                {upcomingGigs.map(gig => (
                                    <div key={gig.id} className="bg-gray-800/50 p-4 rounded-lg">
                                        <p className="font-semibold text-white">{new Date(`${gig.date}T00:00:00`).toLocaleDateString('pt-BR')} - <span className="text-red-400">{gig.artist?.name}</span></p>
                                        <p className="text-sm text-gray-400">{gig.artist?.genre.primary}</p>
                                    </div>
                                ))}
                            </div>
                         ) : (
                             <EmptyState icon="fa-calendar-alt" title="Nenhum show agendado" message="Encontre um artista ou publique uma vaga para começar." />
                         )}
                    </div>
                     <div>
                         <h3 className="text-2xl font-bold text-white mb-4">
                            <Link to="/sent-offers" className="hover:text-red-400 transition-colors">Propostas Enviadas <i className="fas fa-external-link-alt text-xs"></i></Link>
                         </h3>
                         <div className="bg-gray-800/50 p-4 rounded-lg">
                             <p className="text-gray-300">Acompanhe o status das propostas diretas que você enviou para os artistas.</p>
                              <Link to="/sent-offers" className="mt-3 inline-block text-sm font-semibold bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Ver Minhas Propostas</Link>
                         </div>
                    </div>
                </section>
                
                 <section>
                    <h3 className="text-2xl font-bold text-white mb-4">Histórico de Shows</h3>
                    {pastGigs.length > 0 ? (
                        <div className="bg-gray-800/50 rounded-lg overflow-hidden">
                             <table className="w-full text-sm text-left">
                                <thead className="bg-gray-800">
                                    <tr>
                                        <th className="p-3">Data</th>
                                        <th className="p-3">Artista</th>
                                        <th className="p-3">Cachê</th>
                                        <th className="p-3 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pastGigs.map(gig => {
                                        const gigIsRateable = gigsToRate.some(g => g.id === gig.id);
                                        return (
                                        <tr key={gig.id} className="border-t border-gray-700 hover:bg-gray-700/50">
                                            <td className="p-3">{new Date(`${gig.date}T00:00:00`).toLocaleDateString('pt-BR')}</td>
                                            <td className="p-3 font-semibold text-white">{gig.artist?.name}</td>
                                            <td className="p-3">R$ {gig.payment.toFixed(2).replace('.',',')}</td>
                                            <td className="p-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {gig.artist && gigIsRateable && (
                                                        <button onClick={() => openRatingModal(gig)} className="text-xs font-semibold bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700">
                                                            Qualificar
                                                        </button>
                                                    )}
                                                     <button onClick={() => handleOpenReportModal(gig)} className="text-xs font-semibold bg-yellow-600 text-white px-3 py-1.5 rounded-md hover:bg-yellow-700">
                                                        Relatar Problema
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )})}
                                </tbody>
                             </table>
                        </div>
                    ) : <EmptyState icon="fa-history" title="Nenhum show realizado ainda" message="Shows passados aparecerão aqui." />}
                </section>
            </main>
        </div>
        {itemToRate && (
            <RatingModal 
                isOpen={showRatingModal}
                onClose={() => setShowRatingModal(false)}
                onSubmit={handleRatingSubmit}
                itemToRate={{ name: itemToRate.artist.name, type: 'o artista'}}
            />
        )}
        {bookingToReport && (
            <ReportProblemModal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                booking={bookingToReport}
                reporter={{ id: authUser.id, type: 'venue' }}
            />
        )}
        </>
    );
};

export default VenueDashboardPage;
