
import React, { useState, useMemo } from 'react';
import { Artist, Plan, Song } from '../types';
import { useNavigate } from 'react-router-dom';
import { useVenueAuth } from '../contexts/VenueAuthContext';
import AuthPromptModal from './AuthPromptModal';
import SongDetailModal from './SongDetailModal';
import PlanCard from './PlanCard';
import Calendar from './Calendar';
import StarRatingDisplay from './StarRatingDisplay';
import { useAuth } from '../contexts/AuthContext';
import { ChatService } from '../services/ChatService';
import { useToast } from '../contexts/ToastContext';
import Tooltip from './Tooltip';
import { FavoriteService } from '../services/FavoriteService';

interface ArtistDetailPanelProps {
  artist: Artist;
  onClose: () => void;
}

const ArtistDetailPanel: React.FC<ArtistDetailPanelProps> = ({ artist, onClose }) => {
    const navigate = useNavigate();
    const { isAuthenticated: isVenueAuthenticated, currentVenue, authUser: venueAuthUser } = useVenueAuth();
    const { artist: currentArtist, authUser: artistAuthUser } = useAuth();
    const { showToast } = useToast();
    
    const [activeTab, setActiveTab] = useState('sobre');
    const [selectedDates, setSelectedDates] = useState<Date[]>([]);
    const [selectedSong, setSelectedSong] = useState<Song | null>(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    
    const currentUser = useMemo(() => {
        if (currentArtist && artistAuthUser) return { id: currentArtist.id, authId: artistAuthUser.id, type: 'artist' as const };
        if (currentVenue && venueAuthUser) return { id: currentVenue.id, authId: venueAuthUser.id, type: 'venue' as const };
        return null;
    }, [currentArtist, artistAuthUser, currentVenue, venueAuthUser]);


    const bookedDates = useMemo(() => artist.bookedDates?.map(d => new Date(`${d}T00:00:00`)) || [], [artist.bookedDates]);

    const handleDateSelect = (date: Date) => {
        setSelectedDates(prev =>
            prev.some(d => d.getTime() === date.getTime())
                ? prev.filter(d => d.getTime() !== date.getTime())
                : [...prev, date]
        );
    };

    const handleBooking = () => {
        if (!isVenueAuthenticated) {
            setShowAuthModal(true);
            return;
        }
        if (selectedDates.length > 0) {
            const dateString = selectedDates.map(date => date.toISOString().split('T')[0]).join(',');
            navigate(`/booking/${artist.id}?dates=${dateString}`);
        }
    };

    const handleContact = async () => {
        if (!currentUser) {
            setShowAuthModal(true);
            return;
        }
        if (currentUser.type === 'artist' && currentUser.id === artist.id) {
            showToast("Você não pode iniciar uma conversa com você mesmo.", "info");
            return;
        }

        // The logic for conversation creation needs to handle artist-artist and venue-artist
        // For now we assume a simplified model where artists can chat too.
        let artistIdForChat = artist.id;
        let venueIdForChat = '';

        if (currentUser.type === 'artist') {
            // This is artist-to-artist (freelancer) chat. Needs a special handler or table.
            // For demo, we'll cheat and use artist ID as venue ID to create a unique conversation.
            venueIdForChat = currentUser.id;
        } else { // Current user is a venue
            venueIdForChat = currentUser.id;
        }

        const conversation = await ChatService.findOrCreateConversation(artistIdForChat, venueIdForChat);
        if(conversation) {
            navigate(`/chat/${conversation.id}`);
        } else {
            showToast("Não foi possível iniciar a conversa.", "error");
        }
    };

    return (
        <div className="bg-gray-800 w-full h-full text-white flex flex-col">
            {showAuthModal && <AuthPromptModal onClose={() => setShowAuthModal(false)} artistId={artist.id} selectedDates={selectedDates} />}
            {selectedSong && <SongDetailModal song={selectedSong} onClose={() => setSelectedSong(null)} />}
            
            <header className="relative h-48 md:h-64 flex-shrink-0 bg-cover bg-center" style={{ backgroundImage: `url(${artist.imageUrl})` }}>
                <div className="absolute inset-0 bg-gradient-to-t from-gray-800 via-gray-800/60 to-transparent"></div>
                <button onClick={onClose} className="absolute top-4 right-4 text-white bg-black/40 rounded-full w-10 h-10 flex items-center justify-center text-2xl z-20">&times;</button>
                <div className="absolute bottom-0 left-0 p-6 z-10">
                    <h1 className="text-4xl font-bold">{artist.name}</h1>
                    <p className="text-pink-400 font-semibold">{artist.genre.primary}</p>
                </div>
            </header>

            <div className="flex-grow flex flex-col lg:flex-row overflow-hidden">
                {/* Main Content */}
                <main className="flex-grow lg:w-2/3 p-6 overflow-y-auto">
                    {/* Bio */}
                    <section className="mb-8">
                        <p className="text-gray-300 leading-relaxed whitespace-pre-line">{artist.bio}</p>
                    </section>

                    {/* Gallery */}
                    {artist.gallery && artist.gallery.length > 0 && (
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">Galeria</h2>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                {artist.gallery.map((img, i) => (
                                    <img key={i} src={img} alt={`${artist.name} - Imagem ${i+1}`} className="w-full aspect-square object-cover rounded-md" />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Repertoire */}
                    {artist.repertoire && artist.repertoire.length > 0 && (
                        <section>
                             <h2 className="text-2xl font-bold mb-4">Repertório</h2>
                             <ul className="space-y-2 max-h-60 overflow-y-auto">
                                {artist.repertoire.map((song, i) => (
                                    <li key={i} className="flex justify-between items-center p-2 bg-gray-900/50 rounded-md">
                                        <div>
                                            <p className="font-semibold">{song.title}</p>
                                            <p className="text-sm text-gray-400">{song.artist}</p>
                                        </div>
                                    </li>
                                ))}
                             </ul>
                        </section>
                    )}
                </main>

                {/* Sidebar/Booking Panel */}
                <aside className="lg:w-1/3 bg-gray-900/50 p-6 overflow-y-auto flex-shrink-0 border-t lg:border-t-0 lg:border-l border-gray-700">
                    <div className="sticky top-6">
                        <section className="mb-6">
                            <h3 className="text-xl font-bold mb-4">1. Ver Disponibilidade</h3>
                            <Calendar selectedDates={selectedDates} onDateSelect={handleDateSelect} bookedDates={bookedDates} />
                        </section>

                        <section className="mb-6">
                            <h3 className="text-xl font-bold mb-4">2. Escolher Pacote</h3>
                             <div className="space-y-4">
                                {artist.plans?.map(plan => (
                                    <PlanCard 
                                        key={plan.id}
                                        plan={plan}
                                        isSelectable={false}
                                        isVenueAuthenticated={isVenueAuthenticated}
                                        contractorType={currentVenue?.contractor_type}
                                    />
                                ))}
                            </div>
                        </section>
                        
                         <button onClick={handleBooking} disabled={selectedDates.length === 0} className="w-full bg-gradient-to-r from-pink-500 to-orange-500 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed">
                            {selectedDates.length > 0 ? `Contratar para ${selectedDates.length} data(s)` : 'Selecione uma data'}
                        </button>
                        <button onClick={handleContact} className="w-full mt-3 bg-gray-600 text-white font-bold py-3 px-6 rounded-lg">
                            <i className="fas fa-comments mr-2"></i>
                            Enviar Mensagem
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default ArtistDetailPanel;
