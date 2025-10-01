import React, { useState, useEffect, useMemo } from 'react';
import { Venue } from '../../data';
import { VenueService } from '../../services/VenueService';
import { AdminService } from '../../services/AdminService';
import { useToast } from '../../contexts/ToastContext';

const AdminVenuesPage: React.FC = () => {
    const [venues, setVenues] = useState<Venue[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'active' | 'blocked'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const { showToast } = useToast();

    const fetchVenues = async () => {
        setIsLoading(true);
        // Admin needs to see all venues, regardless of status.
        const { data, error } = await (await import('../../supabaseClient')).supabase.from('venues').select('*').order('created_at', { ascending: false });
        if (data) {
             setVenues(data.map(VenueService.mapVenueFromDb));
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchVenues();
    }, []);

    const filteredVenues = useMemo(() => {
        return venues
            .filter(v => filter === 'all' || v.status === filter)
            .filter(v => v.name.toLowerCase().includes(searchTerm.toLowerCase()) || v.address?.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [venues, filter, searchTerm]);

    const handleStatusChange = async (venue: Venue) => {
        const newStatus = venue.status === 'active' ? 'blocked' : 'active';
        setActionLoading(venue.id);
        const success = await AdminService.updateVenueStatus(venue.id, newStatus);
        if (success) {
            showToast('Status do local atualizado!', 'success');
            // Optimistic update
            setVenues(prev => prev.map(v => v.id === venue.id ? { ...v, status: newStatus } : v));
        } else {
            showToast('Erro ao atualizar o status.', 'error');
        }
        setActionLoading(null);
    };

    if (isLoading) {
        return <div className="flex items-center justify-center h-full"><i className="fas fa-spinner fa-spin text-4xl text-red-500"></i></div>;
    }

    const StatusBadge: React.FC<{ status: Venue['status'] }> = ({ status }) => {
        const config = {
            active: { text: 'Ativo', class: 'bg-green-800 text-green-200' },
            blocked: { text: 'Bloqueado', class: 'bg-red-800 text-red-200' },
        };
        const { text, class: className } = config[status || 'active'];
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${className}`}>{text}</span>;
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Gerenciar Contratantes</h1>

            <div className="bg-gray-800 p-4 rounded-lg flex gap-4">
                <input type="text" placeholder="Buscar por nome ou endereço..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="flex-grow bg-gray-900 border border-gray-700 rounded-md py-2 px-4" />
                <select value={filter} onChange={e => setFilter(e.target.value as any)} className="bg-gray-900 border border-gray-700 rounded-md py-2 px-4">
                    <option value="all">Todos</option>
                    <option value="active">Ativos</option>
                    <option value="blocked">Bloqueados</option>
                </select>
            </div>
            
            <div className="bg-gray-800 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-700 text-left">
                        <tr>
                            <th className="p-3">Nome do Local</th>
                            <th className="p-3">Endereço</th>
                            <th className="p-3">Email</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredVenues.map(venue => (
                            <tr key={venue.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                <td className="p-3 font-semibold">{venue.name}</td>
                                <td className="p-3 text-gray-400">{venue.address}</td>
                                <td className="p-3 text-gray-400">{venue.email}</td>
                                <td className="p-3">
                                    <StatusBadge status={venue.status} />
                                </td>
                                <td className="p-3 text-right">
                                    <div className="flex justify-end gap-2">
                                        {venue.status !== 'blocked' ? (
                                             <button onClick={() => handleStatusChange(venue)} disabled={actionLoading === venue.id} className="text-xs font-semibold bg-red-600 text-white px-3 py-1.5 rounded-md hover:bg-red-700 disabled:opacity-50">
                                                {actionLoading === venue.id ? <i className="fas fa-spinner fa-spin"></i> : 'Bloquear'}
                                            </button>
                                        ) : (
                                            <button onClick={() => handleStatusChange(venue)} disabled={actionLoading === venue.id} className="text-xs font-semibold bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 disabled:opacity-50">
                                                {actionLoading === venue.id ? <i className="fas fa-spinner fa-spin"></i> : 'Desbloquear'}
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredVenues.length === 0 && <p className="p-4 text-center text-gray-400">Nenhum local encontrado.</p>}
            </div>
        </div>
    );
};

export default AdminVenuesPage;
