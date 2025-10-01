import React, { useState, useEffect, useMemo } from 'react';
import { AdminService } from '../../services/AdminService';
import { PlatformTransaction } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import PlatformTransactionModal from '../../components/admin/PlatformTransactionModal';

const StatCard: React.FC<{ title: string; value: string; icon: string; color: string }> = ({ title, value, icon, color }) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="flex items-center">
            <div className={`p-3 rounded-full mr-4 bg-${color.split('-')[1]}-400/20`}>
                <i className={`fas ${icon} ${color} text-xl`}></i>
            </div>
            <div>
                <p className="text-sm text-gray-400">{title}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
            </div>
        </div>
    </div>
);

const AdminFinancesPage: React.FC = () => {
    const [transactions, setTransactions] = useState<PlatformTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'income' | 'expense'>('expense');
    const [editingTransaction, setEditingTransaction] = useState<PlatformTransaction | null>(null);
    const { showToast } = useToast();

    const fetchData = async () => {
        setIsLoading(true);
        const data = await AdminService.getPlatformFinances();
        setTransactions(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const { totalIncome, totalExpense, balance } = useMemo(() => {
        const income = transactions.reduce((sum, t) => t.type === 'income' && t.status === 'paid' ? sum + t.value : sum, 0);
        const expense = transactions.reduce((sum, t) => t.type === 'expense' && t.status === 'paid' ? sum + t.value : sum, 0);
        return { totalIncome: income, totalExpense: expense, balance: income - expense };
    }, [transactions]);
    
    const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`;

    const handleOpenAddModal = (type: 'income' | 'expense') => {
        setEditingTransaction(null);
        setModalType(type);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (transaction: PlatformTransaction) => {
        if (transaction.booking_id) {
            showToast("Comissões automáticas não podem ser editadas.", 'info');
            return;
        }
        setModalType(transaction.type);
        setEditingTransaction(transaction);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTransaction(null);
    };

    const handleSaveTransaction = async (transactionData: Omit<PlatformTransaction, 'id' | 'created_at'>) => {
        if (editingTransaction) {
            const updated = await AdminService.updatePlatformTransaction(editingTransaction.id, transactionData);
            if (updated) {
                showToast('Lançamento atualizado!', 'success');
                fetchData();
            } else {
                showToast('Erro ao atualizar lançamento.', 'error');
            }
        } else {
            const newTransaction = await AdminService.addPlatformTransaction(transactionData);
            if (newTransaction) {
                showToast('Lançamento adicionado!', 'success');
                fetchData();
            } else {
                showToast('Erro ao adicionar lançamento.', 'error');
            }
        }
        handleCloseModal();
    };

    const handleDeleteTransaction = async (transaction: PlatformTransaction) => {
        if (transaction.booking_id) {
            showToast("Comissões automáticas não podem ser removidas.", 'error');
            return;
        }
        if (window.confirm("Tem certeza que deseja apagar este lançamento?")) {
            const success = await AdminService.deletePlatformTransaction(transaction.id);
            if (success) {
                showToast('Lançamento removido.', 'success');
                fetchData();
            } else {
                showToast('Erro ao remover lançamento.', 'error');
            }
        }
    };

    if (isLoading) {
        return <div className="flex items-center justify-center h-full"><i className="fas fa-spinner fa-spin text-4xl text-red-500"></i></div>;
    }

    return (
        <>
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Financeiro da Plataforma</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Receita Total (Realizada)" value={formatCurrency(totalIncome)} icon="fa-arrow-up" color="text-green-400" />
                <StatCard title="Despesa Total (Realizada)" value={formatCurrency(totalExpense)} icon="fa-arrow-down" color="text-red-400" />
                <StatCard title="Saldo Líquido" value={formatCurrency(balance)} icon="fa-wallet" color="text-blue-400" />
            </div>

            <div className="bg-gray-800 p-4 rounded-lg flex justify-between items-center">
                <h2 className="text-xl font-bold">Histórico de Lançamentos</h2>
                 <div className="flex gap-3">
                    <button onClick={() => handleOpenAddModal('expense')} className="px-4 py-2 bg-red-800 text-red-200 text-sm font-semibold rounded-lg hover:bg-red-700 hover:text-white">- Despesa</button>
                    <button onClick={() => handleOpenAddModal('income')} className="px-4 py-2 bg-green-800 text-green-200 text-sm font-semibold rounded-lg hover:bg-green-700 hover:text-white">+ Receita</button>
                 </div>
            </div>

            <div className="bg-gray-800 rounded-lg overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-700 text-left">
                        <tr>
                            <th className="p-3">Descrição</th>
                            <th className="p-3">Categoria</th>
                            <th className="p-3">Vencimento</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Valor</th>
                            <th className="p-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map(t => (
                            <tr key={t.id} className="border-b border-gray-700 hover:bg-gray-700/50 group">
                                <td className="p-3">{t.description} {t.booking_id && <span className="text-xs text-gray-500">(Show #{t.booking_id})</span>}</td>
                                <td className="p-3 text-gray-400">{t.category}</td>
                                <td className="p-3 text-gray-400">{t.due_date ? new Date(t.due_date + 'T00:00:00').toLocaleDateString('pt-BR') : '-'}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 text-xs rounded-full ${t.status === 'paid' ? 'bg-green-800 text-green-200' : 'bg-yellow-800 text-yellow-200'}`}>
                                        {t.status === 'paid' ? (t.type === 'income' ? 'Recebido' : 'Pago') : 'Pendente'}
                                    </span>
                                </td>
                                <td className={`p-3 font-semibold ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                                    {t.type === 'expense' && '- '}{formatCurrency(t.value)}
                                </td>
                                <td className="p-3 text-right">
                                    {!t.booking_id && (
                                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleOpenEditModal(t)} className="text-gray-400 hover:text-white text-xs" title="Editar"><i className="fas fa-edit"></i></button>
                                            <button onClick={() => handleDeleteTransaction(t)} className="text-gray-400 hover:text-red-400 text-xs" title="Excluir"><i className="fas fa-trash"></i></button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {transactions.length === 0 && <p className="p-4 text-center text-gray-400">Nenhum lançamento financeiro registrado.</p>}
            </div>
        </div>
        <PlatformTransactionModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSave={handleSaveTransaction}
            type={modalType}
            transactionToEdit={editingTransaction || undefined}
        />
        </>
    );
};

export default AdminFinancesPage;