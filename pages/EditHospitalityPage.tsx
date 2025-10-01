import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';

const EditHospitalityPage: React.FC = () => {
    const { artist, logout, updateArtistProfile } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [rider, setRider] = useState<string[]>(artist?.hospitalityRider || []);
    const [isSaving, setIsSaving] = useState(false);

    if (!artist) {
        return (
             <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <p>Carregando dados do artista...</p>
            </div>
        );
    }
    
    const handleItemChange = (index: number, value: string) => {
        const newRider = [...rider];
        newRider[index] = value;
        setRider(newRider);
    };

    const addItem = () => {
        setRider([...rider, '']);
    };
    
    const removeItem = (index: number) => {
        const newRider = rider.filter((_, i) => i !== index);
        setRider(newRider);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateArtistProfile({ hospitalityRider: rider.filter(Boolean) }); // filter out empty strings
            showToast("Rider de hospitalidade atualizado com sucesso!", 'success');
            navigate('/dashboard');
        } catch (error) {
            console.error("Failed to save hospitality rider:", error);
            showToast("Ocorreu um erro ao salvar o rider. Tente novamente.", 'error');
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
                        <h1 className="text-xl font-bold tracking-wider">Editar Hospitalidade</h1>
                    </div>
                     <button onClick={logout} className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors">
                        <i className="fas fa-sign-out-alt"></i>
                        <span>Sair</span>
                     </button>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                 <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
                     <div className="bg-gray-800/50 p-6 rounded-lg">
                         <p className="text-sm text-gray-400 mb-6">Liste os itens de catering e camarim que você solicita ao contratante.</p>
                        <div className="space-y-3">
                            {rider.map((item, index) => (
                                 <div key={index} className="flex items-center gap-2">
                                     <input 
                                        type="text" 
                                        value={item} 
                                        onChange={(e) => handleItemChange(index, e.target.value)} 
                                        className="flex-grow bg-gray-900 border border-gray-700 rounded-md py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500" 
                                        placeholder="Ex: 2L de água sem gás" 
                                    />
                                     <button type="button" onClick={() => removeItem(index)} className="text-gray-500 hover:text-red-500 p-2"><i className="fas fa-minus-circle"></i></button>
                                 </div>
                            ))}
                        </div>
                         <button type="button" onClick={addItem} className="mt-4 text-sm text-red-400 hover:text-red-300 transition-colors"><i className="fas fa-plus mr-2"></i>Adicionar item</button>
                     </div>
                     
                     <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-gray-700">
                        <button type="button" onClick={() => navigate('/dashboard')} className="px-6 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-500 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" disabled={isSaving} className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-500 disabled:cursor-wait flex items-center gap-2">
                            {isSaving ? (<><i className="fas fa-spinner fa-spin"></i><span>Salvando...</span></>) : ('Salvar Rider')}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default EditHospitalityPage;
