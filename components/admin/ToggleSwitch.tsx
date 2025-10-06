import React from 'react';

interface ToggleSwitchProps {
    checked: boolean;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    label?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, label }) => {
    const id = React.useId();
    return (
        <label htmlFor={id} className="flex items-center cursor-pointer justify-center">
            {label && <span className="mr-3 text-sm font-medium text-gray-300">{label}</span>}
            <div className="relative">
                <input 
                    type="checkbox" 
                    id={id} 
                    className="sr-only" 
                    checked={checked}
                    onChange={onChange}
                />
                <div className={`block w-10 h-6 rounded-full transition-colors ${checked ? 'bg-pink-600' : 'bg-gray-600'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'transform translate-x-4' : ''}`}></div>
            </div>
        </label>
    );
};

export default ToggleSwitch;
