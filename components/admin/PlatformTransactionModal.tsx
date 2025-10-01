import React, { useState, useEffect } from 'react';
import { PlatformTransaction } from '../../types';

interface PlatformTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (transaction: Omit<PlatformTransaction, 'id' | 'created_at'>) => void;
    type: 'income' | 'expense';
    transactionToEdit?: PlatformTransaction;
}

const PlatformTransactionModal: React.FC<PlatformTransactionModalProps> = ({ isOpen, onClose, onSave, type, transactionToEdit }) => {
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [value, setValue] = useState<number | ''>('');
    const [dueDate, setDueDate] = useState('');
    const [status, setStatus] = useState<'pending' | 'paid'>('pending');
    
    const isEditing = !!transactionToEdit;

    useEffect(() => {
        if (isOpen) {
            if (transactionToEdit) {
                setDescription(transactionToEdit.description);
                setCategory(transactionToEdit.category);
                setValue(transactionToEdit.value);
                setDueDate(transactionToEdit.due_date || '');
                setStatus(transactionToEdit.status);
            } else {
                // Reset form
                setDescription('');
                setCategory(type === 'expense' ? 'Infraestrutura' : 'Outros');
                setValue('');
                setDueDate(new Date().toISOString().split('T')[0]);
                setStatus('pending');
            }
        }
    }, [isOpen, transactionToEdit, type]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (description && value) {
            onSave({
                description,
                category,
                value: Number(value),
                status,
                due_date: dueDate || undefined,
                type: isEditing ? transactionToEdit.type : type,
            });
        }
    };
    
    const expenseCategories = ['Infraestrutura', 'Marketing', 'Salários', 'Impostos', 'Outros'];
    const incomeCategories = ['Investimento', 'Venda de Ativos', 'Outros'];
    const currentCategories = (isEditing ? transactionToEdit.type : type) === 'expense' ? expenseCategories : incomeCategories;

    return (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-gray-800 w-full max-w-lg rounded-lg shadow-2xl" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h3 className="text-xl font-bold text-white mb-4">{isEditing ? 'Editar' : 'Adicionar'} {isEditing ? (transactionToEdit.type === 'income' ? 'Receita' : 'Despesa') : (type === 'income' ? 'Receita' : 'Despesa')}</h3>
                        <div className="space-y-4">
                            <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Descrição do Lançamento" required className="w-full bg-gray-900 border border-gray-700 rounded p-2" />
                            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-2">
                                {currentCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                            <input type="number" value={value} onChange={e => setValue(e.target.value ? parseFloat(e.target.value) : '')} placeholder="Valor (R$)" required min="0.01" step="0.01" className="w-full bg-gray-900 border border-gray-700 rounded p-2" />
                             <div>
                                <label className="text-xs text-gray-400">Data de Vencimento/Competência</label>
                                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required className="w-full bg-gray-900 border border-gray-700 rounded p-2 mt-1" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400">Status</label>
                                <select value={status} onChange={e => setStatus(e.target.value as 'pending' | 'paid')} className="w-full bg-gray-900 border border-gray-700 rounded p-2 mt-1">
                                    <option value="pending">Pendente</option>
                                    <option value="paid">Pago/Recebido</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-700/50 px-6 py-4 flex justify-end gap-4 rounded-b-lg">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 rounded">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-red-600 rounded">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PlatformTransactionModal;