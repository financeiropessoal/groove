
import React from 'react';
import Modal from './Modal';

interface ProBenefitsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProBenefitsModal: React.FC<ProBenefitsModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <Modal onClose={onClose}>
            <div className="bg-gray-800 p-8 rounded-lg text-white max-w-2xl">
                <h2 className="text-2xl font-bold mb-6 text-center">Vantagens do Plano PRO</h2>
                <div className="space-y-4">
                    <BenefitDetail icon="fa-chart-line" title="Análise de Perfil">
                        Saiba quantas vezes seu perfil apareceu nas buscas, a taxa de cliques e compare seu desempenho com a média do seu gênero musical. Descubra os termos mais buscados e os contratantes mais ativos na plataforma.
                    </BenefitDetail>
                    <BenefitDetail icon="fa-wallet" title="Controle Financeiro">
                        Registre todos os seus cachês (mesmo os de fora da plataforma) e despesas (transporte, alimentação, equipamento). Tenha uma visão clara do seu balanço financeiro e planeje seus próximos passos.
                    </BenefitDetail>
                    <BenefitDetail icon="fa-tags" title="Clientes Especiais">
                        Crie uma relação mais próxima com seus parceiros. Defina preços especiais e personalizados para contratantes recorrentes, incentivando a fidelidade e garantindo mais shows.
                    </BenefitDetail>
                    <BenefitDetail icon="fa-magic" title="Gerador de Posts com IA">
                        Economize tempo e mantenha suas redes sociais ativas. Com base em poucas informações sobre seu show, nossa IA cria textos de divulgação prontos para Instagram, Facebook e mais.
                    </BenefitDetail>
                </div>
                <div className="text-center mt-8">
                    <button onClick={onClose} className="bg-pink-600 px-8 py-2 rounded-lg font-semibold">
                        Entendi!
                    </button>
                </div>
            </div>
        </Modal>
    );
};

const BenefitDetail: React.FC<{ icon: string; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-gray-700 rounded-full text-yellow-400">
            <i className={`fas ${icon}`}></i>
        </div>
        <div>
            <h3 className="font-semibold text-lg text-white">{title}</h3>
            <p className="text-sm text-gray-400">{children}</p>
        </div>
    </div>
);

export default ProBenefitsModal;
