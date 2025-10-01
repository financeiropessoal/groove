import React, { useState, useEffect, useMemo } from 'react';
import { SupportService } from '../../services/SupportService';
import { SupportTicket } from '../../types';
import { useToast } from '../../contexts/ToastContext';

type StatusFilter = 'all' | 'open' | 'in_progress' | 'resolved';

const AdminSupportPage: React.FC = () => {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<StatusFilter>('open');
    const { showToast } = useToast();

    const fetchTickets = async () => {
        setIsLoading(true);
        const data = await SupportService.getAllTickets();
        setTickets(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const filteredTickets = useMemo(() => {
        if (filter === 'all') return tickets;
        return tickets.filter(t => t.status === filter);
    }, [tickets, filter]);

    const handleStatusChange = async (ticketId: number, newStatus: 'open' | 'in_progress' | 'resolved') => {
        const success = await SupportService.updateTicketStatus(ticketId, newStatus);
        if (success) {
            showToast('Status do ticket atualizado.', 'success');
            fetchTickets();
        } else {
            showToast('Erro ao atualizar o status.', 'error');
        }
    };

    const StatusBadge: React.FC<{ status: SupportTicket['status'] }> = ({ status }) => {
        const config = {
            open: { text: 'Aberto', class: 'bg-red-800 text-red-200' },
            in_progress: { text: 'Em Análise', class: 'bg-yellow-800 text-yellow-200' },
            resolved: { text: 'Resolvido', class: 'bg-green-800 text-green-200' },
        };
        const { text, class: className } = config[status];
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${className}`}>{text}</span>;
    };
    
    if (isLoading) {
        return <div className="flex items-center justify-center h-full"><i className="fas fa-spinner fa-spin text-4xl text-red-500"></i></div>;
    }

    return (
         <div className="space-y-6">
            <h1 className="text-3xl font-bold">Tickets de Suporte</h1>

             <div className="bg-gray-800 p-4 rounded-lg flex justify-end gap-4">
                <select value={filter} onChange={e => setFilter(e.target.value as any)} className="bg-gray-900 border border-gray-700 rounded-md py-2 px-4">
                    <option value="open">Abertos</option>
                    <option value="in_progress">Em Análise</option>
                    <option value="resolved">Resolvidos</option>
                    <option value="all">Todos</option>
                </select>
            </div>
            
            <div className="space-y-4">
                {filteredTickets.map(ticket => (
                    <details key={ticket.id} className="bg-gray-800 rounded-lg group">
                        <summary className="p-4 flex justify-between items-center cursor-pointer list-none">
                            <div>
                                <p className="font-semibold">Ticket #{ticket.id} - {ticket.booking?.artistName} vs {ticket.booking?.venueName}</p>
                                <p className="text-xs text-gray-400">Reportado por: {ticket.reporter?.name} ({ticket.reporter?.type}) em {new Date(ticket.created_at).toLocaleDateString('pt-BR')}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <StatusBadge status={ticket.status} />
                                <i className="fas fa-chevron-down ml-auto transition-transform duration-300 group-open:rotate-180"></i>
                            </div>
                        </summary>
                        <div className="border-t border-gray-700 p-4">
                            <h4 className="font-semibold text-red-400 mb-2">Descrição do Problema:</h4>
                            <p className="text-gray-300 bg-gray-900/50 p-3 rounded-md text-sm">{ticket.description}</p>
                            <div className="mt-4 pt-4 border-t border-gray-700/50">
                                <h4 className="font-semibold text-white mb-2">Alterar Status:</h4>
                                <div className="flex gap-2">
                                    <button disabled={ticket.status === 'open'} onClick={() => handleStatusChange(ticket.id, 'open')} className="text-xs px-3 py-1 bg-red-600 rounded disabled:opacity-50">Marcar como Aberto</button>
                                    <button disabled={ticket.status === 'in_progress'} onClick={() => handleStatusChange(ticket.id, 'in_progress')} className="text-xs px-3 py-1 bg-yellow-600 rounded disabled:opacity-50">Marcar Em Análise</button>
                                    <button disabled={ticket.status === 'resolved'} onClick={() => handleStatusChange(ticket.id, 'resolved')} className="text-xs px-3 py-1 bg-green-600 rounded disabled:opacity-50">Marcar como Resolvido</button>
                                </div>
                            </div>
                        </div>
                    </details>
                ))}

                 {filteredTickets.length === 0 && <p className="p-8 text-center text-gray-400 bg-gray-800 rounded-lg">Nenhum ticket encontrado para este filtro.</p>}
            </div>
        </div>
    );
};

export default AdminSupportPage;