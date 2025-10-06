import React from 'react';
import { Plan } from '../data';

interface PlanCardProps {
    plan: Plan;
    isSelected: boolean;
    onSelect: () => void;
    isVenueAuthenticated: boolean;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, isSelected, onSelect, isVenueAuthenticated }) => {
    return (
        <div 
            className={`bg-gray-900 rounded-lg overflow-hidden shadow-lg border-2 transition-all duration-300 cursor-pointer ${isSelected ? 'border-pink-500 scale-102' : 'border-gray-700 hover:border-pink-600'}`}
            onClick={onSelect}
        >
            <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-start">
                    <div>
                        <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                        <p className="text-gray-400 mt-1 max-w-lg">{plan.description}</p>
                    </div>
                    <div className="text-left sm:text-right mt-4 sm:mt-0 sm:ml-4 flex-shrink-0">
                        {isVenueAuthenticated ? (
                            <p className="text-2xl font-bold text-pink-400">R$ {plan.price.toFixed(2).replace('.',',')}</p>
                        ) : (
                            <p className="text-2xl font-bold text-pink-400">R$ *****</p>
                        )}
                    </div>
                </div>
            </div>
            {isSelected && (
                <div className="bg-gray-800 p-6 border-t-2 border-pink-500 animate-fade-in">
                    <h4 className="font-semibold text-white mb-3">O que está incluso:</h4>
                    <ul className="space-y-2">
                        {plan.includes.map((item, index) => (
                            <li key={index} className="flex items-center text-gray-300">
                                <i className="fas fa-check-circle text-pink-500 mr-3"></i>
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