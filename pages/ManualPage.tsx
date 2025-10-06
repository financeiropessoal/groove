import React from 'react';

const ManualPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Manual da Plataforma</h1>
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-pink-400 mb-4">Para Artistas</h2>
          <p className="text-gray-300">
            Bem-vindo ao Groove Music! Para começar, complete seu perfil com o máximo de detalhes. Um bom perfil inclui fotos de alta qualidade, um vídeo de performance no YouTube e pacotes de show bem descritos. Isso aumenta suas chances de ser contratado.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-pink-400 mb-4">Para Contratantes</h2>
          <p className="text-gray-300">
            Encontre o artista perfeito para seu evento navegando em nossa lista. Use os filtros para refinar sua busca por gênero e disponibilidade. Você pode enviar uma proposta direta ou publicar uma vaga aberta para que os artistas se candidatem.
          </p>
        </section>
      </div>
    </div>
  );
};

export default ManualPage;
