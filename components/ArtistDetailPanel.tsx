import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from './Calendar';
import { Song, Artist } from '../data';
import SongDetailModal from './SongDetailModal';
import PlanCard from './PlanCard';
import { useVenueAuth } from '../contexts/VenueAuthContext';
import AuthPromptModal from './AuthPromptModal';
import DirectOfferModal from './DirectOfferModal';
import { ChatService } from '../services/ChatService';
import { useToast } from '../contexts/ToastContext';
import StarRatingDisplay from './StarRatingDisplay';
import { FavoriteService } from '../services/FavoriteService';


interface ArtistDetailPanelProps {
  artist: Artist;
  onClose: () => void;
}

type Tab = 'about' | 'plans' | 'repertoire' | 'gallery' | 'tech' | 'hospitality';

const ArtistDetailPanel: React.FC<ArtistDetailPanelProps> = ({ artist, onClose }) => {
  const navigate = useNavigate();
  const { isAuthenticated: isVenueAuthenticated, currentVenue, authUser: venueAuthUser } = useVenueAuth();
  const { showToast } = useToast();
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [repertoireSearch, setRepertoireSearch] = useState('');
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [expandedPlanId, setExpandedPlanId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('about');
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [showDirectOfferModal, setShowDirectOfferModal] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(true);
  
  const contentRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const checkFavoriteStatus = async () => {
        if (isVenueAuthenticated && venueAuthUser) {
            setIsFavoriteLoading(true);
            const status = await FavoriteService.isFavorite(venueAuthUser.id, artist.id);
            setIsFavorite(status);
            setIsFavoriteLoading(false);
        } else {
            setIsFavorite(false);
            setIsFavoriteLoading(false);
        }
    };
    checkFavoriteStatus();
  }, [artist.id, isVenueAuthenticated, venueAuthUser]);

  const bookedDates = useMemo(() => {
    if (!artist?.bookedDates) return [];
    return artist.bookedDates.map(d => new Date(`${d}T00:00:00`));
  }, [artist]);

  const filteredRepertoire = useMemo(() => {
    if (!artist?.repertoire) return [];
    return artist.repertoire.filter(song => 
        song.title.toLowerCase().includes(repertoireSearch.toLowerCase()) ||
        song.artist.toLowerCase().includes(repertoireSearch.toLowerCase())
    );
  }, [artist, repertoireSearch]);

  const handleDateSelect = (date: Date) => {
    setSelectedDates(prevDates => {
        if(prevDates.some(d => d.getTime() === date.getTime())) {
            return prevDates.filter(d => d.getTime() !== date.getTime());
        } else {
            return [...prevDates, date];
        }
    });
  }

  const handleBookingRequest = () => {
    if (selectedDates.length === 0 || !artist) return;

    if (!isVenueAuthenticated) {
        setShowAuthPrompt(true);
        return;
    }
    
    const dateString = selectedDates.map(date => date.toISOString().split('T')[0]).join(',');
    navigate(`/booking/${artist.id}?dates=${dateString}`);
  };
  
  const handleDirectOffer = () => {
    if (!isVenueAuthenticated) {
        setShowAuthPrompt(true);
        return;
    }
    setShowDirectOfferModal(true);
  }

  const handleSendMessageClick = async () => {
    if (!isVenueAuthenticated || !currentVenue) {
      setShowAuthPrompt(true);
      return;
    }
    setIsCreatingChat(true);
    try {
      const conversation = await ChatService.findOrCreateConversation(artist.id, currentVenue.id);
      if (conversation) {
        onClose(); // Close panel before navigating
        navigate(`/chat/${conversation.id}`);
      } else {
        showToast('Não foi possível iniciar a conversa. Tente novamente.', 'error');
      }
    } catch (error) {
       showToast('Ocorreu um erro. Tente novamente mais tarde.', 'error');
    } finally {
      setIsCreatingChat(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!isVenueAuthenticated || !venueAuthUser) {
        setShowAuthPrompt(true);
        return;
    }

    setIsFavoriteLoading(true);
    if (isFavorite) {
        await FavoriteService.removeFavorite(venueAuthUser.id, artist.id);
        setIsFavorite(false);
        showToast('Artista removido dos favoritos.', 'info');
    } else {
        await FavoriteService.addFavorite(venueAuthUser.id, artist.id);
        setIsFavorite(true);
        showToast('Artista adicionado aos favoritos!', 'success');
    }
    setIsFavoriteLoading(false);
  };
  
  const scrollToTop = () => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const TabButton: React.FC<{tab: Tab, label: string, icon: string}> = ({ tab, label, icon }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all duration-300 ${activeTab === tab ? 'border-red-500 text-white' : 'border-transparent text-gray-400 hover:border-red-500/50 hover:text-white'}`}
    >
        <i className={`fas ${icon} hidden sm:inline-block`}></i>
        <span>{label}</span>
    </button>
  );

  const SocialLink: React.FC<{platform: 'instagram' | 'spotify' | 'facebook', url?: string}> = ({platform, url}) => {
    if(!url) return null;
    const icons = { instagram: 'fab fa-instagram', spotify: 'fab fa-spotify', facebook: 'fab fa-facebook' };
    return (
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center justify-center w-12 h-12 bg-gray-700 hover:bg-red-600 text-white rounded-lg transition-colors text-xl"
          aria-label={`Perfil de ${artist.name} no ${platform}`}
        >
            <i className={icons[platform]}></i>
        </a>
    );
  }

  return (
    <>
      <div 
          className="bg-gray-800 w-full h-full shadow-2xl flex flex-col relative" 
      >
        <div className="flex-shrink-0 px-6 py-4 border-b border-gray-700 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <img src={artist.imageUrl} alt={artist.name} className="w-12 h-12 rounded-full object-cover"/>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center">
                  {artist.name}
                  {artist.status === 'approved' && (
                      <i 
                        className="fas fa-check-circle text-green-400 ml-2 text-base"
                        title="Artista Verificado"
                      ></i>
                  )}
                </h1>
                <div className="flex items-center gap-2">
                    <p className="text-sm text-red-400 font-semibold">{artist.genre.primary}</p>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 rounded-full text-2xl transition-colors"
              aria-label="Fechar"
            >
              &times;
            </button>
        </div>

        <div className="flex-grow overflow-y-auto" ref={contentRef}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
            <div className="lg:col-span-3">
              <div className="sticky top-0 bg-gray-800 z-10 border-b border-gray-700 flex justify-around overflow-x-auto">
                 <TabButton tab="about" label="Sobre" icon="fa-user" />
                 {artist.plans && artist.plans.length > 0 && <TabButton tab="plans" label="Pacotes" icon="fa-box-open" />}
                 {artist.repertoire && artist.repertoire.length > 0 && <TabButton tab="repertoire" label="Repertório" icon="fa-music" />}
                 {artist.gallery && artist.gallery.length > 0 && <TabButton tab="gallery" label="Galeria" icon="fa-images" />}
                 {artist.technicalRequirements && <TabButton tab="tech" label="Técnico" icon="fa-cogs" />}
                 {artist.hospitalityRider && artist.hospitalityRider.length > 0 && <TabButton tab="hospitality" label="Hospitalidade" icon="fa-utensils" />}
              </div>
              <div className="space-y-8 p-6">
                
                {activeTab === 'about' && (
                  <>
                    <div className="bg-gray-900/50 p-6 rounded-lg animate-fade-in">
                        <h2 className="text-2xl font-bold text-white mb-4 border-b-2 border-red-500 pb-2 flex items-center"><i className="fas fa-user mr-3 text-red-500"></i>Sobre o Artista</h2>
                        
                         {artist.genre.secondary && artist.genre.secondary.length > 0 && (
                              <div className="mb-4">
                                <h3 className="text-sm font-semibold text-gray-300 mb-2">Outros ritmos:</h3>
                                <div className="flex flex-wrap gap-2">
                                  {artist.genre.secondary.map(g => (
                                    <span key={g} className="bg-gray-700 text-gray-200 text-xs font-medium px-2.5 py-1 rounded-full">{g}</span>
                                  ))}
                                </div>
                              </div>
                          )}

                        <p className="text-gray-300 leading-relaxed whitespace-pre-line pt-4 border-t border-gray-700/50">{artist.bio}</p>
                         <div className="mt-6 pt-6 border-t border-gray-700">
                            <h3 className="text-lg font-semibold text-white text-center mb-4">Siga nas redes</h3>
                            <div className="flex justify-center gap-4">
                                <SocialLink platform="instagram" url={artist.socials.instagram} />
                                <SocialLink platform="spotify" url={artist.socials.spotify} />
                                <SocialLink platform="facebook" url={artist.socials.facebook} />
                            </div>
                        </div>
                    </div>

                    {artist.youtubeVideoId && (
                        <div className="bg-gray-900/50 p-6 rounded-lg animate-fade-in" style={{ animationDelay: '100ms' }}>
                            <h2 className="text-2xl font-bold text-white mb-4 border-b-2 border-red-500 pb-2 flex items-center"><i className="fab fa-youtube mr-3 text-red-500"></i>Assista uma Performance</h2>
                            <div className="aspect-video rounded-lg overflow-hidden shadow-lg"><iframe src={`https://www.youtube.com/embed/${artist.youtubeVideoId}`} title={`Performance de ${artist.name}`} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full"></iframe></div>
                        </div>
                    )}
                  </>
                )}
                
                {activeTab === 'plans' && artist.plans && artist.plans.length > 0 && (
                    <div className="bg-gray-900/50 p-6 rounded-lg animate-fade-in">
                      <h2 className="text-2xl font-bold text-white mb-4 border-b-2 border-red-500 pb-2 flex items-center"><i className="fas fa-box-open mr-3 text-red-500"></i>Pacotes de Contratação</h2>
                      <p className="text-gray-400 mb-6">Confira os formatos de show disponíveis. Clique em um pacote para ver os detalhes.</p>
                      <div className="space-y-4">{artist.plans.map(plan => (<PlanCard key={plan.id} plan={plan} isSelected={expandedPlanId === plan.id} onSelect={() => setExpandedPlanId(plan.id === expandedPlanId ? null : plan.id)} isVenueAuthenticated={isVenueAuthenticated}/>))}</div>
                      <div className="mt-6 bg-gray-800/70 p-4 rounded-lg flex items-center gap-4">
                          <i className="fas fa-info-circle text-red-400 text-xl flex-shrink-0"></i>
                          <p className="text-gray-300 text-sm">Não encontrou o pacote ideal? Os formatos são flexíveis. Entre em contato para montarmos um show personalizado para o seu evento.</p>
                      </div>
                    </div>
                )}

                {activeTab === 'repertoire' && artist.repertoire && artist.repertoire.length > 0 && (
                  <div className="bg-gray-900/50 p-6 rounded-lg animate-fade-in">
                      <h2 className="text-2xl font-bold text-white mb-4 border-b-2 border-red-500 pb-2 flex items-center"><i className="fas fa-music mr-3 text-red-500"></i>Repertório ({artist.repertoire.length} músicas)</h2>
                      <div className="relative mb-4">
                          <input
                              type="text"
                              placeholder="Buscar música ou artista..."
                              value={repertoireSearch}
                              onChange={(e) => setRepertoireSearch(e.target.value)}
                              className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                              aria-label="Buscar no repertório"
                          />
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <i className="fas fa-search text-gray-400"></i>
                          </div>
                      </div>
                      
                      <ul className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                          {filteredRepertoire.map((song, index) => (
                              <li 
                                  key={index} 
                                  className="bg-gray-800/70 p-3 rounded-md flex justify-between items-center text-sm hover:bg-gray-700/70 transition-colors cursor-pointer"
                                  onClick={() => setSelectedSong(song)}
                              >
                                  <div>
                                      <p className="font-semibold text-white">{song.title}</p>
                                      <p className="text-gray-400 text-xs">{song.artist}</p>
                                  </div>
                                  <div className="flex items-center space-x-4">
                                      {song.duration && (
                                          <span className="text-gray-500 text-xs font-mono">{song.duration}</span>
                                      )}
                                      {song.previewUrl && (
                                          <div className="text-red-500 hover:text-red-400">
                                               <i className="fas fa-play-circle text-lg"></i>
                                          </div>
                                      )}
                                  </div>
                              </li>
                          ))}
                      </ul>
                      {filteredRepertoire.length === 0 && repertoireSearch && (
                          <p className="text-gray-400 text-center mt-4">Nenhuma música encontrada com o termo "{repertoireSearch}".</p>
                      )}
                  </div>
                )}

                {activeTab === 'gallery' && artist.gallery && artist.gallery.length > 0 && (
                  <div className="bg-gray-900/50 p-6 rounded-lg animate-fade-in">
                      <h2 className="text-2xl font-bold text-white mb-4 border-b-2 border-red-500 pb-2 flex items-center"><i className="fas fa-images mr-3 text-red-500"></i>Galeria de Fotos</h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {artist.gallery.map((image, index) => (
                              <div key={index} className="overflow-hidden rounded-lg shadow-md aspect-w-1 aspect-h-1 group">
                                  <img src={image} alt={`${artist.name} - Galeria ${index + 1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                              </div>
                          ))}
                      </div>
                  </div>
                )}
                
                {activeTab === 'tech' && artist.technicalRequirements && (
                  <div className="bg-gray-900/50 p-6 rounded-lg animate-fade-in">
                      <h2 className="text-2xl font-bold text-white mb-6 border-b-2 border-red-500 pb-2 flex items-center"><i className="fas fa-cogs mr-3 text-red-500"></i>Requisitos Técnicos</h2>
                      <div className="space-y-6">
                          <div className="bg-gray-800/70 p-4 rounded-lg">
                              <h3 className="font-semibold text-white mb-3">Necessário no Local</h3>
                              <ul className="space-y-2 text-gray-300 text-sm">
                                  <li className="flex items-start"><i className="fas fa-ruler-combined text-red-400 w-5 text-center mr-3 mt-1"></i><span>Espaço Mínimo: {artist.technicalRequirements.space}</span></li>
                                  <li className="flex items-start"><i className="fas fa-bolt text-red-400 w-5 text-center mr-3 mt-1"></i><span>Ponto de Energia: {artist.technicalRequirements.power}</span></li>
                                  {artist.technicalRequirements.providedByContractor.map((item, index) => (
                                       <li key={index} className="flex items-start"><i className="fas fa-check text-red-400 w-5 text-center mr-3 mt-1"></i><span>{item}</span></li>
                                  ))}
                              </ul>
                          </div>
                          <div className="bg-gray-800/70 p-4 rounded-lg">
                              <h3 className="font-semibold text-white mb-3">Fornecido pelo Artista</h3>
                               <ul className="space-y-2 text-gray-300 text-sm">
                                   {artist.technicalRequirements.providedByArtist.map((item, index) => (
                                       <li key={index} className="flex items-start"><i className="fas fa-check-circle text-green-400 w-5 text-center mr-3 mt-1"></i><span>{item}</span></li>
                                  ))}
                              </ul>
                          </div>
                      </div>
                  </div>
                )}

                {activeTab === 'hospitality' && artist.hospitalityRider && artist.hospitalityRider.length > 0 && (
                  <div className="bg-gray-900/50 p-6 rounded-lg animate-fade-in">
                      <h2 className="text-2xl font-bold text-white mb-6 border-b-2 border-red-500 pb-2 flex items-center"><i className="fas fa-utensils mr-3 text-red-500"></i>Catering & Hospitalidade</h2>
                      <div className="bg-gray-800/70 p-4 rounded-lg">
                          <h3 className="font-semibold text-white mb-3">Solicitações do Artista</h3>
                           <p className="text-sm text-gray-400 mb-4">Itens a serem fornecidos pelo contratante para garantir o bem-estar do artista.</p>
                           <ul className="space-y-2 text-gray-300 text-sm">
                               {artist.hospitalityRider.map((item, index) => (
                                   <li key={index} className="flex items-start"><i className="fas fa-check-circle text-green-400 w-5 text-center mr-3 mt-1"></i><span>{item}</span></li>
                              ))}
                          </ul>
                      </div>
                  </div>
                )}

                <div className="mt-8 pt-8 border-t border-gray-700/50">
                    <button 
                        onClick={scrollToTop}
                        className="w-full bg-gray-700 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 flex items-center justify-center gap-3"
                    >
                        <i className="fas fa-calendar-alt"></i>
                        Verificar Disponibilidade e Contratar
                    </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 p-6 bg-gray-900/50 lg:bg-transparent">
               <div className="lg:sticky top-6">
                  <div className="bg-gray-900 p-6 rounded-lg shadow-2xl">
                      <h2 className="text-2xl font-bold text-white mb-4">Contrate este Artista</h2>
                      <p className="text-gray-400 mb-4 text-sm">Selecione as datas desejadas ou envie uma proposta direta.</p>
                      <Calendar selectedDates={selectedDates} onDateSelect={handleDateSelect} bookedDates={bookedDates} />
                      <div className="mt-6">
                          <h3 className="text-lg font-semibold text-white">Datas selecionadas:</h3>
                          {selectedDates.length > 0 ? (
                              <div className="flex flex-wrap gap-2 mt-2">{selectedDates.sort((a, b) => a.getTime() - b.getTime()).map(date => (<span key={date.toISOString()} className="bg-red-600 text-white text-sm font-medium px-3 py-1 rounded-full">{date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>))}</div>
                          ) : (<p className="text-gray-400 mt-2">Nenhuma data selecionada.</p>)}
                      </div>
                       <div className="mt-6 space-y-3">
                            <button disabled={selectedDates.length === 0} onClick={handleBookingRequest} className="w-full bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-colors hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:text-gray-400">Selecionar Pacote</button>
                            <div className="flex gap-3">
                                <button onClick={handleDirectOffer} className="flex-1 bg-transparent border-2 border-red-500 text-red-400 font-bold py-2.5 px-4 rounded-lg transition-colors hover:bg-red-500 hover:text-white">
                                    Proposta Direta
                                </button>
                                <button onClick={handleSendMessageClick} disabled={isCreatingChat} className="flex-1 bg-gray-600 text-white font-bold py-2.5 px-4 rounded-lg transition-colors hover:bg-gray-500 flex items-center justify-center gap-2 disabled:opacity-50">
                                    {isCreatingChat ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-comment-dots"></i> <span>Mensagem</span></>}
                                </button>
                                <button onClick={handleToggleFavorite} disabled={isFavoriteLoading || !isVenueAuthenticated} title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'} className="w-14 flex-shrink-0 bg-gray-600 text-white font-bold py-2.5 px-4 rounded-lg transition-colors hover:bg-gray-500 flex items-center justify-center gap-2 disabled:opacity-50">
                                  {isFavoriteLoading ? <i className="fas fa-spinner fa-spin"></i> : (
                                    isFavorite ? <i className="fas fa-star text-yellow-400"></i> : <i className="far fa-star"></i>
                                  )}
                                </button>
                            </div>
                        </div>
                  </div>

                  {artist.testimonials && artist.testimonials.length > 0 && (
                    <div className="bg-gray-900 p-6 rounded-lg shadow-2xl mt-8">
                        <h2 className="text-xl font-bold text-white mb-4"><i className="fas fa-comments mr-3 text-red-500"></i>O que dizem os contratantes</h2>
                        <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2">
                          {artist.testimonials.map((testimonial, index) => (
                            <blockquote key={index} className="relative p-4 bg-gray-800 rounded-lg text-sm">
                               <div className="absolute top-0 left-0 -translate-x-2 -translate-y-2 text-4xl text-gray-700 opacity-50"><i className="fas fa-quote-left"></i></div>
                               <p className="text-gray-300 italic z-10 relative">"{testimonial.quote}"</p>
                               <footer className="mt-2 text-right text-xs text-gray-400">— <span className="font-semibold text-white">{testimonial.author}</span>, {testimonial.source}</footer>
                             </blockquote>
                          ))}
                        </div>
                    </div>
                  )}

               </div>
            </div>
          </div>
        </div>
        {selectedSong && (<SongDetailModal song={selectedSong} onClose={() => setSelectedSong(null)} />)}
      </div>

      {showAuthPrompt && (
        <AuthPromptModal
            onClose={() => setShowAuthPrompt(false)}
            artistId={artist.id}
            selectedDates={selectedDates}
        />
      )}
      {showDirectOfferModal && currentVenue && (
          <DirectOfferModal
              isOpen={showDirectOfferModal}
              onClose={() => setShowDirectOfferModal(false)}
              artist={artist}
              venue={currentVenue}
          />
      )}
    </>
  );
};

export default ArtistDetailPanel;
