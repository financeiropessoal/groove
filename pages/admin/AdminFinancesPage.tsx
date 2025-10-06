import React, { useState, useEffect, useMemo } from 'react';
import { AdminService } from '../../services/AdminService';
import { PlatformTransaction } from '../../types';
import PlatformTransactionModal from '../../components/admin/PlatformTransactionModal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StatCard: React.FC<{ title: string; value: string; color: string; }> = ({ title, value, color }) => (
    <div className="bg-gray-800 p-6 rounded-lg">
        <p className="text-gray-400 text-sm font-medium">{title}</p>
        <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
);

const AdminFinancesPage: React.FC = () => {
    const [transactions, setTransactions] = useState<PlatformTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<PlatformTransaction | null>(null);
    
    // Date filter state
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(firstDayOfMonth);
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = () => {
        setIsLoading(true);
        AdminService.getPlatformFinances().then(data => {
            setTransactions(data);
            setIsLoading(false);
        });
    };
    
    const filteredTransactions = useMemo(() => {
        if (!startDate || !endDate) return transactions;
        const start = new Date(`${startDate}T00:00:00`);
        const end = new Date(`${endDate}T23:59:59`);
        return transactions.filter(t => {
            const transactionDate = new Date(t.due_date || t.created_at);
            return transactionDate >= start && transactionDate <= end;
        });
    }, [transactions, startDate, endDate]);

    const summary = useMemo(() => {
        const income = filteredTransactions.filter(t => t.type === 'income' && t.status === 'paid').reduce((sum, t) => sum + t.value, 0);
        const expense = filteredTransactions.filter(t => t.type === 'expense' && t.status === 'paid').reduce((sum, t) => sum + t.value, 0);
        const netProfit = income - expense;
        return { income, expense, netProfit };
    }, [filteredTransactions]);

    const chartData = useMemo(() => {
        const monthlyData: { [key: string]: { name: string; Receita: number; Despesa: number } } = {};
        
        filteredTransactions.forEach(t => {
            if (t.status !== 'paid') return;
            const date = new Date(t.due_date || t.created_at);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthName = date.toLocaleString('pt-BR', { month: 'short', year: '2-digit' });
            
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { name: monthName, Receita: 0, Despesa: 0 };
            }

            if (t.type === 'income') {
                monthlyData[monthKey].Receita += t.value;
            } else {
                monthlyData[monthKey].Despesa += t.value;
            }
        });

        return Object.values(monthlyData).sort((a, b) => a.name.localeCompare(b.name));
    }, [filteredTransactions]);

    const handleSave = () => {
        fetchTransactions();
        setIsModalOpen(false);
        setEditingTransaction(null);
    };
    
    const openModal = (transaction: PlatformTransaction | null = null) => {
        setEditingTransaction(transaction);
        setIsModalOpen(true);
    }
    
    const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`;

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold">Finanças da Plataforma</h1>
                <button onClick={() => openModal()} className="bg-pink-600 font-bold py-2 px-4 rounded-lg w-full md:w-auto">
                    Adicionar Transação
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard title="Receita Total (pago)" value={formatCurrency(summary.income)} color="text-green-400" />
                <StatCard title="Despesas Totais (pago)" value={formatCurrency(summary.expense)} color="text-red-400" />
                <StatCard title="Lucro Líquido" value={formatCurrency(summary.netProfit)} color={summary.netProfit >= 0 ? "text-white" : "text-red-400"} />
            </div>

             <div className="bg-gray-800 p-6 rounded-lg mb-8">
                <h2 className="text-xl font-bold mb-4">Análise Mensal</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                        <XAxis dataKey="name" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" tickFormatter={(value) => `R$${value}`} />
                        <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563' }} formatter={(value: number) => formatCurrency(value)} />
                        <Legend />
                        <Bar dataKey="Receita" fill="#34D399" />
                        <Bar dataKey="Despesa" fill="#F87171" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            
             <div className="bg-gray-800 rounded-lg overflow-hidden">
                <div className="p-4 flex flex-col sm:flex-row gap-4 items-center">
                    <h3 className="text-lg font-semibold">Transações</h3>
                    <div className="flex-grow flex items-center gap-2">
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-gray-900 border border-gray-700 rounded-md py-1 px-2 text-sm" />
                        <span>até</span>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-gray-900 border border-gray-700 rounded-md py-1 px-2 text-sm" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="p-3 text-left">Data</th>
                                <th className="p-3 text-left">Descrição</th>
                                <th className="p-3 text-left">Tipo</th>
                                <th className="p-3 text-left">Categoria</th>
                                <th className="p-3 text-right">Valor</th>
                                <th className="p-3 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.map(t => (
                                <tr key={t.id} className="border-b border-gray-700 hover:bg-gray-700/50 cursor-pointer" onClick={() => openModal(t)}>
                                    <td className="p-3 whitespace-nowrap">{new Date(t.due_date || t.created_at).toLocaleDateString('pt-BR')}</td>
                                    <td className="p-3">{t.description}</td>
                                    <td className={`p-3 font-semibold ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>{t.type === 'income' ? 'Receita' : 'Despesa'}</td>
                                    <td className="p-3">{t.category}</td>
                                    <td className={`p-3 text-right font-mono ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(t.value)}</td>
                                    <td className="p-3 text-center">
                                        <span className={`px-2 py-0.5 text-xs rounded-full ${t.status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                            {t.status === 'paid' ? 'Pago' : 'Pendente'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <PlatformTransactionModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    transaction={editingTransaction}
                />
            )}
        </div>
    );
};

export default AdminFinancesPage;