import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Artist } from '../data';
import { ArtistService } from '../services/ArtistService';
import ArtistCard from '../components/ArtistCard';

const FeatureCard: React.FC<{ icon: string; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-gray-800/50 p-6 rounded-lg text-center transform transition-transform duration-300 hover:scale-105 hover:bg-gray-800">
        <div className="inline-block p-4 bg-red-600/20 rounded-full mb-4">
            <i className={`fas ${icon} text-red-400 text-3xl`}></i>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm">{children}</p>
    </div>
);

const HomePage: React.FC = () => {
    const [featuredArtists, setFeaturedArtists] = useState<Artist[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const [quickSignupName, setQuickSignupName] = useState('');
    const [quickSignupEmail, setQuickSignupEmail] = useState('');

    const handleQuickSignup = (e: React.FormEvent) => {
        e.preventDefault();
        if (quickSignupName.trim() && quickSignupEmail.trim()) {
            navigate('/signup', { 
                state: { 
                    name: quickSignupName, 
                    email: quickSignupEmail 
                } 
            });
        }
    };

    useEffect(() => {
        const fetchArtists = async () => {
            setIsLoading(true);
            const artists = await ArtistService.getFeaturedArtists(6);
            setFeaturedArtists(artists);
            setIsLoading(false);
        };
        fetchArtists();
    }, []);

    const handleSelectArtist = (artist: Artist) => {
        navigate(`/artists/${artist.id}`);
    };

    return (
        <div className="space-y-20">
            {/* Hero Section */}
            <section className="text-center py-20 bg-gray-900 rounded-lg" style={{backgroundImage: 'linear-gradient(rgba(17, 24, 39, 0.8), rgba(17, 24, 39, 1)), url(https://images.pexels.com/photos/3391932/pexels-photo-3391932.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
                <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight">
                    Onde o artista encontra o palco!
                </h1>
                <p className="text-lg md:text-xl text-gray-300 mt-4 max-w-3xl mx-auto">
                    Conectamos artistas talentosos a bares, restaurantes e eventos. Encontre a trilha sonora perfeita ou o próximo palco para o seu show.
                </p>
                <div className="mt-8 flex justify-center gap-4 flex-wrap">
                    <Link to="/signup" className="px-8 py-4 bg-red-600 text-white font-bold rounded-lg text-lg hover:bg-red-700 transition-transform transform hover:scale-105">
                        Sou Artista
                    </Link>
                    <Link to="/venue-signup" className="px-8 py-4 bg-gray-700 text-white font-bold rounded-lg text-lg hover:bg-gray-600 transition-transform transform hover:scale-105">
                        Sou Contratante
                    </Link>
                </div>
            </section>

            {/* How It Works Section */}
            <section>
                <h2 className="text-3xl font-bold text-center text-white mb-10">Como Funciona</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div>
                        <h3 className="text-2xl font-semibold text-red-400 mb-6 text-center"><i className="fas fa-microphone-alt mr-3"></i>Para Artistas</h3>
                        <div className="space-y-6">
                            <FeatureCard icon="fa-id-card" title="1. Crie seu Perfil">
                                Monte um portfólio completo com fotos, vídeos, repertório e pacotes de show.
                            </FeatureCard>
                             <FeatureCard icon="fa-search-dollar" title="2. Encontre Oportunidades">
                                Candidate-se a vagas abertas ou receba propostas diretas de contratantes.
                            </FeatureCard>
                             <FeatureCard icon="fa-calendar-check" title="3. Feche Shows">
                                Gerencie sua agenda, negocie propostas e seja contratado para tocar nos melhores locais.
                            </FeatureCard>
                        </div>
                    </div>
                     <div>
                        <h3 className="text-2xl font-semibold text-red-400 mb-6 text-center"><i className="fas fa-store mr-3"></i>Para Contratantes</h3>
                        <div className="space-y-6">
                           <FeatureCard icon="fa-search" title="1. Busque Talentos">
                                Explore perfis detalhados de artistas e use filtros para encontrar o som ideal para seu evento.
                            </FeatureCard>
                             <FeatureCard icon="fa-file-signature" title="2. Envie Propostas">
                                Verifique a disponibilidade e envie propostas diretas ou publique vagas para a comunidade.
                            </FeatureCard>
                            <FeatureCard icon="fa-handshake" title="3. Contrate com Segurança">
                                Finalize a contratação e o pagamento diretamente pela plataforma de forma segura.
                            </FeatureCard>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Artists Section */}
            { !isLoading && featuredArtists.length > 0 && (
                <section>
                    <div className="flex justify-between items-center mb-6">
                         <h2 className="text-3xl font-bold text-white">Artistas em Destaque</h2>
                         <Link to="/artists" className="text-red-400 font-semibold hover:text-red-300 transition-colors">
                            Ver Todos <i className="fas fa-arrow-right ml-1"></i>
                         </Link>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
                        {featuredArtists.map(artist => (
                             <ArtistCard key={artist.id} artist={artist} onSelect={handleSelectArtist} />
                        ))}
                    </div>
                </section>
            )}

            {/* Quick Signup Section */}
            <section className="py-16 bg-gray-800 rounded-lg">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white">Comece em 30 Segundos</h2>
                    <p className="text-gray-300 mt-3">Dê o primeiro passo para encontrar mais shows. É grátis.</p>
                    
                    <form onSubmit={handleQuickSignup} className="mt-8 flex flex-col md:flex-row items-center gap-4 max-w-xl mx-auto">
                        <input 
                            type="text" 
                            name="name"
                            value={quickSignupName}
                            onChange={(e) => setQuickSignupName(e.target.value)}
                            placeholder="Nome do artista ou banda" 
                            required
                            className="w-full md:w-auto flex-grow bg-gray-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        <input 
                            type="email" 
                            name="email"
                            value={quickSignupEmail}
                            onChange={(e) => setQuickSignupEmail(e.target.value)}
                            placeholder="Seu melhor e-mail" 
                            required
                            className="w-full md:w-auto flex-grow bg-gray-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        <button type="submit" className="w-full md:w-auto flex-shrink-0 px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-transform transform hover:scale-105">
                            Criar Perfil Grátis
                        </button>
                    </form>
                     <p className="text-sm text-gray-500 mt-4">É um contratante? <Link to="/venue-signup" className="text-red-400 hover:underline">Cadastre seu local aqui</Link>.</p>
                </div>
            </section>
        </div>
    );
};

export default HomePage;