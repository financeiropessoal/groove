import React from 'react';
// FIX: The Song type is exported from `types.ts`, not `data.ts`.
import { Song } from '../types';
import Modal from './Modal';

interface SongDetailModalProps {
  song: Song;
  onClose: () => void;
}

const SongDetailModal: React.FC<SongDetailModalProps> = ({ song, onClose }) => {
  return (
    <Modal onClose={onClose}>
      <div className="bg-gray-800 rounded-lg overflow-hidden shadow-2xl max-w-lg w-full text-white">
        <div className="p-6">
          <h2 className="text-3xl font-bold text-white">{song.title}</h2>
          <p className="text-lg text-red-400 mt-1">Original de: {song.artist}</p>
          {song.duration && (
             <p className="text-gray-400 mt-2 text-sm">
                <i className="far fa-clock mr-2"></i>Duração: {song.duration}
             </p>
          )}
        </div>
        
        {song.previewUrl && (
          <div className="px-6 pb-6">
            <h3 className="font-semibold text-white mb-2">Prévia da música:</h3>
            <audio controls autoPlay className="w-full" src={song.previewUrl}>
              Seu navegador não suporta o elemento de áudio.
            </audio>
          </div>
        )}

        <div className="bg-gray-900 p-4 text-right">
            <button
                onClick={onClose}
                className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
                Fechar
            </button>
        </div>
      </div>
    </Modal>
  );
};

export default SongDetailModal;