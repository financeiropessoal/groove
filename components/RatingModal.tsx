import React, { useState } from 'react';
import StarRating from './StarRating';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  itemToRate: {
    name: string;
    type: 'o artista' | 'o local';
  } | null;
}

const RatingModal: React.FC<RatingModalProps> = ({ isOpen, onClose, onSubmit, itemToRate }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !itemToRate) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating > 0) {
        setIsSubmitting(true);
        // Simulate API call delay
        setTimeout(() => {
            onSubmit(rating, comment.trim());
            setIsSubmitting(false);
            setRating(0);
            setComment('');
        }, 700);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-gray-800 w-full max-w-lg rounded-lg shadow-2xl text-white" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h3 className="text-2xl font-bold text-white mb-2">Qualificar Performance</h3>
            <p className="text-gray-400 mb-6">Sua avaliação sobre <span className="font-bold text-red-400">{itemToRate.name}</span> será compartilhada de forma privada.</p>
            
            <div className="mb-6 text-center">
                <p className="text-gray-300 mb-3">Qual nota você daria para {itemToRate.type}?</p>
                <StarRating rating={rating} onRatingChange={setRating} />
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder={`Deixe um comentário (opcional) sobre a sua experiência com ${itemToRate.name}...`}
            />
          </div>
          <div className="bg-gray-700/50 px-6 py-4 flex justify-end gap-4 rounded-b-lg">
            <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-500 transition-colors">
              Cancelar
            </button>
            <button 
                type="submit" 
                disabled={rating === 0 || isSubmitting} 
                className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    <span>Enviando...</span>
                  </>
              ) : (
                  'Enviar Qualificação'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RatingModal;
