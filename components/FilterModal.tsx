import React, { useState, useEffect } from 'react';

type SortOrder = 'default' | 'name-asc' | 'name-desc' | 'genre-asc' | 'genre-desc';

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (filters: {
        searchTerm: string;
        selectedGenre: string;
        selectedDate: string;
        sortOrder: SortOrder;
    }) => void;
    initialFilters: {
        searchTerm: string;
        selectedGenre: string;
        selectedDate: string;
        sortOrder: SortOrder;
    };
    genres: string[];
}

const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, onApply, initialFilters, genres }) => {
    const [searchTerm, setSearchTerm] = useState(initialFilters.searchTerm);
    const [selectedGenre, setSelectedGenre] = useState(initialFilters.selectedGenre);
    const [selectedDate, setSelectedDate] = useState(initialFilters.selectedDate);
    const [sortOrder, setSortOrder] = useState<SortOrder>(initialFilters.sortOrder);
    
    useEffect(() => {
        if (isOpen) {
            setSearchTerm(initialFilters.searchTerm);
            setSelectedGenre(initialFilters.selectedGenre);
            setSelectedDate(initialFilters.selectedDate);
            setSortOrder(initialFilters.sortOrder);
        }
    }, [isOpen, initialFilters]);

    if (!isOpen) {
        return null;
    }

    const handleApply = () => {
        onApply({ searchTerm, selectedGenre, selectedDate, sortOrder });
    };

    const handleClear = () => {
        setSearchTerm('');
        setSelectedGenre('Todos');
        setSelectedDate('');
        setSortOrder('default');
    };
    
    const today = new Date().toISOString().split('T')[0];

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex flex-col z-50 animate-fade-in"
            aria-modal="true"
            role="dialog"
        >
            <div className="bg-gray-800 w-full max-w-full h-full flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-700 flex-shrink-0">
                    <h2 className="text-xl font-bold text-white">Filtrar e Ordenar</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl" aria-label="Fechar modal de filtros">
                        &times;
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6 overflow-y-auto flex-grow">
                    <div>
                        <label htmlFor="modal-search" className="block text-sm font-medium text-gray-300 mb-2">Nome do Artista</label>
                        <input
                            id="modal-search"
                            type="text"
                            placeholder="Buscar por nome..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="modal-genre" className="block text-sm font-medium text-gray-300 mb-2">Gênero Musical</label>
                        <select
                            id="modal-genre"
                            value={selectedGenre}
                            onChange={(e) => setSelectedGenre(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none"
                        >
                            {genres.map(genre => (
                                <option key={genre} value={genre}>{genre === 'Todos' ? 'Todos os Gêneros' : genre}</option>
                            ))}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="modal-date" className="block text-sm font-medium text-gray-300 mb-2">Data de Disponibilidade</label>
                        <input
                            id="modal-date"
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            min={today}
                            className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                         />
                    </div>
                    <div>
                        <label htmlFor="modal-sort" className="block text-sm font-medium text-gray-300 mb-2">Ordenar por</label>
                        <select
                            id="modal-sort"
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                            className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none"
                        >
                            <option value="default" disabled>Selecionar ordenação...</option>
                            <option value="name-asc">Nome (A-Z)</option>
                            <option value="name-desc">Nome (Z-A)</option>
                            <option value="genre-asc">Gênero (A-Z)</option>
                            <option value="genre-desc">Gênero (Z-A)</option>
                        </select>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-4 p-4 border-t border-gray-700 flex-shrink-0">
                    <button
                        onClick={handleClear}
                        className="w-1/2 bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded-md transition-colors"
                    >
                        Limpar
                    </button>
                    <button
                        onClick={handleApply}
                        className="w-1/2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-md transition-colors"
                    >
                        Aplicar Filtros
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FilterModal;
