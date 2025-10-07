
import React, { useState, useEffect } from 'react';
import { Artist as Musician } from '../types';
import { ArtistService } from '../services/ArtistService';
import Modal from './Modal';

interface FreelancerFinderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onMusicianSelect: (musician: Musician) => void;
}

const FreelancerFinderModal: React.FC<FreelancerFinderModalProps> = ({ isOpen, onClose, onMusicianSelect }) => {
    const [musicians, setMusicians] = useState<Musician[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            ArtistService.getAllArtists().then(data => {
                // Filter for artists who are also freelancers
                setMusicians(data.filter(artist => artist.is_freelancer));
                setIsLoading(false);
            });
        }
    }, [isOpen]);

    const filteredMusicians = musicians.filter(m => 
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.freelancer_instruments || []).some(inst => inst.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (!isOpen) return null;

    return (
        <Modal onClose={onClose}>
            <div className="bg-gray-800 p-6 rounded-lg text-white w-[90vw] max-w-2xl">
                <h2 className="text-2xl font-bold mb-4">Encontrar Músico Freelancer</h2>
                <input
                    type="text"
                    placeholder="Buscar por nome ou instrumento..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-4 mb-4"
                />
                <div className="max-h-96 overflow-y-auto">
                    {isLoading ? <div className="text-center p-8"><i className="fas fa-spinner fa-spin text-2xl"></i></div> : (
                        <ul className="space-y-2">
                            {filteredMusicians.length > 0 ? filteredMusicians.map(musician => (
                                <li key={musician.id} onClick={() => onMusicianSelect(musician as any)} className="flex items-center gap-4 p-2 rounded-md hover:bg-gray-700 cursor-pointer">
                                    <img src={musician.imageUrl} alt={musician.name} className="w-12 h-12 rounded-full object-cover"/>
                                    <div>
                                        <p className="font-semibold">{musician.name}</p>
                                        <p className="text-sm text-gray-400">{musician.freelancer_instruments?.join(', ')}</p>
                                    </div>
                                </li>
                            )) : <p className="text-center text-gray-400 p-4">Nenhum músico encontrado.</p>}
                        </ul>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default FreelancerFinderModal;
