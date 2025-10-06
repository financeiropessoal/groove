import React from 'react';
import { Link } from 'react-router-dom';

const FeatureStep: React.FC<{ icon: string; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="flex items-start gap-6">
        <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 bg-gray-800 rounded-full border-2 border-pink-500/50">
            <i className={`fas ${icon} text-pink-400 text-3xl`}></i>
        </div>
        <div>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-gray-400 leading-relaxed">{children}</p>
        </div>
    </div>
);


const HowItWorksPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-16">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent mb-4">Como o Groove Music Funciona</h1>
        <p className="text-lg text-gray-400">Conectando talentos a oportunidades em 3 passos simples.</p>
      </div>

      {/* For Artists */}
      <section className="bg-gray-800/50 p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-pink-400 mb-8 border-b-2 border-pink-500/30 pb-4 flex items-center gap-4">
            <i className="fas fa-microphone-alt"></i>
            Para Artistas
        </h2>
        <div className="space-y-10">
          <FeatureStep icon="fa-user-plus" title="1. Crie seu Perfil Gratuito">
            Mostre seu talento para o mundo. Adicione fotos, vídeos, seu repertório e crie pacotes de show detalhados. Um perfil completo é seu melhor cartão de visitas e a primeira etapa para ser descoberto.
          </FeatureStep>
          <FeatureStep icon="fa-search-dollar" title="2. Encontre & Receba Propostas">
            Explore a página de "Oportunidades" para encontrar vagas abertas publicadas por contratantes. Além disso, contratantes podem te encontrar e enviar propostas diretas com data e cachê definidos.
          </FeatureStep>
          <FeatureStep icon="fa-calendar-check" title="3. Feche Shows e Gerencie sua Carreira">
            Aceite propostas, gerencie sua agenda, e utilize nosso "Gig Hub" para organizar todos os detalhes do evento com o contratante. Construa sua reputação e transforme sua paixão em carreira.
          </FeatureStep>
        </div>
         <div className="text-center mt-12">
            <Link 
                to="/signup" 
                className="px-8 py-3 bg-gradient-to-r from-pink-500 to-orange-500 text-white font-bold rounded-lg text-lg transition-transform transform hover:scale-105 btn-glow"
            >
                Crie seu Perfil de Artista
            </Link>
        </div>
      </section>

      {/* For Venues */}
      <section className="bg-gray-800/50 p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-pink-400 mb-8 border-b-2 border-pink-500/30 pb-4 flex items-center gap-4">
            <i className="fas fa-store"></i>
            Para Contratantes
        </h2>
        <div className="space-y-10">
          <FeatureStep icon="fa-search" title="1. Encontre o Talento Perfeito">
            Navegue por perfis detalhados de artistas de diversos gêneros. Use nossos filtros avançados para encontrar o som ideal para o seu público e evento, seja um show intimista ou uma grande festa.
          </FeatureStep>
          <FeatureStep icon="fa-file-signature" title="2. Contrate de Duas Formas">
            <strong>Proposta Direta:</strong> Encontrou o artista ideal? Verifique a agenda e envie uma proposta com todos os detalhes. <br/>
            <strong>Publique uma Vaga:</strong> Tem uma data livre? Publique uma "Vaga Aberta" com o cachê e deixe que os artistas interessados se candidatem.
          </FeatureStep>
          <FeatureStep icon="fa-handshake" title="3. Gerencie Tudo em um Só Lugar">
            Comunicação centralizada, checklists de evento, e todo o histórico de contratações no seu painel. Simplificamos a produção para que você possa focar em criar experiências incríveis para seus clientes.
          </FeatureStep>
        </div>
         <div className="text-center mt-12">
            <Link to="/venue-signup" className="px-8 py-3 bg-gray-700 text-white font-bold rounded-lg text-lg hover:bg-gray-600 transition-transform transform hover:scale-105">
                Cadastre seu Local
            </Link>
        </div>
      </section>
    </div>
  );
};

export default HowItWorksPage;