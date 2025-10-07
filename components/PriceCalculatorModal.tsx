
import React, { useState, useMemo } from 'react';
import Modal from './Modal';

interface CostItem {
  id: number;
  label: string;
  value: number;
}

const PriceCalculatorModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [baseCache, setBaseCache] = useState(300);
  const [costs, setCosts] = useState<CostItem[]>([
    { id: 1, label: 'Transporte', value: 50 },
    { id: 2, label: 'Alimentação', value: 40 },
  ]);
  const [profitMargin, setProfitMargin] = useState(30);

  const totalCosts = useMemo(() => costs.reduce((sum, item) => sum + item.value, 0), [costs]);
  const finalPrice = useMemo(() => {
    const priceWithCosts = baseCache + totalCosts;
    return priceWithCosts / (1 - profitMargin / 100);
  }, [baseCache, totalCosts, profitMargin]);

  const addCost = () => {
    setCosts([...costs, { id: Date.now(), label: '', value: 0 }]);
  };

  const updateCost = (id: number, field: 'label' | 'value', value: string | number) => {
    setCosts(costs.map(c => c.id === id ? { ...c, [field]: value } : c));
  };
  
  const removeCost = (id: number) => {
      setCosts(costs.filter(c => c.id !== id));
  }

  return (
    <Modal onClose={onClose}>
      <div className="bg-gray-800 p-8 rounded-lg text-white max-w-2xl w-full">
        <h2 className="text-2xl font-bold mb-6">Calculadora de Cachê</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Inputs */}
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-300">Cachê Base (seu trabalho)</label>
                    <input type="number" value={baseCache} onChange={e => setBaseCache(Number(e.target.value))} className="w-full bg-gray-900 p-2 rounded mt-1" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-2">Custos Operacionais</h3>
                    <div className="space-y-2">
                        {costs.map(cost => (
                            <div key={cost.id} className="flex gap-2">
                                <input type="text" placeholder="Descrição (ex: Gasolina)" value={cost.label} onChange={e => updateCost(cost.id, 'label', e.target.value)} className="w-2/3 bg-gray-900 p-2 rounded" />
                                <input type="number" placeholder="Valor" value={cost.value || ''} onChange={e => updateCost(cost.id, 'value', Number(e.target.value))} className="w-1/3 bg-gray-900 p-2 rounded" />
                                <button onClick={() => removeCost(cost.id)} className="text-gray-500 hover:text-red-500"><i className="fas fa-times"></i></button>
                            </div>
                        ))}
                    </div>
                    <button onClick={addCost} className="text-sm text-pink-400 mt-2">+ Adicionar Custo</button>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300">Margem de Lucro / Impostos (%)</label>
                    <input type="number" value={profitMargin} onChange={e => setProfitMargin(Number(e.target.value))} className="w-full bg-gray-900 p-2 rounded mt-1" />
                </div>
            </div>
            {/* Results */}
            <div className="bg-gray-900/50 p-6 rounded-lg flex flex-col justify-center items-center">
                 <h3 className="text-lg font-semibold text-gray-400">Preço Sugerido</h3>
                 <p className="text-5xl font-bold text-green-400 my-4">R$ {finalPrice.toFixed(2)}</p>
                 <div className="text-sm text-gray-300 w-full">
                     <div className="flex justify-between py-1 border-b border-gray-700"><span>Cachê Base:</span> <span>R$ {baseCache.toFixed(2)}</span></div>
                     <div className="flex justify-between py-1 border-b border-gray-700"><span>Custos Totais:</span> <span>R$ {totalCosts.toFixed(2)}</span></div>
                     <div className="flex justify-between py-1"><span>Margem ({profitMargin}%):</span> <span>R$ {(finalPrice - (baseCache + totalCosts)).toFixed(2)}</span></div>
                 </div>
            </div>
        </div>
      </div>
    </Modal>
  );
};

export default PriceCalculatorModal;
