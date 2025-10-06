import React, { useState } from 'react';
import { useVenueAuth } from '../contexts/VenueAuthContext';
import { useToast } from '../contexts/ToastContext';
import { GigService } from '../services/GigService';
import { useNavigate, Link } from 'react-router-dom';

const OfferGigPage: React.FC = () => {
  const { currentVenue } = useVenueAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('20:00');
  const [endTime, setEndTime] = useState('23:00');
  const [payment, setPayment] = useState<number | ''>('');
  const [genre, setGenre] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentVenue || !payment) {
      showToast('Por favor, preencha todos os campos obrigatórios.', 'error');
      return;
    }
    setIsSubmitting(true);
    const success = await GigService.addGig({
      venueId: currentVenue.id,
      date,
      startTime,
      endTime,
      payment: Number(payment),
      genre,
      notes,
    });

    if (success) {
      showToast('Vaga publicada com sucesso! Artistas relevantes serão notificados.', 'success');
      navigate('/sent-offers');
    } else {
      showToast('Erro ao publicar vaga. Tente novamente.', 'error');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
          <Link to="/venue-dashboard" className="text-gray-400 hover:text-white transition-colors" aria-label="Voltar ao painel">
              <i className="fas fa-arrow-left text-2xl"></i>
          </Link>
          <h1 className="text-3xl font-bold">Publicar Vaga Aberta</h1>
      </div>
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg space-y-6">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-2">Data</label>
          <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="startTime" className="block text-sm font-medium text-gray-300 mb-2">Início</label>
            <input type="time" id="startTime" value={startTime} onChange={e => setStartTime(e.target.value)} required className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3" />
          </div>
          <div>
            <label htmlFor="endTime" className="block text-sm font-medium text-gray-300 mb-2">Término</label>
            <input type="time" id="endTime" value={endTime} onChange={e => setEndTime(e.target.value)} required className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3" />
          </div>
        </div>
        <div>
          <label htmlFor="payment" className="block text-sm font-medium text-gray-300 mb-2">Cachê (R$)</label>
          <input type="number" id="payment" value={payment} onChange={e => setPayment(e.target.valueAsNumber)} required className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3" />
        </div>
        <div>
          <label htmlFor="genre" className="block text-sm font-medium text-gray-300 mb-2">Gênero Principal Desejado</label>
          <input type="text" id="genre" value={genre} onChange={e => setGenre(e.target.value)} placeholder="Ex: MPB, Rock, Samba" required className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3" />
        </div>
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-2">Notas Adicionais (opcional)</label>
          <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3"></textarea>
        </div>
        <div className="pt-4">
          <button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-pink-500 to-orange-500 text-white font-bold py-3 rounded-lg disabled:opacity-50">
            {isSubmitting ? 'Publicando...' : 'Publicar Vaga'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OfferGigPage;