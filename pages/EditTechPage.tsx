import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';

const EditTechPage: React.FC = () => {
    const { artist, logout, updateArtistProfile } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [techReqs, setTechReqs] = useState(artist?.technicalRequirements || {
        space: '',
        power: '',
        providedByArtist: [],
        providedByContractor: []
    });
    const [isSaving, setIsSaving] = useState(false);

    if (!artist) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <p>Carregando dados do artista...</p>
            </div>
        );
    }
    
    const handleListChange = (listName: 'providedByArtist' | 'providedByContractor', index: number, value: string) => {
        const newList = [...techReqs[listName]];
        newList[index] = value;
        setTechReqs(prev => ({ ...prev, [listName]: newList }));
    };

    const addListItem = (listName: 'providedByArtist' | 'providedByContractor') => {
        setTechReqs(prev => ({...prev, [listName]: [...prev[listName], '']}));
    };
    
    const removeListItem = (listName: 'providedByArtist' | 'providedByContractor', index: number) => {
        const newList = techReqs[listName].filter((_, i) => i !== index);
        setTechReqs(prev => ({ ...prev, [listName]: newList }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateArtistProfile({ technicalRequirements: techReqs });
            showToast("Requisitos atualizados com sucesso!", 'success');
            navigate('/dashboard');
        } catch (error) {
            console.error("Failed to save tech requirements:", error);
            showToast("Ocorreu um erro ao salvar os requisitos. Tente novamente.", 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const ListItemEditor: React.FC<{
        title: string, 
        listName: 'providedByArtist' | 'providedByContractor',
        list: string[]
    }> = ({ title, listName, list }) => (
         <div>
            <h3 className="text-lg font-semibold text-white mb-3">{title}</h3>
            <div className="space-y-2">
                 {list.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <input 
                            type="text" 
                            value={item} 
                            onChange={(e) => handleListChange(listName, index, e.target.value)} 
                            className="flex-grow bg-gray-900 border border-gray-700 rounded-md py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500" 
                            placeholder="Descreva o item"
                        />
                        <button type="button" onClick={() => removeListItem(listName, index)} className="text-gray-500 hover:text-red-500 p-2"><i className="fas fa-minus-circle"></i></button>
                    </div>
                ))}
                <button type="button" onClick={() => addListItem(listName)} className="text-sm text-red-400 hover:text-red-300 transition-colors"><i className="fas fa-plus mr-2"></i>Adicionar item</button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-900 text-white">
             <header className="bg-gray-800 shadow-md">
                 <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                         <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-700">
                             <i className="fas fa-arrow-left"></i>
                         </Link>
                        <h1 className="text-xl font-bold tracking-wider">Editar Requisitos Técnicos</h1>
                    </div>
                     <button onClick={logout} className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors">
                        <i className="fas fa-sign-out-alt"></i>
                        <span>Sair</span>
                     </button>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                 <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-gray-800/50 p-8 rounded-lg space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Espaço Mínimo Necessário</label>
                        <input type="text" value={techReqs.space} onChange={(e) => setTechReqs(prev => ({...prev, space: e.target.value}))} className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Ex: 2m x 2m"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Ponto de Energia</label>
                        <input type="text" value={techReqs.power} onChange={(e) => setTechReqs(prev => ({...prev, power: e.target.value}))} className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Ex: 1 ponto 110v próximo ao local"/>
                    </div>

                    <div className="pt-6 border-t border-gray-700">
                        <ListItemEditor title="Fornecido pelo Contratante" listName="providedByContractor" list={techReqs.providedByContractor} />
                    </div>

                    <div className="pt-6 border-t border-gray-700">
                        <ListItemEditor title="Fornecido pelo Artista" listName="providedByArtist" list={techReqs.providedByArtist} />
                    </div>
                     
                     <div className="flex justify-end gap-4 pt-6 border-t border-gray-700">
                        <button type="button" onClick={() => navigate('/dashboard')} className="px-6 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-500 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" disabled={isSaving} className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-500 disabled:cursor-wait flex items-center gap-2">
                            {isSaving ? (<><i className="fas fa-spinner fa-spin"></i><span>Salvando...</span></>) : ('Salvar Requisitos')}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default EditTechPage;
