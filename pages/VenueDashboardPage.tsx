import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useVenueAuth } from '../contexts/VenueAuthContext';
import ProfileCompletenessAlert from '../components/ProfileCompletenessAlert';
import { BannerService } from '../services/BannerService';
import { PlatformBanner } from '../types';

interface DashboardCardProps {
    to: string;
    icon: string;
    title: string;
    description: string;
    highlight?: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ to, icon, title, description, highlight = false }) => {
    const baseClasses = "group bg-gray-800 p-6 rounded-lg hover:bg-gray-700/80 transition-all duration-300 transform hover:-translate-y-1 flex flex-col";
    const highlightClasses = "bg-gradient-to-br from-pink-600 to-orange-500 hover:from-pink-500 hover:to-orange-400";

    return (
        <Link to={to} className={`${baseClasses} ${highlight ? highlightClasses : ''}`}>
            <div className={`text-3xl mb-4 ${highlight ? 'text-white' : 'text-pink-400'}`}>
                <i className={`fas ${icon}`}></i>
            </div>
            <h3 className={`font-bold text-lg ${highlight ? 'text-white' : 'text-white'}`}>{title}</h3>
            <p className={`text-sm mt-1 flex-grow ${highlight ? 'text-white/80' : 'text-gray-400'}`}>{description}</p>
        </Link>
    );
};


const VenueDashboardPage: React.FC = () => {
    const { currentVenue } = useVenueAuth();
    const [activeBanner, setActiveBanner] = useState<PlatformBanner | null>(null);

    useEffect(() => {
        BannerService.getActiveBanner().then(banner => {
            if (banner && (banner.desktop_image_url || banner.mobile_image_url)) {
                setActiveBanner(banner);
            }
        });
    }, []);

    if (!currentVenue) {
        return <div className="text-center py-12"><i className="fas fa-spinner fa-spin text-4xl text-pink-500"></i></div>;
    }

    const PromotionalBanner: React.FC<{ banner: PlatformBanner }> = ({ banner }) => {
        const content = (
            <picture className="w-full">
                {banner.desktop_image_url && <source media="(min-width: 768px)" srcSet={banner.desktop_image_url} />}
                <img 
                    src={banner.mobile_image_url || banner.desktop_image_url!}
                    alt="Anúncio" 
                    className="w-full object-cover rounded-lg"
                />
            </picture>
        );

        if (banner.link_url) {
            // Assume link_url is a WhatsApp number and construct the URL
            const whatsappUrl = `https://wa.me/${banner.link_url.replace(/\D/g, '')}`;
            return (
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="block shadow-lg hover:shadow-pink-500/30 transition-shadow duration-300">
                    {content}
                </a>
            );
        }

        return <div>{content}</div>;
    };


    return (
        <div>
            <div className="mb-8">
                <h1 className="text-4xl font-bold">Painel do Contratante</h1>
                <p className="text-gray-400 text-lg">Bem-vindo(a) de volta, <span className="text-pink-400 font-semibold">{currentVenue.name}</span>!</p>
            </div>
            
            <ProfileCompletenessAlert completeness={currentVenue.profile_completeness} userType="venue" />
            
            {activeBanner && (
                <div className="mb-8">
                     <PromotionalBanner banner={activeBanner} />
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <DashboardCard to="/artists" icon="fa-search" title="Encontrar Artistas" description="Navegue por nossa lista de talentos e encontre a atração perfeita." highlight={true} />
                <DashboardCard to="/venue-bookings" icon="fa-calendar-check" title="Meus Shows Contratados" description="Visualize e gerencie seus eventos futuros e passados." />
                <DashboardCard to="/offer-gig" icon="fa-bullhorn" title="Publicar Vaga" description="Crie uma vaga aberta para artistas se candidatarem." />
                <DashboardCard to="/sent-offers" icon="fa-paper-plane" title="Propostas Enviadas" description="Acompanhe o status das propostas que você enviou." />
                <DashboardCard to="/live-event" icon="fa-qrcode" title="QR Code do Local" description="Exiba seu QR Code permanente para o público avaliar os shows." />
                <DashboardCard to="/favorites" icon="fa-star" title="Meus Favoritos" description="Veja a lista dos seus artistas preferidos." />
                <DashboardCard to="/edit-venue-profile" icon="fa-store-alt" title="Meu Perfil" description="Edite as informações e fotos do seu local." />
                <DashboardCard to="/conversations" icon="fa-comments" title="Mensagens" description="Converse diretamente com artistas e produtores." />
            </div>

        </div>
    );
};

export default VenueDashboardPage;