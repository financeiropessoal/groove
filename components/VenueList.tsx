import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Venue } from '../data';
import VenueCard from './VenueCard';
import VenueDetailPanel from './VenueDetailPanel';
import { VenueService } from '../services/VenueService';
import SlidingPanel from './SlidingPanel';
import Pagination from './Pagination';

const ITEMS_PER_PAGE = 5;

const VenueList: React.FC = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

  useEffect(() => {
    const fetchVenues = async () => {
        setIsLoading(true);
        const fetchedVenues = await VenueService.getAllVenues();
        setVenues(fetchedVenues);
        setIsLoading(false);
    };
    fetchVenues();
  }, []);

  useEffect(() => {
    if (params.id && venues.length > 0) {
        const venue = venues.find(v => v.id === params.id);
        if (venue) {
            setSelectedVenue(venue);
        } else {
            // If venue not found, navigate back to the list
            navigate('/venues', { replace: true });
        }
    } else {
        setSelectedVenue(null);
    }
  }, [params.id, navigate, venues]);

  const handleSelectVenue = useCallback((venue: Venue) => {
    navigate(`/venues/${venue.id}`);
  }, [navigate]);

  const handleClosePanel = useCallback(() => {
      navigate('/venues');
  }, [navigate]);


  const musicStyles = useMemo(() => {
    const allStyles = new Set(venues.flatMap(venue => venue.musicStyles || []));
    return ['Todos', ...Array.from(allStyles).sort()];
  }, [venues]);

  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (value: string) => {
      setter(value);
      setCurrentPage(1);
  };
  
  const handleClearFilters = () => {
      setSearchTerm('');
      setSelectedStyle('Todos');
      setCurrentPage(1);
  }

  const filteredVenues = useMemo(() => {
    return venues
      .filter(venue => {
        // Search term filter (name and address)
        const lowerSearch = searchTerm.toLowerCase();
        return venue.name.toLowerCase().includes(lowerSearch) || venue.address.toLowerCase().includes(lowerSearch);
      })
      .filter(venue => {
        // Music style filter
        if (selectedStyle === 'Todos') return true;
        return venue.musicStyles?.includes(selectedStyle);
      });
  }, [venues, searchTerm, selectedStyle]);

  const paginatedVenues = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredVenues.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredVenues, currentPage]);


  return (
    <div>
      <div className="bg-gray-800 p-6 rounded-lg mb-8 text-center shadow-lg">
          <h3 className="text-2xl font-bold text-white">Seu estabelecimento precisa de música ao vivo?</h3>
          <p className="text-gray-300 mt-2">Cadastre seu bar ou restaurante e encontre os melhores talentos da cidade.</p>
          <Link to="/venue-signup" className="mt-4 inline-block bg-red-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-700 transition-transform transform hover:scale-105">
            Cadastrar Local Agora
          </Link>
        </div>

      <h2 className="text-3xl font-bold mb-6 text-red-500">Bares & Restaurantes Parceiros</h2>
      
      {/* Filter Bar */}
      <div className="mb-8 p-4 bg-gray-800 rounded-lg flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full sm:w-auto">
              <input
                  type="text"
                  placeholder="Buscar por nome ou endereço..."
                  value={searchTerm}
                  onChange={(e) => handleFilterChange(setSearchTerm)(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                  aria-label="Buscar local por nome ou endereço"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-search text-gray-400"></i>
              </div>
          </div>
          <div className="relative w-full sm:w-auto sm:min-w-48">
              <select
                  value={selectedStyle}
                  onChange={(e) => handleFilterChange(setSelectedStyle)(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none transition-colors"
                  aria-label="Filtrar por estilo musical"
              >
                  {musicStyles.map(style => (
                      <option key={style} value={style}>{style === 'Todos' ? 'Todos os Estilos' : style}</option>
                  ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                   <i className="fas fa-chevron-down text-gray-400 text-xs"></i>
              </div>
          </div>
      </div>


      {isLoading ? (
        <div className="text-center py-12">
            <i className="fas fa-spinner fa-spin text-4xl text-red-500"></i>
            <p className="text-gray-300 mt-4">Carregando locais parceiros...</p>
        </div>
      ) : filteredVenues.length > 0 ? (
        <>
          <div className="space-y-6">
            {paginatedVenues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} onSelect={handleSelectVenue} />
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalItems={filteredVenues.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </>
      ) : (
         <div className="text-center py-12 bg-gray-800/50 rounded-lg">
          <p className="text-gray-300 text-lg font-semibold">Nenhum local encontrado</p>
          <p className="text-gray-400 mt-2">Tente ajustar seus filtros de busca.</p>
           <button
              onClick={handleClearFilters}
              className="mt-6 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-5 rounded-md transition-colors"
          >
              Limpar Filtros
          </button>
        </div>
      )}

      <SlidingPanel isOpen={!!selectedVenue} onClose={handleClosePanel}>
        {selectedVenue && <VenueDetailPanel venue={selectedVenue} onClose={handleClosePanel} />}
      </SlidingPanel>
    </div>
  );
};

export default VenueList;
