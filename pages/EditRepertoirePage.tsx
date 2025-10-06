import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Song } from '../types';

const EditRepertoirePage: React.FC = () => {
    const { artist, updateArtistProfile } = useAuth();
    const { showToast } = useToast();
    
    const [repertoire, setRepertoire] = useState<Song[]>(artist?.repertoire || []);
    const [newSong, setNewSong] = useState({ title: '', artist: '' });
    const [isSaving, setIsSaving] = useState(false);

    const handleAddSong = (e: React.FormEvent) => {
        e.preventDefault();
        if (newSong.title && newSong.artist) {
            setRepertoire([...repertoire, newSong]);
            setNewSong({ title: '', artist: '' });
        }
    };

    const handleRemoveSong = (index: number) => {
        setRepertoire(repertoire.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateArtistProfile({ repertoire });
            showToast('Repertório salvo com sucesso!', 'success');
        } catch (error) {
            showToast('Erro ao salvar repertório.', 'error');
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
                     <div>
                        <h1 className="text-3xl font-bold">Editar Repertório</h1>
                        <p className="text-gray-400">Liste as músicas que você toca em seus shows.</p>
                    </div>
                </div>
                <button onClick={handleSave} disabled={isSaving} className="px-6 py-2 bg-pink-600 rounded-lg font-semibold hover:bg-pink-700 disabled:bg-gray-500 flex items-center gap-2">
                    {isSaving ? <><i className="fas fa-spinner fa-spin"></i>Salvando...</> : 'Salvar Repertório'}
                </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <div className="bg-gray-800 p-6 rounded-lg sticky top-8">
                        <h2 className="text-xl font-bold mb-4">Adicionar Música</h2>
                        <form onSubmit={handleAddSong} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Título da Música</label>
                                <input 
                                    type="text" 
                                    value={newSong.title}
                                    onChange={e => setNewSong({...newSong, title: e.target.value})}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-3"
                                    required
                                />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Artista Original</label>
                                <input 
                                    type="text" 
                                    value={newSong.artist}
                                    onChange={e => setNewSong({...newSong, artist: e.target.value})}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-3"
                                    required
                                />
                            </div>
                            <button type="submit" className="w-full bg-gray-600 text-white font-bold py-2.5 rounded-lg hover:bg-gray-500 transition-colors">Adicionar à Lista</button>
                        </form>
                    </div>
                </div>
                <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg">
                    <h2 className="text-xl font-bold mb-4">Sua Lista ({repertoire.length})</h2>
                    {repertoire.length > 0 ? (
                        <ul className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                            {repertoire.map((song, index) => (
                                <li key={index} className="bg-gray-900/50 p-3 rounded-md flex justify-between items-center transition-all animate-fade-in">
                                    <div>
                                        <p className="font-semibold text-white">{song.title}</p>
                                        <p className="text-sm text-gray-400">{song.artist}</p>
                                    </div>
                                    <button onClick={() => handleRemoveSong(index)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors">
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                         <div className="text-center py-16">
                            <i className="fas fa-music text-5xl text-gray-600 mb-4"></i>
                            <p className="text-gray-300 font-semibold text-lg">Seu repertório está vazio</p>
                            <p className="text-gray-400 mt-2 text-sm">Adicione as músicas que você toca usando o formulário ao lado.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EditRepertoirePage;