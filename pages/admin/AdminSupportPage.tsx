import React, { useState, useEffect } from 'react';
import { SupportService } from '../../services/SupportService';
import { SupportTicket } from '../../types';

const AdminSupportPage: React.FC = () => {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        SupportService.getAllTickets().then(data => {
            setTickets(data);
            setIsLoading(false);
        });
    }, []);

    const handleStatusChange = (ticketId: number, status: 'open' | 'in_progress' | 'resolved') => {
        SupportService.updateTicketStatus(ticketId, status).then(success => {
            if (success) {
                setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status } : t));
            }
        });
    };

    if (isLoading) return <p>Carregando tickets...</p>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Tickets de Suporte</h1>
            <div className="space-y-4">
                {tickets.map(ticket => (
                    <div key={ticket.id} className="bg-gray-800 p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-bold">Ticket #{ticket.id} - {ticket.reporter?.name} ({ticket.reporter_type})</p>
                                <p className="text-sm text-gray-400">{ticket.description}</p>
                            </div>
                            <select
                                value={ticket.status}
                                onChange={e => handleStatusChange(ticket.id, e.target.value as any)}
                                className="bg-gray-900 border border-gray-600 rounded p-1 text-sm"
                            >
                                <option value="open">Aberto</option>
                                <option value="in_progress">Em Progresso</option>
                                <option value="resolved">Resolvido</option>
                            </select>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminSupportPage;
