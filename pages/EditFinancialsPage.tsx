import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { BookingService, EnrichedBooking } from '../services/BookingService';
import { FinancialService } from '../services/FinancialService';
import { PersonalTransaction } from '../data';
import EmptyState from '../components/EmptyState';
import { useToast } from '../contexts/ToastContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`;

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (transaction: Omit<PersonalTransaction, 'id'>, id?: number) => void;
    type: 'income' | 'expense';
    transactionToEdit?: PersonalTransaction | null;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onSave, type, transactionToEdit }) => {
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [value, setValue] = useState<number | ''>('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const isEditing = !!transactionToEdit;

    useEffect(() => {
        if (isOpen) {
            if (transactionToEdit) {
                setDescription(transactionToEdit.description);
                setCategory(transactionToEdit.category);
                setValue(transactionToEdit.value);
                setDate(transactionToEdit.date);
            } else {
                setDescription('');
                setCategory(type === 'expense' ? 'Transporte' : 'Outros');
                setValue('');
                setDate(new Date().toISOString().split('T')[0]);
            }
        }
    }, [isOpen, transactionToEdit, type]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (description && value) {
            onSave({
                type: transactionToEdit ? transactionToEdit.type : type,
                description,
                category,
                value: Number(value),
                status: transactionToEdit ? transactionToEdit.status : 'pending',
                date,
            }, transactionToEdit?.id);
        }
    };
    
    const expenseCategories = ['Transporte', 'Alimentação', 'Equipamento', 'Marketing', 'Músicos', 'Outros'];
    const incomeCategories = ['Cachê Particular', 'Direitos Autorais', 'Venda de Merch', 'Aulas', 'Outros'];
    const currentCategories = (isEditing ? transactionToEdit.type : type) === 'expense' ? expenseCategories : incomeCategories;

    return (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-gray-800 w-full max-w-lg rounded-lg shadow-2xl" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h3 className="text-xl font-bold text-white mb-4">{isEditing ? 'Editar' : 'Adicionar'} {transactionToEdit?.type === 'income' || type === 'income' ? 'Receita' : 'Despesa'}</h3>
                        <div className="space-y-4">
                            <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Descrição" required className="w-full bg-gray-900 border border-gray-700 rounded p-2" />
                            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-2">
                                {currentCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                            <input type="number" value={value} onChange={e => setValue(e.target.value ? parseFloat(e.target.value) : '')} placeholder="Valor (R$)" required min="0.01" step="0.01" className="w-full bg-gray-900 border border-gray-700 rounded p-2" />
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full bg-gray-900 border border-gray-700 rounded p-2" />
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


const EditFinancialsPage: React.FC = () => {
    const { artist } = useAuth();
    const { showToast } = useToast();

    const [bookings, setBookings] = useState<EnrichedBooking[]>([]);
    const [transactions, setTransactions] = useState<PersonalTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'income' | 'expense'>('expense');
    const [editingTransaction, setEditingTransaction] = useState<PersonalTransaction | null>(null);

    const fetchData = async () => {
        if (artist) {
            setIsLoading(true);
            const [fetchedBookings, fetchedTransactions] = await Promise.all([
                BookingService.getEnrichedBookingsForArtist(artist.id),
                FinancialService.getTransactions(artist.id)
            ]);
            setBookings(fetchedBookings);
            setTransactions(fetchedTransactions);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [artist]);
    
    const { income, expenses, balance, chartData } = useMemo(() => {
        const platformIncome = bookings.filter(b => b.payoutStatus === 'paid').reduce((sum, b) => sum + b.planPrice, 0);
        const externalIncome = transactions.filter(t => t.type === 'income' && t.status === 'paid').reduce((sum, t) => sum + t.value, 0);
        const totalIncome = platformIncome + externalIncome;
        const totalExpenses = transactions.filter(t => t.type === 'expense' && t.status === 'paid').reduce((sum, t) => sum + t.value, 0);
        
        const monthlyData: { [key: string]: { income: number, expense: number } } = {};
        const processDate = (dateStr: string) => new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
        
        bookings.forEach(b => {
            const month = processDate(b.date);
            if (!monthlyData[month]) monthlyData[month] = { income: 0, expense: 0 };
            monthlyData[month].income += b.planPrice;
        });
        transactions.forEach(t => {
            const month = processDate(t.date);
            if (!monthlyData[month]) monthlyData[month] = { income: 0, expense: 0 };
            if (t.type === 'income') monthlyData[month].income += t.value;
            else monthlyData[month].expense += t.value;
        });

        const monthMap: { [key: string]: number } = {
            'jan': 0, 'fev': 1, 'mar': 2, 'abr': 3, 'mai': 4, 'jun': 5, 'jul': 6, 'ago': 7, 'set': 8, 'out': 9, 'nov': 10, 'dez': 11
        };

        const parseMonthYear = (myStr: string): Date => {
            const [monthStr, yearStr] = myStr.split('/');
            const cleanMonthStr = monthStr.replace('.', '').toLowerCase();
            const monthIndex = monthMap[cleanMonthStr];
            const year = parseInt(yearStr, 10) + 2000;
            return new Date(year, monthIndex);
        };

        const finalChartData = Object.entries(monthlyData)
            .map(([name, values]) => ({ name, ...values }))
            .sort((a,b) => parseMonthYear(a.name).getTime() - parseMonthYear(b.name).getTime());


        return { income: totalIncome, expenses: totalExpenses, balance: totalIncome - totalExpenses, chartData: finalChartData };
    }, [bookings, transactions]);

    const handleOpenAddModal = (type: 'income' | 'expense') => {
        setEditingTransaction(null);
        setModalType(type);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (transaction: PersonalTransaction) => {
        setModalType(transaction.type);
        setEditingTransaction(transaction);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTransaction(null);
    };

    const handleSaveTransaction = async (transactionData: Omit<PersonalTransaction, 'id'>, id?: number) => {
        if (!artist) return;

        if (id) {
            const updated = await FinancialService.updateTransaction(id, transactionData);
            if (updated) {
                showToast('Transação atualizada!', 'success');
                setTransactions(prev => prev.map(t => t.id === id ? updated : t).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            } else {
                showToast('Erro ao atualizar transação.', 'error');
            }
        } else {
            const newTransaction = await FinancialService.addTransaction(artist.id, transactionData);
            if (newTransaction) {
                showToast('Transação adicionada!', 'success');
                setTransactions(prev => [newTransaction, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            } else {
                showToast('Erro ao adicionar transação.', 'error');
            }
        }
        handleCloseModal();
    };

    const handleDeleteTransaction = async (id: number) => {
        if(window.confirm("Tem certeza que deseja apagar esta transação?")) {
            const success = await FinancialService.deleteTransaction(id);
            if(success) {
                showToast('Transação removida.', 'success');
                setTransactions(prev => prev.filter(t => t.id !== id));
            } else {
                showToast('Erro ao remover transação.', 'error');
            }
        }
    }

    const handleUpdateStatus = async (id: number, status: 'paid' | 'pending') => {
        const newStatus = status === 'pending' ? 'paid' : 'pending';
        const success = await FinancialService.updateTransactionStatus(id, newStatus);
        if(success) {
            showToast('Status atualizado!', 'success');
            setTransactions(prev => prev.map(t => t.id === id ? {...t, status: newStatus} : t));
        } else {
            showToast('Erro ao atualizar status.', 'error');
        }
    }

    const TableRow: React.FC<{
        t: PersonalTransaction | (EnrichedBooking & { type: 'platform_income' });
        isExpense: boolean;
        onEdit: (transaction: PersonalTransaction) => void;
    }> = ({ t, isExpense, onEdit }) => (
        <tr className="border-b border-gray-700 hover:bg-gray-700/50 group">
            <td className="p-3">
                <p className="font-medium text-white">{'description' in t ? t.description : `Show: ${t.venueName}`}</p>
                <p className="text-xs text-gray-400">{'category' in t ? t.category : 'Plataforma'}</p>
            </td>
            <td className="p-3">{new Date(t.date + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
            <td className={`p-3 font-semibold ${isExpense ? 'text-red-400' : 'text-green-400'}`}>{isExpense ? '-' : '+'} {formatCurrency('value' in t ? t.value : t.planPrice)}</td>
            <td className="p-3">
                {'id' in t && t.type !== 'platform_income' ? (
                    <button onClick={() => handleUpdateStatus(t.id, t.status)} className={`px-2 py-1 text-xs rounded-full transition-opacity hover:opacity-80 ${t.status === 'paid' ? 'bg-green-800 text-green-200' : 'bg-yellow-800 text-yellow-200'}`}>
                        {t.status === 'paid' ? (isExpense ? 'Pago' : 'Recebido') : 'Pendente'}
                        <i className="fas fa-sync-alt ml-2 text-xs opacity-0 group-hover:opacity-70 transition-opacity"></i>
                    </button>
                ) : (
                     <span className={`px-2 py-1 text-xs rounded-full ${t.status === 'paid' ? 'bg-green-800 text-green-200' : 'bg-yellow-800 text-yellow-200'}`}>
                        {t.status === 'paid' ? 'Recebido' : 'Pendente'}
                    </span>
                )}
            </td>
            <td className="p-3 text-right">
                {'id' in t && t.type !== 'platform_income' && (
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => onEdit(t)} className="text-gray-400 hover:text-white text-xs" title="Editar"><i className="fas fa-edit"></i></button>
                         <button onClick={() => handleDeleteTransaction(t.id)} className="text-gray-400 hover:text-red-400 text-xs" title="Excluir"><i className="fas fa-trash"></i></button>
                    </div>
                )}
            </td>
        </tr>
    );

    if (isLoading || !artist) {
         return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><i className="fas fa-spinner fa-spin text-4xl text-red-500"></i></div>;
    }
    
    const combinedTransactions = useMemo(() => {
        const platformIncomes = bookings.map(b => ({ ...b, type: 'platform_income', status: b.payoutStatus as 'paid' | 'pending' }));
        return [...platformIncomes, ...transactions].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [bookings, transactions]);

    return (
        <>
        <div className="min-h-screen bg-gray-900 text-white">
             <header className="bg-gray-800 shadow-md">
                 <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                         <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-700"><i className="fas fa-arrow-left"></i></Link>
                        <h1 className="text-xl font-bold tracking-wider">Gestão Financeira</h1>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                 <div className="max-w-5xl mx-auto">
                    <section className="mb-8 p-6 bg-gray-800/50 rounded-lg">
                        <h2 className="text-2xl font-bold text-white mb-4">Balanço (Valores Recebidos/Pagos)</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                            <div className="bg-green-900/50 p-4 rounded-lg"><p className="text-sm text-green-300">Receita Total</p><p className="text-2xl font-bold">{formatCurrency(income)}</p></div>
                            <div className="bg-red-900/50 p-4 rounded-lg"><p className="text-sm text-red-300">Despesa Total</p><p className="text-2xl font-bold">{formatCurrency(expenses)}</p></div>
                            <div className="bg-blue-900/50 p-4 rounded-lg"><p className="text-sm text-blue-300">Saldo Líquido</p><p className="text-2xl font-bold">{formatCurrency(balance)}</p></div>
                        </div>
                    </section>
                    
                    <section className="mb-8 p-6 bg-gray-800/50 rounded-lg">
                         <h2 className="text-xl font-bold text-white mb-4">Performance Mensal</h2>
                         <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                                    <XAxis dataKey="name" stroke="#a0aec0" fontSize={12} />
                                    <YAxis stroke="#a0aec0" fontSize={12} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1a202c', border: '1px solid #4a5568' }} />
                                    <Legend wrapperStyle={{ fontSize: '14px' }} />
                                    <Bar dataKey="income" name="Receita" fill="#48bb78" />
                                    <Bar dataKey="expense" name="Despesa" fill="#e53e3e" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </section>
                    
                    <section className="mb-8">
                        <div className="flex justify-between items-center mb-4">
                             <h2 className="text-2xl font-bold text-white">Extrato Geral</h2>
                             <div className="flex gap-3">
                                <button onClick={() => handleOpenAddModal('expense')} className="px-4 py-2 bg-red-600 text-sm font-semibold rounded-lg hover:bg-red-700">- Despesa</button>
                                <button onClick={() => handleOpenAddModal('income')} className="px-4 py-2 bg-green-600 text-sm font-semibold rounded-lg hover:bg-green-700">+ Receita</button>
                             </div>
                        </div>
                        <div className="bg-gray-800/50 rounded-lg overflow-hidden">
                             <table className="w-full text-sm">
                                <thead className="bg-gray-800 text-left"><tr><th className="p-3">Descrição</th><th className="p-3">Data</th><th className="p-3">Valor</th><th className="p-3">Status</th><th className="p-3"></th></tr></thead>
                                <tbody>
                                    {combinedTransactions.map(t => (
                                        <TableRow 
                                            key={`${'type' in t ? t.type : 'booking'}-${t.id}`} 
                                            t={t as any} 
                                            isExpense={'type' in t && t.type === 'expense'} 
                                            onEdit={handleOpenEditModal}
                                        />
                                    ))}
                                </tbody>
                            </table>
                             {combinedTransactions.length === 0 && <p className="p-4 text-center text-gray-400">Nenhuma transação registrada.</p>}
                        </div>
                    </section>
                </div>
            </main>
        </div>
        <TransactionModal 
            isOpen={isModalOpen} 
            onClose={handleCloseModal} 
            onSave={handleSaveTransaction} 
            type={modalType}
            transactionToEdit={editingTransaction}
        />
        </>
    );
};

export default EditFinancialsPage;