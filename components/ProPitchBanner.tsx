import React from 'react';

interface ProPitchBannerProps {
  onSeeBenefits: () => void;
}

const ProPitchBanner: React.FC<ProPitchBannerProps> = ({ onSeeBenefits }) => {
  return (
    <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 p-6 rounded-lg mb-8 text-white overflow-hidden shadow-2xl animate-fade-in">
      <div className="absolute -right-8 -top-8 text-white/10 text-9xl transform rotate-12">
        <i className="fas fa-rocket"></i>
      </div>
      <div className="relative z-10">
        <h2 className="text-2xl font-bold mb-2">Desbloqueie seu Potencial com o Groove Music PRO!</h2>
        <p className="text-purple-100 mb-4 max-w-2xl">
          Acesse ferramentas exclusivas como Análise de Perfil, Gerador de Posts com IA, Controle Financeiro e muito mais para impulsionar sua carreira.
        </p>
        <button
          onClick={onSeeBenefits}
          className="bg-white text-gray-900 font-bold py-2 px-6 rounded-full transition-transform transform hover:scale-105"
        >
          Ver Vantagens do PRO
        </button>
      </div>
    </div>
  );
};

export default ProPitchBanner;
