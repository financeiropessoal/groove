import React from 'react';
import Modal from './Modal';

interface RatingModalProps {
  onClose: () => void;
}

const RatingModal: React.FC<RatingModalProps> = ({ onClose }) => {
  return (
    <Modal onClose={onClose}>
      <div className="bg-gray-800 p-6 rounded-lg text-white">
        <h2>Avaliar Artista</h2>
      </div>
    </Modal>
  );
};

export default RatingModal;
