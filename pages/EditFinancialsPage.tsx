import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FinancialService } from '../services/FinancialService';
import { PersonalTransaction } from '../data';
import { useToast } from '../contexts/ToastContext';
import PersonalTransactionModal from '../components/PersonalTransactionModal';

const EditFinancialsPage: React.FC = () => {
    const { artist } = useAuth();
    const [transactions, setTransactions] = useState<PersonalTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { showToast } = useToast();

    // State for modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<PersonalTransaction | null>(null);

    const fetchTransactions = () => {
        if (artist) {
            setIsLoading(true);
            FinancialService.getTransactions(artist.id).then(data => {
                setTransactions(data);
                setIsLoading(false);
            });
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [artist]);
    
    const handleSave = () => {
        fetchTransactions(); // Refetch data after saving
        setIsModalOpen(false);
        setEditingTransaction(null);
    };

    const openModal = (transaction: PersonalTransaction | null = null) => {
        setEditingTransaction(transaction);
        setIsModalOpen(true);
    };

    const summary = useMemo(() => {
        const income = transactions.filter(t => t.type === 'income' && t.status === 'paid').reduce((sum, t) => sum + t.value, 0);
        const expense = transactions.filter(t => t.type === 'expense' && t.status === 'paid').reduce((sum, t) => sum + t.value, 0);
        const pendingIncome = transactions.filter(t => t.type === 'income' && t.status === 'pending').reduce((sum, t) => sum + t.value, 0);
        return {
            balance: income - expense,
            income,
            expense,
            pendingIncome
        };
    }, [transactions]);

    if (isLoading) {
        return <div className="text-center py-12"><i className="fas fa-spinner fa-spin text-4xl text-pink-500"></i></div>;
    }

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                <div className="flex items-center gap-4">
                    <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors" aria-label="Voltar ao painel">
                        <i className="fas fa-arrow-left text-2xl"></i>
                    </Link>
                    <h1 className="text-3xl font-bold">Minhas Finanças</h1>
                </div>
                <button onClick={() => openModal()} className="bg-pink-600 font-bold py-2 px-4 rounded-lg w-full md:w-auto hover:bg-pink-700 transition-colors">
                    Adicionar Transação
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-800 p-6 rounded-lg">
                    <h3 className="text-gray-400 text-sm">Saldo Atual</h3>
                    <p className="text-3xl font-bold text-green-400">R$ {summary.balance.toFixed(2)}</p>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg">
                    <h3 className="text-gray-400 text-sm">Receitas (Realizadas)</h3>
                    <p className="text-3xl font-bold text-white">R$ {summary.income.toFixed(2)}</p>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg">
                    <h3 className="text-gray-400 text-sm">A Receber</h3>
                    <p className="text-3xl font-bold text-yellow-400">R$ {summary.pendingIncome.toFixed(2)}</p>
                </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-4">Histórico de Transações</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3">Data</th>
                                <th scope="col" className="px-6 py-3">Descrição</th>
                                <th scope="col" className="px-6 py-3">Tipo</th>
                                <th scope="col" className="px-6 py-3">Valor</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map(t => (
                                <tr key={t.id} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700/50 cursor-pointer" onClick={() => openModal(t)}>
                                    <td className="px-6 py-4">{new Date(t.date + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                                    <td className="px-6 py-4">{t.description}</td>
                                    <td className={`px-6 py-4 font-semibold ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>{t.type === 'income' ? 'Receita' : 'Despesa'}</td>
                                    <td className="px-6 py-4">R$ {t.value.toFixed(2)}</td>
                                    <td className="px-6 py-4">{t.status === 'paid' ? 'Realizado' : 'Pendente'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

             {isModalOpen && (
                 <PersonalTransactionModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    transaction={editingTransaction}
                />
            )}
        </div>
    );
};

export default EditFinancialsPage;