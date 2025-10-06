import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Venue } from '../data';
import { VenueService } from '../services/VenueService';
import VenueCard from './VenueCard';
import SlidingPanel from './SlidingPanel';
import VenueDetailPanel from './VenueDetailPanel';
import Pagination from './Pagination';

const ITEMS_PER_PAGE = 12;

const VenueList: React.FC = () => {
  const [allVenues, setAllVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  
  useEffect(() => {
    const fetchVenues = async () => {
        setIsLoading(true);
        const fetchedVenues = await VenueService.getAllVenues();
        setAllVenues(fetchedVenues);
        setIsLoading(false);
    };
    fetchVenues();
  }, []);

  useEffect(() => {
    if (params.id && allVenues.length > 0) {
        const venue = allVenues.find(v => v.id === params.id);
        if (venue) {
            setSelectedVenue(venue);
        } else {
            navigate('/venues', { replace: true });
        }
    } else {
        setSelectedVenue(null);
    }
  }, [params.id, navigate, allVenues]);

  const handleSelectVenue = useCallback((venue: Venue) => {
    navigate(`/venues/${venue.id}`);
  }, [navigate]);

  const handleClosePanel = useCallback(() => {
      navigate('/venues');
  }, [navigate]);

  const filteredVenues = useMemo(() => {
    return allVenues.filter(venue =>
      venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allVenues, searchTerm]);

  const paginatedVenues = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredVenues.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredVenues, currentPage]);

  return (
    <div>
      <h2 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent mb-6">Locais Parceiros</h2>
      
      <div className="mb-8">
        <input
          type="text"
          placeholder="Buscar por nome ou endereço do local..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-md py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <i className="fas fa-spinner fa-spin text-4xl text-pink-500"></i>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedVenues.map(venue => (
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
      )}

      <SlidingPanel isOpen={!!selectedVenue} onClose={handleClosePanel}>
        {selectedVenue && <VenueDetailPanel venue={selectedVenue} onClose={handleClosePanel} />}
      </SlidingPanel>
    </div>
  );
};

export default VenueList;
