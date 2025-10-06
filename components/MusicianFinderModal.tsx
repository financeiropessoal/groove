import React, { useState, useEffect } from 'react';
import { Musician } from '../types';
import { MusicianService } from '../services/MusicianService';
import Modal from './Modal';

interface MusicianFinderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onMusicianSelect: (musician: Musician) => void;
}

const MusicianFinderModal: React.FC<MusicianFinderModalProps> = ({ isOpen, onClose, onMusicianSelect }) => {
    const [musicians, setMusicians] = useState<Musician[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            MusicianService.getAllMusicians().then(data => {
                setMusicians(data);
                setIsLoading(false);
            });
        }
    }, [isOpen]);

    const filteredMusicians = musicians.filter(m => 
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.instrument.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <Modal onClose={onClose}>
            <div className="bg-gray-800 p-6 rounded-lg text-white w-[90vw] max-w-2xl">
                <h2 className="text-2xl font-bold mb-4">Encontrar Músico</h2>
                <input
                    type="text"
                    placeholder="Buscar por nome ou instrumento..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-4 mb-4"
                />
                <div className="max-h-96 overflow-y-auto">
                    {isLoading ? <p>Carregando...</p> : (
                        <ul className="space-y-2">
                            {filteredMusicians.map(musician => (
                                <li key={musician.id} onClick={() => onMusicianSelect(musician)} className="flex items-center gap-4 p-2 rounded-md hover:bg-gray-700 cursor-pointer">
                                    <img src={musician.imageUrl} alt={musician.name} className="w-12 h-12 rounded-full object-cover"/>
                                    <div>
                                        <p className="font-semibold">{musician.name}</p>
                                        <p className="text-sm text-gray-400">{musician.instrument}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default MusicianFinderModal;
