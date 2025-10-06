import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Musician } from '../types';
import { BandMember } from '../data';
import EmptyState from '../components/EmptyState';
import MusicianFinderModal from '../components/MusicianFinderModal';

const EditMusiciansPage: React.FC = () => {
    const { artist, updateArtistProfile } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [bandMembers, setBandMembers] = useState<BandMember[]>(artist?.bandMembers || []);
    const [isFinderOpen, setIsFinderOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    const [newMemberName, setNewMemberName] = useState('');
    const [newMemberInstrument, setNewMemberInstrument] = useState('');

    const handleMemberChange = (memberId: string, field: keyof Omit<BandMember, 'id'>, value: string) => {
        setBandMembers(prev => 
            prev.map(member => 
                member.id === memberId ? { ...member, [field]: value } : member
            )
        );
    };

    const handleAddRegisteredMusician = (musician: Musician) => {
        if (!bandMembers.some(m => m.id === musician.id)) {
            const newMember: BandMember = {
                id: musician.id,
                name: musician.name,
                instrument: musician.instrument,
                email: musician.email,
                phone: musician.phone,
            };
            setBandMembers(prev => [...prev, newMember]);
            showToast(`${musician.name} adicionado à banda!`, 'success');
        } else {
            showToast(`${musician.name} já está na sua lista.`, 'info');
        }
        setIsFinderOpen(false);
    };

    const handleAddManualMusician = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMemberName.trim() || !newMemberInstrument.trim()) {
            showToast('Por favor, preencha o nome e o instrumento.', 'error');
            return;
        }
        const newMember: BandMember = {
            id: `manual-${Date.now()}`,
            name: newMemberName.trim(),
            instrument: newMemberInstrument.trim(),
        };
        setBandMembers(prev => [...prev, newMember]);
        setNewMemberName('');
        setNewMemberInstrument('');
    };

    const handleRemoveMember = (memberId: string) => {
        setBandMembers(prev => prev.filter(member => member.id !== memberId));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateArtistProfile({ bandMembers });
            showToast('Membros da banda salvos com sucesso!', 'success');
            navigate('/dashboard');
        } catch (error) {
            showToast('Erro ao salvar as alterações.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
                 <div className="flex items-center gap-4">
                    <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors" aria-label="Voltar ao painel">
                        <i className="fas fa-arrow-left text-2xl"></i>
                    </Link>
                    <h1 className="text-3xl font-bold">Gerenciar Músicos da Banda</h1>
                </div>
                <div className="flex gap-4">
                    <button 
                        onClick={() => setIsFinderOpen(true)}
                        className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-500 w-1/2 md:w-auto"
                    >
                        <i className="fas fa-search mr-2"></i>
                        Buscar na Plataforma
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-pink-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-pink-700 disabled:bg-gray-500 w-1/2 md:w-auto flex items-center justify-center gap-2"
                    >
                        {isSaving ? <><i className="fas fa-spinner fa-spin"></i>Salvando...</> : 'Salvar Alterações'}
                    </button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                     <div className="bg-gray-800 p-6 rounded-lg sticky top-8">
                        <h2 className="text-xl font-bold mb-4">Adicionar Membro Manualmente</h2>
                        <form onSubmit={handleAddManualMusician} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Nome do Músico</label>
                                <input 
                                    type="text" 
                                    value={newMemberName}
                                    onChange={e => setNewMemberName(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-3"
                                    placeholder="Ex: João da Silva"
                                />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Instrumento</label>
                                <input 
                                    type="text" 
                                    value={newMemberInstrument}
                                    onChange={e => setNewMemberInstrument(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-3"
                                    placeholder="Ex: Guitarra Solo"
                                />
                            </div>
                            <button type="submit" className="w-full bg-pink-600 text-white font-bold py-2.5 rounded-lg hover:bg-pink-700 transition-colors">Adicionar à Banda</button>
                        </form>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    {bandMembers.length > 0 ? (
                        <div className="space-y-4">
                           {bandMembers.map(member => {
                                const isRegistered = !member.id.startsWith('manual-');
                                return (
                                <div key={member.id} className="bg-gray-800 p-4 rounded-lg animate-fade-in border border-gray-700">
                                     <div className="flex justify-between items-center mb-4">
                                        <p className="font-semibold text-lg text-white flex items-center gap-3">
                                            {isRegistered 
                                                ? <><i className="fas fa-check-circle text-green-400" title="Músico verificado na plataforma"></i>Membro da Plataforma</>
                                                : <><i className="fas fa-user-plus text-gray-400"></i>Membro Manual</>
                                            }
                                        </p>
                                        <button 
                                            onClick={() => handleRemoveMember(member.id)}
                                            className="w-8 h-8 flex-shrink-0 flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                                            aria-label={`Remover ${member.name}`}
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="sm:col-span-2">
                                            <label className="block text-xs font-medium text-gray-400 mb-1">Nome</label>
                                            <input 
                                                type="text" 
                                                value={member.name} 
                                                onChange={(e) => handleMemberChange(member.id, 'name', e.target.value)}
                                                disabled={isRegistered}
                                                className={`w-full p-2 rounded mt-1 border text-sm ${isRegistered ? 'bg-gray-700/50 border-gray-600 cursor-not-allowed text-gray-300' : 'bg-gray-900 border-gray-700 text-white'}`}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1">Instrumento</label>
                                            <input 
                                                type="text" 
                                                value={member.instrument}
                                                onChange={(e) => handleMemberChange(member.id, 'instrument', e.target.value)}
                                                className="w-full bg-gray-900 p-2 rounded mt-1 border border-gray-700 text-white text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1">Email (contato)</label>
                                            <input 
                                                type="email" 
                                                value={member.email || ''} 
                                                onChange={(e) => handleMemberChange(member.id, 'email', e.target.value)}
                                                placeholder="Não informado"
                                                className="w-full bg-gray-900 p-2 rounded mt-1 border border-gray-700 text-white text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                                );
                           })}
                        </div>
                    ) : (
                        <EmptyState
                            icon="fa-users-slash"
                            title="Nenhum músico na sua banda"
                            message="Use os formulários para adicionar membros à sua banda. Isso ajuda os contratantes a entenderem a formação completa do seu show."
                        />
                    )}
                </div>
            </div>
            
            <MusicianFinderModal
                isOpen={isFinderOpen}
                onClose={() => setIsFinderOpen(false)}
                onMusicianSelect={handleAddRegisteredMusician}
            />
        </div>
    );
};

export default EditMusiciansPage;