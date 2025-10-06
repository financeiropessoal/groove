import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import OnboardingModal from '../components/OnboardingModal';
import ProfileCompletenessAlert from '../components/ProfileCompletenessAlert';
import ProPitchBanner from '../components/ProPitchBanner';
import ProBenefitsModal from '../components/ProBenefitsModal';
import { BookingService, EnrichedBooking } from '../services/BookingService';

interface DashboardCardProps {
    to: string;
    icon: string;
    title: string;
    description: string;
    pro?: boolean;
    highlight?: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ to, icon, title, description, pro = false, highlight = false }) => {
    const baseClasses = "relative group bg-gray-800 p-6 rounded-lg hover:bg-gray-700/80 transition-all duration-300 transform hover:-translate-y-1 flex flex-col";
    const highlightClasses = "bg-gradient-to-br from-pink-600 to-orange-500 hover:from-pink-500 hover:to-orange-400";

    return (
        <Link to={to} className={`${baseClasses} ${highlight ? highlightClasses : ''}`}>
            {pro && <span className="absolute top-3 right-3 bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-0.5 rounded-full shadow-lg">PRO</span>}
            <div className={`text-3xl mb-4 ${highlight ? 'text-white' : 'text-pink-400'}`}>
                <i className={`fas ${icon}`}></i>
            </div>
            <h3 className={`font-bold text-lg ${highlight ? 'text-white' : 'text-white'}`}>{title}</h3>
            <p className={`text-sm mt-1 flex-grow ${highlight ? 'text-white/80' : 'text-gray-400'}`}>{description}</p>
        </Link>
    );
};

const ArtistDashboardPage: React.FC = () => {
    const { artist } = useAuth();
    const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem('onboarding_completed'));
    const [isProModalOpen, setIsProModalOpen] = useState(false);
    const [todaysGig, setTodaysGig] = useState<EnrichedBooking | null>(null);

    useEffect(() => {
        if (artist) {
            BookingService.getBookingsForArtist(artist.id).then(bookings => {
                const todayStr = new Date().toISOString().split('T')[0];
                const gigForToday = bookings.find(b => b.date === todayStr && !b.isManual);
                setTodaysGig(gigForToday || null);
            });
        }
    }, [artist]);

    const handleCloseOnboarding = () => {
        localStorage.setItem('onboarding_completed', 'true');
        setShowOnboarding(false);
    }

    if (!artist) {
        return <div className="text-center py-12"><i className="fas fa-spinner fa-spin text-4xl text-pink-500"></i></div>;
    }

    return (
        <div>
            {showOnboarding && <OnboardingModal userType="artist" onClose={handleCloseOnboarding} />}

            <div className="mb-8">
                <h1 className="text-4xl font-bold">Painel do Artista</h1>
                <p className="text-gray-400 text-lg">Bem-vindo(a) de volta, <span className="text-pink-400 font-semibold">{artist.name}</span>!</p>
            </div>
            
            {!artist.is_pro && <ProPitchBanner onSeeBenefits={() => setIsProModalOpen(true)} />}
            
            <ProfileCompletenessAlert completeness={artist.profile_completeness} userType="artist" />

            {/* Profile & Content Management */}
            <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-4 border-b-2 border-gray-700 pb-2">Gerenciamento do Perfil</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    <DashboardCard to="/edit-profile" icon="fa-user-edit" title="Meu Perfil" description="Edite sua bio, fotos, vídeos e redes sociais." />
                    <DashboardCard to="/edit-gallery" icon="fa-images" title="Galeria de Fotos" description="Adicione e remova fotos do seu portfólio." />
                    <DashboardCard to="/edit-repertoire" icon="fa-music" title="Repertório" description="Liste as músicas que você toca." />
                    <DashboardCard to="/edit-plans" icon="fa-box-open" title="Pacotes de Show" description="Crie e gerencie os formatos que você oferece." />
                    <DashboardCard to="/edit-musicians" icon="fa-users" title="Músicos da Banda" description="Gerencie os músicos que tocam com você." />
                    <DashboardCard to="/edit-hospitality" icon="fa-utensils" title="Rider de Hospitalidade" description="Liste suas necessidades de camarim." />
                    <DashboardCard to="/feedback" icon="fa-comments" title="Feedbacks" description="Veja avaliações de contratantes e do público." />
                </div>
            </div>

            {/* Activity & Tools */}
            <div>
                <h2 className="text-2xl font-semibold mb-4 border-b-2 border-gray-700 pb-2">Atividade & Ferramentas</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {todaysGig && !todaysGig.artist_checked_in && (
                        <DashboardCard 
                            to={`/gig-hub/${todaysGig.id}`} 
                            icon="fa-map-marker-check"
                            title="Check-in do Show" 
                            description={`Confirme sua presença no show de hoje em ${todaysGig.venueName}.`}
                            highlight={true} 
                        />
                    )}
                    <DashboardCard to="/open-gigs" icon="fa-search-dollar" title="Oportunidades" description="Encontre vagas abertas e candidate-se." highlight={!todaysGig} />
                    <DashboardCard to="/direct-offers" icon="fa-envelope-open-text" title="Propostas Diretas" description="Veja as propostas que enviaram para você." />
                    <DashboardCard to="/edit-calendar" icon="fa-calendar-alt" title="Minha Agenda" description="Visualize e gerencie suas datas reservadas." />
                    <DashboardCard to="/referrals" icon="fa-gift" title="Indique e Ganhe" description="Convide artistas e ganhe meses de PRO grátis." />
                    <DashboardCard to="/edit-financials" icon="fa-wallet" title="Minhas Finanças" description="Acompanhe seus ganhos e despesas." pro={true} />
                    <DashboardCard to="/edit-special-prices" icon="fa-tags" title="Clientes Especiais" description="Defina preços customizados para parceiros." pro={true} />
                    <DashboardCard to="/generate-post" icon="fa-magic" title="Gerador de Posts" description="Crie posts para redes sociais com ajuda de IA." pro={true} />
                    <DashboardCard to="/analytics" icon="fa-chart-line" title="Análise de Perfil" description="Veja estatísticas de visitas e engajamento." pro={true} />
                </div>
            </div>
            <ProBenefitsModal isOpen={isProModalOpen} onClose={() => setIsProModalOpen(false)} />
        </div>
    );
};

export default ArtistDashboardPage;