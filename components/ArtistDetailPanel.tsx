import React, { useState, useEffect } from 'react';
import { Artist, Plan, Song, Testimonial } from '../data';
import { Rating } from '../types';
import { useVenueAuth } from '../contexts/VenueAuthContext';
import { useToast } from '../contexts/ToastContext';
import { RatingService } from '../services/RatingService';
import StarRating from './StarRating';
import StarRatingDisplay from './StarRatingDisplay';
import { ArtistService } from '../services/ArtistService';


interface ArtistDetailPanelProps {
  artist: Artist;
  onClose: () => void;
}

type Tab = 'sobre' | 'midia' | 'pacotes' | 'avaliacoes';

const ArtistDetailPanel: React.FC<ArtistDetailPanelProps> = ({ artist: initialArtist, onClose }) => {
  const [artist, setArtist] = useState<Artist>(initialArtist);
  const [activeTab, setActiveTab] = useState<Tab>('sobre');
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [isLoadingRatings, setIsLoadingRatings] = useState(true);

  // States for new rating form
  const { currentVenue, isAuthenticated: isVenueAuthenticated } = useVenueAuth();
  const { showToast } = useToast();
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  useEffect(() => {
    const fetchArtistData = async () => {
      setIsLoadingRatings(true);
      // Refetch artist data to apply special prices if a venue is logged in
      const viewerId = currentVenue?.id;
      const [freshArtistData, ratingsData] = await Promise.all([
        ArtistService.getArtistById(initialArtist.id, viewerId),
        RatingService.getRatingsForArtist(initialArtist.id)
      ]);
      
      if (freshArtistData) {
        setArtist(freshArtistData);
      }
      setRatings(ratingsData);
      setIsLoadingRatings(false);
    };

    fetchArtistData();
  }, [initialArtist.id, currentVenue]);

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newRating === 0) {
      showToast('Por favor, selecione uma nota de 1 a 5 estrelas.', 'error');
      return;
    }
    if (!currentVenue) return;

    setIsSubmitting(true);
    const success = await RatingService.submitRating({
      artistId: artist.id,
      venueId: currentVenue.id,
      rating: newRating,
      comment: newComment,
    });
    setIsSubmitting(false);

    if (success) {
      showToast('Sua avaliação foi enviada com sucesso!', 'success');
      setNewRating(0);
      setNewComment('');
      // Refetch ratings to show the new one
      const data = await RatingService.getRatingsForArtist(artist.id);
      setRatings(data);
    } else {
      showToast('Ocorreu um erro ao enviar sua avaliação.', 'error');
    }
  };


  const TabButton: React.FC<{tab: Tab, label: string, icon: string, disabled?: boolean}> = ({ tab, label, icon, disabled }) => (
    <button
      onClick={() => !disabled && setActiveTab(tab)}
      disabled={disabled}
      className={`flex-1 sm:flex-none flex flex-col items-center justify-center gap-1 px-4 py-3 text-sm font-semibold border-b-4 transition-all duration-300 ${activeTab === tab ? 'border-pink-500 text-white' : 'border-transparent text-gray-400 hover:border-pink-500/50 hover:text-white'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <i className={`fas ${icon} text-lg`}></i>
      <span>{label}</span>
    </button>
  );

  return (
    <div
      className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-0 md:p-4 animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-gray-800 w-full h-full md:max-w-4xl md:h-[95vh] rounded-none md:rounded-lg shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="relative h-48 md:h-64 bg-cover bg-center flex-shrink-0" style={{ backgroundImage: `url(${artist.imageUrl})` }}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              <div className="absolute top-4 right-4">
                  <button 
                      onClick={onClose} 
                      className="w-10 h-10 flex items-center justify-center text-white bg-black/50 hover:bg-black/80 rounded-full text-2xl transition-colors"
                      aria-label="Fechar"
                    >
                      &times;
                  </button>
              </div>
              <div className="absolute bottom-0 left-0 p-6">
                  <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">{artist.name}</h1>
                  <p className="text-lg text-pink-400 mt-1 drop-shadow-md">{artist.genre.primary}</p>
                  {artist.averageRating && artist.ratingCount ? (
                      <div className="flex items-center gap-2 mt-2">
                          <StarRatingDisplay rating={artist.averageRating} />
                          <span className="text-sm text-gray-300">({artist.ratingCount} avaliações)</span>
                      </div>
                  ) : <div className="text-sm text-gray-400 mt-2">Ainda sem avaliações</div>}
              </div>
          </header>

        <div className="border-b border-gray-700 flex justify-around overflow-x-auto flex-shrink-0">
            <TabButton tab="sobre" label="Sobre" icon="fa-info-circle" />
            <TabButton tab="midia" label="Mídia" icon="fa-photo-video" />
            <TabButton tab="pacotes" label="Pacotes" icon="fa-box-open" disabled={!artist.plans || artist.plans.length === 0} />
            <TabButton tab="avaliacoes" label="Avaliações" icon="fa-star" />
        </div>

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === 'sobre' && (
                <div className="animate-fade-in space-y-6">
                    <div>
                        <h3 className="font-bold text-pink-400 mb-2 text-xl">Bio</h3>
                        <p className="text-gray-300 whitespace-pre-line">{artist.bio || 'Nenhuma bio informada.'}</p>
                    </div>
                    {artist.repertoire && artist.repertoire.length > 0 && (
                        <div>
                            <h3 className="font-bold text-pink-400 mb-2 text-xl">Repertório</h3>
                            <ul className="text-sm text-gray-400 list-disc list-inside space-y-1">
                                {artist.repertoire.slice(0, 10).map(song => (
                                    <li key={song.title}>{song.title} - <span className="italic">{song.artist}</span></li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'midia' && (
                <div className="animate-fade-in space-y-6">
                    {artist.youtubeVideoId && (
                        <div>
                            <h3 className="font-bold text-pink-400 mb-2 text-xl">Vídeo de Performance</h3>
                            <div className="aspect-video rounded-lg overflow-hidden">
                                <iframe 
                                    src={`https://www.youtube.com/embed/${artist.youtubeVideoId}`} 
                                    title="YouTube video player" 
                                    frameBorder="0" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowFullScreen
                                    className="w-full h-full"
                                ></iframe>
                            </div>
                        </div>
                    )}
                    {artist.gallery && artist.gallery.length > 0 && (
                        <div>
                            <h3 className="font-bold text-pink-400 mb-2 text-xl">Galeria de Fotos</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {artist.gallery.map((photo, i) => (
                                    <div key={i} className="aspect-square rounded-lg overflow-hidden group">
                                        <img src={photo} alt={`${artist.name} foto ${i+1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'pacotes' && (
                <div className="animate-fade-in space-y-4">
                    <h3 className="font-bold text-pink-400 mb-2 text-xl">Pacotes de Show</h3>
                    {artist.plans?.map(plan => (
                        <div key={plan.id} className="bg-gray-700/50 p-4 rounded-md">
                            <div className="flex justify-between items-center">
                                <div>
                                  <h4 className="font-semibold text-white">{plan.name}</h4>
                                  <p className="text-sm text-gray-400">{plan.description}</p>
                                </div>
                                <span className="font-bold text-green-400 text-lg">R$ {plan.price.toFixed(2).replace('.', ',')}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'avaliacoes' && (
                <div className="animate-fade-in space-y-6">
                    {isVenueAuthenticated && (
                        <form onSubmit={handleRatingSubmit} className="bg-gray-700/50 p-4 rounded-lg">
                            <h3 className="font-semibold text-white mb-3">Deixar uma avaliação</h3>
                            <div className="mb-2">
                                <StarRating rating={newRating} setRating={setNewRating} />
                            </div>
                            <textarea 
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Conte como foi a experiência..."
                                rows={3}
                                className="w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-sm"
                            />
                            <div className="text-right mt-2">
                                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-pink-600 text-white rounded font-semibold hover:bg-pink-700 disabled:bg-gray-500">
                                    {isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}
                                </button>
                            </div>
                        </form>
                    )}
                    {isLoadingRatings ? <p>Carregando avaliações...</p> : 
                      ratings.length > 0 ? (
                          ratings.map(rating => (
                              <div key={rating.id} className="border-b border-gray-700 pb-4">
                                  <StarRatingDisplay rating={rating.rating} />
                                  {rating.comment && <p className="text-gray-300 italic mt-2">"{rating.comment}"</p>}
                                  <p className="text-xs text-gray-500 text-right mt-1">- Avaliado por um contratante</p>
                              </div>
                          ))
                      ) : (
                          <p className="text-gray-400 text-center py-8">Este artista ainda não possui avaliações.</p>
                      )
                    }
                </div>
            )}
        </main>
      </div>
    </div>
  );
};

export default ArtistDetailPanel;