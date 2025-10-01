import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Plan, CostItem } from '../data';
import PriceCalculatorModal from '../components/PriceCalculatorModal';
import { useToast } from '../contexts/ToastContext';

const EditPlansPage: React.FC = () => {
    const { artist, logout, updateArtistProfile } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [plans, setPlans] = useState<Plan[]>(artist?.plans || []);
    const [isSaving, setIsSaving] = useState(false);
    const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
    const [editingPlanIndex, setEditingPlanIndex] = useState<number | null>(null);

    if (!artist) {
        return (
             <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <p>Carregando dados do artista...</p>
            </div>
        );
    }
    
    const handlePlanChange = (index: number, field: keyof Plan, value: string | number | string[] | CostItem[]) => {
       const newPlans = [...plans];
       // @ts-ignore
       newPlans[index][field] = value;
       setPlans(newPlans);
    };
    
    const handleIncludesChange = (planIndex: number, includeIndex: number, value: string) => {
        const newPlans = [...plans];
        newPlans[planIndex].includes[includeIndex] = value;
        setPlans(newPlans);
    }
    
    const addIncludeItem = (planIndex: number) => {
        const newPlans = [...plans];
        newPlans[planIndex].includes.push('');
        setPlans(newPlans);
    }
    
    const removeIncludeItem = (planIndex: number, includeIndex: number) => {
        const newPlans = [...plans];
        newPlans[planIndex].includes.splice(includeIndex, 1);
        setPlans(newPlans);
    }

    const addPlan = () => {
        setPlans([...plans, { 
            id: Date.now(), 
            name: '', 
            price: 0, 
            description: '', 
            includes: [''], 
            costs: [{ id: Date.now(), description: 'Meu cachê', value: 0, status: 'pending' }] 
        }]);
    };
    
    const removePlan = (index: number) => {
        const newPlans = plans.filter((_, i) => i !== index);
        setPlans(newPlans);
    };

    const openCalculator = (index: number) => {
        setEditingPlanIndex(index);
        setIsCalculatorOpen(true);
    };

    const handleApplyCalculation = (data: { price: number, costs: CostItem[] }) => {
        if (editingPlanIndex !== null) {
            const newPlans = [...plans];
            newPlans[editingPlanIndex].price = data.price;
            newPlans[editingPlanIndex].costs = data.costs;
            setPlans(newPlans);
        }
        setIsCalculatorOpen(false);
        setEditingPlanIndex(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateArtistProfile({ plans });
            showToast("Pacotes atualizados com sucesso!", 'success');
            navigate('/dashboard');
        } catch (error) {
            showToast("Ocorreu um erro ao salvar os pacotes.", 'error');
            console.error("Failed to save plans:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <div className="min-h-screen bg-gray-900 text-white">
                 <header className="bg-gray-800 shadow-md">
                     <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                             <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-700">
                                 <i className="fas fa-arrow-left"></i>
                             </Link>
                            <h1 className="text-xl font-bold tracking-wider">Editar Pacotes de Show</h1>
                        </div>
                         <button onClick={logout} className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors">
                            <i className="fas fa-sign-out-alt"></i>
                            <span>Sair</span>
                         </button>
                    </div>
                </header>

                <main className="container mx-auto px-4 py-8">
                     <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
                        {plans.map((plan, index) => (
                            <div key={plan.id} className="bg-gray-800/50 p-6 rounded-lg relative">
                                 <button type="button" onClick={() => removePlan(index)} className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors" aria-label="Remover Pacote">
                                    <i className="fas fa-trash-alt"></i>
                                </button>
                                <h3 className="text-lg font-bold text-red-400 mb-4">Pacote #{index + 1}</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Nome do Pacote</label>
                                        <input type="text" value={plan.name} onChange={(e) => handlePlanChange(index, 'name', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Ex: Voz e Violão"/>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Preço Final (R$)</label>
                                        <div className="flex gap-2 items-center">
                                            <div className="relative flex-grow">
                                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">R$</span>
                                                <input type="text" value={plan.price.toFixed(2).replace('.', ',')} readOnly className="w-full bg-gray-900/50 border border-gray-700 rounded-md py-2 pl-10 pr-4 text-white font-bold" />
                                            </div>
                                            <button 
                                                type="button" 
                                                onClick={() => openCalculator(index)}
                                                className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors flex-shrink-0"
                                            >
                                                <i className="fas fa-calculator mr-2"></i>
                                                Editar Detalhes e Preço
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Descrição</label>
                                        <textarea value={plan.description} onChange={(e) => handlePlanChange(index, 'description', e.target.value)} rows={3} className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Descrição do que o pacote oferece." />
                                    </div>
                                    <div>
                                         <label className="block text-sm font-medium text-gray-300 mb-2">Itens Inclusos</label>
                                         <div className="space-y-2">
                                             {plan.includes.map((item, i) => (
                                                 <div key={i} className="flex items-center gap-2">
                                                     <input type="text" value={item} onChange={(e) => handleIncludesChange(index, i, e.target.value)} className="flex-grow bg-gray-900 border border-gray-700 rounded-md py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Ex: 2 horas de apresentação" />
                                                     <button type="button" onClick={() => removeIncludeItem(index, i)} className="text-gray-500 hover:text-red-500 p-2"><i className="fas fa-minus-circle"></i></button>
                                                 </div>
                                             ))}
                                              <button type="button" onClick={() => addIncludeItem(index)} className="text-sm text-red-400 hover:text-red-300 transition-colors"><i className="fas fa-plus mr-2"></i>Adicionar item</button>
                                         </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button type="button" onClick={addPlan} className="w-full border-2 border-dashed border-gray-600 hover:border-red-500 text-gray-400 hover:text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                            <i className="fas fa-plus mr-2"></i>Adicionar Novo Pacote
                        </button>
                        
                         <div className="flex justify-end gap-4 pt-6 border-t border-gray-700">
                            <button type="button" onClick={() => navigate('/dashboard')} className="px-6 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-500 transition-colors">
                                Cancelar
                            </button>
                            <button type="submit" disabled={isSaving} className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-500 disabled:cursor-wait flex items-center gap-2">
                                {isSaving ? (<><i className="fas fa-spinner fa-spin"></i><span>Salvando...</span></>) : ('Salvar Pacotes')}
                            </button>
                        </div>
                    </form>
                </main>
            </div>
            {isCalculatorOpen && editingPlanIndex !== null && (
                <PriceCalculatorModal
                    isOpen={isCalculatorOpen}
                    onClose={() => setIsCalculatorOpen(false)}
                    onApply={handleApplyCalculation}
                    initialCosts={plans[editingPlanIndex]?.costs}
                />
            )}
        </>
    );
};

export default EditPlansPage;