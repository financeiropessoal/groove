import React, { useState, useEffect, useMemo } from 'react';
import { AdminService } from '../../services/AdminService';
import { useToast } from '../../contexts/ToastContext';

// Duplicating interface to avoid circular dependencies or overly broad service files
export interface AdminEnrichedBooking {
  id: number;
  artistId: string;
  artistName: string;
  venueId: string;
  venueName: string;
  planId: number;
  planName: string;
  planPrice: number;
  date: string;
  payoutStatus: 'pending' | 'paid';
}

const AdminTransactionsPage: React.FC = () => {
    const [bookings, setBookings] = useState<AdminEnrichedBooking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('pending');
    const [commissionRate, setCommissionRate] = useState(0.10);
    const { showToast } = useToast();

    const fetchTransactions = async () => {
        setIsLoading(true);
        const [data, rate] = await Promise.all([
            AdminService.getEnrichedBookings(),
            AdminService.getCommissionRate()
        ]);
        setBookings(data);
        setCommissionRate(rate);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const filteredBookings = useMemo(() => {
        return bookings.filter(b => filter === 'all' || b.payoutStatus === filter);
    }, [bookings, filter]);

    const handlePayout = async (bookingId: number) => {
        if (window.confirm("Você confirma que o repasse para este show foi efetuado?")) {
            const success = await AdminService.updatePayoutStatus(bookingId, 'paid');
            if (success) {
                showToast("Status de repasse atualizado!", 'success');
                fetchTransactions(); // Refresh data
            } else {
                showToast("Erro ao atualizar o status do repasse.", 'error');
            }
        }
    };

    if (isLoading) {
        return <div className="flex items-center justify-center h-full"><i className="fas fa-spinner fa-spin text-4xl text-red-500"></i></div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Transações e Repasses</h1>
            
             <div className="bg-gray-800 p-4 rounded-lg flex justify-end gap-4">
                <select value={filter} onChange={e => setFilter(e.target.value as any)} className="bg-gray-900 border border-gray-700 rounded-md py-2 px-4">
                    <option value="pending">Repasses Pendentes</option>
                    <option value="paid">Repasses Efetuados</option>
                    <option value="all">Todos os Shows</option>
                </select>
            </div>

            <div className="bg-gray-800 rounded-lg overflow-x-auto">
                <table className="w-full text-sm whitespace-nowrap">
                    <thead className="bg-gray-700 text-left">
                        <tr>
                            <th className="p-3">Data</th>
                            <th className="p-3">Artista</th>
                            <th className="p-3">Contratante</th>
                            <th className="p-3">Valor Bruto</th>
                            <th className="p-3">Comissão ({(commissionRate * 100).toFixed(1)}%)</th>
                            <th className="p-3">Repasse Artista</th>
                            <th className="p-3">Status Repasse</th>
                            <th className="p-3 text-right">Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBookings.map(booking => {
                            const commission = booking.planPrice * commissionRate;
                            const artistPayout = booking.planPrice - commission;
                            return (
                            <tr key={booking.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                <td className="p-3">{new Date(booking.date + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                                <td className="p-3 font-semibold">{booking.artistName}</td>
                                <td className="p-3 text-gray-400">{booking.venueName}</td>
                                <td className="p-3 text-gray-300">R$ {booking.planPrice.toFixed(2).replace('.', ',')}</td>
                                <td className="p-3 text-yellow-400">R$ {commission.toFixed(2).replace('.', ',')}</td>
                                <td className="p-3 font-bold text-green-400">R$ {artistPayout.toFixed(2).replace('.', ',')}</td>
                                <td className="p-3">
                                     <span className={`px-2 py-1 text-xs rounded-full ${booking.payoutStatus === 'paid' ? 'bg-green-800 text-green-200' : 'bg-yellow-800 text-yellow-200'}`}>
                                        {booking.payoutStatus === 'paid' ? 'Pago' : 'Pendente'}
                                    </span>
                                </td>
                                <td className="p-3 text-right">
                                    {booking.payoutStatus === 'pending' && (
                                        <button onClick={() => handlePayout(booking.id)} className="text-xs font-semibold bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700">
                                            Marcar como Pago
                                        </button>
                                    )}
                                </td>
                            </tr>
                        )})}
                    </tbody>
                </table>
                 {filteredBookings.length === 0 && <p className="p-4 text-center text-gray-400">Nenhuma transação encontrada para este filtro.</p>}
            </div>
        </div>
    );
};

export default AdminTransactionsPage;