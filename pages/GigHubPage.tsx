import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BookingService, EnrichedBooking } from '../services/BookingService';
import { useAuth } from '../contexts/AuthContext';
import { useVenueAuth } from '../contexts/VenueAuthContext';
import { useToast } from '../contexts/ToastContext';
import ArtistCheckIn from '../components/ArtistCheckIn';
import VenueGigConfirmation from '../components/VenueGigConfirmation';

const Stat: React.FC<{ icon: string; label: string; value: string; }> = ({ icon, label, value }) => (
    <div className="flex items-start gap-3">
        <i className={`fas ${icon} text-pink-400 text-xl mt-1 w-6 text-center`}></i>
        <div>
            <p className="text-sm text-gray-400">{label}</p>
            <p className="font-bold text-white">{value}</p>
        </div>
    </div>
);

const GigHubPage: React.FC = () => {
    const { gigId } = useParams<{ gigId: string }>();
    const [booking, setBooking] = useState<EnrichedBooking | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { showToast } = useToast();

    // Artist or Venue authentication
    const { artist, isAuthenticated: isArtistAuthenticated } = useAuth();
    const { currentVenue, isAuthenticated: isVenueAuthenticated } = useVenueAuth();
    
    const userType = isArtistAuthenticated ? 'artist' : 'venue';
    const dashboardPath = isArtistAuthenticated ? '/dashboard' : '/venue-dashboard';

    useEffect(() => {
        const fetchBooking = async () => {
            if (!gigId) return;
            setIsLoading(true);
            const bookingData = await BookingService.getEnrichedBookingById(Number(gigId));
            
            // Basic authorization check
            if (bookingData && (bookingData.artistId === artist?.id || bookingData.venueId === currentVenue?.id)) {
                setBooking(bookingData);
            } else {
                 showToast('Você não tem permissão para ver este evento.', 'error');
            }
            setIsLoading(false);
        };
        fetchBooking();
    }, [gigId, artist, currentVenue, showToast]);

    
    const handleCheckInSuccess = () => {
        setBooking(prev => prev ? { ...prev, artist_checked_in: true, check_in_time: new Date().toISOString() } : null);
    };

    if (isLoading) {
        return <div className="text-center py-12"><i className="fas fa-spinner fa-spin text-4xl text-pink-500"></i></div>;
    }

    if (!booking) {
        return <div className="text-center py-12 text-gray-400">Show não encontrado ou acesso negado.</div>;
    }

    return (
        <div>
             <div className="flex items-center gap-4 mb-2">
                <Link to={dashboardPath} className="text-gray-400 hover:text-white transition-colors" aria-label="Voltar ao painel">
                    <i className="fas fa-arrow-left text-2xl"></i>
                </Link>
                <h1 className="text-3xl font-bold">Gig Hub</h1>
            </div>
            <p className="text-gray-400 mb-8">Painel de gerenciamento para o show de <span className="font-bold text-white">{booking.artist?.name}</span> em <span className="font-bold text-white">{booking.venueName}</span>.</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-gray-800 p-6 rounded-lg">
                        <h2 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-3">Resumo do Evento</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Stat icon="fa-calendar-day" label="Data" value={new Date(booking.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })} />
                            <Stat icon="fa-clock" label="Horário" value={`${booking.startTime} - ${booking.endTime}`} />
                            <Stat icon="fa-map-marker-alt" label="Local" value={booking.venueName || ''} />
                            <Stat icon="fa-dollar-sign" label="Cachê" value={`R$ ${booking.payment.toFixed(2)}`} />
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-1">
                    {userType === 'venue' && <VenueGigConfirmation booking={booking} />}
                    {userType === 'artist' && <ArtistCheckIn booking={booking} onConfirm={handleCheckInSuccess} />}
                </div>
            </div>
        </div>
    );
};

export default GigHubPage;