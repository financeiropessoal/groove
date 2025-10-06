import React from 'react';
import { Musician } from '../types';

interface MusicianDetailPanelProps {
  musician: Musician;
  onClose: () => void;
}

const MusicianDetailPanel: React.FC<MusicianDetailPanelProps> = ({ musician, onClose }) => {
  return (
    <div className="bg-gray-800 w-full h-full shadow-2xl flex flex-col relative p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-white">&times;</button>
        <div className="text-center">
            <img src={musician.imageUrl} alt={musician.name} className="w-32 h-32 rounded-full mx-auto object-cover mb-4" />
            <h2 className="text-3xl font-bold">{musician.name}</h2>
            <p className="text-xl text-pink-400">{musician.instrument}</p>
            <p className="text-gray-400">{musician.city}</p>
        </div>
        <div className="mt-6">
            <h3 className="font-bold mb-2">Bio</h3>
            <p className="text-gray-300">{musician.bio}</p>
        </div>
        <div className="mt-6">
            <h3 className="font-bold mb-2">Estilos</h3>
            <div className="flex flex-wrap gap-2">
                {musician.styles?.map(style => <span key={style} className="bg-gray-700 px-2 py-1 text-sm rounded">{style}</span>)}
            </div>
        </div>
    </div>
  );
};

export default MusicianDetailPanel;
