import React from 'react';
import { EnrichedBooking } from '../services/BookingService';
import Tooltip from './Tooltip';

interface VenueGigConfirmationProps {
    booking: EnrichedBooking;
}

const VenueGigConfirmation: React.FC<VenueGigConfirmationProps> = ({ booking }) => {
    if (booking.artist_checked_in) {
        return (
            <div className="bg-green-800/20 border border-green-500/50 p-6 rounded-lg text-center">
                <i className="fas fa-check-circle text-4xl text-green-400 mb-4"></i>
                <h3 className="text-xl font-bold text-white">Artista Confirmado no Local!</h3>
                <p className="text-sm text-gray-300 mt-2">
                    O check-in de {booking.artist?.name} foi registrado em {new Date(booking.check_in_time!).toLocaleString('pt-BR')}.
                </p>
            </div>
        );
    }
    
    return (
        <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                Confirmação do Artista
                <Tooltip text="Este sistema garante que o artista compareceu ao evento, servindo como um comprovante para a liberação do pagamento.">
                    <i className="fas fa-question-circle text-gray-400 text-sm cursor-help"></i>
                </Tooltip>
            </h3>
            <div className="bg-red-800/20 border border-red-500/50 text-red-200 p-3 rounded-md text-sm mb-4">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                Entregue este PIN ao artista <strong>somente</strong> quando ele chegar ao local.
            </div>
            <div className="text-center bg-gray-900 p-6 rounded-lg">
                <p className="text-sm text-gray-400 mb-2">PIN de Confirmação</p>
                <p className="text-6xl font-bold tracking-[0.2em] text-white select-all">
                    {booking.confirmation_pin || '----'}
                </p>
            </div>
             <p className="text-xs text-gray-500 mt-4 text-center">O artista usará este código no painel dele para confirmar a presença no evento.</p>
        </div>
    );
};

export default VenueGigConfirmation;