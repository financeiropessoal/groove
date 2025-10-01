import React, { useState } from 'react';

type Tab = 'artist' | 'hirer';

const FeatureCard: React.FC<{ icon: string; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="flex items-center gap-4 mb-3">
            <i className={`fas ${icon} text-red-500 text-2xl w-8 text-center`}></i>
            <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>
        <p className="text-gray-300 leading-relaxed">{children}</p>
    </div>
);

const HowItWorksPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('artist');

    const TabButton: React.FC<{ tab: Tab; label: string; icon: string }> = ({ tab, label, icon }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-4 px-2 text-center text-lg font-semibold transition-all duration-300 border-b-4 flex items-center justify-center gap-3 ${activeTab === tab ? 'border-red-500 text-white' : 'border-transparent text-gray-400 hover:border-red-500/50 hover:text-white'}`}
        >
            <i className={`fas ${icon}`}></i>
            {label}
        </button>
    );

    return (
        <div>
            <div className="text-center mb-10">
                <h1 className="text-5xl font-extrabold text-white">Sua Carreira Musical Começa Aqui.</h1>
                <p className="text-xl text-gray-300 mt-3 max-w-3xl mx-auto">Conectamos artistas talentosos a locais que valorizam a música ao vivo. Veja como funciona.</p>
            </div>

            <div className="bg-gray-800/50 rounded-lg shadow-xl sticky top-0 z-10">
                <div className="flex">
                    <TabButton tab="artist" label="Para o Artista" icon="fa-microphone-alt" />
                    <TabButton tab="hirer" label="Para o Contratante" icon="fa-store" />
                </div>
            </div>

            <div className="mt-8">
                {activeTab === 'artist' && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-red-400">Uma plataforma completa para sua carreira.</h2>
                            <p className="text-gray-400 mt-2">Profissionalize sua apresentação, encontre shows e gerencie suas finanças.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <FeatureCard icon="fa-id-card" title="Seu Cartão de Visitas Digital">
                                Crie um perfil completo com bio, fotos, vídeos, repertório e pacotes de show. Nossa calculadora de preços ajuda a definir o valor ideal, já incluindo a comissão da plataforma.
                            </FeatureCard>
                            <FeatureCard icon="fa-search-dollar" title="Encontre Trabalho Facilmente">
                                Explore vagas abertas na página "Oportunidades de Shows" ou deixe que nossa IA encontre as melhores vagas para você com o "Radar de Oportunidades".
                            </FeatureCard>
                             <FeatureCard icon="fa-comments-dollar" title="Receba Propostas Diretas">
                                Contratantes podem encontrar seu perfil e te enviar propostas diretas para datas específicas, valorizando seu trabalho e seu tempo.
                            </FeatureCard>
                             <FeatureCard icon="fa-chart-pie" title="Controle Financeiro Total">
                                Gerencie o cachê de cada show, pague sua equipe, e adicione suas despesas e receitas pessoais para ter uma visão 360° da sua saúde financeira como músico.
                            </FeatureCard>
                             <FeatureCard icon="fa-magic" title="Divulgação com IA">
                                Use nosso Gerador de Posts para criar textos de divulgação para seus shows em segundos. Escolha o show, o tom, e a IA faz o resto para você postar nas redes sociais.
                            </FeatureCard>
                             <FeatureCard icon="fa-calendar-check" title="Agenda Inteligente">
                                Mantenha sua agenda atualizada para que os contratantes saibam exatamente quando você está disponível, evitando propostas para datas já ocupadas.
                            </FeatureCard>
                        </div>
                    </div>
                )}

                {activeTab === 'hirer' && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-red-400">O talento certo para seu evento, sem complicações.</h2>
                            <p className="text-gray-400 mt-2">Encontre, avalie e contrate artistas com segurança e praticidade.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                           <FeatureCard icon="fa-search" title="Encontre o Artista Perfeito">
                                Navegue por dezenas de perfis e use filtros avançados por gênero musical, data de disponibilidade e mais para achar a atração ideal para seu público.
                            </FeatureCard>
                             <FeatureCard icon="fa-file-signature" title="Proposta Direta">
                                Gostou de um artista? Veja o perfil completo com vídeos e pacotes, verifique a agenda e envie uma proposta de contratação para a data desejada com poucos cliques.
                            </FeatureCard>
                             <FeatureCard icon="fa-bullhorn" title="Publique uma Vaga">
                                Tem uma data livre e um orçamento definido? Use a função "Oferecer uma Data" para criar uma vaga aberta. Os artistas compatíveis serão notificados e poderão se candidatar.
                            </FeatureCard>
                            <FeatureCard icon="fa-tasks" title="Gerencie seus Eventos">
                                Em seu painel, você tem a visão completa de seus shows agendados, histórico de contratações e pode editar o perfil do seu estabelecimento a qualquer momento.
                            </FeatureCard>
                            <FeatureCard icon="fa-chart-line" title="Análise de Performance">
                                Acesse dados sobre seus gastos com música ao vivo, custo médio por show e veja quais os estilos musicais que mais trazem retorno, otimizando seu investimento.
                            </FeatureCard>
                            <FeatureCard icon="fa-star" title="Avalie os Artistas">
                                Após cada show, deixe um depoimento sobre a performance. Sua avaliação ajuda outros contratantes e fortalece a qualidade da nossa comunidade musical.
                            </FeatureCard>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HowItWorksPage;