import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { BandMember, Artist as Musician } from '../types';
import FreelancerFinderModal from '../components/FreelancerFinderModal';

const EditMusiciansPage: React.FC = () => {
    const { artist, updateArtistProfile } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [bandMembers, setBandMembers] = useState<BandMember[]>(artist?.bandMembers || []);
    const [isSaving, setIsSaving] = useState(false);
    const [isFinderOpen, setIsFinderOpen] = useState(false);

    const handleAddMember = () => {
        const newMember: BandMember = {
            id: `manual_${Date.now()}`,
            name: '',
            instrument: '',
            email: ''
        };
        setBandMembers([...bandMembers, newMember]);
    };

    const handleRemoveMember = (id: string) => {
        setBandMembers(bandMembers.filter(m => m.id !== id));
    };

    const handleMemberChange = (id: string, field: keyof BandMember, value: string) => {
        setBandMembers(bandMembers.map(m => m.id === id ? { ...m, [field]: value } : m));
    };

    const handleMusicianSelect = (musician: Musician) => {
        const newMember: BandMember = {
            id: musician.id,
            name: musician.name,
            instrument: musician.freelancer_instruments?.[0] || 'Músico',
            email: musician.email,
        };
        // Avoid adding duplicates
        if (!bandMembers.some(m => m.id === newMember.id)) {
            setBandMembers([...bandMembers, newMember]);
        }
        setIsFinderOpen(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateArtistProfile({ bandMembers });
            showToast('Músicos da banda salvos com sucesso!', 'success');
            navigate('/dashboard');
        } catch (error) {
            showToast('Erro ao salvar músicos.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div>
            <FreelancerFinderModal 
                isOpen={isFinderOpen}
                onClose={() => setIsFinderOpen(false)}
                onMusicianSelect={handleMusicianSelect}
            />

            <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors" aria-label="Voltar ao painel">
                        <i className="fas fa-arrow-left text-2xl"></i>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Músicos da Banda</h1>
                        <p className="text-gray-400">Gerencie os músicos que tocam com você.</p>
                    </div>
                </div>
                <div className="flex gap-4">
                     <button onClick={handleSave} disabled={isSaving} className="px-6 py-2 bg-pink-600 rounded-lg font-semibold hover:bg-pink-700 disabled:bg-gray-500">
                        {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                    <button onClick={handleAddMember} className="px-6 py-2 bg-gray-600 rounded-lg font-semibold hover:bg-gray-500">
                        Adicionar Manualmente
                    </button>
                </div>
            </div>

            <p className="text-sm text-gray-400 mb-4 text-center bg-gray-800/50 p-3 rounded-md">
                Você pode adicionar músicos que já têm perfil na plataforma (recomendado) ou inserir os dados manualmente.
                <button onClick={() => setIsFinderOpen(true)} className="font-semibold text-pink-400 hover:underline ml-2">
                    Buscar Músico na Plataforma
                </button>
            </p>

            <div className="space-y-4">
                {bandMembers.map(member => (
                    <div key={member.id} className="bg-gray-800 p-4 rounded-lg flex flex-col md:flex-row gap-4 items-center">
                        <div className="flex-grow w-full grid grid-cols-1 sm:grid-cols-3 gap-4">
                             <input
                                type="text"
                                placeholder="Nome do Músico"
                                value={member.name}
                                onChange={e => handleMemberChange(member.id, 'name', e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3"
                            />
                             <input
                                type="text"
                                placeholder="Instrumento"
                                value={member.instrument}
                                onChange={e => handleMemberChange(member.id, 'instrument', e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3"
                            />
                             <input
                                type="email"
                                placeholder="Email (opcional)"
                                value={member.email || ''}
                                onChange={e => handleMemberChange(member.id, 'email', e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3"
                            />
                        </div>
                        <button onClick={() => handleRemoveMember(member.id)} className="text-gray-500 hover:text-red-500 p-2">
                            <i className="fas fa-trash"></i>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EditMusiciansPage;