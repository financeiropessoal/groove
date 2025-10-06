import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import ListEditor from '../components/ListEditor';

const EditHospitalityPage: React.FC = () => {
    const { artist, updateArtistProfile } = useAuth();
    const navigate = useNavigate();
    const [rider, setRider] = useState<string[]>(artist?.hospitalityRider || []);
    const [isSaving, setIsSaving] = useState(false);
    const { showToast } = useToast();

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateArtistProfile({ hospitalityRider: rider });
            showToast('Rider de hospitalidade salvo!', 'success');
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
                        <h1 className="text-3xl font-bold">Rider de Hospitalidade</h1>
                        <p className="text-gray-400">Liste suas necessidades de camarim.</p>
                    </div>
                </div>
                 <button onClick={handleSave} disabled={isSaving} className="px-6 py-2 bg-pink-600 rounded-lg font-semibold hover:bg-pink-700 disabled:bg-gray-500 flex items-center gap-2">
                    {isSaving ? <><i className="fas fa-spinner fa-spin"></i>Salvando...</> : 'Salvar Rider'}
                </button>
            </div>
            <div className="bg-gray-800 p-8 rounded-lg">
                <ListEditor
                    title="Itens do Rider"
                    items={rider}
                    onItemsChange={setRider}
                    placeholder="Ex: 2L de água sem gás, toalhas limpas..."
                    description="Liste aqui suas necessidades de camarim. Seja claro e objetivo para facilitar o trabalho do contratante e garantir seu bem-estar no dia do show."
                />
            </div>
        </div>
    );
};

export default EditHospitalityPage;