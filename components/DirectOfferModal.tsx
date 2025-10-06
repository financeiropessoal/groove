import React from 'react';
import Modal from './Modal';
import { Artist } from '../data';

interface DirectOfferModalProps {
  artist: Artist;
  onClose: () => void;
}

const DirectOfferModal: React.FC<DirectOfferModalProps> = ({ artist, onClose }) => {
  return (
    <Modal onClose={onClose}>
      <div className="bg-gray-800 p-6 rounded-lg text-white">
        <h2 className="text-2xl font-bold">Enviar Proposta Direta</h2>
        <p>Formulário para enviar proposta para {artist.name} iria aqui.</p>
      </div>
    </Modal>
  );
};

export default DirectOfferModal;
