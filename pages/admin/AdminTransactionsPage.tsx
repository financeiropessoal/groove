import React, { useState, useEffect } from 'react';
import { AdminService } from '../../services/AdminService';

const AdminTransactionsPage: React.FC = () => {
    const [bookings, setBookings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        AdminService.getEnrichedBookings().then(data => {
            setBookings(data);
            setIsLoading(false);
        });
    }, []);

    const handlePayoutChange = (bookingId: number, status: 'pending' | 'paid') => {
        AdminService.updatePayoutStatus(bookingId, status).then(success => {
            if(success) {
                setBookings(prev => prev.map(b => b.id === bookingId ? {...b, payoutStatus: status} : b));
            }
        });
    };

    if (isLoading) return <p>Carregando transações...</p>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Gerenciar Transações de Shows</h1>
             <div className="bg-gray-800 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-700">
                        <tr>
                            <th className="p-3 text-left">Artista</th>
                            <th className="p-3 text-left">Local</th>
                            <th className="p-3 text-left">Data</th>
                            <th className="p-3 text-left">Valor</th>
                            <th className="p-3 text-left">Status Payout</th>
                            <th className="p-3 text-left">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map(booking => (
                            <tr key={booking.id} className="border-b border-gray-700">
                                <td className="p-3">{booking.artistName}</td>
                                <td className="p-3">{booking.venueName}</td>
                                <td className="p-3">{new Date(booking.date + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                                <td className="p-3">R$ {booking.planPrice.toFixed(2)}</td>
                                <td className="p-3">{booking.payoutStatus}</td>
                                <td className="p-3">
                                    <select 
                                     value={booking.payoutStatus} 
                                     onChange={e => handlePayoutChange(booking.id, e.target.value as any)}
                                     className="bg-gray-900 border border-gray-600 rounded p-1"
                                     >
                                        <option value="pending">Pendente</option>
                                        <option value="paid">Pago</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminTransactionsPage;
