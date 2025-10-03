import React from 'react';
import { useParams } from 'react-router-dom';

// This component was empty. Providing a basic structure.

const ArtistDetailPage: React.FC = () => {
  const { id } = useParams();

  return (
    <div>
      <h1 className="text-white">Página de Detalhes do Artista</h1>
      <p className="text-white">ID do Artista: {id}</p>
    </div>
  );
};

export default ArtistDetailPage;
