
import React from 'react';
import { Plan } from '../types';

interface PlanCardProps {
  plan: Plan;
  isSelected?: boolean;
  onSelect?: () => void;
  isSelectable?: boolean;
  isVenueAuthenticated?: boolean;
  contractorType?: 'company' | 'individual';
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, isSelected, onSelect, isSelectable = true, isVenueAuthenticated, contractorType }) => {
    
    const price = isVenueAuthenticated && contractorType === 'individual' 
        ? plan.priceIndividual 
        : plan.priceCompany;

    const baseClasses = "bg-gray-900/50 p-4 rounded-lg border-2 transition-colors";
    const selectedClasses = "border-pink-500 ring-2 ring-pink-500/50";
    const unselectedClasses = "border-gray-700";
    const selectableClasses = "cursor-pointer hover:border-pink-400";

    return (
        <div 
            className={`${baseClasses} ${isSelected ? selectedClasses : unselectedClasses} ${isSelectable && onSelect ? selectableClasses : ''}`}
            onClick={isSelectable ? onSelect : undefined}
        >
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-bold text-white">{plan.name}</h4>
                    <p className="text-sm text-gray-400">{plan.description}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                     <p className="font-bold text-lg text-green-400">R$ {price.toFixed(2).replace('.', ',')}</p>
                     {isVenueAuthenticated && contractorType && (
                         <p className="text-xs text-gray-500">
                            {contractorType === 'individual' ? 'P. Física' : 'P. Jurídica'}
                         </p>
                     )}
                </div>
            </div>
            {plan.includes && plan.includes.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-700/50">
                    <ul className="text-xs text-gray-300 space-y-1">
                        {plan.includes.map((item, i) => (
                            <li key={i} className="flex items-center gap-2">
                                <i className="fas fa-check-circle text-green-500"></i>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default PlanCard;
