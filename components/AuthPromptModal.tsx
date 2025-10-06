import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Modal from './Modal';

interface AuthPromptModalProps {
  onClose: () => void;
  artistId?: string;
  selectedDates?: Date[];
}

const AuthPromptModal: React.FC<AuthPromptModalProps> = ({ onClose, artistId, selectedDates }) => {
    const location = useLocation();

    // Construct the redirect path for after login
    let fromPath = location.pathname + location.search;
    if (artistId && selectedDates && selectedDates.length > 0) {
        const dateString = selectedDates.map(date => date.toISOString().split('T')[0]).join(',');
        fromPath = `/booking/${artistId}?dates=${dateString}`;
    }

    return (
        <Modal onClose={onClose}>
            <div className="bg-gray-800 p-8 rounded-lg text-white max-w-md text-center">
                <h2 className="text-2xl font-bold mb-4">Ação Exclusiva para Contratantes</h2>
                <p className="text-gray-400 mb-6">Para contratar artistas ou enviar mensagens, você precisa ter uma conta de contratante.</p>
                <div className="flex flex-col gap-4">
                    <Link 
                        to="/venue-login"
                        state={{ from: fromPath }}
                        onClick={onClose}
                        className="w-full bg-gradient-to-r from-pink-500 to-orange-500 text-white font-bold py-3 px-4 rounded-lg"
                    >
                        Fazer Login
                    </Link>
                    <Link 
                        to="/venue-signup"
                        state={{ from: fromPath }}
                        onClick={onClose}
                        className="w-full bg-gray-600 text-white font-bold py-3 px-4 rounded-lg"
                    >
                        Criar Conta de Contratante
                    </Link>
                </div>
            </div>
        </Modal>
    );
};

export default AuthPromptModal;
