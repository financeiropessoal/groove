import React, { useState, useEffect } from 'react';
import { useVenueAuth } from '../contexts/VenueAuthContext';
import { FavoriteService } from '../services/FavoriteService';
import { Artist } from '../data';
import ArtistCard from '../components/ArtistCard';
import EmptyState from '../components/EmptyState';
import { Link, useNavigate } from 'react-router-dom';

const FavoriteArtistsPage: React.FC = () => {
    const [favoriteArtists, setFavoriteArtists] = useState<Artist[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { authUser } = useVenueAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (authUser) {
            setIsLoading(true);
            FavoriteService.getEnrichedFavoritesForVenue(authUser.id)
                .then(artists => {
                    setFavoriteArtists(artists);
                    setIsLoading(false);
                });
        }
    }, [authUser]);
    
    const handleSelectArtist = (artist: Artist) => {
        navigate(`/artists/${artist.id}`);
    };

    if (isLoading) {
        return <div className="text-center py-12"><i className="fas fa-spinner fa-spin text-4xl text-pink-500"></i></div>;
    }

    return (
        <div>
            <div className="flex items-center gap-4 mb-8">
                <Link to="/venue-dashboard" className="text-gray-400 hover:text-white transition-colors" aria-label="Voltar ao painel">
                    <i className="fas fa-arrow-left text-2xl"></i>
                </Link>
                <h1 className="text-4xl font-bold">Meus Artistas Favoritos</h1>
            </div>
            
            {favoriteArtists.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-8">
                    {favoriteArtists.map(artist => (
                        <ArtistCard key={artist.id} artist={artist} onSelect={handleSelectArtist} />
                    ))}
                </div>
            ) : (
                <EmptyState
                    icon="fa-heart-broken"
                    title="Você ainda não tem favoritos"
                    message="Explore a lista de artistas e clique no ícone de estrela para salvar seus preferidos aqui."
                >
                    <Link to="/artists" className="px-6 py-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white font-bold rounded-lg">
                        Encontrar Artistas
                    </Link>
                </EmptyState>
            )}
        </div>
    );
};

export default FavoriteArtistsPage;