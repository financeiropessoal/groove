import React from 'react';
import Modal from './Modal';
import { Artist } from '../data';

// This component was empty, which can sometimes cause obscure build errors.
// Providing a basic functional component structure as a failsafe.

interface ArtistDetailModalProps {
  artist: Artist | null;
  onClose: () => void;
}

const ArtistDetailModal: React.FC<ArtistDetailModalProps> = ({ artist, onClose }) => {
  if (!artist) {
    return null;
  }

  return (
    <Modal onClose={onClose}>
      <div className="bg-gray-800 p-6 rounded-lg text-white max-w-lg">
        <h2 className="text-2xl font-bold">{artist.name}</h2>
        <p className="text-gray-400">{artist.genre.primary}</p>
        <button onClick={onClose} className="mt-4 bg-red-600 px-4 py-2 rounded">Fechar</button>
      </div>
    </Modal>
  );
};

export default ArtistDetailModal;
