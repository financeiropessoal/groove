import React, { memo } from 'react';
import { Artist } from '../types';

interface FreelancerCardProps {
  freelancer: Artist;
  onSelect: (freelancer: Artist) => void;
}

const FreelancerCard: React.FC<FreelancerCardProps> = ({ freelancer, onSelect }) => {
  const mainInstrument = freelancer.freelancer_instruments ? freelancer.freelancer_instruments[0] : 'Músico';

  return (
    <div onClick={() => onSelect(freelancer)} className="bg-gray-800 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-700 transition-colors transform hover:-translate-y-1 duration-300">
      <img src={freelancer.imageUrl} alt={freelancer.name} className="w-24 h-24 rounded-full mx-auto object-cover mb-4 border-2 border-gray-700" />
      <h3 className="font-bold text-lg truncate">{freelancer.name}</h3>
      <p className="text-pink-400 text-sm truncate">{mainInstrument}</p>
      <p className="text-xs text-gray-400 truncate">{freelancer.city}</p>
      {freelancer.freelancer_rate && freelancer.freelancer_rate > 0 && (
        <p className="text-xs text-green-400 mt-2 font-bold">
            R$ {freelancer.freelancer_rate.toFixed(2)} / {freelancer.freelancer_rate_unit}
        </p>
      )}
    </div>
  );
};

export default memo(FreelancerCard);