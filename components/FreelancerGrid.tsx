import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Artist } from '../types';
import { ArtistService } from '../services/ArtistService';
import FreelancerCard from './FreelancerCard';
import SlidingPanel from './SlidingPanel';
import FreelancerDetailPanel from './FreelancerDetailPanel';
import Pagination from './Pagination';

const ITEMS_PER_PAGE = 12;

const FreelancerGrid: React.FC = () => {
    const [allFreelancers, setAllFreelancers] = useState<Artist[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [cityTerm, setCityTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedFreelancer, setSelectedFreelancer] = useState<Artist | null>(null);

    useEffect(() => {
        ArtistService.getAllArtists().then(data => {
            setAllFreelancers(data.filter(artist => artist.is_freelancer));
            setIsLoading(false);
        });
    }, []);

    const handleSelectFreelancer = useCallback((freelancer: Artist) => {
        setSelectedFreelancer(freelancer);
    }, []);

    const handleClosePanel = useCallback(() => {
        setSelectedFreelancer(null);
    }, []);

    const filteredFreelancers = useMemo(() => {
        return allFreelancers.filter(f => 
            (f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (f.freelancer_instruments || []).some(inst => inst.toLowerCase().includes(searchTerm.toLowerCase()))) &&
            f.city.toLowerCase().includes(cityTerm.toLowerCase())
        );
    }, [allFreelancers, searchTerm, cityTerm]);

    const paginatedFreelancers = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredFreelancers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredFreelancers, currentPage]);

    return (
        <div>
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-500 mb-6">Encontre Músicos Freelancers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <input
                    type="text"
                    placeholder="Buscar por nome ou instrumento (ex: Guitarra)..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md py-3 px-4"
                />
                 <input
                    type="text"
                    placeholder="Filtrar por cidade..."
                    value={cityTerm}
                    onChange={e => setCityTerm(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md py-3 px-4"
                />
            </div>
            {isLoading ? (
                <div className="text-center py-12">
                    <i className="fas fa-spinner fa-spin text-4xl text-pink-500"></i>
                    <p className="text-gray-300 mt-4">Carregando freelancers...</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {paginatedFreelancers.map(freelancer => (
                            <FreelancerCard key={freelancer.id} freelancer={freelancer} onSelect={handleSelectFreelancer} />
                        ))}
                    </div>
                    <Pagination 
                        currentPage={currentPage}
                        totalItems={filteredFreelancers.length}
                        itemsPerPage={ITEMS_PER_PAGE}
                        onPageChange={setCurrentPage}
                    />
                </>
            )}
             <SlidingPanel isOpen={!!selectedFreelancer} onClose={handleClosePanel}>
                {selectedFreelancer && <FreelancerDetailPanel freelancer={selectedFreelancer} onClose={handleClosePanel} />}
            </SlidingPanel>
        </div>
    );
};

export default FreelancerGrid;