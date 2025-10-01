import React from 'react';
import { Link } from 'react-router-dom';
import Modal from './Modal';

interface AuthPromptModalProps {
  onClose: () => void;
  artistId: string;
  selectedDates: Date[];
}

const AuthPromptModal: React.FC<AuthPromptModalProps> = ({ onClose, artistId, selectedDates }) => {

  const dateString = selectedDates.map(date => date.toISOString().split('T')[0]).join(',');
  const bookingUrl = `/booking/${artistId}?dates=${dateString}`;

  return (
    <Modal onClose={onClose}>
      <div className="bg-gray-800 rounded-lg overflow-hidden shadow-2xl max-w-md w-full text-white text-center">
        <div className="p-8">
          <div className="text-5xl text-red-500 mb-4">
            <i className="fas fa-lock"></i>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Faça login para continuar</h2>
          <p className="text-gray-400 mb-6">Você precisa ter uma conta de contratante para reservar um artista.</p>
          
          <div className="space-y-4">
            <Link 
              to="/venue-login" 
              state={{ from: bookingUrl }}
              className="block w-full bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition-colors hover:bg-red-700"
            >
              Entrar
            </Link>
            <Link 
              to="/venue-signup" 
              state={{ from: bookingUrl }}
              className="block w-full bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors hover:bg-gray-500"
            >
              Cadastrar-se
            </Link>
          </div>
        </div>

        <div className="bg-gray-900 p-4">
            <button
                onClick={onClose}
                className="text-sm text-gray-400 hover:text-white transition-colors"
            >
                Cancelar
            </button>
        </div>
      </div>
    </Modal>
  );
};

export default AuthPromptModal;