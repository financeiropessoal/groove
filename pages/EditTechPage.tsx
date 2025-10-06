import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import ListEditor from '../components/ListEditor';

interface TechReqsState {
    space: string;
    power: string;
    providedByArtist: string[];
    providedByContractor: string[];
}

const EditTechPage: React.FC = () => {
    const { artist, updateArtistProfile } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();
    
    const [techReqs, setTechReqs] = useState<TechReqsState>(artist?.technicalRequirements || { space: '', power: '', providedByArtist: [], providedByContractor: [] });
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setTechReqs(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateArtistProfile({ technicalRequirements: techReqs });
            showToast('Requisitos técnicos salvos!', 'success');
            navigate('/dashboard');
        } catch (error) {
            showToast('Erro ao salvar.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
                 <div className="flex items-center gap-4">
                    <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors" aria-label="Voltar ao painel">
                        <i className="fas fa-arrow-left text-2xl"></i>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Requisitos Técnicos</h1>
                        <p className="text-gray-400">Especifique o que você precisa para o show.</p>
                    </div>
                </div>
                <button onClick={handleSave} disabled={isSaving} className="px-6 py-2 bg-pink-600 rounded-lg font-semibold hover:bg-pink-700 disabled:bg-gray-500 flex items-center gap-2">
                    {isSaving ? <><i className="fas fa-spinner fa-spin"></i>Salvando...</> : 'Salvar Requisitos'}
                </button>
            </div>
            <div className="bg-gray-800 p-8 rounded-lg">
                <div className="space-y-8">
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Necessidades de Palco</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Espaço Mínimo</label>
                                <input name="space" value={techReqs.space} onChange={handleChange} placeholder="Ex: 3m x 2m" className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Pontos de Energia</label>
                                <input name="power" value={techReqs.power} onChange={handleChange} placeholder="Ex: 2 pontos 110v" className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4" />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-700 pt-8">
                        <ListEditor
                            title="Equipamentos Fornecidos pelo Artista"
                            items={techReqs.providedByArtist}
                            onItemsChange={(newItems) => setTechReqs(prev => ({ ...prev, providedByArtist: newItems }))}
                            placeholder="Ex: Violão, Pedais de efeito"
                            description="Liste os equipamentos que você (ou sua banda) levará para o show."
                        />
                    </div>
                    
                    <div className="border-t border-gray-700 pt-8">
                        <ListEditor
                            title="Equipamentos a serem Fornecidos pelo Contratante"
                            items={techReqs.providedByContractor}
                            onItemsChange={(newItems) => setTechReqs(prev => ({ ...prev, providedByContractor: newItems }))}
                            placeholder="Ex: P.A. completo, Mesa de som, 2 Microfones"
                            description="Seja específico sobre o que o local precisa fornecer para garantir a qualidade do seu som."
                        />
                    </div>

                </div>
            </div>
        </div>
    );
};

export default EditTechPage;