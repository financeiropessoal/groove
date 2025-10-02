import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { BookingService, EnrichedBooking } from '../services/BookingService';
import { DirectOfferService, EnrichedDirectOffer } from '../services/DirectOfferService';
import { GigService, EnrichedGig } from '../services/GigService';
import { GoogleGenAI } from '@google/genai';
import EmptyState from '../components/EmptyState';
import OnboardingModal from '../components/OnboardingModal';
import { RatingService } from '../services/RatingService';
// FIX: The 'Rating' type is defined in 'types.ts', not 'data.ts'.
import { Venue } from '../data';
import { Rating } from '../types';
import RatingModal from '../components/RatingModal';
import { useToast } from '../contexts/ToastContext';
import ReportProblemModal from '../components/ReportProblemModal';

const StatCard: React.FC<{ title: string; value: string | number; icon: string; link?: string; linkText?: string }> = ({ title, value, icon, link, linkText }) => (
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

const ArtistDashboardPage: React.FC = () => {
    const { artist, authUser, logout } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [bookings, setBookings] = useState<EnrichedBooking[]>([]);
    const [offers, setOffers] = useState<EnrichedDirectOffer[]>([]);
    const [gigsToRate, setGigsToRate] = useState<EnrichedGig[]>([]);
    const [ratings, setRatings] = useState<Rating[]>([]);
    const [revenueLast30d, setRevenueLast30d] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isRadarLoading, setIsRadarLoading] = useState(false);
    const [radarResult, setRadarResult] = useState<string>('');
    const [showRadarResult, setShowRadarResult] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [itemToRate, setItemToRate] = useState<{ gig: EnrichedGig, venue: Venue } | null>(null);

    const [showReportModal, setShowReportModal] = useState(false);
    const [bookingToReport, setBookingToReport] = useState<EnrichedBooking | null>(null);

    const fetchData = async () => {
        if (!artist) return;
        setIsLoading(true);
        const [fetchedBookings, fetchedOffers, fetchedRevenue, fetchedRatings, fetchedGigsToRate] = await Promise.all([
            BookingService.getEnrichedBookingsForArtist(artist.id),
            DirectOfferService.getPendingOffersForArtist(artist.id),
            BookingService.getArtistRevenueLast30Days(artist.id),
            RatingService.getRatingsForUser(artist.id, 'artist'),
            RatingService.getGigsToRate(artist.id, 'artist')
        ]);
        setBookings(fetchedBookings.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setOffers(fetchedOffers);
        setRevenueLast30d(fetchedRevenue);
        setRatings(fetchedRatings);
        setGigsToRate(fetchedGigsToRate as EnrichedGig[]);
        setIsLoading(false);
    };

    useEffect(() => {
        if (!artist) {
            return;
        }

        const isNewUser = sessionStorage.getItem('isNewUser');
        if (isNewUser) {
            const onboardingKey = `onboarding-complete-artist-${artist.id}`;
            if (!localStorage.getItem(onboardingKey)) {
                setShowOnboarding(true);
            }
            sessionStorage.removeItem('isNewUser');
        }

        fetchData();
    }, [artist, navigate]);

    const handleOnboardingComplete = () => {
        if (artist) {
            localStorage.setItem(`onboarding-complete-artist-${artist.id}`, 'true');
        }
        setShowOnboarding(false);
    };
    
    const handleOpenRatingModal = (gig: EnrichedGig) => {
        if(gig.venue) {
             setItemToRate({ gig, venue: gig.venue });
             setShowRatingModal(true);
        }
    };
    
    const handleRatingSubmit = async (rating: number, comment: string) => {
        if (itemToRate && artist) {
            const success = await RatingService.createRating({
                gig_id: itemToRate.gig.id,
                rating,
                comment,
                rater_id: artist.id,
                rater_type: 'artist',
                ratee_id: itemToRate.venue.id,
                ratee_type: 'venue'
            });
            if(success) {
                showToast("Qualificação enviada com sucesso!", 'success');
                fetchData(); // Refresh data
            } else {
                showToast("Erro ao enviar qualificação.", 'error');
            }
        }
        setShowRatingModal(false);
        setItemToRate(null);
    };

    const handleOpenReportModal = (booking: EnrichedBooking) => {
        setBookingToReport(booking);
        setShowReportModal(true);
    };

    const averageRating = useMemo(() => {
        if (ratings.length === 0) return "N/A";
        const total = ratings.reduce((sum, r) => sum + r.rating, 0);
        return (total / ratings.length).toFixed(1);
    }, [ratings]);

    const profileStrength = useMemo(() => {
        if (!artist) return { percent: 0, missing: [] };
        let score = 0;
        const totalPoints = 9;
        const missing: string[] = [];

        if (artist.name) score++;
        if (artist.bio) score++;
        if (artist.imageUrl && !artist.imageUrl.includes('pexels.com')) score++;
        if (artist.genre?.primary) score++;
        if (artist.plans && artist.plans.length > 0) score++;
        if (artist.repertoire && artist.repertoire.length > 0) score++;
        if (artist.gallery && artist.gallery.length > 0) score++;
        if (artist.technicalRequirements?.space) score++;
        if (artist.youtubeVideoId) score++;

        if (!artist.bio) missing.push('Adicionar Bio');
        if (!artist.plans || artist.plans.length === 0) missing.push('Criar Pacotes');
        if (!artist.repertoire || artist.repertoire.length === 0) missing.push('Adicionar Repertório');
        if (!artist.gallery || artist.gallery.length === 0) missing.push('Adicionar Galeria');
        if (!artist.youtubeVideoId) missing.push('Adicionar Vídeo');

        return {
            percent: Math.round((score / totalPoints) * 100),
            missing: missing.slice(0, 3)
        };
    }, [artist]);
    
    const { upcomingShows, pastShows } = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return {
            upcomingShows: bookings.filter(b => new Date(`${b.date}T00:00:00`) >= today),
            pastShows: bookings.filter(b => new Date(`${b.date}T00:00:00`) < today)
        }
    }, [bookings]);

    const handleRadarClick = async () => {
        if (!artist) return;
        setIsRadarLoading(true);
        setShowRadarResult(true);
        setRadarResult('');
        try {
            const openGigs = await GigService.getAllOpenGigs();
            if (openGigs.length === 0) {
                setRadarResult("Nenhuma vaga aberta encontrada na plataforma no momento.");
                setIsRadarLoading(false);
                return;
            }

            // FIX: Switched from import.meta.env to process.env and removed VITE_ prefix.
            const apiKey = process.env.API_KEY;
            if (!apiKey) {
                setRadarResult("A chave da API de IA não está configurada. Esta funcionalidade está desabilitada.");
                setIsRadarLoading(false);
                return;
            }

            const ai = new GoogleGenAI({ apiKey });
            const prompt = `
                Você é um agente de talentos musicais. Analise o perfil do artista e a lista de vagas abertas para shows.
                Retorne uma análise curta e direta sobre qual vaga é a mais adequada para o artista, e por quê.
                Se nenhuma for adequada, explique o motivo.

                **Perfil do Artista:**
                - Nome: ${artist.name}
                - Gênero Principal: ${artist.genre.primary}
                - Outros Gêneros: ${artist.genre.secondary.join(', ')}
                - Bio: ${artist.bio}
                - Preço médio dos pacotes: R$ ${artist.plans && artist.plans.length > 0 ? (artist.plans.reduce((sum, p) => sum + p.price, 0) / artist.plans.length).toFixed(2) : 'N/A'}

                **Vagas Abertas:**
                ${openGigs.map(gig => `- Local: ${gig.venue?.name}, Data: ${gig.date}, Gênero Desejado: ${gig.genre}, Cachê: R$ ${gig.payment.toFixed(2)}`).join('\n')}

                Responda em português do Brasil. Retorne apenas a sua análise, sem introduções.
            `;
            const responseStream = await ai.models.generateContentStream({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            for await (const chunk of responseStream) {
                setRadarResult(prev => prev + chunk.text);
            }
        } catch (error) {
            console.error("Radar AI error:", error);
            setRadarResult("Ocorreu um erro ao consultar o radar. Verifique se a chave da API está correta e tente novamente.");
        } finally {
            setIsRadarLoading(false);
        }
    };


    if (isLoading || !artist || !authUser) {
        return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><i className="fas fa-spinner fa-spin text-4xl text-red-500"></i></div>;
    }

    return (
        <>
        {showOnboarding && <OnboardingModal userType="artist" onClose={handleOnboardingComplete} />}
        <div className="min-h-screen bg-gray-900 text-white">
            <header className="bg-gray-800 shadow-md">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold tracking-wider">Painel do Artista</h1>
                    <button onClick={logout} className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors">
                        <i className="fas fa-sign-out-alt"></i>
                        <span>Sair</span>
                    </button>
                </div>
            </header>
            
            <main className="container mx-auto px-4 py-8 space-y-8">
                <section>
                    <h2 className="text-3xl font-bold text-white mb-4">Olá, {artist.name}!</h2>
                    <div className="bg-gray-800/50 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold text-white mb-2">Força do Perfil</h3>
                        <div className="w-full bg-gray-700 rounded-full h-4">
                            <div className="bg-green-500 h-4 rounded-full" style={{ width: `${profileStrength.percent}%` }}></div>
                        </div>
                        <p className="text-right text-sm font-bold text-white mt-1">{profileStrength.percent}% Completo</p>
                        {profileStrength.percent < 100 && profileStrength.missing.length > 0 && (
                             <div className="mt-3 text-sm text-gray-400">
                                 <p>Para melhorar: <span className="font-semibold text-yellow-400">{profileStrength.missing.join(', ')}</span></p>
                            </div>
                        )}
                    </div>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Próximos Shows" value={upcomingShows.length} icon="fa-calendar-check" link="/edit-calendar" linkText="Ver Agenda" />
                    <StatCard title="Propostas Pendentes" value={offers.length} icon="fa-inbox" link="/direct-offers" linkText="Ver Propostas" />
                    <StatCard title="Receita (Últimos 30d)" value={`R$ ${revenueLast30d.toFixed(2).replace('.',',')}`} icon="fa-dollar-sign" link="/edit-financials" linkText="Ver Finanças" />
                    <StatCard title="Sua Avaliação Média" value={averageRating} icon="fa-star" />
                </section>

                <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                             <h3 className="text-2xl font-bold text-white mb-4">Acesso Rápido</h3>
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Link to="/edit-profile" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg text-center transition-colors">
                                    <i className="fas fa-user-edit text-2xl text-red-500"></i><p className="mt-2 font-semibold">Editar Perfil</p>
                                </Link>
                                <Link to="/edit-plans" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg text-center transition-colors">
                                    <i className="fas fa-box-open text-2xl text-red-500"></i><p className="mt-2 font-semibold">Pacotes</p>
                                </Link>
                                 <Link to="/edit-financials" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg text-center transition-colors">
                                    <i className="fas fa-chart-pie text-2xl text-red-500"></i><p className="mt-2 font-semibold">Finanças</p>
                                </Link>
                                <Link to="/edit-repertoire" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg text-center transition-colors">
                                    <i className="fas fa-music text-2xl text-red-500"></i><p className="mt-2 font-semibold">Repertório</p>
                                </Link>
                                 <Link to="/open-gigs" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg text-center transition-colors">
                                    <i className="fas fa-search-dollar text-2xl text-red-500"></i><p className="mt-2 font-semibold">Oportunidades</p>
                                </Link>
                                <Link to="/direct-offers" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg text-center transition-colors relative">
                                    <i className="fas fa-inbox text-2xl text-red-500"></i><p className="mt-2 font-semibold">Minhas Propostas</p>
                                    {offers.length > 0 && <span className="absolute top-2 right-2 w-5 h-5 bg-red-600 rounded-full text-xs flex items-center justify-center">{offers.length}</span>}
                                </Link>
                                 <Link to="/generate-post" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg text-center transition-colors">
                                    <i className="fas fa-magic text-2xl text-red-500"></i><p className="mt-2 font-semibold">Gerar Post (IA)</p>
                                </Link>
                            </div>
                        </div>

                        {gigsToRate.length > 0 && (
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-4">Shows a Qualificar</h3>
                                <div className="space-y-3">
                                    {gigsToRate.map(gig => (
                                        <div key={gig.id} className="bg-gray-800/50 p-4 rounded-lg flex items-center justify-between gap-4">
                                            <div>
                                                <p className="font-semibold text-white">{gig.venue?.name}</p>
                                                <p className="text-sm text-gray-400">{new Date(gig.date + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                                            </div>
                                            <button onClick={() => handleOpenRatingModal(gig)} className="text-xs font-semibold bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700">
                                                Qualificar Local
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                         {pastShows.length > 0 && (
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-4">Shows Passados</h3>
                                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                    {pastShows.map(booking => (
                                        <div key={booking.id} className="bg-gray-800/50 p-4 rounded-lg flex items-center justify-between gap-4">
                                            <div>
                                                <p className="font-semibold text-white">{booking.venueName}</p>
                                                <p className="text-sm text-gray-400">{new Date(booking.date + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                                            </div>
                                            <button onClick={() => handleOpenReportModal(booking)} className="text-xs font-semibold bg-yellow-600 text-white px-3 py-1.5 rounded-md hover:bg-yellow-700">
                                                Relatar Problema
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                     <div className="lg:col-span-1">
                        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                            <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2"><i className="fas fa-radar text-red-500"></i>Radar de Oportunidades</h3>
                            <p className="text-sm text-gray-400 mb-4">Use a IA para analisar as vagas abertas e encontrar a melhor para você.</p>
                            <button onClick={handleRadarClick} disabled={isRadarLoading} className="w-full bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors hover:bg-red-700 disabled:bg-gray-600 flex items-center justify-center gap-2">
                                {isRadarLoading ? <><i className="fas fa-spinner fa-spin"></i>Analisando...</> : 'Buscar Melhor Vaga'}
                            </button>
                            {showRadarResult && (
                                <div className="mt-4 p-4 bg-gray-900/50 rounded-md border border-gray-700">
                                    <p className="text-sm text-gray-300 whitespace-pre-line">{isRadarLoading ? 'Aguarde...' : radarResult}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
                
                 {offers.length === 0 && upcomingShows.length === 0 && gigsToRate.length === 0 && (
                     <EmptyState
                        icon="fa-calendar-times"
                        title="Tudo tranquilo por aqui"
                        message="Você não tem shows futuros, propostas ou locais para qualificar. Explore as oportunidades abertas!"
                     >
                         <Link to="/open-gigs" className="mt-4 inline-block bg-red-600 text-white font-bold py-2 px-5 rounded-md hover:bg-red-700 transition-colors">
                            Ver Oportunidades
                        </Link>
                    </EmptyState>
                )}
            </main>
        </div>
        
        {itemToRate && (
            <RatingModal
                isOpen={showRatingModal}
                onClose={() => setShowRatingModal(false)}
                onSubmit={handleRatingSubmit}
                itemToRate={{name: itemToRate.venue.name, type: 'o local'}}
            />
        )}
        {bookingToReport && (
            <ReportProblemModal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                booking={bookingToReport}
                reporter={{ id: authUser.id, type: 'artist' }}
            />
        )}
        </>
    );
};

export default ArtistDashboardPage;