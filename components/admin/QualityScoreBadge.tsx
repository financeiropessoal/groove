import React from 'react';

interface QualityScoreBadgeProps {
    score: number | undefined | null;
    size?: 'small' | 'large';
}

const QualityScoreBadge: React.FC<QualityScoreBadgeProps> = ({ score, size = 'small' }) => {
    if (score === undefined || score === null) {
        return (
            <div className="flex items-center justify-center">
                <i className="fas fa-spinner fa-spin text-gray-400" title="Calculando pontuação..."></i>
            </div>
        );
    }
    
    const getColorClasses = () => {
        if (score >= 80) return 'bg-green-500/20 text-green-400 border-green-500/30';
        if (score >= 50) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
        return 'bg-red-500/20 text-red-400 border-red-500/30';
    };

    const sizeClasses = size === 'large' 
        ? 'px-4 py-2 text-lg' 
        : 'px-2 py-1 text-xs';

    return (
        <div className={`inline-block font-bold rounded-full border ${sizeClasses} ${getColorClasses()}`}>
            {score}/100
        </div>
    );
};

export default QualityScoreBadge;
