import React, { useState } from 'react';
import { Artist, Venue } from '../data';
import { DirectOfferService } from '../services/DirectOfferService';
import { useToast } from '../contexts/ToastContext';

interface DirectOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  artist: Artist;
  venue: Venue;
}

const DirectOfferModal: React.FC<DirectOfferModalProps> = ({ isOpen, onClose, artist, venue }) => {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('20:00');
  const [endTime, setEndTime] = useState('22:00');
  const [payment, setPayment] = useState<number | ''>('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payment) {
        setError("Por favor, preencha o valor do cachê.");
        return;
    }
    
    setIsSending(true);
    setError('');

    const success = await DirectOfferService.createOffer({
        artistId: artist.id,
        venueId: venue.id,
        date,
        startTime,
        endTime,
        payment: Number(payment),
        message,
    });
    
    setIsSending(false);

    if (success) {
        showToast("Proposta enviada com sucesso! O artista será notificado.", 'success');
        onClose();
    } else {
        setError("Ocorreu um erro ao enviar a proposta. Tente novamente.");
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-gray-800 w-full max-w-lg rounded-lg shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h3 className="text-2xl font-bold text-white">Enviar Proposta Direta</h3>
            <p className="text-gray-400 mb-6">Para: <span className="font-bold text-red-400">{artist.name}</span></p>
            <div className="space-y-4">
              <div>
                <label htmlFor="offer-date" className="block text-sm font-medium text-gray-300 mb-1">Data do Show</label>
                <input id="offer-date" type="date" value={date} onChange={e => setDate(e.target.value)} min={today} required className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="offer-start" className="block text-sm font-medium text-gray-300 mb-1">Início</label>
                  <input id="offer-start" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
                <div>
                  <label htmlFor="offer-end" className="block text-sm font-medium text-gray-300 mb-1">Término</label>
                  <input id="offer-end" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
              </div>
              <div>
                <label htmlFor="offer-payment" className="block text-sm font-medium text-gray-300 mb-1">Cachê (R$)</label>
                <input id="offer-payment" type="number" value={payment} onChange={e => setPayment(e.target.value ? parseFloat(e.target.value) : '')} min="1" step="0.01" required placeholder="Ex: 800.00" className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
              <div>
                <label htmlFor="offer-message" className="block text-sm font-medium text-gray-300 mb-1">Mensagem (Opcional)</label>
                <textarea id="offer-message" value={message} onChange={e => setMessage(e.target.value)} rows={3} placeholder={`Olá ${artist.name}, gostamos muito do seu trabalho...`} className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
            </div>
            {error && <p className="text-red-400 text-sm mt-4 text-center">{error}</p>}
          </div>
          <div className="bg-gray-700/50 px-6 py-4 flex justify-end gap-4 rounded-b-lg">
            <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-500 transition-colors">Cancelar</button>
            <button type="submit" disabled={isSending} className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-500 disabled:cursor-wait flex items-center gap-2">
              {isSending ? (<><i className="fas fa-spinner fa-spin"></i><span>Enviando...</span></>) : 'Enviar Proposta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DirectOfferModal;
