import React, { useState } from 'react';
import { useToast } from '../contexts/ToastContext';
import { SupportService } from '../services/SupportService';
import { EnrichedBooking } from '../services/BookingService';

interface ReportProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: EnrichedBooking;
  reporter: { id: string; type: 'artist' | 'venue' };
}

const ReportProblemModal: React.FC<ReportProblemModalProps> = ({ isOpen, onClose, booking, reporter }) => {
  const [description, setDescription] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
        showToast('Por favor, descreva o problema.', 'error');
        return;
    }

    setIsSending(true);
    const success = await SupportService.createTicket({
      booking_id: booking.id,
      reporter_id: reporter.id,
      reporter_type: reporter.type,
      description: description.trim(),
    });

    if (success) {
      showToast('Seu ticket de suporte foi enviado com sucesso.', 'success');
      onClose();
    } else {
      showToast('Ocorreu um erro ao enviar seu ticket. Tente novamente.', 'error');
    }
    setIsSending(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-800 w-full max-w-lg rounded-lg shadow-2xl" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h3 className="text-xl font-bold text-white mb-2">Relatar um Problema</h3>
            <p className="text-gray-400 mb-4 text-sm">
              Sobre o show com <span className="font-semibold text-red-400">{booking.artistName || booking.venueName}</span> em {new Date(booking.date + 'T00:00:00').toLocaleDateString('pt-BR')}
            </p>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={5}
              className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Descreva o problema ocorrido em detalhes. Nossa equipe de suporte analisará o caso."
              required
            />
          </div>
          <div className="bg-gray-700/50 px-6 py-4 flex justify-end gap-4 rounded-b-lg">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 rounded">Cancelar</button>
            <button type="submit" disabled={isSending} className="px-4 py-2 bg-red-600 rounded disabled:bg-gray-500 disabled:cursor-wait">
              {isSending ? 'Enviando...' : 'Enviar Relatório'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportProblemModal;
