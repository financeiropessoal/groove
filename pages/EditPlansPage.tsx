
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Plan, Cost } from '../types';
import PriceCalculatorModal from '../components/PriceCalculatorModal';

const EditPlansPage: React.FC = () => {
    const { artist, updateArtistProfile } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [plans, setPlans] = useState<Plan[]>(artist?.plans || []);
    const [isSaving, setIsSaving] = useState(false);
    const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

    const handleAddPlan = () => {
        const newPlan: Plan = {
            id: Date.now(), // Temporary ID
            name: 'Novo Pacote',
            description: '',
            priceCompany: 0,
            priceIndividual: 0,
            includes: [],
            costs: [],
        };
        setPlans([...plans, newPlan]);
    };

    const handleRemovePlan = (id: number) => {
        setPlans(plans.filter(p => p.id !== id));
    };

    const handlePlanChange = (id: number, field: keyof Plan, value: any) => {
        setPlans(plans.map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    const handleIncludeChange = (planId: number, index: number, value: string) => {
        setPlans(plans.map(p => {
            if (p.id === planId) {
                const newIncludes = [...p.includes];
                newIncludes[index] = value;
                return { ...p, includes: newIncludes };
            }
            return p;
        }));
    };

    const addInclude = (planId: number) => {
         setPlans(plans.map(p => p.id === planId ? { ...p, includes: [...p.includes, ''] } : p));
    };

    const removeInclude = (planId: number, index: number) => {
         setPlans(plans.map(p => p.id === planId ? { ...p, includes: p.includes.filter((_, i) => i !== index) } : p));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateArtistProfile({ plans });
            showToast('Pacotes salvos com sucesso!', 'success');
            navigate('/dashboard');
        } catch (error) {
            showToast('Erro ao salvar pacotes.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div>
            {isCalculatorOpen && <PriceCalculatorModal onClose={() => setIsCalculatorOpen(false)} />}

            <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
                 <div className="flex items-center gap-4">
                    <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors" aria-label="Voltar ao painel">
                        <i className="fas fa-arrow-left text-2xl"></i>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Editar Pacotes de Show</h1>
                        <p className="text-gray-400">Crie e gerencie os formatos que você oferece.</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button onClick={handleSave} disabled={isSaving} className="px-6 py-2 bg-pink-600 rounded-lg font-semibold hover:bg-pink-700 disabled:bg-gray-500 flex items-center gap-2">
                        {isSaving ? <><i className="fas fa-spinner fa-spin"></i>Salvando...</> : 'Salvar Pacotes'}
                    </button>
                    <button onClick={handleAddPlan} className="px-6 py-2 bg-gray-600 rounded-lg font-semibold hover:bg-gray-500 transition-colors">
                        Adicionar Pacote
                    </button>
                </div>
            </div>
            
            <div className="space-y-6">
                {plans.map(plan => (
                    <div key={plan.id} className="bg-gray-800 p-6 rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                            <input 
                                type="text"
                                value={plan.name}
                                onChange={e => handlePlanChange(plan.id, 'name', e.target.value)}
                                className="text-xl font-bold bg-transparent border-b-2 border-gray-700 focus:border-pink-500 focus:outline-none"
                            />
                            <button onClick={() => handleRemovePlan(plan.id)} className="text-gray-500 hover:text-red-500"><i className="fas fa-trash"></i></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-300">Descrição</label>
                                <input 
                                    type="text"
                                    value={plan.description}
                                    onChange={e => handlePlanChange(plan.id, 'description', e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 mt-1"
                                />
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-300">Preço para Empresas (PJ)</label>
                                    <input 
                                        type="number"
                                        value={plan.priceCompany}
                                        onChange={e => handlePlanChange(plan.id, 'priceCompany', Number(e.target.value))}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 mt-1"
                                    />
                                </div>
                                 <div>
                                    <label className="text-sm font-medium text-gray-300">Preço para Particulares (PF)</label>
                                    <input 
                                        type="number"
                                        value={plan.priceIndividual}
                                        onChange={e => handlePlanChange(plan.id, 'priceIndividual', Number(e.target.value))}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 mt-1"
                                    />
                                </div>
                            </div>
                             <div>
                                <label className="text-sm font-medium text-gray-300">Itens Inclusos</label>
                                <div className="space-y-2 mt-1">
                                    {plan.includes.map((item, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <input 
                                                type="text"
                                                value={item}
                                                onChange={e => handleIncludeChange(plan.id, index, e.target.value)}
                                                className="flex-grow bg-gray-900 border border-gray-700 rounded-md py-2 px-3"
                                            />
                                            <button type="button" onClick={() => removeInclude(plan.id, index)} className="text-gray-500 hover:text-red-500"><i className="fas fa-minus-circle"></i></button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => addInclude(plan.id)} className="text-xs text-pink-400 hover:text-pink-300"><i className="fas fa-plus mr-1"></i>Adicionar item</button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mt-8 p-4 bg-gray-800/50 rounded-lg text-center">
                <p className="text-gray-300">Não sabe como precificar seu show?</p>
                <button onClick={() => setIsCalculatorOpen(true)} className="mt-2 font-semibold text-pink-400 hover:underline">
                    Use nossa Calculadora de Cachê
                </button>
            </div>
        </div>
    );
};

export default EditPlansPage;
