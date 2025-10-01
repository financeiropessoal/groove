import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Song } from '../data';
import { useToast } from '../contexts/ToastContext';

const EditRepertoirePage: React.FC = () => {
    const { artist, logout, updateArtistProfile } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [repertoire, setRepertoire] = useState<Song[]>(artist?.repertoire || []);
    const [isSaving, setIsSaving] = useState(false);

    if (!artist) {
        return (
             <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <p>Carregando dados do artista...</p>
            </div>
        );
    }
    
    const handleSongChange = (index: number, field: keyof Song, value: string) => {
       const newRepertoire = [...repertoire];
       // @ts-ignore
       newRepertoire[index][field] = value;
       setRepertoire(newRepertoire);
    };

    const addSong = () => {
        setRepertoire([...repertoire, { title: '', artist: '', duration: '', previewUrl: '' }]);
    };
    
    const removeSong = (index: number) => {
        const newRepertoire = repertoire.filter((_, i) => i !== index);
        setRepertoire(newRepertoire);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateArtistProfile({ repertoire });
            showToast("Repertório atualizado com sucesso!", 'success');
            navigate('/dashboard');
        } catch (error) {
            console.error("Failed to save repertoire:", error);
            showToast("Ocorreu um erro ao salvar o repertório. Tente novamente.", 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
             <header className="bg-gray-800 shadow-md">
                 <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                         <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-700">
                             <i className="fas fa-arrow-left"></i>
                         </Link>
                        <h1 className="text-xl font-bold tracking-wider">Editar Repertório</h1>
                    </div>
                     <button onClick={logout} className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors">
                        <i className="fas fa-sign-out-alt"></i>
                        <span>Sair</span>
                     </button>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                 <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                     <div className="bg-gray-800/50 p-6 rounded-lg">
                        {repertoire.map((song, index) => (
                             <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-4 p-4 bg-gray-900/50 rounded-md">
                                 <div className="md:col-span-2">
                                     <label className="block text-sm font-medium text-gray-300 mb-1">Título da Música</label>
                                     <input type="text" value={song.title} onChange={(e) => handleSongChange(index, 'title', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500" required/>
                                 </div>
                                 <div>
                                     <label className="block text-sm font-medium text-gray-300 mb-1">Artista Original</label>
                                     <input type="text" value={song.artist} onChange={(e) => handleSongChange(index, 'artist', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500" required/>
                                 </div>
                                 <div className="flex items-center">
                                    <button type="button" onClick={() => removeSong(index)} className="bg-gray-700 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-md transition-colors" aria-label="Remover música">
                                        <i className="fas fa-trash"></i>
                                    </button>
                                 </div>
                             </div>
                        ))}
                         <button type="button" onClick={addSong} className="w-full mt-4 border-2 border-dashed border-gray-600 hover:border-red-500 text-gray-400 hover:text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                            <i className="fas fa-plus mr-2"></i>Adicionar Música
                        </button>
                     </div>
                     
                     <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-gray-700">
                        <button type="button" onClick={() => navigate('/dashboard')} className="px-6 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-500 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" disabled={isSaving} className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-500 disabled:cursor-wait flex items-center gap-2">
                            {isSaving ? (<><i className="fas fa-spinner fa-spin"></i><span>Salvando...</span></>) : ('Salvar Repertório')}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default EditRepertoirePage;
