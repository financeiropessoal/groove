import React, { useState, useMemo, useEffect } from 'react';
import { CostItem } from '../data';
import { AdminService } from '../services/AdminService';

interface PriceCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (data: { price: number; costs: CostItem[] }) => void;
  initialCosts?: CostItem[];
  isArtistPro: boolean;
}

interface CostSectionProps {
    title: string;
    items: CostItem[];
    onItemChange: (id: number, field: 'description' | 'value', value: string | number) => void;
    onAddItem: () => void;
    onRemoveItem: (id: number) => void;
}

const CostSection: React.FC<CostSectionProps> = ({ title, items, onItemChange, onAddItem, onRemoveItem }) => (
    <div className="bg-gray-900/50 p-4 rounded-lg">
        <h3 className="font-semibold text-white mb-3">{title}</h3>
        <p className="text-sm text-gray-400 mb-4">Liste todos os valores necessários para realizar o show, incluindo seu próprio cachê, pagamento de músicos, transporte, etc. Este será o valor final cobrado do contratante.</p>
        <div className="space-y-2">
            {items.map((item, index) => (
                <div key={item.id} className="flex items-center gap-2">
                    <input 
                        type="text" 
                        value={item.description}
                        onChange={(e) => onItemChange(item.id, 'description', e.target.value)}
                        placeholder={index === 0 ? "Ex: Meu cachê" : "Descrição do custo"}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    />
                    <div className="relative w-1/3">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                            R$
                        </span>
                        <input 
                            type="number" 
                            value={item.value === 0 ? '' : item.value}
                            onChange={(e) => onItemChange(item.id, 'value', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            min="0"
                            className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 pr-3 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                        />
                    </div>
                    <button 
                        type="button" 
                        onClick={() => onRemoveItem(item.id)} 
                        className="text-gray-500 hover:text-red-500 p-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={items.length <= 1}
                        aria-label="Remover custo"
                    >
                        <i className="fas fa-minus-circle"></i>
                    </button>
                </div>
            ))}
        </div>
        <button type="button" onClick={onAddItem} className="mt-3 text-sm text-red-400 hover:text-red-300 transition-colors"><i className="fas fa-plus mr-2"></i>Adicionar custo</button>
    </div>
);

const PriceCalculatorModal: React.FC<PriceCalculatorModalProps> = ({ isOpen, onClose, onApply, initialCosts, isArtistPro }) => {
  const [costs, setCosts] = useState<CostItem[]>([{ id: Date.now(), description: 'Meu cachê', value: 0, status: 'pending' }]);
  const [settings, setSettings] = useState({
    commission: { standard: 0.10, pro: 0.05 },
    paymentGateway: { transactionPercent: 0.0499, payoutFixed: 3.67 }
  });

  useEffect(() => {
    if (isOpen) {
      const costsSource = initialCosts && initialCosts.length > 0
        ? initialCosts
        : [{ id: Date.now(), description: 'Meu cachê', value: 0, status: 'pending' }];

      const validCosts = costsSource.map((c): CostItem => ({
        ...c,
        status: c.status === 'paid' ? 'paid' : 'pending',
      }));

      setCosts(validCosts);
      
      const fetchSettings = async () => {
        const platformSettings = await AdminService.getPlatformSettings();
        setSettings(platformSettings);
      };
      fetchSettings();
    }
  }, [isOpen, initialCosts]);

  const handleCostChange = (id: number, field: 'description' | 'value', newValue: string | number) => {
    setCosts(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, [field]: newValue } : item
      )
    );
  };

  const addCostItem = () => {
    setCosts(prev => [...prev, { id: Date.now(), description: '', value: 0, status: 'pending' }]);
  };

  const removeCostItem = (id: number) => {
    if (costs.length > 1) {
        setCosts(prev => prev.filter(item => item.id !== id));
    }
  };
  
  const calculations = useMemo(() => {
    const commissionRate = isArtistPro ? settings.commission.pro : settings.commission.standard;
    const totalCosts = costs.reduce((sum, item) => sum + Number(item.value || 0), 0);
    
    if (totalCosts === 0) {
      return { finalPrice: 0, commissionAmount: 0, artistReceivesGross: 0, payoutFee: 0, artistReceivesNet: 0, commissionRate };
    }
    
    const finalPrice = totalCosts;
    const commissionAmount = finalPrice * commissionRate;
    const artistReceivesGross = finalPrice - commissionAmount;
    const payoutFee = settings.paymentGateway.payoutFixed;
    const artistReceivesNet = artistReceivesGross - payoutFee;

    return { finalPrice, commissionAmount, artistReceivesGross, payoutFee, artistReceivesNet, commissionRate };
  }, [costs, settings, isArtistPro]);

  const isApplyDisabled = useMemo(() => {
    if (costs.length === 0) return true;
    const hasInvalidCost = costs.some(c => !c.description.trim() || !c.value || c.value <= 0);
    return hasInvalidCost;
  }, [costs]);


  const handleApply = () => {
    onApply({
        price: Math.round(calculations.finalPrice),
        costs: costs
    });
  };

  if (!isOpen) {
    return null;
  }
  
  const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`;

  return (
    <>
    <div
      className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-gray-800 w-full max-w-2xl max-h-[90vh] rounded-lg shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-shrink-0 px-6 py-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white"><i className="fas fa-calculator mr-3 text-red-500"></i>Calculadora de Preço de Show</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl" aria-label="Fechar">&times;</button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 space-y-6">
            <CostSection 
              title="Custos do Show" 
              items={costs} 
              onItemChange={handleCostChange}
              onAddItem={addCostItem}
              onRemoveItem={removeCostItem}
            />
            
            <div className="bg-gray-700 p-6 rounded-lg space-y-3 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-300">Preço Final (cobrado do contratante):</span>
                    <span className="font-semibold text-white">{formatCurrency(calculations.finalPrice)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-300">(-) Comissão do App ({isArtistPro ? 'PRO - ' : ''}{(calculations.commissionRate * 100).toFixed(1).replace('.',',')}%):</span>
                    <span className="font-semibold text-white">{formatCurrency(calculations.commissionAmount)}</span>
                </div>
                 <div className="flex justify-between border-t border-gray-600 pt-3 mt-3">
                    <span className="text-gray-300">(=) Valor Bruto a Receber:</span>
                    <span className="font-semibold text-white">{formatCurrency(calculations.artistReceivesGross)}</span>
                </div>
                 <div className="flex justify-between">
                    <span className="text-gray-300">(-) Taxa de Repasse (Saque Fixo):</span>
                    <span className="font-semibold text-white">{formatCurrency(calculations.payoutFee)}</span>
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t-2 border-pink-500">
                    <strong className="text-lg text-white">Valor líquido estimado para você:</strong>
                    <strong className="text-2xl text-green-400">{formatCurrency(calculations.artistReceivesNet)}</strong>
                </div>
                 <p className="text-xs text-gray-400 mt-2 text-center">Este é o valor estimado que você receberá na sua conta após todas as taxas.</p>
            </div>
        </div>

        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-700 flex justify-end gap-4">
            <button onClick={onClose} className="px-6 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-500 transition-colors">Cancelar</button>
            <button
                onClick={handleApply}
                disabled={isApplyDisabled}
                className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
                Usar este Preço
            </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default PriceCalculatorModal;
