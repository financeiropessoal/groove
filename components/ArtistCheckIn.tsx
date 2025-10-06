import React, { useState } from 'react';
import { EnrichedBooking, BookingService } from '../services/BookingService';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

interface ArtistCheckInProps {
    booking: EnrichedBooking;
    onConfirm: () => void;
}

const ArtistCheckIn: React.FC<ArtistCheckInProps> = ({ booking, onConfirm }) => {
    const [pin, setPin] = useState('');
    const [isConfirming, setIsConfirming] = useState(false);
    const [error, setError] = useState('');
    const { showToast } = useToast();
    const { artist } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!artist || !booking.id || typeof booking.id !== 'number') return;
        
        setError('');
        setIsConfirming(true);
        const result = await BookingService.confirmArtistPresence(booking.id, pin, artist.id);
        setIsConfirming(false);

        if (result.success) {
            showToast(result.message, 'success');
            onConfirm();
        } else {
            setError(result.message);
        }
    };
    
    if (booking.artist_checked_in) {
        return (
             <div className="bg-green-800/20 border border-green-500/50 p-6 rounded-lg text-center">
                <i className="fas fa-check-circle text-4xl text-green-400 mb-4"></i>
                <h3 className="text-xl font-bold text-white">Presença Confirmada!</h3>
                <p className="text-sm text-gray-300 mt-2">
                    Check-in realizado em {new Date(booking.check_in_time!).toLocaleString('pt-BR')}. 
                    Seu pagamento será processado após o evento.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-white mb-4">Confirmar Presença (Check-in)</h3>
            <p className="text-sm text-gray-400 mb-4">Peça ao contratante o PIN de 4 dígitos do show e insira abaixo para confirmar que você está no local.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    maxLength={4}
                    className="w-full bg-gray-900 border border-gray-700 rounded-md py-3 px-4 text-center text-2xl tracking-[1em]"
                    placeholder="_ _ _ _"
                    required
                />
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                <button
                    type="submit"
                    disabled={isConfirming || pin.length !== 4}
                    className="w-full bg-green-600 text-white font-bold py-3 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                    {isConfirming ? <><i className="fas fa-spinner fa-spin mr-2"></i>Confirmando...</> : 'Confirmar Presença'}
                </button>
            </form>
        </div>
    );
};

export default ArtistCheckIn;