import React, { useState, useEffect } from 'react';
import { PersonalTransaction } from '../data';
import { FinancialService } from '../services/FinancialService';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

interface PersonalTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    transaction: PersonalTransaction | null;
}

const PersonalTransactionModal: React.FC<PersonalTransactionModalProps> = ({ isOpen, onClose, onSave, transaction }) => {
    const { artist } = useAuth();
    const [formData, setFormData] = useState({
        description: '',
        type: 'expense' as 'income' | 'expense',
        category: '',
        value: 0,
        status: 'pending' as 'pending' | 'paid',
        date: new Date().toISOString().split('T')[0],
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        if (transaction) {
            setFormData({
                description: transaction.description,
                type: transaction.type,
                category: transaction.category,
                value: transaction.value,
                status: transaction.status,
                date: transaction.date, // Already in YYYY-MM-DD format
            });
        } else {
            setFormData({
                description: '',
                type: 'expense',
                category: '',
                value: 0,
                status: 'pending',
                date: new Date().toISOString().split('T')[0],
            });
        }
    }, [transaction, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'value' ? parseFloat(value) || 0 : value }));
    };

    const handleSubmit = async () => {
        if (!artist) return;
        setIsSaving(true);
        let success = false;
        if (transaction) {
            const result = await FinancialService.updateTransaction(transaction.id, formData);
            success = !!result;
        } else {
            const result = await FinancialService.addTransaction(artist.id, formData);
            success = !!result;
        }
        setIsSaving(false);

        if (success) {
            showToast('Transação salva!', 'success');
            onSave();
        } else {
            showToast('Erro ao salvar.', 'error');
        }
    };
    
    const handleDelete = async () => {
        if (transaction && window.confirm('Tem certeza que deseja excluir esta transação?')) {
            setIsDeleting(true);
            const success = await FinancialService.deleteTransaction(transaction.id);
            setIsDeleting(false);
            if (success) {
                showToast('Transação excluída!', 'success');
                onSave();
            } else {
                showToast('Erro ao excluir.', 'error');
            }
        }
    }

    if (!isOpen) return null;
    
    const categories = formData.type === 'income' 
        ? ['Cachê', 'Venda de Merch', 'Direitos Autorais', 'Outra Receita']
        : ['Transporte', 'Alimentação', 'Equipamento', 'Marketing', 'Músicos', 'Outra Despesa'];

    return (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-lg shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6">{transaction ? 'Editar' : 'Adicionar'} Transação Pessoal</h2>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-400">Descrição</label>
                        <input name="description" value={formData.description} onChange={handleChange} className="w-full bg-gray-900 p-2 rounded mt-1 border border-gray-700" />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="text-sm font-medium text-gray-400">Tipo</label>
                           <select name="type" value={formData.type} onChange={handleChange} className="w-full bg-gray-900 p-2 rounded mt-1 border border-gray-700">
                               <option value="expense">Despesa</option>
                               <option value="income">Receita</option>
                           </select>
                       </div>
                       <div>
                           <label className="text-sm font-medium text-gray-400">Valor (R$)</label>
                           <input name="value" type="number" step="0.01" value={formData.value === 0 ? '' : formData.value} onChange={handleChange} className="w-full bg-gray-900 p-2 rounded mt-1 border border-gray-700" placeholder="0,00" />
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="text-sm font-medium text-gray-400">Categoria</label>
                            <input list="categories" name="category" value={formData.category} onChange={handleChange} className="w-full bg-gray-900 p-2 rounded mt-1 border border-gray-700" />
                            <datalist id="categories">
                                {categories.map(cat => <option key={cat} value={cat} />)}
                            </datalist>
                        </div>
                        <div>
                           <label className="text-sm font-medium text-gray-400">Status</label>
                           <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-gray-900 p-2 rounded mt-1 border border-gray-700">
                               <option value="pending">Pendente</option>
                               <option value="paid">Realizado</option>
                           </select>
                       </div>
                    </div>
                     <div>
                        <label className="text-sm font-medium text-gray-400">Data</label>
                        <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full bg-gray-900 p-2 rounded mt-1 border border-gray-700" />
                    </div>
                </div>
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-700">
                     <div>
                        {transaction && (
                            <button onClick={handleDelete} disabled={isDeleting} className="text-red-500 hover:text-red-400 text-sm disabled:opacity-50">
                                {isDeleting ? 'Excluindo...' : 'Excluir Transação'}
                            </button>
                        )}
                    </div>
                    <div className="flex gap-4">
                        <button onClick={onClose} className="bg-gray-600 px-4 py-2 rounded font-semibold">Cancelar</button>
                        <button onClick={handleSubmit} disabled={isSaving} className="bg-pink-600 px-4 py-2 rounded font-semibold disabled:opacity-50">
                            {isSaving ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PersonalTransactionModal;