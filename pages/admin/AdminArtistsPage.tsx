import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Artist } from '../../data';
import { ArtistService } from '../../services/ArtistService';
import { AdminService } from '../../services/AdminService';
import { useToast } from '../../contexts/ToastContext';

const AdminArtistsPage: React.FC = () => {
    const location = useLocation();
    const { showToast } = useToast();
    const [artists, setArtists] = useState<Artist[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'blocked'>(location.state?.defaultFilter || 'all');
    const [searchTerm, setSearchTerm] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchArtists = async () => {
        setIsLoading(true);
        const data = await ArtistService.getAllArtistsForAdmin();
        setArtists(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchArtists();
    }, []);

    const filteredArtists = useMemo(() => {
        return artists
            .filter(a => filter === 'all' || a.status === filter)
            .filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.email?.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [artists, filter, searchTerm]);
    
    const handleStatusChange = async (artistId: string, newStatus: 'approved' | 'pending' | 'blocked') => {
        setActionLoading(artistId);
        const success = await AdminService.updateArtistStatus(artistId, newStatus);
        if (success) {
            showToast('Status do artista atualizado!', 'success');
            // Optimistic update
            setArtists(prev => prev.map(a => a.id === artistId ? { ...a, status: newStatus } : a));
        } else {
            showToast('Erro ao atualizar o status.', 'error');
        }
        setActionLoading(null);
    }


    if (isLoading) {
        return <div className="flex items-center justify-center h-full"><i className="fas fa-spinner fa-spin text-4xl text-red-500"></i></div>;
    }

    const StatusBadge: React.FC<{ status: Artist['status'] }> = ({ status }) => {
        const config = {
            approved: { text: 'Aprovado', class: 'bg-green-800 text-green-200' },
            pending: { text: 'Pendente', class: 'bg-yellow-800 text-yellow-200' },
            blocked: { text: 'Bloqueado', class: 'bg-red-800 text-red-200' },
        };
        const { text, class: className } = config[status];
        return <span className={`px-2 py-1 text-xs rounded-full ${className}`}>{text}</span>;
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Gerenciar Artistas</h1>

            <div className="bg-gray-800 p-4 rounded-lg flex gap-4">
                <input type="text" placeholder="Buscar por nome ou email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="flex-grow bg-gray-900 border border-gray-700 rounded-md py-2 px-4" />
                <select value={filter} onChange={e => setFilter(e.target.value as any)} className="bg-gray-900 border border-gray-700 rounded-md py-2 px-4">
                    <option value="all">Todos</option>
                    <option value="pending">Pendentes</option>
                    <option value="approved">Aprovados</option>
                    <option value="blocked">Bloqueados</option>
                </select>
            </div>
            
            <div className="bg-gray-800 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-700 text-left">
                        <tr>
                            <th className="p-3">Nome</th>
                            <th className="p-3">Email</th>
                            <th className="p-3">Gênero</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredArtists.map(artist => (
                            <tr key={artist.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                <td className="p-3 font-semibold">{artist.name}</td>
                                <td className="p-3 text-gray-400">{artist.email}</td>
                                <td className="p-3 text-gray-400">{artist.genre.primary}</td>
                                <td className="p-3">
                                    <StatusBadge status={artist.status} />
                                </td>
                                <td className="p-3 text-right">
                                    <div className="flex justify-end gap-2">
                                        {artist.status === 'pending' && (
                                            <button onClick={() => handleStatusChange(artist.id, 'approved')} disabled={actionLoading === artist.id} className="text-xs font-semibold bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 disabled:opacity-50">
                                                {actionLoading === artist.id ? <i className="fas fa-spinner fa-spin"></i> : 'Aprovar'}
                                            </button>
                                        )}
                                         {artist.status === 'approved' && (
                                            <button onClick={() => handleStatusChange(artist.id, 'pending')} disabled={actionLoading === artist.id} className="text-xs font-semibold bg-gray-600 text-white px-3 py-1.5 rounded-md hover:bg-gray-500 disabled:opacity-50">
                                                {actionLoading === artist.id ? <i className="fas fa-spinner fa-spin"></i> : 'Tornar Pendente'}
                                            </button>
                                        )}
                                        {artist.status !== 'blocked' ? (
                                             <button onClick={() => handleStatusChange(artist.id, 'blocked')} disabled={actionLoading === artist.id} className="text-xs font-semibold bg-red-600 text-white px-3 py-1.5 rounded-md hover:bg-red-700 disabled:opacity-50">
                                                {actionLoading === artist.id ? <i className="fas fa-spinner fa-spin"></i> : 'Bloquear'}
                                            </button>
                                        ) : (
                                            <button onClick={() => handleStatusChange(artist.id, 'pending')} disabled={actionLoading === artist.id} className="text-xs font-semibold bg-yellow-600 text-white px-3 py-1.5 rounded-md hover:bg-yellow-700 disabled:opacity-50">
                                                {actionLoading === artist.id ? <i className="fas fa-spinner fa-spin"></i> : 'Desbloquear'}
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredArtists.length === 0 && <p className="p-4 text-center text-gray-400">Nenhum artista encontrado.</p>}
            </div>
        </div>
    );
};

export default AdminArtistsPage;