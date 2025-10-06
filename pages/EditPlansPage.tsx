import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Plan, CostItem } from '../data';
import { useToast } from '../contexts/ToastContext';
import PriceCalculatorModal from '../components/PriceCalculatorModal';
import EmptyState from '../components/EmptyState';

const PlanItem: React.FC<{ plan: Plan; onEdit: () => void; onRemove: () => void; onUpdate: (field: keyof Plan, value: any) => void; }> = ({ plan, onEdit, onRemove, onUpdate }) => {
    return (
        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-grow space-y-3">
                    <input 
                        type="text"
                        value={plan.name}
                        onChange={(e) => onUpdate('name', e.target.value)}
                        placeholder="Nome do Pacote (Ex: Voz e Violão)"
                        className="w-full bg-gray-800 border border-gray-600 rounded-md py-2 px-3 font-semibold text-lg"
                    />
                    <textarea 
                        value={plan.description}
                        onChange={(e) => onUpdate('description', e.target.value)}
                        placeholder="Descrição do pacote"
                        rows={2}
                        className="w-full bg-gray-800 border border-gray-600 rounded-md py-2 px-3 text-sm"
                    />
                </div>
                <div className="flex-shrink-0 flex flex-col items-start md:items-end justify-between gap-2">
                    <div className="text-left md:text-right">
                        <p className="text-sm text-gray-400">Preço Final</p>
                        <p className="text-2xl font-bold text-green-400">R$ {plan.price.toFixed(2).replace('.', ',')}</p>
                    </div>
                    <div className="flex gap-2">
                         <button onClick={onEdit} className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-500 rounded-md">
                            <i className="fas fa-calculator mr-2"></i>
                            Calcular
                        </button>
                        <button onClick={onRemove} className="px-3 py-1 text-sm bg-red-800 hover:bg-red-700 rounded-md">
                            <i className="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const EditPlansPage: React.FC = () => {
    const { artist, updateArtistProfile } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [plans, setPlans] = useState<Plan[]>(artist?.plans || []);
    const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
    const [editingPlanIndex, setEditingPlanIndex] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);

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

    const handleOpenCalculator = (index: number) => {
        setEditingPlanIndex(index);
        setIsCalculatorOpen(true);
    };
    
    const handleApplyPrice = (data: { price: number; costs: CostItem[] }) => {
        if (editingPlanIndex !== null) {
            handlePlanUpdate(editingPlanIndex, 'price', data.price);
            handlePlanUpdate(editingPlanIndex, 'costs', data.costs);
        }
        setIsCalculatorOpen(false);
        setEditingPlanIndex(null);
    };

    const addPlan = () => {
        const newPlan: Plan = {
            id: Date.now(),
            name: '',
            price: 0,
            description: '',
            includes: [],
            costs: [{ id: Date.now(), description: 'Meu cachê', value: 0, status: 'pending' }],
        };
        setPlans([...plans, newPlan]);
    };

    const removePlan = (index: number) => {
        if (window.confirm('Tem certeza que deseja remover este pacote?')) {
            setPlans(plans.filter((_, i) => i !== index));
        }
    };

    const handlePlanUpdate = (index: number, field: keyof Plan, value: any) => {
        const newPlans = [...plans];
        newPlans[index] = { ...newPlans[index], [field]: value };
        setPlans(newPlans);
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors" aria-label="Voltar ao painel">
                        <i className="fas fa-arrow-left text-2xl"></i>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Gerenciar Pacotes de Show</h1>
                        <p className="text-gray-400">Crie e edite os formatos de apresentação que você oferece.</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button onClick={addPlan} className="px-4 py-2 bg-gray-600 rounded-lg font-semibold hover:bg-gray-500 transition-colors">
                        <i className="fas fa-plus mr-2"></i>
                        Novo Pacote
                    </button>
                    <button onClick={handleSave} disabled={isSaving} className="px-6 py-2 bg-pink-600 rounded-lg font-semibold hover:bg-pink-700 disabled:bg-gray-500 flex items-center gap-2">
                        {isSaving ? <><i className="fas fa-spinner fa-spin"></i>Salvando...</> : 'Salvar Pacotes'}
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto">
                {plans.length > 0 ? (
                    <div className="space-y-4">
                        {plans.map((plan, index) => (
                            <PlanItem 
                                key={plan.id} 
                                plan={plan}
                                onEdit={() => handleOpenCalculator(index)}
                                onRemove={() => removePlan(index)}
                                onUpdate={(field, value) => handlePlanUpdate(index, field, value)}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon="fa-box-open"
                        title="Nenhum pacote criado"
                        message="Crie pacotes para que os contratantes saibam os formatos de show que você oferece. Ex: 'Voz e Violão', 'Banda Completa'."
                    >
                         <button onClick={addPlan} className="px-6 py-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white font-bold rounded-lg">
                            Criar Meu Primeiro Pacote
                        </button>
                    </EmptyState>
                )}
            </div>

            <PriceCalculatorModal
                isOpen={isCalculatorOpen}
                onClose={() => setIsCalculatorOpen(false)}
                onApply={handleApplyPrice}
                initialCosts={editingPlanIndex !== null ? plans[editingPlanIndex]?.costs : undefined}
                isArtistPro={artist?.is_pro || false}
            />
        </div>
    );
};

export default EditPlansPage;