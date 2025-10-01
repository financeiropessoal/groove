import React, { useState, useEffect } from 'react';
import { AdminService } from '../../services/AdminService';
import { useToast } from '../../contexts/ToastContext';

const AdminSettingsPage: React.FC = () => {
    const [commissionRate, setCommissionRate] = useState<number | ''>('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        const fetchRate = async () => {
            setIsLoading(true);
            const rate = await AdminService.getCommissionRate();
            setCommissionRate(rate * 100); // Convert from 0.10 to 10 for display
            setIsLoading(false);
        };
        fetchRate();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (commissionRate === '' || commissionRate < 0 || commissionRate > 100) {
            showToast('Por favor, insira um valor válido entre 0 e 100.', 'error');
            return;
        }

        setIsSaving(true);
        const success = await AdminService.updateCommissionRate(commissionRate);
        if (success) {
            showToast('Taxa de comissão atualizada com sucesso!', 'success');
        } else {
            showToast('Erro ao salvar a configuração. Tente novamente.', 'error');
        }
        setIsSaving(false);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <i className="fas fa-spinner fa-spin text-4xl text-red-500"></i>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-2xl">
            <h1 className="text-3xl font-bold">Configurações da Plataforma</h1>

            <form onSubmit={handleSave} className="bg-gray-800 p-8 rounded-lg">
                <h2 className="text-xl font-bold text-white mb-4">Financeiro</h2>
                <div className="space-y-2">
                    <label htmlFor="commissionRate" className="block text-sm font-medium text-gray-300">
                        Taxa de Comissão da Plataforma (%)
                    </label>
                    <div className="flex items-center gap-4">
                        <div className="relative flex-grow">
                            <input
                                id="commissionRate"
                                type="number"
                                value={commissionRate}
                                onChange={(e) => setCommissionRate(e.target.value === '' ? '' : parseFloat(e.target.value))}
                                min="0"
                                max="100"
                                step="0.1"
                                className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <span className="text-gray-400">%</span>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-500 disabled:cursor-wait flex items-center gap-2"
                        >
                            {isSaving ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i>
                                    <span>Salvando...</span>
                                </>
                            ) : (
                                'Salvar'
                            )}
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        Esta é a porcentagem cobrada sobre o valor final de cada show contratado através da plataforma.
                    </p>
                </div>

                {/* Future settings can be added here */}
            </form>
        </div>
    );
};

export default AdminSettingsPage;