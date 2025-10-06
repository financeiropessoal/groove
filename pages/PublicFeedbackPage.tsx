import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ArtistService } from '../services/ArtistService';
import { VenueService } from '../services/VenueService';
import { PublicRatingService } from '../services/PublicRatingService';
import { Artist, Venue } from '../data';
import StarRating from '../components/StarRating';
import { BookingService } from '../services/BookingService';

const VenuePublicPage: React.FC = () => {
    const { venueId } = useParams<{ venueId: string }>();
    const [artist, setArtist] = useState<Artist | null>(null);
    const [venue, setVenue] = useState<Venue | null>(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (!venueId) return;
        const fetchData = async () => {
            setIsLoading(true);
            const [venueData, bookingData] = await Promise.all([
                VenueService.getVenueById(venueId),
                BookingService.getTodaysBookingForVenue(venueId),
            ]);
            setVenue(venueData);
            setArtist(bookingData?.artist || null);
            setIsLoading(false);
        };
        fetchData();
    }, [venueId]);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            alert('Por favor, dê uma nota de 1 a 5 estrelas.');
            return;
        }
        if (!artist?.id || !venueId) return;
        
        setIsSubmitting(true);
        const success = await PublicRatingService.submitRating({
            artistId: artist.id,
            venueId,
            rating,
            comment,
        });
        setIsSubmitting(false);
        if(success) {
            setSubmitted(true);
        } else {
            alert('Ocorreu um erro. Tente novamente.');
        }
    };

    if (isLoading) {
        return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><i className="fas fa-spinner fa-spin text-4xl text-pink-500"></i></div>;
    }

    if (!venue) {
        return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-red-400 p-4 text-center">Local não encontrado. Verifique o QR Code.</div>;
    }

    const PageBanner: React.FC = () => (
        <div className="relative h-48 bg-cover bg-center" style={{ backgroundImage: `url(${venue.imageUrl})` }}>
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6 w-full">
                <p className="text-sm text-gray-300">Você está em</p>
                <h1 className="text-4xl font-bold truncate">{venue.name}</h1>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <PageBanner />
            <main className="p-4 sm:p-6 max-w-2xl mx-auto w-full -mt-16">
                 {submitted ? (
                    <div className="relative bg-gray-800 rounded-lg p-8 text-center animate-fade-in shadow-2xl">
                        <i className="fas fa-check-circle text-6xl text-green-400 mb-6"></i>
                        <h2 className="text-3xl font-bold mb-2">Obrigado!</h2>
                        <p className="text-gray-300">Sua avaliação sobre o show de <span className="font-semibold text-pink-400">{artist?.name}</span> foi enviada.</p>
                        <p className="text-gray-400 mt-1">Agradecemos sua participação!</p>
                    </div>
                ) : !artist ? (
                    <div className="relative bg-gray-800 rounded-lg p-8 text-center animate-fade-in shadow-2xl">
                        <i className="fas fa-music text-6xl text-pink-400 mb-6"></i>
                        <h2 className="text-3xl font-bold mb-2">Aproveite a noite!</h2>
                        <p className="text-gray-300">Hoje não temos um show de um artista da nossa plataforma, mas esperamos que você curta o som e o ambiente do <span className="font-semibold text-pink-400">{venue.name}</span>.</p>
                    </div>
                ) : (
                    <div className="relative bg-gray-800 rounded-lg shadow-2xl overflow-hidden animate-fade-in">
                        <div className="p-6">
                            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                                <img src={artist.imageUrl} alt={artist.name} className="w-32 h-32 rounded-full object-cover border-4 border-gray-700 shadow-lg flex-shrink-0" />
                                <div>
                                    <p className="text-sm text-pink-400 font-semibold tracking-wider">SHOW DE HOJE</p>
                                    <h2 className="text-4xl font-bold my-1">{artist.name}</h2>
                                    <p className="text-gray-400 bg-gray-700/50 inline-block px-3 py-1 rounded-full text-sm">{artist.genre.primary}</p>
                                </div>
                            </div>
                            {artist.bio && <p className="text-gray-300 text-sm mt-6 border-l-4 border-gray-700 pl-4 italic">{artist.bio}</p>}
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 mt-4 bg-gray-900/50">
                            <h3 className="text-xl font-bold text-center mb-4">Deixe sua avaliação</h3>
                            <div className="flex justify-center text-4xl mb-4">
                                <StarRating rating={rating} setRating={setRating} />
                            </div>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={3}
                                className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 focus:ring-2 focus:ring-pink-500 focus:outline-none"
                                placeholder="Deixe um comentário (opcional)..."
                            />
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full mt-4 bg-gradient-to-r from-pink-500 to-orange-500 text-white font-bold py-3 px-4 rounded-lg transition-shadow hover:shadow-[0_0_20px_rgba(236,72,153,0.7)] disabled:from-gray-600 disabled:to-gray-600 disabled:shadow-none disabled:cursor-wait"
                            >
                                {isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}
                            </button>
                        </form>
                    </div>
                )}
            </main>
        </div>
    );
};
export default VenuePublicPage;