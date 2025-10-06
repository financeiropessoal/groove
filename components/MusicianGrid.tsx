import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Musician } from '../types';
import { MusicianService } from '../services/MusicianService';
import MusicianCard from './MusicianCard';
import SlidingPanel from './SlidingPanel';
import MusicianDetailPanel from './MusicianDetailPanel';
import Pagination from './Pagination';

const ITEMS_PER_PAGE = 12;

const MusicianGrid: React.FC = () => {
    const [allMusicians, setAllMusicians] = useState<Musician[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [cityTerm, setCityTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedMusician, setSelectedMusician] = useState<Musician | null>(null);

    useEffect(() => {
        MusicianService.getAllMusicians().then(data => {
            setAllMusicians(data);
            setIsLoading(false);
        });
    }, []);

    const handleSelectMusician = useCallback((musician: Musician) => {
        setSelectedMusician(musician);
    }, []);

    const handleClosePanel = useCallback(() => {
        setSelectedMusician(null);
    }, []);

    const filteredMusicians = useMemo(() => {
        return allMusicians.filter(m => 
            (m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.instrument.toLowerCase().includes(searchTerm.toLowerCase())) &&
            m.city.toLowerCase().includes(cityTerm.toLowerCase())
        );
    }, [allMusicians, searchTerm, cityTerm]);

    const paginatedMusicians = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredMusicians.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredMusicians, currentPage]);

    return (
        <div>
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-500 mb-6">Encontre Músicos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <input
                    type="text"
                    placeholder="Buscar por nome ou instrumento..."
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
                <p>Carregando músicos...</p>
            ) : (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {paginatedMusicians.map(musician => (
                            <MusicianCard key={musician.id} musician={musician} onSelect={handleSelectMusician} />
                        ))}
                    </div>
                    <Pagination 
                        currentPage={currentPage}
                        totalItems={filteredMusicians.length}
                        itemsPerPage={ITEMS_PER_PAGE}
                        onPageChange={setCurrentPage}
                    />
                </>
            )}
             <SlidingPanel isOpen={!!selectedMusician} onClose={handleClosePanel}>
                {selectedMusician && <MusicianDetailPanel musician={selectedMusician} onClose={handleClosePanel} />}
            </SlidingPanel>
        </div>
    );
};

export default MusicianGrid;