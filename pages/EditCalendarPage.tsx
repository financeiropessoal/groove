
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Calendar from '../components/Calendar';
import { BookingService, EnrichedBooking } from '../services/BookingService';
import { ManualGigService } from '../services/ManualGigService';
import EmptyState from '../components/EmptyState';
import ManualGigModal from '../components/ManualGigModal';
import { useToast } from '../contexts/ToastContext';

const GigCard: React.FC<{ 
    gig: EnrichedBooking; 
    isSelected: boolean;
    onEdit: (gig: EnrichedBooking) => void;
    onDelete: (gig: EnrichedBooking) => void;
}> = ({ gig, isSelected, onEdit, onDelete }) => {
    
    const getStatusInfo = (gig: EnrichedBooking) => {
        if (gig.isManual) {
            return { text: 'Registrado', color: 'border-purple-500' };
        }
        if (gig.payoutStatus === 'paid') {
            return { text: 'Recebido', color: 'border-green-500' };
        }

        const isPast = new Date(gig.date) < new Date(new Date().toDateString());

        if (gig.artist_checked_in) {
            return { text: 'Realizado (A Receber)', color: 'border-blue-500' };
        }
        
        if (isPast) {
            return { text: 'Finalizado (Sem Check-in)', color: 'border-gray-500' };
        }

        return { text: 'Agendado', color: 'border-yellow-500' };
    };

    const status = getStatusInfo(gig);


    return (
        <div className={`p-4 bg-gray-800 rounded-lg border-l-4 transition-all duration-300 ${status.color} ${isSelected ? 'ring-2 ring-pink-500' : ''}`}>
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                    <p className="font-bold text-lg text-white">{gig.venueName}</p>
                    <p className="text-sm text-gray-300">
                        {new Date(`${gig.date}T00:00:00`).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                    </p>
                    {gig.startTime && <p className="text-xs text-gray-400">{gig.startTime} - {gig.endTime}</p>}
                </div>
                <div className="text-left sm:text-right">
                    <p className="text-xl font-bold text-green-400">R$ {gig.payment.toFixed(2)}</p>
                    <p className={`text-sm font-semibold ${status.color.replace('border', 'text')}`}>{status.text}</p>
                </div>
            </div>
             <div className="mt-4 pt-4 border-t border-gray-700 flex justify-end gap-2">
                {gig.isManual ? (
                    <>
                        <button onClick={() => onEdit(gig)} className="px-4 py-2 bg-gray-600 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition-colors">
                            Editar
                        </button>
                        <button onClick={() => onDelete(gig)} className="px-4 py-2 bg-gray-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors">
                            Excluir
                        </button>
                    </>
                ) : (
                    <Link to={`/gig-hub/${gig.id}`} className="px-4 py-2 bg-gray-600 hover:bg-pink-600 text-white rounded-lg text-sm font-semibold transition-colors">
                        Gerenciar Show
                    </Link>
                )}
            </div>
        </div>
    );
};


const EditCalendarPage: React.FC = () => {
    const { artist, updateArtistProfile } = useAuth();
    const [bookings, setBookings] = useState<EnrichedBooking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const gigRefs = useRef<{[key: string]: HTMLDivElement | null}>({});
    const { showToast } = useToast();

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGig, setEditingGig] = useState<EnrichedBooking | null>(null);

    const fetchBookings = useCallback(async () => {
        if (artist) {
            setIsLoading(true);
            const data = await BookingService.getBookingsForArtist(artist.id);
            setBookings(data);
            
            // FIX: Check if dates have changed before updating the profile to prevent an infinite loop.
            const newBookedDates = [...new Set(data.map(b => b.date))].sort();
            const currentBookedDates = (artist.bookedDates || []).sort();

            if (JSON.stringify(newBookedDates) !== JSON.stringify(currentBookedDates)) {
                await updateArtistProfile({ bookedDates: newBookedDates });
                // The context update will trigger a re-render and the effect will run again,
                // but this time the dates will match and the `else` block will be hit, stopping the loop.
            } else {
                setIsLoading(false);
            }
        } else {
            setIsLoading(false);
        }
    }, [artist, updateArtistProfile]);


    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const { upcomingGigs, pastGigs } = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const upcoming: EnrichedBooking[] = [];
        const past: EnrichedBooking[] = [];

        bookings.forEach(booking => {
            const bookingDate = new Date(`${booking.date}T00:00:00`);
            if (bookingDate >= today) {
                upcoming.push(booking);
            } else {
                past.push(booking);
            }
        });

        upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return {
            upcomingGigs: upcoming,
            pastGigs: past,
        };
    }, [bookings]);

    const bookedDates = useMemo(() => artist?.bookedDates?.map(d => new Date(`${d}T00:00:00`)) || [], [artist?.bookedDates]);

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        const dateString = date.toISOString().split('T')[0];
        const targetGig = gigRefs.current[dateString];
        if (targetGig) {
            targetGig.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    const handleSaveManualGig = () => {
        showToast('Agenda atualizada!', 'success');
        fetchBookings();
        setIsModalOpen(false);
        setEditingGig(null);
    };

    const handleEditGig = (gig: EnrichedBooking) => {
        setEditingGig(gig);
        setIsModalOpen(true);
    };
    
    const handleDeleteGig = async (gig: EnrichedBooking) => {
        if(window.confirm(`Tem certeza que deseja excluir o evento "${gig.venueName}"?`)) {
            const gigId = parseInt(String(gig.id).replace('manual_', ''));
            const success = await ManualGigService.deleteManualGig(gigId, artist!.id, artist!.bookedDates || []);
            if (success) {
                showToast('Show externo excluído.', 'success');
                fetchBookings();
            } else {
                showToast('Erro ao excluir o show.', 'error');
            }
        }
    };

    if (isLoading) {
        return <div className="text-center py-12"><i className="fas fa-spinner fa-spin text-4xl text-pink-500"></i></div>;
    }

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors" aria-label="Voltar ao painel">
                        <i className="fas fa-arrow-left text-2xl"></i>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Minha Agenda</h1>
                        <p className="text-gray-400">Visualize e gerencie seus shows confirmados.</p>
                    </div>
                </div>
                <button 
                    onClick={() => { setEditingGig(null); setIsModalOpen(true); }}
                    className="px-4 py-2 bg-pink-600 rounded-lg font-semibold hover:bg-pink-700 transition-colors"
                >
                    <i className="fas fa-plus mr-2"></i>
                    Adicionar Show Externo
                </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <div className="sticky top-8">
                        <Calendar 
                            selectedDates={[]}
                            onDateSelect={handleDateSelect}
                            bookedDates={bookedDates}
                            selectedDay={selectedDate}
                        />
                         <div className="mt-4 text-sm text-gray-400 p-2">
                            <p><span className="inline-block w-3 h-3 rounded-full bg-pink-500/50 border border-pink-500 mr-2"></span> Datas Reservadas</p>
                            <p><span className="inline-block w-3 h-3 rounded-full border-2 border-pink-500 mr-2"></span> Hoje</p>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-8">
                    {bookings.length === 0 ? (
                        <EmptyState
                            icon="fa-calendar-times"
                            title="Nenhum show na sua agenda"
                            message="Quando você aceitar propostas ou adicionar shows manualmente, eles aparecerão aqui."
                        >
                             <Link to="/open-gigs" className="px-6 py-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white font-bold rounded-lg">
                                Ver Oportunidades
                            </Link>
                        </EmptyState>
                    ) : (
                        <>
                            <section>
                                <h2 className="text-2xl font-bold mb-4">Próximos Shows</h2>
                                {upcomingGigs.length > 0 ? (
                                    <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
                                        {upcomingGigs.map(gig => (
                                            <div key={gig.id} ref={el => gigRefs.current[gig.date] = el}>
                                                <GigCard gig={gig} isSelected={selectedDate ? new Date(gig.date).toDateString() === selectedDate.toDateString() : false} onEdit={handleEditGig} onDelete={handleDeleteGig} />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-400">Nenhum show agendado.</p>
                                )}
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4">Histórico de Shows</h2>
                                 {pastGigs.length > 0 ? (
                                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                                        {pastGigs.map(gig => (
                                            <div key={gig.id} ref={el => gigRefs.current[gig.date] = el}>
                                                <GigCard gig={gig} isSelected={selectedDate ? new Date(gig.date).toDateString() === selectedDate.toDateString() : false} onEdit={handleEditGig} onDelete={handleDeleteGig} />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-400">Nenhum show no histórico.</p>
                                )}
                            </section>
                        </>
                    )}
                </div>
            </div>

            <ManualGigModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveManualGig}
                gig={editingGig}
            />
        </div>
    );
};

export default EditCalendarPage;
