import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ArtistCard from './ArtistCard';
import FilterModal from './FilterModal';
// FIX: Corrected import path for ArtistDetailPanel component. It was pointing to an empty file.
import ArtistDetailPanel from './ArtistDetailPanel';
import { Artist } from '../data';
import { ArtistService } from '../services/ArtistService';
import SlidingPanel from './SlidingPanel';
import Pagination from './Pagination';


type SortOrder = 'default' | 'name-asc' | 'name-desc' | 'genre-asc' | 'genre-desc';
const ITEMS_PER_PAGE = 12;

const ArtistGrid: React.FC = () => {
  const [allArtists, setAllArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('Todos');
  const [selectedDate, setSelectedDate] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('default');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  
  useEffect(() => {
    const fetchArtists = async () => {
        setIsLoading(true);
        const fetchedArtists = await ArtistService.getAllArtists();
        setAllArtists(fetchedArtists);
        setIsLoading(false);
    };
    fetchArtists();
  }, []);

  useEffect(() => {
    if (params.id && allArtists.length > 0) {
        const artist = allArtists.find(a => a.id === params.id);
        if (artist) {
            setSelectedArtist(artist);
        } else {
            navigate('/artists', { replace: true });
        }
    } else {
        setSelectedArtist(null);
    }
  }, [params.id, navigate, allArtists]);

  const handleSelectArtist = useCallback((artist: Artist) => {
    navigate(`/artists/${artist.id}`);
  }, [navigate]);

  const handleClosePanel = useCallback(() => {
      navigate('/artists');
  }, [navigate]);


  const genres = useMemo(() => ['Todos', ...new Set(allArtists.map(artist => artist.genre.primary))], [allArtists]);

  const filteredArtists = useMemo(() => {
    let sortedAndFilteredArtists = allArtists
      .filter(artist => {
        // Genre filter
        return selectedGenre === 'Todos' || artist.genre.primary === selectedGenre;
      })
      .filter(artist => {
        // Search term filter
        return artist.name.toLowerCase().includes(searchTerm.toLowerCase());
      })
      .filter(artist => {
        // Date availability filter
        if (!selectedDate) return true;
        return !artist.bookedDates?.includes(selectedDate);
      });

    switch (sortOrder) {
        case 'name-asc':
            sortedAndFilteredArtists.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            sortedAndFilteredArtists.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'genre-asc':
            sortedAndFilteredArtists.sort((a, b) => a.genre.primary.localeCompare(b.genre.primary));
            break;
        case 'genre-desc':
            sortedAndFilteredArtists.sort((a, b) => b.genre.primary.localeCompare(a.genre.primary));
            break;
        default:
            break;
    }

    return sortedAndFilteredArtists;

  }, [allArtists, searchTerm, selectedGenre, selectedDate, sortOrder]);
  
  const paginatedArtists = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredArtists.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredArtists, currentPage]);

  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<any>>) => (value: any) => {
      setter(value);
      setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedGenre('Todos');
    setSelectedDate('');
    setSortOrder('default');
    setCurrentPage(1);
  };

  const handleApplyModalFilters = (filters: {
    searchTerm: string;
    selectedGenre: string;
    selectedDate: string;
    sortOrder: SortOrder;
  }) => {
    setSearchTerm(filters.searchTerm);
    setSelectedGenre(filters.selectedGenre);
    setSelectedDate(filters.selectedDate);
    setSortOrder(filters.sortOrder);
    setIsFilterModalOpen(false);
    setCurrentPage(1);
  };


  const today = new Date().toISOString().split('T')[0];
  
  const activeFilterCount = [
    searchTerm !== '',
    selectedGenre !== 'Todos',
    selectedDate !== '',
    sortOrder !== 'default'
  ].filter(Boolean).length;
  
  const hasActiveFilters = activeFilterCount > 0;
  
  const hasArtists = filteredArtists.length > 0;

  return (
    <div>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <h2 className="text-3xl font-bold text-red-500 shrink-0">Nossos Artistas</h2>
        </div>
      
      {/* Desktop Filter Bar */}
      <div className="hidden md:block mb-8 p-4 bg-gray-800 rounded-lg">
        <div className="flex flex-row flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-64">
                <input
                    type="text"
                    placeholder="Buscar por nome do artista..."
                    value={searchTerm}
                    onChange={(e) => handleFilterChange(setSearchTerm)(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                    aria-label="Buscar artista por nome"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-search text-gray-400"></i>
                </div>
            </div>
            <div className="relative w-auto min-w-48">
                <select
                    value={selectedGenre}
                    onChange={(e) => handleFilterChange(setSelectedGenre)(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none transition-colors"
                    aria-label="Filtrar por gênero"
                >
                    {genres.map(genre => (
                        <option key={genre} value={genre}>{genre === 'Todos' ? 'Todos os Gêneros' : genre}</option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                     <i className="fas fa-chevron-down text-gray-400 text-xs"></i>
                </div>
            </div>
            <div className="relative w-auto">
                 <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => handleFilterChange(setSelectedDate)(e.target.value)}
                    min={today}
                    className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                    aria-label="Filtrar por data de disponibilidade"
                 />
            </div>
             <div className="relative w-auto min-w-48">
                <select
                    value={sortOrder}
                    onChange={(e) => handleFilterChange(setSortOrder)(e.target.value as SortOrder)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none transition-colors"
                    aria-label="Ordenar artistas"
                >
                    <option value="default" disabled>Ordenar por...</option>
                    <option value="name-asc">Nome (A-Z)</option>
                    <option value="name-desc">Nome (Z-A)</option>
                    <option value="genre-asc">Gênero (A-Z)</option>
                    <option value="genre-desc">Gênero (Z-A)</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                     <i className="fas fa-sort-amount-down text-gray-400"></i>
                </div>
            </div>
            
             {hasActiveFilters && (
                <button
                    onClick={handleClearFilters}
                    className="bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2.5 px-4 rounded-md transition-colors flex items-center justify-center gap-2 flex-shrink-0"
                    aria-label="Limpar todos os filtros"
                >
                    <i className="fas fa-times"></i>
                    <span>Limpar</span>
                </button>
            )}
        </div>
      </div>

      {/* Mobile Filter Button */}
      <div className="md:hidden mb-6">
        <button
          onClick={() => setIsFilterModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition-colors relative"
        >
          <i className="fas fa-sliders-h"></i>
          Filtrar e Ordenar
          {hasActiveFilters && (
            <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-gray-900">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
            <i className="fas fa-spinner fa-spin text-4xl text-red-500"></i>
            <p className="text-gray-300 mt-4">Carregando artistas...</p>
        </div>
      ) : hasArtists ? (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-8">
              {paginatedArtists.map(artist => (
                  <ArtistCard key={artist.id} artist={artist} onSelect={handleSelectArtist} />
              ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalItems={filteredArtists.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </>
      ) : (
        <div className="text-center py-12 bg-gray-800/50 rounded-lg">
          <p className="text-gray-300 text-lg font-semibold">Nenhum artista encontrado</p>
          <p className="text-gray-400 mt-2">Tente ajustar seus filtros de busca para melhores resultados.</p>
           {hasActiveFilters && (
             <button
                onClick={handleClearFilters}
                className="mt-6 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-5 rounded-md transition-colors"
            >
                Limpar Filtros
            </button>
           )}
        </div>
      )}

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleApplyModalFilters}
        initialFilters={{ searchTerm, selectedGenre, selectedDate, sortOrder }}
        genres={genres}
      />
      <SlidingPanel isOpen={!!selectedArtist} onClose={handleClosePanel}>
        {selectedArtist && <ArtistDetailPanel artist={selectedArtist} onClose={handleClosePanel} />}
      </SlidingPanel>
    </div>
  );
};

export default ArtistGrid;
