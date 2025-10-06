import React, { useState, useEffect, useCallback } from 'react';
import { ArtistService } from '../../services/ArtistService';
import { AdminService } from '../../services/AdminService';
import { Artist } from '../../data';
import { useToast } from '../../contexts/ToastContext';
import ArtistApprovalPanel from '../../components/admin/ArtistApprovalPanel';
import FeedbackModal from '../../components/admin/FeedbackModal';
import ToggleSwitch from '../../components/admin/ToggleSwitch';
import QualityScoreBadge from '../../components/admin/QualityScoreBadge';

const AdminArtistsPage: React.FC = () => {
    const [artists, setArtists] = useState<Artist[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { showToast } = useToast();
    
    const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
    const [artistForFeedback, setArtistForFeedback] = useState<Artist | null>(null);

    const fetchArtists = useCallback(async () => {
        setIsLoading(true);
        const data = await ArtistService.getAllArtistsForAdmin();
        setArtists(data);
        setIsLoading(false);
        
        // Asynchronously calculate quality scores for pending artists
        data.filter(a => a.status === 'pending' && a.quality_score === undefined).forEach(async (artist) => {
            const qualityData = await AdminService.generateProfileQualityScore(artist);
            await AdminService.updateArtistProfileData(artist.id, { 
                quality_score: qualityData.score,
                quality_issues: qualityData.issues 
            });
            // Update state locally to reflect the new score
            setArtists(prev => prev.map(a => a.id === artist.id ? { ...a, ...qualityData } : a));
        });
    }, []);

    useEffect(() => {
        fetchArtists();
    }, [fetchArtists]);

    const handleStatusChange = useCallback(async (artistId: string, status: 'approved' | 'pending' | 'blocked') => {
        const success = await AdminService.updateArtistStatus(artistId, status);
        if (success) {
            setArtists(prev => prev.map(a => a.id === artistId ? { ...a, status } : a));
            showToast(`Status de ${status === 'approved' ? 'aprovado' : 'bloqueado'} com sucesso!`, 'success');
        } else {
            showToast('Falha ao atualizar o status.', 'error');
        }
        setSelectedArtist(null);
    }, [showToast]);

    const handleToggleFeatured = async (artistId: string, isFeatured: boolean) => {
        const success = await AdminService.toggleArtistFeature(artistId, isFeatured);
        if (success) {
            setArtists(prev => prev.map(a => a.id === artistId ? { ...a, is_featured: isFeatured } : a));
            showToast(`Artista ${isFeatured ? 'destacado' : 'removido dos destaques'}.`, 'success');
        } else {
            showToast('Falha ao alterar o status de destaque.', 'error');
        }
    };
    
    const handleSendRejection = (artist: Artist, message: string) => {
        console.log(`Mensagem de recusa para ${artist.name}:\n${message}`);
        handleStatusChange(artist.id, 'blocked');
        showToast('Artista recusado e notificação (simulada) enviada.', 'info');
        setArtistForFeedback(null);
    };

    const openReviewPanel = (artist: Artist) => {
        setSelectedArtist(artist);
    };

    if (isLoading && artists.length === 0) {
        return <div className="flex items-center justify-center h-full"><i className="fas fa-spinner fa-spin text-4xl text-pink-500"></i></div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Gerenciar Artistas</h1>
            <div className="bg-gray-800 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-700 text-left">
                            <tr>
                                <th className="p-3">Nome</th>
                                <th className="p-3">Email</th>
                                <th className="p-3 text-center">Qualidade</th>
                                <th className="p-3 text-center">Completo</th>
                                <th className="p-3 text-center">Status</th>
                                <th className="p-3 text-center">Destaque</th>
                            </tr>
                        </thead>
                        <tbody>
                            {artists.map(artist => (
                                <tr key={artist.id} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                                    <td className="p-3">
                                        <button onClick={() => openReviewPanel(artist)} className="font-semibold hover:text-pink-400">
                                            {artist.name}
                                        </button>
                                    </td>
                                    <td className="p-3 text-gray-400">{artist.email}</td>
                                    <td className="p-3 text-center">
                                        <QualityScoreBadge score={artist.quality_score} />
                                    </td>
                                     <td className="p-3 text-center">
                                        {artist.profile_completeness?.is_complete ? (
                                            <i className="fas fa-check-circle text-green-400" title="Perfil Completo"></i>
                                        ) : (
                                            <i 
                                                className="fas fa-exclamation-triangle text-yellow-400"
                                                title={`Pendente: ${artist.profile_completeness?.missing_fields.join(', ')}`}
                                            ></i>
                                        )}
                                    </td>
                                    <td className="p-3 text-center">
                                         <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            artist.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                                            artist.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                            'bg-red-500/20 text-red-400'
                                         }`}>
                                            {artist.status}
                                        </span>
                                    </td>
                                    <td className="p-3 text-center">
                                         <ToggleSwitch
                                            checked={artist.is_featured || false}
                                            onChange={(e) => handleToggleFeatured(artist.id, e.target.checked)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedArtist && (
                <ArtistApprovalPanel
                    artist={selectedArtist}
                    onClose={() => setSelectedArtist(null)}
                    onApprove={() => handleStatusChange(selectedArtist.id, 'approved')}
                    onReject={() => {
                        setArtistForFeedback(selectedArtist);
                        setSelectedArtist(null);
                    }}
                    onBlock={() => handleStatusChange(selectedArtist.id, 'blocked')}
                />
            )}
            
            {artistForFeedback && (
                <FeedbackModal
                    artist={artistForFeedback}
                    onClose={() => setArtistForFeedback(null)}
                    onSend={handleSendRejection}
                />
            )}
        </div>
    );
};

export default AdminArtistsPage;