import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Artist } from '../data';
import { ArtistService } from '../services/ArtistService';
import ArtistCard from '../components/ArtistCard';

const ValuePropCard: React.FC<{ icon: string; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-gray-800/50 p-6 rounded-lg text-center transform transition-transform duration-300 hover:scale-105 hover:bg-gray-800 border border-transparent hover:border-pink-500/50">
        <div className="inline-block p-4 bg-gradient-to-r from-pink-500/20 to-orange-500/20 rounded-full mb-4">
            <i className={`fas ${icon} text-pink-400 text-3xl`}></i>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm">{children}</p>
    </div>
);

const GenreCard: React.FC<{ genre: string; imageUrl: string }> = ({ genre, imageUrl }) => (
    <Link to={`/artists?genre=${encodeURIComponent(genre)}`} className="relative aspect-video rounded-lg overflow-hidden group block shadow-lg">
        <img src={imageUrl} alt={genre} className="absolute w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors"></div>
        <div className="absolute inset-0 flex items-center justify-center p-2">
            <h3 className="text-2xl font-bold text-white drop-shadow-md text-center">{genre}</h3>
        </div>
    </Link>
);


const HomePage: React.FC = () => {
    const [featuredArtists, setFeaturedArtists] = useState<Artist[]>([]);
    const [genres, setGenres] = useState<{ genre: string, imageUrl: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
             const [artists, genreData] = await Promise.all([
                ArtistService.getFeaturedArtists(6),
                ArtistService.getGenresWithImages()
            ]);
            setFeaturedArtists(artists);
            setGenres(genreData);
            setIsLoading(false);
        };
        fetchData();
    }, []);

    const handleSelectArtist = (artist: Artist) => {
        navigate(`/artists/${artist.id}`);
    };
    
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/artists?q=${encodeURIComponent(searchTerm.trim())}`);
        } else {
            navigate('/artists');
        }
    };

    return (
        <div className="space-y-24">
            {/* Hero Section */}
            <section className="text-center py-24 -mt-8 -mx-4 bg-gray-900" style={{backgroundImage: 'linear-gradient(to top, rgba(17, 24, 39, 1) 20%, rgba(17, 24, 39, 0.7)), url(https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
                <div className="max-w-4xl mx-auto px-4">
                    <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight tracking-tight mb-6">
                        <span className="bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">Onde o artista</span><br/> encontra o palco.
                    </h1>
                    <p className="text-lg md:text-xl text-gray-300 mt-4 max-w-2xl mx-auto">
                        A plataforma definitiva para conectar músicos a bares, restaurantes e eventos. Descubra talentos ou encontre seu próximo show.
                    </p>
                    
                    <div className="mt-10 max-w-xl mx-auto">
                        <form onSubmit={handleSearchSubmit} className="relative">
                            <input
                                type="text"
                                placeholder="Encontre o som perfeito..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-gray-800/50 border-2 border-gray-700 rounded-full py-4 px-6 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                            />
                            <button type="submit" className="absolute inset-y-0 right-0 flex items-center pr-4" aria-label="Buscar">
                                <i className="fas fa-search text-gray-400 text-xl hover:text-pink-400"></i>
                            </button>
                        </form>
                    </div>

                    <div className="mt-8 flex justify-center gap-4 flex-wrap">
                        <Link to="/signup" className="px-8 py-3 bg-gradient-to-r from-pink-500 to-orange-500 text-white font-bold rounded-full text-lg hover:shadow-[0_0_20px_rgba(236,72,153,0.7)] transition-shadow duration-300">
                            Sou Artista
                        </Link>
                        <Link to="/venue-signup" className="px-8 py-3 bg-gray-700 text-white font-bold rounded-full text-lg hover:bg-gray-600 transition-colors">
                            Sou Contratante
                        </Link>
                    </div>
                </div>
            </section>
            
            {/* Value Proposition Section */}
            <section>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <ValuePropCard icon="fa-search-location" title="Conexão Direta">
                        Nossa plataforma elimina intermediários, conectando você diretamente a oportunidades e talentos na sua cidade.
                    </ValuePropCard>
                    <ValuePropCard icon="fa-tools" title="Ferramentas Completas">
                        Gerencie seu perfil, agenda, pacotes, e finanças. Tudo que você precisa para profissionalizar sua carreira ou suas contratações.
                    </ValuePropCard>
                    <ValuePropCard icon="fa-users" title="Comunidade Vibrante">
                        Faça parte de um ecossistema de músicos, produtores e donos de estabelecimentos apaixonados por música ao vivo.
                    </ValuePropCard>
                </div>
            </section>

            {/* Featured Artists Section */}
            { !isLoading && featuredArtists.length > 0 && (
                <section>
                    <div className="flex justify-between items-center mb-8">
                         <h2 className="text-4xl font-bold text-white">Artistas em <span className="text-pink-400">Destaque</span></h2>
                         <Link to="/artists" className="font-semibold text-orange-400 hover:text-orange-300 transition-colors group">
                            Ver Todos <i className="fas fa-arrow-right ml-1 transform group-hover:translate-x-1 transition-transform"></i>
                         </Link>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                        {featuredArtists.map(artist => (
                             <ArtistCard key={artist.id} artist={artist} onSelect={handleSelectArtist} />
                        ))}
                    </div>
                </section>
            )}

            {/* Explore by Genre Section */}
            { !isLoading && genres.length > 0 && (
                <section>
                    <h2 className="text-4xl font-bold text-white mb-8">Explore por <span className="text-pink-400">Gênero</span></h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                        {genres.map(item => (
                            <GenreCard key={item.genre} genre={item.genre} imageUrl={item.imageUrl} />
                        ))}
                    </div>
                </section>
            )}

            {/* Final CTA Section */}
            <section className="py-20 bg-gradient-to-r from-pink-500 to-orange-500 rounded-lg">
                <div className="max-w-3xl mx-auto text-center px-4">
                    <h2 className="text-4xl md:text-5xl font-bold text-white">Sua Carreira Decola Aqui.</h2>
                    <p className="text-white/80 mt-4 text-lg">Crie seu perfil gratuito e comece a transformar sua paixão em profissão hoje mesmo.</p>
                    <div className="mt-10 flex justify-center gap-4">
                        <Link to="/signup" className="px-10 py-4 bg-white text-gray-900 font-bold rounded-full text-lg hover:bg-gray-200 transition-transform transform hover:scale-105">
                            Criar Perfil de Artista
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
