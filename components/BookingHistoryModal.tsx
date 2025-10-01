import React, { useMemo } from 'react';
import { Artist } from '../data';
import Modal from './Modal';

interface BookingHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  artists: Artist[];
}

const BookingHistoryModal: React.FC<BookingHistoryModalProps> = ({ isOpen, onClose, artists }) => {
  const artistsWithUpcomingBookings = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return artists
      .map(artist => {
        const upcomingDates = (artist.bookedDates ?? [])
          .map(dateStr => new Date(`${dateStr}T00:00:00`))
          .filter(date => date >= today)
          .sort((a, b) => a.getTime() - b.getTime());

        return {
          ...artist,
          upcomingDates,
        };
      })
      .filter(artist => artist.upcomingDates.length > 0);
  }, [artists]);

  if (!isOpen) {
    return null;
  }

  return (
    <Modal onClose={onClose}>
      <div className="bg-gray-800 rounded-lg overflow-hidden shadow-2xl max-w-2xl w-full text-white">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">
            <i className="fas fa-calendar-check mr-3 text-red-500"></i>
            Próximas Datas Reservadas
          </h2>
          <p className="text-gray-400 mt-1">Veja a agenda dos artistas da plataforma.</p>
        </div>
        
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {artistsWithUpcomingBookings.length > 0 ? (
            <ul className="space-y-6">
              {artistsWithUpcomingBookings.map(artist => (
                <li key={artist.id} className="bg-gray-900/50 p-4 rounded-lg">
                  <h3 className="font-bold text-lg text-red-400">{artist.name}</h3>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {artist.upcomingDates.map(date => (
                      <span key={date.toISOString()} className="bg-gray-700 text-gray-200 text-sm font-medium px-3 py-1 rounded-full">
                        {date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-10">
              <i className="fas fa-calendar-times text-4xl text-gray-500 mb-4"></i>
              <p className="text-gray-300 font-semibold">Nenhuma data futura reservada</p>
              <p className="text-gray-400 mt-1 text-sm">A agenda dos artistas está livre por enquanto.</p>
            </div>
          )}
        </div>

        <div className="bg-gray-900 p-4 text-right">
            <button
                onClick={onClose}
                className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
                Fechar
            </button>
        </div>
      </div>
    </Modal>
  );
};

export default BookingHistoryModal;
