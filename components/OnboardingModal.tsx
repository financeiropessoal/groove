import React from 'react';
import { Link } from 'react-router-dom';

interface OnboardingModalProps {
  userType: 'artist' | 'venue';
  onClose: () => void;
}

interface OnboardingStep {
    icon: string;
    title: string;
    description: string;
    link: string;
    linkLabel: string;
}

const artistSteps: OnboardingStep[] = [
    {
        icon: 'fa-user-edit',
        title: '1. Complete seu Perfil',
        description: 'Adicione sua bio, foto de capa e vídeo. Um perfil completo atrai 70% mais contratantes.',
        link: '/edit-profile',
        linkLabel: 'Editar Perfil'
    },
    {
        icon: 'fa-box-open',
        title: '2. Crie seus Pacotes',
        description: 'Defina os formatos de show que você oferece. Nossa calculadora ajuda a definir o preço justo.',
        link: '/edit-plans',
        linkLabel: 'Criar Pacotes'
    },
    {
        icon: 'fa-music',
        title: '3. Adicione seu Repertório',
        description: 'Mostre seu talento! Liste as músicas que você toca para que conheçam seu estilo.',
        link: '/edit-repertoire',
        linkLabel: 'Adicionar Músicas'
    }
];

const venueSteps: OnboardingStep[] = [
    {
        icon: 'fa-store-alt',
        title: '1. Complete seu Perfil',
        description: 'Descreva seu local, adicione fotos e os estilos musicais que você busca para atrair os artistas certos.',
        link: '/edit-venue-profile',
        linkLabel: 'Editar Perfil do Local'
    },
    {
        icon: 'fa-search',
        title: '2. Encontre Talentos',
        description: 'Navegue por nossa lista de artistas. Use os filtros para achar a atração perfeita para seu público.',
        link: '/artists',
        linkLabel: 'Buscar Artistas'
    },
    {
        icon: 'fa-bullhorn',
        title: '3. Publique uma Vaga',
        description: 'Tem uma data livre? Crie uma "Vaga Aberta" para que os artistas da plataforma possam se candidatar.',
        link: '/offer-gig',
        linkLabel: 'Publicar Vaga'
    }
];


const OnboardingModal: React.FC<OnboardingModalProps> = ({ userType, onClose }) => {

    const steps = userType === 'artist' ? artistSteps : venueSteps;

    return (
        <div 
            className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-gray-800 w-full max-w-2xl rounded-lg shadow-2xl text-white transform transition-all"
            >
                <div className="p-8 text-center">
                    <i className="fas fa-rocket text-5xl text-red-500 mb-4"></i>
                    <h2 className="text-3xl font-bold text-white">Bem-vindo(a) ao Groove Music!</h2>
                    <p className="text-gray-300 mt-2">Vamos preparar seu perfil para o sucesso. Siga estes passos recomendados:</p>
                </div>

                <div className="px-8 pb-8 space-y-4">
                    {steps.map((step, index) => (
                        <div key={index} className="bg-gray-900/50 p-4 rounded-lg flex items-center gap-4">
                            <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-gray-700 rounded-full text-red-400 text-xl">
                                <i className={`fas ${step.icon}`}></i>
                            </div>
                            <div className="flex-grow">
                                <h3 className="font-semibold text-white">{step.title}</h3>
                                <p className="text-sm text-gray-400">{step.description}</p>
                            </div>
                             <Link to={step.link} onClick={onClose} className="flex-shrink-0 px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors">
                                {step.linkLabel}
                            </Link>
                        </div>
                    ))}
                </div>

                <div className="bg-gray-700/50 px-6 py-4 flex justify-center rounded-b-lg">
                    <button 
                        onClick={onClose} 
                        className="px-8 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                    >
                        Começar a Explorar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OnboardingModal;