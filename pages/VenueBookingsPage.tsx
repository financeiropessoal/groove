import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useVenueAuth } from '../contexts/VenueAuthContext';
import { BookingService, EnrichedBooking } from '../services/BookingService';
import EmptyState from '../components/EmptyState';
import { Artist } from '../data';

const BookingCard: React.FC<{ booking: EnrichedBooking }> = ({ booking }) => {
    return (
        <div className="bg-gray-800 p-4 rounded-lg flex flex-col sm:flex-row gap-4 items-start">
            <img src={booking.artist?.imageUrl} alt={booking.artist?.name} className="w-24 h-24 object-cover rounded-md flex-shrink-0" />
            <div className="flex-grow">
                <h3 className="text-xl font-bold text-white">{booking.artist?.name}</h3>
                <p className="text-sm text-gray-300">
                    {new Date(`${booking.date}T00:00:00`).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                </p>
                <p className="text-lg font-bold text-green-400 mt-1">R$ {booking.payment.toFixed(2)}</p>
            </div>
            <div className="w-full sm:w-auto flex-shrink-0">
                <Link to={`/gig-hub/${booking.id}`} className="block text-center w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                    Gerenciar Show
                </Link>
            </div>
        </div>
    );
};

const VenueBookingsPage: React.FC = () => {
    const { currentVenue } = useVenueAuth();
    const [bookings, setBookings] = useState<EnrichedBooking[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (currentVenue) {
            setIsLoading(true);
            BookingService.getBookingsForVenue(currentVenue.id).then(data => {
                setBookings(data);
                setIsLoading(false);
            });
        }
    }, [currentVenue]);

    const { upcomingGigs, pastGigs } = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const upcoming: EnrichedBooking[] = [];
        const past: EnrichedBooking[] = [];

        bookings.forEach(booking => {
            const bookingDate = new Date(`${booking.date}T00:00:00`);
            if (bookingDate >= today) {
                upcoming.push(booking);
            } else {
                past.push(booking);
            }
        });

        // Sort upcoming gigs from soonest to latest
        upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        // pastGigs are already sorted descending by date from the service

        return { upcomingGigs: upcoming, pastGigs: past };
    }, [bookings]);

    if (isLoading) {
        return <div className="text-center py-12"><i className="fas fa-spinner fa-spin text-4xl text-pink-500"></i></div>;
    }

    return (
        <div>
            <div className="flex items-center gap-4 mb-8">
                <Link to="/venue-dashboard" className="text-gray-400 hover:text-white transition-colors" aria-label="Voltar ao painel">
                    <i className="fas fa-arrow-left text-2xl"></i>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold">Meus Shows Contratados</h1>
                    <p className="text-gray-400">Gerencie seus eventos agendados.</p>
                </div>
            </div>

            {bookings.length === 0 ? (
                <EmptyState
                    icon="fa-calendar-times"
                    title="Nenhum show contratado"
                    message="Quando você contratar um artista, o show aparecerá aqui para você gerenciar."
                >
                     <Link to="/artists" className="px-6 py-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white font-bold rounded-lg">
                        Encontrar Artistas
                    </Link>
                </EmptyState>
            ) : (
                <div className="space-y-12">
                    <section>
                        <h2 className="text-2xl font-bold mb-4 border-b-2 border-gray-700 pb-2">Próximos Shows</h2>
                        {upcomingGigs.length > 0 ? (
                            <div className="space-y-4">
                                {upcomingGigs.map(gig => <BookingCard key={gig.id} booking={gig} />)}
                            </div>
                        ) : (
                            <p className="text-gray-400">Nenhum show agendado.</p>
                        )}
                    </section>
                    <section>
                        <h2 className="text-2xl font-bold mb-4 border-b-2 border-gray-700 pb-2">Histórico de Shows</h2>
                         {pastGigs.length > 0 ? (
                            <div className="space-y-4">
                                {pastGigs.map(gig => <BookingCard key={gig.id} booking={gig} />)}
                            </div>
                        ) : (
                            <p className="text-gray-400">Nenhum show no histórico.</p>
                        )}
                    </section>
                </div>
            )}
        </div>
    );
};

export default VenueBookingsPage;