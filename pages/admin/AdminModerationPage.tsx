// pages/admin/AdminModerationPage.tsx
import React, { useState, useEffect } from 'react';
import { ModerationService, FlaggedContent } from '../../services/ModerationService';
import { useToast } from '../../contexts/ToastContext';

const FlaggedItemCard: React.FC<{
    item: FlaggedContent;
    onResolve: (id: number, action: 'ignore' | 'remove' | 'block') => void;
}> = ({ item, onResolve }) => {
    
    const renderContent = () => {
        switch (item.type) {
            case 'profile_bio':
                return <p className="text-gray-300 italic bg-gray-900/50 p-3 rounded-md border-l-2 border-gray-600">"{item.content}"</p>;
            case 'profile_image':
                return <img src={item.content} alt="Conteúdo sinalizado" className="w-32 h-32 object-cover rounded-md" />;
            default:
                return <p className="text-gray-300">{item.content}</p>;
        }
    };

    return (
        <div className="bg-gray-800 p-4 rounded-lg flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-lg text-white">{item.user.name} <span className="text-sm font-normal text-gray-400">({item.user.type})</span></h3>
                    <span className="text-xs text-yellow-400 bg-yellow-500/20 px-2 py-1 rounded-full">{item.type.replace('_', ' ')}</span>
                </div>
                <p className="text-sm text-gray-400 mb-3">
                    <i className="fas fa-flag text-red-500 mr-2"></i>
                    Motivo: <span className="font-semibold">{item.reason}</span>
                </p>
                {renderContent()}
            </div>
            <div className="flex-shrink-0 flex md:flex-col justify-end md:justify-center gap-2">
                <button onClick={() => onResolve(item.id, 'ignore')} className="px-3 py-2 text-xs bg-gray-600 hover:bg-gray-500 rounded-md">Ignorar</button>
                <button onClick={() => onResolve(item.id, 'remove')} className="px-3 py-2 text-xs bg-yellow-600 hover:bg-yellow-500 rounded-md">Remover Conteúdo</button>
                <button onClick={() => onResolve(item.id, 'block')} className="px-3 py-2 text-xs bg-red-600 hover:bg-red-500 rounded-md">Bloquear Usuário</button>
            </div>
        </div>
    );
};


const AdminModerationPage: React.FC = () => {
    const [flaggedItems, setFlaggedItems] = useState<FlaggedContent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        fetchFlaggedContent();
    }, []);

    const fetchFlaggedContent = async () => {
        setIsLoading(true);
        const items = await ModerationService.getFlaggedContent();
        setFlaggedItems(items);
        setIsLoading(false);
    };

    const handleResolve = async (id: number, action: 'ignore' | 'remove' | 'block') => {
        // Optimistic update
        setFlaggedItems(prev => prev.filter(item => item.id !== id));

        const success = await ModerationService.resolveFlag(id, action);
        if (success) {
            let message = '';
            switch(action) {
                case 'ignore': message = 'Item ignorado.'; break;
                case 'remove': message = 'Conteúdo removido com sucesso.'; break;
                case 'block': message = 'Usuário bloqueado e notificado.'; break;
            }
            showToast(message, 'success');
        } else {
            showToast('Ocorreu um erro. Recarregando lista...', 'error');
            fetchFlaggedContent(); // Refetch to get consistent state
        }
    };

    if (isLoading) {
        return <div className="flex items-center justify-center h-full"><i className="fas fa-spinner fa-spin text-4xl text-pink-500"></i></div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Moderação de Conteúdo</h1>

            {flaggedItems.length > 0 ? (
                <div className="space-y-4">
                    {flaggedItems.map(item => (
                        <FlaggedItemCard key={item.id} item={item} onResolve={handleResolve} />
                    ))}
                </div>
            ) : (
                 <div className="text-center py-12 px-6 bg-gray-800/50 rounded-lg">
                    <div className="text-5xl text-green-500 mb-4">
                        <i className="fas fa-check-circle"></i>
                    </div>
                    <h3 className="text-xl font-bold text-white">Fila de Moderação Limpa</h3>
                    <p className="text-gray-400 mt-2 max-w-md mx-auto">Nenhum item sinalizado para revisão no momento. Bom trabalho!</p>
                </div>
            )}
        </div>
    );
};

export default AdminModerationPage;
