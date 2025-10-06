import React from 'react';

interface ListEditorProps {
    title: string;
    items: string[];
    onItemsChange: (newItems: string[]) => void;
    placeholder: string;
    description?: string;
}

const ListEditor: React.FC<ListEditorProps> = ({ title, items, onItemsChange, placeholder, description }) => {
    const handleItemChange = (index: number, value: string) => {
        const newItems = [...items];
        newItems[index] = value;
        onItemsChange(newItems);
    };

    const addItem = () => {
        onItemsChange([...items, '']);
    };

    const removeItem = (index: number) => {
        onItemsChange(items.filter((_, i) => i !== index));
    };

    return (
        <div>
            <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
            {description && <p className="text-sm text-gray-400 mb-4">{description}</p>}
            <div className="space-y-2">
                {items.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={item}
                            onChange={(e) => handleItemChange(index, e.target.value)}
                            className="flex-grow bg-gray-900 border border-gray-700 rounded-md py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                            placeholder={placeholder}
                        />
                        <button type="button" onClick={() => removeItem(index)} className="text-gray-500 hover:text-red-500 p-2"><i className="fas fa-minus-circle"></i></button>
                    </div>
                ))}
            </div>
            <button type="button" onClick={addItem} className="mt-3 text-sm text-pink-400 hover:text-pink-300 transition-colors"><i className="fas fa-plus mr-2"></i>Adicionar item</button>
        </div>
    );
};

export default ListEditor;
