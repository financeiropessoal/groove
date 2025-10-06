import React, { useState, useEffect } from 'react';
import { VenueService } from '../../services/VenueService';
import { AdminService } from '../../services/AdminService';
import { Venue } from '../../data';

const AdminVenuesPage: React.FC = () => {
    const [venues, setVenues] = useState<Venue[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        VenueService.getAllVenuesForAdmin().then(data => {
            setVenues(data);
            setIsLoading(false);
        });
    }, []);
    
    const handleStatusChange = (venueId: string, status: 'active' | 'blocked') => {
        AdminService.updateVenueStatus(venueId, status).then(success => {
            if (success) {
                setVenues(prev => prev.map(v => v.id === venueId ? { ...v, status } : v));
            }
        });
    };

    if (isLoading) return <p>Carregando locais...</p>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Gerenciar Locais</h1>
             <div className="bg-gray-800 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-700">
                        <tr>
                            <th className="p-3 text-left">Nome</th>
                            <th className="p-3 text-left">Email</th>
                            <th className="p-3 text-center">Completo</th>
                            <th className="p-3 text-center">Status</th>
                            <th className="p-3 text-left">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {venues.map(venue => (
                            <tr key={venue.id} className="border-b border-gray-700">
                                <td className="p-3">{venue.name}</td>
                                <td className="p-3 text-gray-400">{venue.email}</td>
                                <td className="p-3 text-center">
                                    {venue.profile_completeness?.is_complete ? (
                                        <i className="fas fa-check-circle text-green-400" title="Perfil Completo"></i>
                                    ) : (
                                        <i 
                                            className="fas fa-exclamation-triangle text-yellow-400"
                                            title={`Pendente: ${venue.profile_completeness?.missing_fields.join(', ')}`}
                                        ></i>
                                    )}
                                </td>
                                <td className="p-3 text-center">
                                     <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                        venue.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                     }`}>
                                        {venue.status === 'active' ? 'Ativo' : 'Bloqueado'}
                                    </span>
                                </td>
                                <td className="p-3">
                                     <select
                                        value={venue.status}
                                        onChange={(e) => handleStatusChange(venue.id, e.target.value as any)}
                                        className="bg-gray-900 border border-gray-600 rounded p-1"
                                    >
                                        <option value="active">Ativo</option>
                                        <option value="blocked">Bloqueado</option>
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

export default AdminVenuesPage;