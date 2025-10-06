import React, { memo } from 'react';
import { Musician } from '../types';

interface MusicianCardProps {
  musician: Musician;
  onSelect: (musician: Musician) => void;
}

const MusicianCard: React.FC<MusicianCardProps> = ({ musician, onSelect }) => {
  return (
    <div onClick={() => onSelect(musician)} className="bg-gray-800 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-700 transition-colors">
      <img src={musician.imageUrl} alt={musician.name} className="w-24 h-24 rounded-full mx-auto object-cover mb-4" />
      <h3 className="font-bold text-lg">{musician.name}</h3>
      <p className="text-pink-400">{musician.instrument}</p>
      <p className="text-sm text-gray-400">{musician.city}</p>
    </div>
  );
};

export default memo(MusicianCard);
