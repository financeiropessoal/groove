import React, { useState, useEffect } from 'react';
import { GigOffer, Venue } from '../data';
import { GigService } from '../services/GigService';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import StarRatingDisplay from './StarRatingDisplay';

interface VenueDetailPanelProps {
  venue: Venue;
  onClose: () => void;
}

type Tab = 'sobre' | 'fotos' | 'equipamentos' | 'vagas';

const VenueDetailPanel: React.FC<VenueDetailPanelProps> = ({ venue, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('sobre');
  const [openGigs, setOpenGigs] = useState<GigOffer[]>([]);
  const [isLoadingGigs, setIsLoadingGigs] = useState(false);
  const { isAuthenticated: isArtistAuthenticated } = useAuth();


  useEffect(() => {
    const fetchGigs = async () => {
      if (activeTab === 'vagas') {
        setIsLoadingGigs(true);
        const allGigs = await GigService.getGigsForVenue(venue.id);
        const openAndFutureGigs = allGigs.filter(g => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const gigDate = new Date(`${g.date}T00:00:00`);
            return g.status === 'open' && gigDate >= today;
        });
        setOpenGigs(openAndFutureGigs);
        setIsLoadingGigs(false);
      }
    };
    fetchGigs();
  }, [activeTab, venue.id]);

  const TabButton: React.FC<{tab: Tab, label: string, icon: string, disabled?: boolean}> = ({ tab, label, icon, disabled }) => (
    <button
      onClick={() => !disabled && setActiveTab(tab)}
      disabled={disabled}
      className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold border-b-4 transition-all duration-300 ${activeTab === tab ? 'border-red-500 text-white' : 'border-transparent text-gray-400 hover:border-red-500/50 hover:text-white'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <i className={`fas ${icon}`}></i>
      <span>{label}</span>
    </button>
  );

  return (
    <div className="bg-gray-800 w-full h-full shadow-2xl flex flex-col">
      <div className="relative h-48 md:h-64 bg-cover bg-center flex-shrink-0" style={{ backgroundImage: `url(${venue.imageUrl})` }}>
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
              <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">{venue.name}</h1>
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 mt-1">
                <p className="text-lg text-gray-200 drop-shadow-md"><i className="fas fa-map-marker-alt mr-2 text-red-400"></i>{venue.address}</p>
                {venue.averageRating && typeof venue.averageRating === 'number' && venue.ratingCount ? (
                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                        <StarRatingDisplay rating={venue.averageRating} />
                        <span className="text-md font-bold text-white">{venue.averageRating.toFixed(1)}</span>
                        <span className="text-sm text-gray-300">({venue.ratingCount} avaliações)</span>
                    </div>
                ) : null}
              </div>
          </div>
      </div>

      <div className="border-b border-gray-700 flex justify-around overflow-x-auto flex-shrink-0">
          <TabButton tab="sobre" label="Sobre & Proposta" icon="fa-info-circle" />
          <TabButton tab="fotos" label="Fotos" icon="fa-camera" disabled={!venue.photos || venue.photos.length === 0} />
          <TabButton tab="equipamentos" label="Equipamentos" icon="fa-cogs" disabled={!venue.equipment || venue.equipment.length === 0} />
          <TabButton tab="vagas" label="Vagas Abertas" icon="fa-bullhorn" />
      </div>

      <div className="flex-grow overflow-y-auto">
          <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                  {activeTab === 'sobre' && (
                      <div className="animate-fade-in space-y-8">
                            <div>
                              <h2 className="text-2xl font-bold text-white mb-4">Sobre o Local</h2>
                              <p className="text-gray-300 leading-relaxed whitespace-pre-line">{venue.description || 'Nenhuma descrição fornecida.'}</p>
                          </div>
                          {venue.proposalInfo && (
                              <div>
                                  <h2 className="text-2xl font-bold text-white mb-4">Proposta para Músicos</h2>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      {venue.proposalInfo.structure && (
                                          <div className="bg-gray-900/50 p-4 rounded-lg">
                                              <h3 className="font-semibold text-red-400 flex items-center gap-2 mb-2"><i className="fas fa-drum"></i>{venue.proposalInfo.structure.title}</h3>
                                              <ul className="space-y-1 text-sm text-gray-300 list-disc list-inside">
                                                  {venue.proposalInfo.structure.details.map((item, i) => <li key={i}>{item}</li>)}
                                              </ul>
                                          </div>
                                      )}
                                      {venue.proposalInfo.audience && (
                                          <div className="bg-gray-900/50 p-4 rounded-lg">
                                              <h3 className="font-semibold text-red-400 flex items-center gap-2 mb-2"><i className="fas fa-users"></i>{venue.proposalInfo.audience.title}</h3>
                                              <ul className="space-y-1 text-sm text-gray-300 list-disc list-inside">
                                                  {venue.proposalInfo.audience.details.map((item, i) => <li key={i}>{item}</li>)}
                                              </ul>
                                          </div>
                                      )}
                                  </div>
                              </div>
                          )}
                      </div>
                  )}
                    {activeTab === 'fotos' && (
                      <div className="animate-fade-in">
                          <h2 className="text-2xl font-bold text-white mb-4">Galeria de Fotos</h2>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                              {venue.photos?.map((photo, i) => (
                                  <div key={i} className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden group">
                                      <img src={photo} alt={`${venue.name} foto ${i+1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}
                  {activeTab === 'equipamentos' && (
                      <div className="animate-fade-in">
                          <h2 className="text-2xl font-bold text-white mb-4">Equipamentos Disponíveis</h2>
                          <p className="text-sm text-gray-400 mb-4">Estes são os equipamentos que o local oferece para os músicos.</p>
                          <ul className="space-y-2 text-gray-300 bg-gray-900/50 p-4 rounded-lg">
                              {venue.equipment?.map((item, i) => (
                                  <li key={i} className="flex items-center"><i className="fas fa-check-circle text-red-400 mr-3"></i>{item}</li>
                              ))}
                          </ul>
                      </div>
                  )}
                  {activeTab === 'vagas' && (
                      <div className="animate-fade-in">
                          <h2 className="text-2xl font-bold text-white mb-4">Vagas em Aberto</h2>
                          {isLoadingGigs ? <p className="text-gray-400">Buscando vagas...</p> : 
                            openGigs.length > 0 ? (
                                <div className="space-y-4">
                                    {openGigs.map(gig => (
                                      <div key={gig.id} className="bg-gray-900/50 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start gap-3">
                                          <div>
                                              <p className="font-bold text-lg text-white">{new Date(`${gig.date}T00:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })} ({gig.startTime} - {gig.endTime})</p>
                                              <p className="text-sm text-gray-300">Gênero: {gig.genre}</p>
                                              {gig.notes && <p className="text-xs text-gray-400 mt-1 italic">"{gig.notes}"</p>}
                                          </div>
                                          <div className="text-left sm:text-right flex-shrink-0">
                                              <p className="text-sm text-gray-400">Cachê</p>
                                              <p className="text-xl font-bold text-green-400">{`R$ ${gig.payment.toFixed(2).replace('.',',')}`}</p>
                                              {isArtistAuthenticated && (
                                                <Link to="/open-gigs" className="mt-1 inline-block text-xs font-semibold bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700">Ver e aplicar</Link>
                                              )}
                                          </div>
                                      </div>
                                    ))}
                                </div>
                            ) : <p className="text-gray-400">Nenhuma vaga aberta no momento. Volte em breve!</p>}
                      </div>
                  )}
              </div>
              <aside className="lg:col-span-1 lg:sticky top-6 self-start space-y-6">
                  <div className="bg-gray-900/50 p-4 rounded-lg">
                      <h3 className="text-lg font-bold text-red-400 border-b border-gray-700 pb-2 mb-3">Estilos Musicais</h3>
                      <div className="flex flex-wrap gap-2">
                          {venue.musicStyles?.map(style => <span key={style} className="bg-gray-700 text-gray-200 text-sm font-medium px-3 py-1 rounded-full">{style}</span>)}
                      </div>
                  </div>
                  <div className="bg-gray-900/50 p-4 rounded-lg">
                      <h3 className="text-lg font-bold text-red-400 border-b border-gray-700 pb-2 mb-3">Detalhes</h3>
                      <ul className="space-y-2 text-gray-300">
                          {venue.capacity && <li className="flex items-center gap-2"><i className="fas fa-users fa-fw text-gray-500"></i>Capacidade: {venue.capacity} pessoas</li>}
                          {venue.contact && <li className="flex items-center gap-2"><i className="fas fa-user fa-fw text-gray-500"></i>Contato: {venue.contact.name}</li>}
                          {venue.contact && <li className="flex items-center gap-2"><i className="fas fa-phone fa-fw text-gray-500"></i>Telefone: {venue.contact.phone}</li>}
                      </ul>
                  </div>
                    <div className="bg-gray-900/50 p-4 rounded-lg">
                      <h3 className="text-lg font-bold text-red-400 border-b border-gray-700 pb-2 mb-3">Na Web</h3>
                      <div className="flex flex-col space-y-3">
                          {venue.website && <a href={venue.website} target="_blank" rel="noopener noreferrer" className="text-white hover:text-red-400 transition-colors flex items-center gap-2"><i className="fas fa-globe fa-fw text-gray-500"></i>Visitar Website <i className="fas fa-external-link-alt text-xs"></i></a>}
                          {venue.socials?.instagram && <a href={venue.socials.instagram} target="_blank" rel="noopener noreferrer" className="text-white hover:text-red-400 transition-colors flex items-center gap-2"><i className="fab fa-instagram fa-fw text-gray-500"></i>Instagram</a>}
                      </div>
                  </div>
              </aside>
          </div>
      </div>
    </div>
  );
};

export default VenueDetailPanel;