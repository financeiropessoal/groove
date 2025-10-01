import React, { useState, useEffect } from 'react';
import { useVenueAuth } from '../contexts/VenueAuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { GigService } from '../services/GigService';
import { useToast } from '../contexts/ToastContext';

const OfferGigPage: React.FC = () => {
    const { currentVenue, isAuthenticated, logout } = useVenueAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [payment, setPayment] = useState<number | ''>('');
    const [genre, setGenre] = useState('');
    const [notes, setNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/venue-login', { state: { from: '/offer-gig' } });
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!payment || !currentVenue) return;
        
        setIsSaving(true);

        const success = await GigService.addGig({
            venueId: currentVenue.id,
            date,
            startTime,
            endTime,
            payment: Number(payment),
            genre,
            notes,
        });

        setIsSaving(false);
        if(success) {
            showToast("Data publicada com sucesso!", 'success');
            navigate('/venue-dashboard');
        } else {
            showToast("Erro ao publicar a data. Tente novamente.", 'error');
        }
    };
    
    const today = new Date().toISOString().split('T')[0];

    if (!currentVenue) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <p>Carregando...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
             <header className="bg-gray-800 shadow-md">
                 <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                         <Link to="/venue-dashboard" className="text-gray-300 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-700">
                             <i className="fas fa-arrow-left"></i>
                         </Link>
                        <h1 className="text-xl font-bold tracking-wider">Oferecer data para Show</h1>
                    </div>
                     <button onClick={logout} className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors">
                        <i className="fas fa-sign-out-alt"></i>
                        <span>Sair</span>
                     </button>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto bg-gray-800/50 p-8 rounded-lg">
                    <p className="text-center text-lg text-gray-300 mb-2">Publicando como <span className="font-bold text-red-400">{currentVenue.name}</span></p>
                    <p className="text-center text-sm text-gray-400 mb-6">Preencha os detalhes abaixo para que os artistas possam ver sua oferta.</p>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                         <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-2">Data do Show</label>
                            <input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                min={today}
                                required
                                className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="startTime" className="block text-sm font-medium text-gray-300 mb-2">Horário de Início</label>
                                <input
                                    id="startTime"
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    required
                                    className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="endTime" className="block text-sm font-medium text-gray-300 mb-2">Horário de Término</label>
                                <input
                                    id="endTime"
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    required
                                    className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="payment" className="block text-sm font-medium text-gray-300 mb-2">Valor do Cachê (R$)</label>
                            <div className="relative">
                               <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">R$</span>
                               <input
                                    id="payment"
                                    type="number"
                                    value={payment}
                                    onChange={(e) => setPayment(e.target.value ? parseFloat(e.target.value) : '')}
                                    min="1"
                                    step="0.01"
                                    required
                                    placeholder="Ex: 800.00"
                                    className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label htmlFor="genre" className="block text-sm font-medium text-gray-300 mb-2">Gênero Musical Desejado</label>
                            <input
                                id="genre"
                                type="text"
                                value={genre}
                                onChange={(e) => setGenre(e.target.value)}
                                required
                                placeholder="Ex: MPB, Rock Clássico, Jazz"
                                className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>

                        <div>
                           <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-2">Notas para o Artista (Opcional)</label>
                           <textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={4}
                                className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="Informe o estilo de música desejado, se oferece equipamento, etc."
                           />
                        </div>


                        <div className="flex justify-end gap-4 pt-6 border-t border-gray-700">
                            <button type="button" onClick={() => navigate('/venue-dashboard')} className="px-6 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-500 transition-colors">
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="px-8 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-500 disabled:cursor-wait flex items-center gap-2"
                            >
                               {isSaving ? (
                                   <>
                                       <i className="fas fa-spinner fa-spin"></i>
                                       <span>Publicando...</span>
                                   </>
                               ) : (
                                   'Publicar Data'
                               )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default OfferGigPage;
