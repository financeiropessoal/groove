import React, { useState } from 'react';
import { Venue } from '../data';

interface VenueDetailPanelProps {
  venue: Venue;
  onClose: () => void;
}

const VenueDetailPanel: React.FC<VenueDetailPanelProps> = ({ venue, onClose }) => {
  const [activeTab, setActiveTab] = useState('about');

  return (
    <div className="bg-gray-800 w-full h-full shadow-2xl flex flex-col">
      <header className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-bold">{venue.name}</h2>
        <button onClick={onClose} className="text-2xl">&times;</button>
      </header>
      <main className="flex-1 overflow-y-auto p-6">
        <p>{venue.description}</p>
      </main>
    </div>
  );
};

export default VenueDetailPanel;
